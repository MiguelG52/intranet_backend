import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { RoleGuard } from 'src/authentication/guard/role.guard';
import { Roles } from 'src/authentication/decorators/role.decoratos';
import { Role } from 'src/authentication/enum/role.enum';

@Controller('country')
@UseGuards(RoleGuard)
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post('register')
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCountryDto: CreateCountryDto) {
    return await this.countryService.create(createCountryDto);
  }

  @Get()
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') countryCode: string) {
    return this.countryService.findOne(countryCode);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.countryService.remove(id);
  }
}
