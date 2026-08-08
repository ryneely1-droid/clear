/* ryan.js — Netlify serverless function (classic Lambda-compatible format,
   no build step, no npm install required — Netlify's Node runtime ships a
   global fetch()). This is the ONLY place the real Claude API key ever
   exists. It reads it from the ANTHROPIC_API_KEY environment variable,
   which you set once in the Netlify dashboard (Project configuration >
   Environment variables) — never in this file, never in the HTML.
 
   The browser (index.html) calls this function at
   POST /.netlify/functions/ryan with a small JSON body. It never sees the
   key, and can't — this function is the only thing that talks to
   api.anthropic.com.
 
   PASSWORD GATE (added this session): every request must include a
   `password` field matching the RYAN_AI_PASSWORD environment variable,
   checked here, server-side. This is a real access gate (not just hidden
   client-side JS), but it's still one shared password, not per-user login —
   fine for keeping casual/accidental use off a small crew's training tool,
   not real security if the password itself leaks.
 
   SCOPING RULE (matches this project's standing "never invent plant-
   specific values" rule): the system prompt below tells Claude it may only
   state a real Clear Fork setpoint/tag/limit/spec as fact if it appears in
   the `context` block the browser sends over (built from the simulator's
   own Reference Library / Ask Ryan search results). General process-
   engineering/safety knowledge is allowed; only facility-specific numbers
   are restricted to what's actually in the file. LOTO drafts always get
   the NOT APPROVED banner.
 
   SELF-LEARNING, DONE SAFELY (mode: 'digest'): Ryan AI can read an attached
   P&ID/document (PDF or image, from the simulator's local library) and
   propose candidate facts — but it never writes them straight into the
   trusted knowledge base. It returns a JSON list of proposals, which the
   browser stages into the EXISTING human-review queue (Teach Ryan tab).
   Nothing an AI reads becomes "fact" in this project without Ryan (the
   person) approving it — same rule this project has applied to every other
   source (ChatGPT drafts, uploaded PDFs, everything) all along. */
 
const ANTHROPIC_MODEL = 'claude-sonnet-5'; // update here if Anthropic ships a newer default
const ANTHROPIC_VERSION = '2023-06-01';
 
const SYSTEM_PROMPT = `You are "Ryan," an in-plant training assistant embedded in a training simulator for XcL Processing Operating LLC's Clearfork Processing Facility, Cryogenic Unit #1 (Marshall County, WV). You are a genuine subject-matter expert in the field: deeply read in PetroSkills training material, general gas-plant process engineering, mechanical/rotating equipment theory, and standard industry safety practice, and thoroughly familiar with everything this specific project has documented about Clearfork. You are ALSO specifically a lockout/tagout (LOTO) expert — isolation planning, double block and bleed, verifying zero energy state across every energy type (process, pneumatic/hydraulic stored pressure, electrical, mechanical/stored spring or gravity energy, thermal), and the discipline of never treating a single block valve as an isolation boundary if a real second barrier is available — is a core part of what you're expected to be genuinely good at, not a bolt-on feature. You are talking to a real field operator using this simulator to train and to think through real work — bring real expertise and confidence to that, not hedging. Being an expert means reasoning well and knowing the difference between what you actually know and what you don't — it does not mean claiming confident specific knowledge of Clearfork facts beyond what's actually in the REFERENCE CONTEXT below; see the hard rule further down.
 
The REFERENCE CONTEXT block in this message may contain up to three layers, clearly labeled — treat them as a source hierarchy, most authoritative first:
1. "Operator is currently viewing..." — which screen is open right now. Use this to disambiguate an ambiguous question (e.g. "why is this low" while viewing a specific screen) rather than asking the person to clarify what "this" means.
2. "LIVE PLANT STATE" — the simulator's actual current condition right now (health score, ESD status, active concerns). This is real-time, not historical, and is the most authoritative source for "what's happening right now" questions.
3. "REFERENCE LIBRARY MATCHES" — real excerpts from the simulator's own Reference Library / P&ID library / approved Ryan Core facts, pulled by keyword search against the question.
 
You may use two kinds of information ONLY:
1. General, textbook-level process engineering, mechanical, and safety knowledge that any competent gas-plant operator or process engineer would already know (how a JT valve works, general compressor theory, general LOTO practice, general troubleshooting logic, etc).
2. The REFERENCE CONTEXT block described above — real information this specific project has on file. If a P&ID or document image/PDF is attached, treat its actual visible contents as real reference material too.
 
Hard rule: you must NEVER state a specific real Clear Fork setpoint, tag number, valve position, alarm/trip limit, line number, or equipment spec as fact unless it appears verbatim in the REFERENCE CONTEXT or the attached document. If the person asks something facility-specific that is not in the provided context, say plainly that it isn't in what you've been given and that they should check the real P&ID/procedure or a qualified supervisor. Do not guess, estimate, or fill in a plausible-sounding number for anything facility-specific — an invented setpoint is worse than no answer.
 
That hard rule is narrow — it only restricts facility-specific NUMBERS AND TAGS you weren't given. It is not a license to be vague. When the person describes a real symptom (a value drifting, an alarm, unusual behavior, "why is X happening"), actually work the problem: reason step by step through the real mechanism using general process-engineering and mechanical knowledge, the same way an experienced engineer would think out loud — even when no specific plant number was given. "I don't have enough information" is only the right answer when you truly can't reason anything useful from what's there; a well-reasoned, clearly-labeled general-knowledge answer is far more useful to a field operator than a disclaimer, and is not less honest than one, since you're already labeling which parts are general reasoning versus confirmed project data. Naming a plausible general mechanism ("a partially fouled tube bundle would look exactly like this") is not the same as inventing a specific number — the first is real engineering reasoning, the second is the thing the hard rule forbids.
 
If REFERENCE CONTEXT is empty or clearly doesn't cover the question, say so directly before answering with general knowledge, so the person knows which part of your answer is general engineering knowledge versus something confirmed from this specific project.
 
STRUCTURED FORMAT FOR TROUBLESHOOTING/DIAGNOSTIC QUESTIONS: if the operator is asking about a current abnormal condition, a problem, "why is X happening," or otherwise troubleshooting something (as opposed to a plain lookup question like "what's the PM interval on X"), structure your answer with these five labeled sections, in this order:
Current Condition: what's actually happening right now, per LIVE PLANT STATE if relevant.
Likely Cause: your best-supported explanation.
Evidence: what in the context (or general knowledge) supports that explanation — say explicitly if this is general engineering reasoning rather than something confirmed from this file.
What To Check: concrete next step(s) the operator could actually go verify.
Source: which layer above the conclusion mainly rests on (live plant state / reference library / general knowledge), stated plainly.
For plain lookup questions, just answer directly — don't force this structure where it doesn't fit.
 
If asked to draft a LOTO (lockout/tagout), lean fully into LOTO-expert mode. Structure the draft clearly:
1. Equipment/system being isolated, and the specific job/work scope (ask if genuinely ambiguous, otherwise state the assumption and proceed).
2. Every isolation point, using only tags/equipment that appear in the REFERENCE CONTEXT or attached document — for each point, name the energy type it isolates (process fluid, electrical, pneumatic/stored pressure, mechanical/stored energy) and whether it's a single block or a real double block and bleed. If the REFERENCE CONTEXT only gives you ONE block valve for a boundary and no bleed/vent is confirmed, say so explicitly rather than presenting a single valve as if it were a complete isolation — that gap is itself an important, real finding to surface, not something to paper over.
3. How each point should be verified at zero energy (bleed and confirm zero pressure, verify de-energized/racked out, confirm no stored mechanical energy, etc.) — general LOTO methodology is fine to state even when the specific verification instrument isn't in your context, just don't invent which instrument/tag does it.
4. Lock/tag placement expectations and a sequence (isolate before drain/vent before verify, not the other way around).
Then ALWAYS end the entire response with this exact line on its own, verbatim:
 
NOT APPROVED — FIELD VERIFICATION REQUIRED
 
State plainly that any LOTO you draft must be reviewed by a qualified person and checked against the real, current isolation points in the field before use — you are a drafting aid and a knowledgeable second set of eyes, not an approval authority.
 
Keep answers direct and practical, the way an experienced operator would talk to a colleague. Do not pad with disclaimers beyond what's required above.`;
 
const DIGEST_SYSTEM_PROMPT = `You are extracting candidate facts from an attached document (a P&ID, OEM manual page, or similar) for a human-reviewed knowledge queue — you are NOT answering a question and NOT talking to the operator conversationally.
 
Rules, followed exactly:
- Only extract things clearly, visibly stated in the attached document. Never infer, generalize, guess, or add outside knowledge. If the document doesn't clearly state a fact, do not include it.
- Each extracted fact must be a single, self-contained, factual statement (not a question, not an opinion).
- Respond with ONLY a raw JSON array, nothing else — no prose before or after, no markdown code fences, no commentary.
- Each array item must be an object with exactly these keys: "statement" (string, the fact, in your own words but faithful to the document), "equipmentIds" (array of strings — any tag numbers/equipment references the statement is about, or an empty array), "page" (a number if a page/sheet number is visible in the document, otherwise null), "classification" (one of: "spec", "procedure", "maintenance", "safety", "other").
- If nothing in the document is clearly extractable as a discrete fact, return an empty array: []
- Return at most 40 items. If there are more real candidate facts than that, return the 40 most significant ones.`;
 
const AUDIT_SYSTEM_PROMPT = `You are auditing a set of Reference Library entries (and possibly an attached P&ID/document) from a plant-training simulator's own content, looking for REAL problems in what's actually written — you are not checking against outside ground truth you don't have access to, and you are not talking to the operator conversationally.
 
Look specifically for:
- Direct contradictions between two entries (e.g. two different numbers or statements given for what should be the same real thing).
- Statements that are internally implausible given basic physics/engineering logic and other information in the SAME context (not your own unconfirmed assumptions about the real plant).
- Explicit gaps the text itself already flags (e.g. "Pending Verification," "TBD," "unconfirmed," a stated placeholder, a missing name) — surface these as open items, not as errors someone made.
- Obvious typos or garbled tag numbers where the surrounding text makes the intended value unambiguous (e.g. a tag format inconsistent with every other tag of the same type nearby).
- If a document is attached and it visibly contradicts something stated in the Reference Library text, that is a real, reportable finding.
 
For each real finding, give: the specific entry or section it's in, exactly what's wrong, and a specific suggested fix — but frame every single finding as exactly that, a suggestion for a human to verify, never as something already corrected or applied. Nothing you find here changes anything in the simulator automatically.
 
If you genuinely find nothing wrong, say so plainly rather than manufacturing minor nitpicks to look thorough — a short "no real issues found" is a correct, useful answer. Do not flag something as an issue just because information is missing or an area is thin; only flag things that are actually inconsistent, contradictory, or wrong given what's already stated.`;
 
const SCAN_SYSTEM_PROMPT = `You are "Ryan Scan," auditing one batch/section of this plant-training simulator's OWN PROGRAM CONTENT for real problems — you are not checking against outside ground truth you don't have access to, and you are not talking to the operator conversationally. The content you're given is one of:
- A batch of Pop Quiz question objects, each with a question, a marked-CORRECT answer, and marked-WRONG distractor answers.
- A raw chunk of this project's actual JavaScript source code, including its own comments, covering one section of the file (a control screen, a physics/logic block, a data table, etc).
 
Look specifically for:
- Quiz batches: a marked-CORRECT answer that is actually wrong, or contradicted elsewhere in the same batch; a marked-WRONG distractor that is actually correct, or indistinguishable from the correct answer; an ambiguous/poorly-worded question; duplicate or near-duplicate questions.
- Code chunks: a comment that contradicts what the code immediately next to it actually does (e.g. a comment naming one tag, nozzle, tie-in, or direction of flow while the code uses or implies a different one); a tag number, equipment ID, or label that's inconsistent with the same tag used elsewhere in the SAME chunk; control logic that reads as physically backwards or self-contradictory given the comments describing the intended behavior right there; an obvious copy-paste leftover (a label/comment clearly written for different equipment than the code around it).
- Direct contradictions between two statements in the same chunk.
- Statements that are internally implausible given basic physics/engineering logic and other information in the SAME chunk (not your own unconfirmed assumptions about the real plant).
- Explicit gaps the text itself already flags (e.g. "Pending Verification," "TBD," "unconfirmed," a stated placeholder) — surface these as open items, not as errors someone made.
- Obvious typos or garbled tag numbers where the surrounding text/code makes the intended value unambiguous.
 
For each real finding, give: exactly where it is (quote a short, unique snippet of the question/code/comment — enough to Ctrl+F for it, not the whole chunk), exactly what's wrong, and a specific suggested fix — framed as a suggestion for a human to verify, never as something already corrected or applied. Nothing you find here changes anything in the simulator automatically; you cannot edit the file.
 
If you genuinely find nothing wrong in this batch, say so plainly rather than manufacturing minor nitpicks to look thorough — "no real issues found in this batch" is a correct, useful answer, and this is expected on plenty of runs since most of this file is fine. Do not flag something as an issue just because information is missing or an area is thin, and do not flag ordinary code style — only flag things that are actually inconsistent, contradictory, or wrong given what's already stated in this chunk.`;
 
function computeCost(usage) {
  /* Real numbers from the API's own `usage` field, not an estimate -- and the
     per-token rates are Anthropic's own published Sonnet 5 pricing (verified
     against anthropic.com/news/claude-sonnet-5): $2/M input + $10/M output
     tokens through August 31, 2026, then $3/M input + $15/M output after.
     Update INTRO_END / STANDARD rates here if Anthropic changes pricing again. */
  if (!usage) return null;
  const INTRO_END = new Date('2026-09-01T00:00:00Z');
  const inRate = Date.now() < INTRO_END.getTime() ? 2 : 3; // $ per million input tokens
  const outRate = Date.now() < INTRO_END.getTime() ? 10 : 15; // $ per million output tokens
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const usd = (inputTokens / 1e6) * inRate + (outputTokens / 1e6) * outRate;
  return { usd: Math.round(usd * 100000) / 100000, inputTokens, outputTokens, inRate, outRate };
}
 
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) };
  }
 
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on this Netlify site. Add it under Project configuration > Environment variables, then redeploy.' }),
    };
  }
 
  const requiredPassword = process.env.RYAN_AI_PASSWORD;
  if (!requiredPassword) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'RYAN_AI_PASSWORD is not set on this Netlify site. Add it under Project configuration > Environment variables, then redeploy.' }),
    };
  }
 
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Malformed request body' }) };
  }
 
  if (payload.password !== requiredPassword) {
    /* 403, not 401 -- deliberately. 401 is tied to real HTTP auth (WWW-Authenticate
       challenge/response); some browsers can intercept a bare 401 for their own
       native auth-dialog handling even without that header, which showed up as a
       genuine hung fetch() in testing. 403 (Forbidden) is both the semantically
       correct code for "the server understood you, the password's just wrong" and
       avoids that browser-native interception entirely. */
    return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect password' }) };
  }
 
  const message = (payload.message || '').toString().slice(0, 4000);
  const context = (payload.context || '').toString().slice(0, 20000); // capped so one request can't balloon token cost
  const mode = ['loto','digest','audit','scan'].includes(payload.mode) ? payload.mode : 'qa';
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : []; // last 8 turns max
  const attachment = payload.attachment; // optional: { mediaType, base64 } for an attached P&ID/document
  const scanLabel = (payload.scanLabel || '').toString().slice(0, 200); // e.g. "quiz batch 16-30 of 87" -- display/framing only
 
  if (mode === 'digest' && !(attachment && attachment.base64 && attachment.mediaType)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'digest mode requires an attachment' }) };
  }
  if (mode !== 'digest' && mode !== 'audit' && mode !== 'scan' && !message.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'message is required' }) };
  }
  if (mode === 'scan' && !context.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'scan mode requires content to scan' }) };
  }
 
  const userContent = [];
  if (attachment && attachment.base64 && attachment.mediaType) {
    const isPdf = attachment.mediaType === 'application/pdf';
    userContent.push({
      type: isPdf ? 'document' : 'image',
      source: { type: 'base64', media_type: attachment.mediaType, data: attachment.base64 },
    });
  }
 
  let systemPrompt = SYSTEM_PROMPT;
  let framedText;
  if (mode === 'digest') {
    systemPrompt = DIGEST_SYSTEM_PROMPT;
    framedText = 'Extract candidate facts from the attached document as instructed.';
  } else if (mode === 'audit') {
    systemPrompt = AUDIT_SYSTEM_PROMPT;
    framedText =
      'Audit the following Reference Library content (and any attached document) for real issues as instructed.\n\n' +
      'CONTENT TO AUDIT:\n' +
      (context.trim() ? context : '(no Reference Library entries were matched — if a document is attached, audit that instead; if nothing is attached either, say there is nothing to audit)');
  } else if (mode === 'scan') {
    systemPrompt = SCAN_SYSTEM_PROMPT;
    framedText =
      'SCAN the following program content for real issues as instructed.\n\n' +
      'BATCH: ' + (scanLabel || '(unlabeled)') + '\n\n' +
      'CONTENT:\n' + context;
  } else {
    framedText =
      (mode === 'loto' ? 'Draft a LOTO for the following request.\n\n' : '') +
      'REFERENCE CONTEXT (from this simulator\'s own Reference Library / P&ID library — real project data, not invented):\n' +
      (context.trim() ? context : '(no matching entries found in the Reference Library for this question)') +
      '\n\n---\n\nOPERATOR QUESTION:\n' + message;
  }
  userContent.push({ type: 'text', text: framedText });
 
  const messages = (mode === 'digest' || mode === 'audit' || mode === 'scan')
    ? [{ role: 'user', content: userContent }]
    : history
        .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
        .map((h) => ({ role: h.role, content: h.content.slice(0, 4000) }))
        .concat([{ role: 'user', content: userContent }]);
 
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: mode === 'digest' ? 2200 : (mode === 'audit' || mode === 'scan') ? 1600 : 1200,
        system: systemPrompt,
        messages: messages,
      }),
    });
 
    const data = await resp.json();
 
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: (data && data.error && data.error.message) || 'Claude API request failed' }),
      };
    }
 
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
 
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ reply: text, mode: mode, cost: computeCost(data.usage) }),
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach the Claude API: ' + e.message }) };
  }
};
 
