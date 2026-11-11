import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pack=readFileSync('prompts.md','utf8').replace(/\r\n/g,'\n');
mkdirSync('prompts',{recursive:true});mkdirSync('catalog',{recursive:true});
const blocks=Object.fromEntries([...pack.matchAll(/^````frozen-([A-Za-z0-9-]+)\n([\s\S]*?)\n````$/gm)].map(m=>[m[1],m[2]]));
for(const [id,body] of Object.entries(blocks))writeFileSync(`prompts/${id}.md`,body);
const titles=['Glasshouse at Blue Hour','Kestrel Hand Pump','Straight-Line Linkage','The Last Ferry','Clear Skies Ledger','Ripple Rail'];
const prompts=titles.map((title,i)=>({id:`VIS-P${i+1}`,title,kind:i<2?'static':i<4?'animation':'interactive',duration:i===2?6:i===3?12:null,path:`prompts/VIS-P${i+1}.md`,sha256:createHash('sha256').update(blocks[`VIS-P${i+1}`]).digest('hex')}));
const models=[['astra','GPT-6 Astra','codex','gpt-6-astra'],['sol','GPT-6.1 Sol','codex','gpt-6.1-sol'],['fable','Fable 5.2','claudeAgent','claude-fable-5-2'],['opus','Opus 5.5','claudeAgent','claude-opus-5-5'],['sonnet','Sonnet 5.5','claudeAgent','claude-sonnet-5-5']].map(([id,label,provider,model])=>({id,label,provider,model,effort:'high'}));
writeFileSync('catalog/prompts.json',JSON.stringify(prompts,null,2));writeFileSync('catalog/models.json',JSON.stringify(models,null,2));
const runs=[];
for(const p of prompts)for(const m of models){const directory=`builds/${p.id}/${m.id}`;mkdirSync(directory,{recursive:true});runs.push({id:`${p.id}-${m.id}`,promptId:p.id,modelId:m.id,directory,status:'pending',requestedModel:m.model,effort:'high',provider:m.provider,promptHash:p.sha256,score:null});}
writeFileSync('catalog/runs.json',JSON.stringify(runs,null,2));
console.log('Prepared six briefs and 30 empty run folders.');
