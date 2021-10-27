import { find } from 'lodash'

import scrapers, { ScraperOptions } from '../scrapers'

// Determine which scraper to use from url
const matchUrl = (url: string) => {
  const match = find(scrapers, s => s.matcher(url))
  if (!match) {
    throw new Error('Matching scraper for url not found!')
  }
  return match;
}

const parseScraperOptions = (options: Record<string, any>) => {
  const minChapter = options.minChapter ? Number(options.minChapter) : 0;
  const maxChapter = options.maxChapter ? Number(options.maxChapter) : Infinity;
  return {
    ...options,
    minChapter,
    maxChapter
  } as ScraperOptions;
}

// Run scraper
// TODO: allow multithreading
export const scrape = async (url: string, options: Record<string, any>) => {
  const match = matchUrl(url);
  const scraper = new match.scraper(parseScraperOptions(options));
  return scraper.scrapeAll(url)
}