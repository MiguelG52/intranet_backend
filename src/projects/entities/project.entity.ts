import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UserProject } from './user-project.entity';

@Entity('project')
@Index('idx_project_creator', ['createdBy'])
export class Project {
  @PrimaryColumn({
    type: 'uuid',
    name: 'project_id',
    default: () => 'gen_random_uuid()',
  })
  projectId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'source_system', type: 'varchar', length: 100, nullable: true })
  sourceSystem: string;

  @Column({ name: 'soho_id', type: 'varchar', length: 100, nullable: true })
  sohoId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => UserProject, (userProject) => userProject.project)
  userProjects: UserProject[];
}
