import * as fs from 'fs'
import * as FileType from 'file-type'

export const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));

export const writeFile = async (file: string, buffer: Buffer | string) => fs.writeFileSync(file, buffer);

export const getFileType = async (file: Buffer) => {
  const result = await FileType.fromBuffer(file);
  if (!result) {
    throw new Error('Could not identify file type')
  }
  return result.ext as string;
}

export const padNumber = (input: number, pad = 2) => {
  return String(input).padStart(pad, '0')
}

export const escapeTitle = (input: string) => {
  return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}