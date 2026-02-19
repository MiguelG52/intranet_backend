import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Area } from 'src/organization/areas/entities/area.entity';
import { Coordination } from './coordination.entity';

@Entity('area_coordination')
export class AreaCoordination {
  @PrimaryGeneratedColumn('uuid', { name: 'area_coordination_id' })
  areaCoordinationId: string;

  @Column({ name: 'area_id', type: 'uuid' })
  areaId: string;

  @Column({ name: 'coordination_id', type: 'uuid' })
  coordinationId: string;

  @ManyToOne(() => Area, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @ManyToOne(() => Coordination, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coordination_id' })
  coordination: Coordination;
}
