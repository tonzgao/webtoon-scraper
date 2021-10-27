import fetch from 'cross-fetch';
import { filter } from 'lodash';
import { runTimeout } from '../../helpers';

import { HeadlessScraper } from '../common'

export const isToonily = (url: string) => {
  // match regex
  return true;
}

export class Toonily extends HeadlessScraper {

  protected async scrapeMeta(url: string): Promise<{
    series: string, chapters: string[]
  }> {
    await this.page.goto(url, { waitUntil: 'load' })
    await this.click('.btn-adult-confirm', { require: false })
    await this.page.waitForSelector('.post-title');
    const title = await this.page.$eval('.post-title', el => el.textContent) as string;
    const chapters = await this.page.$$eval('.wp-manga-chapter a', els => els.map(a => (a as any).href))
    return {
      series: title.trim(),
      chapters: chapters.reverse(),
    }
  }

  protected async scrapeFile(src: string) {
    const response = await fetch(src)
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  }

  protected async scrapeLinks() {
    const pollSources = async () => {
      while (true) {
        const { sources, missing } = await this.page.evaluate<{
          sources: string[],
          missing: boolean
        }>(() => {
          const els = Array.from(document.querySelectorAll('.wp-manga-chapter-img'))
          const sources = els.map(img => (img as any).src) as string[]
          const missing = els.find(img => !(img as any).src)
          if (missing) {
            missing.scrollIntoView();
          }
          return { sources, missing: Boolean(missing) }
        })
        if (!missing) {
          return sources;
        }
        await this.wait(100);
      }
    }
    return runTimeout(30 * 1000, pollSources)
  }

  protected async scrapeChapter(url: string): Promise<Buffer[]> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
    const links = await this.scrapeLinks();
    // TODO: yield links
    const files = await this.mapSeries(links, async link => await this.scrapeFile(link))
    return files;
  }
}

const scraper = {
  scraper: Toonily,
  matcher: isToonily,
}
export default scraper;