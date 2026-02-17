import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { FormAssignment } from './form-assignment.entity';
import { FormAnswer } from './form-answer.entity';

@Entity('form_response')
@Index('idx_form_response_assignment', ['assignmentId'])
export class FormResponse {
  @PrimaryColumn({
    type: 'uuid',
    name: 'response_id',
    default: () => 'gen_random_uuid()',
  })
  responseId: string;

  @Column({ name: 'assignment_id', type: 'uuid', nullable: true })
  assignmentId: string;

  @Column({
    name: 'submitted_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  submittedAt: Date;

  @ManyToOne(() => FormAssignment, (assignment) => assignment.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assignment_id' })
  assignment: FormAssignment;

  @OneToMany(() => FormAnswer, (answer) => answer.response)
  answers: FormAnswer[];
}
