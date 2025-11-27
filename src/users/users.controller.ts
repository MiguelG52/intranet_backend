import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('users')
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
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserProfileDto) {
    return this.usersService.updateProfile(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
