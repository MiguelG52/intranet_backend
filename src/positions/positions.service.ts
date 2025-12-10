import { BadRequestException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { Repository } from 'typeorm';
import { AreaService } from 'src/areas/areas.service';
import { Area } from 'src/areas/entities/area.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    @Inject(forwardRef(() => AreaService))
    private readonly areaService: AreaService, 
  ) {}

  async create(createPositionDto: CreatePositionDto) {

    let area: Area;
    try {
      area = await this.areaService.findOne(createPositionDto.areaId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`El área con ID '${createPositionDto.areaId}' no existe.`);
      }
      throw error;
    }

    //    comprueba si existe un puesto con ese título
    //    SOLAMENTE en la misma área.
    const existingPosition = await this.positionRepository.exists({
      where: {
        title: createPositionDto.title,
        areaId: createPositionDto.areaId
      }
    });
    
    if (existingPosition) {
      throw new BadRequestException(
        `Ya existe una posición con el nombre '${createPositionDto.title}' en el área seleccionada.`
      );
    }
    
    if (createPositionDto.managerId) {
      const managerExists = await this.positionRepository.existsBy({
        positionId: createPositionDto.managerId,
      });
      if (!managerExists) {
        throw new BadRequestException(
          `El mánager con ID '${createPositionDto.managerId}' no existe.`,
        );
      }
    }

    const position = this.positionRepository.create(createPositionDto);
    await this.positionRepository.save(position);
    return { message: `La posición ${createPositionDto.title} ha sido creada exitosamente.` };
  }

  findAll() {
    return this.positionRepository.find({
      relations: { area: true, manager: true },
    });
  }

  async findOne(id: string) {
    const position = await this.positionRepository.findOne({
      where: { positionId: id },
      relations: { area: true, manager: true, subordinates: true },
    });
    if (!position) {
      throw new NotFoundException(`Posición con ID '${id}' no encontrada.`);
    }
    return position;
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    if (updatePositionDto.areaId) {
      await this.areaService.findOne(updatePositionDto.areaId);
    }
    if (updatePositionDto.managerId) {
      const manager = await this.positionRepository.findOneBy({
        positionId: updatePositionDto.managerId,
      });
      if (!manager) {
        throw new BadRequestException(
          `El mánager con ID '${updatePositionDto.managerId}' no existe.`,
        );
      }
    }
    
    const position = await this.positionRepository.preload({
      positionId: id,
      ...updatePositionDto,
    });

    if (!position) {
      throw new NotFoundException(`Posición con ID '${id}' no encontrada.`);
    }
    return this.positionRepository.save(position);
  }

  async remove(id: string) {
    const result = await this.positionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Posición con ID '${id}' no encontrada.`);
    }
    return { message: 'Posición eliminada exitosamente.' };
  }

  async findByArea(areaId: string) {
    return this.positionRepository.find({
      where: { areaId },
      order: { title: 'ASC' },
    });
  }

  async getOrgChart() {
    const positions = await this.positionRepository.find({
      relations: {
        area: true,
        userPositions: {
          user: {
            userDetail: true,
          },
        },
      },
      select: {
        positionId: true,
        title: true,
        managerId: true,
        area: {
          areaId: true,
          areaName: true,
        },
        userPositions: {
          id: true,
          user: {
            userId: true,
            name: true,
            lastname: true,
            email: true,
            userDetail: {
              profilePicture: true,
            },
          },
        },
      },
    });

    const positionMap = new Map();
    const roots: any[] = [];

    // Initialize map with formatted objects
    positions.forEach((pos) => {
      positionMap.set(pos.positionId, {
        ...pos,
        children: [],
        users: pos.userPositions.map((up) => up.user),
      });
    });

    // Link children to parents
    positions.forEach((pos) => {
      const mappedPos = positionMap.get(pos.positionId);
      if (pos.managerId && positionMap.has(pos.managerId)) {
        const parent = positionMap.get(pos.managerId);
        parent.children.push(mappedPos);
      } else {
        roots.push(mappedPos);
      }
    });

    return roots;
  }

  async removeByArea(areaId: string) {
    await this.positionRepository.delete({ areaId });
  }
}