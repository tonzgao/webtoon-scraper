import * as path from 'path'

import { fileExists, writeFile, getFileType, padNumber, escapeTitle } from '../../helpers'

import { FileOptions, FileInfo } from '.'

export class FileHandler {
  options: FileOptions;

  constructor(options: FileOptions) {
    this.options = options
  }

  // Get buffer file type
  public async getFileType(buffer: Buffer) {
    const extension = await getFileType(buffer);
    return extension
  }

  // Generate file name from options and state
  public generateFileName(name: Required<FileInfo>): string {
    const basePath = this.options.path ?? __dirname;
    const fileName = path.join(basePath, escapeTitle(name.series), `${padNumber(name.chapter + 1, 3)}_${padNumber(name.number + 1)}.${name.extension}`);
    return fileName
  }

  // Check if file already exists
  public async fileExists(name: string) {
    return !this.options.override && await fileExists(name)
  }

  // Save buffer to disk
  public async save(buffer: Buffer, name: string) {
    if (await this.fileExists(name)) {
      return
    }
    return await writeFile(name, buffer);
  }
}
