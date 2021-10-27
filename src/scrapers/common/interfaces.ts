export interface FileInfo {
  series: string,
  chapter: number,
  number?: number,
  extension?: string,
}

export interface FileOptions extends Record<string, undefined | string | boolean | number> {
  path?: string;
  override?: boolean;
}

export interface ScraperOptions extends FileOptions {
  minChapter: number,
  maxChapter: number,
};