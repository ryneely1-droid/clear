/**
 * Clear Fork access add-on v1.0, 2026-10-22.
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
const VERSION = 'clearfork-access-v1';
const PREFIX = '/__clearfork';
const SESSION = '__Host-clearfork_access';
const ENTRY = '__Host-clearfork_entry';
const CSRF = '__Host-clearfork_csrf';
const SESSION_SECONDS = 12 * 60 * 60;
const MAX_FORM_BYTES = 4096;
const enc = new TextEncoder();
const dec = new TextDecoder();

const CSS = `
:root{color-scheme:dark;font-family:Segoe UI,Arial,sans-serif;background:#09121c;color:#edf3fb}
*{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;background:radial-gradient(ellipse at top,#183044,#09121c 68%)}
main{width:min(100%,490px);padding:32px;border:1px solid #385269;border-radius:18px;background:#101e2b;box-shadow:0 22px 70px #0008}
.brand{margin:0 0 8px;color:#93cbe9;letter-spacing:.14em;font-size:12px;font-weight:700}h1{font-size:25px;line-height:1.25;margin:0 0 18px}h2{font-size:19px;margin:24px 0 16px}p{line-height:1.55;color:#becbd8}label{display:block;font-size:14px;margin-bottom:8px}
input{width:100%;font:inherit;padding:13px;border:1px solid #678297;border-radius:8px;background:#09121c;color:#fff}input:focus,button:focus-visible,a:focus-visible{outline:3px solid #b2dfff;outline-offset:3px}
.row{display:flex;gap:12px;margin-top:18px}button{font:600 15px Segoe UI,Arial,sans-serif;min-height:47px;padding:12px 20px;border:1px solid #557c96;border-radius:8px;cursor:pointer;background:#1b3a51;color:#fff}.row button{flex:1}button.primary{background:#167255;border-color:#299b78}button.deny{background:#572c32;border-color:#a0636a}.wide{width:100%;margin-top:18px}
.note{font-size:12px;color:#94aabd}.error{padding:12px;background:#421f26;border:1px solid #a0636a;border-radius:8px;color:#ffe0e0}a{color:#a6d7ff}.footer{font-size:11px;color:#70899e;margin:22px 0 0;border-top:1px solid #294050;padding-top:13px}[hidden]{display:none!important}@media(max-width:430px){body{padding:12px}main{padding:24px 20px}h1{font-size:22px}}
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
  return headers;
}
function reply(text,status=200,type='text/plain; charset=utf-8') {
  const headers = noStore();
  headers.set('Content-Type',type);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Referrer-Policy','no-referrer');
  headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
  return new Response(text,{status,headers});
}
function page(content,status=200,script='') {
  const nonce = randomToken();
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Clear Fork | Authorized access</title><style nonce="${nonce}">${CSS}</style></head><body><main><p class="brand">CLEAR FORK CRYOGENIC UNIT #1</p><h1>Authorized employee access</h1>${content}<p class="footer">Access add-on v1.0 | Employee acknowledgement and shared password</p></main>${script ? `<script nonce="${nonce}">${script}</script>` : ''}</body></html>`;
  const res = reply(html,status,'text/html; charset=utf-8');
  res.headers.set('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'`);
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
  if(!expected||csrf.length>128||!await equalText(csrf,expected))throw new Error('csrf');
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
    return page('<h2>Access protection is not configured</h2><p>The site owner must set the Clear Fork password and session secret in Netlify, then redeploy. The simulator remains locked.</p>',503);
  }
  const audience=VERSION+'|'+url.origin;
  const jar=cookies(request),key=await signingKey(password,secret);
  if(path===PREFIX+'/login') {
    if(request.method==='GET')return loginPage();
    if(request.method!=='POST')return reply('Method not allowed',405);
    let form;try{form=await readForm(request,url);}catch{return loginPage('/','This form expired or could not be verified. Please start again.',false,403);}
    if(form.get('employee')!=='yes')return denied();
    const supplied=form.get('password')||'',to=validReturn(form.get('returnTo'),url.origin);
    if(!supplied||supplied.length>256||!await equalText(supplied,password))return loginPage(to,'Incorrect password. Passwords are case-sensitive.',true,401);
    const now=Math.floor(Date.now()/1000),sid=randomToken();
    const session=await signToken({v:1,type:'session',aud:audience,iat:now,exp:now+SESSION_SECONDS,sid},key);
    const entry=await signToken({v:1,type:'entry',aud:audience,iat:now,exp:now+90,to,sid},key);
    const res=reply('',303);res.headers.set('Location',to);
    res.headers.append('Set-Cookie',cookie(SESSION,session));
    res.headers.append('Set-Cookie',cookie(ENTRY,entry,90));
    res.headers.append('Set-Cookie',cookie(CSRF,'',0));
    return res;
  }
  if(path===PREFIX+'/deny') {
    if(request.method!=='POST')return reply('Method not allowed',405);
    try{await readForm(request,url);}catch{return reply('Invalid form. Return to the site entrance.',403);}
    return denied();
  }
  if(path===PREFIX+'/logout') {
    if(request.method==='POST'){
      try{await readForm(request,url);}catch{return reply('Invalid sign-out form. Reload the sign-out page.',403);}
      return clearCookies(page('<h2>Signed out</h2><p>Server access has been locked. Close any other open simulator tabs on this computer. Saved plant history and settings have not been deleted.</p><p><a href="/">Return to the access screen</a></p>'));
    }
    if(request.method!=='GET')return reply('Method not allowed',405);
    const csrf=randomToken();const res=page(`<h2>Sign out of Clear Fork?</h2><p>This ends server access for this browser. It does not delete your saved plant history or settings.</p><form method="post" action="${PREFIX}/logout"><input type="hidden" name="csrf" value="${csrf}"><button class="deny wide">Sign out</button></form>`);
    res.headers.append('Set-Cookie',cookie(CSRF,csrf,600));return res;
  }
  const session=await verifyToken(jar[SESSION],key,audience,'session',SESSION_SECONDS);
  if(path===PREFIX+'/status')return reply(JSON.stringify({accessAddon:VERSION,authenticated:!!session,expiresAt:session?.exp||null}),session?200:401,'application/json; charset=utf-8');
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
  catch { return page('<h2>Access is temporarily unavailable</h2><p>The simulator remains locked. The site owner should review the access configuration and deployment.</p>',503); }
}
export const config = {path:'/*',onError:'fail'};
