import { range } from 'lodash';
import { ElementHandle } from 'playwright'

import { runTimeout } from '../../helpers';

import { HeadlessScraper } from '../common'

export default class Template extends HeadlessScraper {
  elements: Record<string, string>

  protected async closePopup(): Promise<void> {
    if (!this.elements.popupClose) {
      return;
    }
    await this.click(this.elements.popupClose, { require: false })
  }

  // Scrape series title and chapter urls
  protected async scrapeMeta(url: string): Promise<{
    series: string, chapters: string[]
  }> {
    await this.page.goto(url, { waitUntil: 'load' })
    await this.closePopup();
    await this.page.waitForSelector(this.elements.title, { timeout: 60000 });
    const title = await this.page.$eval(this.elements.title, el => el.textContent) as string;
    const chapters = await this.page.$$eval(this.elements.chapter, els => els.map(a => (a as HTMLAnchorElement).href))
    return {
      series: title.trim(),
      chapters: chapters.reverse(),
    }
  }

  // Get all image elements
  private async getImages() {
    return await this.page.$$(this.elements.image)
  }

  // Check if src is loaded from specified image element
  private async getSource(n: number) {
    const images = await this.getImages();
    const image = images[n] as ElementHandle<HTMLImageElement>
    // Check that image is loaded
    const loaded = await image.evaluate((el) => {
      const source = el.src
      el.scrollIntoView()
      return Boolean(source);
    })
    if (!loaded) {
      await this.wait(100);
    }
    // Check that scrolling to image has not loaded other images and hidden the desired one
    try {
      await image.scrollIntoViewIfNeeded({ timeout: 100 });
    } catch (e) {
      return
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
  private async scrapeLink(n: number, name: {
    series: string, chapter: number
  }) {
    // Check if file already exists
    const fileName = this.fileHandler.generateFileName({
      ...name,
      number: n,
      extension: 'png'
    })
    if (await this.fileHandler.fileExists(fileName)) {
      return {
        fileName
      }
    }

    // Pull file
    try {
      const result = await runTimeout(this.options.timeout ?? 1000, () => this.pollSource(n))
      return {
        image: result,
        fileName,
      };
    } catch (e) {
      if (this.options.strict) {
        throw e
      }
      console.debug(e)
      return {
        fileName,
      }
    }
  }

  // Scrape a single chapter
  protected async scrapeChapter(url: string, name: {
    series: string,
    chapter: number
  }): Promise<void> {
    console.debug(`Scraping chapter ${name.chapter + 1}`)
    await this.page.goto(url, { waitUntil: 'networkidle' });
    for (const i of range((await this.getImages()).length)) {
      const { image, fileName } = await this.scrapeLink(i, name);
      if (!image) {
        continue;
      }
      await this.screenshot(image, fileName)
    }
  }
}