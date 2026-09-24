// ==UserScript==
// @name        linux.do助手
// @namespace    https://scriptcat.org/zh-CN/users/212527
// @version     1.0.0
// @description 自动阅读、智能点赞、查询账号信息等功能
// @author      kun&gpt-6-astra
// @icon        https://cdn3.ldstatic.com/optimized/4X/6/a/6/6a6affc7b1ce8140279e959d32671304db06d5ab_2_180x180.png
// @downloadURL https://scriptcat.org/zh-CN/script-show-page/8000
// @updateURL https://scriptcat.org/zh-CN/script-show-page/8000
// @license     MIT
// @match       https://linux.do/*
// @match       https://idcflare.com/*
// @match       https://cdk.linux.do/*
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_getTab
// @grant       GM_saveTab
// @grant       unsafeWindow
// @connect     connect.linux.do
// @connect     credit.linux.do
// @connect     cdk.linux.do
// @connect     linux.do
// @connect     *
// @run-at      document-idle
// ==/UserScript==

(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/core/runtime-context.js
  var resolveWindow = (candidate) => {
    if (candidate) return candidate;
    if (typeof window !== "undefined") return window;
    return typeof globalThis !== "undefined" ? globalThis : void 0;
  };
  var resolveLocation = (windowRef, candidate) => {
    if (candidate) return candidate;
    return windowRef?.location || (typeof location !== "undefined" ? location : void 0);
  };
  var resolveFetch = (windowRef, candidate) => {
    if (typeof candidate === "function") return candidate;
    if (typeof windowRef?.fetch === "function") return windowRef.fetch.bind(windowRef);
    if (typeof globalThis?.fetch === "function") return globalThis.fetch.bind(globalThis);
    return void 0;
  };
  var resolveTimer = (windowRef, name) => {
    if (typeof windowRef?.[name] === "function") return windowRef[name].bind(windowRef);
    if (typeof globalThis?.[name] === "function") return globalThis[name].bind(globalThis);
    return void 0;
  };
  var resolveStorage = (windowRef, name) => {
    try {
      return windowRef?.[name] || (typeof globalThis !== "undefined" ? globalThis[name] : void 0);
    } catch (_) {
      return void 0;
    }
  };
  var resolveGlobal = (windowRef) => {
    try {
      if (typeof unsafeWindow !== "undefined" && unsafeWindow) return unsafeWindow;
    } catch (_) {
    }
    return windowRef;
  };
  var createRuntimeContext = (options = {}) => {
    const windowRef = resolveWindow(options.windowRef || options.window);
    const documentRef = options.documentRef || options.document || windowRef?.document;
    const locationRef = resolveLocation(windowRef, options.locationRef || options.location);
    const currentDomain = String(
      options.currentDomain ?? locationRef?.hostname ?? ""
    );
    const baseUrl = String(
      options.baseUrl ?? (currentDomain ? `https://${currentDomain}` : locationRef?.origin || "")
    );
    const fetchFn = resolveFetch(windowRef, options.fetchFn || options.fetch);
    const setTimeoutFn = options.setTimeoutFn || options.setTimeout || resolveTimer(windowRef, "setTimeout");
    const clearTimeoutFn = options.clearTimeoutFn || options.clearTimeout || resolveTimer(windowRef, "clearTimeout");
    const setIntervalFn = options.setIntervalFn || options.setInterval || resolveTimer(windowRef, "setInterval");
    const clearIntervalFn = options.clearIntervalFn || options.clearInterval || resolveTimer(windowRef, "clearInterval");
    const isHeartToggleUrl2 = (url, method = "PUT") => {
      try {
        const parsed = new URL(url, baseUrl);
        return String(method || "GET").toUpperCase() === "PUT" && parsed.origin === baseUrl && /^\/discourse-reactions\/posts\/\d+\/custom-reactions\/heart\/toggle\.json$/.test(parsed.pathname);
      } catch (_) {
        return false;
      }
    };
    return {
      window: windowRef,
      document: documentRef,
      location: locationRef,
      pageWindow: resolveGlobal(windowRef),
      fetch: fetchFn,
      XMLHttpRequest: windowRef?.XMLHttpRequest,
      localStorage: options.localStorage || resolveStorage(windowRef, "localStorage"),
      sessionStorage: options.sessionStorage || resolveStorage(windowRef, "sessionStorage"),
      navigator: options.navigator || windowRef?.navigator,
      setTimeout: setTimeoutFn,
      clearTimeout: clearTimeoutFn,
      setInterval: setIntervalFn,
      clearInterval: clearIntervalFn,
      gm: options.gm || {
        xmlHttpRequest: typeof GM_xmlhttpRequest === "function" ? GM_xmlhttpRequest : void 0,
        addStyle: typeof GM_addStyle === "function" ? GM_addStyle : void 0,
        getValue: typeof GM_getValue === "function" ? GM_getValue : void 0,
        setValue: typeof GM_setValue === "function" ? GM_setValue : void 0,
        getTab: typeof GM_getTab === "function" ? GM_getTab : void 0,
        saveTab: typeof GM_saveTab === "function" ? GM_saveTab : void 0
      },
      CURRENT_DOMAIN: currentDomain,
      BASE_URL: baseUrl,
      isCDKPage: currentDomain === "cdk.linux.do",
      isHeartToggleUrl: isHeartToggleUrl2
    };
  };
  var defaultRuntime = createRuntimeContext();
  var CURRENT_DOMAIN = defaultRuntime.CURRENT_DOMAIN;
  var BASE_URL = defaultRuntime.BASE_URL;
  var isCDKPage = defaultRuntime.isCDKPage;
  var isHeartToggleUrl = defaultRuntime.isHeartToggleUrl;

  // src/core/config.js
  var CONFIG = {
    scroll: {
      minSpeed: 10,
      maxSpeed: 15,
      minDistance: 2,
      maxDistance: 4,
      stepMultiplier: 2.5,
      fastScrollChance: 0.08,
      fastScrollMin: 80,
      fastScrollMax: 200,
      fullTopicBacktrackChance: 8,
      fullTopicSlowChance: 24,
      fullTopicSmallStepMinRatio: 0.05,
      fullTopicSmallStepMaxRatio: 0.09,
      fullTopicNormalStepMinRatio: 0.09,
      fullTopicNormalStepMaxRatio: 0.18,
      fullTopicBacktrackMinRatio: 0.02,
      fullTopicBacktrackMaxRatio: 0.05,
      fullTopicMinStep: 160,
      fullTopicNormalMinSpeed: 260,
      fullTopicNormalMaxSpeed: 520,
      fullTopicSlowMinSpeed: 520,
      fullTopicSlowMaxSpeed: 900,
      fullTopicBacktrackMinSpeed: 180,
      fullTopicBacktrackMaxSpeed: 360,
      bottomSettleChecks: 3,
      bottomSettleDelay: 800,
      readConfirmationChecks: 12,
      readConfirmationDelay: 1e3,
      readConfirmationClearChecks: 2,
      readConfirmationNudgePixels: 6
    },
    time: {
      browseTime: 36e5,
      restTime: 6e5,
      topicLoadingTimeout: 25e3
    },
    article: {
      commentLimit: 5e3,
      retryLimit: 3
    },
    levelRequirements: {
      0: {
        topics_entered: 5,
        posts_read_count: 30,
        time_read: 600
      },
      1: {
        days_visited: 15,
        likes_given: 1,
        likes_received: 1,
        post_count: 3,
        topics_entered: 20,
        posts_read_count: 100,
        time_read: 3600
      }
    },
    mustRead: {
      posts: [
        { id: "1051", url: "https://linux.do/t/topic/1051/" },
        { id: "5973", url: "https://linux.do/t/topic/5973" },
        { id: "102770", url: "https://linux.do/t/topic/102770" },
        { id: "154010", url: "https://linux.do/t/topic/154010" },
        { id: "149576", url: "https://linux.do/t/topic/149576" },
        { id: "22118", url: "https://linux.do/t/topic/22118" }
      ]
    },
    likeAllowedCategories: {
      allowed: [
        "\u5F00\u53D1\u8C03\u4F18",
        "\u56FD\u4EA7\u66FF\u4EE3",
        "\u8D44\u6E90\u835F\u8403",
        "\u6587\u6863\u5171\u5EFA",
        "\u975E\u6211\u83AB\u5C5E",
        "\u8BFB\u4E66\u6210\u8BD7",
        "\u524D\u6CBF\u5FEB\u8BAF",
        "\u798F\u5229\u7F8A\u6BDB",
        "\u641E\u4E03\u637B\u4E09",
        "\u8FD0\u8425\u53CD\u9988"
      ],
      excluded: [
        "\u7F51\u76D8\u8D44\u6E90",
        "\u8DF3\u86A4\u5E02\u573A",
        "\u6DF1\u6D77\u5E7D\u57DF",
        "\u79EF\u5206\u4E50\u56ED",
        "\u626C\u5E06\u8D77\u822A",
        "\u793E\u533A\u5B75\u5316"
      ]
    }
  };
  var createConfig = (overrides = {}) => ({
    ...CONFIG,
    ...overrides,
    scroll: { ...CONFIG.scroll, ...overrides.scroll || {} },
    time: { ...CONFIG.time, ...overrides.time || {} },
    article: { ...CONFIG.article, ...overrides.article || {} },
    levelRequirements: { ...CONFIG.levelRequirements, ...overrides.levelRequirements || {} },
    mustRead: { ...CONFIG.mustRead, ...overrides.mustRead || {} },
    likeAllowedCategories: {
      ...CONFIG.likeAllowedCategories,
      ...overrides.likeAllowedCategories || {}
    }
  });

  // src/core/storage.js
  var resolveStorageArea = (storageArea) => {
    if (storageArea) return storageArea;
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (_) {
    }
    return void 0;
  };
  var createStorage = (storageArea) => {
    const area = resolveStorageArea(storageArea);
    return {
      get: (key, defaultValue = null) => {
        try {
          const value = area?.getItem(key);
          return value ? JSON.parse(value) : defaultValue;
        } catch (_) {
          return defaultValue;
        }
      },
      set: (key, value) => {
        try {
          if (!area?.setItem) return false;
          area.setItem(key, JSON.stringify(value));
          return true;
        } catch (error) {
          console.error("Storage error:", error);
          return false;
        }
      },
      remove: (key) => {
        try {
          if (!area?.removeItem) return false;
          area.removeItem(key);
          return true;
        } catch (error) {
          console.error("Storage error:", error);
          return false;
        }
      },
      raw: area
    };
  };
  var Storage = createStorage();

  // src/core/like-cooldown.js
  var resolveStorageArea2 = (storageArea) => {
    if (storageArea) return storageArea;
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (_) {
    }
    return void 0;
  };
  var createLikeCooldown = ({ storageArea, key = "likeResumeTime" } = {}) => {
    const area = resolveStorageArea2(storageArea);
    return {
      load() {
        try {
          if (!area?.getItem) throw new Error("Storage unavailable");
          const raw = area?.getItem(key);
          const stored = raw ? JSON.parse(raw) : null;
          const state = { accounts: {}, legacyUntil: 0 };
          const validUntil = (value) => {
            const until = Number(value ?? 0);
            if (!Number.isFinite(until) || until < 0) {
              throw new Error("Invalid like cooldown timestamp");
            }
            return until;
          };
          if (stored && typeof stored === "object" && !Array.isArray(stored)) {
            state.legacyUntil = validUntil(stored.legacyUntil);
            if (stored.accounts != null) {
              if (typeof stored.accounts !== "object" || Array.isArray(stored.accounts)) {
                throw new Error("Invalid like cooldown accounts");
              }
              for (const [accountKey, until] of Object.entries(stored.accounts)) {
                if (/^(id|username):/.test(accountKey)) {
                  state.accounts[accountKey] = validUntil(until);
                }
              }
            }
          } else if (stored === null || typeof stored === "number") {
            state.legacyUntil = validUntil(stored);
          } else {
            throw new Error("Invalid like cooldown state");
          }
          return state;
        } catch (error) {
          console.error("[\u70B9\u8D5E\u51B7\u5374] \u5B58\u50A8\u4E0D\u53EF\u8BFB\uFF0C\u6682\u505C\u70B9\u8D5E:", error);
          return null;
        }
      },
      read(accountKey) {
        const state = this.load();
        if (!state) return Infinity;
        return Math.max(
          state.legacyUntil,
          accountKey ? Number(state.accounts[accountKey]) || 0 : 0
        );
      },
      extend(accountKey, until) {
        const state = this.load();
        if (!state) return Infinity;
        const nextUntil = Number(until);
        if (!Number.isFinite(nextUntil) || nextUntil < 0) return Infinity;
        if (nextUntil > 0) {
          if (accountKey) {
            state.accounts[accountKey] = Math.max(
              Number(state.accounts[accountKey]) || 0,
              nextUntil
            );
          } else {
            state.legacyUntil = Math.max(state.legacyUntil, nextUntil);
          }
        }
        try {
          if (!area?.setItem) return Infinity;
          area.setItem(key, JSON.stringify(state));
        } catch (error) {
          console.error("[\u70B9\u8D5E\u51B7\u5374] \u5B58\u50A8\u4E0D\u53EF\u5199\uFF0C\u6682\u505C\u70B9\u8D5E:", error);
          return Infinity;
        }
        return Math.max(
          state.legacyUntil,
          accountKey ? Number(state.accounts[accountKey]) || 0 : 0
        );
      },
      clear(accountKeys) {
        const state = this.load();
        if (!state) return false;
        try {
          state.legacyUntil = 0;
          const keys = Array.isArray(accountKeys) ? accountKeys : [accountKeys];
          for (const accountKey of keys) {
            if (/^(id|username):/.test(String(accountKey || ""))) {
              delete state.accounts[accountKey];
            }
          }
          if (!area?.setItem) return false;
          area.setItem(key, JSON.stringify(state));
          return true;
        } catch (error) {
          console.error("[\u70B9\u8D5E\u51B7\u5374] \u6E05\u9664\u5931\u8D25:", error);
          return false;
        }
      },
      key,
      raw: area
    };
  };
  var LikeCooldown = createLikeCooldown();

  // src/core/utils.js
  var createUtils = (runtime = defaultRuntime) => {
    const documentRef = runtime.document;
    const setTimeoutFn = runtime.setTimeout || ((callback, ms) => setTimeout(callback, ms));
    return {
      random: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
      sleep: (ms) => new Promise((resolve) => setTimeoutFn(resolve, ms)),
      isPageLoaded: () => {
        if (!documentRef?.querySelectorAll) return true;
        const loadingElements = documentRef.querySelectorAll(".loading, .infinite-scroll");
        return loadingElements.length === 0;
      },
      isNearBottom: () => {
        const root = documentRef?.documentElement;
        if (!root) return false;
        const { scrollHeight, clientHeight, scrollTop } = root;
        return scrollTop + clientHeight >= scrollHeight - 200;
      }
    };
  };
  var Utils = createUtils();

  // src/core/request-manager.js
  var RequestManagerClass = class {
    constructor({ storage = Storage, utils = Utils } = {}) {
      this.storage = storage;
      this.utils = utils;
      this._lastRequestAt = /* @__PURE__ */ new Map();
      this._inFlight = /* @__PURE__ */ new Map();
    }
    async run(key, requestFn, options = {}) {
      const {
        minInterval = 1200,
        retries = 1,
        backoffBase = 1200,
        jitter = 250,
        cooldownKey = null,
        cooldownMs = 30 * 60 * 1e3
      } = options;
      if (this._inFlight.has(key)) {
        return this._inFlight.get(key);
      }
      const runner = (async () => {
        if (cooldownKey) {
          const cooldownUntil = this.storage.get(cooldownKey, 0);
          if (cooldownUntil > Date.now()) return null;
        }
        const lastAt = this._lastRequestAt.get(key) || 0;
        const elapsed = Date.now() - lastAt;
        const waitMs = minInterval - elapsed + this.utils.random(0, jitter);
        if (waitMs > 0) await this.utils.sleep(waitMs);
        let attempt = 0;
        while (attempt <= retries) {
          try {
            this._lastRequestAt.set(key, Date.now());
            return await requestFn();
          } catch (error) {
            const msg = String(error?.message || "");
            const is429 = msg.includes("429") || msg.toLowerCase().includes("rate");
            if (is429 && cooldownKey) {
              this.storage.set(cooldownKey, Date.now() + cooldownMs);
            }
            if (attempt >= retries) throw error;
            const backoff = backoffBase * Math.pow(2, attempt) + this.utils.random(100, 600);
            await this.utils.sleep(backoff);
            attempt++;
          }
        }
        return null;
      })();
      this._inFlight.set(key, runner);
      try {
        return await runner;
      } finally {
        this._inFlight.delete(key);
      }
    }
    clear(key) {
      if (key === void 0) {
        this._lastRequestAt.clear();
        this._inFlight.clear();
        return;
      }
      this._lastRequestAt.delete(key);
      this._inFlight.delete(key);
    }
  };
  var RequestManager = new RequestManagerClass();

  // src/core/network-interceptor.js
  var STATE_KEY = Symbol.for("linux-do-assistant.network-interceptor");
  var requestInfo = (args, transport) => {
    const request = args?.[0];
    return {
      transport,
      url: typeof request === "string" ? request : request?.url || request?.href || "",
      method: String(args?.[1]?.method || request?.method || "GET").toUpperCase(),
      args
    };
  };
  var callSafely = (callback, payload) => {
    if (typeof callback !== "function") return void 0;
    try {
      return callback(payload);
    } catch (error) {
      console.error("[NetworkInterceptor] subscriber error:", error);
      return void 0;
    }
  };
  var NetworkInterceptor = class {
    constructor(runtime = defaultRuntime) {
      this.runtime = runtime;
      this.subscribers = /* @__PURE__ */ new Set();
      this.installed = false;
      this.originalFetch = null;
      this.originalXhrOpen = null;
      this.originalXhrSend = null;
    }
    register(subscriber = {}) {
      this.subscribers.add(subscriber);
      this.install();
      return () => this.subscribers.delete(subscriber);
    }
    install() {
      if (this.installed) return true;
      const win = this.runtime.window || (typeof window !== "undefined" ? window : null);
      if (!win) return false;
      if (typeof win.fetch === "function") {
        this.originalFetch = win.fetch;
        const service = this;
        win.fetch = async function(...args) {
          const request = requestInfo(args, "fetch");
          const contexts = service.collectContexts(request);
          let response;
          try {
            response = await service.originalFetch.apply(this, args);
          } catch (error) {
            service.dispatchError({ request, contexts, error });
            throw error;
          }
          await service.dispatchResponse({ request, contexts, response });
          return response;
        };
      }
      const XHR = win.XMLHttpRequest;
      if (XHR?.prototype) {
        this.originalXhrOpen = XHR.prototype.open;
        this.originalXhrSend = XHR.prototype.send;
        const service = this;
        XHR.prototype.open = function(method, url, ...rest) {
          this.__ldaNetworkRequest = {
            transport: "xhr",
            url,
            method: String(method || "GET").toUpperCase()
          };
          return service.originalXhrOpen.apply(this, [method, url, ...rest]);
        };
        XHR.prototype.send = function(body) {
          const request = {
            ...this.__ldaNetworkRequest || {},
            transport: "xhr",
            url: this.__ldaNetworkRequest?.url || "",
            method: this.__ldaNetworkRequest?.method || "GET",
            xhr: this,
            body
          };
          const contexts = service.collectContexts(request);
          const hasMatchingSubscriber = contexts.some(({ value }) => value !== null && value !== void 0);
          if (hasMatchingSubscriber) {
            this.addEventListener("load", () => {
              service.dispatchResponse({ request, contexts, response: this });
            }, { once: true });
            this.addEventListener("error", (event) => {
              service.dispatchError({ request, contexts, error: event });
            }, { once: true });
          }
          return service.originalXhrSend.apply(this, [body]);
        };
      }
      this.installed = true;
      return true;
    }
    collectContexts(request) {
      return [...this.subscribers].map((subscriber) => ({
        subscriber,
        value: callSafely(subscriber.beforeRequest, request)
      }));
    }
    async dispatchResponse({ request, contexts, response }) {
      for (const { subscriber, value } of contexts) {
        if (typeof subscriber.afterResponse !== "function") continue;
        try {
          await subscriber.afterResponse({ request, response, context: value });
        } catch (error) {
          console.error("[NetworkInterceptor] async subscriber error:", error);
        }
      }
    }
    dispatchError({ request, contexts, error }) {
      for (const { subscriber, value } of contexts) {
        callSafely(subscriber.onError, { request, context: value, error });
      }
    }
  };
  var getNetworkInterceptor = (runtime = defaultRuntime) => {
    const win = runtime.window || (typeof window !== "undefined" ? window : null);
    if (win) {
      if (!win[STATE_KEY]) win[STATE_KEY] = new NetworkInterceptor(runtime);
      return win[STATE_KEY];
    }
    return new NetworkInterceptor(runtime);
  };
  var networkInterceptor = getNetworkInterceptor();

  // src/core/index.js
  var createCore = (options = {}) => {
    const runtime = options.runtime ? { ...createRuntimeContext(options.runtime), ...options.runtime } : createRuntimeContext(options);
    const config = options.config || createConfig(options.configOverrides || {});
    const storage = options.storage || createStorage(runtime.localStorage);
    const likeCooldown = options.likeCooldown || createLikeCooldown({
      storageArea: runtime.localStorage
    });
    const utils = options.utils || createUtils(runtime);
    const requestManager = options.requestManager || new RequestManagerClass({
      storage,
      utils
    });
    return {
      ...runtime,
      CONFIG: config,
      Utils: utils,
      Storage: storage,
      LikeCooldown: likeCooldown,
      RequestManager: requestManager,
      NetworkInterceptor: getNetworkInterceptor(runtime),
      context: runtime
    };
  };
  var core = createCore({ runtime: defaultRuntime });

  // src/features/cdk-bridge.js
  function initCDKBridgePage() {
    if (!isCDKPage || typeof window === "undefined") return;
    const bridgeKey = Symbol.for("linux-do-assistant.cdk-bridge");
    if (window[bridgeKey]) return window[bridgeKey];
    const cacheAndNotify = async () => {
      try {
        const [userRes, receivedRes] = await Promise.all([
          fetch("https://cdk.linux.do/api/v1/oauth/user-info", {
            credentials: "include"
          }),
          fetch("https://cdk.linux.do/api/v1/projects/received?current=1&size=20&search=", {
            credentials: "include"
          })
        ]);
        const userData = userRes.ok ? await userRes.json() : null;
        const receivedData = receivedRes.ok ? await receivedRes.json() : null;
        if (!userData?.data) return;
        const cacheData = {
          user: userData.data,
          received: receivedData?.data || null
        };
        if (typeof GM_setValue === "function") {
          GM_setValue("lda_cdk_cache", { data: cacheData, ts: Date.now() });
        }
        try {
          window.parent?.postMessage({
            type: "lda-cdk-data",
            payload: { data: cacheData }
          }, "*");
        } catch (_) {
        }
        console.log("[CDK Bridge] \u6570\u636E\u5DF2\u7F13\u5B58:", cacheData);
      } catch (error) {
        console.error("[CDK Bridge] \u83B7\u53D6\u6570\u636E\u5931\u8D25:", error);
      }
    };
    cacheAndNotify();
    window.addEventListener("message", (event) => {
      if (event.data?.type === "lda-cdk-request") cacheAndNotify();
    });
    window[bridgeKey] = { refresh: cacheAndNotify };
    return window[bridgeKey];
  }

  // src/features/like-counter.js
  var LikeCounter = class {
    constructor() {
      this.CONFIG = {
        STORAGE_KEY: `linuxdo_likes_counter_${CURRENT_DOMAIN}`,
        SYNC_INTERVAL: 30 * 60 * 1e3,
        MAX_STORED_ITEMS: 500,
        LIMITS: { 0: 50, 1: 50, 2: 75, 3: 100, 4: 150 }
      };
      this.state = {
        timestamps: [],
        cooldownUntil: 0,
        lastSync: 0,
        matched: true,
        userTrustLevel: null
      };
      this.currentUser = null;
      this.accountKey = null;
      this.accountGeneration = 0;
      this.uiUpdateCallbacks = [];
      this.syncTimer = null;
      this.loadState();
      this.installInterceptors();
      this.startPeriodicSync();
    }
    getAccountKey(user) {
      const id = Number(user?.id ?? user?.user_id);
      if (Number.isSafeInteger(id) && id > 0) return `id:${id}`;
      const username = String(user?.username || "").trim().replace(/^@/, "").trim().toLowerCase();
      return username ? `username:${username}` : null;
    }
    getAccountStorageKey() {
      return this.accountKey ? `${this.CONFIG.STORAGE_KEY}_${encodeURIComponent(this.accountKey)}` : null;
    }
    createEmptyState() {
      return { timestamps: [], cooldownUntil: 0, lastSync: 0, matched: false, userTrustLevel: null };
    }
    loadState() {
      this.state = this.createEmptyState();
      const storageKey = this.getAccountStorageKey();
      if (!storageKey) return;
      try {
        const stored = GM_getValue(storageKey, "{}");
        const parsed = typeof stored === "string" ? JSON.parse(stored) : stored;
        this.state.timestamps = Array.isArray(parsed?.timestamps) ? parsed.timestamps.filter((ts) => Number.isFinite(ts) && ts > 0).slice(0, this.CONFIG.MAX_STORED_ITEMS) : [];
        this.state.lastSync = Number(parsed?.lastSync) || 0;
        this.state.matched = parsed?.matched === true;
        this.state.userTrustLevel = parsed?.userTrustLevel ?? null;
      } catch (e) {
        console.error("[LikeCounter] \u52A0\u8F7D\u72B6\u6001\u5931\u8D25:", e);
      }
      this.cleanOldEntries();
    }
    saveState() {
      const storageKey = this.getAccountStorageKey();
      if (!storageKey) return false;
      try {
        const { timestamps, lastSync, matched, userTrustLevel } = this.state;
        GM_setValue(storageKey, JSON.stringify({ timestamps, lastSync, matched, userTrustLevel }));
        return true;
      } catch (e) {
        console.error("[LikeCounter] \u4FDD\u5B58\u72B6\u6001\u5931\u8D25:", e);
        return false;
      }
    }
    cleanOldEntries() {
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1e3;
      this.state.cooldownUntil = this.accountKey ? LikeCooldown.read(this.accountKey) : 0;
      this.state.timestamps = this.state.timestamps.filter((ts) => ts > cutoff);
      this.state.timestamps.sort((a, b) => b - a);
      if (this.state.cooldownUntil > 0 && this.state.cooldownUntil < now) {
        const expectedBase = this.state.cooldownUntil - 24 * 60 * 60 * 1e3;
        const beforeCount = this.state.timestamps.length;
        this.state.timestamps = this.state.timestamps.filter(
          (ts) => ts < expectedBase || ts >= expectedBase + 5e3
        );
        if (this.state.timestamps.length < beforeCount) {
          this.checkAndUpdateMismatch();
        }
        this.state.cooldownUntil = 0;
      }
    }
    checkAndUpdateMismatch() {
      const limit = this.getDailyLimit();
      const count = this.state.timestamps.length;
      this.state.matched = count >= limit || this.state.lastSync === 0 || this.state.lastSync > 0 && count === 0;
    }
    getDailyLimit() {
      if (this.currentUser && this.CONFIG.LIMITS[this.currentUser.trust_level] !== void 0) {
        return this.CONFIG.LIMITS[this.currentUser.trust_level];
      }
      if (this.state.userTrustLevel !== null && this.CONFIG.LIMITS[this.state.userTrustLevel] !== void 0) {
        return this.CONFIG.LIMITS[this.state.userTrustLevel];
      }
      try {
        const username = this.currentUser?.username;
        if (username) {
          const cacheKey = `trustLevelCache_${CURRENT_DOMAIN}_${username}`;
          const cachedData = Storage.get(cacheKey, null);
          if (cachedData?.currentLevel !== void 0) {
            const level = parseInt(cachedData.currentLevel);
            if (this.CONFIG.LIMITS[level] !== void 0) {
              return this.CONFIG.LIMITS[level];
            }
          }
        }
      } catch (e) {
      }
      return 50;
    }
    getRemainingLikes() {
      this.cleanOldEntries();
      const limit = this.getDailyLimit();
      const used = this.state.timestamps.length;
      return Math.max(0, limit - used);
    }
    getUsedLikes() {
      this.cleanOldEntries();
      return this.state.timestamps.length;
    }
    isInCooldown() {
      return this.state.cooldownUntil > Date.now();
    }
    getCooldownRemaining() {
      if (!this.isInCooldown()) return 0;
      return Math.max(0, this.state.cooldownUntil - Date.now());
    }
    formatCooldown() {
      const diff = this.getCooldownRemaining();
      if (!Number.isFinite(diff)) return "\u6682\u4E0D\u53EF\u7528";
      if (diff <= 0) return null;
      const h = Math.floor(diff / 36e5);
      const m = Math.floor(diff % 36e5 / 6e4);
      const s = Math.floor(diff % 6e4 / 1e3);
      if (h > 0) {
        return `${h}\u5C0F\u65F6${String(m).padStart(2, "0")}\u5206${String(s).padStart(2, "0")}\u79D2`;
      }
      return `${String(m).padStart(2, "0")}\u5206${String(s).padStart(2, "0")}\u79D2`;
    }
    processToggleResponse(url, data, method = "PUT", accountKey = this.accountKey, accountGeneration = this.accountGeneration, status = 0) {
      if (!isHeartToggleUrl(url, method) || !accountKey || accountKey !== this.accountKey || accountGeneration !== this.accountGeneration) return;
      this.loadState();
      const now = Date.now();
      const succeeded = status >= 200 && status < 300;
      const hasReaction = data != null && Object.prototype.hasOwnProperty.call(data, "current_user_reaction");
      if (!succeeded && (status === 429 || data?.error_type === "rate_limit")) {
        const waitSeconds = data?.extras?.wait_seconds || 0;
        if (waitSeconds > 0) {
          const cooldownUntil = now + waitSeconds * 1e3;
          this.state.cooldownUntil = LikeCooldown.extend(accountKey, cooldownUntil);
          console.log(`[LikeCounter] \u89E6\u53D1\u9650\u6D41\uFF0C\u51B7\u5374 ${waitSeconds} \u79D2`);
        }
        const limit = this.getDailyLimit();
        const currentCount = this.state.timestamps.length;
        this.state.matched = currentCount >= limit;
        if (currentCount < limit && waitSeconds > 0) {
          const needed = limit - currentCount;
          const placeholderBaseTime = now + waitSeconds * 1e3 - 24 * 60 * 60 * 1e3;
          const safeNeeded = Math.min(needed, 200);
          for (let i = 0; i < safeNeeded; i++) {
            this.state.timestamps.push(placeholderBaseTime + i);
          }
          this.state.timestamps.sort((a, b) => b - a);
        }
      } else if (succeeded && (!hasReaction || !!data.current_user_reaction)) {
        this.state.timestamps.push(now);
        console.log(`[LikeCounter] \u8BB0\u5F55\u70B9\u8D5E\uFF0C\u5F53\u524D\u5DF2\u7528 ${this.state.timestamps.length}/${this.getDailyLimit()}`);
      } else {
        console.log("[LikeCounter] \u8BF7\u6C42\u5931\u8D25\u6216\u5FC3\u5F62\u53CD\u5E94\u672A\u6FC0\u6D3B\uFF0C\u5FFD\u7565\u672C\u6B21\u54CD\u5E94");
      }
      this.saveState();
      this.notifyUIUpdate();
    }
    installInterceptors() {
      const self = this;
      this._likeInterceptorUnsubscribe?.();
      this._likeInterceptorUnsubscribe = networkInterceptor.register({
        beforeRequest(request) {
          if (!isHeartToggleUrl(request.url, request.method)) return null;
          return {
            accountKey: self.accountKey,
            accountGeneration: self.accountGeneration
          };
        },
        async afterResponse({ request, response, context }) {
          if (!context || !isHeartToggleUrl(request.url, request.method)) return;
          try {
            let data = null;
            if (request.transport === "fetch") {
              try {
                data = await response.clone().json();
              } catch (_) {
              }
            } else {
              try {
                data = response.responseType === "json" ? response.response : JSON.parse(response.responseText);
              } catch (_) {
              }
            }
            self.processToggleResponse(
              request.url,
              data,
              request.method,
              context.accountKey,
              context.accountGeneration,
              response.status
            );
          } catch (_) {
          }
        }
      });
      console.log("[LikeCounter] \u62E6\u622A\u5668\u5DF2\u5B89\u88C5");
    }
    async syncRemote(force = false) {
      if (!this.accountKey) {
        const discoveryGeneration = this.accountGeneration;
        let user = null;
        try {
          const currentUser = window.Discourse?.User?.current?.() || window.Discourse?.currentUser || window.User?.current?.();
          if (this.getAccountKey(currentUser)) user = currentUser;
        } catch (e) {
        }
        if (!user) {
          try {
            const preloadData = document.getElementById("data-preloaded");
            if (preloadData) {
              const data = JSON.parse(preloadData.dataset.preloaded);
              if (data?.currentUser) {
                const cu = typeof data.currentUser === "string" ? JSON.parse(data.currentUser) : data.currentUser;
                if (this.getAccountKey(cu)) user = cu;
              }
            }
          } catch (e) {
          }
        }
        if (!user) {
          const session429Until = Storage.get("session429Until", 0);
          if (session429Until > Date.now()) {
            const remainMinutes = Math.ceil((session429Until - Date.now()) / 6e4);
            console.log(`[LikeCounter] session/current 429 \u51B7\u5374\u671F\u4E2D\uFF0C\u5269\u4F59 ${remainMinutes} \u5206\u949F\uFF0C\u8DF3\u8FC7\u540C\u6B65`);
            return;
          }
          try {
            const response = await fetch(`${BASE_URL}/session/current.json`);
            if (response.status === 429) {
              console.warn("[LikeCounter] session/current \u9047\u5230 429\uFF0C\u8BBE\u7F6E 30 \u5206\u949F\u51B7\u5374");
              Storage.set("session429Until", Date.now() + 30 * 60 * 1e3);
              return;
            }
            if (response.ok) {
              const data = await response.json();
              if (this.getAccountKey(data.current_user)) user = data.current_user;
            }
          } catch (e) {
            console.error("[LikeCounter] \u83B7\u53D6\u7528\u6237\u4FE1\u606F\u5931\u8D25:", e);
          }
        }
        if (discoveryGeneration !== this.accountGeneration || !user) return;
        this.setCurrentUser(user);
      }
      const accountKey = this.accountKey;
      const accountGeneration = this.accountGeneration;
      const username = this.currentUser?.username;
      if (!accountKey || !username) return;
      this.loadState();
      if (!force) {
        const timeSinceLastSync = Date.now() - (this.state.lastSync || 0);
        const minSyncInterval = 30 * 60 * 1e3;
        if (timeSinceLastSync < minSyncInterval) {
          const remainMinutes = Math.ceil((minSyncInterval - timeSinceLastSync) / 6e4);
          console.log(`[LikeCounter] \u8DDD\u79BB\u4E0A\u6B21\u540C\u6B65\u4EC5 ${Math.floor(timeSinceLastSync / 6e4)} \u5206\u949F\uFF0C\u8DF3\u8FC7\u672C\u6B21\u540C\u6B65\uFF08\u5269\u4F59 ${remainMinutes} \u5206\u949F\uFF09`);
          this.notifyUIUpdate();
          return;
        }
      }
      console.log(`[LikeCounter] \u5F00\u59CB\u540C\u6B65\u7528\u6237 ${username} \u7684\u70B9\u8D5E\u6570\u636E...`);
      try {
        const limit = this.getDailyLimit();
        const cutoffTime = Date.now() - 24 * 60 * 60 * 1e3;
        console.log(`[LikeCounter] \u53EA\u8BFB\u53D6 API \u70B9\u8D5E\u5386\u53F2\uFF0C\u7A97\u53E3\u8D77\u70B9: ${new Date(cutoffTime).toLocaleString()}`);
        const reactions = await this.fetchUserActions(username, cutoffTime, accountKey, accountGeneration);
        if (accountKey !== this.accountKey || accountGeneration !== this.accountGeneration) return;
        const postMap = /* @__PURE__ */ new Map();
        for (const item of reactions) {
          if (!postMap.has(item.post_id) || postMap.get(item.post_id) < item.timestamp) {
            postMap.set(item.post_id, item.timestamp);
          }
        }
        const dedupedTimestamps = Array.from(postMap.values());
        console.log(`[LikeCounter] \u7528\u6237\u4FE1\u4EFB\u7B49\u7EA7: ${this.currentUser?.trust_level}, \u9650\u989D: ${limit}`);
        console.log(`[LikeCounter] \u4ECE API \u83B7\u53D6\u5230 ${reactions.length} \u6761\u53CD\u5E94\u8BB0\u5F55\uFF0C\u53BB\u91CD\u540E ${dedupedTimestamps.length} \u4E2A\u4E0D\u540C\u5E16\u5B50`);
        this.state.cooldownUntil = LikeCooldown.read(accountKey);
        this.state.timestamps = dedupedTimestamps;
        this.state.lastSync = Date.now();
        this.state.matched = true;
        this.cleanOldEntries();
        if (this.state.timestamps.length >= limit) {
          const oldestTs = Math.min(...this.state.timestamps);
          const estimatedCooldown = oldestTs + 24 * 60 * 60 * 1e3;
          if (estimatedCooldown > Date.now() && estimatedCooldown > this.state.cooldownUntil) {
            this.state.cooldownUntil = LikeCooldown.extend(accountKey, estimatedCooldown);
            console.log(`[LikeCounter] API \u6570\u636E\u8FBE\u5230\u9650\u989D\uFF0C\u4F30\u7B97\u51B7\u5374\u65F6\u95F4: ${new Date(estimatedCooldown).toLocaleString()}`);
          }
        }
        if (this.currentUser?.trust_level !== void 0) {
          this.state.userTrustLevel = this.currentUser.trust_level;
        }
        this.saveState();
        this.notifyUIUpdate();
        console.log(`[LikeCounter] \u540C\u6B65\u5B8C\u6210\uFF0C\u5DF2\u7528 ${this.state.timestamps.length}/${limit}`);
      } catch (e) {
        console.error("[LikeCounter] \u540C\u6B65\u5931\u8D25:", e);
      }
    }
    async fetchUserActions(username, cutoffTime, accountKey = this.accountKey, accountGeneration = this.accountGeneration) {
      const allItems = [];
      const cutoff = cutoffTime || Date.now() - 24 * 60 * 60 * 1e3;
      let offset = 0;
      let pages = 0;
      console.log(`[LikeCounter] \u5F00\u59CB\u83B7\u53D6 ${username} \u7684\u70B9\u8D5E\u5386\u53F2\uFF0C\u7A97\u53E3\u8D77\u70B9: ${new Date(cutoff).toLocaleString()}`);
      while (pages < 5) {
        if (accountKey !== this.accountKey || accountGeneration !== this.accountGeneration) break;
        try {
          const url = `${BASE_URL}/user_actions.json?limit=50&username=${username}&filter=1&offset=${offset}`;
          const response = await RequestManager.run(
            `user-actions-${CURRENT_DOMAIN}-${username}`,
            async () => {
              const r = await fetch(url, { credentials: "include" });
              if (r.status === 429) throw new Error("429 user_actions");
              return r;
            },
            {
              minInterval: 1500,
              retries: 1,
              backoffBase: 1200,
              cooldownKey: `userActions429Until_${CURRENT_DOMAIN}_${username}`,
              cooldownMs: 20 * 60 * 1e3
            }
          );
          if (!response || accountKey !== this.accountKey || accountGeneration !== this.accountGeneration) break;
          const res = await response.json();
          if (accountKey !== this.accountKey || accountGeneration !== this.accountGeneration) break;
          const items = res.user_actions || [];
          if (!items.length) {
            console.log(`[LikeCounter] \u6CA1\u6709\u66F4\u591A\u6570\u636E\uFF0C\u7ED3\u675F\u83B7\u53D6`);
            break;
          }
          let hasOld = false;
          for (const item of items) {
            const t = new Date(item.created_at).getTime();
            if (t > cutoff) {
              allItems.push({ post_id: item.post_id, timestamp: t });
            } else {
              hasOld = true;
            }
          }
          if (hasOld || items.length < 50) {
            console.log(`[LikeCounter] ${hasOld ? "\u9047\u5230\u7A97\u53E3\u5916\u7684\u65E7\u6570\u636E" : "\u6570\u636E\u4E0D\u8DB350\u6761"}\uFF0C\u7ED3\u675F\u83B7\u53D6`);
            break;
          }
          offset += 50;
          pages++;
          await Utils.sleep(Utils.random(350, 900));
        } catch (e) {
          console.error(`[LikeCounter] \u83B7\u53D6\u70B9\u8D5E\u5386\u53F2\u51FA\u9519:`, e);
          break;
        }
      }
      console.log(`[LikeCounter] \u70B9\u8D5E\u5386\u53F2\u83B7\u53D6\u5B8C\u6210\uFF0C\u5171 ${allItems.length} \u6761`);
      return allItems;
    }
    startPeriodicSync() {
      setTimeout(() => this.syncRemote(), 3e3);
      this.syncTimer = setInterval(() => {
        this.syncRemote();
      }, this.CONFIG.SYNC_INTERVAL);
    }
    setCurrentUser(user) {
      const accountKey = this.getAccountKey(user);
      this.currentUser = accountKey ? {
        ...user,
        username: String(user?.username || "").trim().replace(/^@/, "").trim()
      } : null;
      if (accountKey !== this.accountKey) {
        this.accountKey = accountKey;
        this.accountGeneration++;
        this.loadState();
      }
      this.notifyUIUpdate();
    }
    onUIUpdate(callback) {
      this.uiUpdateCallbacks.push(callback);
    }
    notifyUIUpdate() {
      for (const callback of this.uiUpdateCallbacks) {
        try {
          callback(this.getStatus());
        } catch (e) {
          console.error("[LikeCounter] UI\u66F4\u65B0\u56DE\u8C03\u9519\u8BEF:", e);
        }
      }
    }
    getStatus() {
      this.cleanOldEntries();
      return {
        remaining: this.getRemainingLikes(),
        used: this.getUsedLikes(),
        limit: this.getDailyLimit(),
        isInCooldown: this.isInCooldown(),
        cooldownRemaining: this.getCooldownRemaining(),
        cooldownFormatted: this.formatCooldown(),
        cooldownUntil: this.state.cooldownUntil,
        matched: this.state.matched,
        lastSync: this.state.lastSync
      };
    }
    manualSync() {
      return this.syncRemote(true);
    }
  };

  // src/features/user-info.js
  var UserInfoHelper = class {
    constructor() {
      this.userInfoCache = /* @__PURE__ */ new Map();
      this.pendingRequests = /* @__PURE__ */ new Map();
      this.DAY_IN_MS = 24 * 60 * 60 * 1e3;
      this.isEnabled = true;
      this.observer = null;
      this.init();
    }
    init() {
      if (!this.isEnabled) return;
      if (this.observer) {
        this.observer.disconnect();
      }
      const debouncedEnhance = this.debounce(() => {
        if (!this.isEnabled || document.hidden) return;
        if (typeof requestIdleCallback === "function") {
          requestIdleCallback(() => this.isEnabled && this.enhanceUserInfo(), { timeout: 1200 });
        } else {
          setTimeout(() => this.isEnabled && this.enhanceUserInfo(), 120);
        }
      }, 600);
      this.observer = new MutationObserver((mutations) => {
        if (!this.isEnabled || document.hidden) return;
        const hasRelevantMutation = mutations.some(
          (mutation) => Array.from(mutation.addedNodes || []).some((node) => {
            if (node.nodeType !== 1) return false;
            if (node.closest && node.closest("#my-gift-panel")) return false;
            return node.matches?.(".topic-post, article, .post-stream") || node.querySelector?.(".topic-post article, .names a[data-user-card]");
          })
        );
        if (hasRelevantMutation) {
          debouncedEnhance();
        }
      });
      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.enhanceUserInfo();
    }
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }
    isTopicPage() {
      return window.location.pathname.includes("/t/topic/");
    }
    async enhanceUserInfo() {
      if (!this.isTopicPage()) return;
      const articles = document.querySelectorAll(".topic-post article");
      for (const article of articles) {
        const anchor = article.querySelector(".names a[data-user-card]");
        if (!anchor) continue;
        const slug = anchor.getAttribute("data-user-card");
        if (!slug) continue;
        const normalizedSlug = slug.trim().toLowerCase();
        if (article.querySelector(`.user-reg-info[data-user="${normalizedSlug}"]`)) {
          continue;
        }
        const postWrapper = article.closest(".topic-post");
        const postNumber = postWrapper?.getAttribute("data-post-number");
        const isFirstPost = postNumber === "1";
        if (isFirstPost) {
          await this.loadAndDisplayUserInfo(anchor, slug, normalizedSlug);
        } else {
          this.addInfoButton(anchor, slug, normalizedSlug);
        }
      }
    }
    addInfoButton(anchor, rawSlug, normalizedSlug) {
      const namesContainer = anchor.closest(".names");
      if (!namesContainer) return;
      if (namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`)) {
        return;
      }
      if (namesContainer.querySelector(`.user-reg-info[data-user="${normalizedSlug}"]`)) {
        return;
      }
      const button = document.createElement("button");
      button.className = "user-info-btn";
      button.setAttribute("data-user", normalizedSlug);
      button.setAttribute("data-raw-slug", rawSlug);
      button.textContent = "\u{1F4CA}";
      button.title = "\u70B9\u51FB\u67E5\u770B\u7528\u6237\u6CE8\u518C\u4FE1\u606F";
      button.style.cssText = `
            margin-left: 6px;
            font-size: 14px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 2px 4px;
            opacity: 0.6;
            transition: opacity 0.2s;
            vertical-align: middle;
        `;
      button.addEventListener("mouseenter", () => {
        button.style.opacity = "1";
      });
      button.addEventListener("mouseleave", () => {
        button.style.opacity = "0.6";
      });
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (button.disabled) return;
        button.disabled = true;
        button.textContent = "\u23F3";
        try {
          await this.loadAndDisplayUserInfo(anchor, rawSlug, normalizedSlug);
        } catch (error) {
          console.error("\u52A0\u8F7D\u7528\u6237\u4FE1\u606F\u5931\u8D25:", error);
          button.textContent = "\u{1F4CA}";
          button.disabled = false;
        }
      });
      anchor.insertAdjacentElement("afterend", button);
      this.addTopicsButton(anchor, rawSlug, normalizedSlug);
    }
    addTopicsButton(anchor, rawSlug, normalizedSlug) {
      const namesContainer = anchor.closest(".names");
      if (!namesContainer) return;
      if (namesContainer.querySelector(`.user-topics-btn[data-user="${normalizedSlug}"]`)) {
        return;
      }
      const topicsBtn = document.createElement("a");
      topicsBtn.className = "user-topics-btn";
      topicsBtn.setAttribute("data-user", normalizedSlug);
      topicsBtn.href = `${BASE_URL}/u/${rawSlug}/activity/topics`;
      topicsBtn.target = "_blank";
      topicsBtn.textContent = "\u67E5\u770B\u8BDD\u9898";
      topicsBtn.title = "\u67E5\u770B\u8BE5\u7528\u6237\u7684\u8BDD\u9898";
      topicsBtn.style.cssText = `
            margin-left: 6px;
            font-size: 12px;
            cursor: pointer;
            text-decoration: none;
            padding: 2px 6px;
            opacity: 0.7;
            transition: all 0.2s;
            vertical-align: middle;
            display: inline-block;
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 4px;
        `;
      topicsBtn.addEventListener("mouseenter", () => {
        topicsBtn.style.opacity = "1";
        topicsBtn.style.background = "rgba(102, 126, 234, 0.2)";
      });
      topicsBtn.addEventListener("mouseleave", () => {
        topicsBtn.style.opacity = "0.7";
        topicsBtn.style.background = "rgba(102, 126, 234, 0.1)";
      });
      const infoBtn = namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`);
      if (infoBtn) {
        infoBtn.insertAdjacentElement("afterend", topicsBtn);
      } else {
        anchor.insertAdjacentElement("afterend", topicsBtn);
      }
    }
    async loadAndDisplayUserInfo(anchor, slug, normalizedSlug) {
      const namesContainer = anchor.closest(".names");
      if (!namesContainer) return;
      const existingInfo = namesContainer.querySelector(`.user-reg-info[data-user="${normalizedSlug}"]`);
      if (existingInfo) {
        console.log(`\u7528\u6237 ${normalizedSlug} \u4FE1\u606F\u5DF2\u5B58\u5728\uFF0C\u8DF3\u8FC7`);
        const button2 = namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`);
        if (button2) button2.remove();
        return;
      }
      const info = await this.fetchUserInfo(slug, normalizedSlug);
      if (!info) {
        const button2 = namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`);
        if (button2) {
          button2.textContent = "\u{1F4CA}";
          button2.disabled = false;
        }
        return;
      }
      const infoNode = this.buildInfoNode(info, normalizedSlug);
      if (!infoNode) {
        const button2 = namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`);
        if (button2) {
          button2.textContent = "\u{1F4CA}";
          button2.disabled = false;
        }
        return;
      }
      const finalCheck = namesContainer.querySelector(`.user-reg-info[data-user="${normalizedSlug}"]`);
      if (finalCheck) {
        console.log(`\u7528\u6237 ${normalizedSlug} \u4FE1\u606F\u5728\u7B49\u5F85\u671F\u95F4\u5DF2\u88AB\u6DFB\u52A0\uFF0C\u8DF3\u8FC7`);
        const button2 = namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`);
        if (button2) button2.remove();
        return;
      }
      const button = namesContainer.querySelector(`.user-info-btn[data-user="${normalizedSlug}"]`);
      if (button) button.remove();
      anchor.insertAdjacentElement("afterend", infoNode);
      if (!namesContainer.querySelector(`.user-topics-btn[data-user="${normalizedSlug}"]`)) {
        this.addTopicsButton(anchor, slug, normalizedSlug);
      }
    }
    async fetchUserInfo(slug, normalizedSlug) {
      if (this.userInfoCache.has(normalizedSlug)) {
        return this.userInfoCache.get(normalizedSlug);
      }
      if (this.pendingRequests.has(normalizedSlug)) {
        return this.pendingRequests.get(normalizedSlug);
      }
      const requestPromise = this.doFetchUserInfo(slug, normalizedSlug);
      this.pendingRequests.set(normalizedSlug, requestPromise);
      try {
        const info = await requestPromise;
        if (info) {
          this.userInfoCache.set(normalizedSlug, info);
        }
        return info;
      } finally {
        this.pendingRequests.delete(normalizedSlug);
      }
    }
    async doFetchUserInfo(slug, normalizedSlug) {
      try {
        const PROFILE_API_BUILDERS = [
          (s) => `${BASE_URL}/u/${encodeURIComponent(s)}.json`,
          (s) => `${BASE_URL}/users/${encodeURIComponent(s)}.json`
        ];
        const SUMMARY_API_BUILDERS = [
          (s) => `${BASE_URL}/u/${encodeURIComponent(s)}/summary.json`,
          (s) => `${BASE_URL}/users/${encodeURIComponent(s)}/summary.json`
        ];
        const [profileData, summaryData] = await Promise.all([
          this.fetchFirstAvailable(PROFILE_API_BUILDERS, slug),
          this.fetchFirstAvailable(SUMMARY_API_BUILDERS, slug)
        ]);
        if (!profileData && !summaryData) {
          return null;
        }
        const user = profileData && (profileData.user || profileData);
        const summary = summaryData && (summaryData.user_summary || summaryData.summary || summaryData);
        const createdAt = this.pickCreatedAt(user) || summary && this.pickCreatedAt(summary);
        if (!createdAt) {
          return null;
        }
        const topicCount = this.pickFirstNumber(
          user && (user.topic_count ?? user.topicCount),
          summary && (summary.topic_count ?? summary.topics_count)
        );
        const totalPostCount = this.pickFirstNumber(
          user && (user.post_count ?? user.postCount),
          summary && (summary.post_count ?? summary.posts_count)
        );
        let repliesCount = this.pickFirstNumber(
          summary && (summary.replies_count ?? summary.reply_count)
        );
        if (repliesCount === null && totalPostCount !== null && topicCount !== null) {
          repliesCount = Math.max(0, totalPostCount - topicCount);
        }
        const trustLevelRaw = this.pickFirstValue(
          user && (user.trust_level ?? user.trustLevel),
          summary && (summary.trust_level ?? summary.trustLevel)
        );
        const trustLevel = this.normalizeTrustLevel(trustLevelRaw);
        const days = this.calcDays(createdAt);
        return {
          slug: normalizedSlug,
          createdAt,
          days,
          topicCount: typeof topicCount === "number" && Number.isFinite(topicCount) ? topicCount : void 0,
          repliesCount: typeof repliesCount === "number" && Number.isFinite(repliesCount) ? repliesCount : void 0,
          trustLevel
        };
      } catch (error) {
        console.error("\u83B7\u53D6\u7528\u6237\u4FE1\u606F\u5931\u8D25:", slug, error);
        return null;
      }
    }
    async fetchFirstAvailable(builders, slug) {
      for (const builder of builders) {
        const url = builder(slug);
        const data = await this.safeFetchJson(url);
        if (data) {
          return data;
        }
      }
      return null;
    }
    async safeFetchJson(url) {
      try {
        const response = await RequestManager.run(
          `safe-fetch-${CURRENT_DOMAIN}-${url}`,
          async () => {
            const r = await fetch(url, { credentials: "include" });
            if (r.status === 429) throw new Error(`429 ${url}`);
            return r;
          },
          {
            minInterval: 1200,
            retries: 1,
            backoffBase: 1e3,
            cooldownKey: `safeFetch429Until_${CURRENT_DOMAIN}`,
            cooldownMs: 20 * 60 * 1e3
          }
        );
        if (!response || !response.ok) {
          return null;
        }
        return await response.json();
      } catch (error) {
        return null;
      }
    }
    pickFirstNumber(...values) {
      for (const value of values) {
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue)) {
          return numberValue;
        }
      }
      return null;
    }
    pickFirstValue(...values) {
      for (const value of values) {
        if (value !== void 0 && value !== null) {
          return value;
        }
      }
      return null;
    }
    normalizeTrustLevel(raw) {
      if (raw === void 0 || raw === null) {
        return void 0;
      }
      if (typeof raw === "number" && Number.isFinite(raw)) {
        return raw;
      }
      if (typeof raw === "string") {
        const TRUST_LEVEL_ALIAS = {
          newuser: 0,
          basic: 1,
          member: 2,
          regular: 3,
          leader: 4
        };
        const alias = TRUST_LEVEL_ALIAS[raw.toLowerCase()];
        if (alias !== void 0) {
          return alias;
        }
        const numeric = Number(raw);
        if (!Number.isNaN(numeric)) {
          return numeric;
        }
      }
      return void 0;
    }
    pickCreatedAt(source) {
      if (!source) {
        return null;
      }
      return source.created_at || source.createdAt || source.registration_date || source.registrationDate || source.joined || source.joinedAt || null;
    }
    calcDays(createdAt) {
      const createdTime = new Date(createdAt).getTime();
      if (Number.isNaN(createdTime)) {
        return 0;
      }
      const diff = Date.now() - createdTime;
      return Math.max(0, Math.floor(diff / this.DAY_IN_MS));
    }
    buildInfoNode(info, normalizedSlug) {
      const segments = [`\u6CE8\u518C ${this.formatNumber(info.days)} \u5929`];
      if (typeof info.topicCount === "number" && Number.isFinite(info.topicCount)) {
        segments.push(`\u53D1\u5E16 ${this.formatNumber(info.topicCount)}`);
      }
      if (typeof info.repliesCount === "number" && Number.isFinite(info.repliesCount)) {
        segments.push(`\u56DE\u5E16 ${this.formatNumber(info.repliesCount)}`);
      }
      if (typeof info.trustLevel === "number" && Number.isFinite(info.trustLevel)) {
        const FULL_TRUST_LEVEL_LABELS = {
          0: "Lv0 \u65B0\u624B",
          1: "Lv1 \u5165\u95E8",
          2: "Lv2 \u6210\u5458",
          3: "Lv3 \u5E38\u9A7B",
          4: "Lv4 \u9886\u8896"
        };
        const label = FULL_TRUST_LEVEL_LABELS[info.trustLevel] || `\u4FE1\u4EFB\u7EA7\u522B Lv${info.trustLevel}`;
        segments.push(label);
      }
      if (!segments.length) {
        return null;
      }
      const span = document.createElement("span");
      span.className = "user-reg-info";
      span.setAttribute("data-user", normalizedSlug);
      span.textContent = ` \xB7 ${segments.join(" \xB7 ")}`;
      span.style.cssText = `
            margin-left: 6px;
            font-size: 12px;
            color: #1a4c7c;
        `;
      return span;
    }
    formatNumber(value) {
      return Number(value).toLocaleString("zh-CN");
    }
  };

  // src/controller/mixins/panel.js
  var methods = {
    applyTopicAgeHighlightColors() {
      const root = document.documentElement;
      root.style.setProperty("--lda-topic-age-fresh", "#86efac");
      root.style.setProperty("--lda-topic-age-old", "#fdba74");
      root.style.setProperty("--lda-topic-age-ancient", "#fca5a5");
      root.style.setProperty("--lda-topic-age-enabled", this.topicAgeColorEnabled ? "1" : "0");
    },
    createTopicAgeColorSettings() {
      const section = document.createElement("div");
      section.className = "topic-created-time-settings";
      const visibilityToggleRow = this.createToggleRow(
        this.t("topicCreatedTimeVisible"),
        this.topicCreatedTimeVisible,
        (checked) => {
          this.topicCreatedTimeVisible = checked;
          Storage.set("topicCreatedTimeVisible", checked);
          this.renderTopicCreatedTimeInList();
          this.showNotification(checked ? this.t("topicCreatedTimeEnabled") : this.t("topicCreatedTimeDisabled"));
        }
      );
      visibilityToggleRow.title = this.t("topicCreatedTimeVisibleTip");
      section.appendChild(visibilityToggleRow);
      const toggleRow = this.createToggleRow(
        this.t("topicAgeColorLabel"),
        this.topicAgeColorEnabled,
        (checked) => {
          this.topicAgeColorEnabled = checked;
          Storage.set("topicAgeColorEnabled", checked);
          this.applyTopicAgeHighlightColors();
          this.renderTopicCreatedTimeInList();
          this.showNotification(checked ? this.t("topicAgeColorEnabled") : this.t("topicAgeColorDisabled"));
        }
      );
      toggleRow.title = this.t("topicAgeColorTip");
      section.appendChild(toggleRow);
      return section;
    },
    createInnerCollapsibleSection(title, contentNode, collapsed = true, headerControl = null) {
      const wrapper = document.createElement("div");
      wrapper.className = `settings-inner-collapsible${collapsed ? " collapsed" : ""}`;
      const header = document.createElement("div");
      header.className = "settings-inner-collapsible-header";
      const titleElement = document.createElement("span");
      titleElement.textContent = title;
      const collapseIcon = document.createElement("span");
      collapseIcon.className = "collapse-icon";
      collapseIcon.setAttribute("aria-hidden", "true");
      header.appendChild(titleElement);
      if (headerControl) {
        const controls = document.createElement("span");
        controls.className = "settings-inner-collapsible-controls";
        headerControl.addEventListener("click", (event) => event.stopPropagation());
        controls.appendChild(headerControl);
        controls.appendChild(collapseIcon);
        header.appendChild(controls);
      } else {
        header.appendChild(collapseIcon);
      }
      const body = document.createElement("div");
      body.className = "settings-inner-collapsible-content";
      if (contentNode) body.appendChild(contentNode);
      header.addEventListener("click", () => wrapper.classList.toggle("collapsed"));
      wrapper.appendChild(header);
      wrapper.appendChild(body);
      return wrapper;
    },
    setupButton() {
      this.container = document.createElement("div");
      this.container.id = "my-gift-panel";
      this.container.className = "collapsed";
      this.container.innerHTML = `
            <svg id="my-gift-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v3h2v9c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-9h2V8c0-1.1-.9-2-2-2zm-9-2h2v2h-2V4zm0 16H6v-9h5v9zm6 0h-5v-9h5v9z" />
            </svg>
            <div id="my-gift-content">
                <div id="my-gift-header">
                    <div id="my-gift-title"><span>${this.t("panelTitle")}</span></div>
                    <span id="my-gift-close" title="\u5173\u95ED" role="button" aria-label="\u5173\u95ED">\xD7</span>
                </div>
                <div id="my-gift-body">
                    <div class="my-gift-tool-item" data-section-item="auto">
                        <button type="button" class="my-gift-tool" data-section="auto" aria-expanded="false">
                            <span class="my-gift-tool-text">${this.t("sectionAutoRead")}</span><span class="my-gift-tool-arrow">\u203A</span>
                        </button>
                        <div class="my-gift-tool-detail" data-section-content="auto"></div>
                    </div>
                    <div class="my-gift-tool-item" data-section-item="account-data">
                        <button type="button" class="my-gift-tool" data-section="account-data" aria-expanded="false">
                            <span class="my-gift-tool-text">${this.t("sectionAccountData")}</span><span class="my-gift-tool-arrow">\u203A</span>
                        </button>
                        <div class="my-gift-tool-detail account-data-detail" data-section-content="account-data">
                            <div class="account-data-sections">
                                <div class="my-gift-tool-item" data-section-item="account">
                                    <button type="button" class="my-gift-tool" data-section="account" aria-expanded="false">
                                        <span class="my-gift-tool-text">${this.t("sectionAccountInfo")}</span><span class="my-gift-tool-arrow">\u203A</span>
                                    </button>
                                    <div class="my-gift-tool-detail" data-section-content="account"></div>
                                </div>
                                <div class="my-gift-tool-item" data-section-item="credit">
                                    <button type="button" class="my-gift-tool" data-section="credit" aria-expanded="false">
                                        <span class="my-gift-tool-text">${this.t("sectionCredit")}</span><span class="my-gift-tool-arrow">\u203A</span>
                                    </button>
                                    <div class="my-gift-tool-detail" data-section-content="credit"></div>
                                </div>
                                <div class="my-gift-tool-item" data-section-item="cdk">
                                    <button type="button" class="my-gift-tool" data-section="cdk" aria-expanded="false">
                                        <span class="my-gift-tool-text">${this.t("sectionCdk")}</span><span class="my-gift-tool-arrow">\u203A</span>
                                    </button>
                                    <div class="my-gift-tool-detail" data-section-content="cdk"></div>
                                </div>
                                <div class="my-gift-tool-item" data-section-item="rank">
                                    <button type="button" class="my-gift-tool" data-section="rank" aria-expanded="false">
                                        <span class="my-gift-tool-text">${this.t("sectionRanking")}</span><span class="my-gift-tool-arrow">\u203A</span>
                                    </button>
                                    <div class="my-gift-tool-detail" data-section-content="rank"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="my-gift-tool-item" data-section-item="settings">
                        <button type="button" class="my-gift-tool" data-section="settings" aria-expanded="false">
                            <span class="my-gift-tool-text">${this.t("sectionPluginSettings")}</span><span class="my-gift-tool-arrow">\u203A</span>
                        </button>
                        <div class="my-gift-tool-detail" data-section-content="settings"></div>
                    </div>
                </div>
            </div>
        `;
      GM_addStyle(`
        #my-gift-panel {
            position: fixed !important;
            right: 20px;
            bottom: 20px;
            z-index: 2147483647 !important;
            width: fit-content;
            min-width: 280px;
            max-width: 450px;
            background: #fff !important;
            border: 1px solid #e0e0e0 !important;
            border-radius: 12px;
            box-shadow:
                0 8px 28px rgba(0, 0, 0, .14);
            max-height: calc(100vh - 40px);
            box-sizing: border-box;
            overflow-x: hidden;
            overflow-y: auto;
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                Roboto,
                "Microsoft YaHei",
                Arial,
                sans-serif;
            color: #333;
            line-height: normal !important;
            transform-origin: bottom right;
            transition:
                width .22s ease,
                height .22s ease,
                border-radius .22s ease,
                box-shadow .22s ease;
            user-select: none;
        }
        #my-gift-panel.collapsed {
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
            max-width: 50px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            display: flex !important;
            justify-content: center;
            align-items: center;
            cursor: grab;
            background: #fff !important;
            color: #0078d4 !important;
            border:
                1px solid #e0e0e0 !important;
            box-shadow:
                0 4px 16px
                rgba(0, 120, 212, .30) !important;
            transition:
                width .22s ease,
                height .22s ease,
                transform .18s ease,
                box-shadow .18s ease;
        }
        #my-gift-panel.collapsed:hover {
            transform: scale(1.08);
            box-shadow:
                0 7px 22px
                rgba(0, 120, 212, .40) !important;
        }
        #my-gift-panel.dragging {
            cursor: grabbing !important;
            transition: none !important;
            transform: none !important;
            box-shadow:
                0 10px 28px
                rgba(0, 120, 212, .35) !important;
        }
        #my-gift-panel.collapsed > #my-gift-icon {
            display: block !important;
            width: 31px !important;
            height: 31px !important;
            margin: 0 !important;
            padding: 0 !important;
            fill: currentColor !important;
            pointer-events: none !important;
            flex-shrink: 0;
        }
        #my-gift-panel:not(.collapsed) {
            width: fit-content !important;
            min-width: 280px;
            max-width: 450px;
            min-height: 180px;
        }
        #my-gift-panel:not(.collapsed) > #my-gift-icon {
            display: none !important;
        }
        #my-gift-content {
            width: 100%;
            min-width: 0;
        }
        #my-gift-panel.collapsed #my-gift-content {
            display: none !important;
        }
        #my-gift-header {
            height: 52px;
            padding:
                0 10px 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background:
                linear-gradient(
                    135deg,
                    #f8fbfe,
                    #f4f7fa
                ) !important;
            border-bottom:
                1px solid #eeeeee;
            box-shadow:
                0 1px 0 rgba(0, 0, 0, .01);
            user-select: none;
        }
        #my-gift-title {
            display: flex;
            align-items: center;
            font-size: 14px;
            font-weight: 600;
            color: #30343b;
        }
        #my-gift-close {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            color: #8a9199;
            font-size: 21px;
            line-height: 1;
            cursor: pointer;
            transition:
                background .18s ease,
                color .18s ease,
                transform .18s ease;
        }
        #my-gift-close:hover {
            background: #e9edf1;
            color: #343a40;
            transform: rotate(90deg);
        }
        #my-gift-body {
            padding: 8px 12px;
            min-width: 0;
        }
        .my-gift-tool {
            width: 100%;
            min-height: 41px;
            margin: 0;
            padding:
                0 12px;
            display: flex;
            align-items: center;
            gap: 0;
            border: 0 !important;
            border-radius: 0 !important;
            background: #fff !important;
            color: #333 !important;
            font-family: inherit;
            font-size: 13px;
            text-align: left;
            cursor: pointer;
            outline: none;
            transition:
                background .18s ease,
                color .18s ease;
        }
        .my-gift-tool:hover {
            background: #f8fbfe !important;
        }
        .my-gift-tool:active {
            background: #f1f6fa !important;
        }
        .my-gift-tool-text {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .my-gift-tool-arrow {
            color: #a0a7af;
            font-size: 16px;
            flex-shrink: 0;
            transition: transform .18s ease;
        }
        .my-gift-tool[aria-expanded="true"] .my-gift-tool-arrow {
            transform: rotate(90deg);
        }
        .my-gift-tool-item {
            margin-bottom: 8px;
            min-width: 0;
            overflow: hidden;
            border:
                1px solid #e1e6eb;
            border-radius: 9px;
            background: #fff;
        }
        .my-gift-tool-item:last-child {
            margin-bottom: 0;
        }
        .my-gift-tool-detail {
            display: none;
            padding: 10px 0;
            min-width: 0;
            border: 0;
            border-top:
                1px solid #e1e6eb;
            border-radius: 0;
            background: #f5f8fb;
            color: #8a9199;
            font-size: 12px;
            line-height: 1.5;
        }
        .my-gift-tool[aria-expanded="true"] {
            border-radius: 0 !important;
        }
        .my-gift-tool[aria-expanded="true"] + .my-gift-tool-detail {
            display: block;
        }
        #my-gift-panel .account-data-detail {
            padding: 4px 0 8px;
        }
        #my-gift-panel .account-data-sections > .my-gift-tool-item {
            margin: 0;
            overflow: visible;
            border: 0;
            border-radius: 0;
            background: transparent;
        }
        #my-gift-panel .account-data-sections > .my-gift-tool-item > .my-gift-tool {
            min-height: 34px;
            padding: 0 12px;
            border-radius: 0 !important;
            background: transparent !important;
        }
        #my-gift-panel .account-data-sections > .my-gift-tool-item > .my-gift-tool:hover {
            background: #edf4f9 !important;
        }
        #my-gift-panel .account-data-sections > .my-gift-tool-item > .my-gift-tool-detail {
            margin: 0 8px 6px;
            padding: 0;
            border: 0;
            background: transparent;
        }
        #my-gift-panel .account-data-sections > .my-gift-tool-item:last-child > .my-gift-tool-detail {
            margin-bottom: 0;
        }
        @media screen and (max-width: 400px) {
            #my-gift-panel:not(.collapsed) {
                width:
                    calc(100vw - 30px) !important;
                min-width: min(220px, calc(100vw - 30px));
                max-width: calc(100vw - 30px) !important;
            }
            #my-gift-panel.collapsed {
                right: 10px !important;
                bottom: 10px !important;
            }
        }
#my-gift-panel .my-gift-tool-item {
    user-select: none;
}
#my-gift-panel .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 34px;
    margin: 0 0 6px;
    padding: 7px 8px;
    box-sizing: border-box;
    border: 1px solid #e1e6eb;
    border-radius: 7px;
    background: #fff;
    color: #333;
}
#my-gift-panel .toggle-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .toggle-label,
#my-gift-panel .section-title,
#my-gift-panel .trust-level-header,
#my-gift-panel .trust-level-name,
#my-gift-panel .trust-level-loading {
    color: #333;
}
#my-gift-panel .toggle-switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 18px;
    flex-shrink: 0;
}
#my-gift-panel .toggle-switch input {
    width: 0;
    height: 0;
    opacity: 0;
}
#my-gift-panel .toggle-slider {
    position: absolute;
    inset: 0;
    border-radius: 18px;
    background: #cbd5df;
    cursor: pointer;
    transition: background .18s ease;
}
#my-gift-panel .toggle-slider:before {
    position: absolute;
    width: 14px;
    height: 14px;
    left: 2px;
    top: 2px;
    border-radius: 50%;
    background: #fff;
    content: '';
    transition: transform .18s ease;
}
#my-gift-panel .toggle-switch input:checked + .toggle-slider {
    background: #0078d4;
}
#my-gift-panel .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(16px);
}
#my-gift-panel .toggle-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 8px;
}
#my-gift-panel .toggle-grid .toggle-row {
    margin: 0;
}
@media screen and (max-width: 400px) {
    #my-gift-panel .toggle-grid.smart-like-controls {
        grid-template-columns: minmax(0, 1fr);
    }
}
#my-gift-panel .main-action-btn,
#my-gift-panel .read-action-btn,
#my-gift-panel .reveal-users-btn {
    width: 100%;
    min-height: 38px;
    margin: 0 0 6px;
    padding: 8px 12px;
    border: 1px solid #d7e1e9;
    border-radius: 7px;
    background: #0078d4;
    color: #fff;
    font: inherit;
    cursor: pointer;
}
#my-gift-panel .main-action-btn.running {
    background: #d9534f;
}
#my-gift-panel .main-action-btn:hover,
#my-gift-panel .read-action-btn:hover,
#my-gift-panel .reveal-users-btn:hover {
    filter: brightness(.96);
}
#my-gift-panel .read-stats-container,
#my-gift-panel .like-counter-container,
#my-gift-panel .trust-level-row,
#my-gift-panel .credit-info-row,
#my-gift-panel .cdk-info-row,
#my-gift-panel .rank-data-container,
#my-gift-panel .topic-status-container {
    box-sizing: border-box;
    margin-top: 6px;
    padding: 8px;
    border: 1px solid #e1e6eb;
    border-radius: 8px;
    background: #f5f8fb;
    color: #333;
}
#my-gift-panel .cdk-info-row .credit-main-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 0 0 8px;
    padding: 8px 10px;
    border: 1px solid #cfe3f1 !important;
    border-radius: 7px;
    background: #eaf4fb !important;
}
#my-gift-panel .cdk-info-row {
    margin-top: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
}
#my-gift-panel .cdk-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    min-height: 27px;
    margin-bottom: 8px;
}
#my-gift-panel .cdk-panel-title {
    min-width: 0;
    overflow: hidden;
    color: #334155;
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .cdk-panel-refresh,
#my-gift-panel .cdk-received-refresh-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 27px;
    min-width: 27px;
    height: 27px;
    min-height: 27px;
    padding: 0;
    border-radius: 6px;
    font-size: 15px;
    line-height: 1;
}
#my-gift-panel .cdk-score-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    height: 50px;
    min-height: 50px;
    margin: 0 0 8px;
    padding: 6px 10px;
    box-sizing: border-box;
    border: 1px solid #cfe3f1;
    border-radius: 6px;
    background: #eaf4fb;
    text-align: left;
}
#my-gift-panel .cdk-score-card .credit-stat-label {
    min-width: 0;
    overflow: hidden;
    color: #64748b !important;
    font-size: 12px;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .cdk-score-card .cdk-score-value {
    display: block;
    flex: 0 0 auto;
    margin-top: 0;
    color: #0783b5 !important;
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    text-shadow: none !important;
}
#my-gift-panel .cdk-account-section {
    min-width: 0;
}
#my-gift-panel .cdk-section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    margin: 0 0 3px;
    color: #64748b;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
}
#my-gift-panel .cdk-account-list {
    min-width: 0;
}
#my-gift-panel .cdk-account-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
    margin: 0;
    padding: 5px 0;
    border-bottom: 1px solid #edf2f7;
    color: #475569;
    font-size: 11px;
    line-height: 1.4;
}
#my-gift-panel .cdk-account-item:last-child {
    border-bottom: 0;
}
#my-gift-panel .cdk-account-label {
    flex: 1 1 auto;
    min-width: 0;
    color: #64748b;
}
#my-gift-panel .cdk-account-value {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    min-width: 0;
    gap: 5px;
    color: #334155;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
}
#my-gift-panel .cdk-account-value.cdk-account-name-value {
    flex: 0 1 72%;
    max-width: 72%;
    overflow: hidden;
}
#my-gift-panel .cdk-account-name,
#my-gift-panel .cdk-account-username {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .cdk-account-username {
    color: #94a3b8;
    font-size: 10px;
    font-weight: 400;
}
#my-gift-panel .cdk-account-value.cdk-trust-level-value {
    color: #0078d4 !important;
}
#my-gift-panel .cdk-info-row .cdk-score-description {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    margin-top: 6px;
    min-height: 32px;
    padding: 4px 2px;
    border: 0;
    border-top: 1px solid #e1e6eb;
    border-radius: 0;
    background: transparent;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    text-align: left;
}
#my-gift-panel .cdk-info-row .cdk-received-section {
    margin-top: 7px;
    padding-top: 7px;
    border-top: 1px solid #e1e6eb;
}
#my-gift-panel .cdk-info-row .cdk-received-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    min-height: 27px;
    margin-bottom: 6px;
}
#my-gift-panel .cdk-received-title {
    min-width: 0;
    overflow: hidden;
    color: #475569;
    font-size: 11px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .cdk-received-limit {
    color: #94a3b8;
    font-size: 10px;
    font-weight: 400;
}
#my-gift-panel .cdk-info-row .cdk-received-total {
    margin: 0 0 5px;
    color: #94a3b8;
    font-size: 10px;
}
#my-gift-panel .cdk-info-row .cdk-received-items {
    max-height: 200px;
    padding-right: 2px;
    overflow-y: auto;
}
#my-gift-panel .cdk-info-row .cdk-received-item {
    margin-bottom: 5px;
    padding: 7px 8px;
    border-color: #e1e6eb;
    border-radius: 6px;
    background: #fff;
}
#my-gift-panel .cdk-info-row .cdk-received-item:last-child {
    margin-bottom: 0;
}
#my-gift-panel .cdk-info-row .cdk-content-row {
    border: 1px solid #edf2f7;
    background: #f8fafc;
}
#my-gift-panel .cdk-info-row .cdk-copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    min-width: 26px;
    height: 24px;
    min-height: 24px;
    padding: 0;
    border: 1px solid #b9d9ef;
    border-radius: 4px;
    background: #eaf4fb;
    color: #0078d4;
    font-size: 14px;
    line-height: 1;
}
#my-gift-panel .cdk-info-row .cdk-copy-btn:hover {
    border-color: #8fc1e4;
    background: #dceefa;
}
#my-gift-panel .cdk-info-row .cdk-copy-btn.copied {
    border-color: #b7e4c7;
    background: #eaf8ef;
    color: #15803d;
}
#my-gift-panel .cdk-auth-state {
    display: flex;
    flex-direction: column;
    gap: 9px;
    padding: 2px 0 0;
}
#my-gift-panel .cdk-auth-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #334155;
    font-size: 12px;
    font-weight: 600;
}
#my-gift-panel .cdk-auth-dot {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #94a3b8;
}
#my-gift-panel .cdk-auth-message {
    margin: 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
}
#my-gift-panel .cdk-auth-actions {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #e1e6eb;
}
#my-gift-panel .cdk-info-row .credit-stat-label {
    color: #64748b !important;
    font-size: 11px;
}
#my-gift-panel .cdk-info-row .cdk-score-value {
    color: #0891b2 !important;
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    text-shadow: none !important;
}
#my-gift-panel .cdk-info-row > .trust-level-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    margin: 4px 0;
    padding: 3px 0;
    color: #475569 !important;
    font-size: 11px;
    line-height: 1.35;
}
#my-gift-panel .cdk-info-row > .trust-level-item .trust-level-name {
    min-width: 0;
    color: #475569 !important;
}
#my-gift-panel .cdk-info-row > .trust-level-item .trust-level-value {
    flex-shrink: 0;
    color: #334155 !important;
    text-align: right;
    white-space: nowrap;
}
#my-gift-panel .cdk-info-row > .trust-level-item .cdk-trust-level-value {
    color: #0078d4 !important;
    font-weight: 700;
}
#my-gift-panel .cdk-score-description {
    margin-top: 8px;
    padding: 6px 8px;
    border: 1px solid #e1e6eb;
    border-radius: 6px;
    background: #f8fafc;
    color: #475569;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.5;
}
#my-gift-panel .cdk-received-section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e1e6eb;
}
#my-gift-panel .cdk-received-header {
    margin-bottom: 8px;
}
#my-gift-panel .cdk-recent-limit {
    color: #94a3b8;
    font-size: 10px;
}
#my-gift-panel .cdk-received-list {
    color: #475569;
    font-size: 11px;
}
#my-gift-panel .cdk-received-loading,
#my-gift-panel .cdk-received-empty {
    padding: 10px;
    color: #64748b;
    text-align: center;
}
#my-gift-panel .cdk-received-extra-tip {
    color: #94a3b8;
    font-size: 9px;
}
#my-gift-panel .cdk-received-total {
    margin-bottom: 8px;
    color: #64748b;
    font-size: 10px;
}
#my-gift-panel .cdk-received-items {
    max-height: 200px;
    overflow-y: auto;
}
#my-gift-panel .cdk-received-item {
    box-sizing: border-box;
    margin-bottom: 6px;
    padding: 8px;
    border: 1px solid #e1e6eb;
    border-radius: 6px;
    background: #fff;
}
#my-gift-panel .cdk-received-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    margin-bottom: 4px;
}
#my-gift-panel .cdk-project-name {
    min-width: 0;
    overflow: hidden;
    color: #0078d4;
    font-size: 11px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .cdk-received-time {
    flex-shrink: 0;
    color: #64748b;
    font-size: 9px;
}
#my-gift-panel .cdk-received-creator {
    margin-bottom: 4px;
    color: #64748b;
    font-size: 10px;
}
#my-gift-panel .cdk-content-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    background: #f1f5f9;
}
#my-gift-panel .cdk-content {
    flex: 1;
    min-width: 0;
    color: #a16207;
    font-family: monospace;
    font-size: 11px;
    word-break: break-all;
}
#my-gift-panel .cdk-copy-btn {
    flex-shrink: 0;
    padding: 2px 8px;
    border: 1px solid #b9d9ef;
    border-radius: 4px;
    background: #eaf4fb;
    color: #0078d4;
    font-size: 10px;
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease;
    white-space: nowrap;
}
#my-gift-panel .cdk-copy-btn:hover {
    border-color: #8fc1e4;
    background: #dceefa;
}
#my-gift-panel .cdk-auth-tip {
    margin-bottom: 8px;
    color: #64748b;
    font-size: 11px;
    text-align: center;
}
#my-gift-panel .cdk-auth-block {
    margin-top: 10px;
    text-align: center;
}
#my-gift-panel .trust-level-item,
#my-gift-panel .rank-item {
    color: #333 !important;
}
#my-gift-panel .trust-level-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 24px;
    margin-bottom: 8px;
    color: #334155 !important;
    font-size: 12px;
    font-weight: 600;
}
#my-gift-panel .trust-level-header > span {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .trust-level-refresh {
    flex-shrink: 0;
    min-height: 24px;
    padding: 3px 8px;
    border: 1px solid #cfe3f1;
    border-radius: 5px;
    background: #eaf4fb;
    color: #0078d4;
    font: inherit;
    font-size: 10px;
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease, transform .18s ease;
}
#my-gift-panel .trust-level-refresh:hover {
    background: #dceefa;
    border-color: #9cc9e7;
    transform: translateY(-1px);
}
#my-gift-panel .trust-level-refresh:disabled {
    opacity: .55;
    cursor: not-allowed;
    transform: none;
}
#my-gift-panel .trust-level-row .trust-level-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    min-width: 0;
    margin: 4px 0;
    padding: 3px 0;
    color: #475569 !important;
    font-size: 11px;
    line-height: 1.35;
    white-space: nowrap;
}
#my-gift-panel .trust-level-row .trust-level-name {
    flex-shrink: 0;
    width: 110px;
    min-width: 110px;
    margin-right: 4px;
    overflow: hidden;
    color: #475569 !important;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .trust-level-row .trust-level-progress {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    min-width: 0;
    gap: 4px;
}
#my-gift-panel .trust-level-row .trust-level-bar {
    display: none;
}
#my-gift-panel .trust-level-row .trust-level-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    min-width: 75px;
    gap: 3px;
    color: #334155 !important;
    text-align: right;
    white-space: nowrap;
}
#my-gift-panel .trust-level-row .change-indicator {
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 600;
    line-height: 1;
}
#my-gift-panel .trust-level-row .change-up {
    color: #15803d;
}
#my-gift-panel .trust-level-row .change-down {
    color: #dc2626;
}
#my-gift-panel .trust-level-row [style*="background: rgba(255, 255, 255, 0.25)"] {
    background: #eaf8ef !important;
    border: 1px solid #b7e4c7;
}
#my-gift-panel .trust-level-row [style*="background: rgba(255, 255, 255, 0.15)"] {
    background: #fff7ed !important;
    border: 1px solid #fed7aa;
}
#my-gift-panel .trust-level-row [style*="color: #fff"] {
    color: #15803d !important;
}
#my-gift-panel .trust-level-row [style*="color: rgba(255, 255, 255, 0.9)"] {
    color: #b45309 !important;
}
#my-gift-panel .trust-level-row [style*="color: rgba(255,255,255,0.6)"] {
    color: #64748b !important;
}
#my-gift-panel .rank-data-container .rank-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    margin: 2px 0;
    padding: 6px 8px;
    border: 1px solid #e1e6eb;
    border-radius: 6px;
    background: #fff;
    color: #334155 !important;
}
#my-gift-panel .rank-period,
#my-gift-panel .rank-values {
    display: flex;
    align-items: center;
    min-width: 0;
}
#my-gift-panel .rank-period {
    flex: 1;
    gap: 4px;
    color: #334155 !important;
    font-size: 11px;
}
#my-gift-panel .rank-period-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .rank-values {
    flex-shrink: 0;
    gap: 8px;
    font-size: 11px;
}
#my-gift-panel .rank-score {
    color: #a16207;
    font-weight: 600;
    white-space: nowrap;
}
#my-gift-panel .rank-position {
    min-width: 45px;
    color: #0078d4;
    text-align: right;
    white-space: nowrap;
}
#my-gift-panel .rank-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    margin-top: 6px;
    padding-top: 4px;
    border-top: 1px solid #e1e6eb;
}
#my-gift-panel .rank-detail-link {
    overflow: hidden;
    color: #0078d4;
    font-size: 10px;
    text-overflow: ellipsis;
    text-decoration: none;
    white-space: nowrap;
}
#my-gift-panel .rank-update-time {
    flex-shrink: 0;
    color: #64748b;
    font-size: 9px;
    white-space: nowrap;
}
#my-gift-panel .read-stats-container {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 8px;
    min-width: 0;
    background: #f5f8fb !important;
    border: 1px solid #e1e6eb;
    color: #334155;
}
#my-gift-panel .read-stat {
    flex: 1;
    min-width: 0;
    text-align: center;
}
#my-gift-panel .read-stat-label {
    overflow: hidden;
    color: #64748b;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .read-stat-value {
    font-size: 16px;
    font-weight: 700;
}
#my-gift-panel .read-stat-today {
    color: #15803d;
}
#my-gift-panel .read-stat-total {
    color: #a16207;
}
#my-gift-panel .read-stat-divider {
    width: 1px;
    height: 24px;
    flex-shrink: 0;
    background: #d5dee7;
}
#my-gift-panel .like-counter-container {
    background: #f5f8fb !important;
    border-color: #e1e6eb !important;
    color: #475569 !important;
}
#my-gift-panel .like-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-width: 0;
}
#my-gift-panel .like-status-label {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 4px;
    color: #475569;
    font-size: 11px;
}
#my-gift-panel .like-status-label span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .like-sync-btn {
    flex-shrink: 0;
    cursor: pointer;
    opacity: .7;
}
#my-gift-panel .like-status-value {
    flex-shrink: 0;
    color: #0078d4;
    font-size: 16px;
    font-weight: 700;
}
#my-gift-panel .like-status-limit {
    flex-shrink: 0;
    color: #64748b;
    font-size: 11px;
}
#my-gift-panel .like-progress-track {
    width: 100%;
    height: 4px;
    margin-top: 4px;
    overflow: hidden;
    border-radius: 2px;
    background: #dfe7ef;
}
#my-gift-panel .like-progress-fill {
    height: 100%;
    border-radius: 2px;
    transition: width .3s;
}
#my-gift-panel .like-cooldown-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    min-width: 0;
    gap: 6px;
}
#my-gift-panel .like-cooldown-status {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    min-width: 0;
    gap: 6px;
}
#my-gift-panel .like-cooldown-label,
#my-gift-panel .like-cooldown-time {
    color: #dc2626;
}
#my-gift-panel .like-cooldown-label {
    font-size: 11px;
}
#my-gift-panel .like-cooldown-time {
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
}
#my-gift-panel .like-cooldown-clear-btn {
    flex: 0 0 auto;
    margin-left: auto;
    min-height: 24px;
    padding: 3px 6px;
    border: 1px solid #fecaca;
    border-radius: 4px;
    background: #fff;
    color: #b91c1c;
    cursor: pointer;
    font-size: 11px;
    line-height: 1.2;
}
#my-gift-panel .like-cooldown-clear-btn:hover {
    background: #fff1f2;
    border-color: #fca5a5;
}
#my-gift-panel .like-cooldown-clear-btn:disabled {
    cursor: default;
    opacity: .55;
}
#my-gift-panel .like-cooldown-clear-btn:focus-visible {
    outline: 2px solid #dc2626;
    outline-offset: 1px;
}
#my-gift-panel .topic-status-container {
    min-width: 0;
    color: #475569;
    font-size: 10px;
    line-height: 1.4;
}
#my-gift-panel .topic-status-heading {
    margin-bottom: 6px;
    overflow-wrap: anywhere;
    color: #334155;
    font-size: 11px;
}
#my-gift-panel .topic-status-type {
    color: #0078d4;
    font-weight: 600;
}
#my-gift-panel .topic-status-progress-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    margin-bottom: 4px;
}
#my-gift-panel .topic-status-progress-track {
    flex: 1;
    min-width: 0;
    height: 6px;
    overflow: hidden;
    border-radius: 3px;
    background: #dfe7ef;
}
#my-gift-panel .topic-status-progress-fill {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(90deg, #48bb78 0%, #68d391 100%);
    transition: width .3s;
}
#my-gift-panel .topic-status-percent {
    flex-shrink: 0;
    min-width: 35px;
    color: #64748b;
    text-align: right;
}
#my-gift-panel .topic-status-meta,
#my-gift-panel .topic-status-reading-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
    flex-wrap: wrap;
    color: #64748b;
}
#my-gift-panel .topic-status-reading-row {
    margin-bottom: 4px;
    color: #475569;
    font-size: 11px;
}
#my-gift-panel .topic-status-ready {
    margin-bottom: 4px;
    color: #15803d;
    font-size: 11px;
}
#my-gift-panel .topic-status-current,
#my-gift-panel .topic-status-remaining,
#my-gift-panel .topic-status-today {
    font-weight: 700;
}
#my-gift-panel .topic-status-current {
    color: #a16207;
}
#my-gift-panel .topic-status-remaining {
    color: #15803d;
}
#my-gift-panel .topic-status-today {
    color: #0078d4;
}
#my-gift-panel .topic-status-skipped,
#my-gift-panel .topic-status-warning {
    color: #b45309;
}
#my-gift-panel .topic-status-warning {
    margin-top: 2px;
    font-size: 9px;
}
#my-gift-panel .topic-status-notification {
    display: block;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #dfe7ef;
    color: #0078d4 !important;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.45;
    white-space: pre-line;
    overflow-wrap: anywhere;
}
#my-gift-panel .topic-status-content:empty + .topic-status-notification {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
}
#my-gift-panel [data-section-content="auto"] .toggle-row > .toggle-label:first-child,
#my-gift-panel [data-section-content="auto"] .toggle-row > div:first-child > .toggle-label:first-child,
#my-gift-panel [data-section-content="auto"] .read-stat-label,
#my-gift-panel [data-section-content="auto"] .like-status-label,
#my-gift-panel [data-section-content="auto"] .like-status-limit,
#my-gift-panel [data-section-content="auto"] .topic-status-container,
#my-gift-panel [data-section-content="auto"] .topic-status-heading,
#my-gift-panel [data-section-content="auto"] .topic-status-meta,
#my-gift-panel [data-section-content="auto"] .topic-status-reading-row {
    color: #475569 !important;
}
#my-gift-panel .settings-inner-collapsible {
    margin-top: 0;
    padding-top: 0;
    border-top: 1px dashed #dfe5eb;
}
#my-gift-panel [data-section-content="auto"] > .settings-inner-collapsible {
    border-top: 0;
}
#my-gift-panel .topic-created-time-settings,
#my-gift-panel .mode-settings-options {
    box-sizing: border-box;
    margin: 0 8px;
    padding: 0;
    border: 1px solid #e1e6eb;
    border-radius: 8px;
    background: #fff;
    overflow: hidden;
}
#my-gift-panel .topic-created-time-settings > .toggle-row,
#my-gift-panel .mode-settings-options > .toggle-row {
    margin: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
}
#my-gift-panel .my-gift-tool-detail[data-section-content="auto"] {
    padding-left: 8px;
    padding-right: 8px;
    padding-bottom: 4px;
}
#my-gift-panel .cf-bypass-section {
    margin: 0 8px;
}
#my-gift-panel .my-gift-tool-detail[data-section-content="settings"] {
    padding-top: 0;
    padding-bottom: 0;
}
#my-gift-panel [data-section-content="settings"] > .settings-inner-collapsible:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
}
#my-gift-panel .settings-inner-collapsible:not(.collapsed) + .settings-inner-collapsible {
    border-top: 0;
}
#my-gift-panel .settings-inner-collapsible-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 41px;
    box-sizing: border-box;
    padding: 0 12px;
    color: #555;
    font-size: 12px;
    cursor: pointer;
}
#my-gift-panel .settings-inner-collapsible-header > span:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .settings-inner-collapsible-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 18px;
    flex-shrink: 0;
}
#my-gift-panel .settings-inner-collapsible-header .collapse-icon {
    display: inline-block;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid #8a9199;
    font-size: 0;
    line-height: 0;
    flex-shrink: 0;
    transform: rotate(90deg);
    transition: transform .18s ease;
}
#my-gift-panel .settings-inner-collapsible.collapsed .collapse-icon {
    transform: rotate(0deg);
}
#my-gift-panel .settings-inner-collapsible-content {
    margin-top: 8px;
}
#my-gift-panel .settings-inner-collapsible.collapsed .settings-inner-collapsible-content {
    display: none;
}
#my-gift-panel .auto-read-parameter-settings > .toggle-row:last-child {
    margin-bottom: 0;
}
#my-gift-panel .cf-bypass-description {
    box-sizing: border-box;
    margin-bottom: 8px;
    padding: 8px 10px;
    border: 1px solid #e1e6eb;
    border-radius: 8px;
    background: #f5f8fb;
    color: #8a9199;
    font-size: 12px;
    line-height: 1.6;
    text-align: center;
    white-space: normal;
    overflow-wrap: anywhere;
}
#my-gift-panel .cf-bypass-section .reveal-users-btn {
    background: #0078d4;
    color: #fff;
    white-space: nowrap;
}
#my-gift-panel .section-divider {
    display: none;
}
#my-gift-panel .credit-footer {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #e1e6eb;
}
#my-gift-panel .cdk-info-row .cdk-footer {
    align-items: center;
    margin-top: 6px;
    padding: 5px 0 6px;
    border-top: 0;
    border-bottom: 1px solid #e1e6eb;
}
#my-gift-panel .cdk-info-row .cdk-footer .credit-link {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    color: #0078d4 !important;
    font-size: 11px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#my-gift-panel .cdk-info-row .cdk-footer .credit-update-time {
    flex: 0 0 auto;
    color: #64748b !important;
    font-size: 10px;
    line-height: 1.4;
    white-space: nowrap;
}
#my-gift-panel .credit-info-row {
    margin-top: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
}
#my-gift-panel .credit-info-row .credit-main-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 0 0 8px;
    padding: 8px 10px;
    border: 1px solid #d9e4ec;
    border-radius: 7px;
    background: #fff;
}
#my-gift-panel .credit-info-row .credit-stat-value {
    color: #0078d4;
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
}
#my-gift-panel .credit-info-row .credit-tomorrow-stat {
    border-color: #ead9ad;
    background: #fffaf0;
}
#my-gift-panel .credit-info-row .credit-tomorrow-stat .credit-stat-label {
    color: #926c1e !important;
}
#my-gift-panel .credit-info-row .credit-tomorrow-stat .credit-stat-value {
    color: #b7791f;
    font-size: 22px;
}
#my-gift-panel .credit-info-row .credit-summary-list,
#my-gift-panel .credit-info-row .credit-history-list {
    min-width: 0;
}
#my-gift-panel .credit-info-row .trust-level-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
    margin: 0;
    padding: 5px 0;
    border-bottom: 1px solid #edf2f7;
    color: #475569 !important;
    font-size: 11px;
    line-height: 1.4;
}
#my-gift-panel .credit-info-row .trust-level-item:last-child {
    border-bottom: 0;
}
#my-gift-panel .credit-info-row .trust-level-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
    color: #64748b !important;
}
#my-gift-panel .credit-info-row .trust-level-value {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;
    min-width: 0;
    gap: 5px;
    color: #334155 !important;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
}
#my-gift-panel .credit-info-row .credit-value-blue {
    color: #0078d4 !important;
}
#my-gift-panel .credit-info-row .credit-value-gold {
    color: #a16207 !important;
}
#my-gift-panel .credit-info-row .credit-value-green {
    color: #15803d !important;
}
#my-gift-panel .credit-info-row .credit-value-red {
    color: #dc2626 !important;
}
#my-gift-panel .credit-info-row .credit-rank-badge {
    padding: 2px 5px;
    border: 1px solid #cfe3f1;
    border-radius: 4px;
    background: #eaf4fb;
    color: #0078d4;
    font-size: 10px;
    font-weight: 500;
}
#my-gift-panel .credit-info-row .credit-history-section {
    margin-top: 10px;
}
#my-gift-panel .credit-info-row .credit-section-title {
    margin: 0 0 3px;
    padding-top: 8px;
    border-top: 1px solid #e1e6eb;
    color: #64748b !important;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.3;
}
#my-gift-panel .credit-info-row .credit-history-list .trust-level-item {
    padding: 4px 0;
}
#my-gift-panel .credit-auth-state {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 2px 0 0;
}
#my-gift-panel .credit-auth-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
}
#my-gift-panel .credit-auth-status {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    gap: 6px;
    color: #334155;
    font-size: 12px;
    font-weight: 600;
}
#my-gift-panel .credit-auth-dot {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #94a3b8;
}
#my-gift-panel .credit-auth-message {
    margin: 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.5;
}
#my-gift-panel .credit-auth-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid #e1e6eb;
}
#my-gift-panel .credit-auth-refresh {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 27px;
    min-width: 27px;
    height: 27px;
    min-height: 27px;
    padding: 0;
    border-radius: 6px;
    font-size: 15px;
    line-height: 1;
}
#my-gift-panel .credit-link {
    color: #0078d4 !important;
}
#my-gift-panel .credit-info-row .credit-stat-label,
#my-gift-panel .credit-info-row .credit-section-title,
#my-gift-panel .credit-info-row .credit-update-time {
    color: #475569 !important;
}
#my-gift-panel .credit-info-row .trust-level-value[style*="color: #fff"] {
    color: #64748b !important;
}
#my-gift-panel .credit-login-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: 26px;
    padding: 4px 10px;
    border: 1px solid #0078d4;
    border-radius: 6px;
    background: #0078d4 !important;
    color: #fff !important;
    font: inherit;
    font-size: 10px;
    font-weight: 600;
    line-height: 1.2;
    text-decoration: none;
    cursor: pointer;
    transition: background .18s ease, border-color .18s ease;
}
#my-gift-panel .credit-login-arrow {
    font-size: 13px;
    line-height: 1;
}
#my-gift-panel .credit-login-btn:hover {
    border-color: #005a9e;
    background: #005a9e !important;
}
@media screen and (max-width: 400px) {
    #my-gift-panel .trust-level-row .trust-level-name {
        width: 90px;
        min-width: 90px;
    }
    #my-gift-panel .trust-level-row .trust-level-value {
        min-width: 64px;
    }
}
.lda-topic-created-time {
    margin-left: 8px;
    color: #64748b;
    font-size: 11px;
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
    opacity: 1;
}
.lda-topic-created-label {
    color: rgba(255, 255, 255, 0.86);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    padding: 2px 8px;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}
.lda-topic-created-time[data-age-level="neutral"] .lda-topic-created-label {
    color: rgba(255, 255, 255, 0.86);
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}
.lda-topic-created-time[data-age-level="old"] .lda-topic-created-label {
    color: var(--lda-topic-age-old, #fdba74);
    background: rgba(251, 146, 60, 0.16);
    border-color: rgba(251, 146, 60, 0.34);
    box-shadow: 0 0 0 1px rgba(251, 146, 60, 0.05) inset;
}
.lda-topic-created-time[data-age-level="ancient"] .lda-topic-created-label {
    color: var(--lda-topic-age-ancient, #fca5a5);
    background: rgba(239, 68, 68, 0.16);
    border-color: rgba(239, 68, 68, 0.36);
    box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.05) inset;
}
.lda-topic-created-time[data-age-level="fresh"] .lda-topic-created-label {
    color: var(--lda-topic-age-fresh, #86efac);
    background: rgba(134, 239, 172, 0.14);
    border-color: rgba(134, 239, 172, 0.32);
    box-shadow: 0 0 0 1px rgba(134, 239, 172, 0.04) inset;
}
        `);
      document.body.appendChild(this.container);
      const closeBtn = this.container.querySelector("#my-gift-close");
      const autoButton = this.container.querySelector('[data-section="auto"]');
      const autoContent = this.container.querySelector('[data-section-content="auto"]');
      const sectionMap = {
        auto: [autoButton, autoContent],
        accountData: [this.container.querySelector('[data-section="account-data"]'), this.container.querySelector('[data-section-content="account-data"]')],
        account: [this.container.querySelector('[data-section="account"]'), this.container.querySelector('[data-section-content="account"]')],
        credit: [this.container.querySelector('[data-section="credit"]'), this.container.querySelector('[data-section-content="credit"]')],
        cdk: [this.container.querySelector('[data-section="cdk"]'), this.container.querySelector('[data-section-content="cdk"]')],
        rank: [this.container.querySelector('[data-section="rank"]'), this.container.querySelector('[data-section-content="rank"]')],
        settings: [this.container.querySelector('[data-section="settings"]'), this.container.querySelector('[data-section-content="settings"]')]
      };
      const setSectionExpanded = (button, sectionContent, expanded) => {
        button.setAttribute("aria-expanded", String(expanded));
      };
      this.setSectionExpanded = setSectionExpanded;
      const bindSection = (key, onExpand) => {
        const [button, sectionContent] = sectionMap[key];
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          const expanded = button.getAttribute("aria-expanded") === "true";
          setSectionExpanded(button, sectionContent, !expanded);
          if (!expanded && onExpand) onExpand();
          const rect = this.container.getBoundingClientRect();
          applyPosition(rect.left, rect.top);
          savePosition();
        });
      };
      const applyPosition = (left, top, dimensions = null) => {
        const width = dimensions?.width || this.container.offsetWidth;
        const height = dimensions?.height || this.container.offsetHeight;
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const maxLeft = Math.max(0, viewportWidth - width);
        const maxTop = Math.max(0, viewportHeight - height);
        this.container.style.right = "auto";
        this.container.style.bottom = "auto";
        this.container.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
        this.container.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;
      };
      const savePosition = () => {
        const rect = this.container.getBoundingClientRect();
        localStorage.setItem("my-gift-position", JSON.stringify({ left: rect.left, top: rect.top }));
      };
      const hasSavedPosition = () => {
        try {
          return Boolean(localStorage.getItem("my-gift-position"));
        } catch (_) {
          return false;
        }
      };
      const restorePosition = (dimensions = null) => {
        try {
          const saved = JSON.parse(localStorage.getItem("my-gift-position") || "null");
          if (saved && typeof saved.left === "number" && typeof saved.top === "number") {
            applyPosition(saved.left, saved.top, dimensions);
          }
        } catch (_) {
        }
      };
      const measurePanelSize = (collapsed) => {
        const wasCollapsed = this.container.classList.contains("collapsed");
        const transition = this.container.style.transition;
        this.container.style.transition = "none";
        this.container.classList.toggle("collapsed", collapsed);
        const size = { width: this.container.offsetWidth, height: this.container.offsetHeight };
        this.container.classList.toggle("collapsed", wasCollapsed);
        this.container.style.transition = transition;
        return size;
      };
      const getExpandedPosition = (rect, size) => {
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        let left = rect.left;
        let top = rect.top;
        if (left + size.width > viewportWidth) left = rect.right - size.width;
        if (top + size.height > viewportHeight) top = rect.bottom - size.height;
        return { left, top };
      };
      const openPanel = () => {
        const collapsedRect = this.container.getBoundingClientRect();
        const expandedSize = measurePanelSize(false);
        const expandedPosition = getExpandedPosition(collapsedRect, expandedSize);
        this.container.classList.remove("collapsed");
        applyPosition(expandedPosition.left, expandedPosition.top, expandedSize);
      };
      const closePanel = () => {
        const expandedRect = this.container.getBoundingClientRect();
        const collapsedSize = measurePanelSize(true);
        this.container.classList.add("collapsed");
        if (hasSavedPosition()) {
          restorePosition(collapsedSize);
        } else {
          applyPosition(
            expandedRect.right - collapsedSize.width,
            expandedRect.bottom - collapsedSize.height,
            collapsedSize
          );
        }
      };
      requestAnimationFrame(restorePosition);
      let dragging = false;
      let moved = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;
      this.container.addEventListener("mousedown", (event) => {
        if (event.button !== 0 || event.target.closest?.('button, a, input, select, textarea, [role="button"]')) return;
        const rect = this.container.getBoundingClientRect();
        dragging = true;
        moved = false;
        startX = event.clientX;
        startY = event.clientY;
        startLeft = rect.left;
        startTop = rect.top;
        applyPosition(startLeft, startTop);
        this.container.classList.add("dragging");
        event.preventDefault();
      });
      document.addEventListener("mousemove", (event) => {
        if (!dragging) return;
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) moved = true;
        applyPosition(startLeft + deltaX, startTop + deltaY);
      });
      document.addEventListener("mouseup", () => {
        if (!dragging) return;
        dragging = false;
        this.container.classList.remove("dragging");
        if (moved) savePosition();
      });
      this.container.addEventListener("click", (event) => {
        if (moved) {
          moved = false;
          event.stopPropagation();
          return;
        }
        if (this.container.classList.contains("collapsed")) openPanel();
      });
      closeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        closePanel();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !this.container.classList.contains("collapsed")) closePanel();
      });
      window.addEventListener("resize", () => {
        const rect = this.container.getBoundingClientRect();
        applyPosition(rect.left, rect.top);
        savePosition();
      });
      const observer = new MutationObserver(() => {
        if (document.body && !document.getElementById("my-gift-panel")) {
          document.body.appendChild(this.container);
          restorePosition();
        }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      this.button = document.createElement("button");
      this.button.className = "main-action-btn" + (this.autoRunning ? " running" : "");
      this.button.innerHTML = this.autoRunning ? `<span class="btn-icon">\u23F8</span><span class="btn-text">${this.t("stopReading")}</span>` : `<span class="btn-icon">\u25B6</span><span class="btn-text">${this.t("startReading")}</span>`;
      this.button.addEventListener("click", () => this.handleButtonClick());
      this.readStatsContainer = document.createElement("div");
      this.readStatsContainer.className = "read-stats-container";
      this.readStatsContainer.style.cssText = `
            display: flex;
            justify-content: space-around;
            align-items: center;
            background: #f5f8fb;
            padding: 6px 10px;
            border-radius: 8px;
            margin-top: 6px;
            border: 1px solid #e1e6eb;
            color: #334155;
        `;
      this.updateReadStatsDisplay();
      this.likeCounterContainer = document.createElement("div");
      this.likeCounterContainer.className = "like-counter-container";
      this.likeCounterContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            background: #f5f8fb;
            padding: 8px 12px;
            border-radius: 8px;
            margin-top: 6px;
            border: 1px solid #e1e6eb;
            font-size: 12px;
            color: #475569;
        `;
      this.likeCounterContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span class="like-counter-label">\u2764\uFE0F ${this.t("likeRemaining")}</span>
                <span class="like-counter-value" style="font-weight: 600;">-- / --</span>
            </div>
        `;
      this.likeCounterContainer.style.cursor = "pointer";
      this.likeCounterContainer.title = this.t("likeCountMismatch");
      this.likeCounterContainer.addEventListener("click", () => {
        if (this.likeCounter) {
          this.showNotification(this.t("likeSyncing"));
          this.likeCounter.manualSync().then(() => {
            this.showNotification(this.t("likeSyncSuccess"));
          });
        }
      });
      const smartLikeRow = this.createToggleRow(
        this.t("smartLike"),
        this.smartLikeEnabled,
        (checked) => this.setSmartLikeEnabled(checked)
      );
      this.smartLikeToggleInput = smartLikeRow.querySelector('input[type="checkbox"]');
      const smartLikeSpeedRow = this.createSelectRow(
        this.t("smartLikeSpeed"),
        [
          { value: "slow", label: this.t("smartLikeSpeedSlow") },
          { value: "normal", label: this.t("smartLikeSpeedNormal") },
          { value: "fast", label: this.t("smartLikeSpeedFast") }
        ],
        this.smartLikeSpeed,
        (value) => {
          this.smartLikeSpeed = ["slow", "normal", "fast"].includes(value) ? value : "normal";
          Storage.set("smartLikeSpeed", this.smartLikeSpeed);
        }
      );
      const cleanModeRow = this.createToggleRow(
        this.t("cleanMode"),
        this.cleanModeEnabled,
        (checked) => {
          this.cleanModeEnabled = checked;
          Storage.set("cleanModeEnabled", this.cleanModeEnabled);
          console.log(`\u6E05\u723D\u6A21\u5F0F: ${this.cleanModeEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
          this.toggleCleanMode();
        }
      );
      const grayscaleModeRow = this.createToggleRow(
        this.t("grayscaleMode"),
        this.grayscaleModeEnabled,
        (checked) => {
          this.grayscaleModeEnabled = checked;
          Storage.set("grayscaleModeEnabled", this.grayscaleModeEnabled);
          console.log(`\u9ED1\u767D\u7070\u6A21\u5F0F: ${this.grayscaleModeEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
          this.toggleGrayscaleMode();
        }
      );
      const readUnreadRow = this.createToggleRow(
        this.t("readUnread"),
        this.readUnreadEnabled,
        (checked) => {
          this.readUnreadEnabled = checked;
          Storage.set("readUnreadEnabled", this.readUnreadEnabled);
          console.log(`\u8BFB\u53D6\u672A\u8BFB\u5E16\u5B50: ${this.readUnreadEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
          this.topicList = [];
          this.setSessionStorage("topicList", []);
          console.log("\u5DF2\u6E05\u7A7A\u8BDD\u9898\u5217\u8868\uFF0C\u4E0B\u6B21\u5C06\u83B7\u53D6" + (this.readUnreadEnabled ? "\u672A\u8BFB" : "\u6700\u65B0") + "\u5E16\u5B50");
        }
      );
      const randomOrderRow = this.createToggleRow(
        this.t("randomOrder"),
        this.randomOrderEnabled,
        (checked) => {
          this.randomOrderEnabled = checked;
          Storage.set("randomOrderEnabled", this.randomOrderEnabled);
          console.log(`\u968F\u673A\u987A\u5E8F\u9605\u8BFB: ${this.randomOrderEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
          this.topicList = [];
          this.setSessionStorage("topicList", []);
        }
      );
      randomOrderRow.title = this.t("randomOrderTip");
      const skipReadRow = this.createToggleRow(
        this.t("skipRead"),
        this.skipReadEnabled,
        (checked) => {
          this.skipReadEnabled = checked;
          Storage.set("skipReadEnabled", this.skipReadEnabled);
          console.log(`\u8DF3\u8FC7\u5DF2\u8BFB\u5E16\u5B50: ${this.skipReadEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
          this.topicList = [];
          this.setSessionStorage("topicList", []);
        }
      );
      skipReadRow.title = this.t("skipReadTip");
      const fullTopicReadRow = this.createToggleRow(
        this.t("fullTopicRead"),
        this.fullTopicReadEnabled,
        (checked) => {
          this.fullTopicReadEnabled = checked;
          Storage.set("fullTopicReadEnabled", this.fullTopicReadEnabled);
          console.log(`\u5B8C\u6574\u9605\u8BFB\u5E16\u5B50: ${this.fullTopicReadEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
        }
      );
      fullTopicReadRow.title = this.t("fullTopicReadTip");
      const topicLimitRow = this.createSliderRow(
        this.t("topicLimit"),
        this.topicLimitCount,
        10,
        500,
        10,
        (value) => {
          this.topicLimitCount = value;
          Storage.set("topicLimitCount", this.topicLimitCount);
          console.log(`\u83B7\u53D6\u5E16\u5B50\u6570\u91CF: ${this.topicLimitCount}`);
          this.topicList = [];
          this.setSessionStorage("topicList", []);
        }
      );
      topicLimitRow.title = this.t("topicLimitTip");
      const restTimeRow = this.createSliderRow(
        this.t("restTimeLabel"),
        this.restTimeMinutes,
        1,
        30,
        1,
        (value) => {
          this.restTimeMinutes = value;
          Storage.set("restTimeMinutes", this.restTimeMinutes);
          console.log(`\u4F11\u606F\u65F6\u95F4: ${this.restTimeMinutes} \u5206\u949F`);
        }
      );
      restTimeRow.title = this.t("restTimeTip");
      const stopAfterReadRow = this.createToggleRow(
        this.t("stopAfterRead"),
        this.stopAfterReadEnabled,
        (checked) => {
          this.stopAfterReadEnabled = checked;
          Storage.set("stopAfterReadEnabled", this.stopAfterReadEnabled);
          console.log(`\u9605\u8BFB\u6570\u91CF\u9650\u5236: ${this.stopAfterReadEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
          if (checked) {
            this.currentSessionReadCount = 0;
            this.setSessionStorage("currentSessionReadCount", 0);
          }
        }
      );
      stopAfterReadRow.title = this.t("stopAfterReadTip");
      const stopAfterReadCountRow = this.createSliderRow(
        this.t("stopAfterReadCount"),
        this.stopAfterReadCount,
        5,
        100,
        5,
        (value) => {
          this.stopAfterReadCount = value;
          Storage.set("stopAfterReadCount", this.stopAfterReadCount);
          console.log(`\u9605\u8BFB\u6570\u91CF\u9650\u5236: ${this.stopAfterReadCount} \u7BC7`);
        }
      );
      stopAfterReadCountRow.title = this.t("stopAfterReadCountTip");
      const stopOnLikeLimitRow = this.createToggleRow(
        this.t("stopOnLikeLimit"),
        this.stopOnLikeLimitEnabled,
        (checked) => {
          this.stopOnLikeLimitEnabled = checked;
          Storage.set("stopOnLikeLimitEnabled", this.stopOnLikeLimitEnabled);
          console.log(`\u70B9\u8D5E\u4E0A\u9650\u505C\u6B62\u9605\u8BFB: ${this.stopOnLikeLimitEnabled ? "\u5F00\u542F" : "\u5173\u95ED"}`);
        }
      );
      stopOnLikeLimitRow.title = this.t("stopOnLikeLimitTip");
      this.trustLevelContainer = document.createElement("div");
      this.trustLevelContainer.className = "trust-level-row";
      this.trustLevelContainer.innerHTML = `<div class="trust-level-loading">${this.t("loadingLevel")}</div>`;
      this.autoSection = autoButton;
      this.autoSectionContent = autoContent;
      const accountButton = sectionMap.account[0];
      const accountContent = sectionMap.account[1];
      const creditButton = sectionMap.credit[0];
      const creditContent = sectionMap.credit[1];
      const cdkButton = sectionMap.cdk[0];
      const cdkContent = sectionMap.cdk[1];
      const rankButton = sectionMap.rank[0];
      const rankContent = sectionMap.rank[1];
      const settingsContent = sectionMap.settings[1];
      this.accountSection = accountButton;
      this.accountSectionContent = accountContent;
      this.accountDataSection = this.container.querySelector('[data-section="account-data"]');
      this.accountDataSectionContent = this.container.querySelector('[data-section-content="account-data"]');
      this.accountSectionContent.appendChild(this.trustLevelContainer);
      this.creditSection = creditButton;
      this.creditSectionContent = creditContent;
      this.cdkSection = cdkButton;
      this.cdkSectionContent = cdkContent;
      this.rankSection = rankButton;
      this.rankSectionContent = rankContent;
      this.settingsPluginSectionContent = settingsContent;
      if (CURRENT_DOMAIN !== "linux.do") {
        this.container.querySelector('[data-section-item="credit"]').style.display = "none";
        this.container.querySelector('[data-section-item="cdk"]').style.display = "none";
      }
      bindSection("auto");
      bindSection("accountData");
      bindSection("account", () => this.loadUserTrustLevel());
      bindSection("credit", () => this.loadCreditInfo());
      bindSection("cdk", () => this.loadCdkInfo());
      bindSection("rank", () => this.loadRankingData());
      bindSection("settings");
      if (this.autoRunning) setSectionExpanded(autoButton, autoContent, true);
      autoContent.appendChild(this.button);
      autoContent.appendChild(this.readStatsContainer);
      autoContent.appendChild(this.likeCounterContainer);
      const toggleGrid = document.createElement("div");
      toggleGrid.className = "toggle-grid";
      toggleGrid.appendChild(smartLikeRow);
      toggleGrid.classList.add("smart-like-controls");
      toggleGrid.appendChild(smartLikeSpeedRow);
      toggleGrid.appendChild(readUnreadRow);
      toggleGrid.appendChild(randomOrderRow);
      toggleGrid.appendChild(skipReadRow);
      toggleGrid.appendChild(fullTopicReadRow);
      toggleGrid.appendChild(stopAfterReadRow);
      toggleGrid.appendChild(stopOnLikeLimitRow);
      autoContent.appendChild(toggleGrid);
      const readParameterSection = document.createElement("div");
      readParameterSection.className = "auto-read-parameter-settings";
      readParameterSection.appendChild(topicLimitRow);
      readParameterSection.appendChild(restTimeRow);
      readParameterSection.appendChild(stopAfterReadCountRow);
      autoContent.appendChild(this.createInnerCollapsibleSection(
        this.t("readParameterSettingsLabel"),
        readParameterSection,
        true
      ));
      this.topicStatusContainer = document.createElement("div");
      this.topicStatusContainer.className = "topic-status-container";
      this.topicStatusContainer.style.display = "none";
      this.topicStatusContent = document.createElement("div");
      this.topicStatusContent.className = "topic-status-content";
      this.topicStatusContainer.appendChild(this.topicStatusContent);
      this.topicStatusNotification = document.createElement("div");
      this.topicStatusNotification.className = "topic-status-notification";
      this.topicStatusNotification.setAttribute("role", "status");
      this.topicStatusNotification.setAttribute("aria-live", "polite");
      this.topicStatusNotification.style.display = "none";
      this.topicStatusContainer.appendChild(this.topicStatusNotification);
      autoContent.appendChild(this.topicStatusContainer);
      this.flushPendingNotifications();
      creditContent.appendChild(this.creditContainer = document.createElement("div"));
      this.creditContainer.className = "credit-info-row";
      this.creditContainer.innerHTML = `<div class="trust-level-loading">${this.t("clickToLoadCredits")}</div>`;
      cdkContent.appendChild(this.cdkContainer = document.createElement("div"));
      this.cdkContainer.className = "cdk-info-row";
      this.cdkContainer.innerHTML = `<div class="trust-level-loading">${this.t("clickToLoadCdk")}</div>`;
      rankContent.appendChild(this.rankDataContainer = document.createElement("div"));
      this.rankDataContainer.className = "rank-data-container";
      this.rankDataContainer.innerHTML = `<div class="trust-level-loading">${this.t("clickToLoadRank")}</div>`;
      const modeSubSection = document.createElement("div");
      modeSubSection.className = "mode-settings-options";
      modeSubSection.appendChild(cleanModeRow);
      modeSubSection.appendChild(grayscaleModeRow);
      settingsContent.appendChild(this.createInnerCollapsibleSection(`\u{1F3A8} ${this.t("modeSettingsLabel")}`, modeSubSection, true));
      settingsContent.appendChild(this.createInnerCollapsibleSection(this.t("topicCreatedTimeLabel"), this.createTopicAgeColorSettings(), true));
      if (CURRENT_DOMAIN === "linux.do") {
        const cfSection = document.createElement("div");
        cfSection.className = "cf-bypass-section";
        const cfDescription = document.createElement("div");
        cfDescription.className = "cf-bypass-description";
        cfDescription.textContent = this.t("cfBypassTip");
        cfSection.appendChild(cfDescription);
        const cfToggleRow = this.createToggleRow("", this.cfBypassEnabled, (checked) => {
          this.cfBypassEnabled = checked;
          Storage.set("cfBypassEnabled", checked);
          this.showNotification(checked ? this.t("cfBypassEnabled") : this.t("cfBypassDisabled"));
          if (checked) {
            this.initCloudFlareBypass();
          } else {
            this.stopCloudFlareBypass();
          }
        });
        const manualCfBtn = document.createElement("button");
        manualCfBtn.type = "button";
        manualCfBtn.className = "reveal-users-btn";
        manualCfBtn.textContent = `\u{1F6E1}\uFE0F ${this.t("cfBypassManual")}`;
        manualCfBtn.title = this.t("cfBypassManualTip");
        manualCfBtn.addEventListener("click", () => this.manualTriggerCF());
        cfSection.appendChild(manualCfBtn);
        settingsContent.appendChild(this.createInnerCollapsibleSection(
          this.t("cfBypassLabel"),
          cfSection,
          true,
          cfToggleRow.querySelector(".toggle-switch")
        ));
      }
    },
    createToggleRow(label, checked, onChange) {
      const row = document.createElement("div");
      row.className = "toggle-row";
      const labelEl = document.createElement("span");
      labelEl.className = "toggle-label";
      labelEl.textContent = label;
      const toggleSwitch = document.createElement("label");
      toggleSwitch.className = "toggle-switch";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = checked;
      input.addEventListener("change", (e) => {
        onChange(e.target.checked);
      });
      const slider = document.createElement("span");
      slider.className = "toggle-slider";
      toggleSwitch.appendChild(input);
      toggleSwitch.appendChild(slider);
      row.appendChild(labelEl);
      row.appendChild(toggleSwitch);
      return row;
    },
    createSliderRow(label, value, min, max, step, onChange) {
      const row = document.createElement("div");
      row.className = "toggle-row";
      row.style.flexDirection = "column";
      row.style.alignItems = "stretch";
      row.style.gap = "6px";
      const topRow = document.createElement("div");
      topRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
      const labelEl = document.createElement("span");
      labelEl.className = "toggle-label";
      labelEl.textContent = label;
      const valueEl = document.createElement("span");
      valueEl.className = "toggle-label";
      valueEl.style.cssText = "color: #a16207; font-weight: bold; min-width: 40px; text-align: right;";
      valueEl.textContent = value;
      topRow.appendChild(labelEl);
      topRow.appendChild(valueEl);
      const sliderContainer = document.createElement("div");
      sliderContainer.style.cssText = "width: 100%; padding: 0 2px;";
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;
      slider.className = "panel-slider-input";
      const percentage = (value - min) / (max - min) * 100;
      slider.style.cssText = `
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: linear-gradient(to right, #0078d4 0%, #0078d4 ${percentage}%, #dfe7ef ${percentage}%, #dfe7ef 100%);
            outline: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            cursor: pointer;
        `;
      if (!document.getElementById("panel-slider-style")) {
        const sliderStyle = document.createElement("style");
        sliderStyle.id = "panel-slider-style";
        sliderStyle.textContent = `
                .panel-slider-input {
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }
                .panel-slider-input::-webkit-slider-runnable-track {
                    height: 4px;
                    border-radius: 2px;
                    background: transparent;
                }
                .panel-slider-input::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 120, 212, 0.35);
                    border: none;
                    margin-top: -5px;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .panel-slider-input::-webkit-slider-thumb:hover {
                    transform: scale(1.15);
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(0, 120, 212, 0.5);
                }
                .panel-slider-input::-webkit-slider-thumb:active {
                    transform: scale(1.05);
                    background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
                }
                .panel-slider-input::-moz-range-track {
                    height: 4px;
                    border-radius: 2px;
                    background: transparent;
                    border: none;
                }
                .panel-slider-input::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 120, 212, 0.35);
                }
                .panel-slider-input::-moz-range-thumb:hover {
                    transform: scale(1.15);
                }
                .panel-slider-input::-moz-range-progress {
                    background: #0078d4;
                    border-radius: 2px;
                    height: 4px;
                }
                .panel-slider-input:focus {
                    outline: none;
                }
            `;
        document.head.appendChild(sliderStyle);
      }
      slider.addEventListener("input", (e) => {
        const newValue = parseInt(e.target.value);
        valueEl.textContent = newValue;
        const newPercentage = (newValue - min) / (max - min) * 100;
        slider.style.background = `linear-gradient(to right, #0078d4 0%, #0078d4 ${newPercentage}%, #dfe7ef ${newPercentage}%, #dfe7ef 100%)`;
        onChange(newValue);
      });
      sliderContainer.appendChild(slider);
      row.appendChild(topRow);
      row.appendChild(sliderContainer);
      return row;
    },
    createSelectRow(label, options, selectedValue, onChange) {
      const row = document.createElement("div");
      row.className = "toggle-row";
      const labelEl = document.createElement("span");
      labelEl.className = "toggle-label";
      labelEl.textContent = label;
      const selectWrapper = document.createElement("div");
      selectWrapper.style.cssText = `
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            height: 100%;
        `;
      const select = document.createElement("select");
      select.style.cssText = `
            appearance: none;
            -webkit-appearance: none;
            -moz-appearance: none;
            background: #fff;
            border: 1px solid #cbd5df;
            border-radius: 4px;
            color: #334155;
            padding: 5px 22px 5px 8px;
            font-size: 11px;
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
            text-align: center;
            text-align-last: center;
            min-width: auto;
            width: auto;
            white-space: nowrap;
            overflow: visible;
            text-overflow: clip;
            margin-bottom: 0;
        `;
      select.addEventListener("mouseenter", () => {
        select.style.background = "#f8fbfe";
        select.style.borderColor = "#9cc9e7";
      });
      select.addEventListener("mouseleave", () => {
        if (document.activeElement !== select) {
          select.style.background = "#fff";
          select.style.borderColor = "#cbd5df";
        }
      });
      select.addEventListener("focus", () => {
        select.style.background = "#f8fbfe";
        select.style.borderColor = "#70b7e4";
        select.style.boxShadow = "0 0 0 2px rgba(0, 120, 212, 0.15)";
      });
      select.addEventListener("blur", () => {
        select.style.background = "#fff";
        select.style.borderColor = "#cbd5df";
        select.style.boxShadow = "none";
      });
      const arrow = document.createElement("span");
      arrow.innerHTML = "\u25BC";
      arrow.style.cssText = `
            position: absolute;
            right: 6px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 8px;
            color: #64748b;
            pointer-events: none;
        `;
      options.forEach((opt) => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        option.selected = opt.value === selectedValue;
        option.style.cssText = `
                background: #fff;
                color: #333;
                padding: 4px 8px;
                text-align: center;
            `;
        select.appendChild(option);
      });
      select.addEventListener("change", (e) => {
        onChange(e.target.value);
      });
      selectWrapper.appendChild(select);
      selectWrapper.appendChild(arrow);
      row.appendChild(labelEl);
      row.appendChild(selectWrapper);
      return row;
    }
  };

  // src/controller/mixins/likes.js
  var methods2 = {
    updateLikeCounterUI(status) {
      if (!this.likeCounterContainer) return;
      const { remaining, used, limit, isInCooldown, cooldownFormatted, matched } = status;
      if (isInCooldown && this.likeCounterCooldownTimer) {
        const timeSpan = this.likeCounterContainer.querySelector(".like-cooldown-time");
        if (timeSpan && cooldownFormatted) {
          timeSpan.textContent = cooldownFormatted;
          return;
        }
      }
      if (this.likeCounterCooldownTimer) {
        clearInterval(this.likeCounterCooldownTimer);
        this.likeCounterCooldownTimer = null;
      }
      let html = "";
      if (isInCooldown && cooldownFormatted) {
        html = `
                <div class="like-cooldown-row">
                    <div class="like-cooldown-status">
                        <span class="like-cooldown-label">\u{1F525} ${this.t("likeCooldown")}</span>
                        <span class="like-cooldown-time">${cooldownFormatted}</span>
                    </div>
                    <button type="button" class="like-cooldown-clear-btn" title="${this.t("likeClearCooldownTip")}">${this.t("likeClearCooldown")}</button>
                </div>
            `;
        this.likeCounterContainer.style.background = "linear-gradient(135deg, #fff1f2 0%, #fff7f7 100%)";
        this.likeCounterContainer.style.borderColor = "#fecdd3";
        if (!this.likeCounterCooldownTimer) {
          this.likeCounterCooldownTimer = setInterval(() => {
            if (!this.likeCounter) return;
            const newFormatted = this.likeCounter.formatCooldown();
            const timeSpan = this.likeCounterContainer?.querySelector(".like-cooldown-time");
            if (timeSpan && newFormatted) {
              timeSpan.textContent = newFormatted;
            } else if (!newFormatted) {
              clearInterval(this.likeCounterCooldownTimer);
              this.likeCounterCooldownTimer = null;
              this.updateLikeCounterUI(this.likeCounter.getStatus());
            }
          }, 1e3);
        }
      } else {
        const percentage = limit > 0 ? Math.round(remaining / limit * 100) : 0;
        const color = percentage > 50 ? "#15803d" : percentage > 20 ? "#b7791f" : "#dc2626";
        html = `
                <div class="like-status-row">
                    <div class="like-status-label">
                        ${!matched ? `<span class="like-sync-btn" title="${this.t("likeCountMismatch")}">\u26A0\uFE0F</span>` : ""}
                        <span>\u2764\uFE0F ${this.t("likeRemaining")}</span>
                    </div>
                    <div>
                        <span class="like-status-value" style="color: ${color};">${remaining}</span>
                        <span class="like-status-limit">/ ${limit}</span>
                    </div>
                </div>
                <div class="like-progress-track">
                    <div class="like-progress-fill" style="width: ${percentage}%; background: ${color};"></div>
                </div>
            `;
        this.likeCounterContainer.style.background = "#f5f8fb";
        this.likeCounterContainer.style.borderColor = "#e1e6eb";
      }
      this.likeCounterContainer.innerHTML = html;
      const syncBtn = this.likeCounterContainer.querySelector(".like-sync-btn");
      if (syncBtn) {
        syncBtn.onclick = async (e) => {
          e.stopPropagation();
          syncBtn.textContent = "\u{1F504}";
          syncBtn.style.animation = "spin 1s linear infinite";
          await this.likeCounter.manualSync();
          syncBtn.style.animation = "";
        };
      }
      const clearCooldownBtn = this.likeCounterContainer.querySelector(".like-cooldown-clear-btn");
      if (clearCooldownBtn) {
        clearCooldownBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          clearCooldownBtn.disabled = true;
          const cleared = this.clearLikeCooldown();
          if (!cleared) {
            clearCooldownBtn.disabled = false;
            this.showNotification(this.t("likeCooldownClearFailed"));
            return;
          }
          this.showNotification(this.t("likeCooldownCleared"));
        };
      }
    },
    async initializeSmartLikeTab() {
      try {
        let tab = {};
        if (typeof GM_getTab === "function") {
          tab = await new Promise((resolve) => {
            const timeout = setTimeout(() => resolve({}), 3e3);
            try {
              GM_getTab((value) => {
                clearTimeout(timeout);
                resolve(value || {});
              });
            } catch (_) {
              clearTimeout(timeout);
              resolve({});
            }
          });
        }
        const tabId = tab.smartLikeTabId || this.smartLikeSessionId;
        const sameTab = tabId === this.smartLikeSessionId;
        this.smartLikeSessionId = tabId;
        if (typeof GM_saveTab === "function") {
          try {
            GM_saveTab({ ...tab, smartLikeTabId: tabId });
          } catch (_) {
          }
        }
        const readObject = (key) => {
          const value = this.getSessionStorage(key, {});
          return value && typeof value === "object" && !Array.isArray(value) ? value : {};
        };
        const generation = this.getSessionStorage("smartLikeGeneration", 0);
        this.smartLikeGeneration = (Number.isSafeInteger(generation) && generation >= 0 ? generation : 0) + 1;
        if (sameTab) {
          this.smartLikeCheckedPostIds = readObject("smartLikeProcessedPostIds");
          const failed = this.getSessionStorage("smartLikeFailedPostIds", []);
          this.smartLikeFailedPostIds = new Set(Array.isArray(failed) ? failed.filter((key) => typeof key === "string") : []);
          const pending = this.getSessionStorage("smartLikePendingPostIds", []);
          if (Array.isArray(pending)) {
            for (const task of pending) {
              if (task?.phase === "requesting" && task.accountKey && task.postId) {
                this.smartLikeFailedPostIds.add(this.smartLikeDecisionKey(task.postId, task.accountKey));
              }
            }
          }
        } else {
          this.smartLikeLastLikeAt = 0;
        }
        if (!this.setSessionStorage("smartLikeSessionId", this.smartLikeSessionId) || !this.setSessionStorage("smartLikeGeneration", this.smartLikeGeneration) || !this.persistSmartLikeSession() || !this.persistSmartLikePending()) {
          throw new Error("Session storage write failed");
        }
        this.updateSmartLikeUI();
      } catch (error) {
        this.smartLikeStorageReady = false;
        this.smartLikeEnabled = false;
        this.updateSmartLikeUI();
        console.error("[\u667A\u80FD\u70B9\u8D5E] \u4F1A\u8BDD\u5B58\u50A8\u4E0D\u53EF\u7528\uFF0C\u5DF2\u6682\u505C\u53D1\u9001:", error);
      }
    },
    smartLikeDecisionKey(postId, accountKey = this.smartLikeAccountKey) {
      return accountKey + "|" + postId;
    },
    persistSmartLikePending() {
      if (!this.isSmartLikeGenerationCurrent()) return false;
      const task = this.smartLikeActiveTask;
      const pending = task && !task.pendingReleased && this.isSmartLikeGenerationCurrent(task) ? [{ postId: task.postId, topicId: task.topicId, accountKey: task.accountKey, phase: task.phase }] : [];
      if (!this.setSessionStorage("smartLikePendingPostIds", pending)) this.smartLikeStorageReady = false;
      return this.smartLikeStorageReady;
    },
    updateSmartLikeUI() {
      const input = this.smartLikeToggleInput;
      if (input) input.checked = !!this.smartLikeEnabled;
    },
    setSmartLikeEnabled(enabled) {
      const next = !!enabled;
      if (next && this.isLikeCoolingDown()) {
        this.smartLikeEnabled = false;
        Storage.set("smartLikeEnabled", false);
        this.updateSmartLikeUI();
        this.showNotification(Number.isFinite(this.likeResumeTime) ? `${this.t("likeCoolingDown")}\uFF0C${new Date(this.likeResumeTime).toLocaleTimeString()}` : "\u70B9\u8D5E\u72B6\u6001\u6682\u4E0D\u53EF\u7528\uFF0C\u667A\u80FD\u70B9\u8D5E\u5DF2\u5173\u95ED");
        return false;
      }
      if (next && !this.smartLikeStorageReady) {
        this.showNotification("\u70B9\u8D5E\u4F1A\u8BDD\u5B58\u50A8\u4E0D\u53EF\u7528\uFF0C\u8BF7\u6062\u590D\u5B58\u50A8\u540E\u5237\u65B0\u9875\u9762");
        this.updateSmartLikeUI();
        return false;
      }
      this.smartLikeEnabled = next;
      Storage.set("smartLikeEnabled", next);
      if (!next) this.cancelSmartLikeTasks("disabled");
      this.updateSmartLikeUI();
      if (next && this.autoRunning && this.getSmartLikeTopicId()) this.scheduleSmartLikeScan();
      return true;
    },
    isLikeCoolingDown() {
      this.likeResumeTime = LikeCooldown.read(this.smartLikeAccountKey);
      return !!(this.likeResumeTime && Date.now() < this.likeResumeTime);
    },
    clearLikeCooldown() {
      const counterKey = this.likeCounter?.accountKey;
      const smartLikeKey = this.smartLikeAccountKey;
      const primaryKey = counterKey || smartLikeKey;
      if (!primaryKey) return false;
      const keys = /* @__PURE__ */ new Set([primaryKey]);
      const usernames = [];
      if (counterKey === primaryKey) usernames.push(this.likeCounter?.currentUser?.username);
      if (smartLikeKey === primaryKey) usernames.push(this.currentAccount?.username, this.currentUsername);
      for (const username of usernames) {
        const normalized = String(username || "").trim().replace(/^@/, "").trim().toLowerCase();
        if (normalized) keys.add(`username:${normalized}`);
      }
      if (!LikeCooldown.clear(Array.from(keys))) return false;
      this.likeResumeTime = LikeCooldown.read(smartLikeKey);
      for (const accountKey of keys) {
        this.smartLike429Periods?.delete(accountKey || "legacy");
      }
      this.likeCounter?.loadState();
      this.likeCounter?.notifyUIUpdate();
      return true;
    },
    getSmartLikeSpeedConfig() {
      const probability = { slow: 0.05, normal: 0.15, fast: 0.25 }[this.smartLikeSpeed] ?? 0.15;
      return { probability, minWait: 200, maxWait: 500 };
    },
    persistSmartLikeSession() {
      if (!this.isSmartLikeGenerationCurrent()) return false;
      const results = [
        this.setSessionStorage("smartLikeProcessedPostIds", this.smartLikeCheckedPostIds),
        this.setSessionStorage("smartLikeFailedPostIds", Array.from(this.smartLikeFailedPostIds)),
        this.setSessionStorage("smartLikeLastLikeAt", this.smartLikeLastLikeAt)
      ];
      if (results.some((result) => !result)) this.smartLikeStorageReady = false;
      return this.smartLikeStorageReady;
    },
    getSmartLikePostId(post) {
      const id = post?.dataset?.postId || post?.querySelector("article[data-post-id]")?.dataset.postId;
      return /^\d+$/.test(String(id || "")) ? String(id) : "";
    },
    getSmartLikeTopicId() {
      const parts = window.location.pathname.split("/").filter(Boolean);
      if (parts[0] !== "t") return "";
      const id = /^\d+$/.test(parts[1] || "") ? parts[1] : parts[2];
      return /^\d+$/.test(id || "") ? id : "";
    },
    async resolveSmartLikeAccount(force = false) {
      if (this.smartLikeAccountRequest) return this.smartLikeAccountRequest;
      const now = Date.now();
      if (!force && now - (this.smartLikeAccountCheckedAt || 0) < 3e4) return this.currentAccount;
      if (Storage.get("session429Until", 0) > now) return null;
      this.smartLikeAccountRequest = (async () => {
        let user = null;
        try {
          const response = await fetch(`${BASE_URL}/session/current.json`, { credentials: "include", cache: "no-store", signal: AbortSignal.timeout(1e4) });
          if (response.status === 429) Storage.set("session429Until", Date.now() + 30 * 60 * 1e3);
          if (response.ok) user = (await response.json())?.current_user || null;
        } catch (_) {
        }
        const id = Number(user?.id ?? user?.user_id);
        const username = typeof user?.username === "string" ? user.username.trim().replace(/^@/, "").trim().toLowerCase() : "";
        const key = Number.isSafeInteger(id) && id > 0 ? `id:${id}` : username ? `username:${username}` : null;
        if (this.smartLikeAccountKey !== key) {
          this.cancelSmartLikeTasks("account_changed");
        }
        this.smartLikeAccountKey = key;
        this.currentAccount = key ? { id, username, key } : null;
        this.smartLikeAccountCheckedAt = Date.now();
        if (key?.startsWith("id:") && username) {
          const usernameKey = `username:${username}`;
          const usernameUntil = LikeCooldown.read(usernameKey);
          if (usernameUntil > LikeCooldown.read(key)) LikeCooldown.extend(key, usernameUntil);
          const prefix = `${usernameKey}|`;
          let merged = false;
          for (const [oldKey, value] of Object.entries(this.smartLikeCheckedPostIds)) {
            const newKey = `${key}|${oldKey.slice(prefix.length)}`;
            if (oldKey.startsWith(prefix) && !Object.hasOwn(this.smartLikeCheckedPostIds, newKey)) {
              this.smartLikeCheckedPostIds[newKey] = { ...value };
              merged = true;
            }
          }
          for (const oldKey of Array.from(this.smartLikeFailedPostIds)) {
            const newKey = `${key}|${oldKey.slice(prefix.length)}`;
            if (oldKey.startsWith(prefix) && !this.smartLikeFailedPostIds.has(newKey)) {
              this.smartLikeFailedPostIds.add(newKey);
              merged = true;
            }
          }
          if (merged) this.persistSmartLikeSession();
        }
        this.likeResumeTime = LikeCooldown.read(key);
        this.likeCounter?.setCurrentUser(key ? user : null);
        if (key) {
          this.currentUsername = username;
          this.loadSmartLikedPosts();
          if (this.isLikeCoolingDown() && this.smartLikeEnabled) this.setSmartLikeEnabled(false);
        }
        return this.currentAccount;
      })();
      try {
        return await this.smartLikeAccountRequest;
      } catch (error) {
        this.smartLikeStorageReady = false;
        console.error("[\u667A\u80FD\u70B9\u8D5E] \u8D26\u53F7\u8BB0\u5F55\u4E0D\u53EF\u7528\uFF0C\u5DF2\u6682\u505C\u53D1\u9001:", error);
        return null;
      } finally {
        this.smartLikeAccountRequest = null;
      }
    },
    getSmartLikeStorageKey() {
      return this.smartLikeAccountKey ? `smartLikedPostIds_${encodeURIComponent(this.smartLikeAccountKey)}` : null;
    },
    loadSmartLikedPosts() {
      this.smartLikedPostIds = /* @__PURE__ */ new Map();
      const key = this.getSmartLikeStorageKey();
      if (!key) return;
      const entries = this.readSmartLikedRecords(this.smartLikeAccountKey);
      const kept = entries.sort((a, b) => a.recordedAt - b.recordedAt).slice(-5e3);
      this.smartLikedPostIds = new Map(kept.map((item) => [item.postId, item.recordedAt]));
    },
    readSmartLikedRecords(accountKey) {
      if (!accountKey) return [];
      const keys = [`smartLikedPostIds_${encodeURIComponent(accountKey)}`];
      if (accountKey === this.currentAccount?.key && accountKey.startsWith("id:") && this.currentAccount.username) {
        keys.push(`smartLikedPostIds_${encodeURIComponent(`username:${this.currentAccount.username}`)}`);
      }
      const records = /* @__PURE__ */ new Map();
      for (const key of keys) {
        const entries = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(entries)) throw new Error("Invalid liked post history");
        for (const item of entries) {
          const postId = String(item?.postId || "");
          const recordedAt = Number(item?.recordedAt);
          if (/^\d+$/.test(postId) && Number.isFinite(recordedAt) && recordedAt > 0 && (!records.has(postId) || recordedAt < records.get(postId))) {
            records.set(postId, recordedAt);
          }
        }
      }
      return Array.from(records, ([postId, recordedAt]) => ({ postId, recordedAt }));
    },
    recordLikedPost(postId, accountKey = this.smartLikeAccountKey) {
      if (!accountKey || !postId) return false;
      const key = `smartLikedPostIds_${encodeURIComponent(accountKey)}`;
      let entries;
      try {
        entries = this.readSmartLikedRecords(accountKey);
      } catch (error) {
        this.smartLikeStorageReady = false;
        console.error("[\u667A\u80FD\u70B9\u8D5E] \u65E0\u6CD5\u8BFB\u53D6\u6210\u529F\u8BB0\u5F55\uFF0C\u5DF2\u6682\u505C\u540E\u7EED\u53D1\u9001:", error);
        return false;
      }
      const map = /* @__PURE__ */ new Map();
      for (const item of [...entries, { postId: String(postId), recordedAt: Date.now() }]) {
        const id = String(item?.postId || "");
        const time = Number(item?.recordedAt);
        if (!/^\d+$/.test(id) || !Number.isFinite(time) || time <= 0) continue;
        if (!map.has(id) || time < map.get(id)) map.set(id, time);
      }
      const kept = Array.from(map.entries()).filter(([post, time]) => post && Number.isFinite(time)).sort((a, b) => a[1] - b[1]).slice(-5e3).map(([post, time]) => ({ postId: post, recordedAt: time }));
      const saved = Storage.set(key, kept);
      if (!saved) {
        this.smartLikeStorageReady = false;
        console.error("[\u667A\u80FD\u70B9\u8D5E] \u6210\u529F\u8BB0\u5F55\u4FDD\u5B58\u5931\u8D25\uFF0C\u5DF2\u6682\u505C\u540E\u7EED\u53D1\u9001");
      }
      if (accountKey === this.smartLikeAccountKey) this.smartLikedPostIds = new Map(kept.map((item) => [item.postId, item.recordedAt]));
      return saved;
    },
    markSmartLikeChecked(postId, decision, reason = "", accountKey = this.smartLikeAccountKey) {
      this.smartLikeCheckedPostIds[this.smartLikeDecisionKey(postId, accountKey)] = { decision, reason, at: Date.now() };
      this.persistSmartLikeSession();
    },
    getSmartLikeReactionState(post) {
      if (!post?.isConnected) return "unknown";
      const actions = post.querySelector(".discourse-reactions-actions");
      const button = post.querySelector('button[title="\u70B9\u8D5E\u6B64\u5E16\u5B50"], button[title="Like this post"], button.btn-toggle-reaction-like');
      if (actions?.classList.contains("has-used-main-reaction") || button && (button.getAttribute("aria-pressed") === "true" || ["has-like", "my-likes", "liked"].some((name) => button.classList.contains(name)))) return "heart_active";
      if (actions && /reacted/i.test(actions.className)) return "other_reaction";
      if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return "unknown";
      return "none";
    },
    isSmartLikeGenerationCurrent(task = { sessionId: this.smartLikeSessionId, generation: this.smartLikeGeneration }) {
      return task.sessionId === this.smartLikeSessionId && task.generation === this.smartLikeGeneration && task.sessionId === this.getSessionStorage("smartLikeSessionId") && task.generation === this.getSessionStorage("smartLikeGeneration");
    },
    canRunLikeFlow(task = null) {
      if (!this.smartLikeStorageReady || !this.isSmartLikeGenerationCurrent() || !this.smartLikeEnabled || !this.autoRunning || !this.isScrolling || !this.smartLikeAccountKey || !this.getSmartLikeTopicId() || this.isLikeCoolingDown()) return false;
      if (task && (!this.isSmartLikeGenerationCurrent(task) || task.runToken !== this.smartLikeRunToken || task.accountKey !== this.smartLikeAccountKey || task.topicId !== this.getSmartLikeTopicId())) return false;
      return true;
    },
    shouldLikePost() {
      return this.smartLikeEnabled && Date.now() - this.smartLikeLastLikeAt >= 2e3 && Math.random() < this.getSmartLikeSpeedConfig().probability;
    },
    async tryLikePost(post, task) {
      const key = this.smartLikeDecisionKey(task.postId, task.accountKey);
      const canAttempt = () => this.canRunLikeFlow(task) && post.isConnected && this.getSmartLikePostId(post) === task.postId && this.isLikeAllowedInCurrentCategory()?.allowed === true;
      const run = async () => {
        this.loadSmartLikedPosts();
        if (!canAttempt() || this.smartLikedPostIds.has(task.postId) || this.smartLikeFailedPostIds.has(key)) return;
        const state = this.getSmartLikeReactionState(post);
        if (state !== "none") {
          if (state !== "unknown") this.markSmartLikeChecked(task.postId, "skip", state);
          return;
        }
        const { minWait, maxWait } = this.getSmartLikeSpeedConfig();
        await Utils.sleep(Utils.random(minWait, maxWait));
        if (!canAttempt() || this.getSmartLikeReactionState(post) !== "none") return;
        this.loadSmartLikedPosts();
        if (this.smartLikedPostIds.has(task.postId)) return;
        this.smartLikeActiveTask = task;
        task.phase = "requesting";
        if (!this.persistSmartLikePending()) return;
        const result = await this.sendLikeRequest(task.postId, task);
        const sameSession = this.isSmartLikeGenerationCurrent(task);
        if (result.success) {
          this.recordLikedPost(task.postId, task.accountKey);
          if (sameSession) {
            this.smartLikeLastLikeAt = Date.now();
            this.markSmartLikeChecked(task.postId, "success", "http_success", task.accountKey);
          }
          console.log("[\u667A\u80FD\u70B9\u8D5E] \u70B9\u8D5E\u6210\u529F\uFF0C\u5E16\u5B50 ID=" + task.postId);
        } else if (result.rateLimited) {
          this.handleSmartLike429(result.waitSeconds, result.timeLeft, result.url, "PUT", {
            accountKey: task.accountKey,
            retryAfter: result.retryAfter,
            responseAt: result.responseAt
          });
        } else if (sameSession && !result.cancelled) {
          this.smartLikeFailedPostIds.add(key);
          this.markSmartLikeChecked(task.postId, "failed", result.reason || "request_failed", task.accountKey);
          console.warn("[\u667A\u80FD\u70B9\u8D5E] \u70B9\u8D5E\u8BF7\u6C42\u5931\u8D25\uFF0C\u5E16\u5B50 ID=" + task.postId);
        }
      };
      try {
        if (typeof navigator.locks?.request === "function") {
          await navigator.locks.request("smart-like:" + task.accountKey, { mode: "exclusive" }, run);
        } else {
          await run();
        }
      } catch (error) {
        if (task.phase === "requesting" && this.isSmartLikeGenerationCurrent(task)) {
          this.smartLikeFailedPostIds.add(key);
          this.persistSmartLikeSession();
        }
        console.error("[\u667A\u80FD\u70B9\u8D5E] \u5904\u7406\u5E16\u5B50\u5931\u8D25:", error);
      } finally {
        if (this.smartLikeActiveTask === task) this.smartLikeActiveTask = null;
        this.persistSmartLikePending();
      }
    },
    async sendLikeRequest(postId, task) {
      if (!this.canRunLikeFlow(task)) return { success: false, cancelled: true };
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
      if (!csrfToken) return { success: false, cancelled: true };
      const url = BASE_URL + "/discourse-reactions/posts/" + encodeURIComponent(postId) + "/custom-reactions/heart/toggle.json";
      if (!isHeartToggleUrl(url, "PUT")) return { success: false, cancelled: true };
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15e3);
      try {
        const response = await fetch(url, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          signal: controller.signal
        });
        if (response.ok) return { success: true };
        const data = await response.json().catch(() => ({}));
        if (response.status === 429 || data?.error_type === "rate_limit") {
          return {
            success: false,
            rateLimited: true,
            url,
            waitSeconds: data?.extras?.wait_seconds,
            timeLeft: data?.extras?.time_left,
            retryAfter: response.headers?.get?.("Retry-After"),
            responseAt: Date.now()
          };
        }
        return { success: false, reason: "http_" + response.status };
      } catch (error) {
        return { success: false, reason: error?.name === "AbortError" ? "timeout" : "network_error" };
      } finally {
        clearTimeout(timeout);
      }
    },
    async scanSmartLikePosts() {
      await this.smartLikeReady;
      if (this.smartLikeIsScanning || !this.smartLikeStorageReady || !this.isSmartLikeGenerationCurrent() || !this.smartLikeEnabled || !this.autoRunning || !this.isScrolling || !this.getSmartLikeTopicId()) return;
      this.smartLikeIsScanning = true;
      this.smartLikeLastScanAt = Date.now();
      try {
        await this.resolveSmartLikeAccount();
        if (!this.canRunLikeFlow() || this.isLikeAllowedInCurrentCategory()?.allowed !== true) return;
        const topicId = this.getSmartLikeTopicId();
        const runToken = this.smartLikeRunToken;
        const height = window.innerHeight || document.documentElement.clientHeight;
        for (const post of document.querySelectorAll('article[id^="post_"]')) {
          if (!this.canRunLikeFlow() || runToken !== this.smartLikeRunToken || topicId !== this.getSmartLikeTopicId()) break;
          const postId = this.getSmartLikePostId(post);
          const key = this.smartLikeDecisionKey(postId);
          if (!postId || this.smartLikeCheckedPostIds[key] || this.smartLikeFailedPostIds.has(key) || this.smartLikedPostIds?.has(postId)) continue;
          const rect = post.getBoundingClientRect();
          if (rect.top >= height * 0.9 || rect.bottom <= height * 0.1) continue;
          const state = this.getSmartLikeReactionState(post);
          if (state === "unknown") continue;
          if (state !== "none") {
            this.markSmartLikeChecked(postId, "skip", state);
            continue;
          }
          this.markSmartLikeChecked(postId, "viewed", "probability_or_interval");
          if (!this.shouldLikePost()) continue;
          await this.tryLikePost(post, {
            postId,
            topicId,
            accountKey: this.smartLikeAccountKey,
            sessionId: this.smartLikeSessionId,
            generation: this.smartLikeGeneration,
            runToken,
            createdAt: Date.now(),
            phase: "waiting"
          });
        }
      } catch (error) {
        console.error("[\u667A\u80FD\u70B9\u8D5E] \u626B\u63CF\u5E16\u5B50\u5931\u8D25:", error);
      } finally {
        this.smartLikeIsScanning = false;
      }
    },
    cancelSmartLikeTasks() {
      this.smartLikeRunToken++;
      clearTimeout(this.smartLikeScanTimer);
      this.smartLikeScanTimer = null;
      this.persistSmartLikePending();
    },
    scheduleSmartLikeScan() {
      if (this.smartLikeScanTimer) return;
      const delay = Math.max(0, 2e3 - (Date.now() - this.smartLikeLastScanAt));
      this.smartLikeScanTimer = setTimeout(() => {
        this.smartLikeScanTimer = null;
        this.scanSmartLikePosts();
      }, delay);
    },
    bindSmartLikeScroll() {
      if (this.smartLikeScrollBound) return;
      this.smartLikeScrollBound = true;
      window.addEventListener("scroll", () => {
        if (this.smartLikeEnabled && this.autoRunning && this.isScrolling) this.scheduleSmartLikeScan();
      }, { passive: true });
      window.addEventListener("pagehide", () => this.cancelSmartLikeTasks("pagehide"));
      window.addEventListener("storage", (event) => {
        if (event.key === "likeResumeTime") {
          this.likeResumeTime = LikeCooldown.read(this.smartLikeAccountKey);
          this.likeCounter?.loadState();
          this.likeCounter?.notifyUIUpdate();
          if (this.isLikeCoolingDown()) this.setSmartLikeEnabled(false);
        } else if (event.key === "smartLikeEnabled" && event.newValue === "false") {
          this.setSmartLikeEnabled(false);
        }
      });
    },
    isLikeAllowedInCurrentCategory() {
      if (CURRENT_DOMAIN === "idcflare.com") {
        return { allowed: true, reason: "idcflare_no_restriction" };
      }
      const config = CONFIG.likeAllowedCategories;
      if (!config || !config.allowed || config.allowed.length === 0) {
        return { allowed: true, reason: "no_config" };
      }
      let subcategory = null;
      let parentCategory = null;
      const topicCategory = document.querySelector(".topic-category");
      if (topicCategory) {
        const badges = topicCategory.querySelectorAll(".badge-category__name, .category-name");
        const names = [];
        badges.forEach((badge) => {
          const name = badge.textContent?.trim();
          if (name) names.push(name);
        });
        if (names.length >= 2) {
          subcategory = names[0];
          parentCategory = names[1];
        } else if (names.length === 1) {
          parentCategory = names[0];
        }
      }
      if (!parentCategory) {
        const headerCategory = document.querySelector(".extra-info-wrapper .badge-category__name");
        if (headerCategory) {
          parentCategory = headerCategory.textContent?.trim();
        }
      }
      const detectedCategories = [];
      if (subcategory) detectedCategories.push(subcategory);
      if (parentCategory) detectedCategories.push(parentCategory);
      if (detectedCategories.length === 0) {
        console.log("[\u677F\u5757\u68C0\u67E5] \u65E0\u6CD5\u83B7\u53D6\u5F53\u524D\u677F\u5757\u4FE1\u606F\uFF0C\u9ED8\u8BA4\u4E0D\u5141\u8BB8\u70B9\u8D5E");
        return { allowed: false, reason: "category_not_found", categories: [] };
      }
      if (detectedCategories.some((name) => config.excluded?.includes(name))) {
        return { allowed: false, reason: "excluded", categories: detectedCategories };
      }
      console.log(
        "[\u677F\u5757\u68C0\u67E5] \u68C0\u6D4B\u5230\u677F\u5757:",
        detectedCategories.join(" > "),
        subcategory ? `(\u5B50\u7248\u5757: ${subcategory}, \u7236\u7248\u5757: ${parentCategory})` : `(\u9876\u7EA7\u677F\u5757: ${parentCategory})`
      );
      if (subcategory) {
        if (config.excluded && config.excluded.includes(subcategory)) {
          console.log(`[\u677F\u5757\u68C0\u67E5] \u5B50\u7248\u5757 "${subcategory}" \u5728\u6392\u9664\u5217\u8868\u4E2D\uFF0C\u4E0D\u5141\u8BB8\u70B9\u8D5E`);
          return { allowed: false, reason: "subcategory_excluded", category: subcategory, categories: detectedCategories };
        }
        if (config.allowed.includes(subcategory)) {
          console.log(`[\u677F\u5757\u68C0\u67E5] \u5B50\u7248\u5757 "${subcategory}" \u5728\u5141\u8BB8\u5217\u8868\u4E2D\uFF0C\u5141\u8BB8\u70B9\u8D5E`);
          return { allowed: true, reason: "subcategory_allowed", category: subcategory, categories: detectedCategories };
        }
        if (parentCategory && config.allowed.includes(parentCategory)) {
          console.log(`[\u677F\u5757\u68C0\u67E5] \u5B50\u7248\u5757 "${subcategory}" \u4E0D\u5728\u5141\u8BB8\u5217\u8868\uFF0C\u7236\u7248\u5757 "${parentCategory}" \u5728\u5141\u8BB8\u5217\u8868\u4E2D\uFF0C\u5141\u8BB8\u70B9\u8D5E`);
          return { allowed: true, reason: "parent_allowed", category: parentCategory, subcategory, categories: detectedCategories };
        }
        console.log(`[\u677F\u5757\u68C0\u67E5] \u5B50\u7248\u5757 "${subcategory}" \u548C\u7236\u7248\u5757 "${parentCategory}" \u90FD\u4E0D\u5728\u5141\u8BB8\u5217\u8868\u4E2D\uFF0C\u4E0D\u5141\u8BB8\u70B9\u8D5E`);
        return { allowed: false, reason: "not_in_allowed_list", categories: detectedCategories };
      } else {
        if (config.excluded && config.excluded.includes(parentCategory)) {
          console.log(`[\u677F\u5757\u68C0\u67E5] \u677F\u5757 "${parentCategory}" \u5728\u6392\u9664\u5217\u8868\u4E2D\uFF0C\u4E0D\u5141\u8BB8\u70B9\u8D5E`);
          return { allowed: false, reason: "excluded", category: parentCategory, categories: detectedCategories };
        }
        if (config.allowed.includes(parentCategory)) {
          console.log(`[\u677F\u5757\u68C0\u67E5] \u677F\u5757 "${parentCategory}" \u5728\u5141\u8BB8\u5217\u8868\u4E2D\uFF0C\u5141\u8BB8\u70B9\u8D5E`);
          return { allowed: true, reason: "allowed", category: parentCategory, categories: detectedCategories };
        }
        console.log(`[\u677F\u5757\u68C0\u67E5] \u677F\u5757 "${parentCategory}" \u4E0D\u5728\u5141\u8BB8\u5217\u8868\u4E2D\uFF0C\u4E0D\u5141\u8BB8\u70B9\u8D5E`);
        return { allowed: false, reason: "not_in_allowed_list", categories: detectedCategories };
      }
    }
  };

  // src/controller/mixins/reader.js
  var methods3 = {
    getPageContextKey(urlString = window.location.href) {
      try {
        const base = window.location?.origin || BASE_URL;
        const url = new URL(urlString, base);
        const topicMatch = url.pathname.match(/^\/t\/topic\/(\d+)(?:\/\d+)?\/?$/);
        if (topicMatch) return `topic:${topicMatch[1]}`;
        return `${url.pathname}${url.search}`;
      } catch (_) {
        return String(urlString || "");
      }
    },
    getTopicProgressSnapshot() {
      const { scrollHeight } = document.documentElement || {};
      return {
        scrollHeight: scrollHeight || 0,
        postCount: document.querySelectorAll(".topic-post").length,
        maxLoadedPostNumber: this.getLoadedMaxPostNumber()
      };
    },
    parseCssPixels(value) {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    },
    isBlueTimelineColor(value) {
      const rgb = String(value || "").match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
      if (!rgb) return false;
      const red = Number(rgb[1]);
      const green = Number(rgb[2]);
      const blue = Number(rgb[3]);
      const alpha = rgb[4] === void 0 ? 1 : Number(rgb[4]);
      return alpha > 0.35 && blue >= 120 && green >= 90 && red <= 80;
    },
    isBlueDotStyle(style, fallbackRect = null) {
      if (!style || style.display === "none" || style.visibility === "hidden") return false;
      if (Number(style.opacity || 1) < 0.2) return false;
      const width = this.parseCssPixels(style.width) || fallbackRect?.width || 0;
      const height = this.parseCssPixels(style.height) || fallbackRect?.height || 0;
      const radius = this.parseCssPixels(style.borderTopLeftRadius);
      const isSmallRound = width >= 4 && width <= 18 && height >= 4 && height <= 18 && Math.abs(width - height) <= 6 && radius >= Math.min(width, height) * 0.35;
      if (!isSmallRound) return false;
      return [style.backgroundColor, style.borderColor, style.color].some((color) => this.isBlueTimelineColor(color));
    },
    hasUnreadTimelineBlueDot() {
      const containers = Array.from(document.querySelectorAll([
        ".topic-timeline",
        ".timeline-scrollarea",
        ".timeline-container",
        ".timeline-replies",
        ".topic-navigation"
      ].join(",")));
      if (containers.length === 0) return false;
      return containers.some((container) => Array.from(container.querySelectorAll("*")).some((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return false;
        const directStyle = window.getComputedStyle(element);
        if (this.isBlueDotStyle(directStyle, rect)) return true;
        return ["::before", "::after"].some((pseudo) => {
          const pseudoStyle = window.getComputedStyle(element, pseudo);
          if (!pseudoStyle || pseudoStyle.content === "none") return false;
          return this.isBlueDotStyle(pseudoStyle);
        });
      }));
    },
    nudgeScrollForReadConfirmation() {
      const pixels = CONFIG.scroll.readConfirmationNudgePixels;
      window.dispatchEvent(new Event("scroll"));
      window.scrollBy({ top: -pixels, behavior: "auto" });
      window.scrollBy({ top: pixels * 2, behavior: "smooth" });
    },
    async waitForTopicReadConfirmation() {
      if (!this.isTopicPage) return true;
      let clearChecks = 0;
      for (let attempt = 0; attempt < CONFIG.scroll.readConfirmationChecks; attempt++) {
        if (!this.autoRunning) return false;
        if (!this.hasUnreadTimelineBlueDot()) {
          clearChecks++;
          if (clearChecks >= CONFIG.scroll.readConfirmationClearChecks) return true;
        } else {
          clearChecks = 0;
          console.log("[\u5B8C\u6574\u9605\u8BFB] \u68C0\u6D4B\u5230\u697C\u5C42\u5C0F\u84DD\u70B9\u672A\u6D88\u5931\uFF0C\u7EE7\u7EED\u7B49\u5F85\u9605\u8BFB\u786E\u8BA4...");
          this.nudgeScrollForReadConfirmation();
        }
        await Utils.sleep(CONFIG.scroll.readConfirmationDelay);
      }
      return !this.hasUnreadTimelineBlueDot();
    },
    getLoadedMaxPostNumber() {
      const posts = Array.from(document.querySelectorAll(".topic-post[data-post-number]"));
      return posts.reduce((max, post) => {
        const number = Number.parseInt(post.getAttribute("data-post-number") || "0", 10);
        return Number.isFinite(number) ? Math.max(max, number) : max;
      }, 0);
    },
    async getCurrentTopicMaxPostNumber() {
      const topicIdMatch = window.location.pathname.match(/\/t\/topic\/(\d+)/);
      const topicId = topicIdMatch ? topicIdMatch[1] : null;
      if (!topicId) return this.getLoadedMaxPostNumber();
      if (this._topicMaxPostNumberTopicId === topicId && Number.isFinite(this._topicMaxPostNumber)) {
        return this._topicMaxPostNumber;
      }
      const url = new URL(window.location.href);
      url.hash = "";
      const jsonUrl = url.toString().replace(/\/$/, "") + ".json";
      try {
        const response = await fetch(jsonUrl, { credentials: "include" });
        const data = response && response.ok ? await response.json() : null;
        const maxPostNumber = Number(data?.highest_post_number || data?.posts_count || 0);
        this._topicMaxPostNumberTopicId = topicId;
        this._topicMaxPostNumber = Number.isFinite(maxPostNumber) && maxPostNumber > 0 ? maxPostNumber : this.getLoadedMaxPostNumber();
        return this._topicMaxPostNumber;
      } catch (_) {
        return this.getLoadedMaxPostNumber();
      }
    },
    hasTopicProgressChanged(previous, current) {
      return current.scrollHeight > previous.scrollHeight + 50 || current.postCount > previous.postCount || current.maxLoadedPostNumber > previous.maxLoadedPostNumber;
    },
    async isTopicFullyRead() {
      const settleChecks = CONFIG.scroll.bottomSettleChecks;
      const settleDelay = CONFIG.scroll.bottomSettleDelay;
      const targetMaxPostNumber = await this.getCurrentTopicMaxPostNumber();
      let previous = this.getTopicProgressSnapshot();
      for (let attempt = 0; attempt < settleChecks; attempt++) {
        await Utils.sleep(settleDelay);
        if (!this.autoRunning || !this.isScrolling) return false;
        if (!Utils.isNearBottom() || !Utils.isPageLoaded()) return false;
        const current = this.getTopicProgressSnapshot();
        if (targetMaxPostNumber > 0 && current.maxLoadedPostNumber < targetMaxPostNumber) return false;
        if (this.hasTopicProgressChanged(previous, current)) return false;
        if (this.hasUnreadTimelineBlueDot()) {
          console.log("[\u5B8C\u6574\u9605\u8BFB] \u697C\u5C42\u5C0F\u84DD\u70B9\u4ECD\u5B58\u5728\uFF0C\u6682\u4E0D\u8DF3\u8F6C\u4E0B\u4E00\u7BC7");
          this.nudgeScrollForReadConfirmation();
          return false;
        }
        previous = current;
      }
      const reachedLastPost = targetMaxPostNumber <= 0 || previous.maxLoadedPostNumber >= targetMaxPostNumber;
      return reachedLastPost && await this.waitForTopicReadConfirmation();
    },
    isPageLoadingStalled(timeOnPage) {
      return this.isTopicPage && timeOnPage > CONFIG.time.topicLoadingTimeout && !Utils.isPageLoaded();
    },
    getScrollPlan(shouldReadFullTopic) {
      if (!shouldReadFullTopic) {
        const delay = Utils.random(CONFIG.scroll.minSpeed, CONFIG.scroll.maxSpeed);
        const distance = Utils.random(CONFIG.scroll.minDistance, CONFIG.scroll.maxDistance);
        return {
          step: distance * CONFIG.scroll.stepMultiplier,
          behavior: "smooth",
          delay,
          allowFastScroll: true
        };
      }
      const viewportHeight = Math.max(
        window.innerHeight || 0,
        document.documentElement?.clientHeight || 0,
        CONFIG.scroll.fullTopicMinStep
      );
      const getStepRange = (minRatio, maxRatio) => {
        const minStep2 = Math.max(12, Math.floor(viewportHeight * minRatio));
        const maxStep2 = Math.max(minStep2, Math.floor(viewportHeight * maxRatio));
        return [minStep2, maxStep2];
      };
      const roll = Utils.random(1, 100);
      if (roll <= CONFIG.scroll.fullTopicBacktrackChance) {
        const [minStep2, maxStep2] = getStepRange(
          CONFIG.scroll.fullTopicBacktrackMinRatio,
          CONFIG.scroll.fullTopicBacktrackMaxRatio
        );
        return {
          step: -Utils.random(minStep2, maxStep2),
          behavior: "smooth",
          delay: Utils.random(CONFIG.scroll.fullTopicBacktrackMinSpeed, CONFIG.scroll.fullTopicBacktrackMaxSpeed),
          allowFastScroll: false
        };
      }
      const useSlowStep = roll <= CONFIG.scroll.fullTopicSlowChance;
      const [minStep, maxStep] = useSlowStep ? getStepRange(CONFIG.scroll.fullTopicSmallStepMinRatio, CONFIG.scroll.fullTopicSmallStepMaxRatio) : getStepRange(CONFIG.scroll.fullTopicNormalStepMinRatio, CONFIG.scroll.fullTopicNormalStepMaxRatio);
      const [minDelay, maxDelay] = useSlowStep ? [CONFIG.scroll.fullTopicSlowMinSpeed, CONFIG.scroll.fullTopicSlowMaxSpeed] : [CONFIG.scroll.fullTopicNormalMinSpeed, CONFIG.scroll.fullTopicNormalMaxSpeed];
      return {
        step: Utils.random(minStep, maxStep),
        behavior: "smooth",
        delay: Utils.random(minDelay, maxDelay),
        allowFastScroll: false
      };
    },
    async recoverFromStuck() {
      console.log("\u{1F527} \u5F00\u59CB\u6062\u590D\u6D41\u7A0B...");
      this.stopScrolling();
      await Utils.sleep(1e3);
      if (!this.autoRunning) return;
      if (this.isTopicPage) {
        console.log("\u{1F4D6} \u5728\u6587\u7AE0\u9875\uFF0C\u91CD\u65B0\u5F00\u59CB\u6EDA\u52A8");
        this.startScrolling();
      } else {
        console.log("\u{1F4CB} \u5728\u5217\u8868\u9875\uFF0C\u5C1D\u8BD5\u5BFC\u822A\u5230\u4E0B\u4E00\u7BC7");
        if (this.topicList.length === 0) {
          await this.getLatestTopics();
          if (!this.autoRunning) return;
        }
        await this.navigateNextTopic();
      }
      this.pageLoadTime = Date.now();
    },
    handleButtonClick() {
      if (this.isScrolling || this.autoRunning) {
        this.stopAutoReading();
      } else {
        if (this.stopOnLikeLimitEnabled) {
          const likeStatus = this.likeCounter?.getStatus?.();
          const isLikeCounterCooldown = likeStatus && likeStatus.isInCooldown;
          const isOldCooldown = this.likeResumeTime && Date.now() < this.likeResumeTime;
          const hasNoRemainingLikes = likeStatus && likeStatus.remaining === 0;
          if (isLikeCounterCooldown || isOldCooldown || hasNoRemainingLikes) {
            console.log(`[\u70B9\u8D5E\u4E0A\u9650] \u70B9\u8D5E\u5DF2\u8FBE\u4E0A\u9650\uFF0C\u65E0\u6CD5\u5F00\u59CB\u9605\u8BFB (cooldown: ${isLikeCounterCooldown}, oldCooldown: ${isOldCooldown}, noRemaining: ${hasNoRemainingLikes})`);
            this.showNotification(this.t("stoppedByLikeLimit"));
            return;
          }
        }
        this.autoRunning = true;
        this.setSessionStorage("autoRunning", true);
        this.button.innerHTML = `<span class="btn-icon">\u23F8</span><span class="btn-text">${this.t("stopReading")}</span>`;
        this.button.classList.add("running");
        this.startNavigationGuard();
        if (this.accountDataSection && this.accountDataSectionContent) {
          this.setSectionExpanded(this.accountDataSection, this.accountDataSectionContent, false);
        }
        if (this.accountSection && this.accountSectionContent) {
          if (this.accountSection.getAttribute("aria-expanded") === "true") {
            this.setSectionExpanded(this.accountSection, this.accountSectionContent, false);
            ;
          }
        }
        if (this.autoSectionContent) {
          const autoSection = this.autoSection;
          if (autoSection && autoSection.classList.contains("collapsed")) {
            autoSection.classList.remove("collapsed");
            this.setSectionExpanded(this.autoSection, this.autoSectionContent, true);
          }
        }
        if (!this.firstUseChecked) {
          this.handleFirstUse();
        } else if (this.isTopicPage) {
          this.startScrolling();
        } else {
          this.getLatestTopics().then(() => {
            if (!this.autoRunning) return;
            this.navigateNextTopic();
          });
        }
      }
    },
    async handleFirstUse() {
      if (!this.autoRunning) return;
      if (CURRENT_DOMAIN !== "linux.do") {
        console.log("\u975E linux.do \u57DF\u540D\uFF0C\u8DF3\u8FC7\u65B0\u624B\u6559\u7A0B");
        Storage.set("firstUseChecked", true);
        this.firstUseChecked = true;
        await this.getLatestTopics();
        if (!this.autoRunning) return;
        await this.navigateNextTopic();
        return;
      }
      if (!this.selectedPost) {
        const randomIndex = Math.floor(Math.random() * CONFIG.mustRead.posts.length);
        this.selectedPost = CONFIG.mustRead.posts[randomIndex];
        Storage.set("selectedPost", this.selectedPost);
        console.log(`\u968F\u673A\u9009\u62E9\u6587\u7AE0: ${this.selectedPost.url}`);
        window.location.href = this.selectedPost.url;
        return;
      }
      const currentUrl = window.location.href;
      if (currentUrl.includes(this.selectedPost.url)) {
        Storage.set("firstUseChecked", true);
        this.firstUseChecked = true;
        if (this.isTopicPage) this.startScrolling();
        else {
          await this.getLatestTopics();
          if (this.autoRunning) await this.navigateNextTopic();
        }
      } else {
        window.location.href = this.selectedPost.url;
      }
    },
    async getLatestTopics() {
      if (!this.autoRunning) return [];
      let topicList = [];
      let retryCount = 0;
      let totalSkipped = 0;
      let emptyPageCount = 0;
      let topicLimit = this.topicLimitCount || 100;
      if (this.stopAfterReadEnabled) {
        const remainingToRead = this.stopAfterReadCount - this.currentSessionReadCount;
        if (remainingToRead > 0) {
          topicLimit = remainingToRead;
          console.log(`[\u9605\u8BFB\u9650\u5236] \u5F00\u542F\u9605\u8BFB\u9650\u5236\uFF0C\u672C\u6B21\u53EA\u83B7\u53D6 ${topicLimit} \u7BC7\u5E16\u5B50\uFF08\u9650\u5236${this.stopAfterReadCount}\u7BC7\uFF0C\u5DF2\u8BFB${this.currentSessionReadCount}\u7BC7\uFF09`);
        } else {
          console.log(`[\u9605\u8BFB\u9650\u5236] \u5DF2\u8FBE\u5230\u9605\u8BFB\u9650\u5236\uFF0C\u4E0D\u518D\u83B7\u53D6\u65B0\u5E16\u5B50`);
          topicLimit = 0;
        }
      }
      const maxPagesPerFetch = Math.max(50, Math.ceil(topicLimit / 5));
      let startPage = this.getStartPage();
      let page = startPage;
      const maxPage = startPage + maxPagesPerFetch - 1;
      const endpoint = this.readUnreadEnabled ? "unread" : "latest";
      const topicType = this.readUnreadEnabled ? this.t("unreadTopics") : this.t("latestTopics");
      console.log(`[\u9875\u7801\u7EED\u8BFB] \u4ECE\u7B2C${startPage}\u9875\u5F00\u59CB\u83B7\u53D6${this.readUnreadEnabled ? "\u672A\u8BFB" : "\u6700\u65B0"}\u5E16\u5B50\uFF08\u9650\u5236\uFF1A${topicLimit}\u7BC7\uFF0C\u6700\u5927\u7FFB\u5230\u7B2C${maxPage}\u9875\uFF09...`);
      this.updateTopicStatus({
        fetching: true,
        type: topicType,
        current: 0,
        target: topicLimit,
        skipped: 0,
        startPage
      });
      while (topicList.length < topicLimit && retryCount < CONFIG.article.retryLimit && page <= maxPage) {
        try {
          const response = await fetch(`${BASE_URL}/${endpoint}.json?no_definitions=true&page=${page}`);
          if (!this.autoRunning) return topicList;
          if (response.status === 502) {
            this.showNotification(this.t("stoppedByServerBusy"));
            this.stopAutoReading();
            return topicList;
          }
          const data = await response.json();
          if (!this.autoRunning) return topicList;
          if (data?.topic_list?.topics && data.topic_list.topics.length > 0) {
            emptyPageCount = 0;
            let filteredTopics = data.topic_list.topics.filter(
              (topic) => topic.posts_count < CONFIG.article.commentLimit
            );
            if (this.skipReadEnabled) {
              const beforeCount = filteredTopics.length;
              filteredTopics = filteredTopics.filter(
                (topic) => !this.isTopicRead(topic.id.toString())
              );
              const skippedCount = beforeCount - filteredTopics.length;
              if (skippedCount > 0) {
                totalSkipped += skippedCount;
                console.log(`\u7B2C${page}\u9875\uFF1A\u8DF3\u8FC7\u4E86 ${skippedCount} \u7BC7\u5DF2\u8BFB\u5E16\u5B50\uFF0C\u83B7\u53D6 ${filteredTopics.length} \u7BC7\u672A\u8BFB`);
              }
            }
            topicList.push(...filteredTopics);
            if (topicList.length > 1) {
              const seenTopicIds = /* @__PURE__ */ new Set();
              const beforeDedupCount = topicList.length;
              topicList = topicList.filter((topic) => {
                const topicId = String(topic?.id ?? "");
                if (!topicId) return false;
                if (seenTopicIds.has(topicId)) {
                  return false;
                }
                seenTopicIds.add(topicId);
                return true;
              });
              const dedupedCount = beforeDedupCount - topicList.length;
              if (dedupedCount > 0) {
                console.log(`[\u53BB\u91CD] \u7B2C${page}\u9875\u5408\u5E76\u540E\u79FB\u9664\u4E86 ${dedupedCount} \u7BC7\u91CD\u590D topic`);
              }
            }
            page++;
            this.updateTopicStatus({
              fetching: true,
              type: topicType,
              current: topicList.length,
              target: topicLimit,
              skipped: totalSkipped,
              page: page - 1,
              maxPages: maxPage,
              startPage
            });
            if (this.readUnreadEnabled && data.topic_list.topics.length === 0) {
              console.log("\u672A\u8BFB\u5E16\u5B50\u6A21\u5F0F\uFF1AAPI\u8FD4\u56DE\u7A7A\u6570\u636E\uFF0C\u6CA1\u6709\u66F4\u591A\u672A\u8BFB\u5E16\u5B50");
              break;
            }
          } else {
            emptyPageCount++;
            console.log(`\u7B2C${page}\u9875\uFF1AAPI\u8FD4\u56DE\u7A7A\u6570\u636E\uFF08\u8FDE\u7EED${emptyPageCount}\u9875\u4E3A\u7A7A\uFF09`);
            if (emptyPageCount >= 3) {
              if (startPage > 1 && topicList.length < topicLimit) {
                console.log(`[\u9875\u7801\u7EED\u8BFB] \u8FDE\u7EED${emptyPageCount}\u9875\u4E3A\u7A7A\uFF0C\u4ECE\u7B2C1\u9875\u91CD\u65B0\u626B\u63CF...`);
                page = 1;
                startPage = 1;
                emptyPageCount = 0;
                this.lastFetchedPage = 0;
                this.setSessionStorage("lastFetchedPage", 0);
                continue;
              }
              break;
            }
            page++;
          }
        } catch (error) {
          console.error("\u83B7\u53D6\u6587\u7AE0\u5217\u8868\u5931\u8D25:", error);
          retryCount++;
          await Utils.sleep(1e3);
          if (!this.autoRunning) return topicList;
        }
      }
      const finalPage = page - 1;
      this.lastFetchedPage = finalPage;
      this.setSessionStorage("lastFetchedPage", finalPage);
      this.saveHistoricalMaxPage(finalPage);
      const reachedMaxPages = page > maxPage && topicList.length < topicLimit;
      if (reachedMaxPages) {
        console.log(`[\u9875\u7801\u7EED\u8BFB] \u5DF2\u8FBE\u5230\u672C\u6B21\u6700\u5927\u9875\u6570 ${maxPage} \u9875\uFF0C\u83B7\u53D6\u5230 ${topicList.length}/${topicLimit} \u7BC7\u5E16\u5B50`);
      }
      if (topicList.length > topicLimit) {
        topicList = topicList.slice(0, topicLimit);
      }
      if (topicList.length > 1) {
        const seenTopicIds = /* @__PURE__ */ new Set();
        const beforeDedupCount = topicList.length;
        topicList = topicList.filter((topic) => {
          const topicId = String(topic?.id ?? "");
          if (!topicId) return false;
          if (seenTopicIds.has(topicId)) {
            return false;
          }
          seenTopicIds.add(topicId);
          return true;
        });
        const dedupedCount = beforeDedupCount - topicList.length;
        if (dedupedCount > 0) {
          console.log(`[\u53BB\u91CD] \u6700\u7EC8\u5217\u8868\u79FB\u9664\u4E86 ${dedupedCount} \u7BC7\u91CD\u590D topic`);
        }
      }
      if (this.randomOrderEnabled && topicList.length > 1) {
        topicList = this.shuffleArray(topicList);
        console.log("\u5DF2\u968F\u673A\u6253\u4E71\u5E16\u5B50\u987A\u5E8F");
      }
      this.topicList = topicList;
      this.setSessionStorage("topicList", topicList);
      console.log(`[\u9875\u7801\u7EED\u8BFB] \u5DF2\u83B7\u53D6 ${topicList.length} \u7BC7${this.readUnreadEnabled ? "\u672A\u8BFB" : "\u6700\u65B0"}\u6587\u7AE0${this.randomOrderEnabled ? "\uFF08\u968F\u673A\u987A\u5E8F\uFF09" : ""}\uFF08\u7B2C${startPage}-${finalPage}\u9875\uFF09`);
      this.updateTopicStatus({
        fetching: false,
        type: topicType,
        current: topicList.length,
        target: topicLimit,
        skipped: totalSkipped,
        ready: true,
        reachedMaxPages,
        totalPages: finalPage - startPage + 1,
        startPage,
        endPage: finalPage
      });
      if (topicList.length === 0) {
        if (this.readUnreadEnabled) {
          this.showNotification(this.t("noUnreadPosts"));
          this.readUnreadEnabled = false;
          Storage.set("readUnreadEnabled", false);
          this.resetPageProgress();
          await this.getLatestTopics();
          if (!this.autoRunning) return topicList;
        } else if (this.skipReadEnabled && startPage > 1) {
          console.log("[\u9875\u7801\u7EED\u8BFB] \u9AD8\u9875\u7801\u65E0\u672A\u8BFB\u5E16\u5B50\uFF0C\u4ECE\u7B2C1\u9875\u91CD\u65B0\u5F00\u59CB");
          this.resetPageProgress();
          this.historicalMaxPage = 0;
          Storage.set("historicalMaxPageData", null);
          await this.getLatestTopics();
          if (!this.autoRunning) return topicList;
        } else if (this.skipReadEnabled) {
          this.showNotification("\u6240\u6709\u5E16\u5B50\u90FD\u5DF2\u8BFB\u8FC7\uFF0C\u505C\u6B62\u9605\u8BFB");
          this.stopAutoReading();
        }
      }
      return topicList;
    },
    updateTopicStatus(status) {
      if (!this.topicStatusContainer || !this.topicStatusContent) return;
      this.topicStatusContainer.style.display = "block";
      if (this.topicStatusHideTimer) {
        clearTimeout(this.topicStatusHideTimer);
        this.topicStatusHideTimer = null;
      }
      const progressPercent = status.target > 0 ? Math.min(100, Math.round(status.current / status.target * 100)) : 0;
      let html = "";
      if (status.fetching) {
        this.topicStatusMode = "fetching";
        const startPageInfo = status.startPage > 1 ? `\u4ECE\u7B2C${status.startPage}\u9875` : "";
        const pageInfo = status.page ? `\uFF08${startPageInfo ? startPageInfo + "\u8D77\uFF0C" : ""}\u5F53\u524D\u7B2C${status.page}\u9875\uFF09` : "";
        html = `
                <div class="topic-status-heading">
                    ${this.t("fetchingTopics")} <span class="topic-status-type">${status.type}</span> ${pageInfo}
                </div>
                <div class="topic-status-progress-row">
                    <div class="topic-status-progress-track">
                        <div class="topic-status-progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                    <span class="topic-status-percent">${progressPercent}%</span>
                </div>
                <div class="topic-status-meta">
                    <span>${this.t("totalFetched")}: <span class="topic-status-remaining">${status.current}</span>/${status.target}</span>
                    ${status.skipped > 0 ? `<span>${this.t("skippedRead")}: <span class="topic-status-skipped">${status.skipped}</span></span>` : ""}
                </div>
            `;
      } else if (status.ready) {
        this.topicStatusMode = "ready";
        const pagesInfo = status.startPage && status.endPage ? `\uFF08\u7B2C${status.startPage}-${status.endPage}\u9875\uFF0C\u5171${status.totalPages}\u9875\uFF09` : status.totalPages ? `\uFF08\u5171${status.totalPages}\u9875\uFF09` : "";
        const reachedMaxInfo = status.reachedMaxPages ? `<div class="topic-status-warning">\u26A0\uFE0F \u5DF2\u8FBE\u6700\u5927\u7FFB\u9875\u6570\uFF0C\u672A\u80FD\u83B7\u53D6\u8DB3\u591F\u5E16\u5B50</div>` : "";
        html = `
                <div class="topic-status-ready">
                    \u2705 ${this.t("topicsReady")} ${pagesInfo}
                </div>
                <div class="topic-status-meta">
                    <span>${status.type}: <span class="topic-status-current">${status.current}</span> \u7BC7</span>
                    ${status.skipped > 0 ? `<span>${this.t("skippedRead")}: <span class="topic-status-skipped">${status.skipped}</span></span>` : ""}
                </div>
                ${reachedMaxInfo}
            `;
        this.topicStatusHideTimer = setTimeout(() => {
          this.topicStatusHideTimer = null;
          if (!this.isScrolling && this.topicStatusContainer && !this.hasTopicStatusNotification()) {
            this.topicStatusContainer.style.display = "none";
          }
        }, 3e3);
      } else {
        this.topicStatusMode = null;
      }
      this.topicStatusContent.innerHTML = html;
    },
    updateReadingStatus() {
      if (!this.topicStatusContainer || !this.topicStatusContent || !this.autoRunning) return;
      if (this.topicStatusHideTimer) {
        clearTimeout(this.topicStatusHideTimer);
        this.topicStatusHideTimer = null;
      }
      this.topicStatusMode = "reading";
      const remaining = this.topicList.length;
      const topicType = this.readUnreadEnabled ? this.t("unreadTopics") : this.t("latestTopics");
      const skipped = this.skippedReadCount || 0;
      const todayRead = this.todayReadCount || 0;
      this.topicStatusContainer.style.display = "block";
      this.topicStatusContent.innerHTML = `
            <div class="topic-status-reading-row">
                <span>${this.t("currentReading")}: <span class="topic-status-type">${topicType}</span></span>
                <span>${this.t("remainingTopics")}: <span class="topic-status-remaining">${remaining}</span></span>
            </div>
            <div class="topic-status-meta">
                <span>\u{1F4C5} ${this.t("todayRead")}: <span class="topic-status-today">${todayRead}</span></span>
                ${skipped > 0 ? `<span>\u23ED\uFE0F ${this.t("skippedRead")}: <span class="topic-status-skipped">${skipped}</span></span>` : ""}
            </div>
        `;
    },
    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    async getNextTopic() {
      if (this.topicList.length === 0) {
        await this.getLatestTopics();
      }
      while (this.topicList.length > 0) {
        const topic = this.topicList.shift();
        if (this.skipReadEnabled && this.isTopicRead(topic.id.toString())) {
          console.log(`\u8DF3\u8FC7\u5DF2\u8BFB\u5E16\u5B50: ${topic.title} (ID: ${topic.id})`);
          this.skippedReadCount++;
          this.setSessionStorage("skippedReadCount", this.skippedReadCount);
          this.setSessionStorage("topicList", this.topicList);
          this.updateReadingStatus();
          continue;
        }
        this.setSessionStorage("topicList", this.topicList);
        return topic;
      }
      return null;
    },
    async startScrolling() {
      if (this.isScrolling) return;
      this.isScrolling = true;
      this.button.innerHTML = `<span class="btn-icon">\u23F8</span><span class="btn-text">${this.t("stopReading")}</span>`;
      this.button.classList.add("running");
      this.lastActionTime = Date.now();
      const shouldReadFullTopic = this.fullTopicReadEnabled && this.isTopicPage;
      if (shouldReadFullTopic) {
        window.scrollTo({ top: 0, behavior: "auto" });
        await Utils.sleep(300);
      }
      if (this.isTopicPage) {
        this.bindSmartLikeScroll();
        if (this.smartLikeEnabled) this.scanSmartLikePosts();
        if (shouldReadFullTopic) {
          window.scrollTo({ top: 0, behavior: "auto" });
          await Utils.sleep(300);
        }
      }
      this.scrollStartTime = Date.now();
      const maxScrollTime = shouldReadFullTopic ? null : 3e4;
      while (this.isScrolling) {
        const scrollPlan = this.getScrollPlan(shouldReadFullTopic);
        window.scrollBy({
          top: scrollPlan.step,
          behavior: scrollPlan.behavior
        });
        if (Utils.isNearBottom()) {
          await Utils.sleep(800);
          if (!this.autoRunning) break;
          const canNavigate = shouldReadFullTopic ? await this.isTopicFullyRead() : Utils.isNearBottom() && Utils.isPageLoaded();
          if (canNavigate) {
            console.log("\u5DF2\u5230\u8FBE\u9875\u9762\u5E95\u90E8\uFF0C\u51C6\u5907\u5BFC\u822A\u5230\u4E0B\u4E00\u7BC7\u6587\u7AE0...");
            await Utils.sleep(1e3);
            if (!this.autoRunning) break;
            this.isScrolling = false;
            await this.navigateNextTopic();
            return;
          }
        }
        const scrolledTime = Date.now() - this.scrollStartTime;
        if (maxScrollTime !== null && scrolledTime > maxScrollTime) {
          if (this.isTopicPage && this.hasUnreadTimelineBlueDot()) {
            console.log("[\u9605\u8BFB\u786E\u8BA4] \u68C0\u6D4B\u5230\u697C\u5C42\u5C0F\u84DD\u70B9\u672A\u6D88\u5931\uFF0C\u53D6\u6D88\u672C\u6B21\u5F3A\u5236\u8DF3\u8F6C\u5E76\u7EE7\u7EED\u7B49\u5F85...");
            this.nudgeScrollForReadConfirmation();
            this.scrollStartTime = Date.now();
            continue;
          }
          console.log(`\u5DF2\u5728\u5F53\u524D\u9875\u9762\u6EDA\u52A8${Math.floor(scrolledTime / 1e3)}\u79D2\uFF0C\u5F3A\u5236\u8DF3\u8F6C\u5230\u4E0B\u4E00\u7BC7\u6587\u7AE0...`);
          this.isScrolling = false;
          await this.navigateNextTopic();
          return;
        }
        await Utils.sleep(scrollPlan.delay);
        this.accumulateTime();
        if (scrollPlan.allowFastScroll && Math.random() < CONFIG.scroll.fastScrollChance) {
          const fastScroll = Utils.random(CONFIG.scroll.fastScrollMin, CONFIG.scroll.fastScrollMax);
          window.scrollBy({
            top: fastScroll,
            behavior: "smooth"
          });
          await Utils.sleep(200);
        }
      }
    },
    stopScrolling() {
      this.isScrolling = false;
      this.cancelSmartLikeTasks("reading_paused");
      this.button.innerHTML = `<span class="btn-icon">\u25B6</span><span class="btn-text">${this.t("startReading")}</span>`;
      this.button.classList.remove("running");
    },
    accumulateTime() {
      const now = Date.now();
      this.accumulatedTime += now - this.lastActionTime;
      this.setSessionStorage("accumulatedTime", this.accumulatedTime);
      this.lastActionTime = now;
      if (this.accumulatedTime >= CONFIG.time.browseTime) {
        this.accumulatedTime = 0;
        this.setSessionStorage("accumulatedTime", 0);
        this.pauseForRest();
      }
    },
    async pauseForRest() {
      this.stopScrolling();
      const restMinutes = Math.floor(CONFIG.time.restTime / 6e4);
      console.log(`\u4F11\u606F${restMinutes}\u5206\u949F...`);
      this.showNotification(`\u23F8\uFE0F ${this.t("restStart")} ${restMinutes} ${this.t("minutes")}`);
      await Utils.sleep(CONFIG.time.restTime);
      console.log("\u4F11\u606F\u7ED3\u675F\uFF0C\u7EE7\u7EED\u6D4F\u89C8...");
      this.showNotification(`\u2705 ${this.t("restEnd")}`);
      this.startScrolling();
    },
    getCurrentTopicIdFromLocation() {
      const match = window.location.pathname.match(/\/t\/topic\/(\d+)/);
      return match ? String(match[1]) : null;
    },
    async waitForTopicNavigation(targetTopicId, timeout = 8e3) {
      const start = Date.now();
      const target = String(targetTopicId);
      while (Date.now() - start < timeout) {
        const currentTopicId = this.getCurrentTopicIdFromLocation();
        if (currentTopicId === target) {
          await Utils.sleep(300);
          const topicContent = document.querySelector(".topic-post article, article[data-post-id], .post-stream");
          if (topicContent) return true;
        }
        await Utils.sleep(150);
      }
      return false;
    },
    async onTopicNavigated(targetTopicId) {
      console.log(`[\u5BFC\u822A\u540E] \u5F00\u59CB\u5904\u7406\u65B0\u5E16\u5B50: ${targetTopicId}`);
      this.isTopicPage = window.location.pathname.includes("/t/topic/");
      this.pageLoadTime = Date.now();
      this.lastPageContextKey = this.getPageContextKey(window.location.href);
      this._topicMaxPostNumberTopicId = null;
      this._topicMaxPostNumber = null;
      await Utils.sleep(800);
      try {
        this.updateReadingStatus?.();
      } catch (error) {
        console.warn("[\u5BFC\u822A\u540E] updateReadingStatus \u5931\u8D25:", error);
      }
      if (this.autoRunning && this.isTopicPage && !this.isScrolling) {
        console.log("[\u5BFC\u822A\u540E] \u81EA\u52A8\u9605\u8BFB\u4ECD\u5F00\u542F\uFF0C\u6062\u590D\u6EDA\u52A8");
        this.startScrolling();
      }
    },
    getPageWindow() {
      try {
        if (typeof unsafeWindow !== "undefined" && unsafeWindow) return unsafeWindow;
      } catch (_) {
      }
      return window;
    },
    getDiscourseRouter() {
      const lookupNames = [
        "router:main",
        "service:router",
        "router:application"
      ];
      const lookupFrom = (source, label) => {
        if (!source || typeof source.lookup !== "function") return null;
        for (const name of lookupNames) {
          try {
            const router = source.lookup(name);
            if (router) {
              console.log(`[\u5BFC\u822A] \u5DF2\u4ECE ${label} \u83B7\u53D6 router: ${name}`);
              return router;
            }
          } catch (_) {
          }
        }
        return null;
      };
      try {
        const container = this.getPageWindow().Discourse?.__container__;
        const router = lookupFrom(container, "Discourse.__container__");
        if (router) return router;
      } catch (error) {
        console.warn("[\u5BFC\u822A] \u4ECE Discourse.__container__ \u83B7\u53D6 router \u5931\u8D25:", error);
      }
      try {
        const req = this.getPageWindow().require;
        const app = typeof req === "function" ? req("__DISCOURSE_APP__") : null;
        const router = lookupFrom(app, "__DISCOURSE_APP__");
        if (router) return router;
      } catch (error) {
        console.warn("[\u5BFC\u822A] \u4ECE __DISCOURSE_APP__ \u83B7\u53D6 router \u5931\u8D25:", error);
      }
      try {
        const api = this.getPageWindow().Discourse?.__container__?.lookup?.("api:main");
        const router = api?.container ? lookupFrom(api.container, "api:main.container") : null;
        if (router) return router;
      } catch (error) {
        console.warn("[\u5BFC\u822A] \u4ECE api:main \u83B7\u53D6 router \u5931\u8D25:", error);
      }
      console.warn("[\u5BFC\u822A] \u672A\u627E\u5230\u53EF\u7528\u7684 Discourse/Ember router");
      return null;
    },
    findTopicAnchor(targetTopicId) {
      const target = String(targetTopicId);
      return Array.from(document.querySelectorAll("a[href]")).find((anchor) => {
        const href = anchor.getAttribute("href") || "";
        return href === `/t/topic/${target}` || href.startsWith(`/t/topic/${target}/`);
      }) || Array.from(document.querySelectorAll("a[href]")).find((anchor) => {
        const href = anchor.getAttribute("href") || "";
        return href.includes(`/t/topic/${target}`);
      });
    },
    async waitAfterSoftNavigation(mode, targetTopicId) {
      console.log(`[\u5BFC\u822A] \u5DF2\u53D1\u8D77\u8DF3\u8F6C\uFF0C\u65B9\u5F0F: ${mode}`);
      const ok = await this.waitForTopicNavigation(targetTopicId, 8e3);
      if (!ok) {
        console.warn(`[\u5BFC\u822A] \u5728\u7B49\u5F85\u671F\u5185\u672A\u786E\u8BA4\u8FDB\u5165\u76EE\u6807\u5E16\u5B50: ${targetTopicId}`);
        return false;
      }
      console.log(`[\u5BFC\u822A] \u5DF2\u786E\u8BA4\u8FDB\u5165\u76EE\u6807\u5E16\u5B50: ${targetTopicId}`);
      if (this.navigationTimeout) {
        clearTimeout(this.navigationTimeout);
        this.navigationTimeout = null;
      }
      await this.onTopicNavigated(targetTopicId);
      return true;
    },
    async tryRouteToWithDiscourseURL(target, targetTopicId, label) {
      if (!this.getPageWindow().DiscourseURL || typeof this.getPageWindow().DiscourseURL.routeTo !== "function") return false;
      try {
        console.log(`[\u5BFC\u822A] \u5C1D\u8BD5 DiscourseURL.routeTo(${label}):`, target);
        this.getPageWindow().DiscourseURL.routeTo(target);
        return await this.waitAfterSoftNavigation(`DiscourseURL.routeTo(${label})`, targetTopicId);
      } catch (error) {
        console.warn(`[\u5BFC\u822A] DiscourseURL.routeTo(${label}) \u5931\u8D25:`, error);
        return false;
      }
    },
    async tryRouterTransition(router, target, targetTopicId, label) {
      if (!router || typeof router.transitionTo !== "function") return false;
      try {
        console.log(`[\u5BFC\u822A] \u5C1D\u8BD5 router.transitionTo(${label}):`, target);
        router.transitionTo(target);
        return await this.waitAfterSoftNavigation(`router.transitionTo(${label})`, targetTopicId);
      } catch (error) {
        console.warn(`[\u5BFC\u822A] router.transitionTo(${label}) \u5931\u8D25:`, error);
        return false;
      }
    },
    async clickTopicLinkElement(anchor, targetTopicId, mode) {
      if (!anchor) return false;
      console.log(`[\u5BFC\u822A] \u5C1D\u8BD5\u94FE\u63A5\u70B9\u51FB(${mode}):`, anchor.href || anchor.getAttribute("href"));
      try {
        anchor.click();
      } catch (error) {
        console.warn(`[\u5BFC\u822A] anchor.click(${mode}) \u5931\u8D25\uFF0C\u5C1D\u8BD5 dispatchEvent:`, error);
        const eventWindow = anchor.ownerDocument?.defaultView;
        const EventCtor = eventWindow?.MouseEvent || MouseEvent;
        anchor.dispatchEvent(new EventCtor("click", {
          bubbles: true,
          cancelable: true,
          button: 0
        }));
      }
      return await this.waitAfterSoftNavigation(`link.click(${mode})`, targetTopicId);
    },
    async clickTemporaryTopicLink(path, url, targetTopicId) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.setAttribute("href", path);
      anchor.removeAttribute("target");
      anchor.setAttribute("data-auto-route", "true");
      anchor.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:auto;";
      document.body.appendChild(anchor);
      try {
        return await this.clickTopicLinkElement(anchor, targetTopicId, "temporary-anchor");
      } finally {
        anchor.remove();
      }
    },
    async tryHistoryPushState(path, targetTopicId) {
      try {
        const pageWindow = this.getPageWindow();
        console.log("[\u5BFC\u822A] \u5C1D\u8BD5 history.pushState:", path);
        pageWindow.history.pushState({}, "", path);
        const PopStateEventCtor = pageWindow.PopStateEvent || PopStateEvent;
        pageWindow.dispatchEvent(new PopStateEventCtor("popstate"));
        return await this.waitAfterSoftNavigation("history.pushState", targetTopicId);
      } catch (error) {
        console.warn("[\u5BFC\u822A] history.pushState \u5931\u8D25:", error);
        return false;
      }
    },
    async softNavigateToTopic(path, url, targetTopicId) {
      this.cancelSmartLikeTasks("topic_changed");
      if (this.navigationTimeout) {
        clearTimeout(this.navigationTimeout);
        this.navigationTimeout = null;
      }
      this.navigationTimeout = setTimeout(() => {
        const currentTopicId = this.getCurrentTopicIdFromLocation();
        if (currentTopicId !== String(targetTopicId)) {
          console.warn("\u26A0\uFE0F \u8DEF\u7531\u8DF3\u8F6C\u8D85\u65F6\uFF0Cfallback \u5230\u539F\u751F\u8DF3\u8F6C:", url);
          window.location.assign(url);
        } else {
          console.log("\u2705 \u5DF2\u7ECF\u8FDB\u5165\u76EE\u6807\u5E16\u5B50\uFF0C\u53D6\u6D88 fallback");
        }
      }, 12e3);
      try {
        if (await this.tryRouteToWithDiscourseURL(path, targetTopicId, "path")) return true;
        if (await this.tryRouteToWithDiscourseURL(url, targetTopicId, "url")) return true;
        const router = this.getDiscourseRouter();
        if (await this.tryRouterTransition(router, path, targetTopicId, "path")) return true;
        if (await this.tryRouterTransition(router, url, targetTopicId, "url")) return true;
        const candidate = this.findTopicAnchor(targetTopicId);
        if (await this.clickTopicLinkElement(candidate, targetTopicId, "existing-anchor")) return true;
        if (await this.clickTemporaryTopicLink(path, url, targetTopicId)) return true;
        if (await this.tryHistoryPushState(path, targetTopicId)) return true;
        console.warn("[\u5BFC\u822A] \u6240\u6709\u8F6F\u8DF3\u8F6C\u65B9\u6848\u5931\u8D25\uFF0C\u4F7F\u7528\u539F\u751F\u8DF3\u8F6C:", url);
        window.location.assign(url);
        return false;
      } catch (error) {
        console.error("[\u5BFC\u822A] \u8DF3\u8F6C\u5F02\u5E38\uFF0Cfallback \u5230\u539F\u751F\u8DF3\u8F6C:", error);
        window.location.assign(url);
        return false;
      }
    },
    async navigateNextTopic() {
      this.cancelSmartLikeTasks("navigating");
      if (this.isTopicPage && !await this.waitForTopicReadConfirmation()) {
        console.log("[\u9605\u8BFB\u786E\u8BA4] \u697C\u5C42\u5C0F\u84DD\u70B9\u672A\u6D88\u5931\uFF0C\u5DF2\u53D6\u6D88\u8DF3\u8F6C\u4E0B\u4E00\u7BC7");
        if (this.autoRunning && !this.isScrolling) this.startScrolling();
        return;
      }
      if (this.stopAfterReadEnabled && this.currentSessionReadCount >= this.stopAfterReadCount) {
        console.log(`\u5DF2\u8FBE\u5230\u9605\u8BFB\u6570\u91CF\u9650\u5236 (${this.currentSessionReadCount}/${this.stopAfterReadCount})\uFF0C\u81EA\u52A8\u505C\u6B62`);
        this.showNotification(this.t("stoppedByReadLimit"));
        this.stopAutoReading();
        return;
      }
      if (this.stopOnLikeLimitEnabled) {
        const likeStatus = this.likeCounter?.getStatus?.();
        const isLikeCounterCooldown = !!(likeStatus && likeStatus.isInCooldown);
        const isOldCooldown = !!(this.likeResumeTime && Date.now() < this.likeResumeTime);
        const hasNoRemainingLikes = !!(likeStatus && likeStatus.remaining === 0);
        if (isLikeCounterCooldown || isOldCooldown || hasNoRemainingLikes) {
          console.log(`[\u70B9\u8D5E\u4E0A\u9650] \u70B9\u8D5E\u5DF2\u8FBE\u4E0A\u9650\uFF0C\u81EA\u52A8\u505C\u6B62\u9605\u8BFB (cooldown: ${isLikeCounterCooldown}, oldCooldown: ${isOldCooldown}, noRemaining: ${hasNoRemainingLikes})`);
          this.showNotification(this.t("stoppedByLikeLimit"));
          this.stopAutoReading();
          return;
        }
      }
      const nextTopic = await this.getNextTopic();
      if (!nextTopic) {
        console.log("\u6CA1\u6709\u66F4\u591A\u6587\u7AE0\uFF0C\u8FD4\u56DE\u9996\u9875");
        window.location.assign(`${BASE_URL}/latest`);
        return;
      }
      console.log("\u5BFC\u822A\u5230\u65B0\u6587\u7AE0:", nextTopic.title);
      this.incrementTodayReadCount();
      this.currentSessionReadCount++;
      this.setSessionStorage("currentSessionReadCount", this.currentSessionReadCount);
      console.log(`\u5F53\u524D\u4F1A\u8BDD\u5DF2\u9605\u8BFB: ${this.currentSessionReadCount}/${this.stopAfterReadCount}`);
      this.updateReadingStatus();
      const currentMatch = window.location.pathname.match(/\/t\/topic\/(\d+)/);
      if (currentMatch) {
        const currentTopicId = currentMatch[1];
        await this.saveUserReadHistory(currentTopicId);
      }
      const targetTopicId = String(nextTopic.id);
      const path = this.fullTopicReadEnabled ? `/t/topic/${nextTopic.id}` : nextTopic.last_read_post_number ? `/t/topic/${nextTopic.id}/${nextTopic.last_read_post_number}` : `/t/topic/${nextTopic.id}`;
      const url = `${BASE_URL}${path}`;
      console.log("\u6B63\u5728\u8DF3\u8F6C\u5230:", url);
      await this.softNavigateToTopic(path, url, targetTopicId);
    },
    stopAutoReading() {
      this.stopScrolling();
      this.stopNavigationGuard();
      this.autoRunning = false;
      this.setSessionStorage("autoRunning", false);
      this.button.innerHTML = `<span class="btn-icon">\u25B6</span><span class="btn-text">${this.t("startReading")}</span>`;
      this.button.classList.remove("running");
      if (this.navigationTimeout) {
        clearTimeout(this.navigationTimeout);
        this.navigationTimeout = null;
      }
      console.log("\u81EA\u52A8\u9605\u8BFB\u5DF2\u505C\u6B62");
    },
    async loadUserReadHistory() {
      const username = await this.getCurrentUsername();
      if (!username) {
        console.log("\u672A\u83B7\u53D6\u5230\u7528\u6237\u540D\uFF0C\u65E0\u6CD5\u52A0\u8F7D\u9605\u8BFB\u5386\u53F2");
        this.readTopics = [];
        return;
      }
      const storageKey = `readTopics_${username}`;
      this.readTopics = Storage.get(storageKey, []);
      console.log(`\u5DF2\u52A0\u8F7D\u7528\u6237 ${username} \u7684\u9605\u8BFB\u5386\u53F2\uFF0C\u5171 ${this.readTopics.length} \u7BC7\u5E16\u5B50`);
      if (this.readTopics.length > this.totalReadCount) {
        console.log(`[\u6570\u636E\u540C\u6B65] \u603B\u9605\u8BFB\u6570\u4ECE ${this.totalReadCount} \u66F4\u65B0\u4E3A ${this.readTopics.length}`);
        this.totalReadCount = this.readTopics.length;
        Storage.set("totalReadCount", this.totalReadCount);
        this.updateReadStatsDisplay();
      }
    },
    async saveUserReadHistory(topicId) {
      const username = await this.getCurrentUsername();
      if (!username) {
        console.log("\u672A\u83B7\u53D6\u5230\u7528\u6237\u540D\uFF0C\u65E0\u6CD5\u4FDD\u5B58\u9605\u8BFB\u5386\u53F2");
        return;
      }
      if (!this.readTopics.includes(topicId)) {
        this.readTopics.push(topicId);
        if (this.readTopics.length > 1e3) {
          this.readTopics = this.readTopics.slice(-1e3);
        }
        const storageKey = `readTopics_${username}`;
        Storage.set(storageKey, this.readTopics);
        console.log(`\u5DF2\u4FDD\u5B58\u5E16\u5B50 ${topicId} \u5230\u7528\u6237 ${username} \u7684\u9605\u8BFB\u5386\u53F2`);
      }
    },
    isTopicRead(topicId) {
      return this.readTopics.includes(topicId);
    },
    loadTodayReadCount() {
      const now = /* @__PURE__ */ new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const savedData = Storage.get("todayReadStats", null);
      console.log(`[\u4ECA\u65E5\u9605\u8BFB] \u5F53\u524D\u65E5\u671F: ${today}, \u4FDD\u5B58\u7684\u6570\u636E:`, savedData);
      if (savedData && savedData.date) {
        const savedDate = savedData.date;
        const isToday = savedDate === today || savedDate === now.toDateString();
        if (isToday) {
          console.log(`[\u4ECA\u65E5\u9605\u8BFB] \u65E5\u671F\u5339\u914D\uFF0C\u8FD4\u56DE\u5DF2\u4FDD\u5B58\u7684\u8BA1\u6570: ${savedData.count}`);
          return savedData.count;
        }
      }
      console.log(`[\u4ECA\u65E5\u9605\u8BFB] \u65B0\u7684\u4E00\u5929\u6216\u65E0\u6570\u636E\uFF0C\u91CD\u7F6E\u8BA1\u6570\u4E3A0`);
      Storage.set("todayReadStats", { date: today, count: 0 });
      return 0;
    },
    incrementTodayReadCount() {
      const now = /* @__PURE__ */ new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const savedData = Storage.get("todayReadStats", null);
      if (savedData && savedData.date) {
        const savedDate = savedData.date;
        const isToday = savedDate === today || savedDate === now.toDateString();
        if (!isToday) {
          console.log(`[\u4ECA\u65E5\u9605\u8BFB] \u68C0\u6D4B\u5230\u8DE8\u5929\uFF01\u65E7\u65E5\u671F: ${savedDate}, \u65B0\u65E5\u671F: ${today}\uFF0C\u91CD\u7F6E\u4ECA\u65E5\u8BA1\u6570`);
          this.todayReadCount = 0;
        }
      }
      this.todayReadCount++;
      this.totalReadCount++;
      Storage.set("todayReadStats", { date: today, count: this.todayReadCount });
      Storage.set("totalReadCount", this.totalReadCount);
      console.log(`\u4ECA\u65E5\u5DF2\u9605\u8BFB ${this.todayReadCount} \u7BC7\u5E16\u5B50\uFF0C\u603B\u9605\u8BFB ${this.totalReadCount} \u7BC7`);
      this.updateReadStatsDisplay();
    },
    updateReadStatsDisplay() {
      if (!this.readStatsContainer) return;
      const todayCount = this.todayReadCount || 0;
      let totalCount = this.totalReadCount || 0;
      if (totalCount < todayCount) {
        totalCount = todayCount;
        this.totalReadCount = totalCount;
        Storage.set("totalReadCount", totalCount);
        console.log(`[\u6570\u636E\u4FEE\u590D] \u603B\u9605\u8BFB\u6570\u5DF2\u4FEE\u6B63\u4E3A ${totalCount}`);
      }
      this.readStatsContainer.innerHTML = `
            <div class="read-stat">
                <div class="read-stat-label">\u{1F4C5} ${this.t("todayRead")}</div>
                <div class="read-stat-value read-stat-today">${todayCount}</div>
            </div>
            <div class="read-stat-divider"></div>
            <div class="read-stat">
                <div class="read-stat-label">\u{1F4DA} ${this.t("totalRead")}</div>
                <div class="read-stat-value read-stat-total">${totalCount}</div>
            </div>
        `;
    },
    loadHistoricalMaxPage() {
      const today = (/* @__PURE__ */ new Date()).toDateString();
      const savedData = Storage.get("historicalMaxPageData", null);
      if (savedData) {
        if (savedData.date === today) {
          console.log(`[\u9875\u7801\u7EED\u8BFB] \u4ECA\u65E5\u5DF2\u8BFB\u6700\u5927\u9875\u7801: ${savedData.maxPage}`);
          return savedData.maxPage;
        }
        console.log(`[\u9875\u7801\u7EED\u8BFB] \u65B0\u7684\u4E00\u5929\uFF0C\u7EE7\u627F\u6628\u65E5\u6700\u5927\u9875\u7801: ${savedData.maxPage}`);
        return savedData.maxPage;
      }
      return 0;
    },
    saveHistoricalMaxPage(page) {
      const today = (/* @__PURE__ */ new Date()).toDateString();
      const currentMax = this.historicalMaxPage || 0;
      if (page > currentMax) {
        this.historicalMaxPage = page;
        Storage.set("historicalMaxPageData", { date: today, maxPage: page });
        console.log(`[\u9875\u7801\u7EED\u8BFB] \u66F4\u65B0\u5386\u53F2\u6700\u5927\u9875\u7801: ${page}`);
      }
    },
    getStartPage() {
      if (this.lastFetchedPage > 0) {
        console.log(`[\u9875\u7801\u7EED\u8BFB] \u4F7F\u7528\u4F1A\u8BDD\u5185\u4E0A\u6B21\u9875\u7801: ${this.lastFetchedPage + 1}`);
        return this.lastFetchedPage + 1;
      }
      if (this.historicalMaxPage > 0) {
        console.log(`[\u9875\u7801\u7EED\u8BFB] \u4F7F\u7528\u5386\u53F2\u6700\u5927\u9875\u7801: ${this.historicalMaxPage + 1}`);
        return this.historicalMaxPage + 1;
      }
      return 1;
    },
    resetPageProgress() {
      this.lastFetchedPage = 0;
      this.setSessionStorage("lastFetchedPage", 0);
      console.log("[\u9875\u7801\u7EED\u8BFB] \u5DF2\u91CD\u7F6E\u4F1A\u8BDD\u9875\u7801");
    }
  };

  // src/controller/mixins/lifecycle.js
  var methods4 = {
    startTrustLevelMonitor() {
      if (this.trustLevelMonitorInterval) {
        clearInterval(this.trustLevelMonitorInterval);
      }
      this.trustLevelMonitorInterval = setInterval(() => {
        if (this.shouldRefreshAccountInfo()) {
          console.log("\u81EA\u52A8\u5237\u65B0\u7B49\u7EA7\u4FE1\u606F...");
          this.loadUserTrustLevel(false);
        }
      }, 30 * 60 * 1e3);
      console.log("\u7B49\u7EA7\u76D1\u63A7\u5DF2\u542F\u52A8\uFF0830\u5206\u949F\u5237\u65B0\u4E00\u6B21\uFF0C\u4EC5\u5728\u53EF\u89C1\u65F6\uFF09");
    },
    shouldRefreshAccountInfo() {
      return Boolean(this.accountSection && this.accountSectionContent && this.accountSection.getAttribute("aria-expanded") === "true");
    },
    shouldRefreshCreditInfo() {
      return Boolean(this.creditSection && this.creditSection.getAttribute("aria-expanded") === "true");
    },
    shouldRefreshRankInfo() {
      return Boolean(this.rankSection && this.rankSection.getAttribute("aria-expanded") === "true");
    },
    shouldRefreshCdkInfo() {
      return Boolean(this.cdkSection && this.cdkSection.getAttribute("aria-expanded") === "true");
    },
    initDataLoading() {
      if (this.accountSection && this.accountSection.getAttribute("aria-expanded") === "true") {
        this.loadUserTrustLevel();
      }
    },
    startNavigationGuard() {
      if (this.navigationGuardInterval) {
        clearInterval(this.navigationGuardInterval);
      }
      this.pageLoadTime = Date.now();
      this.lastPageContextKey = this.getPageContextKey(window.location.href);
      this.navigationGuardInterval = setInterval(() => {
        if (!this.autoRunning) return;
        const currentTime = Date.now();
        const timeOnPage = currentTime - this.pageLoadTime;
        const currentPageContextKey = this.getPageContextKey(window.location.href);
        if (currentPageContextKey !== this.lastPageContextKey) {
          console.log("\u2705 \u9875\u9762\u5DF2\u8DF3\u8F6C\uFF0C\u91CD\u7F6E\u5B88\u62A4\u5B9A\u65F6\u5668");
          this.cancelSmartLikeTasks("topic_changed");
          this.pageLoadTime = currentTime;
          this.lastPageContextKey = currentPageContextKey;
          this.isTopicPage = window.location.pathname.includes("/t/topic/");
          if (this.autoRunning && this.isTopicPage && !this.isScrolling) {
            console.log("\u{1F6E1}\uFE0F \u5B88\u62A4\u68C0\u6D4B\u5230\u65B0\u6587\u7AE0\u9875\u4E14\u672A\u6EDA\u52A8\uFF0C\u5C1D\u8BD5\u6062\u590D\u6EDA\u52A8");
            this.startScrolling();
          }
          return;
        }
        if (this.isPageLoadingStalled(timeOnPage)) {
          console.warn("\u26A0\uFE0F \u68C0\u6D4B\u5230\u9875\u9762\u6301\u7EED\u52A0\u8F7D\u8D85\u65F6\uFF0C\u505C\u6B62\u81EA\u52A8\u9605\u8BFB");
          this.showNotification(this.t("stoppedByPageLoading"));
          this.stopAutoReading();
          return;
        }
        if (this.isTopicPage && timeOnPage > 6e4 && !this.isScrolling) {
          console.warn("\u26A0\uFE0F \u68C0\u6D4B\u5230\u9875\u9762\u53EF\u80FD\u5361\u4F4F\uFF0860\u79D2\u672A\u8DF3\u8F6C\u4E14\u672A\u6EDA\u52A8\uFF09\uFF0C\u5C1D\u8BD5\u6062\u590D...");
          this.recoverFromStuck();
        }
        if (!this.isTopicPage && timeOnPage > 3e4) {
          console.warn("\u26A0\uFE0F \u68C0\u6D4B\u5230\u5728\u975E\u6587\u7AE0\u9875\u5361\u4F4F\uFF0C\u5C1D\u8BD5\u6062\u590D...");
          this.recoverFromStuck();
        }
      }, 5e3);
      console.log("\u{1F6E1}\uFE0F \u5BFC\u822A\u5B88\u62A4\u7A0B\u5E8F\u5DF2\u542F\u52A8");
    },
    stopNavigationGuard() {
      if (this.navigationGuardInterval) {
        clearInterval(this.navigationGuardInterval);
        this.navigationGuardInterval = null;
        console.log("\u{1F6E1}\uFE0F \u5BFC\u822A\u5B88\u62A4\u7A0B\u5E8F\u5DF2\u505C\u6B62");
      }
    },
    getSessionStorage(key, defaultValue = null) {
      try {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    setSessionStorage(key, value) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error("SessionStorage error:", error);
        return false;
      }
    },
    startUserSwitchMonitoring() {
      this.getCurrentUsername().then((username) => {
        this.lastDetectedUser = username;
      });
      setInterval(async () => {
        const currentDetectedUser = await this.getCurrentUsername();
        if (currentDetectedUser && this.lastDetectedUser && currentDetectedUser !== this.lastDetectedUser) {
          console.log(`\u68C0\u6D4B\u5230\u8D26\u53F7\u5207\u6362: ${this.lastDetectedUser} -> ${currentDetectedUser}`);
          this.lastDetectedUser = currentDetectedUser;
          this.currentUsername = currentDetectedUser;
          setTimeout(() => {
            console.log("\u8D26\u53F7\u5207\u6362\u540E\u91CD\u65B0\u52A0\u8F7D\u7B49\u7EA7\u4FE1\u606F");
            this.loadUserTrustLevel(true);
          }, 1e3);
        } else if (currentDetectedUser) {
          this.lastDetectedUser = currentDetectedUser;
        }
      }, 5e3);
    }
  };

  // src/controller/mixins/topic.js
  var methods5 = {
    formatTopicCreatedTime(dateInput) {
      if (!dateInput) return "";
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (Number.isNaN(date.getTime())) return "";
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    },
    getTopicAgeLevel(dateInput) {
      if (!dateInput) return "fresh";
      const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
      if (Number.isNaN(date.getTime())) return "fresh";
      const ageDays = (Date.now() - date.getTime()) / (1e3 * 60 * 60 * 24);
      if (ageDays > 90) return "ancient";
      if (ageDays > 30) return "old";
      return "fresh";
    },
    extractTopicCreatedAtFromRow(row) {
      if (!row) return "";
      const parsePossibleDate = (value) => {
        if (!value) return "";
        const normalized = String(value).trim();
        if (!normalized) return "";
        if (/^\d{13}$/.test(normalized)) {
          const date2 = new Date(Number(normalized));
          return Number.isNaN(date2.getTime()) ? "" : date2.toISOString();
        }
        if (/^\d{10}$/.test(normalized)) {
          const date2 = new Date(Number(normalized) * 1e3);
          return Number.isNaN(date2.getTime()) ? "" : date2.toISOString();
        }
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? "" : normalized;
      };
      const parseChineseDateText = (value) => {
        if (!value) return "";
        const text = String(value).replace(/\s+/g, " ").trim();
        const match = text.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(\d{1,2}):(\d{2})/);
        if (!match) return "";
        const [, year, month, day, hour, minute] = match;
        const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${minute}:00`;
        const date = new Date(iso);
        return Number.isNaN(date.getTime()) ? "" : iso;
      };
      const candidates = [
        row.dataset.createdAt,
        row.getAttribute("data-created-at"),
        row.dataset.topicCreatedAt,
        row.getAttribute("data-topic-created-at"),
        row.dataset.bumpedAt,
        row.getAttribute("data-bumped-at")
      ].filter(Boolean);
      for (const value of candidates) {
        const parsed = parsePossibleDate(value);
        if (parsed) return parsed;
      }
      const topicLink = row.querySelector("a.title, .main-link a, a.raw-topic-link");
      if (topicLink) {
        const activityCell2 = topicLink.closest("tr")?.querySelector("td.activity[title], td.age[title], td.topic-list-data.age[title]");
        if (activityCell2) {
          const activityTitle = activityCell2.getAttribute("title") || "";
          const createdFromTitle = activityTitle.match(/创建日期[:：]\s*([^\n]+)/);
          if (createdFromTitle?.[1]) {
            const parsedChinese = parseChineseDateText(createdFromTitle[1]);
            if (parsedChinese) return parsedChinese;
            const parsedDirect = parsePossibleDate(createdFromTitle[1]);
            if (parsedDirect) return parsedDirect;
          }
        }
        const linkCandidates = [
          topicLink.dataset.createdAt,
          topicLink.getAttribute("data-created-at"),
          topicLink.getAttribute("title"),
          topicLink.getAttribute("aria-label")
        ].filter(Boolean);
        for (const value of linkCandidates) {
          const parsed = parsePossibleDate(value);
          if (parsed) return parsed;
          const datetimeMatch = String(value).match(/\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?/);
          if (datetimeMatch) {
            return datetimeMatch[0].replace(" ", "T");
          }
        }
      }
      const timeEls = row.querySelectorAll("time[datetime]");
      for (const timeEl of timeEls) {
        const dt = parsePossibleDate(timeEl.getAttribute("datetime"));
        if (dt) return dt;
      }
      const activityCell = row.querySelector("td.activity[title], td.age[title], td.topic-list-data.age[title]");
      if (activityCell) {
        const activityTitle = activityCell.getAttribute("title") || "";
        const createdFromTitle = activityTitle.match(/创建日期[:：]\s*([^\n]+)/);
        if (createdFromTitle?.[1]) {
          const parsedChinese = parseChineseDateText(createdFromTitle[1]);
          if (parsedChinese) return parsedChinese;
          const parsedDirect = parsePossibleDate(createdFromTitle[1]);
          if (parsedDirect) return parsedDirect;
        }
      }
      return "";
    },
    renderTopicCreatedTimeInList() {
      const rows = document.querySelectorAll("tr.topic-list-item, tr.latest-topic-list-item");
      rows.forEach((row) => {
        const activityLink = row.querySelector("td.activity a.post-activity, td.age a.post-activity, td.topic-list-data.age a.post-activity");
        const activityCell = activityLink?.closest("td.activity, td.age, td.topic-list-data.age") || row.querySelector("td.activity, td.age, td.topic-list-data.age");
        if (!activityCell) return;
        let meta = activityCell.querySelector(".lda-topic-created-time");
        if (!this.topicCreatedTimeVisible) {
          if (meta) meta.remove();
          return;
        }
        const createdAt = this.extractTopicCreatedAtFromRow(row);
        if (!createdAt) {
          if (meta) meta.remove();
          return;
        }
        const formatted = this.formatTopicCreatedTime(createdAt);
        if (!formatted) {
          if (meta) meta.remove();
          return;
        }
        if (!meta) {
          meta = document.createElement("span");
          meta.className = "lda-topic-created-time";
          const anchor = activityLink || activityCell.querySelector("a");
          if (anchor) {
            meta.style.display = "inline-flex";
            meta.style.alignItems = "center";
            meta.style.marginLeft = "8px";
            anchor.appendChild(meta);
          } else {
            meta.style.display = "inline-flex";
            meta.style.alignItems = "center";
            meta.style.marginLeft = "8px";
            activityCell.appendChild(meta);
          }
        }
        meta.dataset.createdAt = createdAt;
        meta.dataset.ageLevel = this.topicAgeColorEnabled ? this.getTopicAgeLevel(createdAt) : "neutral";
        meta.innerHTML = `<span class="lda-topic-created-separator">\uFF5C</span><span class="lda-topic-created-label">\u521B\u5EFA: ${formatted}</span>`;
        meta.title = `\u5E16\u5B50\u521B\u5EFA\u65F6\u95F4\uFF1A${formatted}`;
      });
    },
    initTopicCreatedTimeEnhancer() {
      this.renderTopicCreatedTimeInList();
      if (this._topicCreatedTimeObserver) {
        try {
          this._topicCreatedTimeObserver.disconnect();
        } catch (_) {
        }
      }
      let timer = null;
      const scheduleRender = () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => this.renderTopicCreatedTimeInList(), 200);
      };
      this._topicCreatedTimeObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type !== "childList") continue;
          for (const node of mutation.addedNodes) {
            if (!(node instanceof HTMLElement)) continue;
            if (node.matches?.("tr.topic-list-item, tr.latest-topic-list-item, .topic-list") || node.querySelector?.("tr.topic-list-item, tr.latest-topic-list-item")) {
              scheduleRender();
              return;
            }
          }
        }
      });
      if (document.body) {
        this._topicCreatedTimeObserver.observe(document.body, { childList: true, subtree: true });
      }
    },
    initFloorNumberDisplay() {
      this.addFloorNumbers();
      this.initMutationObserver();
    },
    addFloorNumbers() {
      const posts = Array.from(document.querySelectorAll(".boxed.onscreen-post"));
      if (!posts.length) {
        return;
      }
      const topicIdMatch = window.location.pathname.match(/\/t\/topic\/(\d+)/);
      const topicId = topicIdMatch ? topicIdMatch[1] : null;
      if (topicId && this._floorTopicId !== topicId) {
        this._floorTopicId = topicId;
        this._floorSmallActionNumbers = null;
        this._floorSmallActionPromise = null;
      }
      const ensureSmallActionNumbers = () => {
        if (!topicId) return;
        if (Array.isArray(this._floorSmallActionNumbers)) return;
        if (this._floorSmallActionPromise) return;
        const url = new URL(window.location.href);
        url.hash = "";
        const jsonUrl = url.toString().replace(/\/$/, "") + ".json";
        this._floorSmallActionPromise = fetch(jsonUrl, { credentials: "include" }).then((r) => r && r.ok ? r.json() : null).then((data) => {
          const arr = data?.post_stream?.posts;
          if (!Array.isArray(arr)) return null;
          const smallNums = [];
          for (const p of arr) {
            const n = p?.post_number;
            if (!Number.isFinite(n)) continue;
            const hasActionCode = typeof p?.action_code === "string" && p.action_code.length > 0;
            const postType = p?.post_type;
            const isNonRegularType = Number.isFinite(postType) && postType !== 1;
            let looksLikeSystemText = false;
            if (!hasActionCode && !isNonRegularType) {
              const cooked = typeof p?.cooked === "string" ? p.cooked : "";
              if (cooked) {
                const plain = cooked.replace(/<[^>]*>/g, "").trim();
                if (plain.length > 0 && plain.length <= 80) {
                  const hasCatTag = /类别|标签|category|tag/i.test(plain);
                  const hasUpdate = /更新|移除|removed|updated|change/i.test(plain);
                  if (hasCatTag && hasUpdate) looksLikeSystemText = true;
                }
              }
            }
            if (hasActionCode || isNonRegularType || looksLikeSystemText) {
              smallNums.push(n);
            }
          }
          smallNums.sort((a, b) => a - b);
          return smallNums;
        }).then((smallNums) => {
          if (Array.isArray(smallNums)) {
            const prev = this._floorSmallActionNumbers;
            this._floorSmallActionNumbers = smallNums;
            if (!Array.isArray(prev) || prev.length !== smallNums.length) {
              setTimeout(() => {
                if (this._floorTopicId === topicId) {
                  try {
                    this.addFloorNumbers();
                  } catch (_) {
                  }
                }
              }, 0);
            }
          }
        }).catch(() => {
        }).finally(() => {
          this._floorSmallActionPromise = null;
        });
      };
      ensureSmallActionNumbers();
      let smallActionPostNumbers = Array.isArray(this._floorSmallActionNumbers) ? this._floorSmallActionNumbers : null;
      if (!smallActionPostNumbers) {
        const topicPosts = Array.from(document.querySelectorAll(".topic-post[data-post-number]"));
        const nums = [];
        for (const tp of topicPosts) {
          const isSmallAction = tp.classList.contains("small-action") || !!tp.querySelector(".small-action");
          if (!isSmallAction) continue;
          const postNumberStr = tp.getAttribute("data-post-number");
          const n = postNumberStr ? parseInt(postNumberStr, 10) : NaN;
          if (Number.isFinite(n)) nums.push(n);
        }
        nums.sort((a, b) => a - b);
        smallActionPostNumbers = nums;
      }
      const countSmallActionsBefore = (postNumber) => {
        let count = 0;
        for (const n of smallActionPostNumbers) {
          if (n < postNumber) count++;
          else break;
        }
        return count;
      };
      for (const post of posts) {
        const postWrapper = post.closest(".topic-post");
        const isSmallActionWrapper = !!(postWrapper && (postWrapper.classList.contains("small-action") || !!postWrapper.querySelector(".small-action")));
        if (isSmallActionWrapper) {
          const existing = post.querySelector(".floor-number");
          if (existing) existing.remove();
          continue;
        }
        const postNumberStr = postWrapper?.getAttribute("data-post-number");
        let postNumber = postNumberStr ? parseInt(postNumberStr, 10) : NaN;
        if (!Number.isFinite(postNumber)) {
          const idPart = (post.id || "").split("_")[1];
          postNumber = idPart ? parseInt(idPart, 10) : NaN;
        }
        if (!Number.isFinite(postNumber)) continue;
        const adjustedFloor = postNumber - countSmallActionsBefore(postNumber);
        const meta = post.querySelector(".topic-meta-data");
        if (!meta) continue;
        let floorNumber = post.querySelector(".floor-number");
        if (!floorNumber) {
          floorNumber = document.createElement("div");
          floorNumber.className = "floor-number";
          floorNumber.style.cssText = "color: grey; margin-left: 10px;";
          meta.appendChild(floorNumber);
        }
        floorNumber.textContent = "\u697C\u5C42: " + adjustedFloor;
        floorNumber.title = "\u539F\u59CB\u697C\u5C42: " + postNumber;
      }
    },
    initMutationObserver() {
      if (this._floorMutationObserver) {
        try {
          this._floorMutationObserver.disconnect();
        } catch (_) {
        }
      }
      this._floorObserverRunning = false;
      this._floorObserverScheduled = false;
      const scheduleUpdate = () => {
        if (this._floorObserverRunning || this._floorObserverScheduled) return;
        this._floorObserverScheduled = true;
        setTimeout(() => {
          this._floorObserverScheduled = false;
          this._floorObserverRunning = true;
          try {
            this.addFloorNumbers();
            this.toggleCleanMode();
          } catch (e) {
            console.error("[\u697C\u5C42\u53F7] \u66F4\u65B0\u5931\u8D25:", e);
          } finally {
            this._floorObserverRunning = false;
          }
        }, 80);
      };
      this._floorMutationObserver = new MutationObserver(() => {
        scheduleUpdate();
      });
      this._floorMutationObserver.observe(document.body, { childList: true, subtree: true });
      scheduleUpdate();
    }
  };

  // src/controller/mixins/modes.js
  var methods6 = {
    toggleCleanMode() {
      const sidebarToggle = document.querySelector("button.btn-sidebar-toggle");
      if (sidebarToggle && this.cleanModeEnabled) {
        if (sidebarToggle.getAttribute("aria-expanded") === "true") {
          console.log("\u6E05\u723D\u6A21\u5F0F\u542F\u7528\uFF0C\u6536\u8D77\u8FB9\u680F");
          sidebarToggle.click();
        }
      }
      this.applyCleanModeStyles();
    },
    applyCleanModeStyles() {
      let styleElement = document.getElementById("clean-mode-styles");
      if (styleElement) {
        styleElement.remove();
      }
      if (this.cleanModeEnabled) {
        styleElement = document.createElement("style");
        styleElement.id = "clean-mode-styles";
        styleElement.textContent = `
                p:contains("\u5E0C\u671B\u4F60\u559C\u6B22\u8FD9\u91CC\u3002\u6709\u95EE\u9898\uFF0C\u8BF7\u63D0\u95EE\uFF0C\u6216\u641C\u7D22\u73B0\u6709\u5E16\u5B50\u3002") {
                    display: none !important;
                }
                div#global-notice-alert-global-notice.alert.alert-info.alert-global-notice {
                    display: none !important;
                }
                a[href="https://linux.do/t/topic/482293"] {
                    display: none !important;
                }
                div.link-bottom-line a.badge-category__wrapper {
                    display: none !important;
                }
                td.posters.topic-list-data {
                    display: none !important;
                }
                a.discourse-tag.box[href^="/tag/"] {
                    display: none !important;
                }
            `;
        document.head.appendChild(styleElement);
      }
    },
    toggleGrayscaleMode() {
      this.applyGrayscaleModeStyles();
    },
    applyGrayscaleModeStyles() {
      let styleElement = document.getElementById("grayscale-mode-styles");
      if (styleElement) {
        styleElement.remove();
      }
      if (this.grayscaleModeEnabled) {
        const isAndroid = /Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isMobile = isAndroid || isIOS;
        const isLowEnd = navigator.hardwareConcurrency <= 4 || navigator.deviceMemory <= 4;
        styleElement = document.createElement("style");
        styleElement.id = "grayscale-mode-styles";
        styleElement.textContent = `
                @media (prefers-color-scheme: light) {
                    #main-outlet, .d-header, .menu-panel, main {
                        filter: grayscale(100%) contrast(108%) brightness(97%) !important;
                        -webkit-filter: grayscale(100%) contrast(108%) brightness(97%) !important;
                    }
                    #main-outlet *, .d-header *, .menu-panel *, main * {
                        text-shadow: 0 0 0.3px rgba(0, 0, 0, 0.4) !important;
                    }
                }
                @media (prefers-color-scheme: dark) {
                    #main-outlet, .d-header, .menu-panel, main {
                        filter: grayscale(100%) contrast(110%) brightness(103%) !important;
                        -webkit-filter: grayscale(100%) contrast(110%) brightness(103%) !important;
                    }
                    #main-outlet *, .d-header *, .menu-panel *, main * {
                        text-shadow: 0 0 0.3px rgba(255, 255, 255, 0.5) !important;
                    }
                }
                @media (prefers-color-scheme: no-preference) {
                    #main-outlet, .d-header, .menu-panel, main {
                        filter: grayscale(100%) contrast(109%) brightness(99%) !important;
                        -webkit-filter: grayscale(100%) contrast(109%) brightness(99%) !important;
                    }
                }
                img, svg, canvas, video {
                    filter: grayscale(100%) contrast(110%) !important;
                    -webkit-filter: grayscale(100%) contrast(110%) !important;
                }
                ${isMobile ? `
                html {
                    -webkit-font-smoothing: antialiased !important;
                    -moz-osx-font-smoothing: grayscale !important;
                    text-rendering: optimizeLegibility !important;
                }
                * {
                    -webkit-overflow-scrolling: touch !important;
                }
                ` : ""}
                ${isIOS ? `
                body {
                    -webkit-transform: translateZ(0) !important;
                }
                ` : ""}
                ${isLowEnd ? `
                *, *::before, *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
                ` : ""}
            `;
        document.head.appendChild(styleElement);
        setTimeout(() => {
          if (document.documentElement) {
            const currentWillChange = document.documentElement.style.willChange;
            if (currentWillChange === "filter") {
              document.documentElement.style.willChange = "auto";
            }
          }
        }, 1e3);
        const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
        const theme = isDark ? "\u6DF1\u8272" : isLight ? "\u6D45\u8272" : "\u672A\u77E5";
        console.log("\u{1F3A8} \u9ED1\u767D\u7070\u6A21\u5F0F\u5DF2\u542F\u7528");
        console.log(`\u{1F4F1} \u8BBE\u5907\u7C7B\u578B: ${isMobile ? isIOS ? "iOS" : "Android" : "\u684C\u9762"}`);
        console.log(`\u{1F527} \u4F18\u5316\u6A21\u5F0F: ${isLowEnd ? "\u4F4E\u7AEF\u8BBE\u5907" : "\u6807\u51C6"}`);
        console.log(`\u{1F313} \u68C0\u6D4B\u4E3B\u9898: ${theme}\u6A21\u5F0F`);
        console.log(`\u2728 \u6D45\u8272\u80CC\u666F: \u5BF9\u6BD4108% + \u4EAE\u5EA697%`);
        console.log(`\u2728 \u6DF1\u8272\u80CC\u666F: \u5BF9\u6BD4110% + \u4EAE\u5EA6103%`);
        console.log(`\u{1F5BC}\uFE0F  \u56FE\u7247\u5BF9\u6BD4\u5EA6: 110%`);
      } else {
        console.log("\u{1F3A8} \u9ED1\u767D\u7070\u6A21\u5F0F\u5DF2\u5173\u95ED");
      }
    }
  };

  // src/controller/mixins/ranking.js
  var methods7 = {
    async loadRankingData(isManualRefresh = false) {
      if (!this.rankDataContainer) return;
      if (!isManualRefresh && !this.shouldRefreshRankInfo()) return;
      if (isManualRefresh) {
        const refreshBtn = this.rankDataContainer.querySelector(".rank-refresh-btn");
        if (refreshBtn) {
          refreshBtn.textContent = this.t("refreshing");
          refreshBtn.disabled = true;
        }
      } else {
        this.rankDataContainer.innerHTML = `<div class="trust-level-loading">${this.t("loadingRank")}</div>`;
      }
      try {
        const periods = [
          { key: "daily", name: this.t("dailyRank"), icon: "\u{1F4C5}" },
          { key: "weekly", name: this.t("weeklyRank"), icon: "\u{1F4C6}" },
          { key: "monthly", name: this.t("monthlyRank"), icon: "\u{1F5D3}\uFE0F" },
          { key: "quarterly", name: this.t("quarterlyRank"), icon: "\u{1F4CA}" },
          { key: "yearly", name: this.t("yearlyRank"), icon: "\u{1F4C8}" },
          { key: "all", name: this.t("allTimeRank"), icon: "\u{1F3C5}" }
        ];
        const rankPromises = periods.map((period) => this.fetchRankingByPeriod(period.key));
        const rankResults = await Promise.all(rankPromises);
        this.renderRankingData(periods, rankResults);
      } catch (error) {
        console.error("\u52A0\u8F7D\u6392\u540D\u6570\u636E\u5931\u8D25:", error);
        this.rankDataContainer.innerHTML = `
                <div class="trust-level-header">
                    <span>${this.t("sectionRanking").replace(/^\s*🏆\s*/, "")}</span>
                    <button class="trust-level-refresh rank-refresh-btn">${this.t("refresh")}</button>
                </div>
                <div class="trust-level-loading">${this.t("loadFailed")}</div>
            `;
        this.bindRankRefreshBtn();
      }
    },
    fetchRankingByPeriod(period) {
      return new Promise((resolve) => {
        fetch(`${BASE_URL}/leaderboard/1?period=${period}`, {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        }).then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("\u8BF7\u6C42\u5931\u8D25");
        }).then((data) => {
          if (data && data.personal && data.personal.user) {
            resolve({
              score: data.personal.user.total_score || 0,
              position: data.personal.position || data.personal.user.position || 0
            });
          } else {
            resolve({ score: 0, position: "-" });
          }
        }).catch((error) => {
          console.error(`\u83B7\u53D6${period}\u6392\u540D\u5931\u8D25:`, error);
          resolve({ score: 0, position: "-" });
        });
      });
    },
    renderRankingData(periods, results) {
      const updateTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      let html = `
            <div class="trust-level-header">
                <span>${this.t("myRanking")}</span>
                <button class="trust-level-refresh rank-refresh-btn">${this.t("refresh")}</button>
            </div>
        `;
      periods.forEach((period, index) => {
        const result = results[index];
        const positionText = result.position === "-" ? "-" : `#${result.position}`;
        const scoreText = result.score || 0;
        html += `
                <div class="rank-item">
                    <span class="rank-period">
                        <span>${period.icon}</span>
                        <span class="rank-period-label">${period.name}</span>
                    </span>
                    <span class="rank-values">
                        <span class="rank-score">${scoreText}${this.t("points")}</span>
                        <span class="rank-position">${positionText}</span>
                    </span>
                </div>
            `;
      });
      html += `
            <div class="rank-footer">
                <a href="${BASE_URL}/leaderboard" target="_blank" class="rank-detail-link">${this.t("detailInfo")}</a>
                <span class="rank-update-time">${this.t("update")}: ${this.escapeHtml(updateTime)}</span>
            </div>
        `;
      this.rankDataContainer.innerHTML = html;
      this.bindRankRefreshBtn();
    },
    bindRankRefreshBtn() {
      setTimeout(() => {
        const refreshBtn = this.rankDataContainer?.querySelector(".rank-refresh-btn");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.loadRankingData(true);
          });
        }
      }, 100);
    }
  };

  // src/controller/mixins/rateLimit.js
  var methods8 = {
    checkLikeResumeTime() {
      this.likeResumeTime = LikeCooldown.read(this.smartLikeAccountKey);
      if (!Number.isFinite(this.likeResumeTime)) {
        console.warn("[\u70B9\u8D5E\u51B7\u5374] \u72B6\u6001\u6682\u4E0D\u53EF\u7528\uFF0C\u667A\u80FD\u70B9\u8D5E\u4FDD\u6301\u6682\u505C");
        return;
      }
      if (this.likeResumeTime > Date.now()) {
        console.log(`[\u70B9\u8D5E\u51B7\u5374] \u5C06\u4E8E ${new Date(this.likeResumeTime).toLocaleString()} \u7ED3\u675F\uFF0C\u7ED3\u675F\u540E\u9700\u624B\u52A8\u5F00\u542F\u667A\u80FD\u70B9\u8D5E`);
      }
    },
    detectIpRateLimit() {
      const isNormalPage = document.querySelector("#main-outlet") || document.querySelector(".topic-list") || document.querySelector(".topic-post") || document.querySelector(".d-header") || document.querySelector(".ember-application") || document.querySelector("[data-discourse-helper]");
      if (isNormalPage) {
        if (this.ipRateLimitResumeTime) {
          console.log("[IP\u9650\u6D41] \u68C0\u6D4B\u5230\u6B63\u5E38\u9875\u9762\uFF0C\u6E05\u9664\u4E4B\u524D\u7684\u9650\u6D41\u72B6\u6001");
          this.ipRateLimitResumeTime = null;
          Storage.set("ipRateLimitResumeTime", null);
          this.stopIpRateLimitRecoveryCheck();
        }
        return false;
      }
      const pageText = document.body?.innerText || "";
      const rateLimitIndicators = [
        "You are being rate limited",
        "We have banned you temporarily",
        "Too Many Requests",
        "Error 429",
        "HTTP 429"
      ];
      const isRateLimited = rateLimitIndicators.some(
        (indicator) => pageText.includes(indicator)
      );
      const pageTitle = document.title || "";
      const titleRateLimited = pageTitle.includes("Rate Limited") || pageTitle.includes("429") || pageTitle.includes("Banned");
      const isShortPage = pageText.length < 2e3;
      if ((isRateLimited || titleRateLimited) && isShortPage) {
        console.warn("\u{1F6AB} [IP\u9650\u6D41] \u68C0\u6D4B\u5230 IP \u88AB\u9650\u6D41\uFF01");
        this.handleIpRateLimit();
        return true;
      }
      return false;
    },
    handleIpRateLimit() {
      if (this.ipRateLimitResumeTime && Date.now() < this.ipRateLimitResumeTime) {
        console.log("[IP\u9650\u6D41] \u5DF2\u5728\u7B49\u5F85\u6062\u590D\u4E2D\uFF0C\u8DF3\u8FC7");
        return;
      }
      const waitTime = 30 * 60 * 1e3;
      this.ipRateLimitResumeTime = Date.now() + waitTime;
      Storage.set("ipRateLimitResumeTime", this.ipRateLimitResumeTime);
      if (this.autoRunning) {
        console.log("[IP\u9650\u6D41] \u505C\u6B62\u81EA\u52A8\u9605\u8BFB...");
        this.stopScrolling();
        this.stopNavigationGuard();
        this.autoRunning = false;
        this.setSessionStorage("autoRunning", false);
        if (this.button) {
          this.button.innerHTML = `<span class="btn-icon">\u25B6</span><span class="btn-text">${this.t("startReading")}</span>`;
          this.button.classList.remove("running");
        }
        if (this.navigationTimeout) {
          clearTimeout(this.navigationTimeout);
          this.navigationTimeout = null;
        }
      }
      const resumeTime = new Date(this.ipRateLimitResumeTime);
      this.showNotification(`${this.t("ipRateLimited")}
${this.t("ipRateLimitWait")} (${resumeTime.toLocaleTimeString()})`);
      console.log(`[IP\u9650\u6D41] \u81EA\u52A8\u9605\u8BFB\u5DF2\u6682\u505C\uFF0C\u5C06\u5728 ${resumeTime.toLocaleString()} \u540E\u81EA\u52A8\u6062\u590D`);
      this.startIpRateLimitRecoveryCheck();
    },
    checkIpRateLimitStatus() {
      if (this.ipRateLimitResumeTime) {
        const now = Date.now();
        const isNormalPage = document.querySelector("#main-outlet") || document.querySelector(".topic-list") || document.querySelector(".topic-post") || document.querySelector(".d-header") || document.querySelector(".ember-application");
        if (isNormalPage) {
          console.log("[IP\u9650\u6D41] \u5F53\u524D\u662F\u6B63\u5E38\u9875\u9762\uFF0C\u6E05\u9664\u4E4B\u524D\u7684\u9650\u6D41\u72B6\u6001\uFF08\u53EF\u80FD\u662F\u8BEF\u5224\uFF09");
          this.ipRateLimitResumeTime = null;
          Storage.set("ipRateLimitResumeTime", null);
          return;
        }
        if (now >= this.ipRateLimitResumeTime) {
          console.log("[IP\u9650\u6D41] \u9650\u6D41\u65F6\u95F4\u5DF2\u8FC7\uFF0C\u6E05\u9664\u72B6\u6001");
          this.ipRateLimitResumeTime = null;
          Storage.set("ipRateLimitResumeTime", null);
        } else {
          const remainingMinutes = Math.ceil((this.ipRateLimitResumeTime - now) / (1e3 * 60));
          const resumeTime = new Date(this.ipRateLimitResumeTime);
          console.log(`[IP\u9650\u6D41] IP \u9650\u6D41\u4E2D\uFF0C\u8FD8\u9700\u7EA6 ${remainingMinutes} \u5206\u949F\uFF0C\u5C06\u5728 ${resumeTime.toLocaleString()} \u540E\u6062\u590D`);
          if (this.autoRunning) {
            console.log("[IP\u9650\u6D41] \u68C0\u6D4B\u5230\u81EA\u52A8\u9605\u8BFB\u8FD0\u884C\u4E2D\uFF0C\u5F3A\u5236\u505C\u6B62");
            this.autoRunning = false;
            this.setSessionStorage("autoRunning", false);
          }
          this.startIpRateLimitRecoveryCheck();
        }
      }
    },
    startIpRateLimitRecoveryCheck() {
      if (this.ipRateLimitCheckInterval) {
        clearInterval(this.ipRateLimitCheckInterval);
      }
      this.ipRateLimitCheckInterval = setInterval(() => {
        if (!this.ipRateLimitResumeTime) {
          clearInterval(this.ipRateLimitCheckInterval);
          this.ipRateLimitCheckInterval = null;
          return;
        }
        const now = Date.now();
        if (now >= this.ipRateLimitResumeTime) {
          console.log("[IP\u9650\u6D41] \u9650\u6D41\u65F6\u95F4\u5230\uFF0C\u5C1D\u8BD5\u6062\u590D...");
          this.tryResumeAfterIpRateLimit();
        } else {
          const remainingMinutes = Math.ceil((this.ipRateLimitResumeTime - now) / (1e3 * 60));
          console.log(`[IP\u9650\u6D41] \u7B49\u5F85\u6062\u590D\u4E2D\uFF0C\u8FD8\u9700 ${remainingMinutes} \u5206\u949F`);
        }
      }, 6e4);
      console.log("[IP\u9650\u6D41] \u6062\u590D\u68C0\u6D4B\u5B9A\u65F6\u5668\u5DF2\u542F\u52A8");
    },
    tryResumeAfterIpRateLimit() {
      this.ipRateLimitResumeTime = null;
      Storage.set("ipRateLimitResumeTime", null);
      if (this.ipRateLimitCheckInterval) {
        clearInterval(this.ipRateLimitCheckInterval);
        this.ipRateLimitCheckInterval = null;
      }
      this.showNotification(this.t("ipRateLimitResume"));
      console.log("[IP\u9650\u6D41] IP \u9650\u6D41\u5DF2\u89E3\u9664\uFF0C\u53EF\u4EE5\u6062\u590D\u81EA\u52A8\u9605\u8BFB");
      window.location.href = `${BASE_URL}/latest`;
    },
    stopIpRateLimitRecoveryCheck() {
      if (this.ipRateLimitCheckInterval) {
        clearInterval(this.ipRateLimitCheckInterval);
        this.ipRateLimitCheckInterval = null;
        console.log("[IP\u9650\u6D41] \u6062\u590D\u68C0\u6D4B\u5B9A\u65F6\u5668\u5DF2\u505C\u6B62");
      }
    },
    observeLikeLimit() {
      this._likeLimitHandledByAPI = false;
      this._lastLikeLimitTime = 0;
      this._likeLimitPopupLastTime = 0;
      this._likeLimitPopupTimeout = null;
      this.interceptFetchForLikeLimit();
      const self = this;
      const observer = new MutationObserver((mutations) => {
        const now = Date.now();
        if (now - self._likeLimitPopupLastTime < 500) {
          return;
        }
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === 1) {
              const isModalElement = node.classList.contains("modal") || node.classList.contains("d-modal") || node.classList.contains("bootbox") || node.classList.contains("dialog-body") || node.classList.contains("popup-menu") || node.closest?.(".modal, .d-modal, .bootbox, .dialog-container, .fk-d-modal") || node.querySelector?.(".modal, .d-modal, .bootbox, .dialog-body, .fk-d-modal__inner");
              if (!isModalElement) {
                continue;
              }
              const text = node.textContent || "";
              const isLikeLimit = (text.includes("\u70B9\u8D5E\u4E0A\u9650") || text.includes("\u5206\u4EAB\u5F88\u591A\u7231") || text.includes("\u70B9\u8D5E") && /(?:小时|分钟)后再次点赞/.test(text)) && !text.includes("\u56DE\u590D") && !text.includes("\u521B\u5EFA\u66F4\u591A\u65B0\u56DE\u590D");
              if (isLikeLimit) {
                self._likeLimitPopupLastTime = now;
                if (self._likeLimitPopupTimeout) {
                  clearTimeout(self._likeLimitPopupTimeout);
                }
                self._likeLimitPopupTimeout = setTimeout(() => {
                  const currentTime = Date.now();
                  if (self._likeLimitHandledByAPI && currentTime - self._lastLikeLimitTime < 2e3) {
                    console.log("[\u70B9\u8D5E\u9650\u5236] XHR \u5DF2\u5904\u7406\uFF0CDOM \u76D1\u542C\u5668\u4EC5\u5173\u95ED\u5F39\u7A97");
                  } else {
                    console.log("[\u70B9\u8D5E\u9650\u5236] XHR \u672A\u5904\u7406\uFF0C\u4F7F\u7528 DOM \u89E3\u6790\u4F5C\u4E3A\u5907\u7528");
                    self.handleLikeLimit(text);
                  }
                  self.closeLikeLimitPopup();
                }, 300);
                return;
              }
            }
          }
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    },
    interceptFetchForLikeLimit() {
      if (this._likeLimitInterceptorsInstalled) return;
      this._likeLimitInterceptorsInstalled = true;
      const self = this;
      const captureRequest = (url, method) => {
        if (!isHeartToggleUrl(url, method)) return null;
        self._likeLimitHandledByAPI = false;
        self._lastLikeLimitTime = 0;
        const context = {
          url,
          method,
          accountKey: self.smartLikeAccountKey || self.likeCounter?.accountKey || null,
          startedAt: Date.now()
        };
        self._lastHeartRequestContext = context;
        return context;
      };
      const handleResponse = (context, status, data, retryAfter) => {
        if (status >= 200 && status < 300) return;
        if (status !== 429 && data?.error_type !== "rate_limit") return;
        context.retryAfter = retryAfter;
        context.rateLimited = true;
        self.handleSmartLike429(data?.extras?.wait_seconds, data?.extras?.time_left, context.url, context.method, {
          accountKey: context.accountKey,
          retryAfter,
          responseAt: context.responseAt
        });
      };
      this._likeLimitInterceptorUnsubscribe?.();
      this._likeLimitInterceptorUnsubscribe = networkInterceptor.register({
        beforeRequest(request) {
          return captureRequest(request.url, request.method);
        },
        async afterResponse({ request, response, context }) {
          if (!context) return;
          context.responseAt = Date.now();
          let data = null;
          if (request.transport === "fetch") {
            try {
              data = await response.clone().json();
            } catch (_) {
            }
          } else {
            try {
              data = response.responseType === "json" ? response.response : JSON.parse(response.responseText);
            } catch (_) {
            }
          }
          const retryAfter = request.transport === "fetch" ? response.headers?.get?.("Retry-After") : response.getResponseHeader?.("Retry-After");
          handleResponse(context, response.status, data, retryAfter);
        }
      });
      console.log("[\u70B9\u8D5E\u9650\u5236] \u5DF2\u542F\u7528\u5171\u4EAB\u7F51\u7EDC\u62E6\u622A\u5668");
    },
    handleSmartLike429(waitSeconds, timeLeft, sourceUrl, sourceMethod = "PUT", options = {}) {
      if (!isHeartToggleUrl(sourceUrl, sourceMethod)) return false;
      const now = Date.now();
      const accountKey = Object.prototype.hasOwnProperty.call(options, "accountKey") ? options.accountKey : this.smartLikeAccountKey;
      const seconds = Number(waitSeconds);
      let nextResumeTime = Number.isFinite(seconds) && seconds > 0 ? now + seconds * 1e3 : 0;
      let dialogDisplayTime = "";
      if (!nextResumeTime && options.fromDialog) {
        const text = String(timeLeft || "");
        let waitMinutes = 0;
        let parsed = false;
        const minuteMatch = text.match(/(?:在|可以在)\s*(\d+)\s*分钟后/);
        if (minuteMatch) {
          waitMinutes = parseInt(minuteMatch[1], 10);
          parsed = true;
        } else {
          const hourMatch = text.match(/(?:在|可以在)\s*(\d+)\s*小时后/);
          if (hourMatch) {
            waitMinutes = parseInt(hourMatch[1], 10) * 60;
            parsed = true;
          } else {
            const allMinuteMatches = text.match(/(\d+)\s*分钟/g);
            const allHourMatches = text.match(/(\d+)\s*小时/g);
            if (allMinuteMatches?.length) {
              const match = allMinuteMatches[allMinuteMatches.length - 1].match(/(\d+)/);
              if (match) {
                waitMinutes = parseInt(match[1], 10);
                parsed = true;
              }
            } else if (allHourMatches?.length) {
              const match = allHourMatches[allHourMatches.length - 1].match(/(\d+)/);
              if (match) {
                waitMinutes = parseInt(match[1], 10) * 60;
                parsed = true;
              }
            }
          }
        }
        if (!parsed) {
          waitMinutes = 10 * 60;
          console.log(`[\u70B9\u8D5E\u9650\u5236] \u672A\u80FD\u63D0\u53D6\u7B49\u5F85\u65F6\u95F4\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u503C: 10 \u5C0F\u65F6 = ${waitMinutes} \u5206\u949F`);
        }
        nextResumeTime = now + waitMinutes * 60 * 1e3;
        dialogDisplayTime = waitMinutes >= 60 ? `${Math.floor(waitMinutes / 60)}${this.t("hours")}${waitMinutes % 60 > 0 ? waitMinutes % 60 + this.t("minutes") : ""}`.trim() : `${waitMinutes}${this.t("minutes")}`;
      }
      if (!nextResumeTime) return false;
      nextResumeTime = Math.max(now + 1e3, nextResumeTime);
      const storedUntil = LikeCooldown.read(accountKey);
      this.smartLike429Periods || (this.smartLike429Periods = /* @__PURE__ */ new Map());
      const periodKey = accountKey || "legacy";
      const previous = this.smartLike429Periods.get(periodKey);
      const alreadyCleaned = !!(previous?.cleaned && previous.until > now && storedUntil > now);
      const resumeTime = LikeCooldown.extend(accountKey, nextResumeTime);
      const period = { until: resumeTime, cleaned: alreadyCleaned };
      this.smartLike429Periods.set(periodKey, period);
      if (accountKey !== this.smartLikeAccountKey) return resumeTime;
      this.likeResumeTime = resumeTime;
      if (!options.fromDialog) {
        this._likeLimitHandledByAPI = true;
        this._lastLikeLimitTime = now;
      }
      if (alreadyCleaned) {
        if (accountKey && this.likeCounter?.accountKey === accountKey) this.likeCounter.notifyUIUpdate();
        return resumeTime;
      }
      period.cleaned = true;
      this.smartLikeEnabled = false;
      Storage.set("smartLikeEnabled", false);
      if (this.smartLikeActiveTask) this.smartLikeActiveTask.pendingReleased = true;
      this.cancelSmartLikeTasks("rate_limited");
      this.persistSmartLikeSession();
      this.updateSmartLikeUI();
      if (accountKey && this.likeCounter?.accountKey === accountKey) this.likeCounter.notifyUIUpdate();
      if (this.stopOnLikeLimitEnabled && this.autoRunning) this.stopAutoReading();
      if (Number.isFinite(resumeTime)) {
        const display = options.fromDialog && dialogDisplayTime ? dialogDisplayTime : timeLeft || `${Math.ceil((resumeTime - now) / 6e4)}${this.t("minutes")}`;
        this.showNotification(`${this.t("likeLimitReached")}${display}`);
        console.warn(`[\u70B9\u8D5E\u9650\u5236] \u5DF2\u8FDB\u5165\u51B7\u5374\uFF0C\u81F3 ${new Date(resumeTime).toLocaleString()}`);
      } else {
        this.showNotification("\u70B9\u8D5E\u72B6\u6001\u6682\u4E0D\u53EF\u7528\uFF0C\u667A\u80FD\u70B9\u8D5E\u5DF2\u5173\u95ED");
      }
      return resumeTime;
    },
    handleLikeLimit(text) {
      const context = this._lastHeartRequestContext;
      if (!context?.accountKey || context.accountKey !== this.smartLikeAccountKey || !isHeartToggleUrl(context.url, context.method) || Date.now() - (context.responseAt || context.startedAt) > 3e3) return false;
      if (!/(点赞上限|分享很多爱|点赞.*(?:分钟|小时).*点赞)/.test(String(text || ""))) return false;
      return this.handleSmartLike429(null, text, context.url, context.method, {
        accountKey: context.accountKey,
        retryAfter: context.retryAfter,
        responseAt: context.responseAt,
        fromDialog: true
      });
    },
    closeLikeLimitPopup() {
      console.log("[\u70B9\u8D5E\u9650\u5236] \u5C1D\u8BD5\u5173\u95ED\u5F39\u7A97...");
      const buttonSelectors = [
        ".dialog-footer .btn-primary",
        ".modal-footer .btn-primary",
        ".d-modal__footer .btn-primary",
        ".bootbox .btn-primary",
        "button.btn-primary",
        "button.btn-default",
        ".modal-close",
        ".close-modal",
        ".d-modal__dismiss",
        'button[aria-label="\u5173\u95ED"]',
        'button[aria-label="Close"]',
        ".dialog-close",
        ".d-modal__dismiss-icon",
        ".modal-header .close"
      ];
      for (const selector of buttonSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          if (element.offsetParent === null) continue;
          const text = (element.textContent || "").trim();
          if (selector.includes("btn-primary") || text.includes("\u786E\u5B9A") || text.includes("OK") || text.includes("\u5173\u95ED") || text.includes("\u597D") || element.classList.contains("modal-close") || element.classList.contains("close-modal") || element.classList.contains("d-modal__dismiss")) {
            console.log(`[\u70B9\u8D5E\u9650\u5236] \u627E\u5230\u5173\u95ED\u6309\u94AE: ${selector}, \u6587\u672C: "${text}"`);
            try {
              element.click();
              console.log("[\u70B9\u8D5E\u9650\u5236] \u5DF2\u70B9\u51FB\u5173\u95ED\u6309\u94AE");
              return;
            } catch (e) {
              console.error("[\u70B9\u8D5E\u9650\u5236] \u70B9\u51FB\u6309\u94AE\u5931\u8D25:", e);
            }
          }
        }
      }
      const modalSelectors = [".modal", ".d-modal", ".bootbox", ".dialog-body", '[role="dialog"]'];
      for (const modalSelector of modalSelectors) {
        const modal = document.querySelector(modalSelector);
        if (modal && modal.offsetParent !== null) {
          const buttons = modal.querySelectorAll("button");
          for (const btn of buttons) {
            const text = (btn.textContent || "").trim();
            if (text.includes("\u786E\u5B9A") || text.includes("OK") || text.includes("\u5173\u95ED") || text.includes("\u597D") || btn.classList.contains("btn-primary")) {
              console.log(`[\u70B9\u8D5E\u9650\u5236] \u5728\u5F39\u7A97\u5185\u627E\u5230\u6309\u94AE: "${text}"`);
              try {
                btn.click();
                console.log("[\u70B9\u8D5E\u9650\u5236] \u5DF2\u70B9\u51FB\u5F39\u7A97\u5185\u6309\u94AE");
                return;
              } catch (e) {
                console.error("[\u70B9\u8D5E\u9650\u5236] \u70B9\u51FB\u5F39\u7A97\u5185\u6309\u94AE\u5931\u8D25:", e);
              }
            }
          }
        }
      }
      console.log("[\u70B9\u8D5E\u9650\u5236] \u672A\u627E\u5230\u5173\u95ED\u6309\u94AE\uFF0C\u5C1D\u8BD5\u6309 Escape \u952E");
      document.dispatchEvent(new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true
      }));
      setTimeout(() => {
        const visibleButtons = document.querySelectorAll(".dialog-footer button, .modal-footer button");
        for (const btn of visibleButtons) {
          if (btn.offsetParent !== null) {
            console.log(`[\u70B9\u8D5E\u9650\u5236] \u5EF6\u8FDF\u540E\u627E\u5230\u6309\u94AE: "${btn.textContent}"`);
            btn.click();
            return;
          }
        }
      }, 500);
    }
  };

  // src/controller/mixins/notifications.js
  var methods9 = {
    flushPendingNotifications() {
      if (!this.topicStatusNotification || !this.pendingNotifications?.length) return;
      const latestMessage = this.pendingNotifications[this.pendingNotifications.length - 1];
      this.pendingNotifications = [];
      if (latestMessage) this.showNotification(latestMessage);
    },
    hasTopicStatusNotification() {
      return !!(this.topicStatusNotification && this.topicStatusNotification.style.display !== "none" && this.topicStatusNotification.textContent);
    },
    revealTopicStatus() {
      if (!this.container || this.container.classList.contains("collapsed")) return;
      if (!this.autoSection || !this.autoSectionContent) return;
      if (this.autoSection.getAttribute("aria-expanded") !== "true") {
        this.setSectionExpanded?.(this.autoSection, this.autoSectionContent, true);
      }
    },
    hideTopicStatusIfIdle() {
      if (!this.topicStatusContainer || this.isScrolling || this.hasTopicStatusNotification()) return;
      if (this.topicStatusMode === "fetching" || this.topicStatusMode === "reading") return;
      if (this.topicStatusMode === "ready") {
        if (this.topicStatusHideTimer) return;
        this.topicStatusHideTimer = setTimeout(() => {
          this.topicStatusHideTimer = null;
          if (!this.isScrolling && this.topicStatusContainer && !this.hasTopicStatusNotification()) {
            this.topicStatusContainer.style.display = "none";
          }
        }, 3e3);
        return;
      }
      if (this.topicStatusHideTimer) return;
      this.topicStatusContainer.style.display = "none";
    },
    showNotification(message) {
      const text = String(message ?? "").trim();
      if (!text) return;
      if (!this.topicStatusContainer || !this.topicStatusNotification) {
        this.pendingNotifications = [text];
        return;
      }
      if (this.topicStatusNotificationTimer) {
        clearTimeout(this.topicStatusNotificationTimer);
        this.topicStatusNotificationTimer = null;
      }
      if (this.topicStatusHideTimer) {
        clearTimeout(this.topicStatusHideTimer);
        this.topicStatusHideTimer = null;
      }
      this.topicStatusNotification.textContent = text;
      this.topicStatusNotification.style.display = "block";
      this.topicStatusContainer.style.display = "block";
      this.revealTopicStatus();
      const notification = this.topicStatusNotification;
      this.topicStatusNotificationTimer = setTimeout(() => {
        if (notification !== this.topicStatusNotification) return;
        notification.textContent = "";
        notification.style.display = "none";
        this.topicStatusNotificationTimer = null;
        this.hideTopicStatusIfIdle();
      }, 3e3);
    }
  };

  // src/controller/mixins/cloudflare.js
  var methods10 = {
    isChallengePage() {
      return window.location.pathname.startsWith(this.CF_BYPASS_CONFIG.CHALLENGE_PATH);
    },
    isNotFoundPage() {
      return Boolean(document.querySelector(".page-not-found"));
    },
    getRedirectParamUrl() {
      try {
        const raw = new URLSearchParams(window.location.search).get("redirect");
        if (!raw) return void 0;
        const url = new URL(raw, window.location.origin);
        if (url.origin !== window.location.origin) return void 0;
        return url.href;
      } catch (_) {
        return void 0;
      }
    },
    getNotFoundRedirectGuardTs() {
      try {
        const raw = sessionStorage.getItem(this.CF_BYPASS_CONFIG.NOT_FOUND_REDIRECT_GUARD_KEY);
        const timestamp = raw ? Number(raw) : 0;
        return Number.isFinite(timestamp) ? timestamp : 0;
      } catch (_) {
        return 0;
      }
    },
    setNotFoundRedirectGuardTs(timestamp) {
      try {
        sessionStorage.setItem(this.CF_BYPASS_CONFIG.NOT_FOUND_REDIRECT_GUARD_KEY, String(timestamp));
      } catch (_) {
      }
    },
    scheduleCFRedirect(url, replace, message) {
      if (this.cfBypassRedirecting) return false;
      this.cfBypassRedirecting = true;
      const navigate = () => {
        this.cfBypassRedirectTimer = null;
        try {
          if (replace) {
            window.location.replace(url);
          } else {
            window.location.href = url;
          }
        } catch (error) {
          this.cfBypassRedirecting = false;
          console.warn("[CF Challenge] \u91CD\u5B9A\u5411\u5931\u8D25:", error);
        }
      };
      try {
        this.cfBypassRedirectTimer = setTimeout(navigate, this.CF_BYPASS_CONFIG.REDIRECT_DELAY_MS);
      } catch (error) {
        this.cfBypassRedirecting = false;
        console.warn("[CF Challenge] \u5B89\u6392\u91CD\u5B9A\u5411\u5931\u8D25:", error);
        return false;
      }
      try {
        if (message) this.showNotification(message);
      } catch (error) {
        console.warn("[CF Challenge] \u663E\u793A\u901A\u77E5\u5931\u8D25:", error);
      }
      return true;
    },
    redirectFromNotFoundPage() {
      const fallback = `${window.location.origin}/`;
      const target = this.getRedirectParamUrl() || fallback;
      const now = Date.now();
      const guardTimestamp = this.getNotFoundRedirectGuardTs();
      if (guardTimestamp && now - guardTimestamp < this.CF_BYPASS_CONFIG.NOT_FOUND_REDIRECT_GUARD_MS) {
        return false;
      }
      this.setNotFoundRedirectGuardTs(now);
      const destination = target === window.location.href ? fallback : target;
      return this.scheduleCFRedirect(
        destination,
        true,
        this.t("cfBypassNotFoundRedirecting")
      );
    },
    isChallengeFailure() {
      if (this.isChallengePage()) return false;
      try {
        const dialogElement = document.querySelector(this.CF_BYPASS_CONFIG.DIALOG_SELECTOR);
        if (!dialogElement) return false;
        const text = dialogElement.textContent || "";
        return this.CF_BYPASS_CONFIG.ERROR_TEXTS.some((errorText) => text.includes(errorText));
      } catch (error) {
        console.warn("[CF Challenge] \u68C0\u6D4B\u5931\u8D25\u9875\u9762\u65F6\u51FA\u9519:", error);
        return false;
      }
    },
    redirectToChallenge(message = this.t("cfBypassDetected")) {
      if (this.isChallengePage()) return false;
      if (this.autoRunning || this.isScrolling) {
        this.stopScrolling();
        this.stopNavigationGuard();
        this.autoRunning = false;
        if (this.navigationTimeout) {
          clearTimeout(this.navigationTimeout);
          this.navigationTimeout = null;
        }
      }
      const url = `${this.CF_BYPASS_CONFIG.CHALLENGE_PATH}?redirect=${encodeURIComponent(window.location.href)}`;
      return this.scheduleCFRedirect(url, false, message);
    },
    checkAndRedirectCF(observer = null) {
      if (!this.isChallengeFailure()) return false;
      observer?.disconnect();
      if (observer === this.cfBypassObserver) this.cfBypassObserver = null;
      this.redirectToChallenge();
      return true;
    },
    stopCloudFlareBypass() {
      if (this.cfBypassObserver) {
        this.cfBypassObserver.disconnect();
        this.cfBypassObserver = null;
      }
      if (this.cfBypassRedirectTimer !== null) {
        clearTimeout(this.cfBypassRedirectTimer);
        this.cfBypassRedirectTimer = null;
      }
      this.cfBypassRedirecting = false;
    },
    initCloudFlareBypass() {
      if (CURRENT_DOMAIN !== "linux.do") return;
      if (!this.cfBypassEnabled) {
        this.stopCloudFlareBypass();
        return;
      }
      if (this.cfBypassObserver) {
        this.cfBypassObserver.disconnect();
        this.cfBypassObserver = null;
      }
      if (this.isChallengePage()) {
        if (this.isNotFoundPage()) this.redirectFromNotFoundPage();
        return;
      }
      if (this.checkAndRedirectCF()) return;
      if (!document.body) {
        setTimeout(() => this.initCloudFlareBypass(), 0);
        return;
      }
      const observer = new MutationObserver((_mutations, obs) => {
        if (this.isChallengePage()) {
          if (this.isNotFoundPage() && this.redirectFromNotFoundPage()) obs.disconnect();
          return;
        }
        this.checkAndRedirectCF(obs);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      this.cfBypassObserver = observer;
    },
    manualTriggerCF() {
      if (this.isChallengePage()) {
        if (this.isNotFoundPage()) {
          this.redirectFromNotFoundPage();
        } else {
          this.showNotification(this.t("cfBypassAlreadyOnChallenge"));
        }
        return;
      }
      this.redirectToChallenge(this.t("cfBypassRedirecting"));
    }
  };

  // src/controller/mixins/account.js
  var methods11 = {
    async getCurrentUsername() {
      if (this.currentUsername) return this.currentUsername;
      if (CURRENT_DOMAIN === "cdk.linux.do") {
        return null;
      }
      try {
        try {
          const currentUser = window.Discourse?.User?.current?.() || window.Discourse?.currentUser || window.User?.current?.();
          if (currentUser?.username) {
            this.currentUsername = currentUser.username;
            return this.currentUsername;
          }
        } catch (e) {
        }
        try {
          const preloadData = document.getElementById("data-preloaded");
          if (preloadData) {
            const data = JSON.parse(preloadData.dataset.preloaded);
            if (data?.currentUser) {
              const cu = JSON.parse(data.currentUser);
              if (cu?.username) {
                this.currentUsername = cu.username;
                return this.currentUsername;
              }
            }
          }
        } catch (e) {
        }
        const userMenuBtn = document.querySelector(".header-dropdown-toggle.current-user");
        if (userMenuBtn) {
          const img = userMenuBtn.querySelector("img[alt]");
          if (img && img.alt) {
            this.currentUsername = img.alt.trim().replace(/^@/, "");
            return this.currentUsername;
          }
        }
        const userAvatar = document.querySelector(".current-user img[title]");
        if (userAvatar && userAvatar.title) {
          this.currentUsername = userAvatar.title.trim().replace(/^@/, "");
          return this.currentUsername;
        }
        const currentUserLink = document.querySelector("a.current-user, .header-dropdown-toggle.current-user a");
        if (currentUserLink) {
          const href = currentUserLink.getAttribute("href");
          if (href && href.includes("/u/")) {
            const username = href.split("/u/")[1].split("/")[0];
            if (username) {
              this.currentUsername = username.trim().replace(/^@/, "");
              return this.currentUsername;
            }
          }
        }
        try {
          const avatarLink = document.querySelector('#current-user a[href*="/u/"]');
          if (avatarLink) {
            const match = avatarLink.href.match(/\/u\/([^\/]+)/);
            if (match) {
              this.currentUsername = match[1].trim().replace(/^@/, "");
              return this.currentUsername;
            }
          }
        } catch (e) {
        }
        try {
          const stored = localStorage.getItem("discourse_current_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.username) {
              this.currentUsername = parsed.username;
              return this.currentUsername;
            }
          }
        } catch (e) {
        }
        try {
          const userLinks = document.querySelectorAll('a[href*="/u/"]');
          for (const link of userLinks) {
            if (link.closest(".topic-list") || link.closest(".post-stream")) continue;
            const href = link.getAttribute("href");
            if (href && href.includes("/u/")) {
              const username = href.split("/u/")[1].split("/")[0];
              if (username) {
                this.currentUsername = username.trim().replace(/^@/, "");
                return this.currentUsername;
              }
            }
          }
        } catch (e) {
        }
        if (window.location.pathname.includes("/u/")) {
          const username = window.location.pathname.split("/u/")[1].split("/")[0];
          if (username) {
            this.currentUsername = username.trim().replace(/^@/, "");
            return this.currentUsername;
          }
        }
        if (CURRENT_DOMAIN === "linux.do" || CURRENT_DOMAIN === "idcflare.com") {
          const session429Until = Storage.get("session429Until", 0);
          if (session429Until > Date.now()) {
            const remainMinutes = Math.ceil((session429Until - Date.now()) / 6e4);
            console.log(`[Session] session/current 429 \u51B7\u5374\u671F\u4E2D\uFF0C\u5269\u4F59 ${remainMinutes} \u5206\u949F\uFF0C\u8DF3\u8FC7\u8BF7\u6C42`);
            return null;
          }
          const response = await fetch(`${BASE_URL}/session/current.json`);
          if (response.status === 429) {
            console.warn("[Session] session/current \u9047\u5230 429\uFF0C\u8BBE\u7F6E 30 \u5206\u949F\u51B7\u5374");
            Storage.set("session429Until", Date.now() + 30 * 60 * 1e3);
            return null;
          }
          if (response.ok) {
            const data = await response.json();
            if (data.current_user && data.current_user.username) {
              this.currentUsername = data.current_user.username;
              return this.currentUsername;
            }
          }
        }
      } catch (error) {
        console.error("\u83B7\u53D6\u7528\u6237\u540D\u5931\u8D25:", error);
      }
      return null;
    },
    async loadUserTrustLevel(isManualRefresh = false) {
      const username = await this.getCurrentUsername();
      if (!username) {
        this.trustLevelContainer.innerHTML = '<div class="trust-level-loading">\u672A\u767B\u5F55</div>';
        return;
      }
      const now = Date.now();
      const TRUST_LEVEL_CACHE_INTERVAL = 30 * 60 * 1e3;
      const cacheKey = `trustLevelCache_${CURRENT_DOMAIN}_${username}`;
      const lastFetchKey = `lastTrustLevelFetch_${CURRENT_DOMAIN}_${username}`;
      const lastFetch = Storage.get(lastFetchKey, 0);
      if (!isManualRefresh && lastFetch > 0 && now - lastFetch < TRUST_LEVEL_CACHE_INTERVAL) {
        const cachedData = Storage.get(cacheKey, null);
        if (cachedData) {
          console.log("\u4F7F\u7528\u7F13\u5B58\u7684\u7B49\u7EA7\u6570\u636E\uFF0C\u8DDD\u4E0A\u6B21\u83B7\u53D6:", Math.round((now - lastFetch) / 1e3 / 60), "\u5206\u949F");
          this.renderCachedTrustLevel(cachedData, lastFetch);
          return;
        }
      }
      if (isManualRefresh) {
        const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
        if (refreshBtn) {
          refreshBtn.textContent = this.t("refreshing");
          refreshBtn.disabled = true;
        }
      }
      try {
        if (CURRENT_DOMAIN === "idcflare.com") {
          const summaryResponse = await fetch(`${BASE_URL}/u/${username}/summary.json`);
          if (summaryResponse.ok) {
            const data = await summaryResponse.json();
            if (data.user_summary) {
              this.renderTrustLevel(data, username);
              return;
            }
          }
          throw new Error("\u65E0\u6CD5\u83B7\u53D6\u7B49\u7EA7\u6570\u636E");
        } else if (CURRENT_DOMAIN === "linux.do") {
          await this.fetchLinuxDoDataWithGM(username);
        }
      } catch (error) {
        console.error("\u52A0\u8F7D\u4FE1\u4EFB\u7B49\u7EA7\u5931\u8D25:", error);
        this.trustLevelContainer.innerHTML = `
                <div class="trust-level-header">
                    \u{1F4CA} \u4FE1\u4EFB\u7B49\u7EA7
                    <button class="trust-level-refresh" onclick="window.browseController.loadUserTrustLevel(true)">\u{1F504} \u5237\u65B0</button>
                </div>
                <div class="trust-level-loading">\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u70B9\u51FB\u5237\u65B0\u91CD\u8BD5</div>
            `;
      } finally {
        if (isManualRefresh) {
          setTimeout(() => {
            const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
            if (refreshBtn) {
              refreshBtn.textContent = "\u{1F504} \u5237\u65B0";
              refreshBtn.disabled = false;
            }
          }, 1e3);
        }
      }
    },
    saveTrustLevelCache(username, data) {
      const cacheKey = `trustLevelCache_${CURRENT_DOMAIN}_${username}`;
      const lastFetchKey = `lastTrustLevelFetch_${CURRENT_DOMAIN}_${username}`;
      Storage.set(cacheKey, data);
      Storage.set(lastFetchKey, Date.now());
      console.log(`\u7B49\u7EA7\u6570\u636E\u5DF2\u7F13\u5B58 (${CURRENT_DOMAIN})`);
      this.saveDailySnapshot(username, data);
    },
    saveDailySnapshot(username, data) {
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const historyKey = `trustLevelHistory_${CURRENT_DOMAIN}_${username}`;
      const history = Storage.get(historyKey, {});
      const snapshot = {
        date: today,
        timestamp: Date.now(),
        type: data.type,
        currentLevel: data.currentLevel,
        targetLevel: data.targetLevel,
        items: (data.items || data.requirements || []).map((item) => {
          let currentNum = item.current;
          let requiredNum = item.required;
          if (typeof item.current === "string") {
            const match = item.current.match(/(\d+)/);
            currentNum = match ? parseInt(match[1]) : 0;
          }
          if (typeof item.required === "string") {
            const match = item.required.match(/(\d+)/);
            requiredNum = match ? parseInt(match[1]) : 0;
          }
          let simpleName = item.name.replace("\u5DF2\u8BFB\u5E16\u5B50\uFF08\u6240\u6709\u65F6\u95F4\uFF09", "\u5DF2\u8BFB\u5E16\u5B50").replace("\u6D4F\u89C8\u7684\u8BDD\u9898\uFF08\u6240\u6709\u65F6\u95F4\uFF09", "\u6D4F\u89C8\u8BDD\u9898").replace("\u8BBF\u95EE\u6B21\u6570\uFF08\u8FC7\u53BB", "\u8BBF\u95EE\u6B21\u6570(").replace("\u4E2A\u6708\uFF09", "\u6708)").replace("\u56DE\u590D\u6B21\u6570\uFF08\u6700\u8FD1", "\u56DE\u590D(\u8FD1").replace("\u5929\u5185\uFF09", "\u5929)");
          return {
            name: simpleName,
            current: currentNum,
            required: requiredNum,
            isMet: item.isMet
          };
        })
      };
      history[today] = snapshot;
      const dates = Object.keys(history).sort().reverse();
      if (dates.length > 30) {
        dates.slice(30).forEach((d) => delete history[d]);
      }
      Storage.set(historyKey, history);
      console.log(`\u7B49\u7EA7\u5386\u53F2\u5FEB\u7167\u5DF2\u4FDD\u5B58 (${today})`);
    },
    getYesterdaySnapshot(username) {
      const historyKey = `trustLevelHistory_${CURRENT_DOMAIN}_${username}`;
      const history = Storage.get(historyKey, {});
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      return history[yesterdayStr] || null;
    },
    calculateDataChange(currentValue, yesterdaySnapshot, itemName) {
      if (!yesterdaySnapshot || !yesterdaySnapshot.items) return null;
      const yesterdayItem = yesterdaySnapshot.items.find((item) => item.name === itemName);
      if (!yesterdayItem) return null;
      const diff = currentValue - yesterdayItem.current;
      return diff;
    },
    generateChangeIndicator(diff) {
      if (diff === null || diff === void 0) return "";
      if (diff > 0) {
        return `<span class="change-indicator change-up" title="\u8F83\u6628\u65E5 +${diff}">\u2191${diff}</span>`;
      } else if (diff < 0) {
        return `<span class="change-indicator change-down" title="\u8F83\u6628\u65E5 ${diff}">\u2193${Math.abs(diff)}</span>`;
      }
      return "";
    },
    renderCachedTrustLevel(cachedData, lastFetch) {
      if (!cachedData) return;
      const { type, username, currentLevel, targetLevel, items, requirements, achievedCount, totalCount, allMet } = cachedData;
      const cacheAge = Date.now() - lastFetch;
      const cacheMinutes = Math.floor(cacheAge / 1e3 / 60);
      const cacheTimeText = cacheMinutes < 1 ? "\u521A\u521A" : `${cacheMinutes}\u5206\u949F\u524D`;
      const levelNames = {
        0: "Lv0 \u2192 Lv1",
        1: "Lv1 \u2192 Lv2",
        2: "Lv1 \u2192 Lv2",
        3: "Lv2 \u2192 Lv3",
        4: "Lv3 \u2192 Lv4"
      };
      const yesterdaySnapshot = this.getYesterdaySnapshot(username);
      const isAllMetForHeader = type === "low_level" ? allMet : achievedCount === totalCount;
      const headerTitle = isAllMetForHeader ? `Lv${targetLevel} \u2713` : levelNames[type === "low_level" ? currentLevel : targetLevel] || `Lv${currentLevel} \u2192 Lv${targetLevel}`;
      let html = `
            <div class="trust-level-header">
                <span>\u{1F4CA} ${headerTitle} (${username})</span>
                <button class="trust-level-refresh" data-action="refresh">\u{1F504} \u5237\u65B0</button>
            </div>
            <div style="font-size: 10px; color: rgba(255,255,255,0.6); margin-bottom: 4px; text-align: right;">\u7F13\u5B58: ${cacheTimeText}</div>
        `;
      const displayItems = type === "low_level" ? items : requirements;
      displayItems.forEach((req) => {
        let currentNum, requiredNum, displayCurrent, displayRequired;
        if (type === "low_level") {
          currentNum = req.current;
          requiredNum = req.required;
          displayCurrent = req.current;
          displayRequired = req.required;
        } else {
          const currentMatch = req.current.match(/(\d+)/);
          const requiredMatch = req.required.match(/(\d+)/);
          currentNum = currentMatch ? parseInt(currentMatch[1]) : 0;
          requiredNum = requiredMatch ? parseInt(requiredMatch[1]) : 1;
          displayCurrent = req.current;
          displayRequired = req.required;
        }
        const progress = Math.min(currentNum / requiredNum * 100, 100);
        const isCompleted = req.isMet;
        const fillClass = isCompleted ? "completed" : "";
        let simpleName = req.name.replace("\u5DF2\u8BFB\u5E16\u5B50\uFF08\u6240\u6709\u65F6\u95F4\uFF09", "\u5DF2\u8BFB\u5E16\u5B50").replace("\u6D4F\u89C8\u7684\u8BDD\u9898\uFF08\u6240\u6709\u65F6\u95F4\uFF09", "\u6D4F\u89C8\u8BDD\u9898").replace("\u8BBF\u95EE\u6B21\u6570\uFF08\u8FC7\u53BB", "\u8BBF\u95EE\u6B21\u6570(").replace("\u4E2A\u6708\uFF09", "\u6708)").replace("\u56DE\u590D\u6B21\u6570\uFF08\u6700\u8FD1", "\u56DE\u590D(\u8FD1").replace("\u5929\u5185\uFF09", "\u5929)");
        const diff = this.calculateDataChange(currentNum, yesterdaySnapshot, simpleName);
        const changeIndicator = this.generateChangeIndicator(diff);
        html += `
                <div class="trust-level-item">
                    <span class="trust-level-name">${simpleName}</span>
                    <div class="trust-level-progress">
                        <div class="trust-level-bar">
                            <div class="trust-level-bar-fill ${fillClass}" style="width: ${progress}%"></div>
                        </div>
                        <span class="trust-level-value">${displayCurrent}/${displayRequired}${changeIndicator}</span>
                    </div>
                </div>
            `;
      });
      const isAllMet = type === "low_level" ? allMet : achievedCount === totalCount;
      if (isAllMet) {
        html += `
                <div style="background: rgba(255, 255, 255, 0.25); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: #fff; font-size: 11px; font-weight: 600; text-align: center;">
                        \u2705 \u5DF2\u6EE1\u8DB3 Lv${targetLevel} \u8981\u6C42
                    </div>
                </div>
            `;
      } else {
        const unmetCount = totalCount - achievedCount;
        html += `
                <div style="background: rgba(255, 255, 255, 0.15); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 11px; font-weight: 500; text-align: center;">
                        \u8FD8\u9700\u5B8C\u6210 ${unmetCount} \u9879\u5347\u7EA7\u5230 Lv${targetLevel}
                    </div>
                </div>
            `;
      }
      this.trustLevelContainer.innerHTML = html;
      setTimeout(() => {
        const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", () => this.loadUserTrustLevel(true));
        }
      }, 100);
    },
    async fetchLinuxDoDataWithGM(username) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://connect.linux.do/",
          timeout: 15e3,
          onload: (response) => {
            if (response.status === 200) {
              const responseText = response.responseText;
              const tempDiv = document.createElement("div");
              tempDiv.innerHTML = responseText;
              let globalUsername = username;
              let currentLevel = "\u672A\u77E5";
              const h1 = tempDiv.querySelector("h1");
              if (h1) {
                const h1Text = h1.textContent.trim();
                const welcomeMatch = h1Text.match(/你好，\s*([^(\s]*)\s*\(?([^)]*)\)?\s*(\d+)级用户/i);
                if (welcomeMatch) {
                  globalUsername = welcomeMatch[2] || welcomeMatch[1] || username;
                  currentLevel = welcomeMatch[3];
                  console.log(`\u4ECE<h1>\u89E3\u6790: \u7528\u6237\u540D='${globalUsername}', \u5F53\u524D\u7B49\u7EA7='${currentLevel}'`);
                }
              }
              let userLevel = parseInt(currentLevel);
              if (isNaN(userLevel)) {
                const pageText = tempDiv.textContent || "";
                const levelRequirementMatch = pageText.match(/信任级别\s*(\d+)\s*的要求\s*(已达到|未达到)/);
                if (levelRequirementMatch) {
                  const targetLevel = parseInt(levelRequirementMatch[1]);
                  const status = levelRequirementMatch[2];
                  if (status === "\u5DF2\u8FBE\u5230") {
                    userLevel = targetLevel;
                    console.log(`\u68C0\u6D4B\u5230"\u5DF2\u8FBE\u5230\u4FE1\u4EFB\u7EA7\u522B${targetLevel}\u7684\u8981\u6C42"\uFF0C\u7528\u6237\u7B49\u7EA7: ${userLevel}`);
                  } else {
                    userLevel = targetLevel - 1;
                    console.log(`\u68C0\u6D4B\u5230"\u672A\u8FBE\u5230\u4FE1\u4EFB\u7EA7\u522B${targetLevel}\u7684\u8981\u6C42"\uFF0C\u7528\u6237\u7B49\u7EA7: ${userLevel}`);
                  }
                  currentLevel = String(userLevel);
                }
                if (isNaN(userLevel)) {
                  const statusMatch = pageText.match(/(已达到|不符合)信任级别\s*(\d+)\s*要求/);
                  if (statusMatch) {
                    const status = statusMatch[1];
                    const targetLevel = parseInt(statusMatch[2]);
                    if (status === "\u5DF2\u8FBE\u5230") {
                      userLevel = targetLevel;
                      console.log(`\u68C0\u6D4B\u5230"\u5DF2\u8FBE\u5230\u4FE1\u4EFB\u7EA7\u522B${targetLevel}\u8981\u6C42"\uFF0C\u7528\u6237\u7B49\u7EA7: ${userLevel}`);
                    } else {
                      userLevel = targetLevel - 1;
                      console.log(`\u68C0\u6D4B\u5230"\u4E0D\u7B26\u5408\u4FE1\u4EFB\u7EA7\u522B${targetLevel}\u8981\u6C42"\uFF0C\u7528\u6237\u7B49\u7EA7: ${userLevel}`);
                    }
                    currentLevel = String(userLevel);
                  }
                }
              }
              if (userLevel === 0 || userLevel === 1) {
                console.log(`\u68C0\u6D4B\u5230${userLevel}\u7EA7\u7528\u6237\uFF0C\u4F7F\u7528summary.json\u83B7\u53D6\u6570\u636E`);
                this.fetchLowLevelUserData(username, userLevel).then(resolve).catch(reject);
              } else if (userLevel >= 2) {
                console.log(`\u68C0\u6D4B\u5230${userLevel}\u7EA7\u7528\u6237\uFF0C\u4F7F\u7528connect.linux.do\u9875\u9762\u6570\u636E`);
                this.processHighLevelUserData(tempDiv, globalUsername, currentLevel);
                resolve();
              } else {
                console.log("\u65E0\u6CD5\u4ECE connect.linux.do \u89E3\u6790\u7B49\u7EA7\uFF0C\u56DE\u9000\u5230 summary.json");
                this.fetchLowLevelUserData(username, 1).then(resolve).catch(reject);
              }
            } else {
              console.warn(`[\u4FE1\u4EFB\u7B49\u7EA7] connect.linux.do \u8BF7\u6C42\u5931\u8D25(${response.status})\uFF0C\u964D\u7EA7\u5230 summary.json`);
              this.fetchSummaryTrustLevelFallback(username).then(resolve).catch((fallbackErr) => {
                reject(new Error(`\u8BF7\u6C42\u5931\u8D25\uFF0C\u72B6\u6001\u7801: ${response.status}\uFF1B\u964D\u7EA7\u4E5F\u5931\u8D25: ${fallbackErr.message}`));
              });
            }
          },
          onerror: (error) => {
            console.error("GM_xmlhttpRequest \u9519\u8BEF:", error);
            this.fetchSummaryTrustLevelFallback(username).then(resolve).catch((fallbackErr) => {
              reject(new Error(`\u7F51\u7EDC\u8BF7\u6C42\u9519\u8BEF\uFF1B\u964D\u7EA7\u4E5F\u5931\u8D25: ${fallbackErr.message}`));
            });
          },
          ontimeout: () => {
            console.error("GM_xmlhttpRequest \u8D85\u65F6");
            this.fetchSummaryTrustLevelFallback(username).then(resolve).catch((fallbackErr) => {
              reject(new Error(`\u8BF7\u6C42\u8D85\u65F6\uFF1B\u964D\u7EA7\u4E5F\u5931\u8D25: ${fallbackErr.message}`));
            });
          }
        });
      });
    },
    async fetchLowLevelUserData(username, currentLevel) {
      const summaryResponse = await fetch(`${BASE_URL}/u/${username}/summary.json`);
      if (summaryResponse.ok) {
        const data = await summaryResponse.json();
        const userSummary = data.user_summary;
        this.renderTrustLevelNew(username, currentLevel, userSummary);
      } else {
        throw new Error("\u65E0\u6CD5\u83B7\u53D6\u7528\u6237summary\u6570\u636E");
      }
    },
    async fetchSummaryTrustLevelFallback(username) {
      const safeUsername = encodeURIComponent(username || "");
      const summaryResponse = await fetch(`${BASE_URL}/u/${safeUsername}/summary.json`, {
        credentials: "include"
      });
      if (!summaryResponse.ok) {
        throw new Error(`summary.json \u8BF7\u6C42\u5931\u8D25(${summaryResponse.status})`);
      }
      const data = await summaryResponse.json();
      if (!data || !data.user_summary) {
        throw new Error("summary.json \u8FD4\u56DE\u6570\u636E\u4E0D\u5B8C\u6574");
      }
      this.renderTrustLevel(data, username);
    },
    processHighLevelUserData(tempDiv, globalUsername, currentLevel) {
      let targetInfoDiv = null;
      const cardDivs = tempDiv.querySelectorAll("div.card");
      for (let i = 0; i < cardDivs.length; i++) {
        const div = cardDivs[i];
        const h22 = div.querySelector("h2.card-title");
        if (h22 && h22.textContent.includes("\u4FE1\u4EFB\u7EA7\u522B") && h22.textContent.includes("\u7684\u8981\u6C42")) {
          targetInfoDiv = div;
          break;
        }
      }
      if (!targetInfoDiv) {
        const potentialDivs = tempDiv.querySelectorAll("div.bg-white.p-6.rounded-lg");
        for (let i = 0; i < potentialDivs.length; i++) {
          const div = potentialDivs[i];
          const h22 = div.querySelector("h2");
          if (h22 && h22.textContent.includes("\u4FE1\u4EFB\u7EA7\u522B")) {
            targetInfoDiv = div;
            break;
          }
        }
      }
      if (!targetInfoDiv) {
        const allDivs = tempDiv.querySelectorAll("div");
        for (let i = 0; i < allDivs.length; i++) {
          const div = allDivs[i];
          const headings = div.querySelectorAll("h1, h2, h3");
          for (let j = 0; j < headings.length; j++) {
            if (headings[j].textContent.includes("\u4FE1\u4EFB\u7EA7\u522B") && headings[j].textContent.includes("\u7684\u8981\u6C42")) {
              targetInfoDiv = div;
              break;
            }
          }
          if (targetInfoDiv) break;
        }
      }
      if (!targetInfoDiv) {
        console.log("\u672A\u627E\u5230\u4FE1\u4EFB\u7EA7\u522B\u6570\u636E\u5757\uFF0C\u56DE\u9000\u5230\u4F7F\u7528summary.json");
        this.fetchLowLevelUserData(globalUsername, parseInt(currentLevel));
        return;
      }
      const h2 = targetInfoDiv.querySelector("h2");
      const titleMatch = h2.textContent.match(/信任级别\s*(\d+)\s*的要求/);
      const targetLevel = titleMatch ? titleMatch[1] : "\u672A\u77E5";
      const requirements = [];
      const rings = targetInfoDiv.querySelectorAll(".tl3-ring");
      rings.forEach((ring) => {
        const label = ring.querySelector(".tl3-ring-label");
        const circle = ring.querySelector(".tl3-ring-circle");
        const currentEl = ring.querySelector(".tl3-ring-current");
        const targetEl = ring.querySelector(".tl3-ring-target");
        if (label && currentEl) {
          const name = label.textContent.trim();
          const current = currentEl.textContent.trim();
          const required = targetEl ? targetEl.textContent.replace(/^[\s/]+/, "").trim() : "";
          const isMet = circle ? circle.classList.contains("met") : false;
          requirements.push({ name, current, required, isMet });
        }
      });
      const bars = targetInfoDiv.querySelectorAll(".tl3-bar-item");
      bars.forEach((bar) => {
        const labelEl = bar.querySelector(".tl3-bar-label");
        const numsEl = bar.querySelector(".tl3-bar-nums");
        if (labelEl && numsEl) {
          const name = labelEl.textContent.trim();
          const numsText = numsEl.textContent.trim();
          const parts = numsText.split("/");
          const current = parts[0] ? parts[0].trim() : numsText;
          const required = parts[1] ? parts[1].trim() : "";
          const isMet = numsEl.classList.contains("met");
          requirements.push({ name, current, required, isMet });
        }
      });
      const quotas = targetInfoDiv.querySelectorAll(".tl3-quota-card");
      quotas.forEach((quota) => {
        const labelEl = quota.querySelector(".tl3-quota-label");
        const numsEl = quota.querySelector(".tl3-quota-nums");
        if (labelEl && numsEl) {
          const name = labelEl.textContent.trim();
          const numsText = numsEl.textContent.trim();
          const parts = numsText.split("/");
          const current = parts[0] ? parts[0].trim() : numsText;
          const required = parts[1] ? parts[1].trim() : "";
          const isMet = quota.classList.contains("met");
          requirements.push({ name, current, required, isMet });
        }
      });
      const vetos = targetInfoDiv.querySelectorAll(".tl3-veto-item");
      vetos.forEach((veto) => {
        const labelEl = veto.querySelector(".tl3-veto-label");
        const valueEls = veto.querySelectorAll(".tl3-veto-value");
        if (labelEl && valueEls.length) {
          const name = labelEl.textContent.trim();
          const isMet = veto.classList.contains("met");
          let current = "0";
          const required = "0";
          if (isMet) {
            current = valueEls[0].textContent.trim() || "0";
          } else {
            current = valueEls[valueEls.length - 1].textContent.trim() || "0";
          }
          requirements.push({ name, current, required, isMet });
        }
      });
      if (requirements.length === 0) {
        const tableRows = targetInfoDiv.querySelectorAll("table tbody tr");
        tableRows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 3) {
            const name = cells[0].textContent.trim();
            const required = cells[1].textContent.trim();
            const current = cells[2].textContent.trim();
            const isMet = cells[2].classList.contains("status-met") || cells[2].classList.contains("text-green-500");
            requirements.push({ name, current, required, isMet });
          }
        });
      }
      this.renderAdvancedTrustLevel(globalUsername, targetLevel, requirements);
    },
    renderTrustLevelNew(username, currentLevel, userSummary) {
      const targetLevel = currentLevel + 1;
      const requirements = CONFIG.levelRequirements[currentLevel];
      if (!requirements) {
        this.trustLevelContainer.innerHTML = '<div class="trust-level-loading">\u65E0\u914D\u7F6E\u6570\u636E</div>';
        return;
      }
      const trustLevelDetails = {
        items: [],
        achievedCount: 0,
        totalCount: 0
      };
      Object.entries(requirements).forEach(([key, requiredValue]) => {
        let currentValue = 0;
        let label = "";
        let isMet = false;
        switch (key) {
          case "topics_entered":
            currentValue = userSummary.topics_entered || 0;
            label = "\u6D4F\u89C8\u7684\u8BDD\u9898";
            isMet = currentValue >= requiredValue;
            break;
          case "posts_read_count":
            currentValue = userSummary.posts_read_count || 0;
            label = "\u5DF2\u8BFB\u5E16\u5B50";
            isMet = currentValue >= requiredValue;
            break;
          case "time_read":
            currentValue = Math.floor((userSummary.time_read || 0) / 60);
            label = "\u9605\u8BFB\u65F6\u957F(\u5206)";
            isMet = (userSummary.time_read || 0) >= requiredValue;
            requiredValue = Math.floor(requiredValue / 60);
            break;
          case "days_visited":
            currentValue = userSummary.days_visited || 0;
            label = "\u8BBF\u95EE\u5929\u6570";
            isMet = currentValue >= requiredValue;
            break;
          case "likes_given":
            currentValue = userSummary.likes_given || 0;
            label = "\u7ED9\u51FA\u7684\u8D5E";
            isMet = currentValue >= requiredValue;
            break;
          case "likes_received":
            currentValue = userSummary.likes_received || 0;
            label = "\u6536\u5230\u7684\u8D5E";
            isMet = currentValue >= requiredValue;
            break;
          case "post_count":
            currentValue = userSummary.post_count || 0;
            label = "\u5E16\u5B50\u6570\u91CF";
            isMet = currentValue >= requiredValue;
            break;
        }
        if (label) {
          trustLevelDetails.items.push({
            name: label,
            current: currentValue,
            required: requiredValue,
            isMet
          });
          if (isMet) {
            trustLevelDetails.achievedCount++;
          }
          trustLevelDetails.totalCount++;
        }
      });
      const achievedCount = trustLevelDetails.achievedCount;
      const totalCount = trustLevelDetails.totalCount;
      const allMet = achievedCount === totalCount;
      const levelNames = {
        0: "Lv0 \u2192 Lv1",
        1: "Lv1 \u2192 Lv2"
      };
      const yesterdaySnapshot = this.getYesterdaySnapshot(username);
      const headerTitle = allMet ? `Lv${targetLevel} \u2713` : levelNames[currentLevel] || `Lv${currentLevel} \u2192 Lv${targetLevel}`;
      let html = `
            <div class="trust-level-header">
                <span>\u{1F4CA} ${headerTitle} (${username})</span>
                <button class="trust-level-refresh" data-action="refresh">\u{1F504} \u5237\u65B0</button>
            </div>
        `;
      trustLevelDetails.items.forEach((req) => {
        const progress = Math.min(req.current / req.required * 100, 100);
        const isCompleted = req.isMet;
        const fillClass = isCompleted ? "completed" : "";
        const diff = this.calculateDataChange(req.current, yesterdaySnapshot, req.name);
        const changeIndicator = this.generateChangeIndicator(diff);
        const isNegativeIndicator = req.name.includes("\u88AB\u7981\u8A00") || req.name.includes("\u88AB\u5C01\u7981") || req.name.includes("\u88AB\u4E3E\u62A5\u7684\u5E16\u5B50") || req.name.includes("\u53D1\u8D77\u4E3E\u62A5\u7684\u7528\u6237");
        const currentValueHtml = isNegativeIndicator ? `<span style="color: #ff6b6b;">${req.current}</span>` : req.current;
        html += `
                <div class="trust-level-item">
                    <span class="trust-level-name">${req.name}</span>
                    <div class="trust-level-progress">
                        <div class="trust-level-bar">
                            <div class="trust-level-bar-fill ${fillClass}" style="width: ${progress}%"></div>
                        </div>
                        <span class="trust-level-value">${currentValueHtml}/${req.required}${changeIndicator}</span>
                    </div>
                </div>
            `;
      });
      if (allMet) {
        html += `
                <div style="background: rgba(255, 255, 255, 0.25); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: #fff; font-size: 11px; font-weight: 600; text-align: center;">
                        \u2705 \u5DF2\u6EE1\u8DB3 Lv${targetLevel} \u8981\u6C42
                    </div>
                </div>
            `;
      } else {
        const unmetCount = totalCount - achievedCount;
        html += `
                <div style="background: rgba(255, 255, 255, 0.15); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 11px; font-weight: 500; text-align: center;">
                        \u8FD8\u9700\u5B8C\u6210 ${unmetCount} \u9879\u5347\u7EA7\u5230 Lv${targetLevel}
                    </div>
                </div>
            `;
      }
      this.trustLevelContainer.innerHTML = html;
      this.saveTrustLevelCache(username, {
        type: "low_level",
        username,
        currentLevel,
        targetLevel,
        items: trustLevelDetails.items,
        achievedCount,
        totalCount,
        allMet
      });
      setTimeout(() => {
        const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", () => this.loadUserTrustLevel(true));
        }
      }, 100);
    },
    renderTrustLevel(data, username) {
      const summary = data.user_summary;
      if (!summary) {
        this.trustLevelContainer.innerHTML = '<div class="trust-level-loading">\u65E0\u6570\u636E</div>';
        return;
      }
      const currentLevel = summary.trust_level !== void 0 ? summary.trust_level : data.user && data.user.trust_level !== void 0 ? data.user.trust_level : 1;
      const targetLevel = currentLevel + 1;
      const levelConfig = CONFIG.levelRequirements[currentLevel];
      if (!levelConfig) {
        this.renderDefaultTrustLevel(summary, username);
        return;
      }
      const requirements = [];
      Object.entries(levelConfig).forEach(([key, requiredValue]) => {
        let currentValue = 0;
        let label = "";
        switch (key) {
          case "topics_entered":
            currentValue = summary.topics_entered || 0;
            label = "\u6D4F\u89C8\u7684\u8BDD\u9898";
            break;
          case "posts_read_count":
            currentValue = summary.posts_read_count || 0;
            label = "\u5DF2\u8BFB\u5E16\u5B50";
            break;
          case "time_read":
            currentValue = Math.floor((summary.time_read || 0) / 60);
            label = "\u9605\u8BFB\u65F6\u957F(\u5206)";
            requiredValue = Math.floor(requiredValue / 60);
            break;
          case "days_visited":
            currentValue = summary.days_visited || 0;
            label = "\u8BBF\u95EE\u5929\u6570";
            break;
          case "likes_given":
            currentValue = summary.likes_given || 0;
            label = "\u7ED9\u51FA\u7684\u8D5E";
            break;
          case "likes_received":
            currentValue = summary.likes_received || 0;
            label = "\u6536\u5230\u7684\u8D5E";
            break;
          case "post_count":
            currentValue = summary.post_count || 0;
            label = "\u5E16\u5B50\u6570\u91CF";
            break;
        }
        if (label) {
          requirements.push({
            name: label,
            current: currentValue,
            required: requiredValue
          });
        }
      });
      const achievedCount = requirements.filter((req) => req.current >= req.required).length;
      const totalCount = requirements.length;
      const allMet = achievedCount === totalCount;
      const levelNames = {
        0: "Lv0 \u2192 Lv1",
        1: "Lv1 \u2192 Lv2",
        2: "Lv2 \u2192 Lv3",
        3: "Lv3 \u2192 Lv4"
      };
      const yesterdaySnapshot = this.getYesterdaySnapshot(username);
      let html = `
            <div class="trust-level-header">
                <span>\u{1F4CA} ${levelNames[currentLevel] || `Lv${currentLevel} \u2192 Lv${targetLevel}`} (${username})</span>
                <button class="trust-level-refresh" data-action="refresh">\u{1F504} \u5237\u65B0</button>
            </div>
        `;
      requirements.forEach((req) => {
        const progress = Math.min(req.current / req.required * 100, 100);
        const isCompleted = req.current >= req.required;
        const fillClass = isCompleted ? "completed" : "";
        const diff = this.calculateDataChange(req.current, yesterdaySnapshot, req.name);
        const changeIndicator = this.generateChangeIndicator(diff);
        const isNegativeIndicator = req.name.includes("\u88AB\u7981\u8A00") || req.name.includes("\u88AB\u5C01\u7981") || req.name.includes("\u88AB\u4E3E\u62A5\u7684\u5E16\u5B50") || req.name.includes("\u53D1\u8D77\u4E3E\u62A5\u7684\u7528\u6237");
        const currentValueHtml = isNegativeIndicator ? `<span style="color: #ff6b6b;">${req.current}</span>` : req.current;
        html += `
                <div class="trust-level-item">
                    <span class="trust-level-name">${req.name}</span>
                    <div class="trust-level-progress">
                        <div class="trust-level-bar">
                            <div class="trust-level-bar-fill ${fillClass}" style="width: ${progress}%"></div>
                        </div>
                        <span class="trust-level-value">${currentValueHtml}/${req.required}${changeIndicator}</span>
                    </div>
                </div>
            `;
      });
      if (allMet) {
        html += `
                <div style="background: rgba(255, 255, 255, 0.25); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: #fff; font-size: 11px; font-weight: 600; text-align: center;">
                        \u2705 \u5DF2\u6EE1\u8DB3 Lv${targetLevel} \u8981\u6C42
                    </div>
                </div>
            `;
      } else {
        const unmetCount = totalCount - achievedCount;
        html += `
                <div style="background: rgba(255, 255, 255, 0.15); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 11px; font-weight: 500; text-align: center;">
                        \u8FD8\u9700\u5B8C\u6210 ${unmetCount} \u9879\u5347\u7EA7\u5230 Lv${targetLevel}
                    </div>
                </div>
            `;
      }
      this.trustLevelContainer.innerHTML = html;
      const cacheItems = requirements.map((req) => ({
        name: req.name,
        current: req.current,
        required: req.required,
        isMet: req.current >= req.required
      }));
      this.saveTrustLevelCache(username, {
        type: "low_level",
        username,
        currentLevel,
        targetLevel,
        items: cacheItems,
        achievedCount,
        totalCount,
        allMet
      });
      setTimeout(() => {
        const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", () => this.loadUserTrustLevel(true));
        }
      }, 100);
    },
    renderDefaultTrustLevel(summary, username) {
      const requirements = [
        { name: "\u8BBF\u95EE\u5929\u6570", current: summary.days_visited, required: 15 },
        { name: "\u7ED9\u51FA\u7684\u8D5E", current: summary.likes_given, required: 1 },
        { name: "\u6536\u5230\u7684\u8D5E", current: summary.likes_received, required: 1 },
        { name: "\u5E16\u5B50\u6570\u91CF", current: summary.post_count, required: 3 },
        { name: "\u8FDB\u5165\u4E3B\u9898", current: summary.topics_entered, required: 20 },
        { name: "\u9605\u8BFB\u5E16\u5B50", current: summary.posts_read_count, required: 100 },
        { name: "\u9605\u8BFB\u65F6\u957F(\u5206)", current: Math.floor(summary.time_read / 60), required: 60 }
      ];
      const achievedCount = requirements.filter((req) => req.current >= req.required).length;
      const totalCount = requirements.length;
      const allMet = achievedCount === totalCount;
      let html = `
            <div class="trust-level-header">
                <span>\u{1F4CA} \u7B49\u7EA7 (L2+) (${username || ""})</span>
                <button class="trust-level-refresh" data-action="refresh">\u{1F504} \u5237\u65B0</button>
            </div>
        `;
      if (allMet) {
        html += `
                <div style="background: rgba(16, 185, 129, 0.2); padding: 6px 8px; border-radius: 6px; margin: 6px 0;">
                    <div style="color: #10b981; font-size: 11px; font-weight: 600; text-align: center;">
                        \u{1F389} \u6240\u6709\u8981\u6C42\u5DF2\u8FBE\u6807\uFF01
                    </div>
                </div>
            `;
      } else {
        const unmetCount = totalCount - achievedCount;
        html += `
                <div style="background: rgba(251, 146, 60, 0.2); padding: 6px 8px; border-radius: 6px; margin: 6px 0;">
                    <div style="color: #ea580c; font-size: 11px; font-weight: 600; text-align: center;">
                        \u8FD8\u9700\u5B8C\u6210 ${unmetCount} \u9879\u8981\u6C42
                    </div>
                </div>
            `;
      }
      requirements.forEach((req) => {
        const progress = Math.min(req.current / req.required * 100, 100);
        const isCompleted = req.current >= req.required;
        const fillClass = isCompleted ? "completed" : "";
        const isNegativeIndicator = req.name.includes("\u88AB\u7981\u8A00") || req.name.includes("\u88AB\u5C01\u7981") || req.name.includes("\u88AB\u4E3E\u62A5\u7684\u5E16\u5B50") || req.name.includes("\u53D1\u8D77\u4E3E\u62A5\u7684\u7528\u6237");
        const currentValueHtml = isNegativeIndicator ? `<span style="color: #ff6b6b;">${req.current}</span>` : req.current;
        html += `
                <div class="trust-level-item">
                    <span class="trust-level-name">${req.name}</span>
                    <div class="trust-level-progress">
                        <div class="trust-level-bar">
                            <div class="trust-level-bar-fill ${fillClass}" style="width: ${progress}%"></div>
                        </div>
                        <span class="trust-level-value">${currentValueHtml}/${req.required}</span>
                    </div>
                </div>
            `;
      });
      this.trustLevelContainer.innerHTML = html;
      setTimeout(() => {
        const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", () => this.loadUserTrustLevel(true));
        }
      }, 100);
    },
    renderAdvancedTrustLevel(username, targetLevel, requirements) {
      const achievedCount = requirements.filter((r) => r.isMet).length;
      const totalCount = requirements.length;
      const currentLevel = parseInt(targetLevel) - 1;
      const levelNames = {
        2: "Lv1 \u2192 Lv2",
        3: "Lv2 \u2192 Lv3",
        4: "Lv3 \u2192 Lv4"
      };
      const yesterdaySnapshot = this.getYesterdaySnapshot(username);
      const allRequirementsMet = achievedCount === totalCount;
      const headerTitle = allRequirementsMet ? `Lv${targetLevel} \u2713` : levelNames[targetLevel] || `Lv${currentLevel} \u2192 Lv${targetLevel}`;
      let html = `
            <div class="trust-level-header">
                <span>\u{1F4CA} ${headerTitle} (${username})</span>
                <button class="trust-level-refresh" data-action="refresh">\u{1F504} \u5237\u65B0</button>
            </div>
        `;
      requirements.forEach((req) => {
        const currentMatch = req.current.match(/(\d+)/);
        const requiredMatch = req.required.match(/(\d+)/);
        const currentNum = currentMatch ? parseInt(currentMatch[1]) : 0;
        const requiredNum = requiredMatch ? parseInt(requiredMatch[1]) : 1;
        const progress = Math.min(currentNum / requiredNum * 100, 100);
        const isCompleted = req.isMet;
        const fillClass = isCompleted ? "completed" : "";
        let simpleName = req.name.replace("\u5DF2\u8BFB\u5E16\u5B50\uFF08\u6240\u6709\u65F6\u95F4\uFF09", "\u5DF2\u8BFB\u5E16\u5B50").replace("\u6D4F\u89C8\u7684\u8BDD\u9898\uFF08\u6240\u6709\u65F6\u95F4\uFF09", "\u6D4F\u89C8\u8BDD\u9898").replace("\u8BBF\u95EE\u6B21\u6570\uFF08\u8FC7\u53BB", "\u8BBF\u95EE\u6B21\u6570(").replace("\u4E2A\u6708\uFF09", "\u6708)").replace("\u56DE\u590D\u6B21\u6570\uFF08\u6700\u8FD1", "\u56DE\u590D(\u8FD1").replace("\u5929\u5185\uFF09", "\u5929)");
        const diff = this.calculateDataChange(currentNum, yesterdaySnapshot, simpleName);
        const changeIndicator = this.generateChangeIndicator(diff);
        const isNegativeIndicator = req.name.includes("\u88AB\u7981\u8A00") || req.name.includes("\u88AB\u5C01\u7981") || req.name.includes("\u88AB\u4E3E\u62A5\u7684\u5E16\u5B50") || req.name.includes("\u53D1\u8D77\u4E3E\u62A5\u7684\u7528\u6237");
        const currentValueHtml = isNegativeIndicator ? `<span style="color: #ff6b6b;">${req.current}</span>` : req.current;
        html += `
                <div class="trust-level-item">
                    <span class="trust-level-name">${simpleName}</span>
                    <div class="trust-level-progress">
                        <div class="trust-level-bar">
                            <div class="trust-level-bar-fill ${fillClass}" style="width: ${progress}%"></div>
                        </div>
                        <span class="trust-level-value">${currentValueHtml}/${req.required}${changeIndicator}</span>
                    </div>
                </div>
            `;
      });
      if (achievedCount === totalCount) {
        html += `
                <div style="background: rgba(255, 255, 255, 0.25); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: #fff; font-size: 11px; font-weight: 600; text-align: center;">
                        \u2705 \u5DF2\u6EE1\u8DB3 Lv${targetLevel} \u8981\u6C42
                    </div>
                </div>
            `;
      } else {
        const unmetCount = totalCount - achievedCount;
        html += `
                <div style="background: rgba(255, 255, 255, 0.15); padding: 6px 8px; border-radius: 6px; margin: 6px 0 0 0;">
                    <div style="color: rgba(255, 255, 255, 0.9); font-size: 11px; font-weight: 500; text-align: center;">
                        \u8FD8\u9700\u5B8C\u6210 ${unmetCount} \u9879\u5347\u7EA7\u5230 Lv${targetLevel}
                    </div>
                </div>
            `;
      }
      this.trustLevelContainer.innerHTML = html;
      this.saveTrustLevelCache(username, {
        type: "high_level",
        username,
        targetLevel,
        currentLevel,
        requirements,
        achievedCount,
        totalCount
      });
      setTimeout(() => {
        const refreshBtn = this.trustLevelContainer.querySelector(".trust-level-refresh");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", () => this.loadUserTrustLevel(true));
        }
      }, 100);
    }
  };

  // src/controller/mixins/credit.js
  var methods12 = {
    async loadCreditInfo(isManualRefresh = false) {
      if (!this.creditContainer) return;
      if (!isManualRefresh && !this.shouldRefreshCreditInfo()) return;
      const now = Date.now();
      const MIN_INTERVAL = 30 * 60 * 1e3;
      const leaderboard429Until = Storage.get("leaderboard429Until", 0);
      if (leaderboard429Until > now) {
        const remainingMinutes = Math.ceil((leaderboard429Until - now) / 6e4);
        console.log(`[Credit] Leaderboard 429 \u51B7\u5374\u4E2D\uFF0C\u8FD8\u9700\u7B49\u5F85 ${remainingMinutes} \u5206\u949F`);
        const cachedData = Storage.get("creditCachedData", null);
        if (cachedData) {
          this.renderCreditInfo(cachedData.userData, cachedData.dailyStats, cachedData.leaderboardData);
          const footer = this.creditContainer.querySelector(".credit-footer");
          if (footer) {
            footer.innerHTML = `
                        <a href="https://credit.linux.do/home" target="_blank" class="credit-link">${this.t("creditViewDetails")}</a>
                        <span class="credit-update-time" style="color: #ff9999;">\u{1F525} \u51B7\u5374\u4E2D ${remainingMinutes}\u5206\u949F</span>
                    `;
          }
        } else {
          this.renderCreditError(`\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7B49\u5F85 ${remainingMinutes} \u5206\u949F\u540E\u518D\u8BD5`);
        }
        return;
      }
      const lastCreditFetch = Storage.get("lastCreditFetch", 0);
      if (!isManualRefresh && lastCreditFetch > 0 && now - lastCreditFetch < MIN_INTERVAL) {
        const cachedData = Storage.get("creditCachedData", null);
        if (cachedData) {
          console.log("[Credit] \u4F7F\u7528\u7F13\u5B58\u6570\u636E\uFF08\u672A\u5230\u5237\u65B0\u95F4\u9694\uFF09");
          this.renderCreditInfo(cachedData.userData, cachedData.dailyStats, cachedData.leaderboardData);
          return;
        }
      }
      if (isManualRefresh) {
        const refreshBtn = this.creditContainer.querySelector(".credit-refresh-btn");
        if (refreshBtn) {
          refreshBtn.textContent = refreshBtn.classList.contains("credit-auth-refresh") ? "\u2026" : this.t("refreshing");
          refreshBtn.setAttribute("aria-busy", "true");
          refreshBtn.disabled = true;
        }
      } else {
        this.creditContainer.innerHTML = `<div class="trust-level-loading">${this.t("loadingCredits")}</div>`;
      }
      try {
        const userData = await this.fetchCreditUserInfo();
        if (!userData) {
          this.renderCreditError(this.t("creditLoginRequired"), true);
          return;
        }
        const dailyStats = await this.fetchCreditDailyStats();
        const leaderboardData = await this.fetchLeaderboardData();
        Storage.set("creditCachedData", { userData, dailyStats, leaderboardData });
        Storage.set("lastCreditFetch", now);
        this.renderCreditInfo(userData, dailyStats, leaderboardData);
      } catch (error) {
        console.error("\u52A0\u8F7D Credit \u4FE1\u606F\u5931\u8D25:", error);
        this.renderCreditError("\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5");
      }
    },
    fetchCreditUserInfo() {
      return new Promise((resolve) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://credit.linux.do/api/v1/oauth/user-info",
          anonymous: false,
          timeout: 15e3,
          headers: {
            "Accept": "application/json",
            "Referer": "https://credit.linux.do/home",
            "Origin": "https://credit.linux.do"
          },
          onload: (response) => {
            console.log("[Credit] API \u54CD\u5E94\u72B6\u6001:", response.status);
            if (response.status === 200) {
              try {
                const json = JSON.parse(response.responseText);
                if (json && json.data) {
                  resolve(json.data);
                  return;
                }
              } catch (e) {
                console.error("Credit API \u89E3\u6790\u9519\u8BEF:", e);
              }
            } else if (response.status === 401 || response.status === 403) {
              console.log("[Credit] \u672A\u767B\u5F55\u6216\u65E0\u6743\u9650");
              resolve(null);
              return;
            }
            resolve(null);
          },
          onerror: (error) => {
            console.error("Credit API \u8BF7\u6C42\u9519\u8BEF:", error);
            resolve(null);
          },
          ontimeout: () => {
            console.error("Credit API \u8BF7\u6C42\u8D85\u65F6");
            resolve(null);
          }
        });
      });
    },
    fetchCreditDailyStats() {
      return new Promise((resolve) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://credit.linux.do/api/v1/dashboard/stats/daily?days=7",
          anonymous: false,
          timeout: 15e3,
          headers: {
            "Accept": "application/json",
            "Referer": "https://credit.linux.do/home",
            "Origin": "https://credit.linux.do"
          },
          onload: (response) => {
            if (response.status === 200) {
              try {
                const json = JSON.parse(response.responseText);
                if (json && json.data && Array.isArray(json.data)) {
                  resolve(json.data);
                  return;
                }
              } catch (e) {
                console.error("Credit \u6BCF\u65E5\u7EDF\u8BA1\u89E3\u6790\u9519\u8BEF:", e);
              }
            }
            resolve([]);
          },
          onerror: () => resolve([]),
          ontimeout: () => resolve([])
        });
      });
    },
    fetchLeaderboardData() {
      return new Promise((resolve) => {
        const now = Date.now();
        const leaderboard429Until = Storage.get("leaderboard429Until", 0);
        if (leaderboard429Until > now) {
          const remainMinutes = Math.ceil((leaderboard429Until - now) / 6e4);
          console.log(`[Leaderboard] 429 \u51B7\u5374\u671F\u4E2D\uFF0C\u5269\u4F59 ${remainMinutes} \u5206\u949F`);
          const cachedLeaderboard = Storage.get("cachedLeaderboardData", null);
          resolve(cachedLeaderboard);
          return;
        }
        let got429 = false;
        Promise.all([
          fetch("https://linux.do/leaderboard/1?period=daily", {
            credentials: "include",
            headers: { "Accept": "application/json" }
          }).then((r) => {
            if (r.status === 429) {
              got429 = true;
              return null;
            }
            return r.ok ? r.json() : null;
          }).catch(() => null),
          fetch("https://linux.do/leaderboard/1?period=all", {
            credentials: "include",
            headers: { "Accept": "application/json" }
          }).then((r) => {
            if (r.status === 429) {
              got429 = true;
              return null;
            }
            return r.ok ? r.json() : null;
          }).catch(() => null)
        ]).then(([dailyData, allTimeData]) => {
          if (got429) {
            const cooldownUntil = Date.now() + 30 * 60 * 1e3;
            Storage.set("leaderboard429Until", cooldownUntil);
            console.warn("[Leaderboard] \u68C0\u6D4B\u5230 429 \u9519\u8BEF\uFF0C\u5DF2\u8BBE\u7F6E 30 \u5206\u949F\u51B7\u5374\u671F");
          }
          let dailyScore = 0;
          let totalCredits = 0;
          let totalRank = 0;
          if (dailyData && dailyData.personal && dailyData.personal.user) {
            dailyScore = dailyData.personal.user.total_score || 0;
          }
          if (allTimeData && allTimeData.personal && allTimeData.personal.user) {
            totalCredits = allTimeData.personal.user.total_score || 0;
            totalRank = allTimeData.personal.position || allTimeData.personal.user.position || 0;
          }
          if (totalRank || totalCredits) {
            const result = {
              totalCredits,
              rank: totalRank,
              dailyScore
            };
            Storage.set("cachedLeaderboardData", result);
            resolve(result);
          } else {
            const cachedLeaderboard = Storage.get("cachedLeaderboardData", null);
            resolve(cachedLeaderboard);
          }
        }).catch((error) => {
          console.error("\u83B7\u53D6\u6392\u884C\u699C\u6570\u636E\u5931\u8D25:", error);
          resolve(null);
        });
      });
    },
    renderCreditInfo(userData, dailyStats, leaderboardData = null) {
      const credits = userData.available_balance || "0";
      const communityBalance = userData.community_balance || "0";
      const dailyLimit = userData.remain_quota || "0";
      const incomeTotal = userData.total_receive || "0";
      const expenseTotal = userData.total_payment || "0";
      const username = userData.nickname || userData.username || "User";
      let incomeList = [];
      let expenseList = [];
      if (dailyStats && dailyStats.length > 0) {
        dailyStats.forEach((item) => {
          const date = item.date.substring(5).replace("-", "/");
          const income = parseFloat(item.income) || 0;
          const expense = parseFloat(item.expense) || 0;
          if (income !== 0) {
            incomeList.push({
              date,
              amount: income > 0 ? "+" + income.toFixed(2) : income.toFixed(2),
              isNegative: income < 0
            });
          }
          if (expense > 0) expenseList.push({ date, amount: "-" + expense.toFixed(2) });
        });
        incomeList.reverse();
        expenseList.reverse();
      }
      const updateTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      let html = `
            <div class="trust-level-header">
                <span>\u{1F4B0} ${this.escapeHtml(username)} ${this.t("userCredits")}</span>
                <button class="trust-level-refresh credit-refresh-btn" data-action="refresh-credit">${this.t("refresh")}</button>
            </div>
            <div class="credit-main-stat">
                <span class="credit-stat-label">${this.t("creditAvailable")}</span>
                <span class="credit-stat-value">${this.escapeHtml(credits)}</span>
            </div>
        `;
      if (leaderboardData) {
        const tomorrowCredits = (leaderboardData.totalCredits - communityBalance).toFixed(0);
        html += `
            <div class="credit-main-stat credit-tomorrow-stat">
                <span class="credit-stat-label">${this.t("creditTomorrow")}</span>
                <span class="credit-stat-value">${this.escapeHtml(tomorrowCredits)}</span>
            </div>
            `;
      }
      html += `<div class="credit-summary-list">`;
      if (leaderboardData) {
        html += `
            <div class="trust-level-item">
                <span class="trust-level-name">${this.t("creditCurrentPoints")}</span>
                <span class="trust-level-value credit-value-gold">
                    <span>${this.escapeHtml(leaderboardData.totalCredits)}</span>
                    <span class="credit-rank-badge">${this.t("creditRankLabel")}#${this.escapeHtml(leaderboardData.rank)}</span>
                </span>
            </div>
            <div class="trust-level-item">
                <span class="trust-level-name">${this.t("creditYesterdayPoints")}</span>
                <span class="trust-level-value credit-value-green">${this.escapeHtml(communityBalance)}</span>
            </div>
            `;
      }
      html += `
            <div class="trust-level-item">
                <span class="trust-level-name">${this.t("creditDailyLimit")}</span>
                <span class="trust-level-value credit-value-blue">${this.escapeHtml(dailyLimit)}</span>
            </div>
            <div class="trust-level-item">
                <span class="trust-level-name">${this.t("creditTotalIncome")}</span>
                <span class="trust-level-value credit-value-green">+${this.escapeHtml(incomeTotal)}</span>
            </div>
            <div class="trust-level-item">
                <span class="trust-level-name">${this.t("creditTotalExpense")}</span>
                <span class="trust-level-value credit-value-red">-${this.escapeHtml(expenseTotal)}</span>
            </div>
        `;
      html += `</div>`;
      if (incomeList.length > 0) {
        html += `
                <div class="credit-history-section">
                    <div class="credit-section-title">${this.t("creditRecentIncome")}</div>
                    <div class="credit-history-list">
            `;
        incomeList.slice(0, 5).forEach((item) => {
          const note = item.isNegative ? " (\u793E\u533A\u70B9\u6570\u5012\u9000\u6263\u9664)" : "";
          html += `
                    <div class="trust-level-item">
                        <span class="trust-level-name">${this.escapeHtml(item.date)}${note}</span>
                        <span class="trust-level-value ${item.isNegative ? "credit-value-red" : "credit-value-green"}">${this.escapeHtml(item.amount)}</span>
                    </div>
                `;
        });
        html += `
                    </div>
                </div>
            `;
      }
      if (expenseList.length > 0) {
        html += `
                <div class="credit-history-section">
                    <div class="credit-section-title">${this.t("creditRecentExpense")}</div>
                    <div class="credit-history-list">
            `;
        expenseList.slice(0, 3).forEach((item) => {
          html += `
                    <div class="trust-level-item">
                        <span class="trust-level-name">${this.escapeHtml(item.date)}</span>
                        <span class="trust-level-value credit-value-red">${this.escapeHtml(item.amount)}</span>
                    </div>
                `;
        });
        html += `
                    </div>
                </div>
            `;
      }
      html += `
            <div class="credit-footer">
                <a href="https://credit.linux.do/home" target="_blank" class="credit-link">${this.t("creditViewDetails")}</a>
                <span class="credit-update-time">${this.t("update")}: ${this.escapeHtml(updateTime)}</span>
            </div>
        `;
      this.creditContainer.innerHTML = html;
      setTimeout(() => {
        const refreshBtn = this.creditContainer.querySelector(".credit-refresh-btn");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.loadCreditInfo(true);
          });
        }
      }, 100);
    },
    renderCreditError(message, showLogin = false) {
      if (showLogin) {
        const html = `
                <div class="credit-auth-state" role="status">
                    <div class="credit-auth-header">
                        <span class="credit-auth-status">
                            <span class="credit-auth-dot" aria-hidden="true"></span>
                            ${this.t("notLoggedIn")}
                        </span>
                    </div>
                    <p class="credit-auth-message">${this.t("creditLoginDescription")}</p>
                    <div class="credit-auth-actions">
                        <a href="https://credit.linux.do" target="_blank" rel="noopener noreferrer" class="credit-login-btn">
                            <span>${this.t("creditGoLogin")}</span>
                            <span class="credit-login-arrow" aria-hidden="true">\u2197</span>
                        </a>
                        <button type="button" class="trust-level-refresh credit-refresh-btn credit-auth-refresh" data-action="refresh-credit" title="\u91CD\u65B0\u68C0\u67E5\u767B\u5F55\u72B6\u6001" aria-label="\u91CD\u65B0\u68C0\u67E5\u767B\u5F55\u72B6\u6001">\u21BB</button>
                    </div>
                </div>
            `;
        this.creditContainer.innerHTML = html;
      } else {
        const html = `
                <div class="credit-auth-state" role="status">
                    <div class="credit-auth-header">
                        <span class="credit-auth-status">
                            <span class="credit-auth-dot" aria-hidden="true"></span>
                            ${this.t("sectionCredit")}
                        </span>
                        <button type="button" class="trust-level-refresh credit-refresh-btn" data-action="refresh-credit">${this.t("refresh")}</button>
                    </div>
                    <p class="credit-auth-message">${this.escapeHtml(message)}</p>
                </div>
            `;
        this.creditContainer.innerHTML = html;
      }
      setTimeout(() => {
        const refreshBtn = this.creditContainer.querySelector(".credit-refresh-btn");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.loadCreditInfo(true);
          });
        }
      }, 100);
    }
  };

  // src/controller/mixins/cdk.js
  var methods13 = {
    async loadCdkInfo(isManualRefresh = false) {
      if (!this.cdkContainer) return;
      if (!isManualRefresh && !this.shouldRefreshCdkInfo()) return;
      if (isManualRefresh) {
        const refreshBtn = this.cdkContainer.querySelector(".cdk-refresh-btn");
        if (refreshBtn) {
          refreshBtn.textContent = refreshBtn.classList.contains("cdk-panel-refresh") ? "\u2026" : this.t("refreshing");
          refreshBtn.setAttribute("aria-busy", "true");
          refreshBtn.disabled = true;
        }
      } else {
        this.cdkContainer.innerHTML = `<div class="trust-level-loading">${this.t("loadingCdk")}</div>`;
      }
      try {
        const cdkData = await this.fetchCdkUserInfo();
        if (!cdkData) {
          this.renderCdkError(this.t("cdkNotAuth"), true);
          return;
        }
        this.renderCdkInfo(cdkData);
      } catch (error) {
        console.error("\u52A0\u8F7D CDK \u4FE1\u606F\u5931\u8D25:", error);
        this.renderCdkError(this.t("loadFailed"));
      }
    },
    ensureCdkBridge() {
      if (this.cdkBridgeInit) return;
      this.cdkBridgeInit = true;
      this.cdkWaiters = [];
      window.addEventListener("message", (event) => {
        if (event.origin !== "https://cdk.linux.do") return;
        const payload = event.data?.payload || event.data;
        if (!payload?.data) return;
        console.log("[CDK] \u6536\u5230 Bridge \u6570\u636E:", payload.data);
        GM_setValue("lda_cdk_cache", { data: payload.data, ts: Date.now() });
        const waiters = [...this.cdkWaiters];
        this.cdkWaiters = [];
        waiters.forEach((fn) => fn(payload.data));
      });
      const iframe = document.createElement("iframe");
      iframe.id = "lda-cdk-bridge";
      iframe.src = "https://cdk.linux.do/dashboard";
      iframe.style.cssText = "width:0;height:0;opacity:0;position:absolute;border:0;pointer-events:none;";
      document.body.appendChild(iframe);
      this.cdkBridgeFrame = iframe;
    },
    fetchCdkViaBridge() {
      return new Promise((resolve, reject) => {
        this.ensureCdkBridge();
        const timer = setTimeout(() => {
          this.cdkWaiters = this.cdkWaiters.filter((fn) => fn !== done);
          reject(new Error("CDK bridge timeout"));
        }, 8e3);
        const done = (data) => {
          clearTimeout(timer);
          resolve(data);
        };
        this.cdkWaiters.push(done);
        try {
          this.cdkBridgeFrame?.contentWindow?.postMessage({ type: "lda-cdk-request" }, "https://cdk.linux.do");
        } catch (_) {
        }
      });
    },
    async fetchCdkUserInfo() {
      const cache = GM_getValue("lda_cdk_cache", null);
      if (cache && cache.data && cache.ts && Date.now() - cache.ts < 5 * 60 * 1e3) {
        console.log("[CDK] \u4F7F\u7528 GM \u7F13\u5B58\u6570\u636E");
        return cache.data;
      }
      try {
        const directResult = await this.fetchCdkDirect();
        if (directResult) {
          console.log("[CDK] \u76F4\u63A5\u8BF7\u6C42\u6210\u529F");
          const cacheData = { user: directResult, received: null };
          GM_setValue("lda_cdk_cache", { data: cacheData, ts: Date.now() });
          return cacheData;
        }
      } catch (e) {
        console.log("[CDK] \u76F4\u63A5\u8BF7\u6C42\u5931\u8D25\uFF0C\u5C1D\u8BD5 Bridge \u65B9\u5F0F:", e.message);
      }
      try {
        const bridgeResult = await this.fetchCdkViaBridge();
        if (bridgeResult) {
          console.log("[CDK] Bridge \u8BF7\u6C42\u6210\u529F");
          return bridgeResult;
        }
      } catch (e) {
        console.log("[CDK] Bridge \u8BF7\u6C42\u5931\u8D25:", e.message);
      }
      if (cache && cache.data) {
        console.log("[CDK] \u4F7F\u7528\u65E7\u7F13\u5B58\u6570\u636E");
        return cache.data;
      }
      return null;
    },
    fetchCdkDirect() {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://cdk.linux.do/api/v1/oauth/user-info",
          anonymous: false,
          timeout: 1e4,
          headers: {
            "Accept": "application/json",
            "Cache-Control": "no-cache"
          },
          onload: (response) => {
            if (response.responseText && response.responseText.includes("Just a moment")) {
              reject(new Error("Cloudflare challenge"));
              return;
            }
            if (response.status === 401 || response.status === 403) {
              resolve(null);
              return;
            }
            if (response.status >= 200 && response.status < 300) {
              try {
                const json = JSON.parse(response.responseText);
                if (json && json.data) {
                  resolve(json.data);
                  return;
                }
                if (json && (json.username || json.score !== void 0)) {
                  resolve(json);
                  return;
                }
              } catch (e) {
                reject(new Error("JSON parse error"));
                return;
              }
            }
            resolve(null);
          },
          onerror: (error) => {
            reject(error);
          },
          ontimeout: () => {
            reject(new Error("\u8BF7\u6C42\u8D85\u65F6"));
          }
        });
      });
    },
    fetchCdkReceived() {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url: "https://cdk.linux.do/api/v1/projects/received?current=1&size=20&search=",
          anonymous: false,
          withCredentials: true,
          timeout: 15e3,
          headers: {
            "Accept": "application/json",
            "Cache-Control": "no-cache",
            "Referer": "https://cdk.linux.do/received"
          },
          onload: (response) => {
            console.log("[CDK] \u9886\u53D6\u8BB0\u5F55\u54CD\u5E94\u72B6\u6001:", response.status);
            if (response.responseText && response.responseText.includes("Just a moment")) {
              console.log("[CDK] \u9886\u53D6\u8BB0\u5F55\u88AB Cloudflare \u62E6\u622A");
              resolve({ total: 0, results: [], cloudflareBlocked: true });
              return;
            }
            if (response.status >= 200 && response.status < 300) {
              try {
                const json = JSON.parse(response.responseText);
                console.log("[CDK] \u9886\u53D6\u8BB0\u5F55\u89E3\u6790\u6210\u529F:", json);
                if (json && json.data) {
                  resolve({
                    total: json.data.total || 0,
                    results: json.data.results || []
                  });
                  return;
                }
                if (json && json.error_msg === "") {
                  resolve({ total: 0, results: [] });
                  return;
                }
              } catch (e) {
                console.error("[CDK] \u89E3\u6790\u9886\u53D6\u8BB0\u5F55\u5931\u8D25:", e, response.responseText?.substring(0, 200));
              }
            } else {
              console.error("[CDK] \u9886\u53D6\u8BB0\u5F55\u8BF7\u6C42\u5931\u8D25\uFF0C\u72B6\u6001\u7801:", response.status);
            }
            resolve({ total: 0, results: [] });
          },
          onerror: (error) => {
            console.error("[CDK] \u83B7\u53D6\u9886\u53D6\u8BB0\u5F55\u5931\u8D25:", error);
            resolve({ total: 0, results: [] });
          },
          ontimeout: () => {
            console.error("[CDK] \u83B7\u53D6\u9886\u53D6\u8BB0\u5F55\u8D85\u65F6");
            resolve({ total: 0, results: [] });
          }
        });
      });
    },
    renderCdkInfo(cdkData) {
      const userData = cdkData.user || cdkData;
      const receivedData = cdkData.received || null;
      const score = userData.score || 0;
      const trustLevel = userData.trust_level ?? userData.trustLevel ?? "-";
      const username = userData.username || "-";
      const nickname = userData.nickname || userData.name || username;
      const displayNickname = nickname || username || "-";
      const showUsername = username && username !== displayNickname && username !== "-";
      const updateTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      let html = `
            <div class="cdk-panel-header">
                <span class="cdk-panel-title">${this.t("cdkOverview")}</span>
                <button type="button" class="trust-level-refresh cdk-refresh-btn cdk-panel-refresh" data-action="refresh-cdk" title="${this.t("cdkRefreshTip")}" aria-label="${this.t("cdkRefreshTip")}">\u21BB</button>
            </div>
            <div class="cdk-score-card">
                <span class="credit-stat-label">${this.t("cdkScore")}</span>
                <span class="cdk-score-value">${this.escapeHtml(score)}</span>
            </div>
            <div class="cdk-account-section">
                <div class="cdk-section-heading">${this.t("cdkAccountInfo")}</div>
                <div class="cdk-account-list">
                    <div class="cdk-account-item">
                        <span class="cdk-account-label">${this.t("cdkTrustLevel")}</span>
                        <span class="cdk-account-value cdk-trust-level-value">Lv${this.escapeHtml(trustLevel)}</span>
                    </div>
                    <div class="cdk-account-item">
                        <span class="cdk-account-label">${this.t("cdkNickname")}</span>
                        <span class="cdk-account-value cdk-account-name-value">
                            <span class="cdk-account-name">${this.escapeHtml(displayNickname)}</span>
                            ${showUsername ? `<span class="cdk-account-username">@${this.escapeHtml(username)}</span>` : ""}
                        </span>
                    </div>
                </div>
            </div>
            <div class="cdk-score-description">
                \u{1F4A1} ${this.t("cdkScoreDesc")}
            </div>
            <div class="cdk-received-section">
                <div class="cdk-received-header">
                    <span class="cdk-received-title">\u{1F4E6} ${this.t("cdkMyReceived")} <span class="cdk-received-limit">(${this.t("cdkRecentLimit")})</span></span>
                    <button type="button" class="trust-level-refresh cdk-received-refresh-btn" title="${this.t("cdkReceivedRefreshTip")}" aria-label="${this.t("cdkReceivedRefreshTip")}">\u21BB</button>
                </div>
                <div id="cdk-received-list" class="cdk-received-list">
                    ${this.t("cdkLoadingReceived")}
                </div>
            </div>
            <div class="credit-footer cdk-footer">
                <a href="https://cdk.linux.do/dashboard" target="_blank" class="credit-link">${this.t("detailInfo")}</a>
                <span class="credit-update-time">${this.t("update")}: ${this.escapeHtml(updateTime)}</span>
            </div>
        `;
      this.cdkContainer.innerHTML = html;
      setTimeout(() => {
        const refreshBtn = this.cdkContainer.querySelector(".cdk-refresh-btn");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.loadCdkInfo(true);
          });
        }
        const receivedRefreshBtn = this.cdkContainer.querySelector(".cdk-received-refresh-btn");
        if (receivedRefreshBtn) {
          receivedRefreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.loadCdkReceived();
          });
        }
      }, 100);
      if (receivedData) {
        console.log("[CDK] \u4F7F\u7528\u7F13\u5B58\u7684\u9886\u53D6\u8BB0\u5F55");
        this.renderCdkReceived(receivedData);
      } else {
        console.log("[CDK] \u9886\u53D6\u8BB0\u5F55\u672A\u7F13\u5B58\uFF0C\u5C1D\u8BD5\u52A0\u8F7D");
        this.loadCdkReceived();
      }
    },
    async loadCdkReceived() {
      const listContainer = document.getElementById("cdk-received-list");
      if (!listContainer) return;
      listContainer.innerHTML = `<div class="cdk-received-loading">${this.t("cdkLoadingReceived")}</div>`;
      try {
        const cache = GM_getValue("lda_cdk_cache", null);
        if (cache && cache.data && cache.data.received && cache.ts && Date.now() - cache.ts < 5 * 60 * 1e3) {
          console.log("[CDK] \u4F7F\u7528\u7F13\u5B58\u7684\u9886\u53D6\u8BB0\u5F55");
          this.renderCdkReceived(cache.data.received);
          return;
        }
        try {
          const bridgeResult = await this.fetchCdkViaBridge();
          if (bridgeResult && bridgeResult.received) {
            console.log("[CDK] \u901A\u8FC7 Bridge \u83B7\u53D6\u5230\u9886\u53D6\u8BB0\u5F55");
            this.renderCdkReceived(bridgeResult.received);
            return;
          }
        } catch (e) {
          console.log("[CDK] Bridge \u83B7\u53D6\u9886\u53D6\u8BB0\u5F55\u5931\u8D25:", e.message);
        }
        const data = await this.fetchCdkReceived();
        if (data.cloudflareBlocked) {
          listContainer.innerHTML = `<div class="cdk-received-empty">
                    ${this.t("cdkReceivedEmpty")}<br>
                    <span class="cdk-received-extra-tip">\u{1F4A1} \u8BF7\u5148\u8BBF\u95EE cdk.linux.do \u5237\u65B0\u6570\u636E</span>
                </div>`;
          return;
        }
        this.renderCdkReceived(data);
      } catch (e) {
        console.error("[CDK] \u52A0\u8F7D\u9886\u53D6\u8BB0\u5F55\u5931\u8D25:", e);
        listContainer.innerHTML = `<div class="cdk-received-empty">${this.t("cdkReceivedEmpty")}</div>`;
      }
    },
    renderCdkReceived(data) {
      const listContainer = document.getElementById("cdk-received-list");
      if (!listContainer) return;
      const { total, results } = data;
      if (!results || results.length === 0) {
        listContainer.innerHTML = `<div class="cdk-received-empty">${this.t("cdkReceivedEmpty")}</div>`;
        return;
      }
      const displayResults = results.slice(0, 20);
      const displayCount = Math.min(total, 20);
      const totalText = this.t("cdkTotal").replace("{count}", displayCount);
      let html = `
            <div class="cdk-received-total">${totalText}</div>
            <div class="cdk-received-items">
        `;
      displayResults.forEach((item, index) => {
        const projectName = this.escapeHtml(item.project_name || "-");
        const creator = this.escapeHtml(item.project_creator_nickname || item.project_creator || "-");
        const content = this.escapeHtml(item.content || "-");
        const receivedAt = item.received_at ? new Date(item.received_at).toLocaleString("zh-CN", {
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }) : "-";
        html += `
                <div class="cdk-received-item">
                    <div class="cdk-received-item-header">
                        <span class="cdk-project-name">${projectName}</span>
                        <span class="cdk-received-time">${receivedAt}</span>
                    </div>
                    <div class="cdk-received-creator">
                        ${this.t("cdkCreator")}: ${creator}
                    </div>
                    <div class="cdk-content-row">
                        <code class="cdk-content">${content}</code>
                        <button type="button" class="cdk-copy-btn" data-content="${content}" title="${this.t("cdkCopy")}" aria-label="${this.t("cdkCopy")}">\u29C9</button>
                    </div>
                </div>
            `;
      });
      html += "</div>";
      listContainer.innerHTML = html;
      const copyBtns = listContainer.querySelectorAll(".cdk-copy-btn");
      copyBtns.forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          const content = btn.getAttribute("data-content");
          try {
            await navigator.clipboard.writeText(content);
            const originalText = btn.textContent;
            const originalTitle = btn.getAttribute("title") || this.t("cdkCopy");
            btn.textContent = "\u2713";
            btn.classList.add("copied");
            btn.setAttribute("title", this.t("cdkCopied"));
            btn.setAttribute("aria-label", this.t("cdkCopied"));
            setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.remove("copied");
              btn.setAttribute("title", originalTitle);
              btn.setAttribute("aria-label", originalTitle);
            }, 1500);
          } catch (err) {
            console.error("[CDK] \u590D\u5236\u5931\u8D25:", err);
          }
        });
      });
    },
    renderCdkError(message, showLogin = false) {
      let html = `
            <div class="cdk-panel-header">
                <span class="cdk-panel-title">${this.t("cdkOverview")}</span>
                <button type="button" class="trust-level-refresh cdk-refresh-btn cdk-panel-refresh" data-action="refresh-cdk" title="${this.t("cdkRefreshTip")}" aria-label="${this.t("cdkRefreshTip")}">\u21BB</button>
            </div>
            <div class="cdk-auth-state" role="status">
                <span class="cdk-auth-status">
                    <span class="cdk-auth-dot" aria-hidden="true"></span>
                    ${showLogin ? this.t("cdkNotAuth") : this.t("cdkScore")}
                </span>
                <p class="cdk-auth-message">${this.escapeHtml(showLogin ? this.t("cdkAuthTip") : message)}</p>
        `;
      if (showLogin) {
        html += `
                <div class="cdk-auth-actions">
                    <a href="https://cdk.linux.do" target="_blank" rel="noopener noreferrer" class="credit-login-btn">
                        <span>${this.t("cdkGoAuth")}</span>
                        <span class="credit-login-arrow" aria-hidden="true">\u2197</span>
                    </a>
                </div>
            `;
      }
      html += "</div>";
      this.cdkContainer.innerHTML = html;
      setTimeout(() => {
        const refreshBtn = this.cdkContainer.querySelector(".cdk-refresh-btn");
        if (refreshBtn) {
          refreshBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.loadCdkInfo(true);
          });
        }
      }, 100);
    },
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = String(text);
      return div.innerHTML;
    }
  };

  // src/controller/browse-controller.js
  var globalLikeCounter = null;
  var BrowseController = class {
    constructor() {
      __publicField(this, "CF_BYPASS_CONFIG", {
        ERROR_TEXTS: [
          "403 error",
          "\u8BE5\u56DE\u5E94\u662F\u5F88\u4E45\u4EE5\u524D\u521B\u5EFA\u7684",
          "reaction was created too long ago",
          "\u6211\u4EEC\u65E0\u6CD5\u52A0\u8F7D\u8BE5\u8BDD\u9898",
          "You are not allowed to react"
        ],
        DIALOG_SELECTOR: ".dialog-body",
        CHALLENGE_PATH: "/challenge",
        NOT_FOUND_REDIRECT_GUARD_KEY: "linux_do_auto_challenge_nf_guard",
        NOT_FOUND_REDIRECT_GUARD_MS: 5e3,
        REDIRECT_DELAY_MS: 120
      });
      this.isScrolling = false;
      this.trustLevelMonitorInterval = null;
      this.navigationTimeout = null;
      this.navigationGuardInterval = null;
      this.texts = {
        panelTitle: "Linux.do \u52A9\u624B",
        sectionAutoRead: "\u26A1 \u81EA\u52A8\u9605\u8BFB",
        sectionAccountData: "\u{1F464} \u8D26\u53F7\u4E0E\u6570\u636E",
        sectionAccountInfo: "\u{1F4CB} \u8D26\u53F7\u4FE1\u606F",
        sectionCredit: "\u{1F48E} Credit \u79EF\u5206",
        sectionRanking: "\u{1F3C5} \u6392\u884C\u699C",
        sectionPluginSettings: "\u2699\uFE0F \u63D2\u4EF6\u8BBE\u7F6E",
        startReading: "\u5F00\u59CB\u9605\u8BFB",
        stopReading: "\u505C\u6B62\u9605\u8BFB",
        refresh: "\u{1F504} \u5237\u65B0",
        refreshing: "\u5237\u65B0\u4E2D...",
        detailInfo: "\u{1F4CA} \u8BE6\u7EC6\u4FE1\u606F \u2192",
        smartLike: "\u2764\uFE0F \u667A\u80FD\u70B9\u8D5E",
        smartLikeSpeed: "\u70B9\u8D5E\u901F\u5EA6",
        smartLikeSpeedSlow: "\u6162\u901F",
        smartLikeSpeedNormal: "\u6B63\u5E38",
        smartLikeSpeedFast: "\u5FEB\u901F",
        cleanMode: "\u{1F31F} \u6E05\u723D\u6A21\u5F0F",
        grayscaleMode: "\u{1F3A8} \u9ED1\u767D\u7070\u6A21\u5F0F",
        readUnread: "\u{1F4EC} \u8BFB\u53D6\u672A\u8BFB",
        myRanking: "\u6211\u7684\u6392\u540D",
        dailyRank: "\u65E5\u699C",
        weeklyRank: "\u5468\u699C",
        monthlyRank: "\u6708\u699C",
        quarterlyRank: "\u5B63\u699C",
        yearlyRank: "\u5E74\u699C",
        allTimeRank: "\u603B\u699C",
        points: "\u5206",
        modeSettingsLabel: "\u6A21\u5F0F\u8BBE\u7F6E",
        readParameterSettingsLabel: "\u{1F39B}\uFE0F \u9605\u8BFB\u53C2\u6570",
        userCredits: "\u7684\u79EF\u5206",
        loading: "\u52A0\u8F7D\u4E2D...",
        loadingRank: "\u52A0\u8F7D\u6392\u540D\u6570\u636E...",
        loadingCredits: "\u52A0\u8F7D\u79EF\u5206...",
        loadingLevel: "\u52A0\u8F7D\u7B49\u7EA7\u4FE1\u606F...",
        clickToLoad: "\u70B9\u51FB\u5C55\u5F00\u52A0\u8F7D...",
        clickToLoadRank: "\u70B9\u51FB\u5C55\u5F00\u52A0\u8F7D\u6392\u540D...",
        clickToLoadCredits: "\u70B9\u51FB\u5C55\u5F00\u52A0\u8F7D\u79EF\u5206...",
        loadFailed: "\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u70B9\u51FB\u5237\u65B0\u91CD\u8BD5",
        notLoggedIn: "\u672A\u767B\u5F55",
        notSupported: "\u5F53\u524D\u7AD9\u70B9\u4E0D\u652F\u6301\u6B64\u529F\u80FD",
        update: "\u66F4\u65B0",
        remaining: "\u5269\u4F59",
        hours: "\u5C0F\u65F6",
        minutes: "\u5206",
        seconds: "\u79D2",
        ipRateLimited: "\u{1F6AB} IP \u88AB\u9650\u6D41\uFF0C\u81EA\u52A8\u9605\u8BFB\u5DF2\u6682\u505C",
        ipRateLimitWait: "\u5C06\u5728 30 \u5206\u949F\u540E\u81EA\u52A8\u6062\u590D",
        ipRateLimitResume: "\u2705 IP \u9650\u6D41\u5DF2\u89E3\u9664\uFF0C\u6062\u590D\u81EA\u52A8\u9605\u8BFB",
        ipRateLimitDetected: "\u68C0\u6D4B\u5230 IP \u9650\u6D41",
        loadingComplete: "\u52A0\u8F7D\u5B8C\u6210",
        loadingFailed: "\u52A0\u8F7D\u5931\u8D25",
        noUnreadPosts: "\u{1F4ED} \u6CA1\u6709\u672A\u8BFB\u5E16\u5B50\uFF0C\u5C06\u5207\u6362\u5230\u6700\u65B0\u5E16\u5B50",
        creditAvailable: "\u53EF\u7528\u79EF\u5206",
        creditTomorrow: "\u{1F31F} \u660E\u65E5\u79EF\u5206",
        creditTodayRank: "\u{1F4CA} \u4ECA\u65E5\u6392\u540D",
        creditCurrentPoints: "\u{1F4C8} \u5F53\u524D\u70B9\u6570",
        creditYesterdayPoints: "\u{1F4C5} \u6628\u65E5\u70B9\u6570",
        creditRankLabel: "\u6392\u540D",
        creditCommunityBalance: "\u793E\u533A\u79EF\u5206",
        creditDailyLimit: "\u4ECA\u65E5\u5269\u4F59\u989D\u5EA6",
        creditTotalIncome: "\u603B\u6536\u5165",
        creditTotalExpense: "\u603B\u652F\u51FA",
        creditRecentIncome: "\u8FD17\u5929\u6536\u5165",
        creditRecentExpense: "\u8FD17\u5929\u652F\u51FA",
        creditViewDetails: "\u67E5\u770B\u8BE6\u60C5 \u2192",
        creditLoginRequired: "\u8BF7\u5148\u767B\u5F55 credit.linux.do",
        creditLoginDescription: "\u767B\u5F55 credit.linux.do \u540E\u67E5\u770B\u79EF\u5206\u4E0E\u8D26\u6237\u6570\u636E",
        creditGoLogin: "\u53BB\u767B\u5F55",
        restStart: "\u5F00\u59CB\u4F11\u606F",
        restEnd: "\u4F11\u606F\u7ED3\u675F\uFF0C\u7EE7\u7EED\u6D4F\u89C8",
        likeLimitReached: "\u70B9\u8D5E\u5DF2\u8FBE\u4E0A\u9650\uFF0C\u5C06\u5728 ",
        likeCoolingDown: "\u70B9\u8D5E\u529F\u80FD\u51B7\u5374\u4E2D",
        likeRemaining: "\u5269\u4F59\u70B9\u8D5E",
        likeUsed: "\u5DF2\u7528",
        likeCooldown: "\u51B7\u5374\u4E2D",
        likeClearCooldown: "\u6E05\u9664\u51B7\u5374",
        likeClearCooldownTip: "\u4EC5\u6E05\u9664\u811A\u672C\u672C\u5730\u51B7\u5374\u8BB0\u5F55",
        likeCooldownCleared: "\u672C\u5730\u51B7\u5374\u5DF2\u6E05\u9664\uFF1B\u670D\u52A1\u5668\u4ECD\u9650\u6D41\u65F6\u4F1A\u518D\u6B21\u8FDB\u5165\u51B7\u5374",
        likeCooldownClearFailed: "\u6E05\u9664\u70B9\u8D5E\u51B7\u5374\u5931\u8D25",
        likeCountMismatch: "\u8BA1\u6570\u53EF\u80FD\u4E0D\u51C6\u786E\uFF0C\u70B9\u51FB\u540C\u6B65",
        likeSyncing: "\u540C\u6B65\u4E2D...",
        likeSyncSuccess: "\u540C\u6B65\u6210\u529F",
        randomOrder: "\u{1F500} \u968F\u673A\u9605\u8BFB",
        randomOrderTip: "\u6253\u4E71\u5E16\u5B50\u987A\u5E8F\uFF0C\u968F\u673A\u9605\u8BFB",
        skipRead: "\u23ED\uFE0F \u8DF3\u8FC7\u5DF2\u8BFB",
        skipReadTip: "\u81EA\u52A8\u8DF3\u8FC7\u5DF2\u7ECF\u9605\u8BFB\u8FC7\u7684\u5E16\u5B50",
        fullTopicRead: "\u{1F4DC} \u5B8C\u6574\u9605\u8BFB",
        fullTopicReadTip: "\u4ECE\u5E16\u5B50\u5F00\u5934\u5F00\u59CB\uFF0C\u6EDA\u52A8\u5230\u9875\u9762\u5E95\u90E8\u540E\u518D\u5207\u6362\u4E0B\u4E00\u7BC7",
        topicLimit: "\u{1F4DA} \u83B7\u53D6\u6570\u91CF",
        topicLimitTip: "\u6BCF\u6B21\u83B7\u53D6\u7684\u5E16\u5B50\u6570\u91CF",
        restTimeLabel: "\u23F8\uFE0F \u4F11\u606F\u65F6\u95F4",
        restTimeTip: "\u8FDE\u7EED\u9605\u8BFB1\u5C0F\u65F6\u540E\u4F11\u606F\u7684\u65F6\u95F4\uFF08\u5206\u949F\uFF09",
        stopAfterRead: "\u{1F6D1} \u9605\u8BFB\u9650\u5236",
        stopAfterReadTip: "\u9605\u8BFB\u6307\u5B9A\u6570\u91CF\u5E16\u5B50\u540E\u81EA\u52A8\u505C\u6B62",
        stopAfterReadCount: "\u{1F4D6} \u9605\u8BFB\u6570\u91CF",
        stopAfterReadCountTip: "\u9605\u8BFB\u591A\u5C11\u5E16\u5B50\u540E\u505C\u6B62",
        stopOnLikeLimit: "\u2764\uFE0F \u70B9\u8D5E\u505C\u6B62",
        stopOnLikeLimitTip: "\u70B9\u8D5E\u8FBE\u5230\u4E0A\u9650\u540E\u81EA\u52A8\u505C\u6B62\u9605\u8BFB",
        stoppedByReadLimit: "\u2705 \u5DF2\u8FBE\u5230\u9605\u8BFB\u6570\u91CF\u9650\u5236\uFF0C\u81EA\u52A8\u505C\u6B62",
        stoppedByLikeLimit: "\u2764\uFE0F \u70B9\u8D5E\u5DF2\u8FBE\u4E0A\u9650\uFF0C\u81EA\u52A8\u505C\u6B62\u9605\u8BFB",
        stoppedByServerBusy: "\u26A0\uFE0F \u68C0\u6D4B\u5230 502\uFF0C\u5DF2\u505C\u6B62\u81EA\u52A8\u9605\u8BFB\uFF0C\u907F\u514D\u8D1F\u8F7D\u8FC7\u9AD8",
        stoppedByPageLoading: "\u26A0\uFE0F \u9875\u9762\u52A0\u8F7D\u8D85\u65F6\uFF0C\u5DF2\u505C\u6B62\u81EA\u52A8\u9605\u8BFB\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",
        sessionReadCount: "\u672C\u6B21\u5DF2\u8BFB",
        fetchingTopics: "\u{1F4E5} \u83B7\u53D6\u5E16\u5B50\u4E2D...",
        fetchProgress: "\u83B7\u53D6\u8FDB\u5EA6",
        totalFetched: "\u5DF2\u83B7\u53D6",
        skippedRead: "\u8DF3\u8FC7\u5DF2\u8BFB",
        unreadTopics: "\u672A\u8BFB\u5E16\u5B50",
        latestTopics: "\u6700\u65B0\u5E16\u5B50",
        topicsReady: "\u5E16\u5B50\u5DF2\u5C31\u7EEA",
        currentReading: "\u{1F4D6} \u5F53\u524D\u9605\u8BFB",
        remainingTopics: "\u5269\u4F59\u5E16\u5B50",
        todayRead: "\u4ECA\u65E5\u9605\u8BFB",
        totalRead: "\u603B\u9605\u8BFB",
        pageRange: "\u9875\u7801\u8303\u56F4",
        startFromPage: "\u4ECE\u7B2C",
        pageUnit: "\u9875",
        continueFetching: "\u7EED\u8BFB\u4E2D",
        sectionCdk: "\u{1F3AE} CDK \u5206\u6570",
        cdkScore: "CDK \u5206\u6570",
        cdkTrustLevel: "\u4FE1\u4EFB\u7B49\u7EA7",
        cdkUsername: "\u7528\u6237\u540D",
        cdkNickname: "\u6635\u79F0",
        cdkAccountInfo: "\u8D26\u6237\u4FE1\u606F",
        cdkOverview: "\u8D26\u6237\u6982\u89C8",
        cdkRefreshTip: "\u5237\u65B0 CDK \u6570\u636E",
        cdkReceivedRefreshTip: "\u5237\u65B0\u9886\u53D6\u8BB0\u5F55",
        cdkNotAuth: "\u5C1A\u672A\u767B\u5F55 CDK",
        cdkAuthTip: "\u9700\u5148\u5B8C\u6210\u6388\u6743\u624D\u80FD\u67E5\u770B\u793E\u533A\u5206\u6570",
        cdkGoAuth: "\u524D\u5F80\u767B\u5F55",
        cdkScoreDesc: "\u57FA\u4E8E\u5FBD\u7AE0\u8BA1\u7B97\u7684\u793E\u533A\u4FE1\u8A89\u5206",
        cdkMyReceived: "\u6211\u7684\u9886\u53D6",
        cdkReceivedEmpty: "\u6682\u65E0\u9886\u53D6\u8BB0\u5F55",
        cdkProjectName: "\u9879\u76EE",
        cdkCreator: "\u53D1\u5E03\u8005",
        cdkContent: "\u5185\u5BB9",
        cdkReceivedAt: "\u9886\u53D6\u65F6\u95F4",
        cdkCopy: "\u590D\u5236",
        cdkCopied: "\u5DF2\u590D\u5236",
        cdkTotal: "\u5171 {count} \u6761",
        cdkLoadingReceived: "\u52A0\u8F7D\u9886\u53D6\u8BB0\u5F55...",
        loadingCdk: "\u52A0\u8F7D CDK \u6570\u636E...",
        clickToLoadCdk: "\u70B9\u51FB\u5C55\u5F00\u52A0\u8F7D CDK \u5206\u6570...",
        cdkRecentLimit: "\u6700\u8FD120\u6761",
        topicCreatedTimeLabel: "\u23F0 \u521B\u5EFA\u65F6\u95F4\u6807\u7B7E",
        topicCreatedTimeVisible: "\u{1F441}\uFE0F \u663E\u793A\u521B\u5EFA\u65F6\u95F4",
        topicCreatedTimeVisibleTip: "\u5F00\u542F\u663E\u793A/\u5173\u95ED\u9690\u85CF\u5E16\u5B50\u521B\u5EFA\u65F6\u95F4\u6807\u7B7E",
        topicCreatedTimeEnabled: "\u521B\u5EFA\u65F6\u95F4\u6807\u7B7E\u5DF2\u663E\u793A",
        topicCreatedTimeDisabled: "\u521B\u5EFA\u65F6\u95F4\u6807\u7B7E\u5DF2\u9690\u85CF",
        topicAgeColorLabel: "\u{1F3AF} \u5E16\u9F84\u9AD8\u4EAE",
        topicAgeColorTip: "\u63A7\u5236\u521B\u5EFA\u65F6\u95F4\u6807\u7B7E\u662F\u5426\u6309\u5E16\u9F84\u7740\u8272",
        topicAgeColorEnabled: "\u5E16\u9F84\u9AD8\u4EAE\u5DF2\u542F\u7528",
        topicAgeColorDisabled: "\u5E16\u9F84\u9AD8\u4EAE\u5DF2\u7981\u7528",
        cfBypassLabel: "\u{1F6E1}\uFE0F CF 5\u79D2\u76FE",
        cfBypassTip: "\u68C0\u6D4B\u5230 Cloudflare \u9A8C\u8BC1\u5931\u8D25\u65F6\u81EA\u52A8\u6253\u5F00\u9A8C\u8BC1\u9875",
        cfBypassEnabled: "CF 5\u79D2\u76FE\u81EA\u52A8\u8DF3\u8F6C\u5DF2\u542F\u7528",
        cfBypassDisabled: "CF 5\u79D2\u76FE\u81EA\u52A8\u8DF3\u8F6C\u5DF2\u7981\u7528",
        cfBypassDetected: "\u{1F6E1}\uFE0F \u68C0\u6D4B\u5230 CF \u9A8C\u8BC1\u5931\u8D25\uFF0C\u6B63\u5728\u8DF3\u8F6C...",
        cfBypassManual: "\u624B\u52A8\u89E6\u53D1CF\u9A8C\u8BC1",
        cfBypassManualTip: "\u624B\u52A8\u8DF3\u8F6C\u5230 CloudFlare challenge \u9875\u9762",
        cfBypassRedirecting: "\u6B63\u5728\u8DF3\u8F6C\u5230 Cloudflare Challenge \u9875\u9762...",
        cfBypassAlreadyOnChallenge: "\u5DF2\u5728 Challenge \u9875\u9762\uFF0C\u65E0\u9700\u8DF3\u8F6C",
        cfBypassNotFoundRedirecting: "Challenge \u9875\u9762\u65E0\u6548\uFF0C\u6B63\u5728\u8FD4\u56DE\u539F\u9875\u9762..."
      };
      this.t = (key) => this.texts[key] || key;
      this.accumulatedTime = this.getSessionStorage("accumulatedTime", 0);
      this.lastActionTime = Date.now();
      this.isTopicPage = window.location.href.includes("/t/topic/");
      const onChallengePage = CURRENT_DOMAIN === "linux.do" && window.location.pathname.startsWith("/challenge");
      const isNewWindow = window.opener !== null;
      if (isNewWindow) {
        this.autoRunning = false;
        this.setSessionStorage("autoRunning", false);
        this.topicList = [];
        this.setSessionStorage("topicList", []);
        console.log("[\u7A97\u53E3\u72EC\u7ACB] \u68C0\u6D4B\u5230\u65B0\u5F00\u7A97\u53E3\uFF0C\u5DF2\u6E05\u9664\u7EE7\u627F\u7684\u81EA\u52A8\u9605\u8BFB\u72B6\u6001");
      } else {
        this.autoRunning = onChallengePage ? false : this.getSessionStorage("autoRunning", false);
        this.topicList = this.getSessionStorage("topicList", []);
      }
      this.firstUseChecked = Storage.get("firstUseChecked", false);
      this.selectedPost = Storage.get("selectedPost", null);
      this.smartLikeEnabled = Storage.get("smartLikeEnabled", false) === true;
      this.smartLikeSpeed = Storage.get("smartLikeSpeed", "normal");
      if (!["slow", "normal", "fast"].includes(this.smartLikeSpeed)) this.smartLikeSpeed = "normal";
      this.cleanModeEnabled = Storage.get("cleanModeEnabled", false);
      this.grayscaleModeEnabled = Storage.get("grayscaleModeEnabled", false);
      this.readUnreadEnabled = Storage.get("readUnreadEnabled", false);
      this.randomOrderEnabled = Storage.get("randomOrderEnabled", false);
      this.skipReadEnabled = Storage.get("skipReadEnabled", true);
      this.fullTopicReadEnabled = Storage.get("fullTopicReadEnabled", false);
      this.topicLimitCount = Storage.get("topicLimitCount", 100);
      this.restTimeMinutes = Storage.get("restTimeMinutes", 10);
      this.topicCreatedTimeVisible = Storage.get("topicCreatedTimeVisible", true);
      this.topicAgeColorEnabled = Storage.get("topicAgeColorEnabled", true);
      this.stopAfterReadEnabled = Storage.get("stopAfterReadEnabled", false);
      this.stopAfterReadCount = Storage.get("stopAfterReadCount", 10);
      this.currentSessionReadCount = this.getSessionStorage("currentSessionReadCount", 0);
      this.stopOnLikeLimitEnabled = Storage.get("stopOnLikeLimitEnabled", false);
      this.cfBypassEnabled = Storage.get("cfBypassEnabled", true);
      this.likeResumeTime = LikeCooldown.read(null);
      this.ipRateLimitResumeTime = Storage.get("ipRateLimitResumeTime", null);
      this.ipRateLimitCheckInterval = null;
      this.currentUsername = null;
      this.currentAccount = null;
      this.lastDetectedUser = null;
      this.smartLikeSessionId = this.getSessionStorage("smartLikeSessionId", null) || (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Date.now() + "-" + Math.random().toString(36).slice(2));
      this.smartLikeGeneration = 0;
      this.smartLikeCheckedPostIds = {};
      this.smartLikeFailedPostIds = /* @__PURE__ */ new Set();
      this.smartLikedPostIds = /* @__PURE__ */ new Map();
      this.smartLikeStorageReady = true;
      this.smartLikeActiveTask = null;
      this.smartLikeRunToken = 0;
      this.smartLikeIsScanning = false;
      this.smartLikeLastScanAt = 0;
      const savedSmartLikeLastLikeAt = Number(this.getSessionStorage("smartLikeLastLikeAt", 0));
      this.smartLikeLastLikeAt = Number.isFinite(savedSmartLikeLastLikeAt) && savedSmartLikeLastLikeAt > 0 ? savedSmartLikeLastLikeAt : 0;
      this.smartLikeAccountKey = null;
      this.smartLikeReady = this.initializeSmartLikeTab();
      this.readTopics = [];
      this.skippedReadCount = this.getSessionStorage("skippedReadCount", 0);
      this.todayReadCount = this.loadTodayReadCount();
      this.totalReadCount = Storage.get("totalReadCount", 0);
      this.lastFetchedPage = this.getSessionStorage("lastFetchedPage", 0);
      this.historicalMaxPage = this.loadHistoricalMaxPage();
      this._topicCreatedTimeObserver = null;
      this.topicStatusMode = null;
      this.topicStatusHideTimer = null;
      this.topicStatusNotificationTimer = null;
      this.pendingNotifications = [];
      this.cfBypassObserver = null;
      this.cfBypassRedirectTimer = null;
      this.cfBypassRedirecting = false;
      this.checkLikeResumeTime();
      this.observeLikeLimit();
      this.checkIpRateLimitStatus();
      this.detectIpRateLimit();
      this.setupButton();
      this.bindSmartLikeScroll();
      this.smartLikeReady.then(() => this.resolveSmartLikeAccount());
      this.initDataLoading();
      this.startUserSwitchMonitoring();
      this.initFloorNumberDisplay();
      this.applyCleanModeStyles();
      this.applyGrayscaleModeStyles();
      this.initTopicCreatedTimeEnhancer();
      if (!this.firstUseChecked && !onChallengePage) {
        this.handleFirstUse();
      } else if (!onChallengePage && this.autoRunning) {
        this.loadUserReadHistory().then(() => {
          if (this.topicList.length > 0) {
            setTimeout(() => this.updateReadingStatus(), 100);
          }
          if (this.isTopicPage) {
            this.startScrolling();
          } else {
            this.getLatestTopics().then(() => {
              if (!this.autoRunning) return;
              this.navigateNextTopic();
            });
          }
        });
      } else if (!onChallengePage) {
        this.loadUserReadHistory();
      }
      if (!onChallengePage) {
        this.startNavigationGuard();
      }
      this.userInfoHelper = new UserInfoHelper();
      if (CURRENT_DOMAIN === "linux.do" || CURRENT_DOMAIN === "idcflare.com") {
        this.initLikeCounter();
      }
      this.startTrustLevelMonitor();
      this.applyTopicAgeHighlightColors();
      if (CURRENT_DOMAIN === "linux.do") {
        this.initCloudFlareBypass();
      }
    }
    initLikeCounter() {
      if (!globalLikeCounter) {
        globalLikeCounter = new LikeCounter();
      }
      this.likeCounter = globalLikeCounter;
      this.likeCounter.onUIUpdate((status) => {
        this.updateLikeCounterUI(status);
      });
      setTimeout(() => {
        this.updateLikeCounterUI(this.likeCounter.getStatus());
      }, 500);
    }
    // Backward-compatible alias retained for external userscript callers.
    stopNavigation() {
      return this.stopAutoReading();
    }
  };
  Object.assign(
    BrowseController.prototype,
    methods,
    methods2,
    methods3,
    methods4,
    methods5,
    methods6,
    methods7,
    methods8,
    methods9,
    methods10,
    methods11,
    methods12,
    methods13
  );

  // src/entry.js
  var APP_KEY = Symbol.for("linux-do-assistant.app");
  if (isCDKPage) {
    initCDKBridgePage();
  } else {
    if (window[APP_KEY]?.controller) {
      window.browseController = window[APP_KEY].controller;
    } else {
      networkInterceptor.install();
      const controller = new BrowseController();
      window.browseController = controller;
      window[APP_KEY] = { controller, version: "1.0.0" };
      console.log(`[Linux.do \u52A9\u624B] \u6A21\u5757\u5316\u542F\u52A8\u5B8C\u6210 (${CURRENT_DOMAIN})`);
    }
  }
})();
