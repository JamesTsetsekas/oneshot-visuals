// Record a delivered T3 completion event; never infers completion from file existence.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const ids=process.argv.slice(2);
const runs=JSON.parse(readFileSync('catalog/runs.json','utf8'));
for(const id of ids){
 const run=runs.find(r=>r.id===id);if(!run)throw Error(`Unknown run ${id}`);
 const local=JSON.parse(readFileSync(`.local/${id}.json`,'utf8'));
 Object.assign(run,{status:existsSync(`${run.directory}/index.html`)?'complete':'missing-output',completedEventReceivedAt:new Date().toISOString(),requestedModel:local.model,provider:local.providerInstanceId,settings:local.options,sessionLink:local.link,launchedAt:local.launchedAt,elapsedSeconds:null});
}
writeFileSync('catalog/runs.json',JSON.stringify(runs,null,2)+'\n');
console.log(`Recorded ${ids.length} delivered completion events.`);
