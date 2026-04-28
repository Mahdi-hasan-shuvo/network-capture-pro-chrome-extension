// Offscreen worker — receives entries from background, builds blobs, triggers downloads.

const enc = new TextEncoder();

function safe(s, n = 80) {
  return String(s ?? '').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, n) || 'x';
}
function pad(i, w) { return String(i).padStart(w, '0'); }

function extFromMime(mime, ct) {
  const m = (mime || ct || '').toLowerCase();
  if (m.includes('json')) return 'json';
  if (m.includes('html')) return 'html';
  if (m.includes('xml'))  return 'xml';
  if (m.includes('javascript')) return 'js';
  if (m.includes('css'))  return 'css';
  if (m.includes('plain')) return 'txt';
  if (m.includes('png'))  return 'png';
  if (m.includes('jpeg') || m.includes('jpg')) return 'jpg';
  if (m.includes('gif'))  return 'gif';
  if (m.includes('webp')) return 'webp';
  if (m.includes('svg'))  return 'svg';
  if (m.includes('pdf'))  return 'pdf';
  if (m.includes('font') || m.includes('woff')) return 'woff';
  if (m.includes('octet')) return 'bin';
  return 'bin';
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function csvEscape(s) {
  if (s === null || s === undefined) return '';
  const v = String(s);
  if (/[",\n\r]/.test(v)) return '"' + v.replace(/"/g, '""') + '"';
  return v;
}

function buildHar(entries, meta) {
  const har = {
    log: {
      version: '1.2',
      creator: { name: 'Network Capture Pro', version: '1.0' },
      pages: [{
        startedDateTime: new Date(meta.startTime || Date.now()).toISOString(),
        id: 'page_1',
        title: meta.tabUrl || '',
        pageTimings: {}
      }],
      entries: entries.map((e) => {
        const reqHeaders = Object.entries(e.requestHeadersFull || e.requestHeaders || {})
          .map(([n, v]) => ({ name: n, value: String(v) }));
        const resHeaders = Object.entries(e.responseHeadersFull || e.responseHeaders || {})
          .map(([n, v]) => ({ name: n, value: String(v) }));
        const queryString = Object.entries(e.queryParams || {}).flatMap(([n, v]) =>
          Array.isArray(v) ? v.map(vv => ({ name: n, value: String(vv) })) : [{ name: n, value: String(v) }]
        );
        const cookies = (e.requestCookies || []).map(c => ({ name: c.name, value: c.value }));
        const setCookies = (e.responseCookies || []).map(c => ({
          name: c.name, value: c.value, path: c.path, domain: c.domain,
          expires: c.expires, httpOnly: !!c.httpOnly, secure: !!c.secure
        }));
        const postData = e.postData ? {
          mimeType: (e.requestHeaders && (e.requestHeaders['content-type'] || e.requestHeaders['Content-Type'])) || 'application/octet-stream',
          text: e.postData,
          params: e.postDataForm
            ? Object.entries(e.postDataForm).map(([n, v]) => ({ name: n, value: String(v) }))
            : undefined
        } : undefined;

        return {
          startedDateTime: new Date(e.capturedAt || meta.startTime || Date.now()).toISOString(),
          time: e.duration || 0,
          request: {
            method: e.method || 'GET',
            url: e.url || '',
            httpVersion: e.protocol || 'HTTP/1.1',
            cookies,
            headers: reqHeaders,
            queryString,
            postData,
            headersSize: -1,
            bodySize: e.postData ? e.postData.length : 0
          },
          response: {
            status: e.responseStatus || 0,
            statusText: e.responseStatusText || '',
            httpVersion: e.protocol || 'HTTP/1.1',
            cookies: setCookies,
            headers: resHeaders,
            content: {
              size: e.responseBodySize || 0,
              mimeType: e.responseMimeType || '',
              text: e.responseBody || '',
              encoding: e.responseBase64Encoded ? 'base64' : undefined
            },
            redirectURL: '',
            headersSize: -1,
            bodySize: e.encodedDataLength || 0
          },
          cache: {},
          timings: e.responseTiming || { send: 0, wait: e.duration || 0, receive: 0 },
          serverIPAddress: e.remoteAddress ? e.remoteAddress.split(':')[0] : undefined,
          _resourceType: e.resourceType,
          pageref: 'page_1'
        };
      })
    }
  };
  return JSON.stringify(har, null, 2);
}

function buildCsv(entries) {
  const headers = [
    '#','time','method','status','type','host','path','duration_ms','bytes',
    'mime','remote','request_cookies','response_set_cookies','url'
  ];
  const lines = [headers.join(',')];
  entries.forEach((e, i) => {
    lines.push([
      i + 1,
      new Date(e.capturedAt || 0).toISOString(),
      e.method || '',
      e.failed ? 'ERR' : (e.responseStatus || ''),
      e.resourceType || '',
      e.hostname || '',
      e.pathname || '',
      e.duration ? Math.round(e.duration) : '',
      e.encodedDataLength || '',
      e.responseMimeType || '',
      e.remoteAddress || '',
      (e.requestCookies || []).map(c => `${c.name}=${c.value}`).join('; '),
      (e.responseCookies || []).map(c => c.name).join('; '),
      e.url || ''
    ].map(csvEscape).join(','));
  });
  return lines.join('\n');
}

function buildIndexHtml(entries, meta) {
  const rows = entries.map((e, i) => {
    const status = e.failed ? `<span style="color:#c33">ERR ${e.errorText || ''}</span>`
                            : `<span>${e.responseStatus || '…'}</span>`;
    return `<tr>
      <td>${i + 1}</td>
      <td>${e.method || ''}</td>
      <td>${status}</td>
      <td>${e.resourceType || ''}</td>
      <td title="${(e.url || '').replace(/"/g,'&quot;')}">${(e.hostname || '') + (e.pathname || '')}</td>
      <td>${e.duration ? Math.round(e.duration) + 'ms' : ''}</td>
      <td>${e.encodedDataLength || ''}</td>
      <td><a href="requests/${pad(i+1,5)}_${safe((e.hostname||'x'),24)}_${safe(e.method||'GET',6)}.json">json</a></td>
    </tr>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>Capture ${new Date(meta.startTime||Date.now()).toISOString()}</title>
<style>body{font:13px -apple-system,Segoe UI,Roboto,sans-serif;padding:16px;background:#fafafa}
table{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #eee;padding:6px;text-align:left;font-size:12px}
th{background:#f0f0f0}tr:hover{background:#fff}h1{font-size:18px}small{color:#666}</style></head>
<body><h1>Network Capture</h1>
<small>${entries.length} requests · ${new Date(meta.startTime||0).toLocaleString()} → ${new Date(meta.endTime||Date.now()).toLocaleString()} · ${meta.tabUrl || ''}</small>
<table><thead><tr><th>#</th><th>Method</th><th>Status</th><th>Type</th><th>URL</th><th>Time</th><th>Bytes</th><th>Detail</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}

async function buildBlob({ format, ts, entries, meta }) {
  let url, filename, mime;
  const total = entries.length;

  if (format === 'json') {
    const payload = JSON.stringify({ meta, requests: entries }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    url = URL.createObjectURL(blob);
    filename = `network_capture_${ts}.json`;
    mime = 'application/json';
  } else if (format === 'har') {
    const har = buildHar(entries, meta);
    const blob = new Blob([har], { type: 'application/json' });
    url = URL.createObjectURL(blob);
    filename = `network_capture_${ts}.har`;
    mime = 'application/json';
  } else if (format === 'csv') {
    const csv = buildCsv(entries);
    const blob = new Blob([csv], { type: 'text/csv' });
    url = URL.createObjectURL(blob);
    filename = `network_capture_${ts}.csv`;
    mime = 'text/csv';
  } else {
    // ZIP — per-request files + summary + bodies + index.html
    const files = [];

    // top-level summary & manifest
    files.push({ name: 'summary.json', data: enc.encode(JSON.stringify({
      meta, count: total, generatedAt: new Date().toISOString()
    }, null, 2)) });

    files.push({ name: 'all_requests.json', data: enc.encode(JSON.stringify(entries, null, 2)) });
    files.push({ name: 'capture.har', data: enc.encode(buildHar(entries, meta)) });
    files.push({ name: 'capture.csv', data: enc.encode(buildCsv(entries)) });
    files.push({ name: 'index.html', data: enc.encode(buildIndexHtml(entries, meta)) });

    // counter / time file
    files.push({ name: 'counter_and_time.txt', data: enc.encode([
      `Network Capture Pro — capture report`,
      ``,
      `Total requests       : ${total}`,
      `Total bytes          : ${meta.bytes || 0}`,
      `Started at           : ${meta.startTime ? new Date(meta.startTime).toISOString() : '-'}`,
      `Ended at             : ${meta.endTime ? new Date(meta.endTime).toISOString() : '-'}`,
      `Elapsed (seconds)    : ${meta.startTime && meta.endTime ? ((meta.endTime - meta.startTime)/1000).toFixed(2) : '-'}`,
      `Tab URL              : ${meta.tabUrl || '-'}`,
      `Generated at         : ${new Date().toISOString()}`,
      ``
    ].join('\n')) });

    // collect cookies across all requests
    const allReqCookies = [];
    const allResCookies = [];
    for (const e of entries) {
      for (const c of (e.requestCookies || [])) allReqCookies.push({ from: e.url, ...c });
      for (const c of (e.responseCookies || [])) allResCookies.push({ from: e.url, ...c });
    }
    files.push({ name: 'cookies/request_cookies.json',  data: enc.encode(JSON.stringify(allReqCookies, null, 2)) });
    files.push({ name: 'cookies/response_cookies.json', data: enc.encode(JSON.stringify(allResCookies, null, 2)) });

    // per-request files
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const idx = pad(i + 1, 5);
      const host = safe(e.hostname || 'unknown', 24);
      const method = safe(e.method || 'GET', 6);
      const base = `requests/${idx}_${host}_${method}`;

      // detail JSON (always)
      files.push({
        name: `${base}.json`,
        data: enc.encode(JSON.stringify(e, null, 2))
      });

      // raw response body if present
      if (e.responseBody) {
        const ext = extFromMime(e.responseMimeType, (e.responseHeadersFull && (e.responseHeadersFull['content-type'] || e.responseHeadersFull['Content-Type'])) || '');
        const bodyName = `bodies/${idx}_${host}.${ext}`;
        if (e.responseBase64Encoded) {
          try { files.push({ name: bodyName, data: b64ToBytes(e.responseBody) }); }
          catch { files.push({ name: bodyName + '.b64', data: enc.encode(e.responseBody) }); }
        } else {
          files.push({ name: bodyName, data: enc.encode(e.responseBody) });
        }
      }

      // raw post body if present
      if (e.postData) {
        files.push({ name: `post_data/${idx}_${host}.txt`, data: enc.encode(e.postData) });
      }
    }

    const zipBytes = NCPZip.create(files);
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    url = URL.createObjectURL(blob);
    filename = `network_capture_${ts}.zip`;
    mime = 'application/zip';
  }

  return { ok: true, url, filename, mime };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || msg.target !== 'offscreen') return;
  if (msg.type === 'REVOKE_URL') {
    try { URL.revokeObjectURL(msg.url); } catch {}
    sendResponse({ ok: true });
    return;
  }
  if (msg.type !== 'BUILD_AND_DOWNLOAD') return;
  (async () => {
    try {
      const r = await buildBlob(msg);
      sendResponse({ ok: true, url: r.url, filename: r.filename, mime: r.mime });
    } catch (e) {
      console.error('[offscreen] build error', e);
      sendResponse({ ok: false, error: e && e.message || String(e) });
    }
  })();
  return true; // async sendResponse
});
