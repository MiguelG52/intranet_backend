import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { CreateBenefitTypeDto } from './dto/create-benefit-type.dto';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  // --- BENEFIT TYPES ---

  @Post("types/register")
  registerType(@Body() createBenefitTypeDto: CreateBenefitTypeDto) {
    return this.benefitsService.createBenefitType(createBenefitTypeDto);
  }

  @Post('types')
  createType(@Body() createBenefitTypeDto: CreateBenefitTypeDto) {
    return this.benefitsService.createBenefitType(createBenefitTypeDto);
  }

  @Get('types-find-all')
  findAllTypes() {
    return this.benefitsService.findAllBenefitTypes();
  }

  @Patch('types/:id')
  updateType(@Param('id', ParseUUIDPipe) id: string, @Body() updateBenefitTypeDto: Partial<CreateBenefitTypeDto>) {
    return this.benefitsService.updateBenefitType(id, updateBenefitTypeDto);
  }

  @Delete('types/:id')
  deleteType(@Param('id', ParseUUIDPipe) id: string) {
    return this.benefitsService.deleteBenefitType(id);
  }

  // --- BENEFITS ---

  @Post()
  create(@Body() createBenefitDto: CreateBenefitDto) {
    return this.benefitsService.create(createBenefitDto);
  }

  @Get('find-all')
  findAll(@Query() params:QueryParamsDto) {
    return this.benefitsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.benefitsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBenefitDto: UpdateBenefitDto) {
    return this.benefitsService.update(id, updateBenefitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.benefitsService.remove(id);
  }
}
