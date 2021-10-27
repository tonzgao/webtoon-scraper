export interface FileInfo {
  series: string,
  chapter: number,
  number?: number,
  extension?: string,
}

export interface FileOptions extends Record<string, any> {
  path?: string,
  override?: boolean,
}

export interface ScraperOptions extends FileOptions {
  debug?: boolean,
  strict?: boolean,
  minChapter: number,
  maxChapter: number,
  timeout: number,
};