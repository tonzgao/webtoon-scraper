import path from 'path'

import { fileExists, writeFile, getFileType, mapSeries, wait, limiter, runTimeout } from '../../helpers'

interface FileInfo {
  series: string,
  chapter: number,
  number: number,
  extension?: string,
}

interface FileOptions extends Record<string, undefined | string | boolean> {
  path?: string;
  override?: boolean;
}

type ScraperOptions = FileOptions;

class FileHandler {
  options: FileOptions;

  constructor(options: FileOptions) {
    this.options = options
  }
  protected async getFileType(buffer: Buffer) {
    const extension = await getFileType(buffer);
    return extension
  }

  protected generateFileName(name: Required<FileInfo>): string {
    const basePath = this.options.path ?? __dirname;
    const fileName = path.join(basePath, name.series, `${name.chapter}_${name.number}.${name.extension}`);
    return fileName
  }

  protected async save(buffer: Buffer, name: string) {
    if (!this.options.override && await fileExists(name)) {
      return
    }
    return await writeFile(name, buffer);
  }
}

export abstract class BaseScraper {
  // Attach helpers
  wait = wait;
  runTimeout = runTimeout;
  limiter = limiter;
  mapSeries = mapSeries;

  options: ScraperOptions;
  fileHandler: FileHandler;

  constructor(options: ScraperOptions) {
    this.options = options;
    this.fileHandler = new FileHandler(options);
  }

  public async scrapeAll(url: string) {
    const { series, chapters } = await this.scrapeMeta(url);
    await mapSeries(chapters, async (url, chapter) => {
      const files = await this.limiter.schedule(() => this.scrapeChapter(url))
      // await mapSeries(files, async (file, number) => {
      //   await this.save(file, {
      //     series,
      //     chapter,
      //     number,
      //   })
      // })
      // throw new Error('test')
    })
  }

  protected abstract scrapeMeta(url: string): Promise<{ series: string, chapters: string[] }>

  protected abstract scrapeChapter(url: string): Promise<Buffer[]>
}