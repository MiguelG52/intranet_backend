import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { RssModule } from '../rss/rss.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    RssModule,
    CacheModule.register()
  ],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
