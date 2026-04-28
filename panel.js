// Full panel — same controls as popup, with a side-by-side detail view.
const $ = (id) => document.getElementById(id);
const ui = {
  status:$('status'), count:$('count'), bytes:$('bytes'), timer:$('timer'), tab:$('tab'),
  startBtn:$('startBtn'), pauseBtn:$('pauseBtn'), stopBtn:$('stopBtn'), clearBtn:$('clearBtn'),
  dlZip:$('dlZip'), dlJson:$('dlJson'), dlHar:$('dlHar'), dlCsv:$('dlCsv'),
  filter:$('filter'), typeFilter:$('typeFilter'), methodFilter:$('methodFilter'),
  rows:$('rows'), detail:$('detail'),
  targetUrl:$('targetUrl'), openSite:$('openSite'), reloadSite:$('reloadSite'),
  hardReload:$('hardReload'), clearCookies:$('clearCookies'), clearCache:$('clearCache')
};
let cached = []; let lastState = null; let selected = null;

const send = (type, data = {}) => chrome.runtime.sendMessage({ target: 'background', type, ...data });
const fmtBytes = (n) => { if (!n) return '0 B'; const u=['B','KB','MB','GB']; let i=0; while (n>=1024 && i<u.length-1){n/=1024;i++;} return `${n.toFixed(i?1:0)} ${u[i]}`; };
const elapsed = (s,e) => { if (!s) return '00:00'; const t=Math.floor(((e||Date.now())-s)/1000); const h=Math.floor(t/3600), m=Math.floor((t%3600)/60), ss=t%60; return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(ss).padStart(2,'0'); };
const sc = (n) => !n ? 'warn' : (n>=400 ? 'err' : (n>=300 ? 'warn' : 'ok'));

async function refresh() {
  lastState = await send('GET_STATE');
  ui.status.textContent = lastState.capturing ? (lastState.paused ? 'Paused' : 'Recording') : 'Idle';
  ui.count.textContent = lastState.count;
  ui.bytes.textContent = fmtBytes(lastState.bytes);
  ui.timer.textContent = elapsed(lastState.startTime, lastState.endTime);
  let target = lastState.tabUrl;
  if (!target) {
    try { const r = await send('GET_TARGET_URL'); if (r && r.url) target = r.url; } catch {}
  }
  if (target) {
    try { ui.tab.textContent = new URL(target).hostname; } catch { ui.tab.textContent = target.slice(0, 40); }
    ui.targetUrl.textContent = target;
    ui.targetUrl.href = target;
    ui.targetUrl.dataset.url = target;
  } else {
    ui.tab.textContent = '-';
    ui.targetUrl.textContent = '(no active tab)';
    delete ui.targetUrl.dataset.url;
  }
  ui.startBtn.disabled = lastState.capturing;
  ui.pauseBtn.disabled = !lastState.capturing;
  ui.stopBtn.disabled  = !lastState.capturing;
  ui.pauseBtn.textContent = lastState.paused ? 'Resume' : 'Pause';

  const { requests } = await send('GET_REQUESTS');
  cached = requests || [];
  render();
}

function render() {
  const q = ui.filter.value.trim().toLowerCase();
  const tf = ui.typeFilter.value, mf = ui.methodFilter.value;
  ui.rows.innerHTML = '';
  cached.slice().sort((a,b) => (a.requestTime||a.capturedAt||0)-(b.requestTime||b.capturedAt||0)).forEach((e, i) => {
    if (tf && e.resourceType !== tf) return;
    if (mf && e.method !== mf) return;
    if (q) {
      const hay = `${e.method||''} ${e.url||''} ${e.responseStatus||''} ${e.responseMimeType||''}`.toLowerCase();
      if (!hay.includes(q)) return;
    }
    const tr = document.createElement('tr');
    if (selected && selected.id === e.id) tr.classList.add('sel');
    const status = e.failed ? 'ERR' : (e.responseStatus || '…');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${e.method||''}</td>
      <td class="${e.failed?'err':sc(e.responseStatus)}">${status}</td>
      <td>${e.resourceType||''}</td>
      <td>${e.hostname||''}</td>
      <td title="${(e.url||'').replace(/"/g,'&quot;')}">${(e.pathname||'') + (e.search||'')}</td>
      <td>${e.duration?Math.round(e.duration)+'ms':''}</td>
      <td>${e.encodedDataLength?fmtBytes(e.encodedDataLength):''}</td>
    `;
    tr.addEventListener('click', () => { selected = e; render(); showDetail(e); });
    ui.rows.appendChild(tr);
  });
}

function tab(name, active=false) {
  return `<span class="tab ${active?'active':''}" data-tab="${name}">${name}</span>`;
}
function pre(obj) {
  return `<pre>${escapeHtml(typeof obj==='string'?obj:JSON.stringify(obj, null, 2))}</pre>`;
}
function kv(obj) {
  if (!obj) return '<em style="color:#8d96a4">none</em>';
  const rows = Object.entries(obj).map(([k,v])=>`<div class="k">${escapeHtml(k)}</div><div>${escapeHtml(typeof v==='object'?JSON.stringify(v):String(v))}</div>`).join('');
  return `<div class="kv">${rows}</div>`;
}
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showDetail(e) {
  ui.detail.innerHTML = `
    <div class="tabs">
      ${tab('Overview', true)}${tab('Request')}${tab('Response')}${tab('Cookies')}${tab('Body')}${tab('Raw')}
    </div>
    <div id="paneOverview">
      ${kv({
        URL: e.url, Method: e.method, Type: e.resourceType, Status: e.responseStatus,
        StatusText: e.responseStatusText, MimeType: e.responseMimeType,
        RemoteAddress: e.remoteAddress, Protocol: e.protocol,
        Duration_ms: e.duration ? Math.round(e.duration) : '',
        Bytes: e.encodedDataLength, FromDiskCache: e.fromDiskCache,
        FromServiceWorker: e.fromServiceWorker, Failed: e.failed, Error: e.errorText
      })}
    </div>
    <div id="paneRequest" hidden>
      <h4>Headers</h4>${kv(e.requestHeadersFull || e.requestHeaders)}
      <h4>Query parameters</h4>${kv(e.queryParams)}
      <h4>Post body (raw)</h4>${pre(e.postData || '(none)')}
      <h4>Post body (parsed)</h4>${pre(e.postDataJson || e.postDataForm || '(none)')}
    </div>
    <div id="paneResponse" hidden>
      <h4>Headers</h4>${kv(e.responseHeadersFull || e.responseHeaders)}
      <h4>Timing</h4>${pre(e.responseTiming || {})}
      <h4>Security</h4>${pre(e.securityDetails || e.securityState || '')}
    </div>
    <div id="paneCookies" hidden>
      <h4>Request cookies</h4>${pre(e.requestCookies || [])}
      <h4>Set-Cookie (response)</h4>${pre(e.responseCookies || [])}
      <h4>Blocked cookies</h4>${pre(e.blockedCookies || [])}
    </div>
    <div id="paneBody" hidden>
      <h4>Response body${e.responseBase64Encoded?' (base64 encoded)':''}</h4>
      ${pre(e.responseBody ? (e.responseBody.length > 80000 ? e.responseBody.slice(0,80000) + `\n…(${e.responseBody.length} chars total)` : e.responseBody) : '(none)')}
    </div>
    <div id="paneRaw" hidden>${pre(e)}</div>
  `;
  ui.detail.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    ui.detail.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    const name = t.dataset.tab;
    ['Overview','Request','Response','Cookies','Body','Raw'].forEach(n => {
      ui.detail.querySelector('#pane' + n).hidden = n !== name;
    });
  }));
}

ui.startBtn.addEventListener('click', async () => { await send('START'); refresh(); });
ui.pauseBtn.addEventListener('click', async () => { await send(lastState && lastState.paused ? 'RESUME' : 'PAUSE'); refresh(); });
ui.stopBtn .addEventListener('click', async () => { await send('STOP'); refresh(); });
ui.clearBtn.addEventListener('click', async () => { if (lastState && lastState.count && !confirm(`Clear ${lastState.count} requests?`)) return; await send('CLEAR'); selected=null; refresh(); });
async function dl(format) {
  try {
    const r = await send('DOWNLOAD', { format });
    if (!r || !r.ok) throw new Error(r && r.error || 'failed');
  } catch (e) { alert('Download failed: ' + (e.message || e)); }
}
ui.dlZip .addEventListener('click', () => dl('zip'));
ui.dlJson.addEventListener('click', () => dl('json'));
ui.dlHar .addEventListener('click', () => dl('har'));
ui.dlCsv .addEventListener('click', () => dl('csv'));
[ui.filter, ui.typeFilter, ui.methodFilter].forEach(el => el.addEventListener('input', render));

async function clearSite(kind) {
  const url = ui.targetUrl.dataset.url;
  if (!url) { alert('No target site'); return; }
  let host; try { host = new URL(url).hostname; } catch { host = url; }
  const labels = { cookies:`Clear cookies for ${host}?`, cache:`Clear cache for ${host}?`,
                   all:`Clear ALL site data for ${host}?\nYou will be logged out.` };
  if (!confirm(labels[kind])) return;
  const type = kind==='cookies' ? 'CLEAR_SITE_COOKIES' : kind==='cache' ? 'CLEAR_SITE_CACHE' : 'CLEAR_SITE_DATA';
  try {
    const r = await send(type, { url });
    if (!r || !r.ok) throw new Error(r && r.error || 'failed');
    alert(`Cleared ${kind} for ${host}`);
  } catch (e) { alert('Clear failed: ' + (e.message || e)); }
}
ui.targetUrl  .addEventListener('click', async (e) => { e.preventDefault(); if (ui.targetUrl.dataset.url) await send('OPEN_TARGET', { url: ui.targetUrl.dataset.url }); });
ui.openSite   .addEventListener('click', async () => { if (ui.targetUrl.dataset.url) await send('OPEN_TARGET', { url: ui.targetUrl.dataset.url }); });
ui.reloadSite .addEventListener('click', () => send('RELOAD_TARGET'));
ui.hardReload .addEventListener('click', () => send('RELOAD_TARGET', { bypassCache: true }));
ui.clearCookies.addEventListener('click', () => clearSite('cookies'));
ui.clearCache  .addEventListener('click', () => clearSite('cache'));

refresh();
setInterval(refresh, 1500);
