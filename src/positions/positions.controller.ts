import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PositionService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { RoleGuard } from 'src/authentication/guard/role.guard';
import { Roles } from 'src/authentication/decorators/role.decoratos';
import { ParseUUIDPipe } from '@nestjs/common';
import { Role as RolesEnum } from 'src/authentication/enum/role.enum';

@Controller('position')
@UseGuards(RoleGuard)
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Post('register')
  @Roles(RolesEnum.Admin) // Solo Admin
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionService.create(createPositionDto);
  }

  @Get()
  @Roles(RolesEnum.Admin, RolesEnum.Worker)
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  @Roles(RolesEnum.Admin, RolesEnum.Worker) 
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.findOne(id);
  }

  @Patch(':id')
  @Roles(RolesEnum.Admin) 
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @Roles(RolesEnum.Admin) 
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionService.remove(id);
  }
}
