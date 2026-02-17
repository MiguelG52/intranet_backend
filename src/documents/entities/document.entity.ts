import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Folder } from './folder.entity';
import { DocumentPermission } from './document-permission.entity';

@Entity('document')
@Index('idx_document_folder', ['folderId'])
export class Document {
  @PrimaryColumn({
    type: 'uuid',
    name: 'doc_id',
    default: () => 'gen_random_uuid()',
  })
  docId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'uploaded_by', type: 'uuid', nullable: true })
  uploadedBy: string;

  @Column({ name: 'folder_id', type: 'uuid', nullable: true })
  folderId: string;

  @Column({ type: 'int', default: 1 })
  version: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @ManyToOne(() => Folder, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'folder_id' })
  folder: Folder;

  @OneToMany(() => DocumentPermission, (permission) => permission.document)
  permissions: DocumentPermission[];
}
