import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { News } from "./news.entity";

@Entity("news_audience")
export class NewsAudience {
    @PrimaryColumn({ name: 'id', default: () => 'uuid_generate_v4()' })
    newsAudienceId: string;

    @Column({ name: 'news_id', type: 'uuid', nullable: false })
    newsId:string
    
    //delimiuta a noticia or su audiencia por código de país
    @Column({ name: 'country_code', type: 'varchar', length: 5, nullable: false })
    countryCode: string;

    @Column({ name: 'is_pinned', default: false })
    isPinned:boolean

    // --- Relaciones ---

    @ManyToOne(() => News, (news) => news.audiences, { 
        onDelete: 'CASCADE', 
        orphanedRowAction: 'delete'
    })
    @JoinColumn({ name: 'news_id' })
    news: News;
}