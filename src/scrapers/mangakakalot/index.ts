import Template from '../common/template'

const titleElement = '.story-info-right h1';
const chapterElement = 'a.chapter-name'
const imageElement = '.container-chapter-reader img'

export const isMangakakalot = (url: string) => {
  return url.includes('mangakakalot.com') ||
    url.includes('manganelo.com') ||
    url.includes('manganato.com')
}

export class Mangakakalot extends Template {
  elements = {
    title: titleElement,
    chapter: chapterElement,
    image: imageElement,
  }
}

const scraper = {
  scraper: Mangakakalot,
  matcher: isMangakakalot,
}
export default scraper;