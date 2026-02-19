import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FormQuestion } from './form-question.entity';

@Entity('question_option')
export class QuestionOption {
  @PrimaryColumn({
    type: 'uuid',
    name: 'option_id',
    default: () => 'gen_random_uuid()',
  })
  optionId: string;

  @Column({ name: 'question_id', type: 'uuid', nullable: true })
  questionId: string;

  @Column({ name: 'option_text', type: 'varchar', length: 200, nullable: true })
  optionText: string;

  @ManyToOne(() => FormQuestion, (question) => question.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: FormQuestion;
}
