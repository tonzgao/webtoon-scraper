import { Command } from 'commander';
import { scrape } from './worker'

const program = new Command();
program.requiredOption('-u, --url <url>', 'url to scrape (required)')
program.option('-d, --debug (default false)')
program.option('-s, --strict', 'fail on error (default false)')
program.option('-o, --path <path>', 'output path')
program.option('-f, --override', 'override existing file with the same name (default false)')
program.option('-m, --minChapter <min>', 'minimum chapter number (1-based)')
program.option('-M, --maxChapter <max>', 'maximum chapter number')
program.option('-t, --timeout <ms>', 'timeout for any single file (site specific defaults)')
program.option('-r, --rateLimit <ms>', 'minimum delay between chapters (default 5000ms)')
program.parse(process.argv);
const options = program.opts();
console.debug(`Options:`, options)

scrape(program.url, options);