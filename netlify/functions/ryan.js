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

 

// ===== RYAN CORE V2 =====

 

const https = require('https');

const crypto = require('crypto');

 

const ANTHROPIC_VERSION_V2 = process.env.ANTHROPIC_VERSION || '2023-06-01';

const RYAN_BUILD_ID = 'RYAN-2026-08-09D';

const MODEL_V2 = process.env.RYAN_MODEL || 'claude-sonnet-5';

const MAX_HISTORY_TURNS = Number(process.env.RYAN_MAX_HISTORY_TURNS || 12);

const MAX_HISTORY_CHARS = Number(process.env.RYAN_MAX_HISTORY_CHARS || 12000);

const MAX_MESSAGE_CHARS = Number(process.env.RYAN_MAX_MESSAGE_CHARS || 24000);

const MAX_CONTEXT_CHARS = Number(process.env.RYAN_MAX_CONTEXT_CHARS || 120000);

const MAX_ATTACHMENT_BYTES = Number(process.env.RYAN_MAX_ATTACHMENT_BYTES || 24 * 1024 * 1024);

const REQUEST_TIMEOUT_MS = Number(process.env.RYAN_REQUEST_TIMEOUT_MS || 45000);

const INPUT_PRICE_PER_MILLION = Number(process.env.RYAN_INPUT_PRICE_PER_MILLION || 2);

const OUTPUT_PRICE_PER_MILLION = Number(process.env.RYAN_OUTPUT_PRICE_PER_MILLION || 10);

const DOC_MAX_TOKENS = Math.max(2048, Math.min(20000, Number(process.env.RYAN_DOC_MAX_TOKENS || 9000)));

const IMAGE_MAX_TOKENS = Math.max(2048, Math.min(12000, Number(process.env.RYAN_IMAGE_MAX_TOKENS || 5000)));

const FACTS_PER_PASS = Math.max(20, Math.min(90, Number(process.env.RYAN_FACTS_PER_PASS || 55)));

const MAX_LEARNED_FACTS = Math.max(80, Math.min(500, Number(process.env.RYAN_MAX_LEARNED_FACTS || 320)));

 

const KNOWLEDGE_REGISTRY = {

  stabilizer: STABILIZER_KNOWLEDGE,

  overheadCompressor: OVERHEAD_COMPRESSOR_KNOWLEDGE,

  controlValves: CONTROL_VALVE_KNOWLEDGE,

  pumpMaintenance: PUMP_MAINTENANCE_KNOWLEDGE,

  residueCompressors: RESIDUE_COMPRESSOR_KNOWLEDGE,

  simulatorUI: SIMULATOR_UI_KNOWLEDGE,

};

 

const KNOWLEDGE_ROUTING_RULES = [

  { key: 'stabilizer', re: /\b(V-1521|P-5060|P-5065|AC-5055|stabilizer|demethanizer|LT-5060|TT-5060|PSV-1521)\b/i },

  { key: 'overheadCompressor', re: /\b(C-5700|5700|overhead compressor|TT-5700|PS-5700|PSV-5700)\b/i },

  { key: 'controlValves', re: /\b(PCV-1438|LCV-1241|control valve|Fisher|pilot air|actuator)\b/i },

  { key: 'pumpMaintenance', re: /\b(P-1630|P-1635|ISO 68|pump oil|booster pump maintenance)\b/i },

  { key: 'residueCompressors', re: /\b(C-6100|C-6200|C-6300|6100|6200|6300|residue compressor|PT-620[1-6]|TT-62\d\d)\b/i },

  { key: 'simulatorUI', re: /\b(simulation speed|real time|toolbar|outages panel|live|pause|simulator UI)\b/i },

];

 

function safeString(value, maxChars) {

  const text = value == null ? '' : String(value);

  return text.length > maxChars ? text.slice(0, maxChars) + '\n[TRUNCATED]' : text;

}

 

function selectKnowledge(message, context, mode) {

  const haystack = `${message || ''}\n${context || ''}`;

  const keys = new Set();

  for (const rule of KNOWLEDGE_ROUTING_RULES) if (rule.re.test(haystack)) keys.add(rule.key);

  if (mode === 'audit' || mode === 'scan') Object.keys(KNOWLEDGE_REGISTRY).forEach(k => keys.add(k));

  if (!keys.size && /\b(alarm|setpoint|loto|lockout|isolation|psv|pressure relief|maintenance)\b/i.test(haystack)) {

    Object.keys(KNOWLEDGE_REGISTRY).forEach(k => keys.add(k));

  }

  return Object.fromEntries([...keys].map(k => [k, KNOWLEDGE_REGISTRY[k]]));

}

 

function buildSystemPrompt(mode, selectedKnowledge, learnedKnowledge) {

  let modeInstructions = '';

  if (mode === 'loto') {

    modeInstructions = `MODE: LOTO DRAFTING. Produce only a DRAFT isolation/LOTO plan. Never present an AI-generated isolation as approved. Use exact tags only when present in supplied source data. Mark every unsupported or approximate value PENDING VERIFICATION. End with exactly: NOT APPROVED — FIELD VERIFICATION REQUIRED`;

  } else if (mode === 'audit') {

    modeInstructions = `MODE: AUDIT. Identify contradictions, unsupported values, mismatched tags, unsafe assumptions, and missing source provenance. Suggestions only.`;

  } else if (mode === 'scan') {

    modeInstructions = `MODE: RYAN SCAN. Audit the supplied code/question bank for wrong answers, contradictory comments, tag mismatches, and backwards logic. Cite line/question references when available.`;

  } else if (mode === 'recommend') {

    modeInstructions = `MODE: RECOMMENDATIONS. Use live CONTEXT first. Separate verified facts from inference. Rank likely causes, name the tag/value that would confirm each cause, then recommend checks before corrective action.`;

  } else if (mode === 'memory_extract') {

    modeInstructions = `MODE: MEMORY EXTRACTION. Extract only durable plant-specific memory candidates explicitly provided by the operator or clearly supported by supplied context. Do not store temporary live values, generic process theory, secrets, passwords, API keys, speculation, or unsupported safety-critical limits. Return strict JSON only: {"memories":[{"text":"...","title":"...","equipmentIds":[],"tags":[],"confidence":"high|medium|low"}]}. If none, return {"memories":[]}.`;

  } else if (['digest','learn','ingest'].includes(mode)) {

    modeInstructions = `MODE: DOCUMENT INGESTION. Extract only facts actually visible or stated in the supplied document. Do not merge in general knowledge. Do not silently correct the document. Return strict JSON only as instructed in the user message.`;

  } else {

    modeInstructions = `MODE: Q&A. Answer directly. Cite exact plant tags and values when supplied. Clearly label anything inferred, operator-observed, live, calculated, or pending verification.`;

  }

 

  const core = `You are Ryan, the plant-wide subject matter expert for the Clearfork Cryogenic Unit #1 simulator. You are expected to reason across the entire facility: process flow, control boards/HMIs, control loops, instruments, alarms, trips, permissives, interlocks, equipment states, valve states, operating modes, maintenance references, P&IDs, OEM manuals, procedures, and cross-system cause-and-effect. The simulator-supplied CONTEXT is authoritative for what is happening right now; source-backed Reference Library/document facts are authoritative for static plant knowledge according to their stated verification status. When CONTEXT contains a PLANT STATE ENGINE section, use its evaluated failed/healthy interlock and verification-gap results before making troubleshooting claims. When CONTEXT contains a PLANT GRAPH section, use the relationship type, source, and confidence labels exactly: never convert an interlock association into a piping connection, never reverse a directed flow edge without evidence, and prefer P&ID/Reference-Library flow edges over inference.

 

TRUST MODEL:

- VERIFIED: explicitly supported by a named source supplied to you.

- DOCUMENT_EXTRACTED_UNVERIFIED: extracted from a document but not yet field/engineering verified.

- LIVE: current simulator value supplied in CONTEXT.

- OPERATOR_OBSERVED: operator experience/history, useful for planning but not a design guarantee.

- INFERRED: your reasoning from supplied facts.

- PENDING_VERIFICATION: unknown, approximate, estimated, conflicting, or unsourced.

Never promote a lower-trust fact to VERIFIED without source evidence.

Never invent a tag, valve lineup, alarm limit, PSV set pressure, procedure step, or nameplate value.

For safety-critical work, distinguish drafting/analysis from authorization and require field verification.

 

PLANT-WIDE SME BEHAVIOR:

- Treat control-board/HMI context as first-class plant knowledge. When CONTEXT supplies the current board/screen, loops, PV/SP/output/mode, equipment run states, valve positions, active alarms, failed permissives/interlocks, trends, or scenario state, use those exact values and relationships.

- Correlate systems instead of answering in isolation: explain upstream causes, downstream consequences, and which board/tag should confirm the diagnosis.

- Distinguish CURRENT SIMULATOR STATE from design/reference facts and historical/operator observations.

- Never claim you can see a live value, board indication, alarm, valve position, or equipment state unless it is supplied in CONTEXT.

- Flag meaningful drift toward alarm limits, likely cross-system effects, maintenance concerns, and diagnostic checks when supported by supplied data. Prefer a diagnostic check before corrective action when uncertainty remains.

- When asked what is happening now, lead with current state and active abnormal conditions before background theory.

- When asked about a control board, explain what the displayed controls/indicators do, their current states when supplied, and the process consequence of changing them.

- If a requested simulator detail is absent from CONTEXT/reference data, say what Ryan needs exposed by the simulator rather than inventing it.

 

${modeInstructions}`;

 

  const reference = `SELECTED LEGACY KNOWLEDGE (treat unsourced/estimated/TBD items as PENDING_VERIFICATION):\n${JSON.stringify(selectedKnowledge)}\n\nLEARNED DOCUMENT KNOWLEDGE (each fact keeps its own verification status/source):\n${JSON.stringify(Array.isArray(learnedKnowledge) ? learnedKnowledge.slice(-250) : [])}`;

 

  return [

    { type: 'text', text: core },

    { type: 'text', text: reference, cache_control: { type: 'ephemeral', ttl: '1h' } },

  ];

}

 

function inferDocumentType(attachment, requestedType) {

  if (requestedType) return String(requestedType).toLowerCase();

  const label = String((attachment && attachment.label) || '').toLowerCase();

  const mediaType = String((attachment && attachment.mediaType) || '').toLowerCase();

  if (/p\s*&\s*id|pid|piping.*instrument|process.*instrument|drawing|flowsheet/.test(label)) return 'pid';

  if (/manual|oem|operation|maintenance|iom|instruction|handbook|datasheet/.test(label)) return 'manual';

  if (/^image\/(jpeg|png|gif|webp)$/.test(mediaType)) return 'image';

  // A generic PDF name such as "demeth" is common for a saved plant drawing.

  // Do not guess that it is a manual. Let the extraction prompts inspect the source.

  if (mediaType === 'application/pdf' || !mediaType) return 'auto';

  return 'document';

}

 

function estimateBase64Bytes(base64) {

  if (!base64) return 0;

  const s = String(base64).replace(/\s/g, '');

  return Math.floor((s.length * 3) / 4) - (s.endsWith('==') ? 2 : s.endsWith('=') ? 1 : 0);

}

 

function attachmentToContentBlock(attachment) {

  if (!attachment) return null;

  let mediaType = String(attachment.mediaType || '').toLowerCase();

  if (mediaType === 'image/jpg') mediaType = 'image/jpeg';

  const label = safeString(attachment.label || 'Ryan source document', 200);

 

  if (attachment.fileId) {

    if (mediaType.startsWith('image/')) return { type: 'image', source: { type: 'file', file_id: attachment.fileId } };

    if (mediaType === 'application/pdf' || mediaType === 'text/plain' || !mediaType) {

      return { type: 'document', source: { type: 'file', file_id: attachment.fileId }, title: label, context: 'Plant reference supplied for Ryan ingestion/analysis.', citations: { enabled: true } };

    }

  }

 

  if (!attachment.base64 && !attachment.text) return null;

  if (attachment.base64 && estimateBase64Bytes(attachment.base64) > MAX_ATTACHMENT_BYTES) {

    const err = new Error(`Attachment is too large for this Ryan request (${Math.round(estimateBase64Bytes(attachment.base64)/1024/1024)} MB). Split the PDF into sections or upload it through an Anthropic Files API flow and send fileId.`);

    err.statusCode = 413;

    throw err;

  }

 

  if (mediaType === 'application/pdf') {

    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: attachment.base64 }, title: label, context: 'Plant reference supplied for Ryan ingestion/analysis.', citations: { enabled: true } };

  }

  if (mediaType === 'text/plain' || mediaType === 'text/markdown' || mediaType === 'text/csv' || mediaType === 'application/json' || attachment.text) {

    const text = attachment.text || Buffer.from(attachment.base64, 'base64').toString('utf8');

    return { type: 'document', source: { type: 'text', media_type: 'text/plain', data: safeString(text, 500000) }, title: label, context: 'Plant reference supplied for Ryan ingestion/analysis.', citations: { enabled: true } };

  }

  if (/^image\/(jpeg|png|gif|webp)$/.test(mediaType)) {

    return { type: 'image', source: { type: 'base64', media_type: mediaType, data: attachment.base64 } };

  }

 

  const err = new Error(`Unsupported attachment type "${mediaType || 'unknown'}". Ryan can directly ingest PDF, TXT/MD/CSV as plain text, or JPEG/PNG/GIF/WEBP images. Convert DOCX/XLSX and other binary manuals to PDF or text first.`);

  err.statusCode = 415;

  throw err;

}

 

function buildIngestionInstruction(documentType, label) {

  const common = `Source label: ${label || 'unnamed document'}. Return ONLY valid compact JSON, no markdown fences and no prose outside JSON. Every extracted fact must keep sourceLabel and verificationStatus="DOCUMENT_EXTRACTED_UNVERIFIED". Existing P&ID Reference Library context may be supplied only to flag duplicates/conflicts; never use it to fill unreadable or missing facts in the attachment.`;

  if (documentType === 'pid') {

    return `${common}\nThis is a P&ID/drawing ingestion. Read text AND visual relationships. Return a compact object with keys documentType, sourceLabel, facts, equipment, connections, conflicts, warnings. Extract every legible plant-relevant tag/relationship within the response budget: equipment, instruments, valves, line numbers/sizes/specs, flow direction, continuation drawings, control loops, PSVs/relief destinations/set pressures actually shown, isolation valves, drains/vents, fail/normal positions, and explicit notes. facts items use statement, classification, equipmentIds, page, sourceLabel, verificationStatus, confidence. Do not repeat the same fact across arrays. Do NOT infer typical connections. If too dense to finish, include PARTIAL_EXTRACTION_REQUIRES_ADDITIONAL_PASS in warnings.`;

  }

  if (documentType === 'manual') {

    return `${common}\nThis is an OEM/operations/maintenance manual ingestion. Return an object with keys documentType, sourceLabel, facts, procedures, warnings. facts fields: statement, classification, equipmentIds, page, sourceLabel, verificationStatus, confidence. Extract manufacturer/model applicability, operating limits, permissives, alarms/trips, lubrication specs, maintenance intervals, capacities, torque/clearance values, startup/shutdown steps, troubleshooting tables, warnings/cautions, and parts/specifications actually stated. Keep units exactly as written.`;

  }

  return `${common}\nReturn an object with keys documentType, sourceLabel, facts, warnings. facts fields: statement, classification, equipmentIds, page, sourceLabel, verificationStatus, confidence. Extract at most 120 clear plant-relevant facts.`;

}

 

function sanitizeHistory(history) {

  if (!Array.isArray(history)) return [];

  return history.slice(-MAX_HISTORY_TURNS).filter(h => h && (h.role === 'user' || h.role === 'assistant') && h.content != null).map(h => {

    if (typeof h.content === 'string') return { role: h.role, content: safeString(h.content, MAX_HISTORY_CHARS) };

    if (Array.isArray(h.content)) {

      const text = h.content.filter(x => x && x.type === 'text').map(x => x.text || '').join('\n');

      return { role: h.role, content: safeString(text, MAX_HISTORY_CHARS) };

    }

    return { role: h.role, content: safeString(JSON.stringify(h.content), MAX_HISTORY_CHARS) };

  });

}

 

function secureEqual(a, b) {

  const aa = Buffer.from(String(a || ''));

  const bb = Buffer.from(String(b || ''));

  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);

}

 

function postJson(url, headers, payloadObj) {

  return new Promise((resolve, reject) => {

    const payload = JSON.stringify(payloadObj);

    const u = new URL(url);

    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'POST', headers: { ...headers, 'content-length': Buffer.byteLength(payload) } }, res => {

      let raw = '';

      res.setEncoding('utf8');

      res.on('data', chunk => { raw += chunk; if (raw.length > 10_000_000) req.destroy(new Error('Anthropic response exceeded Ryan safety limit.')); });

      res.on('end', () => {

        try { resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, data: JSON.parse(raw || '{}') }); }

        catch { resolve({ ok: false, status: res.statusCode, data: { error: { message: `Non-JSON response from Anthropic (HTTP ${res.statusCode}): ${raw.slice(0,300)}` } } }); }

      });

    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error(`Anthropic request timed out after ${REQUEST_TIMEOUT_MS} ms.`)));

    req.on('error', reject);

    req.write(payload);

    req.end();

  });

}

 

async function postJsonWithRetry(url, headers, payload, attempts = 3) {

  let last;

  for (let i = 0; i < attempts; i++) {

    try { last = await postJson(url, headers, payload); } catch (e) { if (i === attempts - 1) throw e; await new Promise(r => setTimeout(r, 350 * (i + 1))); continue; }

    if (last.ok || ![429,500,502,503,504,529].includes(last.status) || i === attempts - 1) return last;

    await new Promise(r => setTimeout(r, 500 * (i + 1)));

  }

  return last;

}

 

function httpRequestRaw(method, url, headers, bodyBuffer) {

  return new Promise((resolve, reject) => {

    const u = new URL(url);

    const opts = { hostname: u.hostname, path: u.pathname + u.search, method, headers: { ...(headers || {}) } };

    if (bodyBuffer) opts.headers['content-length'] = Buffer.byteLength(bodyBuffer);

    const req = https.request(opts, res => {

      const chunks = [];

      let total = 0;

      res.on('data', chunk => {

        chunks.push(chunk); total += chunk.length;

        if (total > 20_000_000) req.destroy(new Error('Anthropic response exceeded Ryan safety limit.'));

      });

      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: Buffer.concat(chunks).toString('utf8'), headers: res.headers }));

    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error(`Anthropic request timed out after ${REQUEST_TIMEOUT_MS} ms.`)));

    req.on('error', reject);

    if (bodyBuffer) req.write(bodyBuffer);

    req.end();

  });

}

 

async function uploadAttachmentToAnthropic(attachment, apiKey) {

  if (!attachment) throw new Error('No attachment supplied.');

  if (attachment.fileId) return attachment.fileId;

  if (!attachment.base64) throw new Error('Document learning requires a PDF/image attachment with base64 data or an Anthropic fileId.');

  const data = Buffer.from(String(attachment.base64), 'base64');

  if (!data.length) throw new Error('Attachment data was empty.');

  const boundary = '----RyanBoundary' + crypto.randomBytes(12).toString('hex');

  const filename = String(attachment.label || 'ryan-source.pdf').replace(/[\r\n"\\]/g, '_').slice(0,180);

  const mediaType = String(attachment.mediaType || 'application/pdf');

  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mediaType}\r\n\r\n`, 'utf8');

  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');

  const body = Buffer.concat([head, data, tail]);

  const res = await httpRequestRaw('POST', 'https://api.anthropic.com/v1/files', {

    'x-api-key': apiKey,

    'anthropic-version': ANTHROPIC_VERSION_V2,

    'anthropic-beta': 'files-api-2025-04-14',

    'content-type': `multipart/form-data; boundary=${boundary}`

  }, body);

  let parsed = null; try { parsed = JSON.parse(res.body || '{}'); } catch {}

  if (!res.ok || !parsed || !parsed.id) {

    const msg = parsed && parsed.error && parsed.error.message ? parsed.error.message : `File upload failed (HTTP ${res.status}): ${(res.body || '').slice(0,300)}`;

    throw new Error(msg);

  }

  return parsed.id;

}

 

function batchSourceBlock(fileId, label, mediaType) {

  const mt = String(mediaType || '').toLowerCase();

  if (/^image\/(jpeg|png|gif|webp)$/.test(mt)) return { type: 'image', source: { type: 'file', file_id: fileId } };

  return { type: 'document', source: { type: 'file', file_id: fileId }, title: safeString(label || 'Ryan source document', 200), citations: { enabled: true } };

}

 

function documentExtractionOutputConfig() {

  return {

    format: {

      type: 'json_schema',

      schema: {

        type: 'object',

        properties: {

          documentType: { type: 'string' },

          facts: {

            type: 'array',

            items: {

              type: 'object',

              properties: {

                statement: { type: 'string' },

                classification: { type: 'string' },

                equipmentIds: { type: 'array', items: { type: 'string' } },

                page: { type: 'string' },

                sourceLabel: { type: 'string' },

                verificationStatus: { type: 'string' },

                confidence: { type: 'string' }

              },

              required: ['statement','classification','equipmentIds','page','sourceLabel','verificationStatus','confidence'],

              additionalProperties: false

            }

          },

          warnings: { type: 'array', items: { type: 'string' } }

        },

        required: ['documentType','facts','warnings'],

        additionalProperties: false

      }

    }

  };

}

 

function buildBatchPasses(documentType, fileId, label, existingContext, mediaType) {

  const source = safeString(label || 'unnamed source', 200);

  const existing = safeString(existingContext || '', 16000);

  const limit = documentType === 'image' ? IMAGE_MAX_TOKENS : DOC_MAX_TOKENS;

  const rules = `SOURCE: ${source}. The API enforces a JSON schema. Extract only facts actually visible/stated in this source. Every facts item must use verificationStatus="DOCUMENT_EXTRACTED_UNVERIFIED". Never guess unreadable tags, line numbers, valve positions, set pressures, piping connections, ratings, or flow direction. Existing Reference Library context may identify duplicates/conflicts only; it may NEVER fill in unreadable content on this source. Keep each fact compact and atomic. Target no more than ${FACTS_PER_PASS} high-value unique facts per pass so the JSON can finish cleanly. If more detail remains, say so in warnings instead of bloating or truncating the response. Existing context:\n${existing || '(none supplied)'}`;

  if (documentType === 'image') {

    return [

      { id: 'image_identification_nameplate', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: PLANT IMAGE / PHOTO. PASS 1 - IDENTIFICATION / VISIBLE TEXT. Inspect the image itself. Extract visible manufacturer, model, item/serial numbers, equipment tags, nameplate ratings, pressure/temperature/electrical/mechanical data, labels, materials, valve/actuator markings, instrument ranges, and any readable values. If this is a control board/HMI photo, extract visible tag names, PV/SP/output/mode, alarm labels, switches/selectors/buttons, and displayed states. Do not infer text that is blurred, cropped, or hidden.` },

      { id: 'image_context_relationships', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: PLANT IMAGE / PHOTO. PASS 2 - EQUIPMENT / CONTROL RELATIONSHIPS. Extract only relationships visible in the image: what component a tag/nameplate appears attached to, actuator/valve/instrument association, control-board grouping, visible piping connections, position indications, alarm/status lights, and operator-useful observations. Do not turn visual proximity into a piping or control relationship unless the image actually supports it. Note unreadable/ambiguous items in warnings.` }

    ];

  }

  if (documentType === 'pid') {

    return [

      { id: 'pid_equipment_topology', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 1 - EQUIPMENT / PHYSICAL TOPOLOGY. Extract equipment tags/names/services, manual and automated valve tags, line numbers, line sizes/specs where legible, explicit flow arrows, upstream/downstream connections actually drawn, bypasses, check valves, drains, vents, and off-page/continuation references. Preserve drawing/page references. Never infer connectivity from generic plant knowledge.` },

      { id: 'pid_instruments_controls', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 2 - INSTRUMENTATION / CONTROLS. Extract instrument tags, sensing points, controller-to-transmitter-to-valve relationships actually shown, control signals, control-valve tags, fail/normal positions, analyzers, local indicators, and control notes. Keep physical piping relationships separate from signal/control relationships.` },

      { id: 'pid_safety_loto', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 3 - SAFETY / RELIEF / ISOLATION. Extract PSVs with protected equipment, set pressure/rating only when shown, relief destination, inlet/outlet isolation, shutdown valves, isolation boundaries, drains/vents/bleeds/depressurization points, and LOTO-relevant energy/isolation relationships. This is source extraction only, never an approved LOTO.` },

      { id: 'pid_notes_specs', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 4 - DRAWING NOTES / SPECIAL DETAILS / GAPS. Extract process notes, line/service annotations, special valve notes, tie-in/continuation drawing references, explicit operating/normal-position notes, material/spec callouts, and remaining legible plant-specific details not already covered. Flag ambiguities, conflicts, and anything requiring field verification.` }

    ];

  }

  if (documentType === 'manual') {

    return [

      { id: 'manual_applicability_specs', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 1 - APPLICABILITY / EQUIPMENT / SPECIFICATIONS. Extract manufacturer/model applicability, capacities, ratings, operating envelope, temperatures/pressures, lubrication requirements, materials, clearances, torque values, parts/specifications, and units exactly as written.` },

      { id: 'manual_controls_safety', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 2 - CONTROLS / ALARMS / SAFETY. Extract alarms, trips, permissives, shutdown conditions, warnings/cautions, instrumentation/control requirements, protective devices, and safety prerequisites stated by the manual.` },

      { id: 'manual_operations', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 3 - OPERATIONS. Extract startup, shutdown, warm-up/cool-down, loading/unloading, normal operating checks, abnormal operating guidance, and required tests actually stated.` },

      { id: 'manual_maintenance_troubleshooting', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 4 - MAINTENANCE / TROUBLESHOOTING. Extract inspection and maintenance intervals, replacement criteria, troubleshooting cause/action tables, required measurements/tests, preservation/storage instructions, consumables, and maintenance warnings. Keep OEM guidance separate from Clear Fork-specific practice unless explicitly stated.` }

    ];

  }

  // Auto mode for generic PDF names. Each pass must classify the actual source from visible content.

  return [

    { id: 'auto_classify_physical', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 1. Inspect the source first and set documentType to pid, manual, or document. IF P&ID/DRAWING: extract equipment, valves, piping topology, line numbers/sizes/specs, explicit flow direction, continuations, drains/vents/bypasses and physical notes. IF MANUAL: extract applicability, equipment specs, ratings, limits, lubrication/material/parts information. IF OTHER DOCUMENT: extract only clearly stated plant-specific facts.` },

    { id: 'auto_controls_operations', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 2. Re-evaluate the source type from actual content. IF P&ID: extract instrumentation, control loops, valve/controller relationships, fail/normal positions, alarms/trips/interlocks shown. IF MANUAL: extract controls, alarms/trips, startup/shutdown, operations, inspections and maintenance intervals. IF OTHER: extract remaining supported operating/control facts.` },

    { id: 'auto_safety_detail', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 3. Re-evaluate the source type. IF P&ID: extract PSVs/relief paths/set pressures only when shown, isolation/LOTO-relevant relationships, vents/drains/depressurization paths, drawing notes and continuation references. IF MANUAL: extract warnings/cautions, troubleshooting, safety prerequisites, required tests and remaining detailed specifications. Explicitly flag ambiguity instead of guessing.` }

  ];

}

 

async function learnPlantImageDirect(attachment, existingContext, apiKey) {

  if (!attachment) throw new Error('Image learning requires an attachment.');

  let mediaType = String(attachment.mediaType || '').toLowerCase();

  if (mediaType === 'image/jpg') mediaType = 'image/jpeg';

  if (!/^image\/(jpeg|png|gif|webp)$/.test(mediaType)) throw new Error(`image_learn requires JPEG/PNG/GIF/WEBP, received ${mediaType || 'unknown'}.`);

  const sourceLabel = safeString(attachment.label || 'plant image', 200);

  const existing = safeString(existingContext || '', 12000);

  const prompt = `SOURCE: ${sourceLabel}\nDOCUMENT TYPE: PLANT IMAGE / PHOTO.\nInspect the image itself and extract ONLY facts that are actually visible/readable. First classify the source as plant_photo, nameplate, control_board_hmi, pid_drawing_photo, oem_reference, external_reference, or other. For plant/nameplate/control-board content, extract visible manufacturer, model, item/serial/part numbers, equipment tags, pressure/temperature/electrical/mechanical ratings, materials, labels, actuator/valve/instrument markings, instrument ranges, PV/SP/output/mode, alarm/status indicators, switches/selectors/buttons, displayed states, and clearly visible component relationships. If the image is a web/search screenshot or other generic technical reference, you MAY extract the technical statements it explicitly shows, but classify them as external_reference and never present them as Clear Fork-specific or verified plant facts. Do not infer blurred/cropped text or unstated plant facts. Every fact must use verificationStatus="DOCUMENT_EXTRACTED_UNVERIFIED". Keep facts compact and atomic. Target no more than ${Math.min(FACTS_PER_PASS, 45)} high-value facts so the response finishes cleanly. Existing Reference Library context is only for duplicate/conflict awareness and must not fill in unreadable image content.\nExisting context:\n${existing || '(none supplied)'}`;

  const content = [attachmentToContentBlock(attachment), { type: 'text', text: prompt }].filter(Boolean);

  const payload = {

    model: MODEL_V2,

    max_tokens: IMAGE_MAX_TOKENS,

    output_config: documentExtractionOutputConfig(),

    messages: [{ role: 'user', content }]

  };

  const result = await postJsonWithRetry('https://api.anthropic.com/v1/messages', {

    'content-type': 'application/json',

    'x-api-key': apiKey,

    'anthropic-version': ANTHROPIC_VERSION_V2,

    ...(attachment.fileId ? { 'anthropic-beta': 'files-api-2025-04-14' } : {})

  }, payload);

  if (!result.ok) {

    const d = result.data || {};

    throw new Error(d.error && d.error.message ? d.error.message : `Anthropic image learning failed (HTTP ${result.status}).`);

  }

  const data = result.data || {};

  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('\n');

  const parsed = parseJsonReply(text);

  const partial = !parsed ? parsePartialFactsFromTruncatedJson(text) : [];

  const facts = parsed && Array.isArray(parsed.facts) ? parsed.facts : (Array.isArray(parsed) ? parsed : partial);

  const warnings = [];

  if (!parsed && partial.length) warnings.push(`Image response reached ${data.stop_reason || 'an incomplete stop'}; Ryan recovered ${partial.length} complete fact(s) from the partial JSON.`);

  if (!parsed && !partial.length) warnings.push(`Image response could not be parsed (stop_reason=${data.stop_reason || 'unknown'}).`);

  const seen = new Set();

  const cleaned = (facts || []).filter(f => {

    const statement = safeString(f && f.statement || '', 1400).trim();

    if (!statement) return false;

    const key = statement.toLowerCase().replace(/\s+/g, ' ');

    if (seen.has(key)) return false;

    seen.add(key);

    f.statement = statement;

    f.sourceLabel = f.sourceLabel || sourceLabel;

    f.verificationStatus = 'DOCUMENT_EXTRACTED_UNVERIFIED';

    return true;

  }).slice(0, MAX_LEARNED_FACTS);

  const usage = data.usage || {};

  const inputTokens = Number(usage.input_tokens || 0), outputTokens = Number(usage.output_tokens || 0);

  return {

    ingestion: { ok: cleaned.length > 0, documentType: parsed && parsed.documentType || 'image', sourceLabel, facts: cleaned, warnings: [...(parsed && parsed.warnings || []), ...warnings], persistenceRequired: true },

    cost: { usd: (inputTokens * INPUT_PRICE_PER_MILLION + outputTokens * OUTPUT_PRICE_PER_MILLION) / 1_000_000, inputTokens, outputTokens, inRate: INPUT_PRICE_PER_MILLION, outRate: OUTPUT_PRICE_PER_MILLION },

    stopReason: data.stop_reason || null

  };

}

 

async function startDocumentBatch(attachment, documentType, existingContext, apiKey) {

  const fileId = await uploadAttachmentToAnthropic(attachment, apiKey);

  const mediaType = String(attachment && attachment.mediaType || '').toLowerCase();

  const passes = buildBatchPasses(documentType, fileId, attachment && attachment.label, existingContext, mediaType);

  const requests = passes.map(p => ({

    custom_id: p.id,

    params: {

      model: MODEL_V2,

      max_tokens: p.max_tokens,

      output_config: documentExtractionOutputConfig(),

      messages: [{ role: 'user', content: [batchSourceBlock(fileId, attachment && attachment.label, mediaType), { type: 'text', text: p.text }] }]

    }

  }));

  const result = await postJson('https://api.anthropic.com/v1/messages/batches', {

    'content-type': 'application/json',

    'x-api-key': apiKey,

    'anthropic-version': ANTHROPIC_VERSION_V2,

    'anthropic-beta': 'files-api-2025-04-14,message-batches-2024-09-24,pdfs-2024-09-25'

  }, { requests });

  if (!result.ok || !result.data || !result.data.id) {

    const d = result.data || {};

    throw new Error(d.error && d.error.message ? d.error.message : `Could not create Anthropic document batch (HTTP ${result.status}).`);

  }

  return { batchId: result.data.id, fileId, processingStatus: result.data.processing_status || 'in_progress', documentType, sourceLabel: attachment && attachment.label || null };

}

 

function parsePartialFactsFromTruncatedJson(text) {

  const raw = String(text || '');

  const keyPos = raw.indexOf('"facts"');

  if (keyPos < 0) return [];

  const arrStart = raw.indexOf('[', keyPos);

  if (arrStart < 0) return [];

  const out = [];

  let depth = 0, inString = false, escape = false, objStart = -1;

  for (let i = arrStart + 1; i < raw.length; i++) {

    const ch = raw[i];

    if (inString) {

      if (escape) escape = false;

      else if (ch === '\\') escape = true;

      else if (ch === '"') inString = false;

      continue;

    }

    if (ch === '"') { inString = true; continue; }

    if (ch === '{') { if (depth === 0) objStart = i; depth++; continue; }

    if (ch === '}') {

      if (depth > 0) depth--;

      if (depth === 0 && objStart >= 0) {

        const candidate = raw.slice(objStart, i + 1);

        try { const obj = JSON.parse(candidate); if (obj && obj.statement) out.push(obj); } catch {}

        objStart = -1;

      }

    }

  }

  return out;

}

 

async function getDocumentBatchStatus(batchId, apiKey) {

  // Polling the batch itself only needs the normal Anthropic auth/version headers.

  // Keep Files/PDF beta headers on creation/upload, not on status polling.

  const headers = {

    'x-api-key': apiKey,

    'anthropic-version': ANTHROPIC_VERSION_V2

  };

  const statusRes = await httpRequestRaw('GET', `https://api.anthropic.com/v1/messages/batches/${encodeURIComponent(batchId)}`, headers);

  let batch = null; try { batch = JSON.parse(statusRes.body || '{}'); } catch {}

  if (!statusRes.ok || !batch) throw new Error(batch && batch.error && batch.error.message ? batch.error.message : `Could not retrieve document batch (HTTP ${statusRes.status}).`);

  if (batch.processing_status !== 'ended') {

    return { complete: false, processingStatus: batch.processing_status || 'in_progress', requestCounts: batch.request_counts || null, endedAt: batch.ended_at || null };

  }

  // Anthropic returns the canonical JSONL results URL after processing ends.

  // Use that URL rather than reconstructing it so this stays compatible with API changes.

  const resultsUrl = batch.results_url || `https://api.anthropic.com/v1/messages/batches/${encodeURIComponent(batchId)}/results`;

  const resultRes = await httpRequestRaw('GET', resultsUrl, headers);

  if (!resultRes.ok) throw new Error(`Could not retrieve document batch results (HTTP ${resultRes.status}): ${(resultRes.body || '').slice(0,300)}`);

  const lines = String(resultRes.body || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean);

  const passes = [];

  const allFacts = [];

  let inputTokens = 0, outputTokens = 0;

  const errors = [];

  for (const line of lines) {

    let row; try { row = JSON.parse(line); } catch { errors.push('Unparseable batch result line.'); continue; }

    if (!row || !row.result) continue;

    if (row.result.type !== 'succeeded' || !row.result.message) {

      errors.push(`${row.custom_id || 'pass'}: ${row.result.type || 'unknown result'}`); continue;

    }

    const msg = row.result.message;

    const text = (msg.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('\n');

    const parsed = parseJsonReply(text);

    const partialFacts = !parsed ? parsePartialFactsFromTruncatedJson(text) : [];

    const facts = parsed && Array.isArray(parsed.facts) ? parsed.facts : (Array.isArray(parsed) ? parsed : partialFacts);

    if (!parsed) {

      if (partialFacts.length) errors.push(`${row.custom_id || 'pass'} hit ${msg.stop_reason || 'an incomplete response'}; Ryan recovered ${partialFacts.length} complete fact(s) from the partial JSON instead of discarding the pass.`);

      else errors.push(`${row.custom_id || 'pass'} returned non-JSON output (stop_reason=${msg.stop_reason || 'unknown'}; preview=${safeString(text, 180)}).`);

    }

    passes.push({ id: row.custom_id || null, facts: facts.length, warnings: parsed && parsed.warnings || [], stopReason: msg.stop_reason || null, partialRecovered: !parsed && partialFacts.length > 0 });

    for (const f of facts) allFacts.push(f);

    inputTokens += Number(msg.usage && msg.usage.input_tokens || 0);

    outputTokens += Number(msg.usage && msg.usage.output_tokens || 0);

  }

  const seen = new Set();

  const facts = allFacts.filter(f => {

    const statement = safeString(f && f.statement || '', 1400).trim();

    if (!statement) return false;

    const key = statement.toLowerCase().replace(/\s+/g, ' ');

    if (seen.has(key)) return false;

    seen.add(key);

    f.statement = statement;

    if (!f.verificationStatus) f.verificationStatus = 'DOCUMENT_EXTRACTED_UNVERIFIED';

    return true;

  }).slice(0, MAX_LEARNED_FACTS);

  return {

    complete: true,

    processingStatus: batch.processing_status,

    requestCounts: batch.request_counts || null,

    ingestion: { ok: true, facts, passes, persistenceRequired: true, errors },

    cost: {

      usd: (inputTokens * INPUT_PRICE_PER_MILLION + outputTokens * OUTPUT_PRICE_PER_MILLION) / 1_000_000,

      inputTokens, outputTokens, inRate: INPUT_PRICE_PER_MILLION, outRate: OUTPUT_PRICE_PER_MILLION,

      pricingNote: 'Estimate uses Ryan environment pricing settings; Message Batch pricing may differ from standard Messages API pricing.'

    }

  };

}

 

function parseJsonReply(text) {

  const raw = String(text || '').trim();

  if (!raw) return null;

  const candidates = [];

  candidates.push(raw);

  candidates.push(raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim());

  const firstObj = raw.indexOf('{'), lastObj = raw.lastIndexOf('}');

  if (firstObj >= 0 && lastObj > firstObj) candidates.push(raw.slice(firstObj, lastObj + 1));

  const firstArr = raw.indexOf('['), lastArr = raw.lastIndexOf(']');

  if (firstArr >= 0 && lastArr > firstArr) candidates.push(raw.slice(firstArr, lastArr + 1));

  for (const c of candidates) {

    try { return JSON.parse(c); } catch {}

  }

  return null;

}

 

exports.handler = async function(event) {

  try {

    if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: { 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' }, body: '' };

    if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };

 

    let body;

    try {

      const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : (event.body || '{}');

      body = JSON.parse(rawBody);

    } catch (e) { return { statusCode: 400, body: JSON.stringify({ error: `Invalid JSON body: ${e.message}` }) }; }

 

    const { message, context, mode, scanLabel, history, password, attachment, learnedKnowledge, documentType, clientBuild } = body || {};

    const expectedPw = process.env.RYAN_AI_PASSWORD;

    if (expectedPw && !secureEqual(password, expectedPw)) return { statusCode: 403, body: JSON.stringify({ error: 'Incorrect password.' }) };

 

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the server.' }) };

 

    const effectiveMode = String(mode || 'qa').toLowerCase();

 

    if (clientBuild && String(clientBuild) !== RYAN_BUILD_ID) {

      return { statusCode: 409, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: `Ryan version mismatch: client ${clientBuild}, backend ${RYAN_BUILD_ID}. Deploy the matching index.html and ryan.js together.`, buildId: RYAN_BUILD_ID }) };

    }

    if (effectiveMode === 'health') {

      return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ ok: true, buildId: RYAN_BUILD_ID }) };

    }

 

    // Plant photos/nameplates/control-board images use a dedicated fast structured path.

    // Do not route them through old PDF/manual batch jobs.

    if (effectiveMode === 'image_learn') {

      if (!attachment) return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Image learning requires an attachment.' }) };

      try {

        const learned = await learnPlantImageDirect(attachment, context, apiKey);

        return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ buildId: RYAN_BUILD_ID, ...learned }) };

      } catch (e) {

        return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: `Could not learn plant image: ${e.message || e}`, buildId: RYAN_BUILD_ID }) };

      }

    }

 

    // Long document learning is asynchronous on Anthropic's Message Batches API.

    // This avoids Netlify synchronous-function 504s without requiring extra Netlify function files.

    if (effectiveMode === 'digest_batch_start') {

      if (!attachment) return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Document learning requires an attachment.' }) };

      const docType = inferDocumentType(attachment, documentType);

      try {

        const job = await startDocumentBatch(attachment, docType, context, apiKey);

        return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ buildId: RYAN_BUILD_ID, job }) };

      } catch (e) {

        return { statusCode: 502, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: `Could not start document learning: ${e.message || e}` }) };

      }

    }

    if (effectiveMode === 'digest_batch_status') {

      const batchId = safeString(body && body.batchId, 160);

      if (!batchId) return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Missing batchId.' }) };

      try {

        const status = await getDocumentBatchStatus(batchId, apiKey);

        return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ buildId: RYAN_BUILD_ID, ...status }) };

      } catch (e) {

        return { statusCode: 502, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: `Could not check document learning: ${e.message || e}`, errorType: e && e.name || 'Error' }) };

      }

    }

 

    const msg = safeString(message, MAX_MESSAGE_CHARS);

    const ctx = safeString(context, MAX_CONTEXT_CHARS);

    const selectedKnowledge = selectKnowledge(msg, ctx, effectiveMode);

    const system = buildSystemPrompt(effectiveMode, selectedKnowledge, learnedKnowledge);

    const messages = sanitizeHistory(history);

    const userContent = [];

 

    if (attachment) {

      const block = attachmentToContentBlock(attachment);

      if (block) userContent.push(block);

    }

 

    let userText = msg;

    if (!userText && attachment && String(attachment.mediaType || '').toLowerCase().startsWith('image/')) userText = 'Analyze the attached plant image carefully. Describe what is actually visible, identify legible tags/values/controls, relate it to supplied plant context, and clearly mark anything unreadable or uncertain instead of guessing.';

    if (ctx) userText += `\n\n--- LIVE/SEARCH CONTEXT ---\n${ctx}`;

    if (scanLabel) userText += `\n\n--- SCAN BATCH LABEL ---\n${safeString(scanLabel, 500)}`;

 

    const isIngest = ['digest','learn','ingest'].includes(effectiveMode);

    const isMemoryExtract = effectiveMode === 'memory_extract';

    let ingestType = null;

 

    if (isIngest) {

      if (!attachment) return { statusCode: 400, body: JSON.stringify({ error: 'Document ingestion requires an attachment.' }) };

      ingestType = inferDocumentType(attachment, documentType);

      userText = `${buildIngestionInstruction(ingestType, attachment.label)}\n\n${userText || 'Ingest this source into Ryan knowledge.'}`;

    }

 

    userContent.push({ type: 'text', text: userText || '(no message provided)' });

    messages.push({ role: 'user', content: userContent });

 

    const maxTokens = isIngest ? (ingestType === 'image' ? IMAGE_MAX_TOKENS : DOC_MAX_TOKENS) : (effectiveMode === 'scan' ? 5000 : (isMemoryExtract ? 1200 : 1800));

    const payload = { model: MODEL_V2, max_tokens: maxTokens, system, messages };

 

    let result;

    try {

      result = await postJsonWithRetry('https://api.anthropic.com/v1/messages', {

        'content-type': 'application/json',

        'x-api-key': apiKey,

        'anthropic-version': ANTHROPIC_VERSION_V2,

        ...(attachment && attachment.fileId ? { 'anthropic-beta': 'files-api-2025-04-14' } : {}),

      }, payload);

    } catch (networkErr) {

      return { statusCode: 502, body: JSON.stringify({ error: `Could not reach Anthropic API: ${networkErr.message || 'network error'}` }) };

    }

 

    if (!result.ok) {

      const d = result.data;

      const apiMessage = d && d.error && d.error.message ? d.error.message : `Anthropic API error (HTTP ${result.status})`;

      return { statusCode: result.status === 413 ? 413 : 502, body: JSON.stringify({ error: apiMessage }) };

    }

 

    const data = result.data || {};

    const reply = (data.content || []).filter(block => block.type === 'text').map(block => block.text).join('\n');

    const usage = data.usage || {};

    const inputTokens = Number(usage.input_tokens || 0);

    const outputTokens = Number(usage.output_tokens || 0);

    const costUsd = (inputTokens * INPUT_PRICE_PER_MILLION + outputTokens * OUTPUT_PRICE_PER_MILLION) / 1_000_000;

 

    const response = {

      reply,

      cost: {

        usd: costUsd,

        inputTokens,

        outputTokens,

        inRate: INPUT_PRICE_PER_MILLION,

        outRate: OUTPUT_PRICE_PER_MILLION,

        cacheCreationInputTokens: Number(usage.cache_creation_input_tokens || 0),

        cacheReadInputTokens: Number(usage.cache_read_input_tokens || 0),

        pricingNote: 'Estimate uses RYAN_INPUT_PRICE_PER_MILLION and RYAN_OUTPUT_PRICE_PER_MILLION environment settings.'

      },

      meta: { model: MODEL_V2, mode: effectiveMode, knowledgeSections: Object.keys(selectedKnowledge), stopReason: data.stop_reason || null }

    };

 

    if (isMemoryExtract) {

      const parsedMemory = parseJsonReply(reply);

      response.memoryExtraction = parsedMemory && Array.isArray(parsedMemory.memories) ? parsedMemory : { memories: [] };

    }

 

    if (isIngest) {

      const parsed = parseJsonReply(reply);

      if (!parsed) {

        response.ingestion = { ok: false, error: 'Claude returned non-JSON ingestion output. Retry the ingestion or use a smaller document section.', rawReply: reply };

      } else {

        const facts = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.facts) ? parsed.facts : []);

        response.ingestion = {

          ok: true,

          documentType: ingestType || inferDocumentType(attachment, documentType),

          sourceLabel: attachment.label || null,

          facts,

          extracted: parsed,

          persistenceRequired: true,

          persistenceInstruction: 'Store ingestion.facts/extracted in the simulator knowledge library and send the relevant records back as learnedKnowledge on later Ryan requests.'

        };

        response.learnedFacts = facts; // backward-friendly convenience field

      }

    }

 

    response.buildId = RYAN_BUILD_ID;

    return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify(response) };

  } catch (err) {

    console.error('Ryan AI handler crashed:', err);

    return { statusCode: err.statusCode || 500, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: err.message || `Unknown server error: ${String(err)}`, buildId: RYAN_BUILD_ID }) };

  }

};

 

module.exports.STABILIZER_KNOWLEDGE = STABILIZER_KNOWLEDGE;

module.exports.OVERHEAD_COMPRESSOR_KNOWLEDGE = OVERHEAD_COMPRESSOR_KNOWLEDGE;

module.exports.CONTROL_VALVE_KNOWLEDGE = CONTROL_VALVE_KNOWLEDGE;

module.exports.PUMP_MAINTENANCE_KNOWLEDGE = PUMP_MAINTENANCE_KNOWLEDGE;

module.exports.RESIDUE_COMPRESSOR_KNOWLEDGE = RESIDUE_COMPRESSOR_KNOWLEDGE;

module.exports.SIMULATOR_UI_KNOWLEDGE = SIMULATOR_UI_KNOWLEDGE;

module.exports._test = { selectKnowledge, inferDocumentType, parseJsonReply, parsePartialFactsFromTruncatedJson, sanitizeHistory, attachmentToContentBlock, buildBatchPasses };
