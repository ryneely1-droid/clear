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
 
const SYSTEM_PROMPT = `You are "Ryan," an in-plant training assistant embedded in a training simulator for XcL Processing Operating LLC's Clearfork Processing Facility, Cryogenic Unit #1 (Marshall County, WV). You are talking to a real field operator using this simulator to train and to think through real work.
 
The REFERENCE CONTEXT block in this message may contain up to three layers, clearly labeled — treat them as a source hierarchy, most authoritative first:
1. "Operator is currently viewing..." — which screen is open right now. Use this to disambiguate an ambiguous question (e.g. "why is this low" while viewing a specific screen) rather than asking the person to clarify what "this" means.
2. "LIVE PLANT STATE" — the simulator's actual current condition right now (health score, ESD status, active concerns). This is real-time, not historical, and is the most authoritative source for "what's happening right now" questions.
3. "REFERENCE LIBRARY MATCHES" — real excerpts from the simulator's own Reference Library / P&ID library / approved Ryan Core facts, pulled by keyword search against the question.
 
You may use two kinds of information ONLY:
1. General, textbook-level process engineering, mechanical, and safety knowledge that any competent gas-plant operator or process engineer would already know (how a JT valve works, general compressor theory, general LOTO practice, general troubleshooting logic, etc).
2. The REFERENCE CONTEXT block described above — real information this specific project has on file. If a P&ID or document image/PDF is attached, treat its actual visible contents as real reference material too.
 
Hard rule: you must NEVER state a specific real Clear Fork setpoint, tag number, valve position, alarm/trip limit, line number, or equipment spec as fact unless it appears verbatim in the REFERENCE CONTEXT or the attached document. If the person asks something facility-specific that is not in the provided context, say plainly that it isn't in what you've been given and that they should check the real P&ID/procedure or a qualified supervisor. Do not guess, estimate, or fill in a plausible-sounding number for anything facility-specific — an invented setpoint is worse than no answer.
 
If REFERENCE CONTEXT is empty or clearly doesn't cover the question, say so directly before answering with general knowledge, so the person knows which part of your answer is general engineering knowledge versus something confirmed from this specific project.
 
STRUCTURED FORMAT FOR TROUBLESHOOTING/DIAGNOSTIC QUESTIONS: if the operator is asking about a current abnormal condition, a problem, "why is X happening," or otherwise troubleshooting something (as opposed to a plain lookup question like "what's the PM interval on X"), structure your answer with these five labeled sections, in this order:
Current Condition: what's actually happening right now, per LIVE PLANT STATE if relevant.
Likely Cause: your best-supported explanation.
Evidence: what in the context (or general knowledge) supports that explanation — say explicitly if this is general engineering reasoning rather than something confirmed from this file.
What To Check: concrete next step(s) the operator could actually go verify.
Source: which layer above the conclusion mainly rests on (live plant state / reference library / general knowledge), stated plainly.
For plain lookup questions, just answer directly — don't force this structure where it doesn't fit.
 
If asked to draft a LOTO (lockout/tagout), always structure it clearly (equipment, isolation points, verification steps) using only tags/equipment that appear in the REFERENCE CONTEXT or attached document, and ALWAYS end the entire response with this exact line on its own, verbatim:
 
NOT APPROVED — FIELD VERIFICATION REQUIRED
 
State plainly that any LOTO you draft must be reviewed by a qualified person and checked against the real, current isolation points in the field before use — you are a drafting aid, not an approval authority.
 
Keep answers direct and practical, the way an experienced operator would talk to a colleague. Do not pad with disclaimers beyond what's required above.`;
 
const DIGEST_SYSTEM_PROMPT = `You are extracting candidate facts from an attached document (a P&ID, OEM manual page, or similar) for a human-reviewed knowledge queue — you are NOT answering a question and NOT talking to the operator conversationally.
 
Rules, followed exactly:
- Only extract things clearly, visibly stated in the attached document. Never infer, generalize, guess, or add outside knowledge. If the document doesn't clearly state a fact, do not include it.
- Each extracted fact must be a single, self-contained, factual statement (not a question, not an opinion).
- Respond with ONLY a raw JSON array, nothing else — no prose before or after, no markdown code fences, no commentary.
- Each array item must be an object with exactly these keys: "statement" (string, the fact, in your own words but faithful to the document), "equipmentIds" (array of strings — any tag numbers/equipment references the statement is about, or an empty array), "page" (a number if a page/sheet number is visible in the document, otherwise null), "classification" (one of: "spec", "procedure", "maintenance", "safety", "other").
- If nothing in the document is clearly extractable as a discrete fact, return an empty array: []
- Return at most 40 items. If there are more real candidate facts than that, return the 40 most significant ones.`;
 
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
  const mode = payload.mode === 'loto' ? 'loto' : payload.mode === 'digest' ? 'digest' : 'qa';
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : []; // last 8 turns max
  const attachment = payload.attachment; // optional: { mediaType, base64 } for an attached P&ID/document
 
  if (mode === 'digest' && !(attachment && attachment.base64 && attachment.mediaType)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'digest mode requires an attachment' }) };
  }
  if (mode !== 'digest' && !message.trim()) {
    return { statusCode: 400, body: JSON.stringify({ error: 'message is required' }) };
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
  } else {
    framedText =
      (mode === 'loto' ? 'Draft a LOTO for the following request.\n\n' : '') +
      'REFERENCE CONTEXT (from this simulator\'s own Reference Library / P&ID library — real project data, not invented):\n' +
      (context.trim() ? context : '(no matching entries found in the Reference Library for this question)') +
      '\n\n---\n\nOPERATOR QUESTION:\n' + message;
  }
  userContent.push({ type: 'text', text: framedText });
 
  const messages = mode === 'digest'
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
        max_tokens: mode === 'digest' ? 3000 : 1200,
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
      body: JSON.stringify({ reply: text, mode: mode }),
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach the Claude API: ' + e.message }) };
  }
};
