import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class CountryService {

  private readonly logger = new Logger(CountryService.name)

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository:Repository<Country>,
  ){}

  async create(createCountryDto: CreateCountryDto) {
    //normaliza los datos
    const code = createCountryDto.code.toUpperCase();
    const name = createCountryDto.name.charAt(0).toUpperCase() + createCountryDto.name.slice(1).toLowerCase();
    const phoneCountryCode = createCountryDto.phoneCountryCode;

    const countryExists:boolean = await this. countryRepository.exists({where:{code}})
    if(countryExists){
      throw new ConflictException(`Ya existe un país con el código ${createCountryDto.code}`)
    }
    try{
      const newCountry = await this.countryRepository.create({code, name, phoneCountryCode});
      await this.countryRepository.save(newCountry)
      return {
        message:'País creado correctamente'
      };
    }
    catch(error){
      this.logger.error('Error creando el país',error)
      throw new ExceptionsHandler();
    }
  }

  findAll() {
    return `This action returns all country`;
  }

  async findOne(countryCode: string) {
    if (!countryCode) {
      throw new BadRequestException('El código de país no puede estar vacío.');
    }
    const code = countryCode.toUpperCase();
    const country = await this.countryRepository.findOne({where:{code}});
    if(!country){
      throw new NotFoundException(`No existe un país con el código '${countryCode}'`);
    }

    return country
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return `This action updates a #${id} country`;
  }

  remove(id: number) {
    return `This action removes a #${id} country`;
  }
}
