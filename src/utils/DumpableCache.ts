import { props } from "./promiseHelpers"
import { GeneralCacheInterface } from "./types/GeneralCacheInterface"

const dumpableCacheKey = Symbol("dumpableCacheKey")

export const getCacheInside = <K, V>(
  obj: DumpableCache,
): GeneralCacheInterface<K, V> => {
  return obj[dumpableCacheKey] as any
}

export class DumpableCache {
  readonly [dumpableCacheKey]: Map<unknown, unknown>

  constructor() {
    this[dumpableCacheKey] = new Map()
  }

  async dump(): Promise<string> {
    return JSON.stringify({
      ["**NOTICE**"]:
        "This is a dumped cache, DO NOT use it or modify it, only for SDK internal usage.",
      version: 1,
      data: await props(Object.fromEntries(this[dumpableCacheKey])),
    })
  }

  async load(data: string): Promise<void> {
    try {
      const parsed = JSON.parse(data)
      if (parsed.version !== 1) {
        throw new Error("Unsupported cache version")
      }

      this[dumpableCacheKey].clear()
      for (const [key, value] of Object.entries(parsed.data)) {
        this[dumpableCacheKey].set(key, value)
      }
    } catch (error) {
      console.trace("Failed to load cache", error)
    }
  }
}
