'use strict';
// Clear Fork 12NG. Server-only shared Q&A. Never store credentials, attachments or full browser context.
// Install @netlify/blobs 10.7.11. Site-scoped records survive deployments. No read/modify/write shared arrays.
const crypto = require('node:crypto');
const VERSION = 'clearfork-access-v1.1';
const COOKIE = '__Host-clearfork_access';
const LIMITS = {question:32000,answer:180000,recordBytes:950000,page:20};
const headers = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
function fail(status,code,message){const e=new Error(message);e.statusCode=status;e.code=code;throw e;}
function response(status,data){return {statusCode:status,headers:{...headers},body:JSON.stringify(data)};}
function hash(s){return crypto.createHash('sha256').update(String(s)).digest('hex');}
function hmac(key,s){return crypto.createHmac('sha256',key).update(s).digest();}
function eq(a,b){return a.length===b.length&&crypto.timingSafeEqual(a,b);}
function header(event,key){const h=event.headers||{};return String(h[key]||h[Object.keys(h).find(k=>k.toLowerCase()===key)]||'');}
function authorize(event,env=process.env,now=Date.now()){
 if(event.httpMethod!=='POST')fail(405,'METHOD','Use POST.');
 const pw=env.CLEARFORK_SITE_PASSWORD,secret=env.CLEARFORK_SESSION_SECRET;
 if(!pw||!secret||secret.length<32)fail(503,'SHARED_CONFIG','Shared history is not configured. Keep both access variables in Netlify Functions scope and redeploy.');
 let url;try{url=new URL(event.rawUrl||('https://'+header(event,'host')+(event.path||'/.netlify/functions/ryan')));}catch{fail(403,'ORIGIN','A valid same-site HTTPS request is required.');}
 if(url.protocol!=='https:'||header(event,'origin')!==url.origin)fail(403,'ORIGIN','Same-site access is required.');
 if(!/^application\/json(?:\s*;|$)/i.test(header(event,'content-type')))fail(415,'TYPE','JSON required.');
 const cookies=header(event,'cookie').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
 if(cookies.length!==1)fail(401,'SITE_LOGIN','Sign in to Clear Fork before accessing shared Questions Asked.');
 const val=cookies[0].slice(COOKIE.length+1);if(val.length>5000)fail(401,'SITE_LOGIN','Session not valid.');
 const bits=val.split('.'),key=hmac(secret,VERSION+'\0'+pw);
 let p;try{if(bits.length!==2||!eq(Buffer.from(bits[1],'base64url'),hmac(key,bits[0])))throw Error();p=JSON.parse(Buffer.from(bits[0],'base64url').toString('utf8'));}catch{fail(401,'SITE_LOGIN','Session not valid. Sign in again.');}
 const sec=Math.floor(now/1000);
 if(p.v!==1||p.type!=='session'||p.aud!==VERSION+'|'+url.origin||!Number.isSafeInteger(p.iat)||!Number.isSafeInteger(p.exp)||p.iat>sec+30||p.exp<=sec||p.exp<=p.iat||p.exp-p.iat>43200)fail(401,'SITE_LOGIN','Session expired or invalid. Sign in again.');
 return {origin:url.origin,key,session:p};
}
function parse(event){let raw=event.isBase64Encoded?Buffer.from(event.body||'','base64').toString('utf8'):(event.body||'{}');if(Buffer.byteLength(raw)>1100000)fail(413,'SIZE','Shared-history request is too large.');try{return JSON.parse(raw);}catch{fail(400,'JSON','Invalid JSON.');}}
function validId(id){return typeof id==='string'&&/^\d{13}-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id);}
function prefix(id){if(!validId(id))fail(400,'ID','Invalid question identifier.');const t=Number(id.slice(0,13));if(!Number.isSafeInteger(t)||t<0||t>Date.now()+86400000)fail(400,'ID','Invalid question date.');return 'questions/'+new Date(t).toISOString().slice(0,7)+'/'+id;}
function text(v,max,name){if(typeof v!=='string'||!v.trim()||v.length>max)fail(400,'CONTENT',name+' is missing or too long.');return v;}
function safeJSON(v){if(v==null)return null;const s=JSON.stringify(v);if(s.length>300000)fail(413,'SIZE','Structured result too large.');return JSON.parse(s);}
function completedRecord(req,answer){return {schemaVersion:2,id:'shared-'+req.id,sharedId:req.id,sharedStatus:'saved',question:req.question,answer:answer.reply||'',mode:req.mode,answeredAt:answer.answeredAt,firstAskedAt:req.askedAt,updatedAt:answer.answeredAt,source:answer.source||'Shared Ryan AI history',sourceBuild:req.sourceBuild,partial:!!answer.partial,reusable:!!answer.reusable,contextKey:answer.contextKey||'',containsLiveSnapshot:!!answer.containsLiveSnapshot,liveDependent:!!answer.liveDependent,workplan:answer.workplan||null,costUsd:answer.cost&&answer.cost.usd!=null?answer.cost.usd:null,verificationStatus:'ARCHIVED_AI_ANSWER_NOT_VERIFIED',importedAt:answer.importedAt||null};}
function completion(data,body){const reply=typeof data.reply==='string'?data.reply:'';const wp=data.workplan||null;
 if(!reply.trim()&&!wp)return null;if(reply.length>LIMITS.answer)fail(413,'SIZE','Answer exceeds the shared archive size limit.');
 const ans={reply:reply||(String(wp.title||'Draft work plan')+'\n\nNOT APPROVED - FIELD VERIFICATION REQUIRED'),workplan:safeJSON(wp),cost:safeJSON(data.cost),answeredAt:Date.now(),source:'Ryan server response - historical AI output, not verified',partial:['max_tokens','pause_turn'].includes((data.meta&&data.meta.stopReason)||data.stopReason),reusable:!body.attachment&&/^(qa|qa_fast)$/.test(body.mode||'qa')&&!body.sharedFollowup,containsLiveSnapshot:!!body.sharedLive,liveDependent:!!body.sharedLive,contextKey:body.sharedFollowup?'shared-followup-not-reusable':''};
 if(Buffer.byteLength(JSON.stringify(ans))>LIMITS.recordBytes)fail(413,'SIZE','Answer exceeds the shared archive size limit.');return ans;
}
function receipt(auth,id,answer){const s=Buffer.from(JSON.stringify({v:1,id,digest:hash(JSON.stringify(answer)),exp:Math.floor(Date.now()/1000)+604800})).toString('base64url');return s+'.'+hmac(auth.key,'ryan-history-completion\0'+s).toString('base64url');}
function checkReceipt(auth,token,id,answer){try{const [s,h]=String(token).split('.');if(!eq(Buffer.from(h,'base64url'),hmac(auth.key,'ryan-history-completion\0'+s)))return false;const p=JSON.parse(Buffer.from(s,'base64url'));return p.v===1&&p.id===id&&p.exp>Math.floor(Date.now()/1000)&&p.digest===hash(JSON.stringify(answer));}catch{return false;}}
function createService(options={}){
 const env=options.env||process.env;
 function store(event){if(options.store)return options.store;let sdk;try{sdk=require('@netlify/blobs');}catch{fail(503,'SHARED_SDK','Shared history needs the @netlify/blobs dependency. Install the supplied dependency setup and redeploy.');}
  try{sdk.connectLambda(event);const context=String(env.CLEARFORK_HISTORY_NAMESPACE||env.CONTEXT||'production'),name=context==='production'?'clearfork-ryan-questions-v1':'clearfork-ryan-questions-v1-'+context.replace(/[^a-z0-9-]/gi,'-');return sdk.getStore({name,consistency:'strong',fetch:async(url,init={})=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);try{return await fetch(url,{...init,signal:controller.signal});}finally{clearTimeout(timer);}}});}catch{fail(503,'SHARED_STORE','Shared history could not connect to Netlify Blobs. Check the function deployment and Blobs support.');}
 }
 async function get(s,id){const p=prefix(id),req=await s.get(p+'.request',{type:'json'});if(!req)return null;const answer=await s.get(p+'.answer',{type:'json'});if(answer)return {id,status:'complete',request:req,record:completedRecord(req,answer)};const error=await s.get(p+'.failure',{type:'json'});return {id,status:error?'failed':'pending',request:req,error:error?error.message:null};}
 async function putAnswer(s,id,answer){const key=prefix(id)+'.answer';for(let n=0;n<3;n++){try{const r=await s.setJSON(key,answer,{onlyIfNew:true});if(r.modified)return true;const old=await s.get(key,{type:'json'});if(old&&hash(JSON.stringify(old))===hash(JSON.stringify(answer)))return true;fail(409,'IMMUTABLE','An answer already exists; it was not overwritten.');}catch(e){if(e.statusCode===409||n===2)throw e;await new Promise(r=>setTimeout(r,80*(n+1)));}}}
 async function begin(event,body){const auth=authorize(event,env),s=store(event),id=body.sharedQuestionId;
  if(!validId(id)||Math.abs(Date.now()-Number(id.slice(0,13)))>86400000)fail(400,'ID','Refresh the question request and try again.');
  const req={schemaVersion:1,id,question:text(body.message,LIMITS.question,'Question'),mode:String(body.mode||'qa').slice(0,64),askedAt:Date.now(),sourceBuild:String(body.clientBuild||'').slice(0,100),origin:'SERVER_REQUEST',status:'submitted'};
  const p=prefix(id),r=await s.setJSON(p+'.request',req,{onlyIfNew:true});
  if(!r.modified){const old=await get(s,id);if(!old||old.request.question!==req.question||old.request.mode!==req.mode)fail(409,'ID_CONFLICT','Question identifier is already in use.');return {auth,s,id,duplicate:old};}
  return {auth,s,id,req};
 }
 async function finish(job,body,result){let data;try{data=JSON.parse(result.body||'{}');}catch{data={};}
  const good=result.statusCode>=200&&result.statusCode<300&&!data.error;
  if(good){let ans;try{ans=completion(data,body);}catch(e){data.sharedHistory={id:job.id,saved:false,status:'answer-too-large',error:e.message};return {...result,body:JSON.stringify(data)};}
   if(ans){try{await putAnswer(job.s,job.id,ans);data.sharedHistory={id:job.id,saved:true,status:'complete'};}catch{data.sharedHistory={id:job.id,saved:false,status:'pending-answer-save',error:'Answer is visible locally but not confirmed shared. Retry its pending save.',retry:{sharedHistoryAction:'complete',id:job.id,answer:ans,receipt:receipt(job.auth,job.id,ans)}};}}
   else data.sharedHistory={id:job.id,saved:true,status:'pending',error:'Question saved; no final textual answer was returned.'};
  }else{const failure={at:Date.now(),message:'Ryan request did not return a completed answer. HTTP '+Number(result.statusCode||500)+'. No response text is promoted to verified information.'};try{await job.s.setJSON(prefix(job.id)+'.failure',failure,{onlyIfNew:true});}catch{}data.sharedHistory={id:job.id,saved:true,status:'failed'};}
  return {...result,headers:{...result.headers,...headers},body:JSON.stringify(data)};
 }
 async function action(event,body){const auth=authorize(event,env),s=store(event),a=body.sharedHistoryAction;
  if(a==='list'){
   const root=await s.list({prefix:'questions/',directories:true});const months=(root.directories||[]).map(x=>String(x).replace(/^questions\//,'').replace(/\/$/,'')).filter(x=>/^\d{4}-\d{2}$/.test(x)).sort().reverse();
   const month=body.month||months[0]||new Date().toISOString().slice(0,7);if(!/^\d{4}-\d{2}$/.test(month))fail(400,'MONTH','Choose a valid month.');
   const all=await s.list({prefix:'questions/'+month+'/'});let ids=(all.blobs||[]).map(x=>x.key).filter(k=>k.endsWith('.request')).map(k=>k.split('/').pop().replace(/\.request$/,'')).filter(validId).sort().reverse();
   const total=ids.length;if(body.before){if(!validId(body.before))fail(400,'CURSOR','Invalid history cursor.');ids=ids.filter(id=>id<body.before);}
   const page=ids.slice(0,LIMITS.page),items=await Promise.all(page.map(async(id)=>{const p=prefix(id),req=await s.get(p+'.request',{type:'json'});if(!req)return null;const ans=await s.getMetadata(p+'.answer'),failure=ans?null:await s.getMetadata(p+'.failure');return {id,question:req.question.slice(0,1400),askedAt:req.askedAt,mode:req.mode,sourceBuild:req.sourceBuild,status:ans?'complete':failure?'failed':'pending',published:req.origin==='CLIENT_PUBLISHED'};}));
   return response(200,{ok:true,shared:true,months,month,total,items:items.filter(Boolean),nextBefore:ids.length>page.length?page[page.length-1]:null,scope:'All signed-in site visitors; historical AI output is not verified plant knowledge.'});
  }
  if(a==='get'){const row=await get(s,body.id);if(!row)return response(404,{error:'Shared question not found.'});return response(200,{ok:true,...row});}
  if(a==='complete'){if(!checkReceipt(auth,body.receipt,body.id,body.answer))fail(403,'RECEIPT','Invalid or expired completion receipt.');if(!await s.get(prefix(body.id)+'.request'))fail(404,'NOT_FOUND','Shared question not found.');await putAnswer(s,body.id,body.answer);return response(200,{ok:true,id:body.id,saved:true});}
  if(a==='publish'){
   const r=body.record||{};text(r.question,LIMITS.question,'Question');text(r.answer,LIMITS.answer,'Answer');let id=body.id;if(!validId(id))fail(400,'ID','Invalid publish identifier.');
   const p=prefix(id),req={schemaVersion:1,id,question:r.question,mode:String(r.mode||'qa').slice(0,64),askedAt:Number(r.firstAskedAt)||Number(r.answeredAt)||Date.now(),sourceBuild:String(r.sourceBuild||'').slice(0,100),origin:'CLIENT_PUBLISHED',publishedAt:Date.now()};
   const previous=await s.get(p+'.request',{type:'json'});if(previous&&(previous.question!==req.question||previous.origin!=='CLIENT_PUBLISHED'))fail(409,'ID_CONFLICT','A different request owns this identifier.');
   const ans={reply:r.answer,workplan:safeJSON(r.workplan),cost:r.costUsd==null?null:{usd:Number(r.costUsd)},answeredAt:Number(r.answeredAt)||Date.now(),importedAt:Date.now(),source:'Browser-published historical answer - unverified, not server-generated in this request',partial:!!r.partial,reusable:false,liveDependent:true,containsLiveSnapshot:!!r.containsLiveSnapshot,contextKey:''};
   if(Buffer.byteLength(JSON.stringify(ans))>LIMITS.recordBytes)fail(413,'SIZE','Published answer too large.');
   if(previous){const old=await s.get(p+'.answer',{type:'json'});if(old){if(old.reply!==ans.reply)fail(409,'IMMUTABLE','An existing shared answer was not overwritten.');return response(200,{ok:true,id,saved:true,duplicate:true});}}
   else {const created=await s.setJSON(p+'.request',req,{onlyIfNew:true});if(!created.modified){const owner=await s.get(p+'.request',{type:'json'});if(!owner||owner.question!==req.question||owner.origin!=='CLIENT_PUBLISHED')fail(409,'ID_CONFLICT','A different request owns this identifier.');const old=await s.get(p+'.answer',{type:'json'});if(old){if(old.reply!==ans.reply)fail(409,'IMMUTABLE','An existing shared answer was not overwritten.');return response(200,{ok:true,id,saved:true,duplicate:true});}}}
   await putAnswer(s,id,ans);return response(200,{ok:true,id,saved:true});
  }
  fail(400,'ACTION','Unknown shared-history action.');
 }
 return {action,begin,finish,get,store};
}
module.exports={createService,authorize,parse,response,hash,validId,completedRecord,LIMITS};
