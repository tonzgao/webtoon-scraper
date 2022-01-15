import Template from '../common/template'

const titleElement = '.widget-title';
const chapterElement = '.chapter-title-rtl a'
const imageElement = '#all img'

export const isManhwas = (url: string) => {
  return url.includes('manhwas.men')
}

export class Manhwas extends Template {
  elements = {
    title: titleElement,
    chapter: chapterElement,
    image: imageElement,
  }
}

const scraper = {
  scraper: Manhwas,
  matcher: isManhwas,
}
export default scraper;