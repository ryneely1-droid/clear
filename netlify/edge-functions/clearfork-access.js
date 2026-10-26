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


const UI_VERSION = '1.4'; // Presentation only; VERSION remains v1.1 for cookie compatibility.
const UI_BUILD = '12NK';
const EQT_MARK_SVG = "<svg id=\"cfEqtMark12NH\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 744 272\" role=\"img\" aria-labelledby=\"cfEqtTitle12NH\" focusable=\"false\"><title id=\"cfEqtTitle12NH\">EQT</title><path fill=\"#141d28\" fill-rule=\"evenodd\" d=\"M338 231L330 231L329 232L327 232L326 231L326 232L320 238L319 238L316 241L313 242L294 258L289 261L289 263L304 264L301 264L300 263L309 255L310 255L317 249L321 247L327 241L335 236L338 233ZM296 142L296 144L299 147L300 147L307 154L308 154L324 169L325 169L329 173L330 173L332 175L331 177L333 177L334 176L336 177L343 177L344 176L343 174L342 174L339 171L337 171L334 167L331 166L325 159L324 159L319 154L318 154L317 152L315 151L309 145L308 142ZM474 138L472 139L471 141L471 147L468 151L468 155L465 159L465 161L463 164L463 167L459 170L458 174L452 179L451 182L444 189L443 189L438 195L444 201L446 201L450 197L450 196L457 188L458 185L461 182L462 179L466 174L465 173L468 169L468 167L470 164L469 163L469 161L472 156L473 141L474 140L473 139ZM236 26L230 26L229 25L228 26L227 25L224 25L223 26L222 25L221 26L220 25L218 25L217 26L213 26L212 25L210 26L209 25L208 26L203 26L202 25L201 26L200 25L195 25L194 26L193 25L192 26L189 26L188 25L184 25L183 26L182 25L181 26L180 25L175 25L174 26L173 25L172 26L171 25L162 25L161 26L158 24L147 25L146 26L145 25L144 26L141 26L140 25L139 26L138 25L129 25L128 26L126 25L118 25L117 26L116 25L115 26L105 26L104 25L101 25L100 26L99 25L98 26L97 25L90 25L89 26L88 25L86 26L85 25L82 25L81 26L80 25L67 25L66 26L64 25L61 25L60 26L59 25L51 25L50 26L48 25L47 26L46 25L39 25L38 26L37 25L36 26L31 26L29 29L29 33L28 34L28 42L29 44L28 45L27 57L26 58L26 61L27 62L27 67L25 70L26 71L25 72L25 74L26 75L26 82L25 83L26 84L26 87L25 88L26 89L26 91L25 92L26 93L25 94L25 106L24 107L24 125L22 128L22 140L21 141L22 142L22 152L21 153L21 156L22 157L22 162L21 163L21 174L20 175L20 181L19 182L19 185L20 186L19 192L20 194L19 195L19 204L18 205L18 212L17 213L20 216L26 216L27 217L62 217L63 218L82 218L83 219L97 219L98 220L111 220L112 221L150 221L151 222L168 222L169 223L186 223L187 224L204 224L205 225L227 225L227 224L225 222L224 222L215 214L212 213L197 197L195 193L190 188L189 184L186 180L185 175L182 172L178 172L177 171L174 171L173 172L168 172L167 171L158 171L157 170L155 170L154 171L138 171L137 170L102 170L101 169L100 170L99 169L84 169L83 168L79 169L76 166L76 156L77 155L76 150L77 149L77 144L79 142L84 142L85 143L104 143L105 144L114 143L115 144L176 145L177 144L176 142L176 140L177 139L177 137L176 136L177 109L179 105L179 103L177 100L168 100L167 101L164 101L161 99L146 100L145 99L127 99L126 98L122 98L121 99L112 99L111 98L109 98L108 99L105 99L104 98L82 98L81 97L81 81L80 80L80 77L81 76L88 76L89 75L92 75L95 77L96 76L101 76L102 75L104 75L105 76L114 76L115 75L118 75L119 76L143 76L144 77L146 77L147 76L162 76L163 77L185 77L188 75L190 68L197 60L199 55L203 52L203 50L204 49L206 49L212 42L216 40L226 32L230 31L233 28L236 27ZM722 25L719 25L718 24L716 24L715 25L709 25L708 26L704 24L703 25L701 25L700 24L676 25L675 24L668 24L667 23L663 25L661 24L659 24L658 25L654 25L653 24L649 24L648 25L643 24L642 25L639 25L637 24L635 25L633 23L631 23L630 24L625 24L624 25L619 25L618 24L616 24L615 25L588 25L587 24L585 24L584 25L571 25L570 26L569 25L568 26L567 25L561 25L560 24L558 24L557 25L554 25L553 26L552 25L542 24L541 25L520 25L519 26L517 25L499 25L498 26L488 26L487 25L483 25L482 26L458 26L457 25L453 25L452 26L451 25L450 26L435 26L434 27L434 28L436 29L438 31L438 32L441 32L444 34L445 33L448 35L448 37L449 37L451 40L454 41L458 46L462 48L465 51L465 52L473 63L474 66L477 69L477 71L480 77L481 77L484 80L484 81L488 81L489 80L506 80L507 81L518 81L519 80L521 80L525 83L525 85L524 86L524 98L523 99L523 119L522 120L522 131L521 132L522 133L522 144L521 145L522 146L521 147L521 156L520 157L520 164L521 165L521 168L519 171L520 175L519 176L519 185L518 186L518 210L517 211L518 212L517 213L517 228L516 229L516 238L517 239L538 239L539 240L554 240L555 241L583 241L584 240L584 232L585 231L585 226L584 225L584 223L585 222L585 217L586 216L585 215L585 200L586 199L586 190L587 189L587 176L588 175L588 162L589 161L589 133L590 132L590 121L593 116L591 113L592 97L594 95L594 92L593 91L593 84L596 81L597 82L598 81L606 81L609 83L613 81L626 81L627 82L629 82L630 81L674 81L682 73L684 69L688 65L689 65L698 55L698 54L704 48L706 44L713 37L713 36L717 32L717 31L721 27L722 27ZM474 100L472 97L472 94L470 91L470 86L466 79L465 75L460 70L460 67L459 65L450 56L450 55L448 53L447 53L440 47L437 46L431 41L427 40L420 36L418 36L417 35L413 35L406 30L399 30L398 29L390 28L387 26L380 26L379 25L375 25L374 24L372 24L371 25L369 24L364 24L363 25L361 25L357 23L345 23L344 22L338 22L336 21L335 22L321 22L320 23L317 23L316 22L307 22L304 24L297 24L296 23L294 23L291 26L281 26L280 27L274 26L268 30L267 29L266 30L261 30L255 33L253 33L252 34L251 33L246 36L242 36L240 37L237 40L235 40L228 45L224 46L209 60L205 68L201 72L201 74L198 77L194 85L194 88L193 89L193 96L191 99L191 102L194 106L195 111L197 113L198 116L206 124L206 125L211 130L213 134L214 134L220 141L222 141L231 149L233 149L240 154L242 154L246 157L250 157L251 156L251 154L249 151L249 148L247 146L245 142L246 141L245 140L245 137L246 136L245 135L246 133L245 132L245 128L246 127L245 126L245 120L246 119L245 118L246 117L246 113L247 112L248 106L250 103L249 102L250 101L250 99L255 94L256 91L259 88L261 88L265 84L267 83L270 83L272 81L274 81L275 80L278 80L282 77L283 78L287 78L288 77L289 78L290 77L297 77L298 76L314 76L315 75L321 75L322 76L331 76L332 75L336 75L337 76L345 76L346 77L352 77L353 76L356 76L357 77L366 77L367 78L368 77L369 78L372 78L373 79L377 79L384 82L385 81L389 83L391 85L396 86L401 91L401 92L404 95L406 100L408 102L408 104L410 108L409 109L410 110L410 120L411 121L411 133L410 134L409 144L407 147L407 149L405 153L402 156L402 158L401 159L401 161L403 162L404 161L407 161L414 157L415 158L417 156L426 152L428 150L432 149L444 139L448 137L461 124L461 123L467 116L469 112L473 108L474 106L473 101Z\"/><path fill=\"#bd1740\" fill-rule=\"evenodd\" d=\"M474 133L472 132L470 133L455 148L454 148L450 152L449 152L448 154L435 161L429 166L425 166L415 171L414 173L432 190L433 190L437 194L438 194L441 191L441 190L450 182L451 179L457 174L458 170L462 167L462 164L464 161L464 159L467 155L467 151L470 147L470 141L471 139L474 137ZM188 124L188 127L189 128L188 130L188 143L189 144L189 152L190 153L190 157L193 161L193 165L194 166L195 171L197 175L199 177L202 184L210 193L210 194L226 208L232 211L237 215L239 215L244 218L246 218L253 221L256 221L259 223L261 223L265 225L278 226L279 227L284 227L285 228L294 228L295 229L319 229L320 230L321 229L325 231L326 230L327 231L329 231L330 230L338 230L339 231L339 233L335 237L327 242L321 248L317 250L301 263L304 263L305 264L312 264L313 265L338 265L339 266L340 265L341 266L358 266L360 264L364 262L368 258L376 253L388 243L392 241L395 238L398 237L398 236L401 233L406 231L410 227L421 220L427 214L430 213L434 210L434 207L430 203L429 203L420 193L419 193L411 185L410 185L406 181L406 180L404 180L402 178L402 177L398 175L373 151L372 151L363 144L350 144L349 143L317 143L316 142L309 142L310 145L315 150L316 150L318 152L318 153L319 153L324 158L325 158L331 165L334 166L337 170L339 170L344 174L345 176L343 178L336 178L335 177L333 178L321 178L320 177L318 178L317 177L316 178L314 177L313 178L311 177L310 178L309 177L284 177L283 176L271 176L270 175L262 175L260 173L259 174L253 171L251 171L248 169L243 169L239 166L235 164L233 164L231 162L227 161L223 157L220 156L217 153L216 153L196 133L196 132L193 129L190 124Z\"/></svg>";
const CSS = `
:root{color-scheme:dark;font-family:"Segoe UI",Arial,sans-serif;color:#eaf1f8;background:#080f19;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;min-height:100vh;min-height:100svh;display:grid;place-items:center;padding:32px 20px;background:radial-gradient(ellipse at 15% 10%,#203449 0,transparent 48%),radial-gradient(ellipse at 90% 100%,#281927 0,transparent 45%),#080f19}
main{width:min(100%,960px);border:1px solid #344b60;border-radius:24px;background:#101c2a;box-shadow:0 30px 100px #0008;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.08fr)}
.identity{padding:44px 36px;background:linear-gradient(155deg,#192b3d,#101c2a);border-right:1px solid #2b4054;display:flex;flex-direction:column;justify-content:center;position:relative}.identity:before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:#c51f45}.logo-wrap{background:#fff;border-radius:14px;padding:19px 22px;width:100%;max-width:320px;box-shadow:0 8px 30px #0002}.logo-wrap svg{display:block;width:100%;height:auto;aspect-ratio:744/272;min-height:64px}.logo-caption{display:block;margin:12px 0 0;color:#243549;font-size:11px;font-weight:750;letter-spacing:.2em;text-align:center}.eyebrow{font-size:11px;font-weight:700;letter-spacing:.18em;color:#d6a9b5;margin:30px 0 9px}.site{font-size:31px;font-weight:750;line-height:1.12;letter-spacing:-.02em;color:#fff;margin:0}.identity .sub{margin:10px 0 0;color:#bacada;font-size:16px}.identity .purpose{font-size:13px;line-height:1.7;color:#91a6bb;max-width:300px;margin:28px 0 0}.identity .bar{width:40px;height:3px;background:#ce2b50;margin:23px 0 0}
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
