// Cloudflare Worker：提供 /api/sync，其它路徑交給靜態網頁（public/）
// D1 綁定名稱：DB（設定在 wrangler.jsonc）

/* ===== 可修改設定 ===== */
const MIN_CODE = 4;          // 同步代碼最少字數
const MAX_CODE = 40;         // 同步代碼最多字數
const MAX_BYTES = 2_000_000; // 單一代碼資料上限
/* ====================== */

function merge(a, b) {
  const cleared = Math.max(a.cleared || 0, b.cleared || 0);
  const H = new Map();
  for (const h of [...(a.hist || []), ...(b.hist || [])]) if (h && h.t > cleared) H.set(h.t, h);
  const W = {};
  for (const src of [a.q || a.wrong || {}, b.q || b.wrong || {}])
    for (const [k, v] of Object.entries(src))
      if (v && v.t > cleared && (!W[k] || v.t > W[k].t)) W[k] = v;
  return { hist: [...H.values()].sort((x, y) => x.t - y.t), q: W, cleared };
}

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

const ensure = db => db.prepare('CREATE TABLE IF NOT EXISTS sync (code TEXT PRIMARY KEY, data TEXT NOT NULL, updated INTEGER NOT NULL)').run();

async function handleSync(request, env) {
  if (!env.DB) return json({ error: '伺服器尚未綁定 D1（變數名稱 DB）' }, 500);
  await ensure(env.DB);
  if (request.method === 'GET') {
    const code = new URL(request.url).searchParams.get('code')?.trim() || '';
    if (code.length < MIN_CODE) return json({ error: '缺少同步代碼' }, 400);
    const row = await env.DB.prepare('SELECT data FROM sync WHERE code = ?').bind(code).first();
    return json({ data: row ? JSON.parse(row.data) : { hist: [], q: {}, cleared: 0 } });
  }
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ error: '資料格式錯誤' }, 400); }
  const code = String(body.code || '').trim();
  if (code.length < MIN_CODE || code.length > MAX_CODE) return json({ error: `同步代碼需 ${MIN_CODE}–${MAX_CODE} 字` }, 400);
  const incoming = body.data && typeof body.data === 'object' ? body.data : {};
  const row = await env.DB.prepare('SELECT data FROM sync WHERE code = ?').bind(code).first();
  const merged = merge(row ? JSON.parse(row.data) : {}, incoming);
  const text = JSON.stringify(merged);
  if (text.length > MAX_BYTES) return json({ error: '資料量超過上限' }, 413);
  await env.DB.prepare('INSERT INTO sync (code, data, updated) VALUES (?, ?, ?) ON CONFLICT(code) DO UPDATE SET data = excluded.data, updated = excluded.updated')
    .bind(code, text, Date.now()).run();
  return json({ data: merged });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/sync') {
      try { return await handleSync(request, env); }
      catch (e) { return json({ error: '伺服器錯誤：' + e.message }, 500); }
    }
    return env.ASSETS.fetch(request);
  },
};
