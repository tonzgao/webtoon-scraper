import {wait} from '../../helpers'

import {HeadlessScraper} from '../common'

export const isToonily = (url: string) => {
    // match regex
    return true;
}

export class Toonily extends HeadlessScraper {

  protected async listChapters(url: string): Promise<string[]> {
      await this.page.goto(url, {waitUntil: 'networkidle'})
      await wait(5000)
      throw new Error('TODO')
  }

  protected async scrapeChapter(url: string): Promise<Buffer[]> {
      throw new Error('TODO')
  }
}

const scraper = {
    scraper: Toonily,
    matcher: isToonily,
}
export default scraper;