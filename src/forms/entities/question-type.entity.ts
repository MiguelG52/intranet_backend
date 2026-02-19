import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { FormQuestion } from './form-question.entity';

@Entity('question_type')
export class QuestionType {
  @PrimaryColumn({
    type: 'uuid',
    name: 'type_id',
    default: () => 'gen_random_uuid()',
  })
  typeId: string;

  @Column({ name: 'type_name', type: 'varchar', length: 100, unique: true, nullable: true })
  typeName: string;

  @OneToMany(() => FormQuestion, (question) => question.questionType)
  questions: FormQuestion[];
}
