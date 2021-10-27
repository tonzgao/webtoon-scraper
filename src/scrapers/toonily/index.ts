import { range } from 'lodash';
import { ElementHandle } from 'playwright'

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

  protected async *scrapeLinks() {
    const getImages = async () => await this.page.$$('.wp-manga-chapter-img')

    const pollSource = async (n: number) => {
      const images = await getImages();
      const image = images[n] as ElementHandle<HTMLImageElement>
      const loaded = await image.evaluate((el) => {
        const source = el.src
        el.scrollIntoView()
        return Boolean(source);
      })
      if (!loaded) {
        await this.wait(100);
      }
      return image;
    }

    for (const i of range((await getImages()).length)) {
      const result = await runTimeout(1000, () => pollSource(i))
      yield {
        image: result,
        number: i + 1,
      };
    }
  }

  protected async scrapeChapter(url: string, name: {
    series: string,
    chapter: number
  }): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
    for await (const link of this.scrapeLinks()) {
      const { image, number } = link
      const path = this.fileHandler.generateFileName({
        ...name,
        number,
        extension: 'png'
      })
      await this.fileHandler.screenshot(image, path)
    }
  }
}

const scraper = {
  scraper: Toonily,
  matcher: isToonily,
}
export default scraper;