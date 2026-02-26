// 获取市场详情
// 用法: bun run scripts/market-detail.ts <marketId> [--json]

import { api } from "./config";

async function getMarketDetail(marketId: string, json: boolean): Promise<void> {
  // 先通过 detail-params 获取基本信息
  const detailResp = await api.get(`/api/markets/detail-params/${marketId}`);
  if (!detailResp.data.success) {
    console.error(`Market ${marketId} not found.`);
    process.exit(1);
  }

  const detail = detailResp.data.data;

  // 通过 asset-ids 获取 tokenId
  const assetResp = await api.get(`/api/markets/asset-ids/${marketId}`);
  const assets = assetResp.data.success ? assetResp.data.data : null;

  // 尝试通过 yesTokenId 反查完整市场信息
  const tokenId = assets?.yesTokenId || detail.yesTokenId;
  let market: any = null;
  if (tokenId) {
    try {
      const mResp = await api.get(`/api/markets/by-asset/${tokenId}`);
      if (mResp.data.success) market = mResp.data.data;
    } catch {}
  }

  if (json) {
    console.log(JSON.stringify({ detail, assets, market }, null, 2));
    return;
  }

  console.log(`\nMarket: ${detail.title || market?.marketTitle || "Unknown"}`);
  console.log(`  marketId: ${marketId}`);
  if (market?.status) console.log(`  status: ${market.status} (${market.statusEnum})`);
  console.log(`  yesLabel: ${detail.yesLabel || "Yes"} / noLabel: ${detail.noLabel || "No"}`);
  console.log(`  yesTokenId: ${assets?.yesTokenId || detail.yesTokenId}`);
  console.log(`  noTokenId: ${assets?.noTokenId || detail.noTokenId}`);
  if (market?.conditionId) console.log(`  conditionId: ${market.conditionId}`);
  if (market?.volume) console.log(`  volume: $${Number(market.volume).toLocaleString()}`);
  if (market?.quoteToken) console.log(`  quoteToken: ${market.quoteToken}`);
  if (market?.chainId) console.log(`  chainId: ${market.chainId}`);
  if (market?.rules) console.log(`  rules: ${market.rules.slice(0, 200)}`);
  if (market?.createdAt) console.log(`  created: ${market.createdAt}`);
  if (market?.cutoffAt) console.log(`  cutoff: ${market.cutoffAt}`);
  if (market?.resolvedAt) console.log(`  resolved: ${market.resolvedAt}`);
  if (assets?.parentEvent || market?.parentEvent) {
    const pe = assets?.parentEvent || market?.parentEvent;
    console.log(`  event: ${pe.title} (eventMarketId: ${pe.eventMarketId})`);
  }
  if (market?.childMarkets?.length) {
    console.log(`  childMarkets (${market.childMarkets.length}):`);
    for (const child of market.childMarkets) {
      console.log(`    - ${child.title || child.marketTitle} (marketId: ${child.marketId}, yes: ${child.yesTokenId}, no: ${child.noTokenId})`);
    }
  }
}

// CLI entry
const args = process.argv.slice(2);
const marketId = args.find(a => !a.startsWith("--"));
const json = args.includes("--json");

if (!marketId) {
  console.error("Usage: bun run scripts/market-detail.ts <marketId> [--json]");
  process.exit(1);
}

getMarketDetail(marketId, json).catch(console.error);
