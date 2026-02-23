import { Country } from 'src/organization/country/entities/country.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity('vacation_policy')
@Unique(['countryCode', 'yearsOfService']) // Evita duplicados para el mismo país/años
export class VacationPolicy {
  @PrimaryGeneratedColumn('uuid', { name: 'policy_id' })
  policyId: string;

  @Column({ name: 'country_code', type: 'varchar', length: 3 })
  countryCode: string;

  @Column({ name: 'years_of_service', type: 'int' })
  yearsOfService: number;

  @Column({ name: 'days_granted', type: 'int' })
  daysGranted: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relación con Country
  @ManyToOne(() => Country, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country: Country;
}
