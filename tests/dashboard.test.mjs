import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';

test('production dashboard loads under repository path and preview isolates hostile code',async()=>{
 const root=path.resolve('site');
 const server=createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(!pathname.startsWith('/oneshot-visuals/')){res.writeHead(404).end();return;}
  const file=path.resolve(root,decodeURIComponent(pathname.slice('/oneshot-visuals/'.length))||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{const b=await readFile(file);res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(b);}catch{res.writeHead(404).end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 let browser;
 try{
  browser=await chromium.launch();const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=`http://127.0.0.1:${server.address().port}/oneshot-visuals/`;
  await page.goto(base);await page.waitForSelector('.cell');
  assert.equal(await page.locator('.cell').count(),30);
  const catalog=await (await fetch(base+'data/catalog.json')).json();
  if(catalog.runs.every(r=>r.status==='complete')){
   assert.equal(await page.locator('.cell img').count(),30);
   const loaded=await page.locator('.cell img').evaluateAll(async imgs=>{
    for(const img of imgs)img.loading='eager';
    return await Promise.all(imgs.map(async img=>{try{await img.decode();return img.naturalWidth>0;}catch{return false;}}));
   });
   assert.ok(loaded.every(Boolean),'All 30 production posters decode');
  }
  if(process.env.DASHBOARD_SCREENSHOT){
   await page.setViewportSize({width:1440,height:1000});
   await page.locator('.cell img').first().waitFor();
   await mkdir('.local',{recursive:true});
   await page.screenshot({path:'.local/dashboard.png',fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  const isolated=await page.evaluate(async()=>{
   const {createPreviewFrame}=await import('./js/sandbox.js');
   return await new Promise(resolve=>{
    const listener=e=>{if(e.source===frame.contentWindow){removeEventListener('message',listener);resolve(e.data);}};
    addEventListener('message',listener);
    const frame=createPreviewFrame(`<script>let storage=false,parentAccess=false;try{localStorage.setItem('escape','yes');storage=true}catch{}try{parent.document.body.dataset.escape='yes';parentAccess=true}catch{}fetch('https://example.com/escape').then(()=>parent.postMessage({storage,parentAccess,network:true},'*')).catch(()=>parent.postMessage({storage,parentAccess,network:false},'*'))<\/script>`,'Hostile test');
    document.body.append(frame);setTimeout(()=>resolve({timeout:true}),5000);
   });
  });
  assert.deepEqual(isolated,{storage:false,parentAccess:false,network:false});
  if(catalog.runs.filter(r=>r.promptId==='VIS-P3').every(r=>r.clip)){
   await page.goto(base+'#/prompt/VIS-P3');
   await page.getByRole('button',{name:'Play all clips together'}).click();
   await page.waitForFunction(()=>document.querySelectorAll('video').length===5&&[...document.querySelectorAll('video')].every(v=>v.readyState>=2));
  }
  assert.deepEqual(errors,[]);
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
});
