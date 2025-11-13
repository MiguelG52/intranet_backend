import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  

  @Get()
  findAll() {
    return this.usersService.findAll();
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
