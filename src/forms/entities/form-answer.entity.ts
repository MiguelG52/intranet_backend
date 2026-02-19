import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FormResponse } from './form-response.entity';
import { FormQuestion } from './form-question.entity';

@Entity('form_answer')
export class FormAnswer {
  @PrimaryColumn({
    type: 'uuid',
    name: 'answer_id',
    default: () => 'gen_random_uuid()',
  })
  answerId: string;

  @Column({ name: 'response_id', type: 'uuid', nullable: true })
  responseId: string;

  @Column({ name: 'question_id', type: 'uuid', nullable: true })
  questionId: string;

  @Column({ name: 'answer_value', type: 'text', nullable: true })
  answerValue: string;

  @ManyToOne(() => FormResponse, (response) => response.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'response_id' })
  response: FormResponse;

  @ManyToOne(() => FormQuestion, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: FormQuestion;
}
