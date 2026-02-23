import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Methodology } from './entities/methodology.entity';
import { AreaCoordination } from 'src/organization/coordination/entities/area-coordination.entity';
import { CreateMethodologyDto } from './dto/create-methodology.dto';
import { UpdateMethodologyDto } from './dto/update-methodology.dto';

@Injectable()
export class MethodologyService {
  constructor(
    @InjectRepository(Methodology)
    private methodologyRepository: Repository<Methodology>,
    @InjectRepository(AreaCoordination)
    private areaCoordinationRepository: Repository<AreaCoordination>,
  ) {}

  async create(createDto: CreateMethodologyDto): Promise<Methodology> {
    const methodology = this.methodologyRepository.create(createDto);
    return this.methodologyRepository.save(methodology);
  }

  async findAll(): Promise<Methodology[]> {
    return this.methodologyRepository.find({
      relations: ['coordination', 'coordination.areaCoordinations', 'coordination.areaCoordinations.area'],
    });
  }

  async findOne(id: string): Promise<Methodology> {
    const methodology = await this.methodologyRepository.findOne({
      where: { methodologyId: id },
      relations: ['coordination', 'teams'],
    });

    if (!methodology) {
      throw new NotFoundException(`Methodology with ID ${id} not found`);
    }

    return methodology;
  }

  async findByCoordination(coordinationId: string): Promise<Methodology[]> {
    return this.methodologyRepository.find({
      where: { coordinationId },
      relations: ['coordination'],
    });
  }

  async findByArea(areaId: string): Promise<Methodology[]> {
    // Buscar la coordinación asociada al área
    const areaCoordination = await this.areaCoordinationRepository.findOne({
      where: { areaId },
      relations: ['coordination'],
    });

    if (!areaCoordination) {
      throw new NotFoundException(`No se encontró coordinación para el área con ID ${areaId}`);
    }

    // Obtener las metodologías de esa coordinación
    return this.methodologyRepository.find({
      where: { coordinationId: areaCoordination.coordinationId },
      relations: ['coordination'],
    });
  }

  async update(id: string, updateDto: UpdateMethodologyDto): Promise<Methodology> {
    const methodology = await this.findOne(id);
    Object.assign(methodology, updateDto);
    return this.methodologyRepository.save(methodology);
  }

  async remove(id: string): Promise<void> {
    const methodology = await this.findOne(id);
    await this.methodologyRepository.remove(methodology);
  }
}
