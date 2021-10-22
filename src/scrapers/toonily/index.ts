import {HeadlessScraper} from '../common'

export const isToonily = (url: string) => {
    // match regex
    return true;
}

export class Toonily extends HeadlessScraper {
    
}

const scraper = {
    scraper: Toonily,
    matcher: isToonily,
}
export default scraper;