import {spawnSync}from'node:child_process';
import {mkdirSync,writeFileSync}from'node:fs';
import {resolve}from'node:path';
import {createRequire}from'node:module';
import {preview}from'vite';
import {chromium}from'@playwright/test';
import assert from'node:assert/strict';
const require=createRequire(import.meta.url),dir=resolve('check/.generated/render-profile');mkdirSync(dir,{recursive:true});
const config=resolve(dir,'vite.config.mjs');
writeFileSync(config,`import {renderProfilePlugin} from '../../../scripts/render-profile-plugin.mjs';export default {resolve:{alias:[{find:/^react-dom(?:\\/client)?$/,replacement:${JSON.stringify(require.resolve('react-dom/profiling'))}}]},plugins:[renderProfilePlugin()]};`);
if(!process.argv.includes('--browser-only')){
 const build=spawnSync('npm',['run','ladle:build','--','--outDir','check/.generated/render-profile/build','--viteConfig',config],{encoding:'utf8'});writeFileSync(resolve(dir,'build.log'),build.stdout+build.stderr);assert.equal(build.status,0,'profiling build failed: check/.generated/render-profile/build.log');
}
const server=await preview({configFile:false,build:{outDir:resolve(dir,'build')},preview:{port:0}});
const browser=await chromium.launch();const results=[];
const scenarios=[
 ['button','sakuga--actions--button--icons',async p=>p.getByRole('button',{name:'Add a scene',exact:true}).click()],
 ['textfield','sakuga--forms--textfield--empty',async p=>p.getByRole('textbox').pressSequentially('Sakuga',{delay:30})],
 ['select','sakuga--forms--select--closed',async(p,i)=>{await p.getByRole('combobox').click();await p.getByRole('option',{name:i%2?'Heros':'E.R.A.',exact:false}).click()}],
 ['switch','sakuga--actions--switch--states',async p=>p.getByRole('switch',{name:'Loop this track',exact:true}).click()],
 ['checkbox','sakuga--forms--checkbox--select-all',async p=>p.getByRole('checkbox',{name:'rain-on-glass.wav',exact:true}).click()],
 ['picker','sakuga--containers--picker--options',async p=>p.getByRole('button',{name:'Weather',exact:true}).click()],
 ['picker-keyboard','sakuga--containers--picker--with-search',async(p,i)=>p.getByRole('combobox').press(i%2?'ArrowUp':'ArrowDown')],
 ['gallery','sakuga--foundations--icon--every',async(p,i)=>p.mouse.wheel(0,i%2?-500:500)],
];
try {
 for(const cpu of [1,4])for(const [name,story,act]of scenarios){
  const context=await browser.newContext({viewport:{width:1024,height:800},reducedMotion:'no-preference'});
  await context.addInitScript(()=>{globalThis.__sakugaRenderCalls=[];globalThis.__sakugaCommits=[];globalThis.__sakugaPresence=[]});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
  await page.goto(server.resolvedUrls.local[0]+`?story=${story}&mode=preview&theme=dark`);
  await page.waitForSelector('html[data-storyloaded]',{state:'attached',timeout:15000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);
  const read=async()=>page.evaluate(()=>{const counts={};for(const name of globalThis.__sakugaRenderCalls)counts[name]=(counts[name]||0)+1;const commits=globalThis.__sakugaCommits,presence=globalThis.__sakugaPresence;globalThis.__sakugaRenderCalls=[];globalThis.__sakugaCommits=[];globalThis.__sakugaPresence=[];return {counts,commits,presence}});
  const mount=await read();assert.ok(mount.commits.some(c=>c.phase==='mount'),'production profiling build must report story mount');
  if(name==='gallery')assert.equal(mount.counts['src/ui/Icon/Icon.tsx:Icon'],222,'counter must see the complete real gallery');
  await page.waitForTimeout(700);const idle=await read();
  const actions=[];for(let i=0;i<8;i++){await act(page,i);await page.waitForTimeout(250);actions.push(await read())}
  const steps=[];
  if(name==='select') {
   await page.getByRole('combobox').click();await page.waitForTimeout(250);steps.push({label:'open',...await read()});
   await page.getByRole('option',{name:'E.R.A.',exact:false}).click();await page.waitForTimeout(250);steps.push({label:'select-and-close',...await read()});
  }
  // SoundDesk is a sibling of the actual story: toggling it should not render the story.
  await page.locator('[data-sk-sound-desk] input').check();await page.waitForTimeout(150);const soundToggle=await read();
  await page.locator('[data-sk-sound-desk] input').uncheck();await page.waitForTimeout(150);const soundOff=await read();
  assert.deepEqual(errors,[]);results.push({name,story,cpu,mount,idle,actions,steps,soundToggle,soundOff});console.log(`Profiled ${name} at ${cpu}x CPU`);await context.close();
 }
}finally{await browser.close();await new Promise(done=>server.httpServer.close(done))}
writeFileSync(process.argv.find(a=>a.startsWith('--output='))?.slice(9) ?? resolve(dir,'renders.json'),JSON.stringify({react:require('react/package.json').version,note:'Production profiling build; invocation counts include render attempts; actualDuration is React render CPU per committed story update, not DOM commit duration or input latency.',results},null,2)+'\n');
