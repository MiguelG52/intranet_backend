import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";
import { NewsAudience } from "./news-audience.entity";

@Entity('news')
export class News {
    @PrimaryColumn({ name: 'news_id', default: () => 'uuid_generate_v4()' }) 
    newsId:string
    @Column({name:'author_id', type:'uuid', nullable:false})
    authorId:string
    @Column({name:'title', type:'varchar', length:255, nullable:false})
    title
    @Column({name:'content', type:'text', nullable:false})
    content
    @Column({name:'image_url', type:'varchar', length:500, nullable:true})
    imageUrl
    @Column({name:'publish_date', type:'timestamp with time zone', default:()=>'CURRENT_TIMESTAMP'})
    publish_date


     // --- Relaciones ---

    @ManyToOne(() => User, (user) => user.news)
    @JoinColumn({ name: 'author_id' })
    author: User;

    @OneToMany(() => NewsAudience, (audience) => audience.news, { 
        cascade: true, 
        eager: false   
    })
    audiences: NewsAudience[];
}
