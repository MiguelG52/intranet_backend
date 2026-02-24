import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VacationPolicy } from './entities/vacation-policy.entity';
import { VacationBalance } from './entities/vacation-balance.entity';
import { VacationRequest } from './entities/vacation-request.entity';
import { CreateVacationPolicyDto, UpdateVacationPolicyDto } from './dto/vacation-policy.dto';
import { CreateVacationRequestDto, QueryVacationRequestDto, ReviewVacationRequestDto } from './dto/vacation-request.dto';
import { VacationStatus } from './enums/vacation-status.enum';

@Injectable()
export class VacationsService {
  constructor(
    @InjectRepository(VacationPolicy)
    private readonly policyRepository: Repository<VacationPolicy>,
    @InjectRepository(VacationBalance)
    private readonly balanceRepository: Repository<VacationBalance>,
    @InjectRepository(VacationRequest)
    private readonly requestRepository: Repository<VacationRequest>,
    private readonly dataSource: DataSource,
  ) {}



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

 


  private calculateYearsOfService(startDate: Date): number {
    const now = new Date();
    const diffTime = now.getTime() - startDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
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

    const periodStart = new Date(user.userDetail.startDate);
    periodStart.setFullYear(periodStart.getFullYear() + yearsOfService);
    
    const periodEnd = new Date(periodStart);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    periodEnd.setDate(periodEnd.getDate() - 1);


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
    const balances = await this.balanceRepository.find({
      where: { userId, isActive: true },
      order: { periodStart: 'ASC' },
    });

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


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoAssignVacationDays() {
    console.log('🔄 Ejecutando asignación automática de vacaciones...');

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
        console.error(`❌ Error asignando a ${user.userId}:`, error.message);
      }
    }

    console.log('✅ Asignación automática completada.');
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
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

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

    return this.requestRepository.save(request);
  }


  async findAllRequests(query: QueryVacationRequestDto) {
    const { status, userId, page = 1, limit = 10 } = query;
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
      return request;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
