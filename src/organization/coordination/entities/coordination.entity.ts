import { Methodology } from 'src/organization/methodology/entities/methodology.entity';
import { AreaCoordination } from './area-coordination.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('coordination')
export class Coordination {
  @PrimaryGeneratedColumn('uuid', { name: 'coordination_id' })
  coordinationId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relación: Una Coordinación puede estar en muchas Áreas (Many-to-Many)
  @OneToMany(() => AreaCoordination, (areaCoordination) => areaCoordination.coordination)
  areaCoordinations: AreaCoordination[];

  // Relación: Una Coordinación tiene muchas Metodologías
  @OneToMany(() => Methodology, (methodology) => methodology.coordination)
  methodologies: Methodology[];
}