// Network Capture Pro - service worker (Manifest V3)
// Uses chrome.debugger (Chrome DevTools Protocol) to capture full request/response data.

const STATE_KEY = 'ncp_state_v1';
const REQUESTS_KEY = 'ncp_requests_v1';

const state = {
  capturing: false,
  paused: false,
  startTime: null,
  endTime: null,
  tabId: null,
  tabUrl: null,
  count: 0,
  bytes: 0,
  requests: new Map(), // requestId -> entry
  pendingBodies: new Set()
};

// ---------- persistence ----------
async function saveState() {
  const meta = {
    capturing: state.capturing,
    paused: state.paused,
    startTime: state.startTime,
    endTime: state.endTime,
    tabId: state.tabId,
    tabUrl: state.tabUrl,
    count: state.requests.size,
    bytes: state.bytes
  };
  // Storage has 5MB quota for sync but local is fine for big data
  try {
    await chrome.storage.local.set({
      [STATE_KEY]: meta,
      [REQUESTS_KEY]: Array.from(state.requests.entries())
    });
  } catch (e) {
    console.warn('saveState failed', e);
  }
}

async function loadState() {
  const data = await chrome.storage.local.get([STATE_KEY, REQUESTS_KEY]);
  if (data[STATE_KEY]) {
    Object.assign(state, data[STATE_KEY]);
    state.requests = new Map();
    if (Array.isArray(data[REQUESTS_KEY])) {
      for (const [k, v] of data[REQUESTS_KEY]) state.requests.set(k, v);
    }
    // After service-worker restart, debugger session is gone — mark not capturing
    if (state.capturing) {
      state.capturing = false;
      state.endTime = Date.now();
      await saveState();
    }
  }
}
loadState();

// throttled save
let saveTimer = null;
function scheduleSave() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveState();
  }, 1500);
}

// ---------- helpers ----------
function parseUrl(u) {
  try {
    const x = new URL(u);
    const params = {};
    x.searchParams.forEach((v, k) => {
      if (params[k] === undefined) params[k] = v;
      else if (Array.isArray(params[k])) params[k].push(v);
      else params[k] = [params[k], v];
    });
    return {
      hostname: x.hostname,
      pathname: x.pathname,
      protocol: x.protocol,
      port: x.port,
      hash: x.hash,
      search: x.search,
      origin: x.origin,
      queryParams: params
    };
  } catch {
    return {};
  }
}

function parseCookieHeader(value) {
  if (!value) return [];
  return String(value).split(/;\s*/).filter(Boolean).map(part => {
    const i = part.indexOf('=');
    if (i === -1) return { name: part, value: '' };
    return { name: part.slice(0, i), value: part.slice(i + 1) };
  });
}

function parseSetCookie(value) {
  if (!value) return [];
  // Set-Cookie can be a single string with multiple cookies separated by newline (CDP returns joined)
  const lines = String(value).split('\n').filter(Boolean);
  return lines.map(line => {
    const parts = line.split(/;\s*/);
    const [nv, ...attrs] = parts;
    const i = nv.indexOf('=');
    const name = i === -1 ? nv : nv.slice(0, i);
    const val = i === -1 ? '' : nv.slice(i + 1);
    const cookie = { name, value: val };
    for (const a of attrs) {
      const j = a.indexOf('=');
      const k = (j === -1 ? a : a.slice(0, j)).toLowerCase();
      const v = j === -1 ? true : a.slice(j + 1);
      if (k === 'expires') cookie.expires = v;
      else if (k === 'max-age') cookie.maxAge = v;
      else if (k === 'domain') cookie.domain = v;
      else if (k === 'path') cookie.path = v;
      else if (k === 'samesite') cookie.sameSite = v;
      else if (k === 'secure') cookie.secure = true;
      else if (k === 'httponly') cookie.httpOnly = true;
      else cookie[k] = v;
    }
    return cookie;
  });
}

function lowerKeys(obj) {
  if (!obj) return {};
  const out = {};
  for (const k of Object.keys(obj)) out[k.toLowerCase()] = obj[k];
  return out;
}

// ---------- debugger event handler ----------
chrome.debugger.onEvent.addListener(async (source, method, params) => {
  if (!state.capturing || state.paused) return;
  if (state.tabId && source.tabId !== state.tabId) return;
  const reqId = params && params.requestId;
  if (!reqId) return;

  let e = state.requests.get(reqId);
  if (!e) {
    e = { id: reqId, capturedAt: Date.now() };
    state.requests.set(reqId, e);
  }

  switch (method) {
    case 'Network.requestWillBeSent': {
      const req = params.request || {};
      e.url = req.url;
      e.method = req.method;
      e.requestHeaders = req.headers || {};
      e.postData = req.postData || null;
      e.hasPostData = !!req.hasPostData;
      e.initiator = params.initiator;
      e.resourceType = params.type;
      e.frameId = params.frameId;
      e.loaderId = params.loaderId;
      e.documentURL = params.documentURL;
      e.redirectResponse = params.redirectResponse;
      e.wallTime = params.wallTime;
      e.requestTime = params.timestamp;
      Object.assign(e, parseUrl(req.url));
      // pull cookies out of request headers
      const lh = lowerKeys(req.headers);
      if (lh.cookie) e.requestCookies = parseCookieHeader(lh.cookie);
      // attempt to parse post body when it's form / json
      if (req.postData) {
        try {
          const ct = lh['content-type'] || '';
          if (ct.includes('application/json')) e.postDataJson = JSON.parse(req.postData);
          else if (ct.includes('application/x-www-form-urlencoded')) {
            const p = {};
            new URLSearchParams(req.postData).forEach((v, k) => p[k] = v);
            e.postDataForm = p;
          }
        } catch { /* leave raw */ }
      }
      break;
    }
    case 'Network.requestWillBeSentExtraInfo': {
      e.requestHeadersExtra = params.headers || {};
      e.associatedCookies = params.associatedCookies || [];
      e.connectTiming = params.connectTiming;
      // merge extra headers
      e.requestHeadersFull = { ...(e.requestHeaders || {}), ...(e.requestHeadersExtra || {}) };
      break;
    }
    case 'Network.responseReceived': {
      const r = params.response || {};
      e.responseStatus = r.status;
      e.responseStatusText = r.statusText;
      e.responseHeaders = r.headers || {};
      e.responseMimeType = r.mimeType;
      e.responseUrl = r.url;
      e.remoteAddress = r.remoteIPAddress ? `${r.remoteIPAddress}:${r.remotePort}` : null;
      e.protocol = r.protocol;
      e.responseTiming = r.timing;
      e.securityState = r.securityState;
      e.securityDetails = r.securityDetails;
      e.fromDiskCache = r.fromDiskCache;
      e.fromServiceWorker = r.fromServiceWorker;
      e.fromPrefetchCache = r.fromPrefetchCache;
      const rh = lowerKeys(r.headers);
      if (rh['set-cookie']) e.responseCookies = parseSetCookie(rh['set-cookie']);
      break;
    }
    case 'Network.responseReceivedExtraInfo': {
      e.responseHeadersExtra = params.headers || {};
      e.blockedCookies = params.blockedCookies || [];
      e.cookiePartitionKey = params.cookiePartitionKey;
      e.headersText = params.headersText;
      e.responseHeadersFull = { ...(e.responseHeaders || {}), ...(e.responseHeadersExtra || {}) };
      const rh = lowerKeys(e.responseHeadersFull);
      if (rh['set-cookie'] && !e.responseCookies) e.responseCookies = parseSetCookie(rh['set-cookie']);
      break;
    }
    case 'Network.loadingFinished': {
      e.encodedDataLength = params.encodedDataLength;
      e.finishedAt = Date.now();
      e.duration = e.requestTime ? (params.timestamp - e.requestTime) * 1000 : null;
      state.bytes += params.encodedDataLength || 0;
      // fetch response body
      state.pendingBodies.add(reqId);
      try {
        const body = await chrome.debugger.sendCommand(
          { tabId: state.tabId },
          'Network.getResponseBody',
          { requestId: reqId }
        );
        if (body) {
          e.responseBody = body.body;
          e.responseBase64Encoded = !!body.base64Encoded;
          e.responseBodySize = body.body ? body.body.length : 0;
        }
      } catch (err) {
        e.responseBodyError = err && err.message ? err.message : String(err);
      } finally {
        state.pendingBodies.delete(reqId);
      }
      scheduleSave();
      break;
    }
    case 'Network.loadingFailed': {
      e.failed = true;
      e.errorText = params.errorText;
      e.canceled = params.canceled;
      e.blockedReason = params.blockedReason;
      e.corsErrorStatus = params.corsErrorStatus;
      e.finishedAt = Date.now();
      scheduleSave();
      break;
    }
    case 'Network.webSocketCreated': {
      e.kind = 'websocket';
      e.url = params.url;
      e.initiator = params.initiator;
      break;
    }
    case 'Network.webSocketFrameSent':
    case 'Network.webSocketFrameReceived': {
      e.kind = 'websocket';
      e.frames = e.frames || [];
      e.frames.push({
        direction: method.endsWith('Sent') ? 'out' : 'in',
        timestamp: params.timestamp,
        opcode: params.response && params.response.opcode,
        mask: params.response && params.response.mask,
        payload: params.response && params.response.payloadData
      });
      break;
    }
  }

  if (method !== 'Network.loadingFinished' && method !== 'Network.loadingFailed') {
    scheduleSave();
  }
});

chrome.debugger.onDetach.addListener((source, reason) => {
  if (state.tabId === source.tabId) {
    if (state.capturing) {
      state.capturing = false;
      state.endTime = Date.now();
      saveState();
      try { chrome.action.setBadgeText({ text: '' }); } catch {}
    }
  }
});

// ---------- capture control ----------
async function startCapture(tabId) {
  if (state.capturing) return;
  if (!tabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab && tab.id;
  }
  if (!tabId) throw new Error('No active tab');
  const tab = await chrome.tabs.get(tabId);
  state.tabId = tabId;
  state.tabUrl = tab.url;
  await chrome.debugger.attach({ tabId }, '1.3');
  await chrome.debugger.sendCommand({ tabId }, 'Network.enable', {
    maxResourceBufferSize: 50 * 1024 * 1024,
    maxTotalBufferSize: 200 * 1024 * 1024
  });
  // include browser cookies in request info
  try { await chrome.debugger.sendCommand({ tabId }, 'Network.setCacheDisabled', { cacheDisabled: false }); } catch {}
  state.capturing = true;
  state.paused = false;
  state.startTime = Date.now();
  state.endTime = null;
  await saveState();
  setBadge();
}

async function stopCapture() {
  if (!state.capturing) return;
  try { await chrome.debugger.detach({ tabId: state.tabId }); } catch {}
  state.capturing = false;
  state.endTime = Date.now();
  await saveState();
  setBadge();
}

async function pauseCapture(paused) {
  state.paused = !!paused;
  await saveState();
  setBadge();
}

async function clearCapture() {
  state.requests = new Map();
  state.bytes = 0;
  state.count = 0;
  state.startTime = null;
  state.endTime = null;
  await saveState();
  setBadge();
}

function setBadge() {
  try {
    if (state.capturing && !state.paused) {
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#d33' });
    } else if (state.paused) {
      chrome.action.setBadgeText({ text: '||' });
      chrome.action.setBadgeBackgroundColor({ color: '#888' });
    } else if (state.requests.size) {
      chrome.action.setBadgeText({ text: String(state.requests.size) });
      chrome.action.setBadgeBackgroundColor({ color: '#2a6' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch {}
}

// ---------- offscreen for blob URLs ----------
let offscreenReady = false;
async function ensureOffscreen() {
  if (offscreenReady) return;
  try {
    const has = await chrome.offscreen.hasDocument?.();
    if (has) { offscreenReady = true; return; }
  } catch {}
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['BLOBS'],
    justification: 'Build ZIP/JSON/HAR/CSV blobs and trigger downloads.'
  });
  offscreenReady = true;
}

async function downloadAll(format = 'zip') {
  const entries = Array.from(state.requests.values());
  if (!entries.length) throw new Error('Nothing to download — capture some requests first.');
  await ensureOffscreen();
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const reply = await chrome.runtime.sendMessage({
    target: 'offscreen',
    type: 'BUILD_AND_DOWNLOAD',
    format,
    ts,
    entries,
    meta: {
      startTime: state.startTime,
      endTime: state.endTime || Date.now(),
      tabUrl: state.tabUrl,
      count: entries.length,
      bytes: state.bytes
    }
  });
  if (!reply || !reply.ok) throw new Error((reply && reply.error) || 'offscreen build failed');
  if (!chrome.downloads || !chrome.downloads.download) {
    throw new Error('chrome.downloads unavailable — open chrome://extensions and click ↻ on this extension to reload it.');
  }
  const id = await chrome.downloads.download({ url: reply.url, filename: reply.filename, saveAs: false });
  // Revoke later so the download can fully read the blob
  setTimeout(() => {
    chrome.runtime.sendMessage({ target: 'offscreen', type: 'REVOKE_URL', url: reply.url }).catch(() => {});
  }, 90_000);
  return { ok: true, downloadId: id, filename: reply.filename };
}

// ---------- site data clearing ----------
function originsFor(url) {
  try {
    const u = new URL(url);
    return [u.origin];
  } catch { return []; }
}

async function clearSiteData(url, opts = {}) {
  if (!url) throw new Error('No site URL — start a capture or pass a tab first.');
  const origins = originsFor(url);
  if (!origins.length) throw new Error('Could not parse site URL: ' + url);
  if (!chrome.browsingData) throw new Error('browsingData permission missing — reload the extension.');
  const what = {
    cookies: opts.cookies !== false,
    cache: opts.cache !== false,
    cacheStorage: opts.cache !== false,
    localStorage: opts.storage !== false,
    indexedDB: opts.storage !== false,
    serviceWorkers: opts.storage !== false,
    fileSystems: opts.storage !== false,
    webSQL: opts.storage !== false
  };
  await chrome.browsingData.remove({ origins }, what);
  return { ok: true, origins, cleared: what };
}

async function clearSiteCacheOnly(url) {
  return clearSiteData(url, { cookies: false, cache: true, storage: false });
}

async function clearSiteCookiesOnly(url) {
  return clearSiteData(url, { cookies: true, cache: false, storage: false });
}

// ---------- message router ----------
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target && msg.target !== 'background') return;
  (async () => {
    try {
      switch (msg.type) {
        case 'GET_STATE':
          sendResponse({
            capturing: state.capturing,
            paused: state.paused,
            startTime: state.startTime,
            endTime: state.endTime,
            count: state.requests.size,
            bytes: state.bytes,
            tabId: state.tabId,
            tabUrl: state.tabUrl,
            swVersion: chrome.runtime.getManifest().version,
            handlers: ['GET_STATE','GET_REQUESTS','START','STOP','PAUSE','RESUME','CLEAR','DOWNLOAD','GET_TARGET_URL','OPEN_TARGET','CLEAR_SITE_DATA','CLEAR_SITE_CACHE','CLEAR_SITE_COOKIES','RELOAD_TARGET']
          });
          break;
        case 'GET_REQUESTS': {
          const arr = Array.from(state.requests.values());
          // popup may want a slim version; let it slim itself
          sendResponse({ requests: arr });
          break;
        }
        case 'START':
          await startCapture(msg.tabId);
          sendResponse({ ok: true });
          break;
        case 'STOP':
          await stopCapture();
          sendResponse({ ok: true });
          break;
        case 'PAUSE':
          await pauseCapture(true);
          sendResponse({ ok: true });
          break;
        case 'RESUME':
          await pauseCapture(false);
          sendResponse({ ok: true });
          break;
        case 'CLEAR':
          await clearCapture();
          sendResponse({ ok: true });
          break;
        case 'DOWNLOAD': {
          const r = await downloadAll(msg.format);
          sendResponse({ ok: true, ...r });
          break;
        }
        case 'GET_TARGET_URL': {
          let url = state.tabUrl;
          if (!url) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            url = tab && tab.url;
          }
          sendResponse({ ok: true, url });
          break;
        }
        case 'OPEN_TARGET': {
          const url = msg.url || state.tabUrl;
          if (!url) throw new Error('No target URL');
          if (state.tabId) {
            try { await chrome.tabs.update(state.tabId, { active: true }); break; }
            catch { /* tab gone, fall through */ }
          }
          await chrome.tabs.create({ url });
          sendResponse({ ok: true });
          break;
        }
        case 'CLEAR_SITE_DATA': {
          const url = msg.url || state.tabUrl || (await activeTabUrl());
          const r = await clearSiteData(url, msg.opts || {});
          sendResponse({ ok: true, ...r });
          break;
        }
        case 'CLEAR_SITE_CACHE': {
          const url = msg.url || state.tabUrl || (await activeTabUrl());
          const r = await clearSiteCacheOnly(url);
          sendResponse({ ok: true, ...r });
          break;
        }
        case 'CLEAR_SITE_COOKIES': {
          const url = msg.url || state.tabUrl || (await activeTabUrl());
          const r = await clearSiteCookiesOnly(url);
          sendResponse({ ok: true, ...r });
          break;
        }
        case 'RELOAD_TARGET': {
          const tabId = state.tabId || (await activeTabId());
          if (tabId) await chrome.tabs.reload(tabId, { bypassCache: !!msg.bypassCache });
          sendResponse({ ok: true });
          break;
        }
        default:
          sendResponse({ ok: false, error: 'unknown message type ' + msg.type });
      }
    } catch (e) {
      sendResponse({ ok: false, error: e && e.message ? e.message : String(e) });
    }
  })();
  return true; // async
});

// ---------- helpers used by message router ----------
async function activeTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab && tab.id;
}
async function activeTabUrl() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab && tab.url;
}

// ---------- auto-stop if tab closes ----------
chrome.tabs.onRemoved.addListener((tabId) => {
  if (state.tabId === tabId && state.capturing) {
    state.capturing = false;
    state.endTime = Date.now();
    saveState();
    setBadge();
  }
});
