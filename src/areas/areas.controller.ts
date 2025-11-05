import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { AreaService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { RoleGuard } from 'src/authentication/guard/role.guard';
import { Role } from 'src/authentication/enum/role.enum';
import { Roles } from 'src/authentication/decorators/role.decoratos';

@Controller('areas')
@UseGuards(RoleGuard)
export class AreasController {
  constructor(private readonly areaService: AreaService) {}

  @Post('register')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }

  @Get('findAll')
  @Roles(Role.Admin, Role.Worker, Role.Intern) 
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.areaService.findAll();
  }

  @Get('find/:id')
  @Roles(Role.Admin, Role.Worker, Role.Intern)
  @HttpCode(HttpStatus.OK) 
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.areaService.findOne(id);
  }

  @Patch('update/:id')
  @Roles(Role.Admin) 
  @HttpCode(HttpStatus.OK)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(id, updateAreaDto);
  }

  @Delete('delete/:id')
  @Roles(Role.Admin) 
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.areaService.remove(id);
  }
}
