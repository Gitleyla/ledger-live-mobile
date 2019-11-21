// @flow

import { AsyncStorage } from "react-native";
import { makeLRUCache } from "@ledgerhq/live-common/lib/cache";
import { getCurrencyBridge } from "@ledgerhq/live-common/lib/bridge";
import { log } from "@ledgerhq/logs";
import type { CryptoCurrency } from "@ledgerhq/live-common/lib/types";

function currencyCacheId(currency) {
  return `bridgeproxypreload_${currency.id}`;
}

export async function setCurrencyCache(currency: CryptoCurrency, data: mixed) {
  if (data) {
    const serialized = JSON.stringify(data);
    await AsyncStorage.setItem(currencyCacheId(currency), serialized);
  }
}

export async function getCurrencyCache(currency: CryptoCurrency): mixed {
  const res = await AsyncStorage.getItem(currencyCacheId(currency));
  if (res) {
    try {
      return JSON.parse(res);
    } catch (e) {
      log("bridge/cache", `failure to retrieve cache ${String(e)}`);
    }
  }
  return undefined;
}

export const prepareCurrency: (
  currency: CryptoCurrency,
) => Promise<void> = makeLRUCache(
  async currency => {
    log("bridge/cache", "prepareCurrency " + currency.id + "...");
    const value = await getCurrencyCache(currency);
    const bridge = getCurrencyBridge(currency);
    bridge.hydrate(value);
    const preloaded = await bridge.preload();
    await setCurrencyCache(currency, preloaded);
    log("bridge/cache", "prepareCurrency " + currency.id + " DONE.");
  },
  currency => currency.id,
);