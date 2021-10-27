import * as path from 'path'
import { ElementHandle } from 'playwright'

import { fileExists, writeFile, getFileType, padNumber, escapeTitle, mapSeries, wait, limiter, runTimeout } from '../../helpers'

interface FileInfo {
  series: string,
  chapter: number,
  number?: number,
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
  public async getFileType(buffer: Buffer) {
    const extension = await getFileType(buffer);
    return extension
  }

  public generateFileName(name: Required<FileInfo>): string {
    const basePath = this.options.path ?? __dirname;
    const fileName = path.join(basePath, escapeTitle(name.series), `${padNumber(name.chapter, 3)}_${padNumber(name.number)}.${name.extension}`);
    return fileName
  }

  private async fileExists(name: string) {
    return !this.options.override && await fileExists(name)
  }

  public async save(buffer: Buffer, name: string) {
    if (await this.fileExists(name)) {
      return
    }
    return await writeFile(name, buffer);
  }

  public async screenshot(image: ElementHandle<HTMLImageElement>, name: string) {
    if (await this.fileExists(name)) {
      return
    }
    return await image.screenshot({
      path: name
    })
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
      await this.limiter.schedule(() => this.scrapeChapter(url, {
        series, chapter
      }))
      throw new Error('TODO')
    })
  }

  protected abstract scrapeMeta(url: string): Promise<{ series: string, chapters: string[] }>

  protected abstract scrapeChapter(url: string, name: FileInfo): Promise<void>
}