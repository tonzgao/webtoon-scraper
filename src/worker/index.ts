import find from 'lodash/find'
import scrapers from '../scrapers'

// TODO: allow multithreading
export const scrape = async (url: string) => {
  const match = find(scrapers, s => s.matcher(url))
  const scraper = new match.scraper();
  return scraper.scrapeAll(url)
}