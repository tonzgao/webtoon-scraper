// TODO: consider converting to interface
export abstract class BaseScraper {
  public async scrapeAll(url: string) {
    throw new Error('TODO')
  }

  protected async scrapeChapter(url: string, chapter: number) {
    // TODO
  }

  protected async save(chapter: number, file: number) {
    // TODO
  }
}