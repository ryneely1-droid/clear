/* ryan.js — Netlify serverless function (classic Lambda-compatible format,
   no build step, no npm install required — Netlify's Node runtime ships a
   global fetch()). This is the ONLY place the real Claude API key ever
   exists. It reads it from the ANTHROPIC_API_KEY environment variable,
   which you set once in the Netlify dashboard (Project configuration >
   Environment variables) — never in this file, never in the HTML.
 
   The browser (clearfork_cryo_unit1_3d_model.html) calls this function at
   POST /.netlify/functions/ryan with a small JSON body. It never sees the
   key, and can't — this function is the only thing that talks to
   api.anthropic.com.
 
   SCOPING RULE (matches this project's standing "never invent plant-
   specific values" rule): the system prompt below tells Claude it may only
   state a real Clear Fork setpoint/tag/limit/spec as fact if it appears in
   the `context` block the browser sends over (which is built from this
   simulator's own Reference Library / Ask Ryan search results — see
   ryanPopup() in the HTML file). General process-engineering/safety
   knowledge is allowed, since answering questions and troubleshooting
   requires that; only facility-specific numbers are restricted to what's
   actually in the file. LOTO drafts always get the NOT APPROVED banner. */
 
const ANTHROPIC_MODEL = 'claude-sonnet-5'; // update here if Anthropic ships a newer default
const ANTHROPIC_VERSION = '2023-06-01';
 
const SYSTEM_PROMPT = `You are "Ryan," an in-plant training assistant embedded in a training simulator for XcL Processing Operating LLC's Clearfork Processing Facility, Cryogenic Unit #1 (Marshall County, WV). You are talking to a real field operator using this simulator to train and to think through real work.
 
You may use two kinds of information ONLY:
1. General, textbook-level process engineering, mechanical, and safety knowledge that any competent gas-plant operator or process engineer would already know (how a JT valve works, general compressor theory, general LOTO practice, general troubleshooting logic, etc).
2. The REFERENCE CONTEXT block provided in this message, which was pulled directly from the simulator's own Reference Library, P&ID library, and interlock/tag data — i.e., real information this specific project has on file.
 
Hard rule: you must NEVER state a specific real Clear Fork setpoint, tag number, valve position, alarm/trip limit, line number, or equipment spec as fact unless it appears verbatim in the REFERENCE CONTEXT below. If the person asks something facility-specific that is not in the provided context, say plainly that it isn't in what you've been given and that they should check the real P&ID/procedure or a qualified supervisor. Do not guess, estimate, or fill in a plausible-sounding number for anything facility-specific — an invented setpoint is worse than no answer.
 
If REFERENCE CONTEXT is empty or clearly doesn't cover the question, say so directly before answering with general knowledge, so the person knows which part of your answer is general engineering knowledge versus something confirmed from this specific project.
 
If asked to draft a LOTO (lockout/tagout), always structure it clearly (equipment, isolation points, verification steps) using only tags/equipment that appear in the REFERENCE CONTEXT, and ALWAYS end the entire response with this exact line on its own, verbatim:
 
NOT APPROVED — FIELD VERIFICATION REQUIRED
 
State plainly that any LOTO you draft must be reviewed by a qualified person and checked against the real, current isolation points in the field before use — you are a drafting aid, not an approval authority.
 
Keep answers direct and practical, the way an experienced operator would talk to a colleague. Do not pad with disclaimers beyond what's required above.`;
 
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
 
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Malformed request body' }) };
  }
 
  const message = (payload.message || '').toString().slice(0, 4000);
  const context = (payload.context || '').toString().slice(0, 20000); // capped so one request can't balloon token cost
  const mode = payload.mode === 'loto' ? 'loto' : 'qa';
  const history = Array.isArray(payload.history) ? payload.history.slice(-8) : []; // last 8 turns max
  const attachment = payload.attachment; // optional: { mediaType, base64 } for an attached P&ID PDF/image
 
  if (!message.trim()) {
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
  const framedText =
    (mode === 'loto' ? 'Draft a LOTO for the following request.\n\n' : '') +
    'REFERENCE CONTEXT (from this simulator\'s own Reference Library / P&ID library — real project data, not invented):\n' +
    (context.trim() ? context : '(no matching entries found in the Reference Library for this question)') +
    '\n\n---\n\nOPERATOR QUESTION:\n' + message;
  userContent.push({ type: 'text', text: framedText });
 
  const messages = history
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
    .map((h) => ({ role: h.role, content: h.content.slice(0, 4000) }));
  messages.push({ role: 'user', content: userContent });
 
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
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
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
