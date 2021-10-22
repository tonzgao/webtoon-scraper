import {HeadlessScraper} from '../common'

export const isToonily = (url: string) => {
    // match regex
    return true;
}

export class Toonily extends HeadlessScraper {

  protected listChapters(url: string): Promise<string[]> {
      throw new Error('TODO')
  }

  protected scrapeChapter(url: string): Promise<Buffer[]> {
      throw new Error('TODO')
  }
}

const scraper = {
    scraper: Toonily,
    matcher: isToonily,
}
export default scraper;