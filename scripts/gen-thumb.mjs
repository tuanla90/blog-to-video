// Sinh thumbnail YouTube (1280x720) data-driven từ videos/<slug>/thumb.json.
// 9 layout: cards | bignum | question | vs | highlight | chart | mockup | split | code.
// Màu theo category (chung bảng với cover). Lưu source thumb-src/<slug>.html, render out/<slug>/thumb.png.
// Chạy: node scripts/gen-thumb.mjs [slug ...]   (không slug = mọi videos/*/thumb.json)
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = path.resolve(process.cwd());
const VIDEOS = path.join(ROOT, 'video-remotion/videos');
const OUTBASE = path.join(ROOT, 'video-remotion/out');
const SRC = path.join(ROOT, 'thumb-src');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FILE = (rel) => 'file:///' + path.join(ROOT, rel).replace(/\\/g, '/');
const PERSON = FILE('video-remotion/public/thumb/tuan-crop.png');
const LOGO = FILE('video-remotion/public/thumb/logo-LA.svg');
fs.mkdirSync(SRC, { recursive: true });

const CAT = {
  'Kiến Thức Nền Tảng':   { accT: '#C4B5FD', acc: '#8B5CF6', acc2: '#6366F1' },
  'Phân Tích Dữ Liệu':    { accT: '#67E8F9', acc: '#22D3EE', acc2: '#0891B2' },
  'Hướng Dẫn Thực Chiến': { accT: '#6EE7B7', acc: '#10B981', acc2: '#34D399' },
  'AI & Công Nghệ':       { accT: '#F0ABFC', acc: '#D946EF', acc2: '#A855F7' },
  'So Sánh & Lựa Chọn':   { accT: '#FCD34D', acc: '#F59E0B', acc2: '#FB923C' },
  'Câu Chuyện & Use Case':{ accT: '#FDA4AF', acc: '#FB7185', acc2: '#F43F5E' },
};
const DEF = CAT['Kiến Thức Nền Tảng'];
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const CLR = { green: '#34D399', red: '#FF3B4E', cyan: '#22D3EE', violet: '#8B5CF6', amber: '#FBBF24' };

const kick = t => t ? `<div class="kick">${esc(t)}</div>` : '';
const person = on => on === false ? '' : `<img class="person" src="${PERSON}">`;

// ── layout renderers: trả {body, chart?} ──
const L = {
  cards(d) {
    const cs = (d.cards || []).map(c => `<div class="card" style="--cc:${CLR[c.color] || c.color || 'var(--accT)'}"><div class="cl">${esc(c.label)}</div><div class="cv">${esc(c.value)}</div></div>`).join('<div class="neq">≠</div>');
    return { body: `<div class="c" style="top:118px;width:820px">${d.kicker ? `<div class="kick" style="margin-bottom:16px">${esc(d.kicker)}</div>` : ''}<div class="cards">${cs}</div><h1 class="hk">${esc(d.hook?.pre || '')}<br><span class="rd">${esc(d.hook?.em || '')}</span></h1></div>${person(d.person)}` };
  },
  bignum(d) {
    return { body: `<div class="c ctr" style="width:760px;align-items:flex-start;gap:22px">${kick(d.kicker)}<span style="font-size:184px;font-weight:900;line-height:.9;letter-spacing:-7px;color:${CLR[d.color] || d.color || CLR.green};text-shadow:0 0 50px ${(CLR[d.color] || CLR.green)}55">${esc(d.value)}</span><div style="font-size:46px;font-weight:900;line-height:1.1">${esc(d.label || '')} ${d.contrast ? `· <span class="rd">${esc(d.contrast)}</span>` : ''}</div></div>${person(d.person)}` };
  },
  question(d) {
    return { body: `<div class="c ctr" style="width:760px"><h1 style="font-size:118px;line-height:1.08;letter-spacing:-5px">${esc(d.pre)}<br><span class="rd big" style="display:inline-block;margin-top:6px">${esc(d.em)}</span></h1>${d.kicker ? `<div class="kick" style="margin-top:30px;align-self:flex-start">${esc(d.kicker)}</div>` : ''}</div>${person(d.person)}` };
  },
  vs(d) {
    return { body: `<div class="c ctr" style="width:840px">${d.kicker ? `<div class="kick" style="margin-bottom:24px;align-self:flex-start">${esc(d.kicker)}</div>` : ''}<div style="display:flex;align-items:center;gap:20px"><span style="font-size:92px;font-weight:900;line-height:.9;letter-spacing:-3px">${esc(d.left).replace(/ /, '<br>')}</span><span class="vsbadge">VS</span><span style="font-size:92px;font-weight:900;line-height:.9;letter-spacing:-3px;color:var(--accT)">${esc(d.right).replace(/ /, '<br>')}</span></div>${d.tail ? `<div style="font-size:44px;font-weight:900;margin-top:22px">${esc(d.tail).replace(/\?/, '<span class="rd">?</span>')}</div>` : ''}</div>${person(d.person)}` };
  },
  highlight(d) {
    return { body: `<div class="c ctr" style="width:780px"><h1 style="font-size:116px;line-height:1.04;letter-spacing:-4px">${esc(d.pre)}<br><span class="mark">${esc(d.hl)}</span></h1>${d.kicker ? `<div class="kick" style="margin-top:30px;align-self:flex-start">${esc(d.kicker)}</div>` : ''}</div>${person(d.person)}` };
  },
  chart(d) {
    return { body: `<div class="c ctr" style="width:560px">${d.kicker ? `<div class="kick" style="margin-bottom:20px;align-self:flex-start">${esc(d.kicker)}</div>` : ''}<h1 style="font-size:118px;line-height:.92;letter-spacing:-5px">${esc(d.hook?.pre || '')}<br><span class="rd">${esc(d.hook?.em || '')}</span></h1></div><div id="chart" style="position:absolute;right:30px;top:110px;width:540px;height:500px;z-index:2"></div>`, chart: d.chart || 'cohort' };
  },
  mockup(d) {
    const bars = [60, 100, 44, 78, 32].map(h => `<div style="flex:1;height:${h}%;background:linear-gradient(var(--accT),var(--acc));border-radius:8px 8px 0 0"></div>`).join('');
    return { body: `<div class="c ctr" style="width:560px">${kick(d.kicker)}<h1 style="font-size:104px;line-height:.95;letter-spacing:-4px;margin-top:${d.kicker ? 20 : 0}px">${esc(d.hook?.pre || '')}<br><span style="color:var(--accT)">${esc(d.hook?.em || '')}</span></h1></div>
      <div style="position:absolute;right:40px;top:118px;width:600px;height:452px;border-radius:18px;background:#0D1424;border:1px solid color-mix(in srgb,var(--accT) 40%,transparent);box-shadow:0 0 60px color-mix(in srgb,var(--acc) 32%,transparent),0 30px 60px rgba(0,0,0,.4);z-index:2;overflow:hidden">
        <div style="height:40px;background:#0a0f1c;display:flex;align-items:center;gap:7px;padding:0 16px;border-bottom:1px solid #1e293b"><span class="wd" style="background:#ef4444"></span><span class="wd" style="background:#f59e0b"></span><span class="wd" style="background:#10b981"></span><span style="color:#64748b;font-size:13px;margin-left:8px;font-weight:600">Semantix · AI Chat</span></div>
        <div style="padding:22px"><div style="background:#141c2e;border-radius:10px;padding:12px 16px;font-size:17px;color:#cbd5e1;font-weight:600">${esc(d.query || 'Doanh thu tháng này theo kênh?')}</div>
          <div style="display:flex;align-items:flex-end;gap:14px;height:210px;margin-top:26px;padding:0 6px">${bars}</div></div>
      </div>
      <svg width="60" height="60" viewBox="0 0 24 24" style="position:absolute;right:150px;top:430px;z-index:4;filter:drop-shadow(0 4px 8px rgba(0,0,0,.6))"><path d="M5 3l14 8-6 1.5L10 20z" fill="#fff" stroke="#0b1120" stroke-width="1.2"/></svg>` };
  },
  split(d) {
    const l = d.left || {}, r = d.right || {};
    return { noframe: true, body: `
      <div style="position:absolute;inset:0;clip-path:polygon(0 0,60% 0,44% 100%,0 100%);background:radial-gradient(120% 120% at 20% 30%,rgba(239,68,68,.4),transparent 60%),linear-gradient(135deg,#1a0a0e,#0b0708)"></div>
      <div style="position:absolute;inset:0;clip-path:polygon(60% 0,100% 0,100% 100%,44% 100%);background:radial-gradient(120% 120% at 80% 70%,rgba(16,185,129,.42),transparent 60%),linear-gradient(135deg,#08150f,#0a0f0c)"></div>
      <div class="lbl">${esc(d.kicker || 'So sánh & lựa chọn')}</div>
      <div style="position:absolute;left:64px;top:0;bottom:0;width:440px;display:flex;flex-direction:column;justify-content:center;z-index:3">
        <div class="chip" style="background:#ef4444;box-shadow:0 0 30px rgba(239,68,68,.6)">✕</div>
        <div style="font-size:60px;font-weight:900;line-height:1;letter-spacing:-2px">${esc(l.title || '').replace(/ /, '<br>')}</div>
        <div style="font-size:26px;font-weight:800;color:#fca5a5;margin-top:14px">${esc(l.sub || '')}</div></div>
      <div style="position:absolute;right:64px;top:0;bottom:0;width:440px;display:flex;flex-direction:column;justify-content:center;align-items:flex-end;text-align:right;z-index:3">
        <div class="chip" style="background:#10b981;box-shadow:0 0 30px rgba(16,185,129,.6)">✓</div>
        <div style="font-size:60px;font-weight:900;line-height:1;letter-spacing:-2px">${esc(r.title || '').replace(/ /, '<br>')}</div>
        <div style="font-size:26px;font-weight:800;color:#6ee7b7;margin-top:14px">${esc(r.sub || '')}</div></div>
      <div class="vsbadge" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:4;width:96px;height:96px;background:#0b1120;border:3px solid var(--accT);box-shadow:0 0 34px color-mix(in srgb,var(--accT) 60%,transparent)">VS</div>` };
  },
  code(d) {
    const codeHtml = (d.code || []).map(ln => ln).join('\n');
    return { body: `<div class="c ctr" style="width:520px">${kick(d.kicker)}<h1 style="font-size:100px;line-height:.95;letter-spacing:-4px;margin-top:${d.kicker ? 20 : 0}px">${(d.hook || '').replace('[em]', '<span class="rd">').replace('[/em]', '</span>')}</h1></div>
      <div style="position:absolute;right:44px;top:150px;width:588px;border-radius:16px;background:#0B1020;border:1px solid color-mix(in srgb,var(--accT) 38%,transparent);box-shadow:0 0 56px color-mix(in srgb,var(--acc) 30%,transparent),0 26px 54px rgba(0,0,0,.45);z-index:2;overflow:hidden;font-family:'JetBrains Mono',monospace">
        <div style="height:38px;background:#0a0f1c;display:flex;align-items:center;gap:7px;padding:0 15px;border-bottom:1px solid #1e293b"><span class="wd" style="background:#ef4444"></span><span class="wd" style="background:#f59e0b"></span><span class="wd" style="background:#10b981"></span></div>
        <pre style="margin:0;padding:24px 22px;font-size:23px;line-height:1.6;font-weight:600;color:#e2e8f0">${codeHtml}</pre></div>` };
  },
};

function buildHtml(slug, d) {
  const c = CAT[d.category] || DEF;
  const r = (L[d.layout] || L.question)(d);
  const chartScript = r.chart ? `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script><script>window.addEventListener('load',function(){if(!window.echarts)return;var co=['T10','T11','T12','T1','T2','T3','T4'],y=co.slice().reverse(),pts=[],seed=[15,6,3,1.6,1,0.7,0.4];co.forEach(function(x,ci){for(var p=0;p<7-ci;p++){pts.push([p,y.indexOf(x),+(seed[p]*(0.7+(ci%3)*0.45)).toFixed(1)]);}});echarts.init(document.getElementById('chart')).setOption({animation:false,backgroundColor:'transparent',grid:{left:2,right:2,top:2,bottom:2},xAxis:{type:'category',data:[1,2,3,4,5,6,7],show:false},yAxis:{type:'category',data:y,show:false},visualMap:{show:false,min:0,max:16,inRange:{color:['#064e3b','#047857','#10b981','#34d399']}},series:[{type:'heatmap',data:pts,itemStyle:{borderColor:'#0f172a',borderWidth:3,borderRadius:4},label:{show:true,fontFamily:'Inter',fontSize:14,fontWeight:700,color:'#fff',formatter:function(p){return p.value[2]+'%';}}}]});});</script>` : '';
  const frame = r.noframe ? '' : `<div class="dots"></div><div class="glowP"></div>
   <div class="cat">${esc(d.catLabel || d.category || '')}</div>`;
  const brand = `<div class="brand"><img src="${LOGO}"><span>Tuấn LA Lab</span></div>`;
  return `<!doctype html><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">${chartScript}
<style>
 *{margin:0;box-sizing:border-box}
 body{width:1280px;height:720px;overflow:hidden;position:relative;font-family:'Inter',system-ui,Arial,sans-serif;color:#fff;--accT:${c.accT};--acc:${c.acc};--acc2:${c.acc2};
   background:radial-gradient(52% 52% at 14% 18%,color-mix(in srgb,var(--acc) 42%,transparent),transparent 60%),radial-gradient(56% 56% at 86% 86%,color-mix(in srgb,var(--acc2) 46%,transparent),transparent 60%),linear-gradient(135deg,#0E0A1A,#08070D)}
 .dots{position:absolute;inset:0;background-image:radial-gradient(color-mix(in srgb,var(--accT) 16%,transparent) 1.3px,transparent 1.3px);background-size:30px 30px;opacity:.5}
 .glowP{position:absolute;right:-58px;bottom:-72px;width:446px;height:576px;border-radius:50%;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--acc) 55%,transparent),transparent 62%)}
 .cat{position:absolute;left:44px;top:36px;border:2px solid var(--acc);color:var(--accT);border-radius:100px;padding:8px 20px;font-size:19px;font-weight:800;letter-spacing:1px;background:color-mix(in srgb,var(--acc) 14%,transparent);z-index:5;text-transform:uppercase}
 .lbl{position:absolute;left:44px;top:38px;font-size:15px;font-weight:800;letter-spacing:2px;color:#64748b;z-index:9}
 .brand{position:absolute;right:44px;top:36px;display:flex;align-items:center;gap:12px;background:#783ABF;border-radius:15px;padding:9px 20px 9px 16px;z-index:5}
 .brand img{height:38px} .brand span{font-weight:800;font-size:21px;color:#fff}
 .kick{display:inline-block;background:color-mix(in srgb,var(--acc) 20%,transparent);border:1px solid color-mix(in srgb,var(--accT) 45%,transparent);color:var(--accT);font-size:21px;font-weight:800;padding:9px 18px;border-radius:100px}
 h1{font-weight:900} .rd{color:#FF3B4E;text-shadow:0 0 30px rgba(255,59,78,.6)} .rd.big{color:#FF2740;text-shadow:0 0 40px rgba(255,39,64,.85),0 4px 8px #000}
 .mark{background:var(--acc);color:#04222B;padding:2px 22px;border-radius:14px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
 .c{position:absolute;left:44px;z-index:4} .c.ctr{top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
 .cards{display:flex;align-items:center;gap:18px;margin-bottom:26px} .card{background:rgba(255,255,255,.05);border:2px solid var(--cc);border-radius:16px;padding:12px 22px;min-width:190px}
 .cl{font-size:18px;font-weight:800;letter-spacing:2px;color:var(--cc)} .cv{font-size:42px;font-weight:900;letter-spacing:-1px;line-height:1.1;margin-top:2px} .neq{font-size:48px;font-weight:900;color:#94A3B8}
 .hk{font-size:138px;line-height:.9;letter-spacing:-5px}
 .vsbadge{flex:none;width:120px;height:120px;border-radius:50%;background:#FF2740;box-shadow:0 0 40px rgba(255,39,64,.7),inset 0 -6px 16px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:900;color:#fff}
 .chip{width:70px;height:70px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;margin-bottom:20px}
 .wd{width:11px;height:11px;border-radius:50%}
 .person{position:absolute;right:14px;bottom:0;height:389px;z-index:3;transform:scaleX(-1);filter:contrast(1.06) saturate(1.06) brightness(1.02) drop-shadow(0 0 7px var(--acc)) drop-shadow(0 0 22px color-mix(in srgb,var(--acc2) 85%,transparent))}
 .baseline{position:absolute;left:0;right:0;bottom:0;height:12px;background:linear-gradient(90deg,var(--acc),var(--acc2));z-index:6}
</style>
${frame}${brand}${r.body}<div class="baseline"></div>`;
}

const args = process.argv.slice(2);
let slugs = args.length ? args : (fs.existsSync(VIDEOS) ? fs.readdirSync(VIDEOS).filter(s => fs.existsSync(path.join(VIDEOS, s, 'thumb.json'))) : []);
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
let ok = 0;
for (const slug of slugs) {
  const jf = path.join(VIDEOS, slug, 'thumb.json');
  if (!fs.existsSync(jf)) { console.log('skip (no thumb.json):', slug); continue; }
  const d = JSON.parse(fs.readFileSync(jf, 'utf8'));
  const html = buildHtml(slug, d);
  const srcFile = path.join(SRC, slug + '.html');
  fs.writeFileSync(srcFile, html, 'utf8');
  fs.mkdirSync(path.join(OUTBASE, slug), { recursive: true });
  // goto file:// (không dùng setContent) để ảnh file:// (chân dung + logo) load được
  await page.goto('file:///' + srcFile.replace(/\\/g, '/'), { waitUntil: 'load', timeout: 60000 });
  await page.evaluate(() => Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 5000))]));
  await new Promise(r => setTimeout(r, d.layout === 'chart' ? 500 : 250));
  await page.screenshot({ path: path.join(OUTBASE, slug, 'thumb.png'), type: 'png' });
  console.log('thumb:', slug, '·', d.layout); ok++;
}
await browser.close();
console.log(`XONG: ${ok} thumbnail -> out/<slug>/thumb.png · source -> thumb-src/`);
