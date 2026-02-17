import { Coordination } from 'src/organization/coordination/entities/coordination.entity';
import { Team } from 'src/organization/team/entities/team.entity';
import { UserFunctionalAssignment } from 'src/users/entities/user-functional-assigment.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('methodology')
export class Methodology {
  @PrimaryGeneratedColumn('uuid', { name: 'methodology_id' })
  methodologyId: string;

  @Column({ name: 'coordination_id', type: 'uuid' })
  coordinationId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Coordination, (coordination) => coordination.methodologies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coordination_id' })
  coordination: Coordination;

  @OneToMany(() => Team, (team) => team.methodology)
  teams: Team[];

  @OneToMany(() => UserFunctionalAssignment, (assignment) => assignment.methodology)
  assignments: UserFunctionalAssignment[];
}