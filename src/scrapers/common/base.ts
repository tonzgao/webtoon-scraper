import {mapSeries} from '../../helpers'

export abstract class BaseScraper {
  public async scrapeAll(url: string) {
    const chapters = await this.listChapters(url);
    await mapSeries(chapters, async (url, chapter) => {
      const files = await this.scrapeChapter(url)
      await mapSeries(files, async (file, i) => {
        await this.save(file, chapter, i)
      })
    })
  }

  protected abstract listChapters(url: string): Promise<string[]>

  protected abstract scrapeChapter(url: string): Promise<Buffer[]>

  protected async save(buffer: Buffer, chapter: number, file: number) {
    // TODO
  }
}