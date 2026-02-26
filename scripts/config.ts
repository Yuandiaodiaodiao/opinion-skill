// ========================
// 共享配置模块
// ========================
//
// Opinion 平台配置
// SDK 用于下单操作，API 用于数据查询
//
// 环境变量:
//   PRIVATE_KEY       - EOA 私钥 (必须是 Gnosis Safe 的 owner)
//   MULTI_SIG_ADDRESS - Gnosis Safe 多签钱包地址
//   API_KEY           - Opinion OpenAPI key
//   BSC_RPC           - BSC RPC (可选, 默认 https://bsc-dataseed.binance.org)

import {
  Client,
  CHAIN_ID_BNB_MAINNET,
  DEFAULT_API_HOST,
  OrderSide,
  OrderType,
} from "@opinion-labs/opinion-clob-sdk";
import axios, { type AxiosInstance } from "axios";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const MULTI_SIG_ADDRESS = process.env.MULTI_SIG_ADDRESS;
const API_KEY = process.env.API_KEY;
const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org";

// Opinion 数据 API
const OPINION_API_HOST = "http://newopinion.predictscanapi.xyz:10001";

// SDK API host
const SDK_API_HOST = DEFAULT_API_HOST; // https://openapi.opinion.trade/openapi

// SDK Client (延迟创建, 仅交易脚本需要)
function getClient(): Client {
  if (!PRIVATE_KEY) {
    console.error("Error: set PRIVATE_KEY in .env");
    process.exit(1);
  }
  if (!MULTI_SIG_ADDRESS) {
    console.error("Error: set MULTI_SIG_ADDRESS in .env");
    process.exit(1);
  }
  if (!API_KEY) {
    console.error("Error: set API_KEY in .env");
    process.exit(1);
  }
  return new Client({
    host: SDK_API_HOST,
    apiKey: API_KEY,
    chainId: CHAIN_ID_BNB_MAINNET,
    rpcUrl: BSC_RPC,
    privateKey: PRIVATE_KEY as `0x${string}`,
    multiSigAddress: MULTI_SIG_ADDRESS as `0x${string}`,
  });
}

// 创建 axios 实例 (用于数据 API 查询, 无需认证)
const api: AxiosInstance = axios.create({
  baseURL: OPINION_API_HOST,
  timeout: 30000,
});

export {
  getClient,
  api,
  OPINION_API_HOST,
  SDK_API_HOST,
  BSC_RPC,
  PRIVATE_KEY,
  MULTI_SIG_ADDRESS,
  API_KEY,
  OrderSide,
  OrderType,
  CHAIN_ID_BNB_MAINNET,
};
