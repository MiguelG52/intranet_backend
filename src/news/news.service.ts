import { Injectable, Logger, Inject } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { Cron } from '@nestjs/schedule';
import { RssService } from '../rss/rss.service';
import { CybersecurityFeeds } from './enums/cybersecurity-feeds.enum';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { QueryParamsDto } from '../common/dto/query-params.dto';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly NEWS_CACHE_KEY = 'latest_cybersecurity_news';


  constructor(
    private readonly rssService: RssService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  create(createNewsDto: CreateNewsDto) {
    
  }

  async findAll(queryParams: QueryParamsDto) {
    const { page = 1, limit = 10, search = '' } = queryParams;
    
    let allNews: any[] | undefined= await this.cacheManager.get(this.NEWS_CACHE_KEY);
    
    if (!allNews) {
      this.logger.log('Caché vacía, ejecutando fetch manual...');
      allNews = await this.findNews();
    }

    if (!allNews) {
        return {
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0
            }
        };
    }

    // Filtrado por búsqueda
    let filteredNews = allNews;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNews = allNews.filter(item => 
        item.title?.toLowerCase().includes(searchLower) || 
        item.content?.toLowerCase().includes(searchLower)
      );
    }

    // Paginación
    const total = filteredNews.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredNews.slice(startIndex, endIndex);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  @Cron('0 */30 9-17 * * *',{
    name: 'fetchNewsJob',
    timeZone: 'America/Mexico_City'
  })
  async findNews() {
    this.logger.log('Iniciando tarea de obtención de noticias de ciberseguridad...');
    const feeds = Object.values(CybersecurityFeeds);
    try {
      const news = await this.rssService.parseRssFeed(feeds);
      
      if (news && news.length > 0) {
        // Guardamos en caché
        await this.cacheManager.set(this.NEWS_CACHE_KEY, news);
        this.logger.log(`Se han obtenido y cacheado ${news.length} noticias.`);
      }
      
      return news;
    } catch (error) {
      this.logger.error('Error al obtener noticias', error);
    }
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
