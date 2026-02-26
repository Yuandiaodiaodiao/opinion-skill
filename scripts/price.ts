// 查询价格
// 用法: bun run scripts/price.ts <assetId> [<assetId2> ...] [--json]

import { api } from "./config";

export async function getPrice(assetIds: string[]): Promise<any[]> {
  if (assetIds.length === 1) {
    // Single asset: use orderbook for richer data
    const resp = await api.get(`/api/orderbook/${assetIds[0]}`, {
      params: { chainId: "56" },
    });
    if (resp.data.success) {
      const d = resp.data.data;
      const bids = d.bids || [];
      const asks = d.asks || [];
      const bestBid = bids.length > 0 ? Math.max(...bids.map((b: any) => parseFloat(b[0]))) : null;
      const bestAsk = asks.length > 0 ? Math.min(...asks.map((a: any) => parseFloat(a[0]))) : null;
      return [{
        assetId: assetIds[0],
        lastPrice: d.lastPrice,
        bestBid,
        bestAsk,
        mid: bestBid != null && bestAsk != null ? (bestBid + bestAsk) / 2 : d.lastPrice,
      }];
    }
  }

  // Batch price
  const resp = await api.post("/api/orderbook/batchprice", { assetIds });
  if (!resp.data.success) {
    console.error("API error:", resp.data.error?.message ?? "unknown");
    process.exit(1);
  }
  return resp.data.data;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const assetIds = args.filter(a => !a.startsWith("--"));

  if (assetIds.length === 0) {
    console.error("Usage: bun run scripts/price.ts <assetId> [<assetId2> ...] [--json]");
    process.exit(1);
  }

  getPrice(assetIds).then(results => {
    if (json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }
    for (const r of results) {
      if ('lastPrice' in r) {
        // Single asset rich data
        console.log(`Asset: ${r.assetId}`);
        console.log(`  Last Price: ${r.lastPrice != null ? `$${r.lastPrice}` : "N/A"}`);
        console.log(`  Best Bid: ${r.bestBid != null ? `$${r.bestBid}` : "N/A"}`);
        console.log(`  Best Ask: ${r.bestAsk != null ? `$${r.bestAsk}` : "N/A"}`);
        console.log(`  Mid: ${r.mid != null ? `$${Number(r.mid).toFixed(4)}` : "N/A"}`);
      } else {
        // Batch result
        console.log(`Asset: ${r.assetId}`);
        console.log(`  Price: ${r.price != null ? `$${r.price}` : "N/A"} (source: ${r.source})`);
      }
      console.log("---");
    }
  }).catch(console.error);
}
