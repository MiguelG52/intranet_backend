import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async create(createDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create(createDto);
    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({
      relations: ['methodology', 'methodology.coordination', 'methodology.coordination.areaCoordinations', 'methodology.coordination.areaCoordinations.area'],
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { teamId: id },
      relations: ['methodology', 'methodology.coordination', 'methodology.coordination.areaCoordinations', 'methodology.coordination.areaCoordinations.area', 'assignments'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async findByMethodology(methodologyId: string): Promise<Team[]> {
    return this.teamRepository.find({
      where: { methodologyId },
      relations: ['methodology'],
    });
  }

  async update(id: string, updateDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, updateDto);
    return this.teamRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }
}
