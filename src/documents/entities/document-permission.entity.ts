import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Document } from './document.entity';
import { Role } from '../../role/entities/role.entity';
import { Country } from '../../organization/country/entities/country.entity';

@Entity('document_permission')
export class DocumentPermission {
  @PrimaryColumn({
    type: 'uuid',
    name: 'permission_id',
    default: () => 'gen_random_uuid()',
  })
  permissionId: string;

  @Column({ name: 'doc_id', type: 'uuid', nullable: true })
  docId: string;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string;

  @Column({ name: 'country_code', type: 'varchar', length: 10, nullable: true })
  countryCode: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doc_id' })
  document: Document;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Country, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'country_code', referencedColumnName: 'code' })
  country: Country;
}
