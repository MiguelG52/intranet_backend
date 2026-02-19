import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAuthDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { Role } from 'src/role/entities/role.entity';
import { Country } from 'src/organization/country/entities/country.entity';
import { UserAccountDetail } from './entities/userAccountDetail.entity';
import * as crypto from 'crypto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { PositionService } from 'src/organization/positions/positions.service';
import { UserPosition } from './entities/user-position.entity';
import { UserProfileResponse } from 'src/authentication/responses/user-profile.response';
import { UserDetailResponse } from './responses/user-detail-response';
import { UsersQueryParamsDto } from './dto/find-all-user.dto';
import { UpdateUserAdminDto } from './dto/create-user-detail.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    @InjectRepository(UserPosition)
    private readonly userPositionRepository:Repository<UserPosition>,
    private readonly dataSource: DataSource,
    private readonly positionService: PositionService
  ) {}

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateTemporaryPassword(length = 12): string {
    // Crea una contraseña temporal que incluya al menos una mayúscula, una minúscula, un dígito y un símbolo.
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%^&*';

    const categories = [uppercase, lowercase, digits, symbols];
    const passwordCharacters = categories.map((category) =>
      category[crypto.randomInt(0, category.length)],
    );

    const allCharacters = categories.join('');
    for (let i = passwordCharacters.length; i < length; i++) {
      passwordCharacters.push(
        allCharacters[crypto.randomInt(0, allCharacters.length)],
      );
    }

    for (let i = passwordCharacters.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      [passwordCharacters[i], passwordCharacters[j]] = [
        passwordCharacters[j],
        passwordCharacters[i],
      ];
    }

    return passwordCharacters.join('');
  }

  /**
   * Crea una nueva cuenta de usuario y su detalle asociado.
   * Asigna un token de verificación pero NO envía el correo.
   * Retorna la entidad User completa.
   */
  async create(createUserDto: CreateUserDto): Promise<{ user: User; plainPassword: string }> {
    const {
      email,
      name,
      lastname,
      roleId,
      countryCode,
      detail,
      positionId
    } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException(`El email '${email}' ya está registrado.`);
    }

    if(positionId){
      try {
        await this.positionService.findOne(positionId);
      } catch (error) {
        throw new BadRequestException(`El puesto con ID '${positionId}' no existe.`);
      }
    }

    const saltRounds = 10;
  const plainPassword = this.generateTemporaryPassword();
  const hashedPassword = await hash(plainPassword, saltRounds);
    const verificationToken = this.generateVerificationToken();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedUser: User;

    try {
      const user = this.userRepository.create({
        name,
        lastname,
        email,
        passwordHash: hashedPassword,
        role: { roleId } as unknown as Role,
        country: { code: countryCode } as unknown as Country,
        token2fa: verificationToken, 
        isVerified: false,
      });

      if (detail) {
        const userDetail = queryRunner.manager.create(UserAccountDetail, detail);
        user.userDetail = userDetail;
      }
      
      savedUser = await queryRunner.manager.save(user);
      
      //Asignamos al usuario creado a un puesto 
      if(positionId){
        const newUserPosition = this.userPositionRepository.create({
          userId: savedUser.userId,
          positionId: positionId,
        });
        await queryRunner.manager.save(newUserPosition);
      }
      
      await queryRunner.commitTransaction();
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException('Error al crear la cuenta de usuario. Intenalo de nuevo mas tarde.');
      
    } finally {
      await queryRunner.release();
    }

    return {
      user: savedUser,
      plainPassword,
    };
  }

  async findAll(params: UsersQueryParamsDto) {
    const { page, limit, positionId, search, orderBy = 'name', order = 'ASC' } = params;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Relaciones
    queryBuilder.leftJoinAndSelect('user.role', 'role');
    queryBuilder.leftJoinAndSelect('user.country', 'country');
    queryBuilder.leftJoinAndSelect('user.userDetail', 'userDetail');
    queryBuilder.leftJoinAndSelect('user.userPositions', 'userPositions');
    queryBuilder.leftJoinAndSelect('userPositions.position', 'position');
    queryBuilder.leftJoinAndSelect('position.area', 'area');

    // Filtrar por posicion
    if (positionId) {
      queryBuilder.andWhere('userPositions.positionId = :positionId', { positionId });
    }

    // Busqueda por nombre, apellido o ID
    const searchStr = search ?? '';
    if (searchStr) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.lastname ILIKE :search OR CAST(user.userId AS TEXT) ILIKE :search)',
        { search: `%${searchStr}%` }
      );
    }

    // Orden
    const validSortColumns = ['name', 'lastname', 'email', 'createAt'];
    const sortColumn = validSortColumns.includes(orderBy) ? `user.${orderBy}` : 'user.name';
    
    queryBuilder.orderBy(sortColumn, order);

    // Paginacion
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const cleanData: UserProfileResponse[] = data.map((user) => {
      const primaryPosition = user.userPositions?.[0]?.position;
      
      return {
        userId: user.userId,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        role: user.role as Role,
        country: user.country as Country,
        isActive: user.isActive,
        userDetail: user.userDetail as UserDetailResponse,
        position: primaryPosition ? {
          id: primaryPosition.positionId,
          title: primaryPosition.title,
          area: primaryPosition.area ? {
            id: primaryPosition.area.areaId,
            name: primaryPosition.area.areaName
          } : null
        } : null
      };
    });

    return {
      data: cleanData,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  findOneByEmail(email:string):Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: {
        userDetail: true,
        role: true,
        country: true,
      },
    });
  }

  /**
   * Retorna TODA la informacion del usuario (incluyendo password, token 2fa).
   */
  findOneById(userId:string):Promise<User | null> {
    return this.userRepository.findOne({where:{userId}}) 
  }

  /**
   * Retorna la inforacion del usuario junto con su detalle, rol, pais. 
   * sin informacion sensible (password, token 2fa).
   */
  async findUserById(userId:string):Promise<User | null> {
    const user = await this.userRepository.findOne({
      where:{userId}, 
      relations: {
        userDetail: true,
        role: true,
        country: true,
        userPositions: {
            position: {
                area: true
            }
        }
      }
    });
    if(!user) {
      throw new NotFoundException(`Usuario con ID no encontrado.`);
    }
    return user;
  }
  
  /**
   * Esta función es para que la usen otros SERVICIOS (como AuthService).
   */
  async updateAuthFields(
    userId: string,
    updateDto: UpdateUserAuthDto,
  ): Promise<void> {
    const result = await this.userRepository.update(userId, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${userId}' no encontrado.`);
    }
  }

  /**
   * Esta función es para que la use el CONTROLADOR.
   */
  async updateProfile(
    userId: string,
    updateDto: UpdateUserProfileDto,
  ) {
    const user = await this.userRepository.findOneByOrFail({ userId });
    await this.userRepository.update(userId, updateDto);
    return {
      user, message: 'Perfil actualizado correctamente'
    };
  }
  

  async remove(id: string) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID '${id}' no encontrado.`);
    }
    return { message: 'Usuario eliminado correctamente' };
  }


  async updateUserAdmin(userId: string, updateDto: UpdateUserAdminDto) {
    const { 
      roleId, 
      countryCode, 
      positionId, 
      detail, 
      ...basicData 
    } = updateDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const user = await queryRunner.manager.findOne(User, { 
        where: { userId },
        relations: { userDetail: true }
      });

      if (!user) throw new NotFoundException(`Usuario no encontrado.`);

      // Actualizamos datos básicos
      Object.assign(user, basicData);

      // Actualizamos Relaciones Directas (Rol y País)
      if (roleId) user.role = { roleId } as unknown as Role;
      if (countryCode) user.country = { code: countryCode } as unknown as Country;

      // Actualizamos el Detalle
      if (detail) {
        if (!user.userDetail) {
          user.userDetail = queryRunner.manager.create(UserAccountDetail, detail);
        } else {
          Object.assign(user.userDetail, detail);
        }
        await queryRunner.manager.save(user.userDetail);
      }

      await queryRunner.manager.save(user);

      if (positionId) {
        const positionExists = await this.positionService.findOne(positionId);
        if (!positionExists) throw new BadRequestException('El puesto indicado no existe');

        // Buscamos si ya tiene una asignación en la tabla intermedia
        const currentPosition = await queryRunner.manager.findOne(UserPosition, {
            where: { userId }
        });

        if (currentPosition) {
            currentPosition.positionId = positionId;
            await queryRunner.manager.save(currentPosition);
        } else {
            const newPosition = queryRunner.manager.create(UserPosition, {
                userId,
                positionId
            });
            await queryRunner.manager.save(newPosition);
        }
      }

      await queryRunner.commitTransaction();
      return { message: 'Usuario actualizado correctamente' };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    } finally {
      await queryRunner.release();
    }
  }
}
