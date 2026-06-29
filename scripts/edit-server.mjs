// 1 màn hình: TRÁI = sửa scenes.json (tự lưu khi JSON hợp lệ), PHẢI = Studio (iframe, tự reload).
// Sửa -> tự lưu -> Studio tự cập nhật. JSON lỗi thì KHÔNG lưu (không phá Studio).
// Chạy:  node scripts/edit-server.mjs [file.json]   |   npm run edit
// Mở:    http://localhost:3001
import http from "http";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REL = process.argv[2] || "videos/metric-dimension-kpi/scenes.json";
const FILE = path.resolve(ROOT, REL);
const STUDIO = process.env.STUDIO_URL || "http://localhost:3000";
const PORT = 3001;

const PAGE = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>edit + studio</title><style>
:root{color-scheme:dark}*{box-sizing:border-box}
html,body{margin:0;height:100vh;overflow:hidden;font-family:ui-sans-serif,system-ui,sans-serif;background:#0c0d11;color:#e6e6ea}
body{display:flex}
#left{display:flex;flex-direction:column;width:38%;min-width:300px}
#divider{flex:0 0 6px;cursor:col-resize;background:#2a2d36}
#divider:hover{background:#7C3AED}
#studio{flex:1;border:0;height:100vh;background:#08090c}
header{padding:8px 12px;background:#15171c;border-bottom:1px solid #2a2d36;display:flex;align-items:center;gap:12px;font-size:12px}
#status{font-weight:600}.ok{color:#00bc7d}.bad{color:#ff6467}.saving{color:#fe9a00}
.file{color:#9ca3af;font-family:ui-monospace,monospace;font-size:11px}
textarea{flex:1;width:100%;border:0;outline:0;resize:none;padding:12px;background:#0c0d11;color:#e6e6ea;
  font-family:ui-monospace,monospace;font-size:12.5px;line-height:1.5;tab-size:2}
</style></head><body>
<div id="left">
  <header><span id="status" class="ok">● sẵn sàng</span><span class="file">${REL}</span></header>
  <textarea id="ed" spellcheck="false"></textarea>
</div>
<div id="divider"></div>
<iframe id="studio" src="${STUDIO}"></iframe>
<script>
var ed=document.getElementById('ed'),st=document.getElementById('status'),fr=document.getElementById('studio'),t=null,lastSaved='';
function set(c,x){st.className=c;st.textContent=x}
fetch('/load').then(function(r){return r.text()}).then(function(x){ed.value=x;lastSaved=x});
function trySave(){var v=ed.value;try{JSON.parse(v)}catch(e){set('bad','⚠ JSON lỗi (chưa lưu)');return}
  if(v===lastSaved){set('ok','● đã lưu');return}set('saving','… đang lưu');
  fetch('/save',{method:'POST',headers:{'Content-Type':'text/plain'},body:v}).then(function(r){
    if(r.ok){lastSaved=v;set('ok','✓ đã lưu — Studio reload')}else{r.text().then(function(m){set('bad','⚠ '+m)})}
  }).catch(function(){set('bad','⚠ mất server')})}
ed.addEventListener('input',function(){try{JSON.parse(ed.value);set('saving','… đang gõ')}catch(e){set('bad','⚠ JSON lỗi (chưa lưu)')}clearTimeout(t);t=setTimeout(trySave,800)});
ed.addEventListener('keydown',function(e){if(e.key==='Tab'){e.preventDefault();var s=ed.selectionStart,en=ed.selectionEnd;ed.value=ed.value.slice(0,s)+'  '+ed.value.slice(en);ed.selectionStart=ed.selectionEnd=s+2}});
var dv=document.getElementById('divider'),lf=document.getElementById('left'),drag=false;
dv.addEventListener('mousedown',function(){drag=true;fr.style.pointerEvents='none';document.body.style.userSelect='none'});
window.addEventListener('mouseup',function(){drag=false;fr.style.pointerEvents='';document.body.style.userSelect=''});
window.addEventListener('mousemove',function(e){if(drag){lf.style.width=Math.max(300,Math.min(window.innerWidth-360,e.clientX))+'px'}});
</script></body></html>`;

http.createServer(function(req, res){
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"}); res.end(PAGE); return;
  }
  if (req.method === "GET" && req.url === "/load") {
    res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"}); res.end(fs.readFileSync(FILE, "utf-8")); return;
  }
  if (req.method === "POST" && req.url === "/save") {
    let body = ""; req.on("data", c => body += c); req.on("end", function(){
      try { JSON.parse(body); } catch (e) { res.writeHead(400); res.end("JSON lỗi: " + e.message); return; }
      fs.writeFileSync(FILE, body, "utf-8"); res.writeHead(200); res.end("ok");
    });
    return;
  }
  res.writeHead(404); res.end();
}).listen(PORT, function(){
  console.log("edit + studio -> http://localhost:" + PORT + "   file: " + FILE);
});
