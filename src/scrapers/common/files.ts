import * as path from 'path'
import { ElementHandle } from 'playwright'

import { fileExists, writeFile, getFileType, padNumber, escapeTitle } from '../../helpers'

import { FileOptions, FileInfo } from '.'

export class FileHandler {
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
    const fileName = path.join(basePath, escapeTitle(name.series), `${padNumber(name.chapter + 1, 3)}_${padNumber(name.number + 1)}.${name.extension}`);
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
    console.debug(`Saving ${name}`)
    return await image.screenshot({
      path: name
    })
  }
}
