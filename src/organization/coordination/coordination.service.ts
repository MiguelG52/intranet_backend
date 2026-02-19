import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coordination } from './entities/coordination.entity';
import { AreaCoordination } from './entities/area-coordination.entity';
import { CreateCoordinationDto } from './dto/create-coordination.dto';
import { UpdateCoordinationDto } from './dto/update-coordination.dto';
import { AssignCoordinationToAreaDto } from './dto/assign-coordination.dto';

@Injectable()
export class CoordinationService {
  constructor(
    @InjectRepository(Coordination)
    private coordinationRepository: Repository<Coordination>,
    @InjectRepository(AreaCoordination)
    private areaCoordinationRepository: Repository<AreaCoordination>,
  ) {}

  async create(createDto: CreateCoordinationDto): Promise<Coordination> {
    const coordination = this.coordinationRepository.create(createDto);
    return this.coordinationRepository.save(coordination);
  }

  async findAll(): Promise<Coordination[]> {
    return this.coordinationRepository.find({
      relations: ['areaCoordinations', 'areaCoordinations.area'],
    });
  }

  async findOne(id: string): Promise<Coordination> {
    const coordination = await this.coordinationRepository.findOne({
      where: { coordinationId: id },
      relations: ['areaCoordinations', 'areaCoordinations.area', 'methodologies'],
    });

    if (!coordination) {
      throw new NotFoundException(`Coordination with ID ${id} not found`);
    }

    return coordination;
  }

  async update(id: string, updateDto: UpdateCoordinationDto): Promise<Coordination> {
    const coordination = await this.findOne(id);
    Object.assign(coordination, updateDto);
    return this.coordinationRepository.save(coordination);
  }

  async remove(id: string): Promise<void> {
    const coordination = await this.findOne(id);
    await this.coordinationRepository.remove(coordination);
  }

  // Gestión de relaciones Area-Coordination
  async assignToArea(dto: AssignCoordinationToAreaDto): Promise<AreaCoordination> {
    const existing = await this.areaCoordinationRepository.findOne({
      where: {
        areaId: dto.areaId,
        coordinationId: dto.coordinationId,
      },
    });

    if (existing) {
      return existing; // Ya existe la relación
    }

    const areaCoordination = this.areaCoordinationRepository.create(dto);
    return this.areaCoordinationRepository.save(areaCoordination);
  }

  async removeFromArea(coordinationId: string, areaId: string): Promise<void> {
    const result = await this.areaCoordinationRepository.delete({
      coordinationId,
      areaId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Relation not found');
    }
  }

  async getCoordinationsByArea(areaId: string): Promise<Coordination[]> {
    const relations = await this.areaCoordinationRepository.find({
      where: { areaId },
      relations: ['coordination'],
    });

    return relations.map(r => r.coordination);
  }

  async getAreasByCoordination(coordinationId: string) {
    const relations = await this.areaCoordinationRepository.find({
      where: { coordinationId },
      relations: ['area'],
    });

    return relations.map(r => r.area);
  }
}
