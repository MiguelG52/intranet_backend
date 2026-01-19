import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { PositionService } from 'src/positions/positions.service';
import { Repository } from 'typeorm';
import { CountryService } from 'src/country/country.service';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @Inject(forwardRef(() => PositionService))
    private readonly positionService: PositionService,
    private readonly countryService:CountryService,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    try {
      const { areaName} = createAreaDto;
      
      // Normalizar el countryCode
      const countryCode = createAreaDto.countryCode
        ? createAreaDto.countryCode.toUpperCase()
        : undefined;

      if (countryCode) {
        await this.countryService.findOne(countryCode);
      }

      // Verificamos si ya existe un área con ese nombre en ese país/ámbito.
      const existingArea = await this.areaRepository.existsBy({
        areaName: areaName,
        countryCode: countryCode,
      });

      if (existingArea) {
        throw new ConflictException(
          `Ya existe un área con el nombre '${areaName}' para el país '${countryCode || 'Global'}'.`
        );
      }

      //Crear y Guardar
      const area = this.areaRepository.create({
        areaName,
        countryCode,
      });
      
      await this.areaRepository.save(area);

      return {
        message: `El área ${area.areaName} ha sido creada exitosamente.`,
      };
      
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw new BadRequestException(error.message);
      }

      console.error('Error en AreaService.create:', error.message);
      throw new InternalServerErrorException('Error al crear el área.');
    }
  }

  findAll() {
    return this.areaRepository.find({
      relations: { country: true },
    });
  }

  async findOne(id: string) {
    const area = await this.areaRepository.findOne({
      where: { areaId: id },
      relations: { country: true, positions: true }, 
    });
    if (!area) {
      throw new NotFoundException(`Área con ID '${id}' no encontrada.`);
    }
    return area;
  }

  async update(id: string, updateAreaDto: UpdateAreaDto) {
    // Si el countryCode es un string vacío, lo tratamos como undefined (Global)
    const countryCode = updateAreaDto.countryCode === '' ? undefined : updateAreaDto.countryCode;

    if (countryCode) {
      await this.countryService.findOne(countryCode);
    }
    
    const area = await this.areaRepository.preload({
      areaId: id,
      ...updateAreaDto,
      countryCode,
    });

    if (!area) {
      throw new NotFoundException(`Área con ID '${id}' no encontrada.`);
    }
    return this.areaRepository.save(area);
  }

  async remove(id: string) {
    // Eliminar posiciones asociadas primero
    await this.positionService.removeByArea(id);

    const result = await this.areaRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Área con ID '${id}' no encontrada.`);
    }
    return { message: 'Área eliminada exitosamente.' };
  }
}