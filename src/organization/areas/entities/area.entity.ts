import { Coordination } from 'src/organization/coordination/entities/coordination.entity';
import { Country } from 'src/organization/country/entities/country.entity'; 
import { Position } from 'src/organization/positions/entities/position.entity'; 
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'area' })
export class Area {
  @PrimaryGeneratedColumn('uuid', { name: 'area_id' })
  areaId: string;

  @Column({ name: 'area_name', length: 100 })
  areaName: string;


  @Column({ name: 'country_code', nullable: true })
  countryCode: string;

  // --- Relaciones ---

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country: Country;

  @OneToMany(() => Position, (position) => position.area)
  positions: Position[];

  @OneToMany(() => Coordination, (coordination) => coordination.area)
  coordinations: Coordination[];
}