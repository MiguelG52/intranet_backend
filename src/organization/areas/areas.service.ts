import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Area } from './entities/area.entity';
import { AreaCoordination } from 'src/organization/coordination/entities/area-coordination.entity';
import { PositionService } from 'src/organization/positions/positions.service';
import { DataSource, Repository } from 'typeorm';
import { CountryService } from 'src/organization/country/country.service';

@Injectable()
export class AreaService {
  constructor(
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    @Inject(forwardRef(() => PositionService))
    private readonly positionService: PositionService,
    private readonly countryService:CountryService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createAreaDto: CreateAreaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { areaName } = createAreaDto;
      
      // Normalizar el countryCode (area global si no hay país)
      const countryCode = createAreaDto.countryCode && createAreaDto.countryCode.trim() !== ''
        ? createAreaDto.countryCode.toUpperCase()
        : undefined;

      // Normalizar coordinationId (no requerido)
      const coordinationId = createAreaDto.coordinationId && createAreaDto.coordinationId.trim() !== ''
        ? createAreaDto.coordinationId
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

      //Crear y Guardar área
      const area = this.areaRepository.create({
        areaName,
        countryCode,
      });
      
      const savedArea = await queryRunner.manager.save(area);

      // Si se proporciona coordinationId, crear la relación en area_coordination
      if (coordinationId) {
        const areaCoordination = queryRunner.manager.create(AreaCoordination, {
          areaId: savedArea.areaId,
          coordinationId: coordinationId,
        });
        await queryRunner.manager.save(areaCoordination);
      }

      await queryRunner.commitTransaction();

      return {
        message: `El área ${area.areaName} ha sido creada exitosamente.`,
        areaId: savedArea.areaId,
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw new BadRequestException(error.message);
      }

      console.error('Error en AreaService.create:', error.message);
      throw new InternalServerErrorException('Error al crear el área.');
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return this.areaRepository.find({
      relations: { 
        country: true,
        areaCoordinations: {
          coordination: true,
        },
      },
    });
  }

  async findOne(id: string) {
    const area = await this.areaRepository.findOne({
      where: { areaId: id },
      relations: { 
        country: true, 
        positions: true,
        areaCoordinations: {
          coordination: true,
        },
      }, 
    });
    if (!area) {
      throw new NotFoundException(`Área con ID '${id}' no encontrada.`);
    }
    return area;
  }

  async update(id: string, updateAreaDto: UpdateAreaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { coordinationId: rawCoordinationId, ...areaData } = updateAreaDto;

      // Normalizar countryCode (área global si viene vacío o no viene)
      const countryCode = areaData.countryCode && areaData.countryCode.trim() !== ''
        ? areaData.countryCode.toUpperCase()
        : undefined;

      // Normalizar coordinationId (no requerido)
      const coordinationId = rawCoordinationId && rawCoordinationId.trim() !== ''
        ? rawCoordinationId
        : undefined;

      if (countryCode) {
        await this.countryService.findOne(countryCode);
      }
      
      const area = await this.areaRepository.preload({
        areaId: id,
        ...areaData,
        countryCode,
      });

      if (!area) {
        throw new NotFoundException(`Área con ID '${id}' no encontrada.`);
      }
      
      await queryRunner.manager.save(area);

      await queryRunner.manager.delete(AreaCoordination, { areaId: id });

      // Solo crear nueva relación si se proporcionó coordinationId
      if (coordinationId) {
        const areaCoordination = queryRunner.manager.create(AreaCoordination, {
          areaId: id,
          coordinationId: coordinationId,
        });
        await queryRunner.manager.save(areaCoordination);
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Área actualizada exitosamente.',
        areaId: id,
      };
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error en AreaService.update:', error.message);
      throw new InternalServerErrorException('Error al actualizar el área.');
    } finally {
      await queryRunner.release();
    }
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