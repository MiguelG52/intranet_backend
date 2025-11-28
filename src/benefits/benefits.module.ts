import { Module } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { BenefitsController } from './benefits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Benefit } from './entities/benefit.entity';
import { BenefitType } from './entities/benefit-type.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Benefit, BenefitType])],
  controllers: [BenefitsController],
  providers: [BenefitsService],
})
export class BenefitsModule {}
