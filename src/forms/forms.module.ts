import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { FormQuestion } from './entities/form-question.entity';
import { FormAnswer } from './entities/form-answer.entity';
import { FormAssignment } from './entities/form-assignment.entity';
import { FormResponse } from './entities/form-response.entity';
import { QuestionType } from './entities/question-type.entity';
import { QuestionOption } from './entities/question-option.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Form,
      FormQuestion,
      FormAnswer,
      FormAssignment,
      FormResponse,
      QuestionType,
      QuestionOption,
    ]),
  ],
})
export class FormsModule {}
