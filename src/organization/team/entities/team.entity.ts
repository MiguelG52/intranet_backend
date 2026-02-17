import { Methodology } from 'src/organization/methodology/entities/methodology.entity';
import { UserFunctionalAssignment } from 'src/users/entities/user-functional-assigment.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
@Entity('team')
export class Team {
  @PrimaryGeneratedColumn('uuid', { name: 'team_id' })
  teamId: string;

  @Column({ name: 'methodology_id', type: 'uuid' })
  methodologyId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relación: Pertenece a una Metodología
  @ManyToOne(() => Methodology, (methodology) => methodology.teams, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'methodology_id' })
  methodology: Methodology;

  // Relación: Usuarios asignados a este equipo 
  @OneToMany(() => UserFunctionalAssignment, (assignment) => assignment.team)
  assignments: UserFunctionalAssignment[];
}