import path from 'path'

import { fileExists, writeFile, getFileType, mapSeries, wait, limiter } from '../../helpers'

interface ScraperOptions extends Record<string, undefined | string | boolean> {
  path?: string;
  override?: boolean;
}

interface FileInfo {
  series: string,
  chapter: number,
  number: number,
  extension?: string,
}

export abstract class BaseScraper {
  options: ScraperOptions

  // Attach helpers
  wait = wait;
  limiter = limiter;

  public async scrapeAll(url: string, options: ScraperOptions = {}) {
    this.options = options;
    const { series, chapters } = await this.scrapeMeta(url);
    await mapSeries(chapters, async (url, chapter) => {
      const files = await this.limiter.schedule(() => this.scrapeChapter(url))
      await mapSeries(files, async (file, number) => {
        await this.save(file, {
          series,
          chapter,
          number,
        })
      })
    })
  }

  protected abstract scrapeMeta(url: string): Promise<{ series: string, chapters: string[] }>

  protected abstract scrapeChapter(url: string): Promise<Buffer[]>

  protected generateFileName(name: Required<FileInfo>): string {
    const basePath = this.options.path ?? __dirname;
    const fileName = path.join(basePath, name.series, `${name.chapter}_${name.number}.${name.extension}`);
    return fileName
  }

  protected async save(buffer: Buffer, name: FileInfo) {
    const extension = await getFileType(buffer);
    const fileName = this.generateFileName({
      ...name,
      extension,
    });
    if (!this.options.override && await fileExists(fileName)) {
      return
    }
    return await writeFile(fileName, buffer);
  }
}