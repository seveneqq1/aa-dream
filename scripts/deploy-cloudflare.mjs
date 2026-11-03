import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const configPath = 'wrangler.cloudflare.json';
const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (config.d1_databases.some(database => !database.database_id || database.database_id === '00000000-0000-4000-8000-000000000000')) {
  throw new Error('Create the aa-dream-orders D1 database and set database_id in wrangler.cloudflare.json before deploying.');
}
const wrangler = './node_modules/wrangler/bin/wrangler.js';
for (const args of [
  [wrangler, 'd1', 'migrations', 'apply', 'DB', '--remote', '--config', configPath],
  [wrangler, 'deploy', '--config', configPath],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
