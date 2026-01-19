import { Injectable } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class RssService {
    private parser: XMLParser;

    constructor() {
        this.parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            isArray: (name: string, jpath: string, isLeafNode: boolean, isAttribute: boolean) => {
                return ['item', 'entry', 'category', 'media:content', 'media:thumbnail', 'enclosure', 'link'].includes(name);
            }
        });
    }

    private extractImage(item: any): string | null {
        // Enclosure de RSS
        if (item.enclosure) {
            const enclosures = Array.isArray(item.enclosure) ? item.enclosure : [item.enclosure];
            const image = enclosures.find((e: any) => e['@_type']?.startsWith('image/'));
            if (image) return image['@_url'];
        }

        // Contenido Multimedia (Yahoo/MRSS)
        const mediaContent = item['media:content'] || (item['media:group']?.['media:content']);
        if (mediaContent) {
             const contents = Array.isArray(mediaContent) ? mediaContent : [mediaContent];
             const image = contents.find((m: any) => m['@_medium'] === 'image' || m['@_type']?.startsWith('image/'));
             if (image) return image['@_url'];
        }

        // Miniatura Multimedia
        const mediaThumbnail = item['media:thumbnail'] || (item['media:group']?.['media:thumbnail']);
        if (mediaThumbnail) {
            const thumbnails = Array.isArray(mediaThumbnail) ? mediaThumbnail : [mediaThumbnail];
            if (thumbnails.length > 0) return thumbnails[0]['@_url'];
        }

        // Enlace Atom con rel="enclosure"
        if (item.link) {
             const links = Array.isArray(item.link) ? item.link : [item.link];
             const image = links.find((l: any) => l['@_rel'] === 'enclosure' && l['@_type']?.startsWith('image/'));
             if (image) return image['@_href'];
        }

        // Análisis de contenido (alternativa)
        const content = item['content:encoded'] || item.description || item.content || '';
        if (typeof content === 'string') {
            const match = content.match(/<img[^>]+src="([^">]+)"/);
            if (match) return match[1];
        }
        
        return null;
    }

    normalizeData(rawItems: any[]): any[] {
        return rawItems.map(item => {
            const title = item.title || '';
            
            // Manejar Enlace
            let link = '';
            if (typeof item.link === 'string') {
                link = item.link;
            } else if (Array.isArray(item.link)) {
                // Atom usualmente tiene rel="alternate" para el enlace principal
                const alternate = item.link.find((l: any) => l['@_rel'] === 'alternate') || item.link[0];
                link = alternate['@_href'] || (typeof alternate === 'string' ? alternate : '');
            } else if (item.link && item.link['@_href']) {
                link = item.link['@_href'];
            }

            // Manejar Contenido
            let content = item['content:encoded'] || item.description || item.summary || item.content || '';
            if (typeof content !== 'string' && content['#text']) {
                content = content['#text'];
            }

            // Manejar Fecha
            const pubDateStr = item.pubDate || item.published || item.updated || new Date().toISOString();
            const pubDate = new Date(pubDateStr);

            const image = this.extractImage(item);

            return {
                title,
                link,
                content,
                pubDate,
                image,
                source: item.source || 'RSS Feed'
            };
        }).sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
    }

    async parseRssFeed(urls: string[]) {
        try {
            const parsedData = await Promise.all(
                urls.map(async (url) => {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) {
                            console.warn(`Failed to fetch RSS feed: ${url} - Status: ${response.status}`);
                            return null;
                        }
                        const xml = await response.text();
                        return this.parser.parse(xml);
                    } catch (e) {
                        console.error(`Error fetching RSS feed: ${url}`, e);
                        return null;
                    }
                })
            );

            const rawItems = parsedData.flatMap(data => {
                if (!data) return [];
                
                if (data.rss && data.rss.channel && data.rss.channel.item) {
                    // RSS Estándar
                    return data.rss.channel.item;
                } else if (data.feed && data.feed.entry) {
                    // Atom
                    return data.feed.entry;
                }
                return [];
            });

            return this.normalizeData(rawItems);

        } catch (error) {
            throw new Error(`Error fetching or parsing RSS feeds: ${error.message}`);
        }
    }
}