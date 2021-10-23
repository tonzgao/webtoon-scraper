import { chromium, Browser, Page } from 'playwright' // TODO: add relevant plugins with automation-extra: see https://github.com/berstend/puppeteer-extra/pull/303
import { BaseScraper } from './base'

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
      channel: 'chrome',
      headless: false // TODO: remove depending on env
    });

    // Update user agent
    const page = await (await this.browser.newContext()).newPage()
    const originalUserAgent = await page.evaluate(() => { return navigator.userAgent });
    await page.close();
    const browserContext = await this.browser.newContext({
      userAgent: originalUserAgent.replace("Headless", ""),
    });
    this.page = await browserContext.newPage();

    // Add evasions: see https://github.com/berstend/puppeteer-extra/issues/454
    const enabledEvasions = [
      'chrome.app',
      'chrome.csi',
      'chrome.loadTimes',
      'chrome.runtime',
      'iframe.contentWindow',
      'media.codecs',
      'navigator.hardwareConcurrency',
      'navigator.languages',
      'navigator.permissions',
      'navigator.plugins',
      'navigator.webdriver',
      'sourceurl',
      // 'user-agent-override', // doesn't work since playwright has no page.browser()
      'webgl.vendor',
      'window.outerdimensions'
    ];
    // eslint-disable-next-line
    // @ts-ignore
    const evasions = enabledEvasions.map(e => new require(`puppeteer-extra-plugin-stealth/evasions/${e}`));
    const stealth = {
      callbacks: [] as any[],
      async evaluateOnNewDocument(...args) {
        this.callbacks.push({ cb: args[0], a: args[1] })
      }
    }
    evasions.forEach(e => e().onPageCreated(stealth));
    for (const evasion of stealth.callbacks) {
      await browserContext.addInitScript(evasion.cb, evasion.a);
    }
  }

  protected async close() {
    await this.browser.close();
  }
}