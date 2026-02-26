import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VacationsService } from './vacations.service';
import { CreateVacationPolicyDto, UpdateVacationPolicyDto } from './dto/vacation-policy.dto';
import { CreateVacationRequestDto, QueryVacationRequestDto, ReviewVacationRequestDto } from './dto/vacation-request.dto';
import { RoleGuard } from 'src/authentication/guard/role.guard';
import { Roles } from 'src/authentication/decorators/role.decoratos';
import { Role } from 'src/authentication/enum/role.enum';

@Controller('vacations')
export class VacationsController {
  constructor(private readonly vacationsService: VacationsService) {}

  // ==================== POLÍTICAS DE VACACIONES (ADMIN) ====================

  @Post('policies')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  createPolicy(@Body() dto: CreateVacationPolicyDto) {
    return this.vacationsService.createPolicy(dto);
  }

  @Get('policies')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  findAllPolicies() {
    return this.vacationsService.findAllPolicies();
  }

  @Get('policies/country/:countryCode')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  findPoliciesByCountry(@Param('countryCode') countryCode: string) {
    return this.vacationsService.findPoliciesByCountry(countryCode);
  }

  @Patch('policies/:id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  updatePolicy(@Param('id') id: string, @Body() dto: UpdateVacationPolicyDto) {
    return this.vacationsService.updatePolicy(id, dto);
  }

  @Delete('policies/:id')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  deletePolicy(@Param('id') id: string) {
    return this.vacationsService.deletePolicy(id);
  }


  @Post('balance/assign/:userId')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  assignVacationDays(@Param('userId') userId: string) {
    return this.vacationsService.assignVacationDays(userId);
  }

  @Post('balance/backfill')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  backfillAllBalances() {
    return this.vacationsService.backfillAllBalances();
  }

  @Get('balance/my-balance')
  getMyBalance(@Request() req) {
    const userId = req.user.sub;
    return this.vacationsService.getUserBalance(userId);
  }

  @Get('balance/:userId')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  getUserBalance(@Param('userId') userId: string) {
    return this.vacationsService.getUserBalance(userId);
  }


  @Post('requests')
  createRequest(
    @Request() req,
    @Body() dto: CreateVacationRequestDto,
  ) {
    const userId = req.user.sub;
    return this.vacationsService.createRequest(userId, dto);
  }

  @Get('requests')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  findAllRequests(@Query() query: QueryVacationRequestDto) {
    return this.vacationsService.findAllRequests(query);
  }

  @Get('requests/my-requests')
  findMyRequests(
    @Request() req,
    @Query() query: QueryVacationRequestDto,
  ) {
    const userId = req.user.sub;
    query.userId = userId;
    return this.vacationsService.findAllRequests(query);
  }

  @Get('requests/:id')
  findOneRequest(@Param('id') id: string) {
    return this.vacationsService.findOneRequest(id);
  }

  @Patch('requests/:id/review')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  reviewRequest(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ReviewVacationRequestDto,
  ) {
    const reviewerId = req.user.sub;
    return this.vacationsService.reviewRequest(id, reviewerId, dto);
  }

  @Patch('requests/:id/cancel')
  cancelRequest(
    @Param('id') id: string,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.vacationsService.cancelRequest(id, userId);
  }

  // ==================== DÍAS FERIADOS ====================

  @Get('holidays/upcoming')
  getMyUpcomingHolidays(@Request() req) {
    const userId = req.user.sub;
    return this.vacationsService.getUpcomingHolidaysForUser(userId);
  }

  @Get('holidays/upcoming/:countryCode')
  @UseGuards(RoleGuard)
  @Roles(Role.Admin)
  getUpcomingHolidaysByCountry(@Param('countryCode') countryCode: string) {
    return this.vacationsService.getUpcomingHolidays(countryCode);
  }
}
