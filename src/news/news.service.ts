import { Injectable } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewsService {
  create(createNewsDto: CreateNewsDto) {
    
  }

  @Cron('0 */30 9-17 * * *',{
    name: 'fetchNewsJob',
    timeZone: 'America/Mexico_City'
  })
  findNews() {
    return `This action returns all news`;
  }

  findOne(id: number) {
    return `This action returns a #${id} news`;
  }

  update(id: number, updateNewsDto: UpdateNewsDto) {
    return `This action updates a #${id} news`;
  }

  remove(id: number) {
    return `This action removes a #${id} news`;
  }
}
