import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VacationPolicy } from './entities/vacation-policy.entity';
import { VacationBalance } from './entities/vacation-balance.entity';
import { VacationRequest } from './entities/vacation-request.entity';
import { PublicHoliday } from './entities/public-holiday.entity';
import { CreateVacationPolicyDto, UpdateVacationPolicyDto } from './dto/vacation-policy.dto';
import { CreateVacationRequestDto, QueryVacationRequestDto, ReviewVacationRequestDto } from './dto/vacation-request.dto';
import { VacationStatus } from './enums/vacation-status.enum';
import { MailService } from 'src/mail/mail.service';
import { getFrontendUrl } from 'src/libs/getFrontendUrl';

@Injectable()
export class VacationsService {
  private readonly logger = new Logger(VacationsService.name);

  constructor(
    @InjectRepository(VacationPolicy)
    private readonly policyRepository: Repository<VacationPolicy>,
    @InjectRepository(VacationBalance)
    private readonly balanceRepository: Repository<VacationBalance>,
    @InjectRepository(VacationRequest)
    private readonly requestRepository: Repository<VacationRequest>,
    @InjectRepository(PublicHoliday)
    private readonly holidayRepository: Repository<PublicHoliday>,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}


  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  private async notifyHRNewVacationRequest(userId: string, request: VacationRequest): Promise<void> {
    const hrEmail = process.env.HR_EMAIL;
    if (!hrEmail) {
      this.logger.warn('HR_EMAIL no está configurado. No se enviará notificación a Capital Humano.');
      return;
    }

    const userRepository = this.dataSource.getRepository('User');
    const user = await userRepository.findOne({
      where: { userId },
      relations: ['userDetail'],
    });
    if (!user) return;

    const requestUrl = `${getFrontendUrl()}/admin/vacations/requests/${request.requestId}`;

    await this.mailService.sendVacationRequestEmail({
      recipientEmail: hrEmail,
      recipientName: 'Capital Humano',
      employeeName: `${user.name} ${user.lastname ?? ''}`.trim(),
      startDate: this.formatDate(request.startDate),
      endDate: this.formatDate(request.endDate),
      totalDays: Number(request.requestedDays),
      requestDate: this.formatDate(new Date()),
      requestUrl,
      notes: request.notes ?? undefined,
    });
  }

  private async notifyUserVacationApproved(request: VacationRequest): Promise<void> {
    const userRepository = this.dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { userId: request.userId } });
    if (!user?.email) return;

    const requestUrl = `${getFrontendUrl()}/vacaciones/mis-solicitudes`;

    await this.mailService.sendVacationApprovedEmail({
      userEmail: user.email,
      userName: user.name,
      startDate: this.formatDate(request.startDate),
      endDate: this.formatDate(request.endDate),
      totalDays: Number(request.requestedDays),
      requestUrl,
    });
  }



  async createPolicy(dto: CreateVacationPolicyDto): Promise<VacationPolicy> {
    const existing = await this.policyRepository.findOne({
      where: {
        countryCode: dto.countryCode,
        yearsOfService: dto.yearsOfService,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Ya existe una política para ${dto.countryCode} con ${dto.yearsOfService} años de servicio.`
      );
    }

    const policy = this.policyRepository.create(dto);
    return this.policyRepository.save(policy);
  }

  async findAllPolicies(): Promise<VacationPolicy[]> {
    return this.policyRepository.find({
      relations: ['country'],
      order: { countryCode: 'ASC', yearsOfService: 'ASC' },
    });
  }

  async findPoliciesByCountry(countryCode: string): Promise<VacationPolicy[]> {
    return this.policyRepository.find({
      where: { countryCode },
      order: { yearsOfService: 'ASC' },
    });
  }

  async updatePolicy(policyId: string, dto: UpdateVacationPolicyDto): Promise<VacationPolicy> {
    const policy = await this.policyRepository.findOneBy({ policyId });
    if (!policy) {
      throw new NotFoundException('Política no encontrada.');
    }

    Object.assign(policy, dto);
    return this.policyRepository.save(policy);
  }

  async deletePolicy(policyId: string): Promise<void> {
    const result = await this.policyRepository.delete(policyId);
    if (result.affected === 0) {
      throw new NotFoundException('Política no encontrada.');
    }
  }

 


  private calculateYearsOfService(startDate: Date | string): number {
    const start = new Date(startDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    const monthDiff = now.getMonth() - start.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
      years--;
    }
    return years;
  }


  async assignVacationDays(userId: string): Promise<VacationBalance> {
    const userRepository = this.dataSource.getRepository('User');
    const user = await userRepository.findOne({
      where: { userId },
      relations: ['userDetail', 'country'],
    });

    if (!user || !user.userDetail?.startDate) {
      throw new BadRequestException('Usuario no tiene fecha de ingreso definida.');
    }

    const yearsOfService = this.calculateYearsOfService(user.userDetail.startDate);
    
    if (yearsOfService < 1) {
      throw new BadRequestException('El usuario debe tener al menos 1 año de servicio.');
    }

    // Buscar la política correspondiente
    const policy = await this.policyRepository.findOne({
      where: {
        countryCode: user.country.code,
        yearsOfService: LessThanOrEqual(yearsOfService),
      },
      order: { yearsOfService: 'DESC' },
    });

    if (!policy) {
      throw new NotFoundException(
        `No hay política de vacaciones definida para ${user.country.code} con ${yearsOfService} años.`
      );
    }

    const startRaw = new Date(user.userDetail.startDate);
    const periodStart = new Date(
      startRaw.getUTCFullYear() + yearsOfService,
      startRaw.getUTCMonth(),
      startRaw.getUTCDate(),
    );
    const periodEnd = new Date(
      startRaw.getUTCFullYear() + yearsOfService + 1,
      startRaw.getUTCMonth(),
      startRaw.getUTCDate() - 1,
    );

    // Evitar duplicados: comparar por fecha formateada para evitar problemas de zona horaria
    const periodStartStr = periodStart.toISOString().split('T')[0];
    const existingBalance = await this.balanceRepository
      .createQueryBuilder('b')
      .where('b.user_id = :userId', { userId })
      .andWhere('CAST(b.period_start AS TEXT) = :periodStart', { periodStart: periodStartStr })
      .getOne();
    if (existingBalance) {
      return existingBalance;
    }

    const balance = this.balanceRepository.create({
      userId,
      periodStart,
      periodEnd,
      daysGranted: policy.daysGranted,
      daysUsed: 0,
      isActive: true,
    });

    return this.balanceRepository.save(balance);
  }

  async getUserBalance(userId: string) {
    let balances = await this.balanceRepository.find({
      where: { userId, isActive: true },
      order: { periodStart: 'ASC' },
    });

    // Si no hay balance registrado, intentar asignar automáticamente
    // (cubre el caso donde las políticas se crearon después del aniversario del usuario)
    if (balances.length === 0) {
      try {
        await this.assignVacationDays(userId);
        balances = await this.balanceRepository.find({
          where: { userId, isActive: true },
          order: { periodStart: 'ASC' },
        });
      } catch {
        // El usuario no califica aún (< 1 año) o no hay política definida; se devuelve 0
      }
    }

    const totalGranted = balances.reduce((sum, b) => sum + b.daysGranted, 0);
    const totalUsed = balances.reduce((sum, b) => sum + Number(b.daysUsed), 0);
    const available = totalGranted - totalUsed;

    return {
      balances,
      summary: {
        totalGranted,
        totalUsed,
        available,
      },
    };
  }

  async backfillAllBalances(): Promise<{ assigned: number; skipped: number; errors: number }> {
    const userRepository = this.dataSource.getRepository('User');
    const users = await userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userDetail', 'detail')
      .innerJoinAndSelect('user.country', 'country')
      .where('user.isActive = true')
      .andWhere('detail.start_date IS NOT NULL')
      .getMany();

    let assigned = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of users) {
      try {
        const yearsOfService = this.calculateYearsOfService(user.userDetail.startDate);
        if (yearsOfService < 1) { skipped++; continue; }

        // Verificar si ya tiene balance activo
        const existing = await this.balanceRepository.findOne({
          where: { userId: user.userId, isActive: true },
        });
        if (existing) { skipped++; continue; }

        await this.assignVacationDays(user.userId);
        assigned++;
      } catch {
        errors++;
      }
    }

    return { assigned, skipped, errors };
  }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoAssignVacationDays() {

    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const userRepository = this.dataSource.getRepository('User');
    const users = await userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.userDetail', 'detail')
      .innerJoinAndSelect('user.country', 'country')
      .where('EXTRACT(MONTH FROM detail.start_date) = :month', { month })
      .andWhere('EXTRACT(DAY FROM detail.start_date) = :day', { day })
      .andWhere('user.isActive = true')
      .getMany();

    console.log(`📅 Usuarios con aniversario hoy: ${users.length}`);

    for (const user of users) {
      try {
        const yearsOfService = this.calculateYearsOfService(user.userDetail.startDate);
        
        if (yearsOfService >= 1) {
          const existingBalance = await this.balanceRepository.findOne({
            where: {
              userId: user.userId,
              periodStart: MoreThanOrEqual(new Date(today.getFullYear(), 0, 1)),
            },
          });

          if (!existingBalance) {
            await this.assignVacationDays(user.userId);
            console.log(`✅ Asignado a ${user.name} ${user.lastname} (${yearsOfService} años)`);
          }
        }
      } catch (error) {
        
      }
    }
  }


  private calculateWorkingDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }


  async createRequest(userId: string, dto: CreateVacationRequestDto): Promise<VacationRequest> {
    // Parse as local noon to avoid UTC-midnight timezone shift on getDay() calls
    const startDate = new Date(`${dto.startDate}T12:00:00`);
    const endDate = new Date(`${dto.endDate}T12:00:00`);

    if (endDate < startDate) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio.');
    }

    const requestedDays = this.calculateWorkingDays(startDate, endDate);

    if (requestedDays === 0) {
      throw new BadRequestException('El rango seleccionado no incluye días hábiles.');
    }
    const { summary } = await this.getUserBalance(userId);
    
    if (summary.available < requestedDays) {
      throw new BadRequestException(
        `Días insuficientes. Disponibles: ${summary.available}, Solicitados: ${requestedDays}`
      );
    }

    const request = this.requestRepository.create({
      userId,
      startDate,
      endDate,
      requestedDays,
      status: VacationStatus.PENDING,
      notes: dto.notes,
    });

    const savedRequest = await this.requestRepository.save(request);

    // Notificar a Capital Humano de forma asíncrona (no bloquea la respuesta)
    this.notifyHRNewVacationRequest(userId, savedRequest).catch((err) =>
      this.logger.error('Error notificando a RH sobre nueva solicitud de vacaciones', err),
    );

    return savedRequest;
  }


  async findAllRequests(query: QueryVacationRequestDto) {
    const { status, userId, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('user.userDetail', 'userDetail')
      .leftJoinAndSelect('request.reviewer', 'reviewer')
      .orderBy('request.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('request.userId = :userId', { userId });
    }

    if (search) {
      queryBuilder.andWhere(
        "CONCAT(user.name, ' ', COALESCE(user.lastname, '')) ILIKE :search",
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }


  async findOneRequest(requestId: string): Promise<VacationRequest> {
    const request = await this.requestRepository.findOne({
      where: { requestId },
      relations: ['user', 'user.userDetail', 'reviewer'],
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada.');
    }

    return request;
  }


  async reviewRequest(
    requestId: string,
    reviewerId: string,
    dto: ReviewVacationRequestDto,
  ): Promise<VacationRequest> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await queryRunner.manager.findOne(VacationRequest, {
        where: { requestId },
      });

      if (!request) {
        throw new NotFoundException('Solicitud no encontrada.');
      }

      if (request.status !== VacationStatus.PENDING) {
        throw new BadRequestException('La solicitud ya fue revisada.');
      }

      request.status = dto.status === 'APPROVED' ? VacationStatus.APPROVED : VacationStatus.REJECTED;
      request.reviewerId = reviewerId;
      request.reviewedAt = new Date();
      request.rejectionReason = dto.rejectionReason || null;

      await queryRunner.manager.save(request);

      if (request.status === VacationStatus.APPROVED) {
        const balances = await queryRunner.manager.find(VacationBalance, {
          where: { userId: request.userId, isActive: true },
          order: { periodStart: 'ASC' },
        });

        let remainingDays = request.requestedDays;

        for (const balance of balances) {
          const available = balance.daysGranted - Number(balance.daysUsed);

          if (available > 0) {
            const toDeduct = Math.min(available, remainingDays);
            balance.daysUsed = Number(balance.daysUsed) + toDeduct;
            await queryRunner.manager.save(balance);

            remainingDays -= toDeduct;

            if (remainingDays <= 0) break;
          }
        }

        if (remainingDays > 0) {
          throw new BadRequestException('Error: no hay suficiente balance disponible.');
        }
      }

      await queryRunner.commitTransaction();

      // Notificar al usuario si sus vacaciones fueron aprobadas
      if (request.status === VacationStatus.APPROVED) {
        this.notifyUserVacationApproved(request).catch((err) =>
          this.logger.error('Error notificando al usuario sobre aprobación de vacaciones', err),
        );
      }

      return request;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  async getUpcomingHolidays(countryCode: string): Promise<PublicHoliday[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    return this.holidayRepository
      .createQueryBuilder('holiday')
      .where('holiday.country_code = :countryCode', { countryCode })
      .andWhere('holiday.is_active = true')
      .andWhere('holiday.holiday_date >= :today', { today })
      .andWhere('holiday.holiday_date <= :in7Days', { in7Days })
      .orderBy('holiday.holiday_date', 'ASC')
      .getMany();
  }

  async getUpcomingHolidaysForUser(userId: string): Promise<PublicHoliday[]> {
    const userRepository = this.dataSource.getRepository('User');
    const user = await userRepository.findOne({
      where: { userId },
      relations: ['country'],
    });

    if (!user || !user.country) {
      throw new BadRequestException('El usuario no tiene un país asignado.');
    }

    return this.getUpcomingHolidays(user.country.code);
  }

  async cancelRequest(requestId: string, userId: string): Promise<VacationRequest> {
    const request = await this.requestRepository.findOne({
      where: { requestId, userId },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada.');
    }

    if (request.status !== VacationStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar solicitudes pendientes.');
    }

    request.status = VacationStatus.CANCELLED;
    return this.requestRepository.save(request);
  }
}
