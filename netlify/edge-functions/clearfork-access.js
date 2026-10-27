/*12NM presentation: clean geometric reconstruction from IMG_0767.jpeg. Straight horizontal/vertical letter edges; preserved SVG aspect ratio. Not an official vector master. Authentication remains unchanged v1.1.*/
/**
 * Clear Fork access presentation v1.4 / build 12NK, 2026-10-26; authentication remains v1.1.
 * User-supplied EQT mark extracted from IMG_0766.jpeg; no external image request.
 * Presentation repair: visible source-derived inline SVG mark, build diagnostics and packaging. No remote image or image-policy dependency.
 * Repairs native form POST origin suppressed by the former no-referrer policy.
 * Strict same-origin, CSRF and password checks remain required.
 * Diagnostics log only fixed event/reason codes, never submitted values.
 * No simulator source, plant state, localStorage or IndexedDB is modified.
 * Configure ONLY in Netlify UI, Functions scope:
 *   CLEARFORK_SITE_PASSWORD   (case-sensitive; do not put its value in this file)
 *   CLEARFORK_SESSION_SECRET  (at least 32 random characters; generate privately)
 *
 * Requires the matching 00-clearfork-login-limit.js for platform rate limiting.
 * This is a shared-password acknowledgement, NOT verified employee identity/SSO.
 * Apply through Git-connected Netlify builds, not static file drag-and-drop.
 * Test the deployed gate, direct files, function endpoints and old deploy URLs.
 */
const VERSION = 'clearfork-access-v1.1';
const PREFIX = '/__clearfork';
const SESSION = '__Host-clearfork_access';
const ENTRY = '__Host-clearfork_entry';
const CSRF = '__Host-clearfork_csrf';
const SESSION_SECONDS = 12 * 60 * 60;
const MAX_FORM_BYTES = 4096;
const enc = new TextEncoder();
const dec = new TextDecoder();


const UI_VERSION = '1.5'; // Presentation only; VERSION remains v1.1 for cookie compatibility.
const UI_BUILD = '12NM';
const EQT_MARK_SVG = "<svg id=\"cfEqtMark12NH\" data-artwork-revision=\"12NM\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 820 286\" preserveAspectRatio=\"xMidYMid meet\" role=\"img\" aria-labelledby=\"cfEqtTitle12NH\" focusable=\"false\"><title id=\"cfEqtTitle12NH\">EQT</title><g fill=\"#17243b\"><path d=\"M5 5H283C254 21 234 40 224 65H82V94H212V146H82V179H223C233 204 252 224 283 240H5Z\"/><path d=\"M512 5H815L772 66H691V240H617V66H567C555 40 537 20 512 5Z\"/><path d=\"M227 94C234 40 286 5 395 5C498 5 553 38 565 93C551 121 528 144 497 158C506 143 509 127 509 110C509 75 485 61 395 61C312 61 294 75 294 109C294 126 298 145 308 158C275 142 246 121 227 94Z\"/><path d=\"M368 141H356L398 186H410Z M410 242L368 282H356L398 243Z M565 119C563 153 554 177 537 199L530 193C549 174 562 146 565 119Z\"/></g><g fill=\"#c51f46\"><path d=\"M223 117C243 154 272 176 314 183C348 188 375 186 410 186L368 141H444L526 212L444 282H368L410 242C347 244 293 234 260 209C234 189 221 160 223 117Z\"/><path d=\"M564 117C553 137 529 156 500 168L532 195C551 175 562 150 564 117Z\"/></g></svg>";
const CSS = `
:root{color-scheme:dark;font-family:"Segoe UI",Arial,sans-serif;color:#eaf1f8;background:#080f19;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100svh;display:grid;place-items:center;padding:32px 20px;background:radial-gradient(ellipse at 15% 10%,#203449 0,transparent 48%),radial-gradient(ellipse at 90% 100%,#281927 0,transparent 45%),#080f19}
main{width:min(100%,960px);border:1px solid #344b60;border-radius:24px;background:#101c2a;box-shadow:0 30px 100px #0008;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr)}
.identity{padding:44px 36px;background:linear-gradient(155deg,#192b3d,#101c2a);border-right:1px solid #2b4054;display:flex;flex-direction:column;justify-content:center;position:relative}.identity:before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:#c51f45}.logo-wrap{background:#fff;border-radius:14px;padding:24px 23px 21px;width:100%;max-width:360px;box-shadow:0 8px 30px #0002}.logo-wrap svg{display:block;width:100%;height:auto;transform:none;aspect-ratio:820/286;min-height:64px}.logo-caption{display:block;margin:12px 0 0;color:#243549;font-size:13px;font-weight:750;letter-spacing:.15em;text-align:center}.eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;color:#d6a9b5;margin:30px 0 9px}.site{font-size:31px;font-weight:750;line-height:1.12;letter-spacing:-.02em;color:#fff;margin:0}.identity .sub{margin:10px 0 0;color:#bacada;font-size:16px}.identity .purpose{font-size:13px;line-height:1.7;color:#91a6bb;max-width:300px;margin:28px 0 0}.identity .bar{width:40px;height:3px;background:#ce2b50;margin:23px 0 0}
.access{padding:42px 38px;min-width:0}.brand{margin:0 0 9px;font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:#a9c3d8;font-weight:700}.brand:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#ce2b50;margin-right:8px}h1{font-size:24px;line-height:1.25;letter-spacing:-.02em;margin:0 0 25px;color:#fff}h2{font-size:19px;line-height:1.35;margin:22px 0 10px}p{line-height:1.65;font-size:14px;color:#bbccdc}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px}.row form,.row button{width:100%}.row form{margin:0}
label{display:block;font-size:14px;margin:20px 0 9px;font-weight:600}.note{font-size:12px;color:#9fb4c9;font-weight:400}input{width:100%;font:16px/1.4 "Segoe UI",Arial,sans-serif;min-height:52px;padding:13px 14px;color:#fff;background:#09121f;border:1px solid #577187;border-radius:9px}input:focus,button:focus-visible,a:focus-visible{outline:3px solid #8bd6ff;outline-offset:3px}
button{font:600 15px/1.3 "Segoe UI",Arial,sans-serif;min-height:50px;padding:12px 16px;border:1px solid #4a6378;border-radius:9px;cursor:pointer;background:#1b2e41;color:#f5f8fb;touch-action:manipulation}.primary{background:#b71940;border-color:#d1375b;box-shadow:0 5px 16px #710d2426}.primary:hover{background:#ca234b}.deny{background:#1b2b3c;border-color:#53687b}.deny:hover{background:#293e53}.wide{width:100%;margin-top:17px}#backButton{background:transparent;border-color:#34495e;color:#bfd1e0}.error{padding:13px 14px;border:1px solid #bd5e74;border-left:4px solid #e06a83;background:#361a27;border-radius:9px;color:#ffe6ed;overflow-wrap:anywhere;font-size:13px}a{color:#a5d8ff;text-underline-offset:3px}.footer{font-size:11px;line-height:1.65;color:#9cb0c3;margin:29px 0 0;border-top:1px solid #2c4055;padding-top:17px}.footer span{display:block}.footer .version{margin-top:7px;color:#8299af}[hidden]{display:none!important}
@media(max-width:650px){body{padding:16px 12px;align-items:start}main{grid-template-columns:1fr;border-radius:18px;max-width:460px}.identity{padding:25px 24px 21px;border-right:0;border-bottom:1px solid #2b4054;display:block}.logo-wrap{max-width:238px;padding:15px 17px;border-radius:10px}.logo-caption{font-size:10px;margin-top:10px}.eyebrow{margin:17px 0 6px;font-size:10px}.site{font-size:25px}.identity .sub{font-size:13px;margin-top:6px}.identity .purpose,.identity .bar{display:none}.access{padding:24px}h1{font-size:22px;margin-bottom:21px}.footer{margin-top:23px}}
@media(max-width:350px){body{padding:9px}main{border-radius:14px}.identity,.access{padding:20px}.site{font-size:23px}.row{gap:9px}}
@media(max-height:500px) and (min-width:651px){body{padding:16px}.identity{padding:24px}.access{padding:25px}.eyebrow{margin-top:20px}.identity .purpose{margin-top:16px}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
`;


function b64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function unb64(s) {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error('Invalid encoding');
  const bin = atob(s.replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
function randomToken() { return b64(crypto.getRandomValues(new Uint8Array(32))); }
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function cookies(request) {
  const out = Object.create(null);
  for (const part of (request.headers.get('cookie') || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const key = part.slice(0,i).trim();
    // Reject duplicate security cookies rather than selecting an arbitrary one.
    out[key] = Object.hasOwn(out,key) ? '' : part.slice(i+1).trim();
  }
  return out;
}
function cookie(name,value,maxAge) {
  return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict${maxAge === undefined ? '' : '; Max-Age='+maxAge}`;
}
function clearCookies(response) {
  for (const name of [SESSION,ENTRY,CSRF]) response.headers.append('Set-Cookie',cookie(name,'',0));
  return response;
}
function noStore(headers = new Headers()) {
  headers.set('Cache-Control','private, no-store, max-age=0');
  headers.set('CDN-Cache-Control','no-store');
  headers.set('Netlify-CDN-Cache-Control','no-store');
  headers.set('Pragma','no-cache');
  headers.set('X-Clearfork-Access', VERSION);
  headers.set('X-Clearfork-Access-UI', UI_BUILD+' / '+UI_VERSION);
  headers.set('X-Clearfork-Brand', 'EQT-inline-mark');
  return headers;
}
function reply(text,status=200,type='text/plain; charset=utf-8') {
  const headers = noStore();
  headers.set('Content-Type',type);
  headers.set('X-Content-Type-Options','nosniff');
  // Native form navigation under no-referrer sends Origin: null in browsers.
  // Keep same-site origin validation enabled; suppress referrers only cross-origin.
  headers.set('Referrer-Policy','same-origin');
  headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
  return new Response(text,{status,headers});
}
function page(content,status=200,script='') {
  const nonce = randomToken();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="same-origin"><title>Clear Fork | Authorized access</title><style nonce="${nonce}">${CSS}</style></head><body><main aria-label="Clear Fork employee access"><aside class="identity" aria-label="Clearfork Cryo"><div class="logo-wrap">${EQT_MARK_SVG}<span class="logo-caption">CLEARFORK CRYO</span></div><p class="eyebrow">CLEARFORK CRYO</p><p class="site">Cryogenic Unit #1</p><p class="sub">Operator training &amp; reference</p><div class="bar" aria-hidden="true"></div><p class="purpose">Explore the plant. Understand the process.<br>Practice with the equipment and source library.</p></aside><div class="access"><p class="brand">Restricted access</p><h1>Authorized employee access</h1>${content}<p class="footer"><span>Employee acknowledgement and shared password.<br>Not company single sign-on or proof of employment.</span><span class="version">EQT access screen ${UI_BUILD} &middot; v${UI_VERSION}<br>Authentication v1.1</span></p></div></main>${script ? `<script nonce="${nonce}">${script}</script>` : ''}</body></html>`;
  const res = reply(html,status,'text/html; charset=utf-8');
  res.headers.set('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; img-src data:; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`);
  res.headers.set('X-Frame-Options','DENY');
  return res;
}
function validReturn(raw,origin) {
  // No redirects to arbitrary assets, other websites, authentication endpoints or schemes.
  if (typeof raw !== 'string' || raw.length>2000 || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || /[\r\n]/.test(raw)) return '/';
  try {
    const u = new URL(raw,origin);
    if(u.origin!==origin || !['/','/index.html'].includes(u.pathname)) return '/';
    return u.pathname+u.search;
  } catch { return '/'; }
}
function loginPage(to='/', error='',passwordStep=false,status=200) {
  const csrf = randomToken();
  const token = `<input type="hidden" name="csrf" value="${csrf}"><input type="hidden" name="returnTo" value="${escapeHTML(to)}">`;
  const content = `${error ? `<p class="error" role="alert">${escapeHTML(error)}</p>` : ''}
<section id="employeeStep"${passwordStep?' hidden':''}><h2>Are you an EQT employee?</h2><p>This simulator is restricted to authorized EQT employees.</p><div class="row"><button id="yesButton" type="button" class="primary">Yes</button><form method="post" action="${PREFIX}/deny">${token}<button type="submit" class="deny">No</button></form></div></section>
<section id="passwordStep"${passwordStep?'':' hidden'}><h2>Enter the program password</h2><form method="post" action="${PREFIX}/login" autocomplete="off">${token}<input type="hidden" name="employee" value="yes"><label for="sitePassword">Password <span class="note">(case-sensitive)</span></label><input id="sitePassword" name="password" type="password" required maxlength="256" autocomplete="off" spellcheck="false" autocapitalize="none"><button type="submit" class="primary wide">Enter program</button></form><button id="backButton" class="wide" type="button">Back</button></section>
<noscript><p class="error">JavaScript must be enabled to answer the employee question. The simulator also requires JavaScript.</p></noscript>`;
  const script = `const employee=document.getElementById('employeeStep'),password=document.getElementById('passwordStep'),input=document.getElementById('sitePassword');document.getElementById('yesButton').onclick=()=>{employee.hidden=true;password.hidden=false;input.focus()};document.getElementById('backButton').onclick=()=>{input.value='';employee.hidden=false;password.hidden=true;document.getElementById('yesButton').focus()};if(!password.hidden)input.focus();`;
  const res = page(content,status,script);
  res.headers.append('Set-Cookie',cookie(CSRF,csrf,600));
  return res;
}
async function equalText(a,b) {
  const [ad,bd] = await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);
  const av=new Uint8Array(ad),bv=new Uint8Array(bd);let difference=0;
  for(let i=0;i<av.length;i++)difference|=av[i]^bv[i];
  return difference===0;
}
async function signingKey(password,secret) {
  // Bind tokens to both secrets so changing either invalidates prior cookies.
  const root=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const derived=await crypto.subtle.sign('HMAC',root,enc.encode(VERSION+'\0'+password));
  return crypto.subtle.importKey('raw',derived,{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
async function signToken(data,key) {
  const payload=b64(enc.encode(JSON.stringify(data)));
  return payload+'.'+b64(await crypto.subtle.sign('HMAC',key,enc.encode(payload)));
}
async function verifyToken(value,key,audience,type,maxLifetime) {
  try {
    if(typeof value!=='string'||value.length>5000)return null;
    const bits=value.split('.');if(bits.length!==2)return null;
    const signature=unb64(bits[1]);if(signature.length!==32)return null;
    if(!await crypto.subtle.verify('HMAC',key,signature,enc.encode(bits[0])))return null;
    const p=JSON.parse(dec.decode(unb64(bits[0]))),now=Math.floor(Date.now()/1000);
    if(p.v!==1||p.aud!==audience||p.type!==type||!Number.isSafeInteger(p.iat)||!Number.isSafeInteger(p.exp)||p.iat>now+30||p.exp<=now||p.exp<=p.iat||p.exp-p.iat>maxLifetime)return null;
    return p;
  }catch{return null;}
}
const FORM_REASONS = new Set(['origin','type','size','body','csrf_missing','csrf_mismatch','duplicate']);
function accessDiagnostic(event,reason='') {
  // Fixed allowlist only: never log an exception message, URL, password, body or cookie.
  const events=new Set(['form_rejected','password_rejected','login_accepted','configuration_missing','runtime_failure']);
  const safeEvent=events.has(event)?event:'runtime_failure';
  const safeReason=FORM_REASONS.has(reason)?reason:(reason==='unknown'?'unknown':'');
  try { console.info(JSON.stringify({component:'clearfork-access',version:VERSION,event:safeEvent,reason:safeReason})); } catch { /* Logging must never change access decisions. */ }
}
function invalidForm(error,to='/',signOut=false) {
  const reason=FORM_REASONS.has(error?.message)?error.message:'unknown';
  accessDiagnostic('form_rejected',reason);
  const messages={
    origin:'The browser did not send a valid same-site page origin. Open the published HTTPS site directly in a new tab and try again.',
    csrf_missing:'The login security cookie is missing or expired. Open the site homepage again and allow cookies for this site. Do not clear saved simulator data.',
    csrf_mismatch:'This form no longer matches the browser security cookie. Close older login tabs, reopen the homepage and try again.',
    size:'The submitted form is too large. Open the site homepage and try again.',
    type:'This request was not a supported login form. Open the site homepage and try again.',
    body:'The submitted form was empty. Open the site homepage and try again.',
    duplicate:'The submitted form contained repeated fields. Open the site homepage and try again.',
    unknown:'The login form could not be verified. Open the site homepage and try again.'
  };
  const message=messages[reason]+' Reference: CF-AUTH-'+reason.toUpperCase()+'.';
  const res=signOut
    ? page('<h2>Sign-out form could not be verified</h2><p class="error" role="alert">'+escapeHTML(message)+'</p><p><a href="'+PREFIX+'/logout">Reload sign-out form</a></p>',403)
    : loginPage(to,message,false,403);
  res.headers.set('X-Clearfork-Access-Reason',reason);
  return res;
}

async function readForm(request,url) {
  // Origin plus host-only double-submit token; not merely a visual Yes button.
  if(request.headers.get('origin')!==url.origin)throw new Error('origin');
  if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get('content-type')||''))throw new Error('type');
  if(Number(request.headers.get('content-length')||0)>MAX_FORM_BYTES)throw new Error('size');
  const reader=request.body?.getReader();if(!reader)throw new Error('body');
  let total=0,parts=[];
  try {while(true){const chunk=await reader.read();if(chunk.done)break;total+=chunk.value.byteLength;if(total>MAX_FORM_BYTES){await reader.cancel();throw new Error('size');}parts.push(chunk.value);}}
  finally {reader.releaseLock();}
  const bytes=new Uint8Array(total);let offset=0;for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  const form=new URLSearchParams(dec.decode(bytes));
  const csrf=form.get('csrf')||'', expected=cookies(request)[CSRF]||'';
  if(!expected)throw new Error('csrf_missing');
  if(csrf.length>128||!await equalText(csrf,expected))throw new Error('csrf_mismatch');
  for(const k of ['csrf','password','employee','returnTo'])if(form.getAll(k).length>1)throw new Error('duplicate');
  return form;
}
async function protectedResponse(context,consumeEntry=false) {
  const downstream=await context.next();
  const headers=noStore(new Headers(downstream.headers));
  if(consumeEntry)headers.append('Set-Cookie',cookie(ENTRY,'',0));
  // Stream unchanged bytes. No HTML injection or simulator-source rewriting.
  return new Response(downstream.body,{status:downstream.status,statusText:downstream.statusText,headers});
}
function denied() {
  return clearCookies(page('<h2>Access denied</h2><p>This program is restricted to authorized EQT employees.</p><p><a href="/">Return to the access screen</a></p>',403));
}
async function handle(request,context) {
  const url=new URL(request.url),path=url.pathname;
  if(url.protocol!=='https:')return reply('HTTPS is required for Clear Fork access.',403);
  const password=Netlify.env.get('CLEARFORK_SITE_PASSWORD');
  const secret=Netlify.env.get('CLEARFORK_SESSION_SECRET');
  if(typeof password!=='string'||password.length<1||password.length>256||typeof secret!=='string'||secret.length<32){
    accessDiagnostic('configuration_missing');
    return page('<h2>Access protection is not configured</h2><p>The site owner must set the Clear Fork password and session secret in Netlify, then redeploy. The simulator remains locked.</p>',503);
  }
  const audience=VERSION+'|'+url.origin;
  const jar=cookies(request),key=await signingKey(password,secret);
  if(path===PREFIX+'/login') {
    if(request.method==='GET')return loginPage();
    if(request.method!=='POST')return reply('Method not allowed',405);
    let form;try{form=await readForm(request,url);}catch(error){return invalidForm(error);}
    if(form.get('employee')!=='yes')return denied();
    const supplied=form.get('password')||'',to=validReturn(form.get('returnTo'),url.origin);
    if(!supplied||supplied.length>256||!await equalText(supplied,password)){
      accessDiagnostic('password_rejected');
      return loginPage(to,'Incorrect password. Passwords are case-sensitive.',true,401);
    }
    const now=Math.floor(Date.now()/1000),sid=randomToken();
    const session=await signToken({v:1,type:'session',aud:audience,iat:now,exp:now+SESSION_SECONDS,sid},key);
    const entry=await signToken({v:1,type:'entry',aud:audience,iat:now,exp:now+90,to,sid},key);
    const res=reply('',303);res.headers.set('Location',to);
    res.headers.append('Set-Cookie',cookie(SESSION,session));
    res.headers.append('Set-Cookie',cookie(ENTRY,entry,90));
    res.headers.append('Set-Cookie',cookie(CSRF,'',0));
    accessDiagnostic('login_accepted');
    return res;
  }
  if(path===PREFIX+'/deny') {
    if(request.method!=='POST')return reply('Method not allowed',405);
    try{await readForm(request,url);}catch(error){return invalidForm(error);}
    return denied();
  }
  if(path===PREFIX+'/logout') {
    if(request.method==='POST'){
      try{await readForm(request,url);}catch(error){return invalidForm(error,'/',true);}
      return clearCookies(page('<h2>Signed out</h2><p>Server access has been locked. Close any other open simulator tabs on this computer. Saved plant history and settings have not been deleted.</p><p><a href="/">Return to the access screen</a></p>'));
    }
    if(request.method!=='GET')return reply('Method not allowed',405);
    const csrf=randomToken();const res=page(`<h2>Sign out of Clear Fork?</h2><p>This ends server access for this browser. It does not delete your saved plant history or settings.</p><form method="post" action="${PREFIX}/logout"><input type="hidden" name="csrf" value="${csrf}"><button class="deny wide">Sign out</button></form>`);
    res.headers.append('Set-Cookie',cookie(CSRF,csrf,600));return res;
  }
  const session=await verifyToken(jar[SESSION],key,audience,'session',SESSION_SECONDS);
  if(path===PREFIX+'/status')return reply(JSON.stringify({accessAddon:VERSION,authenticated:!!session,expiresAt:session?.exp||null,accessScreenBuild:UI_BUILD,accessScreenVersion:UI_VERSION,branding:'EQT-inline-mark'}),session?200:401,'application/json; charset=utf-8');
  if(path.startsWith(PREFIX+'/'))return reply('Not found',404);
  const mainPage=path==='/'||path==='/index.html';
  if(mainPage && (request.method==='GET'||request.method==='HEAD')) {
    // An active approved session can open the existing secondary control screen.
    // cfClient never grants a session or authorizes unauthenticated content.
    if(session&&url.searchParams.get('cfClient')==='1')return protectedResponse(context);
    const entry=session&&await verifyToken(jar[ENTRY],key,audience,'entry',90);
    if(entry&&entry.sid===session.sid&&entry.to===path+url.search&&request.method==='GET')return protectedResponse(context,true);
    return loginPage(path+url.search);
  }
  if(!session) {
    return reply(JSON.stringify({error:'CLEARFORK_LOGIN_REQUIRED',message:'Open the site homepage and sign in before requesting simulator files or Ryan AI.'}),401,'application/json; charset=utf-8');
  }
  // Protect any mutating requests, including Ryan, against foreign-browser origins.
  if(!['GET','HEAD','OPTIONS'].includes(request.method)&&request.headers.get('origin')!==url.origin)return reply('Cross-origin request blocked',403);
  return protectedResponse(context);
}
export default async function clearforkAccess(request,context) {
  try { return await handle(request,context); }
  catch { accessDiagnostic('runtime_failure'); return page('<h2>Access is temporarily unavailable</h2><p>The simulator remains locked. The site owner should review the access configuration and deployment.</p>',503); }
}
export const config = {path:'/*',onError:'fail'};
