import { Area } from 'src/organization/areas/entities/area.entity';
import { Methodology } from 'src/organization/methodology/entities/methodology.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('coordination')
export class Coordination {
  @PrimaryGeneratedColumn('uuid', { name: 'coordination_id' })
  coordinationId: string;

  @Column({ name: 'area_id', type: 'uuid' })
  areaId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relación: Una Coordinación pertenece a un Área
  @ManyToOne(() => Area, (area) => area.coordinations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  // Relación: Una Coordinación tiene muchas Metodologías
  @OneToMany(() => Methodology, (methodology) => methodology.coordination)
  methodologies: Methodology[];
}