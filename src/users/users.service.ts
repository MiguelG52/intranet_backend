import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { hash } from 'bcryptjs';
import { Role } from 'src/role/entities/role.entity';
import { Country } from 'src/country/entities/country.entity';
import { UserAccountDetail } from './entities/userAccountDetail.entity';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository<User>,
    
    private readonly dataSource: DataSource
  ) {}


  async create(createUserDto: CreateUserDto):Promise<User> {
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
      });

      if (detail) {
        const userDetail = queryRunner.manager.create(UserAccountDetail, detail);
        user.userDetail = userDetail;
      }
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      
      delete (user as any).passwordHash;
      return user;

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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
