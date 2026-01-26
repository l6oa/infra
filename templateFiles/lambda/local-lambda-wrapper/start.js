import { run } from 'aws-lambda-ric';

await run(process.cwd(), 'index.handler');
