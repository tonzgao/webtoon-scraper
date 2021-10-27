import { Command } from 'commander';
import { scrape } from './worker'
import { setRateLimits } from './helpers'

const program = new Command();
program.requiredOption('-u, --url <url>', 'url to scrape')
program.option('-d, --debug')
program.option('-o, --path <path>')
program.option('-m, --minChapter <min>', 'minimum chapter number')
program.option('-M, --maxChapter <max>', 'maximum chapter number')
program.parse(process.argv);

const options = program.opts();
console.debug(`Options:`, options)
setRateLimits(options);
scrape(program.url, options);