import { Area } from 'src/areas/entities/area.entity';
import { UserPosition } from 'src/users/entities/user-position.entity'; 
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'position' })
export class Position {
  @PrimaryGeneratedColumn('uuid', { name: 'position_id' })
  positionId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ name: 'area_id', nullable: true })
  areaId: string;

  @Column({ name: 'manager_id', nullable: true })
  managerId: string;

  // --- Relaciones ---

  @ManyToOne(() => Area, (area) => area.positions)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  // Relación consigo misma para el mánager
  @ManyToOne(() => Position, (position) => position.subordinates, {
    nullable: true,
  })
  @JoinColumn({ name: 'manager_id' })
  manager: Position;

  // Inversa: quiénes le reportan
  @OneToMany(() => Position, (position) => position.manager)
  subordinates: Position[];

  // Usuarios que ocupan esta posición
  @OneToMany(() => UserPosition, (userPosition) => userPosition.position)
  userPositions: UserPosition[];


}