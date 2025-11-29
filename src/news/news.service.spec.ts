import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { RssService } from '../rss/rss.service';
import { CybersecurityFeeds } from './enums/cybersecurity-feeds.enum';

describe('NewsService', () => {
  let service: NewsService;
  let rssService: RssService;

  const mockRssService = {
    parseRssFeed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: RssService,
          useValue: mockRssService,
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    rssService = module.get<RssService>(RssService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNews', () => {
    it('should fetch news from cybersecurity feeds', async () => {
      const mockNews = [{ title: 'Test News', link: 'http://clstest.com' }];
      mockRssService.parseRssFeed.mockResolvedValue(mockNews);

      const result = await service.findNews();

      expect(rssService.parseRssFeed).toHaveBeenCalledWith(Object.values(CybersecurityFeeds));
      expect(result).toEqual(mockNews);
    });

    it('should handle errors when fetching news', async () => {
      const error = new Error('Fetch error');
      mockRssService.parseRssFeed.mockRejectedValue(error);
      
      const result = await service.findNews();
      
      expect(rssService.parseRssFeed).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });
});
