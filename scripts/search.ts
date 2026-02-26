// 搜索市场
// 用法: bun run scripts/search.ts <keyword> [--limit <n>]

import { api } from "./config";

async function search(keyword: string, limit: number): Promise<void> {
  console.log(`\nSearching: "${keyword}"\n`);

  const resp = await api.get("/api/markets/search", {
    params: { q: keyword, limit },
  });

  if (!resp.data.success || !resp.data.data?.length) {
    console.log("No markets found.");
    return;
  }

  const results = resp.data.data;
  console.log(`Found ${results.length} market(s) (total: ${resp.data.total ?? results.length})\n`);

  for (const m of results) {
    console.log(`Market: ${m.title}`);
    console.log(`  marketId: ${m.marketId}`);
    console.log(`  yesTokenId: ${m.yesTokenId}`);
    console.log(`  noTokenId: ${m.noTokenId}`);
    if (m.parentEvent) {
      console.log(`  Event: ${m.parentEvent.title} (eventMarketId: ${m.parentEvent.eventMarketId})`);
    }
    console.log("---");
  }
}

// CLI entry
const args = process.argv.slice(2);
let keyword = "";
let limit = 10;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--limit") { limit = parseInt(args[++i]); }
  else if (!args[i].startsWith("--") && !keyword) { keyword = args[i]; }
}

if (!keyword) {
  console.error("Usage: bun run scripts/search.ts <keyword> [--limit <n>]");
  process.exit(1);
}

search(keyword, limit).catch(console.error);
