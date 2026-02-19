import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { FormQuestion } from './form-question.entity';
import { FormAssignment } from './form-assignment.entity';

@Entity('form')
export class Form {
  @PrimaryColumn({
    type: 'uuid',
    name: 'form_id',
    default: () => 'gen_random_uuid()',
  })
  formId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => FormQuestion, (question) => question.form)
  questions: FormQuestion[];

  @OneToMany(() => FormAssignment, (assignment) => assignment.form)
  assignments: FormAssignment[];
}
