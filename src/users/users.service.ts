import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAuthDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { Role } from 'src/role/entities/role.entity';
import { Country } from 'src/country/entities/country.entity';
import { UserAccountDetail } from './entities/userAccountDetail.entity';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    private readonly dataSource: DataSource
  ) {}

  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crea una nueva cuenta de usuario y su detalle asociado.
   * Asigna un token de verificación pero NO envía el correo.
   * Retorna la entidad User completa.
   */
  async create(createUserDto: CreateUserDto) { 
    const {
      email,
      password,
      name,
      lastname,
      roleId,
      countryCode,
      detail,
    } = createUserDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictException(`El email '${email}' ya está registrado.`);
    }

    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
    const verificationToken = this.generateVerificationToken();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

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
      
      const savedUser = await queryRunner.manager.save(user);
      
      await queryRunner.commitTransaction();
      
      
      return savedUser; 

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(error);
      throw new InternalServerErrorException('Error al crear la cuenta de usuario.');
      
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all users`;
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
  findOneById(userId:string):Promise<User | null> {
    return this.userRepository.findOne({where:{userId}}) 
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
  ): Promise<User> {
    const user = await this.userRepository.findOneByOrFail({ userId });
    Object.assign(user, updateDto);
    
    return this.userRepository.save(user);
  }
  

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
