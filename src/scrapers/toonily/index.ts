import { range } from 'lodash';
import { ElementHandle } from 'playwright'

import { runTimeout } from '../../helpers';

import { HeadlessScraper } from '../common'

const titleElement = '.post-title';
const chapterElement = '.wp-manga-chapter a'
const imageElement = '.wp-manga-chapter-img'

export const isToonily = (url: string) => {
  // match regex
  return true;
}

export class Toonily extends HeadlessScraper {

  // Scrape series title and chapter urls
  protected async scrapeMeta(url: string): Promise<{
    series: string, chapters: string[]
  }> {
    await this.page.goto(url, { waitUntil: 'load' })
    await this.click('.btn-adult-confirm', { require: false })
    await this.page.waitForSelector(titleElement);
    const title = await this.page.$eval(titleElement, el => el.textContent) as string;
    const chapters = await this.page.$$eval(chapterElement, els => els.map(a => (a as HTMLAnchorElement).href))
    return {
      series: title.trim(),
      chapters: chapters.reverse(),
    }
  }

  // Get all image elements
  private async getImages() {
    return await this.page.$$(imageElement)
  }

  // Check if src is loaded from specified image element
  private async getSource(n: number) {
    const images = await this.getImages();
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

  // Wait until src is loaded from image element
  private async pollSource(n: number) {
    let image = await this.getSource(n);
    while (!image) {
      image = await this.getSource(n);
    }
    return image;
  }

  // Scrape image in a chapter
  private async scrapeLink(n: number) {
    try {
      const result = await runTimeout(1000, () => this.pollSource(n))
      return {
        image: result,
        number: n,
      };
    } catch (e) {
      if (this.options.strict) {
        throw e
      }
      console.debug(e)
      return {
        image: undefined,
        number: n
      }
    }
  }

  // Scrape all images in a chapter
  protected async *scrapeLinks() {
    for (const i of range((await this.getImages()).length)) {
      yield await this.scrapeLink(i);
    }
  }

  // Scrape a single chapter
  protected async scrapeChapter(url: string, name: {
    series: string,
    chapter: number
  }): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
    for await (const link of this.scrapeLinks()) {
      const { image, number } = link
      if (!image) {
        continue;
      }
      const path = this.fileHandler.generateFileName({
        ...name,
        number,
        extension: 'png'
      })
      await this.screenshot(image, path)
    }
  }
}

const scraper = {
  scraper: Toonily,
  matcher: isToonily,
}
export default scraper;