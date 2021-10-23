import { Command } from 'commander';
import { scrape } from './worker'
import { setRateLimits } from './helpers'

const program = new Command();
program.requiredOption('-u, --url <url>', 'url to scrape')
program.parse(process.argv);

const options = program.opts();
setRateLimits(options);
scrape(program.url, options);