import playwright from 'playwright'
import {BaseScraper} from './base'

// TODO: add stealth - see https://github.com/berstend/puppeteer-extra/issues/454

export class HeadlessScraper extends BaseScraper {
    browser: playwright.Browser;
    page: playwright.Page;

    public async start() {
        this.browser = await playwright.chromium.launch();
        const context = await this.browser.newContext();
        this.page = await context.newPage();
    }

    public async close() {
        await this.browser.close();
    }
}