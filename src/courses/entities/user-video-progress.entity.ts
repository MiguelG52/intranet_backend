import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn, Index } from 'typeorm';
import { Video } from './video.entity';
import { User } from '../../users/entities/user.entity';

@Entity('user_video_progress')
@Index(['userId', 'videoId'], { unique: true })
export class UserVideoProgress {
  @PrimaryGeneratedColumn('uuid', { name: 'progress_id' })
  progressId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'video_id', type: 'uuid' })
  videoId: string;

  @Column({
    name: 'seconds_watched',
    type: 'int',
    default: 0,
  })
  secondsWatched: number;

  @Column({
    name: 'is_watched',
    type: 'boolean',
    default: false,
  })
  isWatched: boolean;

  @UpdateDateColumn({
    name: 'last_watched_at',
    type: 'timestamp with time zone',
  })
  lastWatchedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Video, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video: Video;
}
