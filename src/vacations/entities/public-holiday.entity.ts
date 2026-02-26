import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Country } from 'src/organization/country/entities/country.entity';

@Entity('public_holiday')
@Index('idx_public_holiday_date_country', ['countryCode', 'holidayDate'])
@Unique('uk_country_holiday_date', ['countryCode', 'holidayDate'])
export class PublicHoliday {
  @PrimaryGeneratedColumn('uuid', { name: 'holiday_id' })
  holidayId: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10 })
  countryCode: string;

  @Column({ name: 'holiday_date', type: 'date' })
  holidayDate: Date;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Country, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country: Country;
}
