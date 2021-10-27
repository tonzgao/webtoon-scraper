import * as fs from 'fs'
import * as FileType from 'file-type'

// Check if file already exists in the directory
export const fileExists = async path => !!(await fs.promises.stat(path).catch(_ => false));

// Write file to the directory
export const writeFile = async (file: string, buffer: Buffer | string) => fs.writeFileSync(file, buffer);

// Identify file type from buffer
export const getFileType = async (file: Buffer) => {
  const result = await FileType.fromBuffer(file);
  if (!result) {
    throw new Error('Could not identify file type')
  }
  return result.ext as string;
}

// Pad number with leading zeros
export const padNumber = (input: number, pad = 2) => {
  return String(input).padStart(pad, '0')
}

// Get folder name from series title
export const escapeTitle = (input: string) => {
  return input.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}
