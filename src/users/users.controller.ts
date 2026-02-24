import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { RoleGuard } from 'src/authentication/guard/role.guard';
import { Roles } from 'src/authentication/decorators/role.decoratos';
import { Role } from 'src/authentication/enum/role.enum';
import { UpdateUserAdminDto } from './dto/create-user-detail.dto';

@Controller('users')
@UseGuards(RoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  


  @Get('find-all')
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('positionId') positionId?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy: string = 'name',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    return this.usersService.findAll({ 
      page: Number(page), 
      limit: Number(limit), 
      positionId, 
      search, 
      orderBy, 
      order 
    });
  }

  @Get('find-one/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  /*
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
  */

  @Patch('profile/:id')
  updateProfile(@Param('id') id: string, @Body() updateUserDto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(id, updateUserDto);
  }

  
  @Roles(Role.Admin)
  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserAdminDto) {
    return this.usersService.updateUserAdmin(id, updateUserDto);
  }

  @Roles(Role.Admin)
  @Patch('toggle-status/:id')
  toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }
}
