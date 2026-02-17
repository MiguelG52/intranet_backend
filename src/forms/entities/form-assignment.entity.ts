import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Form } from './form.entity';
import { User } from '../../users/entities/user.entity';
import { FormResponse } from './form-response.entity';

export enum FormContextType {
  COURSE = 'COURSE',
  GENERAL = 'GENERAL',
  EVENT = 'EVENT',
}

@Entity('form_assignment')
export class FormAssignment {
  @PrimaryGeneratedColumn('uuid', { name: 'assignment_id' })
  assignmentId: string;

  @Column({ name: 'form_id', type: 'uuid' })
  formId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'schedule_date', type: 'date', nullable: true })
  scheduleDate: Date;

  // --- CAMPOS PARA VINCULAR CON CONTEXTOS (ej: Cursos) ---
  @Column({ 
    name: 'context_type', 
    type: 'varchar', 
    length: 50, 
    nullable: true,
    comment: 'Tipo de contexto: COURSE, EVENT, GENERAL'
  })
  contextType: FormContextType;

  @Column({ 
    name: 'context_id', 
    type: 'uuid', 
    nullable: true,
    comment: 'ID del contexto (course_id, event_id, etc.)'
  })
  contextId: string;
  // -------------------------------------------------------

  @ManyToOne(() => Form, (form) => form.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'form_id' })
  form: Form;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => FormResponse, (response) => response.assignment)
  responses: FormResponse[];
}
