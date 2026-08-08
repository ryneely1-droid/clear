/**
 * Ryan AI Backend — Clearfork Cryogenic Unit #1 Simulator
 * Netlify Function: netlify/functions/ryan.js
 *
 * REBUILT this session to fix a broken contract with the client (index.html):
 *   1. Netlify Functions require `exports.handler` — a prior rewrite this
 *      session only exported plain data + a helper, with no real entry point.
 *   2. The Anthropic API call was missing the `x-api-key` and
 *      `anthropic-version` headers entirely — every call would have failed
 *      authentication regardless of anything else.
 *   3. The response shape didn't match what the client reads. Client expects
 *      { reply, cost:{usd,inputTokens,outputTokens} } or { error }. A prior
 *      rewrite returned { response, cost:{costUSD,...} } instead.
 * This version fixes all three and keeps every knowledge object from this
 * session (Stabilizer, C-5700, Control Valves, Pump Maintenance, Residue
 * Compressors, Simulator UI) actually wired into what gets sent to Claude.
 */
 
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-5';
 
// ===== STABILIZER SYSTEM KNOWLEDGE =====
 
const STABILIZER_KNOWLEDGE = {
  overview: `The Stabilizer System (V-1521) is a demethanizer column that processes raw NGL from the cold separator into a stabilized product (C5+) and overhead vapor (C1-C4). The system uses booster pumps (P-5060/P-5065) to recirculate bottoms product through a cooler (AC-5055), maintaining a split-feed design that reduces reboiler duty by 50-60% compared to a top-feed design.`,
  equipment: {
    'V-1521': {
      name: 'Stabilizer/Demethanizer Column',
      type: 'Distillation column',
      service: 'Raw NGL to stabilized product (C5+) + overhead vapor (C1-C4)',
      feedInlet: 'Line 444-10" from V-1421 (cold separator) — enters mid-section',
      bottomsOutlet: 'Gravity drain to pump suction (P-5060/5065)',
      overheadOutlet: 'To cooler (AC-5055) and/or recycle',
      reboilerInlet: 'From AC-5055 condenser outlet',
      surgeInlet: 'Split-feed return from cooler (preheats incoming raw NGL)',
      isolationValves: [
        { tag: 'XV-1521-1', location: 'Feed inlet', type: 'Manual block', normally: 'Open' },
        { tag: 'XV-1521-2', location: 'Bottoms outlet', type: 'Manual block', normally: 'Open' },
        { tag: 'XV-1521-3', location: 'Reboiler inlet', type: 'Manual block', normally: 'Open' },
        { tag: 'XV-1521-4', location: 'Reboiler outlet', type: 'Manual block', normally: 'Open' },
        { tag: 'XV-1521-5', location: 'Overhead outlet', type: 'Manual block', normally: 'Open' },
        { tag: 'XV-1521-6', location: 'Vent (top of column)', type: 'Manual block', normally: 'Closed' },
      ],
      drainPoints: ['Sump drain (bottom)', 'Reboiler bottom drain'],
      reliefValves: [{ tag: 'PSV-1521', setPoint: 'TBD', destination: 'Vent or atmosphere' }],
      depressurizationMethod: 'Via XV-1521-6 vent after XV-1521-5 isolation',
    },
    'P-5060': {
      name: 'Stabilizer Booster Pump #1', type: 'Centrifugal pump',
      service: 'Recirculate stabilizer bottoms through cooler to feed inlet',
      feedSource: 'V-1521 sump (gravity)', dischargeDestination: 'Through AC-5055 cooler to stabilizer feed inlet',
      isolationValves: [{ tag: 'XV-5060-1', location: 'Pump inlet (check valve)' }, { tag: 'XV-5060-2', location: 'Pump discharge manual block' }],
      controlValve: 'LCV-5060 on discharge', pressureRelief: { tag: 'PSV-5060', setPoint: '~100-120 psi' },
    },
    'P-5065': {
      name: 'Stabilizer Booster Pump #2', type: 'Centrifugal pump',
      service: 'Standby or parallel operation with P-5060',
      feedSource: 'V-1521 sump (gravity)', dischargeDestination: 'Through AC-5055 cooler to stabilizer feed inlet',
      isolationValves: [{ tag: 'XV-5065-1', location: 'Pump inlet (check valve)' }, { tag: 'XV-5065-2', location: 'Pump discharge manual block' }],
      pressureRelief: { tag: 'PSV-5065', setPoint: '~120-150 psi' },
    },
    'AC-5055': {
      name: 'Stabilizer Product Cooler', type: 'Air-cooled heat exchanger',
      service: 'Cool booster pump discharge from stabilizer', inlet: 'From P-5060/5065 discharge',
      outlet: 'To stabilizer feed inlet (split-feed recycle)', coolingMedium: 'Air (fan-cooled)',
      temperatureControl: 'Fan speed modulation or bypass valve',
      isolationValves: [{ tag: 'XV-5055-1', location: 'Cooler inlet' }, { tag: 'XV-5055-2', location: 'Cooler outlet' }],
    },
  },
  instrumentation: {
    pressure: {
      'PT-5060A': { location: 'Stabilizer inlet (before reboiler)', normal: '50-100 psi', alarm_HH: '150 psi' },
      'PT-5060B': { location: 'Stabilizer bottom', normal: '80-120 psi', alarm_HH: '200 psi' },
      'PT-5065': { location: 'Booster pump discharge', normal: '80-120 psi', alarm_HH: '150 psi' },
    },
    temperature: {
      'TT-5060': { location: 'Stabilizer bottom', normal: '120-150°F', alarm_HH: '160°F', controlSetpoint: '135°F' },
      'TT-5065A': { location: 'Cooler outlet', normal: '90-120°F', alarm_HH: '130°F' },
    },
    level: {
      'LT-5060': { location: 'Stabilizer sump', setpoint: '50%', alarm_HH: '75%', alarm_LL: '25%' },
      'LT-5061': { location: 'Surge tank level', setpoint: '50%', alarm_HH: '70%', alarm_LL: '30%' },
    },
  },
  controlLogic: {
    levelControl: 'LCV-5060 modulates bottoms drain flow; high level opens drain; low level stops pump',
    temperatureControl: 'Reboiler duty modulated to maintain stabilizer bottom temperature',
    pressureRelief: 'PSV-5060 set ~100 psi protects stabilizer; PSV-5065 set ~150 psi protects booster',
  },
  lotoSteps: [
    '1. Close XV-1521-1 (Feed inlet) and XV-1521-2 (Bottoms outlet)',
    '2. Close XV-5060-2 (Pump discharge isolation)',
    '3. Isolate reboiler heat: close steam/hot oil inlet and drain',
    '4. Isolate condenser cooling: close cooling water inlet and fan isolation',
    '5. Close XV-1521-6 vent and XV-5055-1 cooler inlet for full depressurization',
    '6. Install blanks on all manual isolation valve outlets',
    '7. Install lockout tags on all isolation valves',
    '8. Verify zero pressure throughout system',
    '9. Notify operations that stabilizer is isolated',
  ],
};
 
// ===== OVERHEAD COMPRESSOR KNOWLEDGE =====
 
const OVERHEAD_COMPRESSOR_KNOWLEDGE = {
  overview: `C-5700 is a reciprocating, double-acting compressor that compresses overhead vapor from the Stabilizer System (C1-C4 gases) from ~150-175 psi suction to ~500-600 psi discharge. It has dual throws (each with independent outlet temperature monitoring) and a pressure-lubricated oil system with built-in cooler. Relief is pilot-operated, recirculating excess discharge back to suction.`,
  equipment: {
    'C-5700': {
      name: 'Overhead Compressor (C-5700)', type: 'Reciprocating, double-acting, two-stage',
      service: 'Compress stabilizer overhead vapor (C1-C4) for refinery residue service or recycle',
      suction: 'From stabilizer overhead discharge (~150-175 psi inlet)',
      discharge: 'To refinery residue system or recycle (~500-600 psi outlet)',
      throws: [
        { number: 1, outlet_temp_limit: '300°F', instrument: 'TT-5700-1', normal: '250-280°F' },
        { number: 2, outlet_temp_limit: '300°F', instrument: 'TT-5700-2', normal: '250-280°F' },
      ],
      isolationValves: [
        { tag: 'XV-5700-1', location: 'Suction inlet block', normally: 'Open' },
        { tag: 'XV-5700-2', location: 'Discharge outlet block', normally: 'Open' },
        { tag: 'XV-5700-3', location: 'Oil supply inlet', normally: 'Open' },
        { tag: 'XV-5700-4', location: 'Oil return/sump drain', normally: 'Open' },
        { tag: 'XV-5700-5', location: 'Gas vent (normally closed)', normally: 'Closed' },
      ],
      reliefValve: { tag: 'PSV-5700', type: 'Pilot-operated, recirculating type', setPoint: '~620 psi (estimated — requires nameplate verification)', destination: 'Pilot-operated recycle to suction via orifice' },
      oilSystem: { type: 'Pressure-fed full-lube', pressureMinimum: '35-45 psi', temperatureNormal: '100-180°F', temperatureLimit_H: '180°F', temperatureLimit_HH: '200°F', temperatureLimit_Start: 'Minimum 40°F required to load compressor' },
    },
  },
  instrumentation: {
    pressure: {
      'PS-5700-1': { location: 'C-5700 suction inlet', normal: '150-175 psi', alarm_LL: '150 psi', alarm_HH: '600 psi' },
      'PS-5700-2': { location: 'C-5700 discharge outlet', normal: '500-550 psi', alarm_HH: '600 psi' },
      'PS-5700-OIL': { location: 'Compressor oil pressure', normal: '40-50 psi', alarm_LL: '35 psi' },
    },
    temperature: {
      'TT-5700-1': { location: 'Throw #1 outlet gas', normal: '250-280°F', alarm_H: '290°F', alarm_HH: '300°F' },
      'TT-5700-2': { location: 'Throw #2 outlet gas', normal: '250-280°F', alarm_H: '290°F', alarm_HH: '300°F' },
      'TT-5700-OIL': { location: 'Compressor oil', normal: '100-180°F', alarm_H: '180°F', alarm_HH: '200°F', coldstart_perm: '40°F' },
    },
  },
  alarmParameters: {
    suction_pressure: { LL: 150, L: 175, H: 550, HH: 600 },
    discharge_pressure: { LL: 150, L: 175, H: 550, HH: 600 },
    oil_pressure: { LL: 35, L: 45 },
    throw1_outlet_temp: { H: 290, HH: 300 },
    throw2_outlet_temp: { H: 290, HH: 300 },
    oil_temp: { H: 180, HH: 200 },
    oil_temp_start_permissive: 40,
    oil_temp_load_permissive: 180,
  },
  lotoSteps: [
    '1. Close XV-5700-1 (Suction inlet isolation)',
    '2. Close XV-5700-2 (Discharge outlet isolation)',
    '3. Close XV-5700-3 (Oil supply inlet)',
    '4. Close XV-5700-4 (Oil return/sump drain)',
    '5. Open XV-5700-5 (Vent valve on top of compressor)',
    '6. Monitor PS-5700-1 and PS-5700-2 pressures — both should drop to 0 psi',
    '7. Install blanks on all five isolation valve outlets',
    '8. Install lockout devices on all isolation valve handles',
    '9. Verify zero pressure, depressurized state, and cool temperature before work',
  ],
};
 
// ===== CONTROL VALVE KNOWLEDGE =====
 
const CONTROL_VALVE_KNOWLEDGE = {
  PCV_1438: {
    tag: 'PCV-1438', name: 'Discharge Pressure Control Valve', manufacturer: 'Fisher Controls International LLC',
    type: 'Type 667 Proportional Pilot-Operated Control Valve', service: 'Discharge pressure modulation on V-1040 or similar residue vessel',
    actuator: { serialNumber: 'F002239151', type: '667 (Fisher proportional)', spoolSize: '70i', travel: '2 inches', benchSet: '10-30 psi', operatingRange_PilotAir: '0-33 psi' },
    body: { serialNumber: 'F002239151', type: '51 (Fisher valve body)', portSize: '4" inlet/outlet', portConnection: '4-3/8" BSP', rating: 'CL600/1500 PSI CWP', materials: { plug: 'SST', stem: 'SST', body: 'STL', seat: 'SST' } },
    function: 'Proportional pressure reduction. Modulates discharge flow to maintain setpoint. 0-33 psi pilot air controls valve opening.',
  },
  LCV_1241: {
    tag: 'LCV-1241', name: 'Stabilizer Sump Level Control Valve', manufacturer: 'Fisher Controls International LLC',
    type: 'Type EWT (Explorer Wide Temperature) Proportional Pilot-Operated Control Valve', service: 'V-1521 Stabilizer bottoms level modulation',
    actuator: { serialNumber: 'F001757111', type: '667 (Fisher proportional)', spoolSize: '45i', travel: '2 inches', benchSet: '10-30 psi', operatingRange_PilotAir: '0-33 psi' },
    body: { serialNumber: 'F001737111', type: 'EWT', ports: '4X4"', portSize: '4-3/8"', rating: 'CL150/290 PSI CWP', materials: { plug: 'SST/HF', stem: 'SST', body: 'STL', seat: 'SST/HF' } },
    function: 'Proportional level control. Modulates sump drain based on level transmitter signal. LT-5060 generates pilot air signal.',
    operatingLogic: { lowLevel_LL: 'Pilot air reduced, valve closes, level rises', normalLevel_50pct: 'Pilot air ~16.5 psi, valve mid-stroke, level stable', highLevel_HH: 'Pilot air increased, valve opens, level reduces' },
  },
};
 
// ===== PUMP MAINTENANCE KNOWLEDGE =====
 
const PUMP_MAINTENANCE_KNOWLEDGE = {
  P_1630: {
    tag: 'P-1630', name: 'Booster Pump (Recirculation Duty)', service: 'Recirculate stabilizer bottoms through cooler (AC-5055)', type: 'Centrifugal pump',
    oilSpecifications: {
      capacity: '4 quarts per pump', changeInterval: '2000 operating hours or annually (whichever comes first)', viscosityGrade: 'ISO 68',
      acceptableOilOptions: ['Mobil 1 SHC 626 (ISO 68)', 'Phillips Syncon R&O Oil 68 (ISO 68)', 'Royall Supply Synfill GT68 (ISO 68)'],
      substitution: 'Any of the three acceptable. Do NOT mix without flushing sump.',
    },
    maintenance_schedule: { everyShift: 'Check oil level via dipstick.', every500hrs: 'Perform oil analysis.', every2000hrs: 'Routine oil change.', annually: 'Full pump inspection.' },
  },
  P_1635: {
    tag: 'P-1635', name: 'Booster Pump (Suction System)', service: 'Primary booster pump', type: 'Centrifugal pump', note: 'Identical to P-1630 specifications',
    oilSpecifications: {
      capacity: '4 quarts per pump', changeInterval: '2000 operating hours or annually (whichever comes first)', viscosityGrade: 'ISO 68',
      acceptableOilOptions: ['Mobil 1 SHC 626 (ISO 68)', 'Phillips Syncon R&O Oil 68 (ISO 68)', 'Royall Supply Synfill GT68 (ISO 68)'],
    },
  },
};
 
// ===== RESIDUE COMPRESSOR KNOWLEDGE =====
 
const RESIDUE_COMPRESSOR_KNOWLEDGE = {
  overview: `The residue compressors (C-6100, C-6200, C-6300) are reciprocating, multi-stage units that compress residue vapors to high pressure (~1000+ psi). All three use identical P&ID design and alarm setpoints.`,
  alarmParameters_C6100: {
    '1st_Stage_Suction': { LL: 265, L: 275, H: 400, HH: 420, tag: 'PT-6201' },
    '1st_Stage_Discharge': { LL: 340, L: 461, H: 710, HH: 745, tag: 'PT-6202' },
    '2nd_Stage_Suction': { LL: 340, L: 452, H: 710, HH: 745, tag: 'PT-6203' },
    '2nd_Stage_Discharge': { LL: 335, L: 355, H: 1045, HH: 1060, tag: 'PT-6205' },
    'Final_Discharge': { LL: 335, L: 355, H: 1045, HH: 1060, tag: 'PT-6204' },
    'Oil_Pressure': { L: 50, tag: 'PT-6206' },
    'Oil_Temp': { LL: 80, L: 90, H: 185, HH: 190, tag: 'TT-6210' },
    '1st_Stage_Suction_Temp': { LL: 0, L: 10, H: 130, HH: 135, tag: 'TT-6201' },
    'Final_Gas_Discharge_Temp': { H: 135, HH: 150, tag: 'TT-6209' },
    '2nd_Stage_Suction_Temp': { LL: 5, L: 20, H: 135, HH: 140, tag: 'TT-6205' },
  },
  isolationValves_C6100: [
    { tag: 'XV-6100-1', location: 'Suction inlet isolation', normally: 'Open' },
    { tag: 'XV-6100-2', location: 'Discharge outlet isolation', normally: 'Open' },
    { tag: 'XV-6100-3', location: 'Oil supply inlet', normally: 'Open' },
    { tag: 'XV-6100-4', location: 'Oil return/drain', normally: 'Open' },
    { tag: 'XV-6100-5', location: 'Gas vent valve', normally: 'Closed' },
  ],
  lotoSteps_C6100: [
    '1. Close XV-6100-1, XV-6100-2, XV-6100-3, XV-6100-4',
    '2. Monitor pressure gauges for pressure drop',
    '3. Open XV-6100-5 vent valve slowly',
    '4. Verify zero pressure on all transmitters',
    '5. Install physical blanks on all five isolation valve outlets',
    '6. Install lockout devices on valve handles',
    '7. Install LOTO tags with work order information',
    '8. Verify compressor cool and depressurized before work',
  ],
  tagNumberMapping: {
    C6100_to_C6200: 'Replace 6100 with 6200 in all valve tags (XV-6200-1, PSV-6200A, etc.)',
    C6100_to_C6300: 'Replace 6100 with 6300 in all valve tags (XV-6300-1, PSV-6300A, etc.)',
    instrumentTags: 'PT-6201, PT-6202, PT-6203, PT-6205, PT-6204, PT-6206, TT-6210, TT-6201, TT-6209, TT-6205 shared across all three',
  },
};
 
// ===== SIMULATOR UI FEATURE KNOWLEDGE =====
 
const SIMULATOR_UI_KNOWLEDGE = {
  simulationSpeedControl: {
    location: 'Toolbar button "⏩ 1x REAL TIME" next to the "▶️ LIVE" button',
    function: 'Speeds up the whole plant simulation: 1x (real time) → 2x → 5x → 10x → back to 1x, cycling one step each click. Clicking also opens a popup where any of the four speeds can be picked directly.',
    whatItAffects: 'How fast pressures, temperatures, levels, and weather move toward their targets, and how fast simulated time advances. Freezes completely when the plant is Paused.',
    independence: 'Independent from the Outages panel speed selector (outage aging only) and from the Live/Pause master switch.',
  },
};
 
// ===== SYSTEM PROMPT BUILDER =====
 
function buildSystemPrompt(mode) {
  const knowledgeBlock = JSON.stringify({
    stabilizer: STABILIZER_KNOWLEDGE,
    overheadCompressor: OVERHEAD_COMPRESSOR_KNOWLEDGE,
    controlValves: CONTROL_VALVE_KNOWLEDGE,
    pumpMaintenance: PUMP_MAINTENANCE_KNOWLEDGE,
    residueCompressors: RESIDUE_COMPRESSOR_KNOWLEDGE,
    simulatorUI: SIMULATOR_UI_KNOWLEDGE,
  });
 
  let modeInstructions = '';
  if (mode === 'loto') {
    modeInstructions = `\nMODE: LOTO DRAFTING. Produce a step-by-step lockout/tagout draft using exact tag numbers from the reference data where the equipment is covered there. ALWAYS end the response with the exact line: "NOT APPROVED — FIELD VERIFICATION REQUIRED" on its own line. This is a draft only; it requires human engineering/operations review before use.`;
  } else if (mode === 'audit') {
    modeInstructions = `\nMODE: AUDIT. You are reviewing the attached search-result context for accuracy, contradictions, or gaps against the reference data. Give specific, actionable findings. Suggestions only — nothing is applied automatically.`;
  } else if (mode === 'digest') {
    modeInstructions = `\nMODE: DOCUMENT DIGEST. Read the attached document/image carefully and extract discrete, verifiable facts about plant equipment, instrumentation, setpoints, or procedures. Respond with ONLY a JSON array (no prose, no code fences, no explanation) of objects shaped exactly like:
[{"statement":"<one factual sentence>","classification":"<setpoint|tag|procedure|spec|other>","equipmentIds":["<tag numbers mentioned, if any>"],"page":<page number if known, else null>}, ...]
Extract at most 40 of the clearest, most useful facts. If nothing extractable is found, respond with an empty array: []`;
  } else if (mode === 'scan') {
    modeInstructions = `\nMODE: RYAN SCAN. You are auditing a batch of this program's own quiz bank or source code (attached below) for wrong marked answers, comments that contradict the code next to them, mismatched tags, or backwards logic. List specific findings with line/question references where possible. Suggestions only — nothing is applied automatically.`;
  } else if (mode === 'recommend') {
    modeInstructions = `\nMODE: RECOMMENDATIONS. The operator wants your best process, maintenance, or troubleshooting recommendation given current plant conditions (see CONTEXT in the user message for live values/state). Structure your answer as: (1) brief assessment of what's happening and why, citing specific tags/values from context, (2) concrete recommended action(s), ranked if there's more than one path, (3) what to watch/verify afterward to confirm the recommendation worked. Be direct and specific — this is for an experienced field operator, not a general audience. If data needed to make a confident recommendation isn't in the context, say what's missing rather than guessing.`;
  } else {
    modeInstructions = `\nMODE: Q&A. Answer the operator's question directly and specifically, citing exact tag numbers, setpoints, and values from the reference data below wherever relevant.`;
  }
 
  const recommendationCharter = `
PROACTIVE RECOMMENDATIONS (applies in every mode, not just MODE: RECOMMENDATIONS above): when the operator's question or the live CONTEXT reveals something worth flagging — a value drifting toward an alarm limit, an inefficient operating point, a maintenance interval coming due, a symptom pattern matching a known failure mode — say so and give a concrete recommendation, even if not explicitly asked. Cover these categories as relevant:
- PROCESS: operating point adjustments, setpoint tuning, efficiency/yield observations (e.g. C2 recovery/rejection tradeoffs)
- PLANT: overall health, cross-system interactions, what a change in one area will do downstream
- MAINTENANCE: oil change intervals, inspection due dates, wear patterns worth watching, PSV test due dates
- TROUBLESHOOTING: given a symptom, walk through likely causes ordered by probability, cite the specific tag/instrument that would confirm or rule out each one, and recommend the diagnostic check before recommending corrective action
Stay grounded in the reference data and live context provided — flag a concern or suggest a check even when you don't have enough information to fully diagnose it, rather than staying silent. Never fabricate a specific setpoint or nameplate value you don't have; say "Pending Verification" the same way the reference data does.`;
 
  return `You are Ryan, an AI assistant for Clearfork Cryogenic Processing Unit #1.
 
You have detailed, field-verified expertise in:
- Stabilizer System (V-1521, P-5060/5065, AC-5055) with full LOTO procedures
- Overhead Compressor (C-5700) with alarm parameters and control logic
- Residue Compressors (C-6100, C-6200, C-6300) with multi-stage configuration
- Control Valves (PCV-1438, LCV-1241) with proportional pilot-air logic
- Pump Maintenance (P-1630, P-1635) with oil specifications and change intervals
- Simulator UI features, including the Simulation Speed control
 
The exact reference data for all of the above is provided below as JSON. Always cite specific values, tag numbers, and steps directly from this data rather than estimating. If something isn't covered in this data, say so plainly rather than inventing a value.
 
REFERENCE DATA:
${knowledgeBlock}
${recommendationCharter}
${modeInstructions}`;
}
 
// ===== ANTHROPIC CONTENT BLOCK HELPERS =====
 
function attachmentToContentBlock(attachment) {
  // attachment: {mediaType, base64, label} sent by the client.
  if (!attachment || !attachment.base64) return null;
  const mediaType = attachment.mediaType || 'application/pdf';
  if (mediaType === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: attachment.base64 } };
  }
  if (mediaType.indexOf('image/') === 0) {
    return { type: 'image', source: { type: 'base64', media_type: mediaType, data: attachment.base64 } };
  }
  // Fallback: treat unknown types as a document block.
  return { type: 'document', source: { type: 'base64', media_type: mediaType, data: attachment.base64 } };
}
 
// ===== MAIN NETLIFY HANDLER =====
 
const https = require('https');
 
// Native https-based POST helper — deliberately avoids relying on global
// `fetch`, since Netlify's actual Node runtime version isn't something this
// code can verify from here, and a missing/undefined fetch would throw in a
// way that could surface to the client as a bare, message-less error. This
// works identically on any Node version Netlify runs.
function postJson(url, headers, payloadObj) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(payloadObj);
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: Object.assign({ 'content-length': Buffer.byteLength(payload) }, headers),
      },
      res => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch (e) {
            resolve({ ok: false, status: res.statusCode, data: { error: { message: 'Non-JSON response from Anthropic (HTTP ' + res.statusCode + '): ' + raw.slice(0, 300) } } });
            return;
          }
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', err => reject(err));
    req.write(payload);
    req.end();
  });
}
 
exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
 
    let body;
    try {
      const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '{}');
      body = JSON.parse(rawBody);
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body: ' + e.message }) };
    }
 
    const { message, context, mode, scanLabel, history, password, attachment } = body;
 
    // Password gate — mirrors client expectation of a 403 on bad password.
    const expectedPw = process.env.RYAN_AI_PASSWORD;
    if (expectedPw && password !== expectedPw) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect password.' }) };
    }
 
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the server. See the setup README.' }) };
    }
 
    const effectiveMode = mode || 'qa';
    const systemPrompt = buildSystemPrompt(effectiveMode);
 
    // Build the messages array: prior history (already {role,content} pairs,
    // Anthropic-compatible) + the new user turn. Context (deterministic search
    // grounding, or scan batch content) is appended into the new user message
    // rather than the system prompt, since it changes every call.
    const messages = Array.isArray(history)
      ? history
          .filter(h => h && h.role && h.content)
          .map(h => ({ role: h.role, content: String(h.content) }))
      : [];
 
    const userText = [
      message || '',
      context ? ('\n\n--- CONTEXT ---\n' + context) : '',
      scanLabel ? ('\n\n--- SCAN BATCH LABEL ---\n' + scanLabel) : '',
    ].join('');
 
    const userContent = [];
    if (attachment) {
      const block = attachmentToContentBlock(attachment);
      if (block) userContent.push(block);
    }
    userContent.push({ type: 'text', text: userText || '(no message provided)' });
 
    messages.push({ role: 'user', content: userContent });
 
    const maxTokens = (effectiveMode === 'digest' || effectiveMode === 'scan') ? 4096 : 1500;
 
    let result;
    try {
      result = await postJson(
        'https://api.anthropic.com/v1/messages',
        {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        { model: MODEL, max_tokens: maxTokens, system: systemPrompt, messages: messages }
      );
    } catch (networkErr) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach Anthropic API: ' + (networkErr && networkErr.message ? networkErr.message : 'network error') }) };
    }
 
    if (!result.ok) {
      const d = result.data;
      const msg = (d && d.error && d.error.message) ? d.error.message : ('Anthropic API error (HTTP ' + result.status + ')');
      return { statusCode: 502, body: JSON.stringify({ error: msg }) };
    }
 
    const data = result.data;
    const reply = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
 
    const usage = data.usage || { input_tokens: 0, output_tokens: 0 };
    const costUsd = (usage.input_tokens * 0.003 + usage.output_tokens * 0.015) / 1000;
 
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: reply,
        cost: {
          usd: costUsd,
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
        },
      }),
    };
  } catch (err) {
    // Last-resort catch: log server-side (visible in Netlify function logs)
    // and always return a non-empty, JSON-parseable error so the client
    // never has to fall back to its generic "unknown error" text.
    console.error('Ryan AI handler crashed:', err);
    return { statusCode: 500, body: JSON.stringify({ error: (err && err.message) ? err.message : ('Unknown server error: ' + String(err)) }) };
  }
};
 
// Named exports for the knowledge objects (used internally by
// buildSystemPrompt() above regardless; exposed here too for debugging/testing).
module.exports.STABILIZER_KNOWLEDGE = STABILIZER_KNOWLEDGE;
module.exports.OVERHEAD_COMPRESSOR_KNOWLEDGE = OVERHEAD_COMPRESSOR_KNOWLEDGE;
module.exports.CONTROL_VALVE_KNOWLEDGE = CONTROL_VALVE_KNOWLEDGE;
module.exports.PUMP_MAINTENANCE_KNOWLEDGE = PUMP_MAINTENANCE_KNOWLEDGE;
module.exports.RESIDUE_COMPRESSOR_KNOWLEDGE = RESIDUE_COMPRESSOR_KNOWLEDGE;
module.exports.SIMULATOR_UI_KNOWLEDGE = SIMULATOR_UI_KNOWLEDGE;
 
