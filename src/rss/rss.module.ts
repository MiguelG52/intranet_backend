import { Module } from '@nestjs/common';
import { RssService } from './rss.service';

@Module({

  exports: [RssService],
  providers: [RssService]
})
export class RssModule {}
