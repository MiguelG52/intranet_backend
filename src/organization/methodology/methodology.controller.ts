import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MethodologyService } from './methodology.service';
import { CreateMethodologyDto } from './dto/create-methodology.dto';
import { UpdateMethodologyDto } from './dto/update-methodology.dto';

@Controller('methodology')
export class MethodologyController {
  constructor(private readonly methodologyService: MethodologyService) {}

  @Post()
  create(@Body() createDto: CreateMethodologyDto) {
    return this.methodologyService.create(createDto);
  }

  @Get()
  findAll() {
    return this.methodologyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.methodologyService.findOne(id);
  }

  @Get('coordination/:coordinationId')
  findByCoordination(@Param('coordinationId') coordinationId: string) {
    return this.methodologyService.findByCoordination(coordinationId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateMethodologyDto) {
    return this.methodologyService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.methodologyService.remove(id);
  }
}
