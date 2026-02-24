import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Methodology } from 'src/organization/methodology/entities/methodology.entity';
import { Team } from 'src/organization/team/entities/team.entity';

@Entity('user_functional_assignment')
export class UserFunctionalAssignment {
  @PrimaryGeneratedColumn('uuid', { name: 'assignment_id' })
  assignmentId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'methodology_id', type: 'uuid' })
  methodologyId: string;

  @Column({ name: 'team_id', type: 'uuid', nullable: true })
  teamId: string | null;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  // Relación: Pertenece a un Usuario
  @ManyToOne(() => User, (user) => user.functionalAssignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación: Pertenece a una Metodología (Obligatoria para definir la rama del árbol)
  @ManyToOne(() => Methodology, (methodology) => methodology.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'methodology_id' })
  methodology: Methodology;

  @ManyToOne(() => Team, (team) => team.assignments, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}