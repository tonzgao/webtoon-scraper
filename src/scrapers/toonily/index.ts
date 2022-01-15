import Template from '../common/template'

const popupCloseElement = '.btn-adult-confirm'
const titleElement = '.post-title';
const chapterElement = '.wp-manga-chapter a'
const imageElement = '.wp-manga-chapter-img'

export const isToonily = (url: string) => {
  return url.includes('toonily.com') ||
    url.includes('toonily.net') ||
    url.includes('hiperdex.com') ||
    url.includes('webtoon.xyz') ||
    url.includes('skymanga.co')
}

export class Toonily extends Template {
  elements = {
    popupClose: popupCloseElement,
    title: titleElement,
    chapter: chapterElement,
    image: imageElement,
  }
}

const scraper = {
  scraper: Toonily,
  matcher: isToonily,
}
export default scraper;