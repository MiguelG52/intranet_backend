import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Form } from './form.entity';
import { QuestionType } from './question-type.entity';
import { QuestionOption } from './question-option.entity';
import { FormAnswer } from './form-answer.entity';

@Entity('form_question')
export class FormQuestion {
  @PrimaryColumn({
    type: 'uuid',
    name: 'question_id',
    default: () => 'gen_random_uuid()',
  })
  questionId: string;

  @Column({ name: 'form_id', type: 'uuid', nullable: true })
  formId: string;

  @Column({ name: 'type_id', type: 'uuid', nullable: true })
  typeId: string;

  @Column({ name: 'question_text', type: 'text', nullable: true })
  questionText: string;

  @Column({ name: 'is_required', type: 'boolean', default: true })
  isRequired: boolean;

  @ManyToOne(() => Form, (form) => form.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @ManyToOne(() => QuestionType, (type) => type.questions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'type_id' })
  questionType: QuestionType;

  @OneToMany(() => QuestionOption, (option) => option.question)
  options: QuestionOption[];

  @OneToMany(() => FormAnswer, (answer) => answer.question)
  answers: FormAnswer[];
}
