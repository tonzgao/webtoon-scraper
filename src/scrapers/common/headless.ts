import {chromium, Browser, Page} from 'playwright'
import {BaseScraper} from './base'

// TODO: add stealth - see https://github.com/berstend/puppeteer-extra/issues/454

export abstract class HeadlessScraper extends BaseScraper {
  browser: Browser;
  page: Page;

  public async scrapeAll(url: string) {
    await this.start();
    try {
      await super.scrapeAll(url);
    } finally {
      await this.close();
    }   
  }

  // TODO: allow setting launch options
  protected async start() {
    this.browser = await chromium.launch({
      headless: false // TODO: remove depending on env
    });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
  }

  protected async close() {
    await this.browser.close();
  }
}