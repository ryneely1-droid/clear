'use strict';
// Clear Fork 12OS: authenticated answers survive shared-storage outages, 2026-11-07.
// Server-only shared Q&A. Never log credentials, URLs, question text or raw SDK errors.
// Same cloud namespace/schema/authentication; deferred shared saves are explicit and signed.
// No provider/authentication bypass. Storage outage no longer blocks an authenticated AI request.
// Retains the installed @netlify/blobs dependency. Site-scoped records survive deployments.
// JSON conditional writes use Store.set, avoiding the setJSON condition-header defect in 10.7.11.
// The transport rejects non-success HTTP responses before an older SDK can misreport a write.
const crypto = require('node:crypto');
const { AsyncLocalStorage } = require('node:async_hooks');
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
 const diagnosticRevision = '12OS-answer-recovery';
 const storageScope = new AsyncLocalStorage();
 const pending = new Map();
 const questionBudget = options.questionBudgetMs || 2000;
 const answerBudget = options.answerBudgetMs || 1500;
 const actionBudget = options.actionBudgetMs || 10000;
 const cacheLife = 10 * 60 * 1000, cacheLimit = 48, cacheBytes = 8 * 1024 * 1024;
 function prune() {
  const now=Date.now();let bytes=0;
  for(const [id,x] of pending) { if(now-x.created>cacheLife)pending.delete(id);else bytes+=x.bytes||0; }
  for(const [id,x] of pending) { if(pending.size<cacheLimit&&bytes<=cacheBytes)break;if(x.result){bytes-=x.bytes||0;pending.delete(id);} }
 }
 function requestFingerprint(body,origin) {
  // Only the hash is retained; no auth token/password/cookie is kept in this cache.
  return hash(JSON.stringify({origin,message:body.message,mode:body.mode||'qa',context:body.context||'',history:body.history||[],attachment:body.attachment||null,learned:body.learnedKnowledge||null,index:body.indexReferenceContext||null}));
 }
 function remember(job,result) {
  const x=pending.get(job.id);if(x){x.result=result;x.bytes=Buffer.byteLength(result.body||'');prune();}return result;
 }
 function replayResult(result) {
  let d;try{d=JSON.parse(result.body);}catch{return result;}
  if(d.reply||d.workplan)d.cost={usd:0,reused:true};
  if(d.sharedHistory)d.sharedHistory.requestAlreadyCompleted=true;
  return {...result,body:JSON.stringify(d)};
 }
 async function storageCall(stage,budget,fn) {
  const scope={deadline:Date.now()+budget,controller:new AbortController(),expired:false};
  let timer;
  try {
   return await Promise.race([
    storageScope.run(scope,()=>Promise.resolve().then(fn)),
    new Promise((_,reject)=>{timer=setTimeout(()=>{scope.expired=true;scope.controller.abort();const e=new Error('Storage deadline');e.storageTimeout12OQ=true;reject(storageError(e,stage));},budget);})
   ]);
  } catch(e) { if(e&&e.statusCode&&e.statusCode<500)throw e;throw storageError(e,stage); }
  finally {clearTimeout(timer);}
 }
 function recoveryReceipt(auth,id,request,answer) {
  const iat=Math.floor(Date.now()/1000),p={v:1,type:'ryan-deferred-history',id,origin:auth.origin,requestDigest:hash(JSON.stringify(request)),answerDigest:hash(JSON.stringify(answer)),iat,exp:iat+604800};
  const s=Buffer.from(JSON.stringify(p)).toString('base64url');return s+'.'+hmac(auth.key,'ryan-history-recovery\0'+s).toString('base64url');
 }
 function checkRecovery(auth,body) {
  try {
   const token=body.receipt;if(typeof token!=='string'||token.length>2000)return false;
   const parts=token.split('.');if(parts.length!==2||!parts.every(x=>/^[A-Za-z0-9_-]+$/.test(x)))return false;
   const [s,sig]=parts;if(!eq(Buffer.from(sig,'base64url'),hmac(auth.key,'ryan-history-recovery\0'+s)))return false;
   const p=JSON.parse(Buffer.from(s,'base64url').toString('utf8')),now=Math.floor(Date.now()/1000);
   return p.v===1&&p.type==='ryan-deferred-history'&&p.id===body.id&&p.origin===auth.origin&&Number.isSafeInteger(p.iat)&&Number.isSafeInteger(p.exp)&&p.iat<=now+30&&p.exp>now&&p.exp>p.iat&&p.exp-p.iat<=604800&&p.requestDigest===hash(JSON.stringify(body.request))&&p.answerDigest===hash(JSON.stringify(body.answer));
  }catch{return false;}
 }
 function deferredAnswer(job,answer,reason) {
  return {id:job.id,saved:false,status:'pending-history-save',diagnosticRevision,error:'Answer is available. Shared history is NOT saved yet; use Questions Asked > Retry pending saves. No second AI request is needed.',storageCode:reason||'SHARED_STORAGE_ERROR',retry:{sharedHistoryAction:'recover',id:job.id,request:job.req,answer,receipt:recoveryReceipt(job.auth,job.id,job.req,answer)}};
 }

 // This function deliberately never returns/logs an arbitrary upstream message, request,
 // URL, exception stack, body, cookie, environment value or SDK credential.
 function storageError(error, operation) {
  if(error && error.sharedStorageDiagnostic12OQ)return error;
  const statusCandidates=[error&&error.storageHttpStatus,error&&error.status,error&&error.statusCode,error&&error.response&&error.response.status];
  const httpStatus=statusCandidates.find(n=>Number.isInteger(n)&&n>=400&&n<=599)||null;
  const name=String(error&&error.name||'');
  const rawCode=String(error&&error.code||error&&error.cause&&error.cause.code||'');
  const timeout=error&&error.storageTimeout12OQ || name==='AbortError'||name==='TimeoutError'||['ETIMEDOUT','UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT'].includes(rawCode);
  const networkCodes=['ENOTFOUND','EAI_AGAIN','ECONNREFUSED','ECONNRESET','ENETUNREACH','EHOSTUNREACH','CERT_HAS_EXPIRED','UNABLE_TO_VERIFY_LEAF_SIGNATURE','DEPTH_ZERO_SELF_SIGNED_CERT','ERR_TLS_CERT_ALTNAME_INVALID'];
  const network=networkCodes.includes(rawCode);
  let code='SHARED_STORAGE_ERROR',reason='The shared-history storage operation failed. Its underlying provider cause is not yet identified.';
  if(timeout){code='SHARED_STORAGE_TIMEOUT';reason='The Netlify storage request timed out.';}
  else if(httpStatus===401||httpStatus===403){code='SHARED_STORAGE_ACCESS';reason='Netlify storage rejected the function request (HTTP '+httpStatus+'). This is not the Ryan unlock password.';}
  else if(httpStatus===429){code='SHARED_STORAGE_RATE_LIMIT';reason='Netlify storage rate-limited the request (HTTP 429).';}
  else if(httpStatus&&httpStatus>=500){code='SHARED_STORAGE_UPSTREAM';reason='Netlify storage returned HTTP '+httpStatus+'.';}
  else if(httpStatus){code='SHARED_STORAGE_HTTP';reason='Netlify storage returned HTTP '+httpStatus+'.';}
  else if(network){code='SHARED_STORAGE_NETWORK';reason='The function could not complete its storage connection ('+rawCode+').';}
  else if(error&&error.name==='TypeError'){code='SHARED_STORAGE_SDK_TYPE';reason='A storage SDK/runtime type error occurred; raw credentials and payload are not logged.';}
   else if(operation==='connect'){code='SHARED_STORAGE_CONTEXT';reason='The function could not initialize its Netlify Blobs runtime connection.';}
  else if(operation==='write-acknowledgment'){code='SHARED_STORAGE_ACK';reason='Storage did not return a valid conditional-write acknowledgment. A saved question is not confirmed.';}
  const ref=crypto.randomBytes(6).toString('hex');
  const info={revision:diagnosticRevision,code,operation,upstreamStatus:httpStatus,reference:ref};
  // Log safe categorical information only. Network codes are from the allowlist above.
  if(network)info.networkCode=rawCode;
  console.error('[Ryan shared storage] '+JSON.stringify(info));
  const out=new Error('Shared-history storage needs attention ['+code+']. '+reason+' Stage: '+operation+'. Support reference: '+ref+'. Keep the existing passwords, secrets and history.');
  out.statusCode=502;out.code=code;out.sharedStorageDiagnostic12OQ=true;
  return out;
 }
 function store(event){
  if(options.store)return options.store;
  let sdk;
  try{sdk=options.sdk||require('@netlify/blobs');}
  catch{fail(502,'SHARED_SDK','Shared-history storage needs attention [SHARED_SDK]. The @netlify/blobs dependency could not load. Check the existing package.json and function build. Do not change the Ryan password.');}
  try{
   sdk.connectLambda(event);
   const context=String(env.CLEARFORK_HISTORY_NAMESPACE||env.CONTEXT||'production');
   const name=context==='production'?'clearfork-ryan-questions-v1':'clearfork-ryan-questions-v1-'+context.replace(/[^a-z0-9-]/gi,'-');
   return sdk.getStore({name,consistency:'strong',fetch:async(url,init={})=>{
    const active=storageScope.getStore();
    if(active&&(active.expired||Date.now()>=active.deadline)){const e=new Error('Storage budget exhausted');e.storageTimeout12OQ=true;throw storageError(e,'transport');}
    const controller=new AbortController();let timedOut=false;
    const abort=()=>{timedOut=true;controller.abort();};
    if(active)active.controller.signal.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(abort,active?Math.max(1,Math.min(8000,active.deadline-Date.now())):8000);
    try{
     const res=await (options.fetch||globalThis.fetch)(url,{...init,signal:controller.signal});
     const method=String(init.method||(url&&url.method)||'GET').toUpperCase();
     // Missing reads and failed atomic preconditions belong to the SDK's normal protocol.
     const expectedMissing=(method==='GET'||method==='HEAD')&&res.status===404;
     const expectedCondition=method==='PUT'&&res.status===412;
     if(!res.ok&&!expectedMissing&&!expectedCondition){
      try{if(res.body&&res.body.cancel)await res.body.cancel();}catch{}
      const err=new Error('Netlify storage HTTP failure');err.storageHttpStatus=res.status;throw err;
     }
     return res;
    }catch(e){
     if(timedOut){const err=new Error('Netlify storage deadline');err.storageTimeout12OQ=true;throw storageError(err,'transport');}
     throw storageError(e,'transport');
    }finally{clearTimeout(timer);if(active)active.controller.signal.removeEventListener('abort',abort);}
   }});
  }catch(e){throw storageError(e,'connect');}
 }
 async function writeNewJSON(s,key,value){
  let result;
  try{
   // Store.set passes conditional-write options correctly in the retained 10.7.11 SDK.
   result=await s.set(key,JSON.stringify(value),{onlyIfNew:true});
  }catch(e){throw storageError(e,'write');}
  if(!result||typeof result.modified!=='boolean')throw storageError(null,'write-acknowledgment');
  return result;
 }
 async function get(s,id){const p=prefix(id),req=await s.get(p+'.request',{type:'json'});if(!req)return null;const answer=await s.get(p+'.answer',{type:'json'});if(answer)return {id,status:'complete',request:req,record:completedRecord(req,answer)};const error=await s.get(p+'.failure',{type:'json'});return {id,status:error?'failed':'pending',request:req,error:error?error.message:null};}
 async function putAnswer(s,id,answer){const key=prefix(id)+'.answer';for(let n=0;n<3;n++){try{const r=await writeNewJSON(s,key,answer);if(r.modified)return true;const old=await s.get(key,{type:'json'});if(old&&hash(JSON.stringify(old))===hash(JSON.stringify(answer)))return true;fail(409,'IMMUTABLE','An answer already exists; it was not overwritten.');}catch(e){if(e.statusCode===409||n===2)throw e;await new Promise(r=>setTimeout(r,80*(n+1)));}}}
 async function begin(event,body){
  // Site/session and request validation MUST succeed before degraded operation is allowed.
  const auth=authorize(event,env),id=body.sharedQuestionId;
  if(!validId(id)||Math.abs(Date.now()-Number(id.slice(0,13)))>86400000)fail(400,'ID','Refresh the question request and try again.');
  const req={schemaVersion:1,id,question:text(body.message,LIMITS.question,'Question'),mode:String(body.mode||'qa').slice(0,64),askedAt:Date.now(),sourceBuild:String(body.clientBuild||'').slice(0,100),origin:'SERVER_REQUEST',status:'submitted'};
  const fingerprint=requestFingerprint(body,auth.origin);prune();
  const prior=pending.get(id);
  if(prior){
   if(prior.fingerprint!==fingerprint)fail(409,'ID_CONFLICT','Question identifier is already in use for different content.');
   if(prior.result)return {auth,id,replay:replayResult(prior.result)};
   fail(409,'REQUEST_IN_PROGRESS','This question is already being processed. A second AI request was not sent.');
  }
  if(pending.size>=cacheLimit)fail(429,'REQUEST_CAPACITY','Ryan already has many active questions in this worker. No new AI call was sent.');
  pending.set(id,{fingerprint,created:Date.now(),result:null,bytes:0});
  const job={auth,id,req,s:null,deferred:false};
  try {
   return await storageCall('question-save',questionBudget,async()=>{
    const s=store(event);job.s=s;const p=prefix(id),r=await writeNewJSON(s,p+'.request',req);
    if(!r.modified){job.questionExists=true;const old=await get(s,id);if(!old||old.request.question!==req.question||old.request.mode!==req.mode)fail(409,'ID_CONFLICT','Question identifier is already in use.');if(!job.deferred)pending.delete(id);return {auth,s,id,duplicate:old};}
    return job;
   });
  }catch(e){
   if(e&&e.statusCode&&e.statusCode<500){pending.delete(id);throw e;}
   if(job.questionExists){pending.delete(id);fail(409,'QUESTION_STATUS_UNAVAILABLE','This question already exists in shared history, but its answer status is unavailable. A second AI request was not sent.');}
   job.deferred=true;job.storageCode=e&&e.code||'SHARED_STORAGE_ERROR';
   // This is explicit degraded availability, NOT a successful shared save.
   return job;
  }
 }
 async function finish(job,body,result){
  let data;try{data=JSON.parse(result.body||'{}');}catch{data={};}
  const good=result.statusCode>=200&&result.statusCode<300&&!data.error;
  if(good){
   let ans;try{ans=completion(data,body);}catch(e){data.sharedHistory={id:job.id,saved:false,status:'answer-too-large',error:e.message};return remember(job,{...result,body:JSON.stringify(data)});}
   if(ans){
    if(job.deferred){data.sharedHistory=deferredAnswer(job,ans,job.storageCode);}
    else {try{await storageCall('answer-save',answerBudget,()=>putAnswer(job.s,job.id,ans));data.sharedHistory={id:job.id,saved:true,status:'complete',diagnosticRevision};}
     catch(e){data.sharedHistory={id:job.id,saved:false,status:'pending-answer-save',diagnosticRevision,error:'Answer is available but its shared save is not confirmed. Retry pending saves without requesting another AI answer.',retry:{sharedHistoryAction:'complete',id:job.id,answer:ans,receipt:receipt(job.auth,job.id,ans)}};}}
   }else data.sharedHistory={id:job.id,saved:!job.deferred,status:job.deferred?'not-saved':'pending',diagnosticRevision,error:'No final textual answer was returned. No completed answer save is claimed.'};
  }else{
   if(!job.deferred){const failure={at:Date.now(),message:'Ryan request did not return a completed answer. HTTP '+Number(result.statusCode||500)+'. No response text is promoted to verified information.'};try{await storageCall('failure-save',Math.min(answerBudget,750),()=>writeNewJSON(job.s,prefix(job.id)+'.failure',failure));}catch{}}
   data.sharedHistory={id:job.id,saved:!job.deferred,status:job.deferred?'not-saved':'failed',diagnosticRevision};
  }
  return remember(job,{...result,headers:{...result.headers,...headers,'x-ryan-history-revision':diagnosticRevision},body:JSON.stringify(data)});
 }
 async function recover(event,body,auth){
  if(!checkRecovery(auth,body))fail(403,'RECEIPT','Invalid or expired history-recovery receipt. Your local answer has not been deleted.');
  const req=body.request,ans=body.answer;
  if(!req||req.id!==body.id||req.schemaVersion!==1||req.origin!=='SERVER_REQUEST'||req.status!=='submitted'||!Number.isSafeInteger(req.askedAt)||typeof req.mode!=='string'||req.mode.length>64||typeof req.sourceBuild!=='string'||req.sourceBuild.length>100)fail(400,'CONTENT','Invalid recovery request.');
  text(req.question,LIMITS.question,'Question');if(!ans||typeof ans.reply!=='string'||ans.reply.length>LIMITS.answer||!Number.isSafeInteger(ans.answeredAt))fail(400,'CONTENT','Invalid recovery answer.');
  if(Buffer.byteLength(JSON.stringify(ans))>LIMITS.recordBytes)fail(413,'SIZE','Recovery answer is too large.');
  const s=store(event),p=prefix(body.id),created=await writeNewJSON(s,p+'.request',req);
  if(!created.modified){const old=await s.get(p+'.request',{type:'json'});if(!old||hash(JSON.stringify(old))!==hash(JSON.stringify(req)))fail(409,'ID_CONFLICT','A different question already owns this identifier. Nothing was overwritten.');}
  await putAnswer(s,body.id,ans);pending.delete(body.id);
  return response(200,{ok:true,id:body.id,saved:true,diagnosticRevision,recovered:true});
 }
 async function actionInternal(event,body){const auth=authorize(event,env),a=body.sharedHistoryAction;
  if(a==='recover')return recover(event,body,auth);
  const s=store(event);
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
   else {const created=await writeNewJSON(s,p+'.request',req);if(!created.modified){const owner=await s.get(p+'.request',{type:'json'});if(!owner||owner.question!==req.question||owner.origin!=='CLIENT_PUBLISHED')fail(409,'ID_CONFLICT','A different request owns this identifier.');const old=await s.get(p+'.answer',{type:'json'});if(old){if(old.reply!==ans.reply)fail(409,'IMMUTABLE','An existing shared answer was not overwritten.');return response(200,{ok:true,id,saved:true,duplicate:true});}}}
   await putAnswer(s,id,ans);return response(200,{ok:true,id,saved:true});
  }
  fail(400,'ACTION','Unknown shared-history action.');
 }
 async function action(event,body){return storageCall('history-action',actionBudget,()=>actionInternal(event,body));}
 return {action,begin,finish,get,store,diagnosticRevision};
}
module.exports={createService,authorize,parse,response,hash,validId,completedRecord,LIMITS};
