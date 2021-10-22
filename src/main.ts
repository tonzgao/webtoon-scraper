import { Command } from 'commander';
import {scrape} from './worker'

const program = new Command();
program.requiredOption('-u, --url <url>', 'url to scrape')
program.parse(process.argv);

const options = program.opts();
scrape(program.url, options);