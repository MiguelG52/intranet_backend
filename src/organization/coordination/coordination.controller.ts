import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CoordinationService } from './coordination.service';
import { CreateCoordinationDto } from './dto/create-coordination.dto';
import { UpdateCoordinationDto } from './dto/update-coordination.dto';
import { AssignCoordinationToAreaDto } from './dto/assign-coordination.dto';

@Controller('coordination')
export class CoordinationController {
  constructor(private readonly coordinationService: CoordinationService) {}

  @Post()
  create(@Body() createDto: CreateCoordinationDto) {
    return this.coordinationService.create(createDto);
  }

  @Get()
  findAll() {
    return this.coordinationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coordinationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateCoordinationDto) {
    return this.coordinationService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.coordinationService.remove(id);
  }

  // Gestión de relaciones
  @Post('assign-area')
  assignToArea(@Body() dto: AssignCoordinationToAreaDto) {
    return this.coordinationService.assignToArea(dto);
  }

  @Delete(':coordinationId/area/:areaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromArea(
    @Param('coordinationId') coordinationId: string,
    @Param('areaId') areaId: string,
  ) {
    return this.coordinationService.removeFromArea(coordinationId, areaId);
  }

  @Get('by-area/:areaId')
  getByArea(@Param('areaId') areaId: string) {
    return this.coordinationService.getCoordinationsByArea(areaId);
  }

  @Get(':coordinationId/areas')
  getAreas(@Param('coordinationId') coordinationId: string) {
    return this.coordinationService.getAreasByCoordination(coordinationId);
  }
}
