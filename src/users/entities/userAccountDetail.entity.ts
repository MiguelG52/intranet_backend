import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User} from './user.entity';

@Entity({ name: 'user_account_detail' })
export class UserAccountDetail {
  @PrimaryGeneratedColumn('uuid', { name: 'user_account_detail_id' })
  userAccountDetailId: string;

  @Column({ name: 'ms_teams_id', type: 'varchar', length: 100, nullable: true })
  msTeamsId: string;

  @Column({ name: 'profile_picture', type: 'varchar', length: 255, nullable: true })
  profilePicture: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20, nullable: true })
  phoneNumber: string;


  @Column({ type: 'date', nullable: true })
  birthdate: Date;

  
  @Column({ name: 'user_account_id' })
  userAccountId: string;

  @OneToOne(() => User, (user) => user.userDetail, { onDelete: 'CASCADE', orphanedRowAction: 'delete' })
  @JoinColumn({ name: 'user_account_id' })
  userAccount: User;

}