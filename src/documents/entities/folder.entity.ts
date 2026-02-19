import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('folder')
export class Folder {
  @PrimaryColumn({
    type: 'uuid',
    name: 'folder_id',
    default: () => 'gen_random_uuid()',
  })
  folderId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => Folder, (folder) => folder.subfolders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parentFolder: Folder;

  @OneToMany(() => Folder, (folder) => folder.parentFolder)
  subfolders: Folder[];
}
