import { chromium, Browser, Page, ElementHandle } from 'playwright' // TODO: add relevant plugins with automation-extra: see https://github.com/berstend/puppeteer-extra/pull/303
import { PlaywrightBlocker } from '@cliqz/adblocker-playwright';
import fetch from 'cross-fetch'; // required 'fetch'

import { BaseScraper } from './base'

export abstract class HeadlessScraper extends BaseScraper {
  browser: Browser;
  page: Page;

  public async scrapeAll(url: string, options?: Record<string, string>) {
    await this.start(options);
    try {
      await super.scrapeAll(url);
    } finally {
      await this.close();
    }
  }

  // Start headless browser
  // TODO: allow setting more launch options
  protected async start(options: Record<string, string> = {}) {
    this.browser = await chromium.launch({
      channel: 'chrome',
      headless: !this.options.debug
    });

    // Update user agent
    const chromiumPage = await (await this.browser.newContext()).newPage()
    const originalUserAgent = await chromiumPage.evaluate(() => { return navigator.userAgent });
    await chromiumPage.close();
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

    // Add adblocker
    PlaywrightBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
      blocker.enableBlockingInPage(this.page);
    });
  }

  // Close headless browser
  protected async close() {
    await this.browser.close();
  }

  // Helper function to optionally click a selector
  protected async click(selector: string, args: { require?: boolean }) {
    if (!args.require) {
      const exists = await this.page.$(selector)
      if (!exists) {
        return
      }
    }
    await this.page.click(selector);
  }

  // Save html element to disk
  public async screenshot(image: ElementHandle<HTMLImageElement>, name: string) {
    if (await this.fileHandler.fileExists(name)) {
      return
    }
    console.debug(`Saving ${name}`)
    return await image.screenshot({
      path: name
    })
  }
}