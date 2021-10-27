import Bottleneck from 'bottleneck';
import { mapSeries, wait, setRateLimits, runTimeout } from '../../helpers'

import { FileHandler } from './files'
import { FileInfo, ScraperOptions } from '.'


export abstract class BaseScraper {
  // Attach helpers
  wait = wait;
  runTimeout = runTimeout;
  mapSeries = mapSeries;

  options: ScraperOptions;
  fileHandler: FileHandler;
  limiter: Bottleneck;

  constructor(options: ScraperOptions) {
    this.options = options;
    this.fileHandler = new FileHandler(options);
    this.limiter = setRateLimits(options);
  }

  // Check if chapter is in scope
  private skipChapter(counter: number) {
    const chapter = counter + 1;
    return chapter < this.options.minChapter || chapter > this.options.maxChapter
  }

  // Scrape chapters
  public async scrapeAll(url: string) {
    const { series, chapters } = await this.scrapeMeta(url);
    await mapSeries(chapters, async (url, chapter) => {
      if (this.skipChapter(chapter)) {
        console.debug(`Skipping chapter ${chapter}`)
        return;
      }
      await this.limiter.schedule(() => this.scrapeChapter(url, {
        series, chapter
      }))
    })
  }

  protected abstract scrapeMeta(url: string): Promise<{ series: string, chapters: string[] }>

  protected abstract scrapeChapter(url: string, name: FileInfo): Promise<void>
}