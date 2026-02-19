import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() createDto: CreateTeamDto) {
    return this.teamService.create(createDto);
  }

  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Get('methodology/:methodologyId')
  findByMethodology(@Param('methodologyId') methodologyId: string) {
    return this.teamService.findByMethodology(methodologyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTeamDto) {
    return this.teamService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.teamService.remove(id);
  }
}
