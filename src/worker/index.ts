import { find } from 'lodash'

import scrapers from '../scrapers'

const matchUrl = (url: string) => {
  const match = find(scrapers, s => s.matcher(url))
  if (!match) {
    throw new Error('Matching scraper for url not found!')
  }
  return match;
}

// TODO: allow multithreading
export const scrape = async (url: string, options: Record<string, string>) => {
  const match = matchUrl(url);
  const scraper = new match.scraper();
  return scraper.scrapeAll(url, options)
}