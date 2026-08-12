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

 

 

 

// ===== CLEAR FORK OEM MANUAL / EQUIPMENT MAPPING =====

// Added 2026-08-09 from operator-supplied OEM manuals. Model-to-plant applicability is OPERATOR_OBSERVED

// unless the manual itself is plant/order specific. Manual limits remain OEM source facts and must not be

// silently treated as current live values or site-approved setpoints without matching nameplate/packager data.

const OEM_MANUAL_KNOWLEDGE = {

  airCompressors: {

    plantApplicability: 'Clear Fork plant air compressors are Sullair SN55 units (operator-confirmed).',

    manufacturer: 'Sullair', model: 'SN55', verificationStatus: 'OPERATOR_OBSERVED',

    source: 'Sullair SN55/SN55S/SN55V/SN75/SN75S/SN75V User Manual, PN 02250247-571 R04, publication 03/27/2020',

    manualScope: ['safety and LOTO','functional description','cooling/lubrication','discharge/control/inlet systems','specifications','wiring','installation','controller','maintenance','troubleshooting'],

    keyOEMFacts: [

      'SN55 family is a flood-lubricated, single-stage positive-displacement rotary screw air compressor.',

      'Before repair/adjustment, disconnect and lock out power at source and verify circuits de-energized; vent internal pressure before opening lines/fittings/components.',

      'The manual includes a formal energy-control/LOTO sequence and requires verification of isolation before work.'

    ]

  },

  pwhPumps: {

    plantApplicability: 'PumpWorks PWH manual applies to P-1619, P-1620, and the Clear Fork hot-oil circulation pumps P-7410/P-7420 (operator-confirmed applicability).',

    equipmentIds: ['P-1619','P-1620','P-7410','P-7420'], verificationStatus: 'OPERATOR_OBSERVED',

    manufacturer: 'PumpWorks 610', model: 'PWH / API 610 OH2 single-stage overhung centrifugal pump',

    source: 'PumpWorks 610 PWH Installation Operation and Maintenance Manual, STDS-PWH-IOM-TM-2.0',

    keyOEMFacts: [

      'PWH is a bearing-bracketed horizontal single-stage centrifugal pump manufactured in accordance with API 610.',

      'Back pull-out design generally permits rotating assembly removal without disturbing driver or suction/discharge piping.',

      'Never throttle the pump with the suction valve.',

      'For oil-sump lubricated pumps, the manual specifies ISO/ASTM VG 32 oil and a constant-level oiler arrangement.',

      'Manual covers installation/handling, foundation/grouting, piping, preparation, startup, operation checks, troubleshooting, maintenance, torque values, spare parts, and piping diagrams.'

    ]

  },

  overheadCompressorManual: {

    plantApplicability: 'Clear Fork overhead compressor C-5700 is an Ariel JGQ/2 frame (operator-confirmed model mapping).',

    equipmentIds: ['C-5700'], manufacturer: 'Ariel Corporation', model: 'JGQ/2', verificationStatus: 'OPERATOR_OBSERVED',

    source: 'Ariel JGM/JGN/JGP/JGQ Maintenance & Repair Manual, dated 04/20/2026',

    keyOEMFacts: [

      'Manual covers JGM/JGN/JGP/JGQ heavy-duty balanced-opposed reciprocating compressors.',

      'Maintenance safety requires driver/compressor prevented from turning, system isolated and vented, and cylinders confirmed free of residual pressure before maintenance.',

      'Manual includes instrumentation, maintenance intervals, frame oil system, force-feed cylinder/packing lubrication, part replacement, startup, troubleshooting, torques, clearances, and frame specifications.',

      'OEM required-instrumentation table includes frame-oil start/run permissives and shutdown guidance; use only after confirming applicability to this exact packaged unit.'

    ]

  },

  refrigerationCompressors: {

    plantApplicability: 'Clear Fork refrigeration compressors C-1140/C-1141/C-1142 are Frick RWF II units (operator-confirmed family mapping).',

    equipmentIds: ['C-1140','C-1141','C-1142'], manufacturer: 'Frick by Johnson Controls', model: 'RWF II', verificationStatus: 'OPERATOR_OBSERVED',

    source: 'Frick RWF II Rotary Screw Compressor Units Service Parts List, Form 070.610-SPL (JUL 2013), models 100-1080',

    keyOEMFacts: [

      'Source is a service-parts manual for standard RWF II rotary screw compressor units, models 100 through 1080.',

      'Manual indexes general arrangement, screw compressor, motor supports, oil separator, oil filters, oil cooler piping, liquid injection, suction/discharge stop valves, discharge check valves, economizer, oil pump, couplings, typical P&I, and compressor port locations.',

      'Exact RWF II size/model and unit serial number for each C-1140/C-1141/C-1142 remain PENDING_VERIFICATION unless confirmed by nameplate or packager documentation.'

    ]

  },

  residueAndInletCompressors: {

    plantApplicability: 'Clear Fork residue and inlet reciprocating compressors use Ariel KBZ/6 frames (operator-confirmed family/model mapping).',

    equipmentIds: ['C-6100','C-6200','C-6300','INLET_COMPRESSOR_TAG_PENDING'], manufacturer: 'Ariel Corporation', model: 'KBZ/6', verificationStatus: 'OPERATOR_OBSERVED',

    source: 'Ariel KBU/KBZ Maintenance & Repair Manual, dated 04/20/2026',

    keyOEMFacts: [

      'Manual covers KBU/KBZ heavy-duty balanced-opposed reciprocating compressors and explicitly includes six-throw frame arrangements.',

      'Maintenance safety requires the driver/compressor prevented from turning, isolation and venting, and confirmation of no remaining cylinder pressure before maintenance.',

      'Manual covers instrumentation, main/thrust bearing temperature protection, maintenance intervals, frame oil, pre-lube, force-feed cylinder/packing lubrication, part replacement, startup, troubleshooting, torques, clearances, and frame specifications.',

      'For six-throw frames the manual calls for at least two vibration shutdown devices; exact packaged-unit implementation must be verified against Clear Fork controls/packager documents.',

      'The exact Clear Fork inlet-compressor equipment tag is not asserted here because it was not supplied in this update.'

    ]

  },

  expanderBooster: {

    plantApplicability: 'This is plant/order-specific documentation for the Clear Fork expander/booster compressor package.',

    equipmentIds: ['EX-1121','C-1121','EX/C-1121'], manufacturer: 'Atlas Copco Gas and Process / Mafi-Trench',

    model: 'Expander Compressor (Oil Bearing), Frame 3.0', verificationStatus: 'VERIFIED',

    source: 'Atlas Copco Mafi-Trench Instruction Manual, Order 1039, Machine EX/C-121, built 2018, customer order 5972241, Ref. US-107468',

    keyOEMFacts: [

      'Manual is specifically for an Expander Compressor (Oil Bearing), Frame 3.0, Order No. 1039, Machine No. EX/C-121, built in 2018 for Exterran Energy Solutions, L.P.',

      'Manual contains safety, transport/storage, erection, operating instructions, troubleshooting, plant description, technical data, maintenance, drawings, and recommended spare parts.',

      'Plant-description chapters cover inlet guide vanes, bearings, wheels, shaft, automatic thrust equalizer, seal-gas system, lubrication system, instrumentation/control, and machine characteristics.',

      'Operating chapters cover pre-startup, seal-gas startup, lube-oil startup, startup sequence, troubleshooting, data collection, and shutdown.',

      'Recommended spares identify expander and compressor bearings, wheels, shaft seals, vibration pickups, tachometer pickup, lube-oil and seal-gas filter elements, relief/safety valves, PLC modules, and vibration transmitters.'

    ]

  },

  usageRules: [

    'Use these model mappings to choose the correct OEM manual when the operator asks about maintenance, troubleshooting, parts, lubrication, startup/shutdown, or LOTO.',

    'Do not substitute a generic family value for a site-specific setpoint, serial-number-specific part, valve lineup, or live operating condition.',

    'When a manual gives family-wide guidance but the exact package configuration is unknown, label the answer OEM_GUIDANCE and state what nameplate/packager/P&ID item must be checked.',

    'For LOTO, OEM manuals supplement but never replace plant P&IDs, energy-isolation procedures, authorized field verification, and current equipment state.'

  ]

};

 

// ===== RYAN CORE V2 =====

 

const https = require('https');

const crypto = require('crypto');

 

const ANTHROPIC_VERSION_V2 = process.env.ANTHROPIC_VERSION || '2023-06-01';

const RYAN_BUILD_ID = 'RYAN-2026-08-12K';

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

 

 

// ===== PETROSKILLS PROCESS / TROUBLESHOOTING BRAIN KNOWLEDGE =====

// Expanded 2026-08-09 from operator-supplied PetroSkills pages. These are training/reference principles,

// not plant-specific setpoints. Ryan must combine them with Clear Fork P&IDs, OEM manuals, procedures,

// live simulator context, and operator-confirmed plant knowledge. If a generic PetroSkills rule conflicts

// with a plant/OEM requirement, the plant/OEM source wins and the conflict must be called out.

const PETROSKILLS_KNOWLEDGE = {

  provenance: {

    verificationStatus: 'VERIFIED_REFERENCE',

    sourceFamily: 'PetroSkills gas processing/operator training pages supplied by operator',

    currentSources: [

      '2026-07-29 16-55.pdf — Centrifugal Pumps pp. 11-26 through 11-37',

      '2026-07-29 17-05.pdf — Reciprocating Compressors pp. 13-26 through 13-40',

      '2026-07-29 17-08.pdf — Reciprocating Compressors pp. 13-41 through 13-50',

      '2026-07-29 17-10.pdf — Process Drawings, Section 20',

      '2026-07-29 17-13.pdf — Phase Behavior Fundamentals, Section 4',

      '2026-07-29 17-16.pdf — Mass Transfer Operations, Section 14 plus NGL Stabilization/Fractionation TOC',

      '2026-07-29 17-28.pdf — NGL Stabilization & Fractionation: condensers, reflux, internal reflux, feed effects, tower DP, startup/shutdown and troubleshooting',

      '2026-07-29 17-33.pdf — Water-Hydrocarbon Behavior: water content/dewpoint, hydrates, inhibition, low-temperature processing and TEG charts',

      '2026-07-29 17-36.pdf — Solid Bed Adsorbers: adsorbent types, molecular sieves, vessel/configuration and cyclic regeneration',

      '2026-07-29 17-38.pdf — Solid Bed Adsorbers continued: adsorption principles, MTZ/breakthrough, regeneration, cycle control and troubleshooting',

      '2026-07-01 11-42.pdf — Clear Fork residue compression flow diagram',

      '2026-07-01 11-12.pdf — Clear Fork dehydration/regeneration flow diagram',

      '2026-07-01 12-11.pdf — Operator-drawn Clear Fork cryogenic/reflux flow-path sketch',

      '2026-07-01 11-33.pdf — Clear Fork inlet separation/stabilizer flow diagram'

    ],

    priorInstalledPetroSkills: [

      'Mechanical Refrigeration Principles',

      'Cryogenic startup/shutdown/troubleshooting (Chapter 22)',

      'Centrifugal pump basics/head/curves/control/troubleshooting',

      'Previously indexed PetroSkills process knowledge in the Ryan Reference Library'

    ],

    rule: 'Preserve prior PetroSkills knowledge. New pages extend it; they do not replace it.'

  },

  brainPolicy: {

    purpose: 'Use PetroSkills as Ryan process-physics and troubleshooting framework, while plant-specific sources govern actual Clear Fork lineups, tags, setpoints, trips, and approved procedures.',

    sourcePriority: ['LIVE simulator context for current state','Verified Clear Fork P&IDs/procedures','Applicable OEM manuals/nameplate/packager data','PetroSkills process fundamentals','Operator-observed history','Engineering inference'],

    processQuestionMethod: [

      'Identify the equipment/process boundary and intended function.',

      'Trace material and energy flow upstream to downstream.',

      'Identify the controlling thermodynamic or transport mechanism: pressure, temperature, phase equilibrium, heat transfer, mass transfer, hydraulic head, compression, or control-loop action.',

      'Use phase behavior to ask whether a pressure/temperature/composition change can create or remove liquid, vapor, cavitation, condensation, flashing, or two-phase flow.',

      'Use BFD/PFD/P&ID hierarchy correctly: BFD explains function/relationships, PFD adds equipment/material balance/major controls, P&ID is required for detailed piping, valves, instruments, interlocks and exact field lineups.',

      'Separate generic theory from Clear Fork-specific facts and name the source of each.'

    ],

    troubleshootingMethod: [

      'Start with the symptom and define what changed: pressure, temperature, level, flow, composition, vibration, current/load, valve position, or alarm/trip.',

      'Compare suction/upstream conditions, equipment differential, and discharge/downstream conditions before blaming the equipment.',

      'Rank likely causes by physical mechanism, not by parts swapping.',

      'For each cause, name the observation/tag/trend that would confirm or reject it.',

      'Check process causes and control-loop causes before mechanical teardown when evidence does not yet isolate a mechanical fault.',

      'Look for coupled effects: a control valve can change pump head/flow; compressor loading can alter rod reversal and temperatures; pressure/temperature can cross a phase boundary; reflux/reboiler duty changes separation.',

      'Recommend safe diagnostic checks before corrective action when uncertainty remains; never invent an isolation or bypass.'

    ]

  },

  centrifugalPumps: {

    fundamentals: [

      'Startup framework: verify bearing lubrication; establish suction; manage discharge condition per system design/check-valve arrangement; vent casing until a continuous liquid stream proves the casing is liquid-filled; start driver; immediately check unusual noise/vibration; confirm normal discharge pressure.',

      'If discharge pressure is abnormally low at startup, consider vapor lock and re-vent/cool/prime before assuming internal damage.',

      'A sun-heated or otherwise hot pump can flash incoming liquid and vapor lock until the casing is cooled/vented.',

      'Discharge throttling changes pump operating point by changing required head; it wastes driver energy and can force operation far from design flow.',

      'Low-flow operation can convert lost driver energy into liquid heat, causing vapor formation, vapor lock, and possible rubbing/damage. Low-flow recycle protects minimum flow; the training example uses roughly 15–20% of design flow as an illustrative control range, not a universal Clear Fork setpoint.',

      'Variable speed changes capacity, head and power; use actual pump curves/OEM data for Clear Fork decisions.'

    ],

    diagnosticPatterns: [

      'Vapor lock signature: discharge pressure approximately suction pressure / little developed differential. Check source vessel level, low pump flow, suction valve restriction, suction obstruction/strainer, and excessive casing heat.',

      'Low flow: calculate/compare discharge minus suction pressure. High differential suggests discharge restriction/high backpressure; low suction pressure suggests source-level or suction-side restriction; low discharge with wear can indicate worn impeller/casing; vapor lock remains a competing cause.',

      'Routine performance check: compare suction pressure, discharge pressure, differential/head and flow against the applicable performance curve and historical baseline; trend decline before failure.'

    ],

    positiveDisplacementPumps: [

      'Reciprocating pumps are positive-displacement devices; speed and bypassing are effective capacity controls and a startup/capacity bypass is required by the generic training configuration.',

      'Suction piping should preserve NPSH and avoid excessive velocity/restriction; pulsation dampening can reduce velocity surge.',

      'Rotary PD pump families include external/internal gear, sliding vane, single/three-screw and progressive cavity; suitability depends on service, viscosity, differential pressure and entrained vapor.'

    ]

  },

  reciprocatingCompressors: {

    componentsAndFailureLogic: [

      'Key cylinder-side parts include piston/rings, rod, cylinder/liner, suction and discharge check valves, rod packing, clearance pockets and valve lifters/unloaders.',

      'Valve problems are common: broken/worn/debris-fouled valves can reduce capacity, alter cylinder temperatures, loading, and rod reversal.',

      'Rod packing friction creates heat; lubrication and, where designed, cooling protect packing life.',

      'Clearance pockets lower capacity by increasing clearance volume; valve lifters unload suction valves so selected cylinder ends do not compress gas.',

      'Frame and cylinder lubrication are distinct systems. Cylinder/packing lubrication must maintain an oil film; frame oil protects bearings/crossheads and removes heat/contamination.'

    ],

    lubricationReasoning: [

      'Under-lubrication can rapidly damage piston rings/packing; excessive lubrication wastes oil and can contaminate gas. Use OEM rate as the starting authority and trend actual oil use/condition.',

      'Divider blocks split lubricator flow to multiple points and can support common flow/pressure monitoring; unequal downstream resistance is a diagnostic concern if a system is not properly divided.',

      'Frame-oil troubleshooting should examine level, pressure, temperature, filter differential, cooler performance and oil condition/contamination together.'

    ],

    pulsationAndRodReversal: [

      'Reciprocating discharge is inherently pulsating. Pulsation can transmit vibration into bottles, piping, foundations and equipment, causing fatigue/wear. Bottles/snubber systems damp but do not eliminate pulsation.',

      'Operational pulsation severity can change with compressor speed, unloading configuration, recycle and gas composition/flow.',

      'Healthy crosshead-pin lubrication depends on rod-load reversal so the oil wedge shifts around the bearing. Insufficient reversal can destroy the bearing even without an outright rod overload.',

      'Improper unloading or failed suction/discharge valves can alter gas forces and reduce rod reversal. Follow the applicable OEM loading/unloading sequence because generic training order may not match every machine design.',

      'When changing compressor loading, watch cylinder/discharge temperatures, suction/discharge pressures, vibration and the OEM rod-load/reversal limits rather than treating capacity changes as isolated.'

    ],

    drivers: [

      'Electric motors have high starting current and reciprocating compressors should be unloaded for startup per the applicable package procedure; repeated failed starts can overheat/lock out motors.',

      'Driver power must cover compression plus mechanical/auxiliary/parasitic loads; changing process load can therefore show up in motor current/driver loading.'

    ]

  },

  processDrawings: {

    hierarchy: [

      'BFD: big-picture process function and relationships with minimal detail.',

      'PFD: equipment, principal flows, major controls and often design/material-balance conditions; useful for understanding how the process works.',

      'P&ID: highest process-drawing detail; primary and secondary piping, valves, instruments, control signals, bypasses, drains/vents, line specs and interlocks as actually documented.'

    ],

    readingRules: [

      'Do not infer valve action, controller action, instrument location, actuator type, line connection or field accessibility from a generic PFD symbol when the drawing does not specify it.',

      'Piping specification breaks can reflect pressure/temperature/material changes; pressure letdown can create low temperatures through JT cooling, so downstream material class matters.',

      'Off-page connectors and drawing references must be followed before declaring a path complete.',

      'P&ID equipment outlines can be schematic and not physically located to scale; use equipment drawings/3D/location data for physical arrangement.'

    ]

  },

  phaseBehavior: {

    core: [

      'For a pure substance, liquid-vapor equilibrium is a line on P-T space; for a multicomponent hydrocarbon mixture it becomes a phase envelope with a two-phase region.',

      'Bubble point is where a saturated liquid first forms vapor on heating at a given pressure; dew point is where a saturated vapor first forms liquid on cooling.',

      'A liquid below its bubble point is subcooled; a vapor above its dew point is superheated.',

      'Mixture phase envelopes depend strongly on composition; after separation, use the composition of the stream actually entering the equipment/line rather than the original feed composition.',

      'Cricondenbar is the maximum pressure at which liquid and vapor can coexist; cricondentherm is the maximum temperature at which they can coexist.',

      'Retrograde condensation can occur in certain multicomponent systems; lowering pressure can create liquid in a region where simplistic intuition predicts only vapor.'

    ],

    applications: [

      'Pump cavitation/flash risk occurs if suction pressure falls to/below saturation for the actual liquid temperature/composition; evaluate source pressure/head, suction losses and fluid state together.',

      'High-pressure pipeline liquid can form if the operating path crosses the hydrocarbon dewpoint curve; composition changes shift that curve.',

      'A flash separator creates vapor and liquid at the same flash P/T but with different compositions, and therefore different resulting phase envelopes.',

      'Fractionation is a sequence of equilibrium contacts; overhead and bottoms products have distinct phase envelopes after separation.'

    ]

  },

  massTransferAndFractionation: {

    massTransfer: [

      'Absorption moves selected solute from vapor into liquid solvent; stripping moves solute from liquid into vapor. Concentration relative to equilibrium is the driving force.',

      'Gas-liquid contact area and mixing govern rate: trays bubble vapor through liquid; spray towers disperse droplets; packing spreads liquid as films over high-area surfaces.',

      'Actual trays do not reach perfect equilibrium; tray efficiency describes the gap. Packed towers use HETP as an analogous performance measure.',

      'Absorber outlet quality depends on solvent rate, gas rate, lean-solvent concentration, number of contacts, temperature and pressure. The lean-solvent concentration sets the theoretical minimum outlet solute concentration.',

      'Stripping is favored by higher temperature, lower pressure, higher stripping-gas rate and sufficient contacting, subject to solvent stability and equipment limits.'

    ],

    fractionation: [

      'Fractionation separates by volatility. Relative volatility controls how difficult a split is; close-boiling components require more equilibrium stages/reflux than widely separated components.',

      'Reboiler duty creates stripping vapor at the bottom; condenser/reflux removes heat and returns liquid at the top. Reflux improves overhead separation; reboiler temperature/duty strongly influences bottoms composition.',

      'Higher reflux can reduce required stages but increases reboiler/condenser duty; troubleshooting must treat reflux, condenser duty, reboiler duty, pressure and feed as a coupled heat-and-material balance.',

      'In a refluxed fractionator, overhead composition is commonly influenced by reflux and bottoms composition by reboiler duty/temperature, but actual Clear Fork control strategy and constraints must come from plant drawings/procedures.',

      'For a stabilizer, allowing light ends into bottoms raises product vapor pressure and can displace desired heavier liquid product; without reflux there is limited direct control of heavy components in overhead.'

    ],

    troubleshootingChecks: [

      'Poor separation: verify tower pressure first because pressure shifts boiling/equilibrium conditions; then check feed rate/composition/temperature, reflux flow and temperature, condenser duty, reboiler duty/temperature, tray/packing hydraulic symptoms, and product specifications.',

      'Flooding/overload suspicion: look for rising tower differential pressure, level instability, degraded separation and excessive vapor/liquid rates; confirm against plant-specific DP/level instrumentation and limits.',

      'Weeping/poor contact suspicion at low vapor rate: reduced tray activity can cut mass-transfer efficiency even if temperatures appear plausible.',

      'Absorber/contactor off-spec: distinguish inadequate lean-solvent quality from inadequate circulation/contacting; increasing circulation cannot beat the equilibrium floor imposed by contaminated/weak lean solvent.'

    ]

  },

  advancedFractionation: {

    reasoning: [

      'Partial condensers operate in the two-phase region and produce equilibrium vapor and liquid; total condensers fully condense overhead vapor. Distinguish condenser type before reasoning about reflux/product behavior.',

      'Reflux ratio is reflux flow divided by distillate flow. Treat it as an operating/separation indicator, not a universal target; difficult splits may require substantially more reflux.',

      'Internal reflux changes with bottom temperature, external reflux, feed rate, feed temperature, ambient heat loss and feed composition. A tower can change product quality even when the obvious controller setpoints have not moved.',

      'Tower temperature profile is a primary diagnostic. Reduced/flat gradients can indicate flooding, dry trays or an intermediate-boiling contaminant such as trapped water; combine profile shape with tower DP to distinguish causes.',

      'Tower differential pressure is a direct indicator of vapor/liquid traffic. High DP supports flooding/high load; abnormally low sectional DP supports dry trays or loss of liquid head.',

      'Condenser trouble tends to raise overhead pressure and top temperature, reduce accumulator liquid and make overhead product heavier. Reboiler trouble tends to lower bottom temperature/pressure, raise bottoms level, make bottoms lighter and reduce distillate.',

      'Startup/shutdown theory from PetroSkills is generic guidance only. Clear Fork approved procedures and current lineup govern actual execution.'

    ]

  },

  waterHydrocarbonAndHydrates: {

    reasoning: [

      'Hydrocarbon liquids and natural gas can carry dissolved/vapor water; cooling can cause water dropout. Gas water capacity depends strongly on temperature and pressure, so dewpoint and actual operating pressure must be considered together.',

      'Hydrates require free water plus hydrate-forming gas components at favorable pressure/temperature. Prevent by dehydration, keeping temperature above hydrate conditions, or approved inhibitor use.',

      'A rising DP across cold exchangers, valves or piping can support hydrate formation, but do not assume hydrate without checking water/dewpoint, temperature, pressure and competing restrictions.',

      'If a hydrate plug has fully stopped flow, differential pressure across the plug is a major hazard; Ryan must not suggest abrupt depressuring or any action that can launch the plug. Escalate to site procedure and authorized operators.',

      'In low-temperature glycol inhibition, concentration matters as much as rate because glycol-water mixtures can themselves freeze; use plant/OEM design data rather than generic chart values for Clear Fork setpoints.',

      'TEG dehydration performance depends on lean TEG concentration, circulation rate and effective contact stages; higher circulation has diminishing returns and cannot compensate indefinitely for weak lean glycol.'

    ]

  },

  solidBedAdsorbers: {

    reasoning: [

      'Adsorption is surface retention on a solid; absorption is dissolution into a liquid. Molecular sieves are highly selective and are commonly used when very low water dewpoint is required.',

      'Distinguish adsorber capacity from efficiency: early breakthrough after initially on-spec gas points toward low capacity; never reaching spec points toward efficiency, bypass, regeneration or distribution problems.',

      'Track the mass-transfer zone (MTZ). Breakthrough begins as the MTZ reaches the outlet end of the bed; outlet moisture/dewpoint trend is therefore a direct bed-health indicator.',

      'Regeneration depends on temperature, dry regeneration-gas quality, flow, time and proper counter-current routing. Incomplete heating, insufficient flow, early switching, valve leakage or recondensation can leave water in the bed and shorten the next adsorption cycle.',

      'Bed DP is a critical diagnostic. Rising DP can indicate fouling, liquid slugging, dusting/broken adsorbent, poor distribution or support plugging; a sudden DP decrease can indicate media/support loss or bypass.',

      'Liquid carryover into a gas adsorber can coat media, lengthen the MTZ and cause premature breakthrough. Upstream coalescing/separation performance must be checked before blaming the sieve.',

      'Bed switching should minimize flow/pressure disruption. Rapid pressure changes, bed lifting and valve slamming can damage adsorbent/supports. Never infer a switching sequence when the Clear Fork P&ID/procedure is available.',

      'For aging beds, distinguish gradual capacity decline from sudden deterioration caused by contamination, liquid slugging, regeneration failure or valve leakage.'

    ]

  },

  clearForkOperatorFlowKnowledge: {

    verificationStatus: 'OPERATOR_OBSERVED_PENDING_P_AND_ID_CROSSCHECK',

    notes: [

      '6800 is the residue filter.',

      'Inlet ESD is 1000D; inlet control PV is 1010A.',

      'V-1020, V-1025 and V-1030 are the slug catcher vessels.',

      'Three operator-identified flow meters are located after the vortex separator, at the residue outlet, and after the inlet separator.',

      'PV-6810A is the inlet-compression recycle pressure-control valve and XV-6810A is its ESD valve; operator description says this recycle pulls residue gas from the outlet of the residue filter to the inlet side of inlet compression.',

      'PV-6050A is the residue-recycle pressure-control valve and XV-6060 is the ESD in that system; operator description says the system pulls gas from the discharge/outlet side of the residue filter.',

      'A-1322 is the NGL aftercooler. 1343 identifies the refrigeration condensers.',

      'F-1412 is the inlet filter coalescer. V-1413, V-1414 and V-1415 are the dehydration beds. F-1416/F-1417 are the dehydration dust filters.',

      'Operator flow-path note: regeneration starts at the outlet of the dehydration dust filters, FCV-111 is the regen-system flow-control valve, and the regen system returns/ends before the inlet filter coalescer.',

      'PCV-1121E is the tower blowdown pressure-control valve.',

      'Operator-confirmed filter rules: F-1050/F-1055 slug-catcher liquid filters are a duty/standby pair; one is always in service. Swap/change the dirty housing at 8 PSID. At 12 PSID the dirty in-service housing stops liquid flow until it is swapped out or changed; production can continue by placing the clean standby housing in service.',

      'Operator-confirmed filter rules: F-1438 RSV filter/coalescer alarms/change at 10 PSID and shuts down the RSV filter/recycle path at 15 PSID. F-7600 hot-oil filter alarms/change at 8 PSID.',

      'Control-board correction from operator-supplied HMI: slug-catcher liquid from V-1020/V-1025/V-1030 routes through F-1050/F-1055 before E-5000. PDIT-1051 is the differential-pressure indication for the duty filter pair.',

      'Operator-confirmed reboiler control-board topology: a T-1521 demethanizer gas circuit passes through E-1223 bottom reboiler, then through the process/shell side of E-1225 trim reboiler, then returns to T-1521. A separate cold-section path combines V-1421 cold-separator and T-1521 side flow at the bottom of E-1224 side reboiler and returns from the upper side-reboiler outlet to T-1521. Use the actual Clear Fork P&IDs/HMI for exact nozzle and transmitter placement.',

      'Operator-confirmed expander HMI corrections: FROM E-1221 and FROM V-1421 arrows point INTO the expander/JT system; TO E-1222 reflux condenser points OUT toward E-1222. The PCV-1121A J-T branch is a connected bypass path, not a dead-end graphic.',

      'Operator-confirmed residue recycle: PIC-6050B is the residue suction-pressure controller, SP 280 psig. PV-6050A is its recycle control valve. If suction PV falls below SP, PV-6050A opens progressively to recycle gas and keep C-6100/C-6200/C-6300 running. XV-6060 is the residue recycle ESD/block valve downstream of PV-6050A. The three residue compressors share a common suction header and a common discharge header.',

      'Operator-observed recurring utility service: TK/V-8100 closed-drain tank is normally trucked out around 50-60% level and drained to roughly 15-22%, approximately weekly but always verify current level/trend. Ariel compressor lube-oil makeup storage is normally refilled by truck when around 20-30%, typically to roughly 70-80%; usage is approximately weekly and condition-dependent.',

      'Control-board correction from operator-supplied HMI: the reboiler process-gas path is continuous from TCV-1223 through the top E-1223 section, then through the lower E-1224 section, past TE-1224C, and onward to E-1241/cold-separator processing. A recent operator-provided screen showed TE-1224C around 2.2 DEGF; treat that as an observed operating value, not a design setpoint.',

      'Treat these tag/function notes as operator-observed until cross-checked against the applicable Clear Fork P&ID; do not silently overwrite a verified drawing conflict.'

    ]

  }

};

 

 

 

// ===== CLEAR FORK P&ID / FLOW-PATH KNOWLEDGE =====

// Expanded 2026-08-09 from operator-supplied Clear Fork source drawings and flow-path diagrams.

// Drawing-derived topology outranks generic process theory. Use the source drawing for exact valve/instrument

// details; never invent a tag, PSV set pressure, line size/spec, fail position, or isolation point that is unreadable.

const CLEAR_FORK_PID_KNOWLEDGE = {

  provenance: {

    verificationStatus: 'VERIFIED_SOURCE_DRAWING',

    sourceFamily: 'Clear Fork Cryogenic Unit #1 P&IDs / process flow drawings supplied by operator',

    policy: [

      'Use these records as plant-specific process topology and equipment identity.',

      'For exact LOTO boundaries, re-check every applicable source drawing and all off-page continuations; a knowledge summary never substitutes for the drawing.',

      'If a drawing image is unclear, retain the item as PENDING_VERIFICATION instead of guessing.',

      'PetroSkills explains process physics; these Clear Fork drawings govern actual plant equipment, piping relationships and documented controls.'

    ]

  },

  coverageTracker: {

    updated: '2026-08-09',

    receivedIndexed: [

      'M1110 overall cryogenic flow path',

      'M2040 V-1040 vortex separator',

      'M2050 F-1050/F-1055 pipeline inlet filters',

      'M2105 dehydration', 'M2110 dehydration',

      'M2135 cold section', 'M2145 cold section', 'M2150 cold section', 'M2155 cold section',

      'M2160 NGL booster pumps', 'M2165 demeth/expander valve skid / E-1223/E-1224', 'M2175 NGL pipeline pumps',

      'M2200 refrigeration gas chiller/reclaimer', 'M2205 refrigeration vessels', 'M2210 refrigeration condensers',

      'M2240 V-1460 fuel-gas scrubber / demeth-expander valve skid fuel gas',

      'M2500 E-5000 inlet preheater', 'M2505 V-5010 inlet stabilizer flash tank',

      'M2510 F-5015/F-5016 inlet stabilizer filters', 'M2514 E-5020 stabilizer feed/bottoms exchanger',

      'M2515 T-5030 stabilizer tower / E-5040 stabilizer reboiler',

      'M2520 stabilizer bottoms product system / P-5060/P-5065 / AC-5055',

      'M2570 C-5700 overhead compressor #1 package / P-5700 catch tank pump',

      'M2571A C-5700 overhead compressor package detail', 'M2571B C-5700 overhead compressor utility/lube package detail',

      'M2610 C-6100 residue compressor package', 'M2615 AC-6101 intercooler bays / residue compressor continuation'

    ],

    priorIndexed: ['M2000','M1100','M1400','M1600'],

    stillNeededHighPriority: [

      'M2020','M2025','M2030',

      'M2130','M2140',

      'M2225',

      'M2260',

      'M2560',

      'M2600',

      'M2900','M2901',

      'M2922','M2960'

    ],

    secondaryBacklog: ['M1000','M1130','M1500','M1570','M1700','M2910'],

    note: 'This is Ryan\'s working coverage register, not a claim to be the facility master drawing list. Add newly discovered border continuations as they are found.'

  },

  inletAndSeparation: {

    equipment: ['V-1020','V-1025','V-1030','V-1040','F-1050','F-1055'],

    sources: ['M2040','M2050'],

    facts: [

      'V-1040 is the Clear Fork vortex separator. Use M2040 for its actual vessel instrumentation, inlet/outlet piping, level/pressure connections, relief/vent/drain and isolation relationships.',

      'F-1050 and F-1055 are parallel pipeline inlet filters shown on M2050 with common process-header relationships and individual instrumentation/isolation.',

      'Operator-observed slug catcher vessels V-1020/V-1025/V-1030 remain tied to the inlet path; exact train/isolation detail still requires M2020/M2025/M2030.'

    ]

  },

  cryogenicColdSection: {

    equipment: ['V-1460','E-1221','E-1222','E-1241','V-1421','EX-1121','C-1121','E-1223','E-1224','T-1521','E-1125','V-1422','P-1619','P-1620','P-1630','P-1635','A-1322'],

    sources: ['M1110','M2135','M2145','M2150','M2155','M2160','M2165','M2175','M2240'],

    flowPath: [

      'M1110 is the high-level Clear Fork cryogenic process-routing reference. It links V-1460 fuel-gas scrubber area, E-1221/E-1222 gas-gas/reflux exchange, E-1241 gas chiller, V-1421 cold separator, EX/C-1121 expander/compressor, T-1521 demethanizer, E-1223/E-1224 demethanizer side/bottom reboiler exchangers, E-1125 demethanizer trim reboiler, V-1422 surge tank, P-1619/P-1620 product booster pumps, P-1630/P-1635 pipeline pumps and A-1322 product cooler.',

      'Use M1110 for process orientation, then use the individual P&IDs for valve/instrument/isolation detail.',

      'M2165 provides detailed E-1223/E-1224 and demeth/expander valve-skid connections and off-page continuations around T-1521/EX-1121.',

      'M2240 provides the detailed V-1460 fuel-gas scrubber / skid piping and instrumentation.'

    ],

    safety: 'Cold-section LOTO/troubleshooting must account for cryogenic temperature, trapped pressure/liquid, thermal expansion, expander/compressor stored rotational energy, and all off-page continuations. Missing M2130/M2140 must be called out when they bound the requested work.'

  },

  stabilizerSystem: {

    sources: ['M2500','M2505','M2510','M2514','M2515','M2520','M2570','M2571A','M2571B'],

    processSequence: ['E-5000 inlet preheater','V-5010 inlet stabilizer flash tank','F-5015/F-5016 inlet stabilizer filters','E-5020 stabilizer feed/bottoms exchanger','T-5030 stabilizer tower','E-5040 stabilizer reboiler','P-5060/P-5065 stabilizer booster pumps','AC-5055 condensate product cooler'],

    facts: [

      'M2500 anchors the E-5000 inlet-preheat exchanger piping and its process continuations.',

      'M2505 anchors V-5010 flash-tank instrumentation, level/pressure connections, inlet/outlet paths, relief/vent/drain and isolation detail.',

      'M2510 shows parallel F-5015/F-5016 inlet stabilizer filters and their individual/common isolation and instrumentation.',

      'M2514 anchors E-5020 stabilizer feed/bottoms heat-recovery routing.',

      'M2515 anchors the actual Clear Fork T-5030 stabilizer tower and E-5040 stabilizer reboiler process/control relationships.',

      'M2520 anchors stabilizer bottoms product handling through P-5060/P-5065 and AC-5055 plus associated product controls/isolation.',

      'M2570/M2571A/M2571B provide C-5700 overhead-compressor package, catch-tank pump P-5700, cylinder/package and utility/lube detail. Use these with the Ariel JGQ/2 OEM manual; do not replace plant package piping with generic OEM schematics.'

    ],

    troubleshootingIntegration: [

      'For stabilizer off-spec questions, combine actual Clear Fork flow/control topology with PetroSkills fractionation physics: verify tower pressure, feed rate/composition/temperature, reboiler duty, overhead compression/condensation behavior, tower temperature profile and product routing.',

      'A symptom downstream at P-5060/P-5065 or AC-5055 can originate upstream at V-5010, filter restriction, E-5020 heat transfer, T-5030 separation or E-5040 duty; trace the whole chain before blaming the local equipment.'

    ]

  },

  residueCompression: {

    sources: ['M2610','M2615'],

    equipment: ['C-6100','C-6200','C-6300','AC-6101','AC-6201','AC-6301','F-6800'],

    facts: [

      'M2610/M2615 provide plant-specific residue-compressor package and intercooler-bay relationships. C-6100 is shown with Murphy/package controls and staged process connections; the same family knowledge is used cautiously for C-6200/C-6300 only where matching drawings confirm it.',

      'Residue troubleshooting should correlate compressor stage conditions, intercooler performance, recycle behavior, downstream residue filtering and common header pressure rather than treating a single stage alarm in isolation.',

      'The remaining M2600 continuation is still requested to close the common residue recycle/header boundary.'

    ]

  },

  refrigeration: {

    sources: ['M2200','M2205','M2210'],

    equipment: ['C-1140','C-1141','C-1142','E-1241','V-1441','V-1442','V-1443','V-1444','A-1343A','A-1343B','A-1343C'],

    facts: [

      'Clear Fork refrigeration process P&IDs already anchor the chiller/reclaimer, suction/interstage/accumulator vessels and three condenser banks.',

      'Use the Frick RWF II OEM manual for compressor-family maintenance/parts reasoning, but M2225 is still needed for the exact Clear Fork compressor-package suction/discharge/oil/isolation topology.'

    ]

  },

  lotoAndDrawingRules: [

    'For any LOTO draft, determine the work boundary first, then trace every process/utility/electrical energy path on the applicable P&IDs including off-page continuations.',

    'PSV information must include tag, protected equipment, relief destination, set pressure/rating when shown, associated isolation and source drawing. If any element is unreadable or not supplied, mark it PENDING_VERIFICATION.',

    'A received P&ID increases Ryan knowledge coverage but does not make a draft LOTO approved. Every draft remains NOT APPROVED - FIELD VERIFICATION REQUIRED.',

    'Flow-path diagrams such as M1110 are excellent for topology/orientation but do not replace detailed P&IDs for exact valve lineups or isolation.'

  ]

};

 

 

 

/* ==========================================================================

   FINAL CLEAR FORK P&ID MASTER KNOWLEDGE — 2026-08-09 consolidated release

   Source basis: the complete drawing batches supplied by the operator in this

   project. This layer is intentionally source-conservative: exact tags, line

   numbers, sizes, specs, valve numbers and PSV data may be used only when they

   are legible/source-backed. Anything unreadable remains PENDING_VERIFICATION.

   ========================================================================== */

 

const OPERATOR_PROCESS_KNOWLEDGE_09J = {

  authority: 'Operator-provided Clear Fork plant-specific control-board/flow-path knowledge, supplied 2026-08-09. Use this for plant-specific process questions, simulator troubleshooting and control-board interpretation. Do not silently substitute generic textbook values.',

  inletAndCoalescer: [

    'Inlet compressor discharge -> PT-1410A about 995.9 psig -> XV-1410 -> upper-half horizontal entry to V-1410 inlet separator. Gas exits V-1410 vertically from top -> PT-1410B about 994 psig -> TIT-1400A about 107.1 F -> horizontal middle entry to F-1412 inlet filter/coalescer -> gas exits top to dehy beds.',

    'F-1412 middle liquid section: LT-1412A, LCV-1412A SP 20%, then XV-1412A to drain. Bottom section: LT-1412B, LCV-1412B SP 15%, then XV-1412B. LCVs slowly dump as level rises above SP. At zero level the applicable drain XV closes. Either LT HIHI 75% causes facility ESD.',

    'F-1412 element DP change alarm 15 PSID and facility ESD 20 PSID.'

  ],

  dehy: [

    'Process valves: V-1413 uses XV-1413A top inlet and XV-1413B bottom outlet; V-1414 uses XV-1414A/B; V-1415 uses XV-1415A/B. Two beds always remain on process.',

    'Regen valves: gas enters bottom through XV-1413C/1414C/1415C and exits top through XV-1413D/1414D/1415D on the active bed. That bed process A/B valves close while regen C/D valves open.',

    'Dry-gas regen branch is 4-inch. HEAT route uses XV-1711A through H-1711; COOL route uses XV-1711B heater bypass. Operator supplied sequence timing as 3:45 heat and 11:45 cool; preserve this wording/timebase if asked rather than converting without confirmation.',

    'Downstream of beds: TE-1417 about 108.60 F -> duty F-1416/F-1417 dust filter (one in service; current example PDT-1416A 5.8 PSID) -> TE-1416 about 107.6 F (HIHI 150 F facility ESD) -> PT-1416 about 967.09 psig (HI 990) -> ME-1416 about -149.33 (HI -100, HIHI shutdown -10). Dust filters swap/change at 15 PSID and facility ESD at 20 PSID.',

    'After active bed regen outlet common header: TE-1413D about 109.4 F during cool-bed example, then PT-1412C about 959.6 psig, then regen gas cooler/system.'

  ],

  cryoSplit: [

    'Dry gas uses a 60/40 split. Majority gas/gas side: through TCV-1221D into the top of E-1221 gas/gas exchanger, exits side horizontally, then TE-1221B about 4.7 F, PDT-1221 about 17.11 PSID, then to chiller. TE-1221D LOW 40 F, LOLO shutdown -15 F; PDT-1221 HI 20 PSID.',

    'Minor bottom/side side: TCV-1223 -> reboilers. TIC-1224B AUTO SP 60 F, PV about 60.2, CV about 13.05%; TDIC-1224B SP 20 F, PV about 37.8, CV 100%. TCV-1221D and TCV-1223 cross-limit: opening either beyond 50% progressively pinches the other, potentially to ~5%.',

    'Bottom/side exchanger inlet: TE-1223A about 98.9 F; PDT-1223A about 4.7 PSID, HI 15, HIHI facility ESD 20; outlet TE-1224C about 2.5 F; then joins gas/gas outlet at common chiller inlet header.'

  ],

  refrigerationColdSepExpander: [

    'Combined header -> TE-1241A about 2.3 F (LOLO -50) -> E-1241 chiller tube side. TE-1241C/TIC-1241C SP -7 F, PV about -7.4, CV 33.79%. PIC-1441C SP 17 psig, PV 16.56, CV 32.39%; PIC-1441A SP 30 psig, PV 16.65, CV 100%. PT-1441C LO 1 psig, HI 30, HIHI 240 and this shutdown is refrigeration-system-only.',

    'V-1421 cold separator: side horizontal gas inlet from chiller; gas leaves top vertically; liquid leaves bottom horizontally. PT-1421 about 893.35 psig HI 1035; TE-1421 about -9.9 F LO -45 HI 12; TE-1421A about -7.4 F LOLO facility ESD -50. LIC-1421 SP/PV 35%, CV about 43%; rising level increases liquid GPM. HIHI level facility ESD; LOLO closes liquid outlet valve only. TCV-1421 cold-spin valve normally stays closed, TIC-1421 SP -30 F, PV about -9.2, CV 0.',

    'Cold-sep vapor splits to JT, reflux condenser, and expander. JT PCV-1121A normally 0, may be 1-7% at maximum loading; if expander is lost JT automatically opens roughly 80-95%. PIC-1521D JT SP 265, PV about 264.8. Expander path XV-1121B -> PDT-1121B ~3.5 PSID (HI 5, HIHI 15 expander-only SD) -> PT-1121B ~889.49 -> EX-1121 (~24180 rpm / IGV 100%) -> TE-1121D ~-86.8 -> PT-1121D ~277.05 -> common outlet. PIC-1521D EX SP 268, PV ~266.07, CV 100%.'

  ],

  demeth: [

    'T-1521 top-to-bottom process order: overhead methane-rich outlet to reflux; RSV return; GSP/reflux return; expander/JT feed; cold-separator liquid; side-reboiler return then side-reboiler draw; bottom-reboiler outlet toward trim; equalization line to V-1422; trim return; NGL bottoms to V-1422.',

    'PT-1521D about 264.7 psig; PDT-1521 about 2.44 PSID, HI 15; PT-1521A about 267.70, HI 425 and HIHI facility ESD 500. TE-1521F about 165.70 and TE-1521E about 166.20, each LOLO -20, LO 0, HI 200. XV-1521 is on NGL liquid outlet to surge tank.',

    'V-1422 surge tank TE-1422 about 162.2 F, LO 0, HI 200. LT-1422A about 29.3%; changing NGL pump speed or level SP changes drawdown. Around 5% LOLO closes outlet ESD. Top receives stabilizer liquid and NGL-pump recycle on a common header.'

  ],

  capacity: ['Vortex-separator flow meter can physically reach about 235 MMSCFD at max load steps, but 225 MMSCFD is the recommended maximum and >225 should alarm. Because of shrinkage/separation, residue outlet flow normally maxes around 217 MMSCFD.']

};

 

const OPERATOR_PROCESS_KNOWLEDGE_09K = {

  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_09',

  instruction: 'Use these plant-specific flow paths, current observations, alarms and interlocks for Clear Fork troubleshooting/control-board questions. Current readings are observations, not immutable design limits. Do not infer 3D geometry from this 09K batch; the operator explicitly restricted it to control boards and Ryan knowledge.',

  gasGasRefluxGSP: [

    'Cold-separator vapor/reflux-GSP path: FT-1222 ~35.77 MMSCFD -> PDCV-1222B controlled by PDIC-1222B (manual, SP 2.2 PSID, PV ~0.61, CV 100%) -> common recovery tie where LCV-1421B liquid joins only in recovery mode -> horizontal side inlet of E-1222 reflux condenser -> vertical bottom outlet -> PDT-1222A ~0.79 PSID (HI 10) -> TE-1222C ~-92.30 F -> FCV-1222 controlled by FFIC-1222 (SP 16%, PV ~16.21%, CV ~34.63%) -> TE-1222D ~-146.30 F -> third return connection on T-1521 labelled E-1222 GSP reflux condenser.',

    'Methane-rich T-1521 overhead path runs bottom-up through E-1222 reflux condenser and then E-1221 gas/gas exchanger. TE-1222A ~-90.70 F before reflux; PDT-1222C spans reflux inlet to gas/gas outlet, current ~18.08 PSID, HI 30 and HIHI 40 PSID facility ESD. After E-1221, TE-1221A and TE-1221D are ~90.10 F; both have LOW 40 F and LOLO -15 F facility ESD.',

    'FCV-1222 is the flow-control valve on the cold GSP/reflux return and creates pressure drop/cooling; operator believes this may be the Ortloff A valve. Preserve that attribution as operator belief pending drawing/control-narrative verification.'

  ],

  expanderBoosterResidueOverhead: [

    'After methane-rich gas leaves E-1221 it passes PT-1121E ~246.54 psig (HI 385). A 6-inch branch feeds PCV-1121E tower blowdown to flare, controlled by PIC-1121E SP 375 psig, PV ~246.1, CV 0; when tower pressure exceeds SP it opens and flare flame/load increases. PIC setpoint is operator-adjustable.',

    'A separate 6-inch branch off that methane-rich header starts the fuel-gas system. The main line continues toward the C-1121 booster side.',

    'Booster suction receives the anti-surge recycle from A-1321 discharge cooler through FCV-1221A, then passes automatic permissive XV-1221A -> PDT-1121A ~6.44 PSID (HI 10, HIHI 15 EX/C-1121-only shutdown) -> TE-1121 ~86.10 F (HIHI 150 EX/C-1121-only shutdown) -> PT-1121A ~238.77 psig -> C-1121 booster.',

    'Booster discharge: TE-1121C ~126.10 F (HI 180, HIHI 195 EX/C-1121-only shutdown) -> PT-1121C ~302.79 psig -> A-1321 compressor discharge cooler with three fans and hour meters. Fan belt failure can remove one fan. Cooler outlet TE-1321 ~88.70 F (HI 130) -> PT-1321 ~290.97 psig (LO 235, HI 475) -> residue compressor page.'

  ],

  residueCompression: [

    'A-1321 outlet combines on the residue-compressor common suction header with filtered-residue recycle from downstream of F-6800. Recycle path: PV-6050A controlled by PIC-6050B (SP 280 psig, current PV about 297.05, CV 0) -> PIT-6050B ~297.55 psig (HI 350) -> XV-6060 -> PIT-6050C ~298.84 psig (HIHI shutdown 375) -> common residue suction.',

    'PIC-6050B is reverse-acting for suction protection: if PV falls below 280 psig, PV-6050A opens progressively; to close recycle again, raise suction pressure above SP, normally by increasing plant throughput/load.',

    'C-6100/C-6200/C-6300 currently boost roughly 297 psig suction to roughly 973 psig discharge. On startup, gas initially bypasses each reciprocating compressor; hitting LOAD closes the bypass and forces gas through the cylinders. Normal remote capacity is commonly about 80%.',

    'The three compressor discharges combine, pass PIT-6050A ~974.4 psig, then F-6800 residue gas filter. Downstream of F-6800: sales/outlet metering; PV-6050A residue recycle back to residue suction; PV-6810A inlet-compressor recycle; RSV loop; a 1-inch seal-gas source; and a manual warm-dry-gas dry-out tie to the inlet side of F-1412 used after major outages.'

  ],

  controlBoardPresentation: [

    'Keep all displayed transmitters live/trendable and all automatic valves tied to permissive/controller logic. Control-board graphics should preserve the real EQT layout style while correcting line direction/topology.',

    'Do not modify the 3D model from this 09K information batch. The operator explicitly requested control-board and Ryan updates only.'

  ]

};

 

 

 

const OPERATOR_PROCESS_KNOWLEDGE_09L = {

  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_09',

  scope: 'Control boards, live control logic, Ryan knowledge, tests/reference indexes only. NO 3D geometry changes from this batch.',

  plantOutlet: [

    'Residue sales after F-6800: a 6-inch branch first leaves the sales header as SUPPLEMENTAL fuel gas -> ESD-8220A -> PIT-8220D about 124.05 psig (LO 100, HI 200, HIHI 250; HIHI closes ESD-8220A and shuts only supplemental fuel-gas supply). Main residue sales then PIT-8210A about 953.22 psig (HI 1005) -> TIT-8210A about 97.07 F -> FIT-8210A about 207.91 MMSCFD -> ESD-8207 -> PIT-8200 about 953.7 psig (HI 1150, HIHI 1200) -> V-8200 residue pig launcher -> off-site sales line.',

    'Primary fuel gas is NOT this residue branch. Primary fuel gas originates from the 6-inch methane-rich branch downstream of PCV-1121E tower-blowdown takeoff and upstream of the C-1121 booster. Supplemental fuel gas exists to maintain critical users when the plant/primary source is unavailable.'

  ],

  primaryFuelGas: [

    'Primary path: methane-rich header -> XV-1121C -> FIT-1460 about 3294 ACFH -> PCV-1460A controlled by PIC-1460, SP 125 psig, PV about 124.9, CV about 12% -> PT-1460B -> side of V-1460 fuel-gas scrubber -> dry gas out top -> Utilities fuel-gas distribution.',

    'V-1460 should normally have no liquid level because this is very dry methane. Liquid level is abnormal. PT-1460B LO 100, HI 165, HIHI 225; HIHI closes the fuel-gas ESD/XV path only, not the facility.',

    'Primary header critical users include closed-drain tank/building, flare KO systems/pilots, cold-drain separator and lube-oil makeup-area fuel-gas users as represented on Utilities. Use exact P&ID for individual user isolation.'

  ],

  nglProduct: [

    'V-1422 liquid is mostly C2, propane, butanes/i-butane. Normally one P-1619/P-1620 booster and one P-1630/P-1635 pipeline pump operate; all pairs share common headers. Red-tagged redundant equipment must not start until tag is cleared.',

    'PIT-1630A ~315.77 psig LO 275 / LOLO 260 product-system SD. PIT-1635A ~316.2 psig LO 275 / LOLO 275 product-system SD. PT-1630B ~944.46 psig, HI/HIHI 1700 product-system SD. FIT-1630A ~326 GPM: LOLO 180 SD, LO 200, HI 375.',

    'Pump demand can be selected LEVEL or FLOW. LEVEL: LIC-1422A SP 30%, PV ~29.08%, CV ~83.17. FLOW: FIC-1422 SP 625 GPM, PV ~381 GPM, CV ~70%.',

    'Common discharge FT-1422 ~376 GPM: LOLO 265, LO 280. Six-inch recycle to V-1422 uses FCV-1422 controlled by FIC-1422A, SP 385 GPM, PV ~377, CV ~68.20; more recycle means less net pipeline flow.',

    'A-1322 NGL product cooler normally cools about 164 F at TE-1422 to about 78.4 F at TE-1322B. TE-1322B HIHI product SD 190 F; TE-1322C HI 135 F. Two cooler fan motors can be red-tagged.',

    'After A-1322, parallel pressure/level paths use PCV-1623 and PCV-1624. PIC-1623 SP 1000 psig, PV ~1023.23, CV ~3%; LIC-1422B SP 5%, PV ~34.7, level demand may command PCV-1623 open. PIC-1624 SP 980 psig, PV ~1006, CV ~59.26%; LIC-1422C SP 30%, PV ~34.7, level demand may command PCV-1624 open.',

    'Plant outlet NGL: PIT-8000A ~871.7 psig HI 1475 / HIHI 2100; daily NGL totalizer resets every 24 h (example ~45,087 gal); FIT-8000A ~348 GPM LO 100 HI 900; TIT-8000A ~88.99 F HI 130; PIT-8000N ~863.58 psig; ESD-8000B; PIT-8000F ~846 psig HI 2050 / HIHI 2100; then V-8000 NGL pig launcher and pipeline.'

  ],

  operatingPrinciples: [

    'All automatic control valves may be switched AUTO/MANUAL at the operator interface when the simulator provides that control. Ryan must never operate a control on the user’s behalf; explain the DCS location, checks, cause/effect and expected response.',

    'Trips/shutdowns may have operator bypasses at the transmitter/interlock popup. Ryan must never assume a bypass is active; report bypass state from live context and warn that bypassing protection changes risk and must follow site authorization/procedure.',

    'Current readings are live observations, not immutable design values. Alarm/trip limits and operator-confirmed topology are plant-specific knowledge unless superseded by newer verified source.'

  ],

  retrievalArchitecture: {

    rule: 'Use retrieval/routing rather than stuffing the entire plant specification into every request. Cache stable reference entries; always read current PV/SP/CV, run states, alarms, bypasses and trends from live simulator context.',

    indexes: ['Tags','Equipment','Flow paths','Controllers','Alarms','Interlocks','Maintenance','Historical trends','Reference documents','Quiz questions','Engineering revisions','General cryogenic knowledge']

  },

  acceptanceTests: [

    'Where does primary fuel gas come from? -> corrected methane-rich branch after PCV-1121E takeoff, before booster.',

    'Why is PV-6050A opening? -> read live PIC-6050B SP/PV/CV and explain reverse-acting suction recycle.',

    'Unknown compressor oil -> Pending Verification, never guess.',

    'Explain full rejection -> distinguish general cryogenic theory from Clear Fork-specific operation.',

    'Trip cooler fan -> Ryan should cite failed fan, ambient condition and temperature trend.',

    'Ask Ryan to start a pump -> refuse to manipulate controls; offer DCS location and checks.',

    'Quiz current screen -> use verified plant-specific screen facts.'

  ]

};

 

const FINAL_PID_MASTER_KNOWLEDGE = {

  verificationStatus: 'VERIFIED_FROM_SUPPLIED_CLEAR_FORK_P_AND_IDS_EXCEPT_ITEMS_EXPLICITLY_MARKED_PENDING',

  sourcePriority: 'These Clear Fork P&IDs outrank generic process/OEM theory for plant-specific piping, valve, instrument, relief and isolation topology.',

  completeness: 'This is the complete drawing set supplied by the operator for this simulator project. It is NOT represented as the facility official master drawing index; future revisions/as-builts still supersede it.',

  systems: {

    residueDistribution: {

      drawings: ['M2600','M2610','M2615','M2680','M2690'],

      equipment: ['C-6100','C-6200','C-6300','AC-6101','AC-6201','AC-6301','F-6800','F-1438'],

      facts: [

        'M2600 is the residue-gas recycle/distribution sheet and closes the common residue-header/recycle continuation that was previously missing.',

        'M2610/M2615 provide the C-6100 residue compressor and intercooler-bay package topology; use matching sister-unit detail for C-6200/C-6300 only where their own drawing references support it.',

        'M2680 provides F-6800 residue filter piping/instrumentation and its highlighted operator-traced routes.',

        'M2690 provides F-1438 residue/recycle filter piping, instrumentation, drains/vents and tie-ins. Do not conflate F-1438 with the main residue filter F-6800.'

      ]

    },

    hotOilAndRegenUtilities: {

      drawings: ['M2700','M2710'],

      equipment: ['H-7100','P-7410','P-7420','H-7600'],

      facts: [

        'M2710 is the H-7100 hot-oil heater package/control P&ID and is authoritative for heater package valves, instruments, trips, bypasses and utility connections.',

        'The hot-oil pump and heater system must be traced through its actual supply/return headers and off-page continuations before LOTO; generic heater diagrams do not define the Clear Fork isolation boundary.'

      ]

    },

    flareReliefAndBlowdown: {

      drawings: ['M2900','M2901','M2902','M2910'],

      equipment: ['V-8110','V-9100'],

      facts: [

        'M2900 is the plant flare-gas distribution/header routing sheet. This corrects any older simulator note that mislabeled M2900 as an NGL pump drawing.',

        'M2901 is the major flare/relief-header continuation sheet. It explicitly gathers relief and blowdown connections from inlet/slug catcher, NGL metering, dehydration/regen, refrigeration, residue compressors, inlet compressors, stabilizer and related systems.',

        'M2902 shows V-8110 compressor knockout tank / flare knockout service and associated truck-loading/drain connections.',

        'M2910 shows V-9100 flare knockout drum and its truck-unloading/drain arrangement.',

        'For compressor relief/blowdown tracing, M2901 explicitly references C-6100 suction/interstage/discharge PSV connections (M2610/M2615), C-6200 blowdown and suction/interstage/discharge PSV continuations (M2620/M2625), C-6300 blowdown and suction/interstage/discharge PSV continuations (M2630/M2635), C-4100 blowdown and suction/interstage PSV continuations (M2410/M2415), and C-4200 blowdown/suction/interstage continuations (M2420/M2425).',

        'Never treat a relief-header connection as permission to isolate a PSV. For LOTO, identify the PSV and relief destination, then require field/site-procedure verification of any PSV isolation configuration.'

      ]

    },

    instrumentAir: {

      drawings: ['M2920','M2921A'],

      equipment: ['C-9210','C-9220','D-9230','V-9241'],

      facts: [

        'M2920 provides the plant instrument-air compressors/dryer/receiver arrangement, including C-9210/C-9220, D-9230 and V-9241.',

        'M2921A provides the vendor/building-boundary instrument-air detail. Loss-of-instrument-air troubleshooting must consider common-header effects and individual actuator fail states from the applicable process P&ID.'

      ]

    },

    flarePilots: {

      drawings: ['M2915'],

      equipment: ['FL-9110'],

      facts: ['M2915 provides the flare pilot-fuel system and blower/support detail. Use this sheet for pilot/fuel routing rather than inferring from the main flare header.']

    },

    oilStorage: {

      drawings: ['M2930'],

      equipment: ['TK-9300'],

      facts: ['M2930 provides TK-9300 lube-oil storage tank piping, fill/unloading, venting, level instrumentation and transfer connections.']

    },

    closedDrain: {

      drawings: ['M2960'],

      equipment: ['V-8100'],

      facts: [

        'M2960 provides the west-end closed-drain tank V-8100 and the closed-drain header connections serving multiple plant systems.',

        'Closed-drain routing is an energy/hazard path during LOTO and blowdown planning; Ryan must trace it as a destination and never assume a drain is depressured merely because its upstream equipment is isolated.'

      ]

    },

    expanderAndRefrigerationPackages: {

      drawings: ['M2146B','M2146C','M2146D','M2215','M2216A','M2216B','M2216C','M2216D'],

      equipment: ['EX-1121','C-1121','C-1140','A-1140'],

      facts: [

        'Vendor expander/compressor drawings provide seal-gas, thrust-equalizer, casing-drain, lube-oil, local-control-panel, IGV, vibration, trip and process-equipment relationships for EX/C-1121.',

        'Refrigeration compressor vendor/package drawings provide C-1140 package suction/discharge, oil separator/filter/pump, motor, economizer and relief/interface detail. Apply equivalent RWF-II family knowledge to C-1141/C-1142 only where matching package/as-built data supports it.'

      ]

    }

  },

  dehySequence: {

    source: 'Operator-supplied Clear Fork RegenProcess HMI plus dehydration/regen P&IDs',

    rules: [

      'Exactly two of V-1413/V-1414/V-1415 are in normal process adsorption service while exactly one bed is in the regeneration sequence.',

      'Normal process beds: process-gas path OPEN and regeneration path CLOSED.',

      'Active regeneration bed: process-gas path CLOSED and regeneration path OPEN.',

      'HEAT phase: H-1711 heat is enabled while the active bed remains isolated from process.',

      'COOLDOWN phase: H-1711 heat is removed, but the same bed remains on the regeneration path until cooldown is complete.',

      'After cooldown, close/prove regeneration path, reopen/prove process path, return the bed to adsorption, then isolate the next bed for regeneration.',

      'Do not invent individual A/B/C/D switching-valve suffix functions unless the exact P&ID/source clearly proves the mapping.'

    ]

  },

  exactDataRules: [

    'When answering piping-route questions, preserve line number, nominal size, piping/service/spec code, direction and off-page continuation exactly as source-backed; do not normalize away specification-break information.',

    'When answering valve questions, distinguish manual block/check/bypass/drain/vent valves from automated XV/PV/PCV/LCV/FCV devices and preserve fail/normal position only when shown.',

    'When answering PSV questions, report PSV tag, protected equipment/service, inlet/outlet size/rating or orifice information when legible, set pressure when legible, relief destination/header and source drawing. Missing elements are PENDING_VERIFICATION.',

    'For highlighted operator-traced routes, treat the highlight as operator-confirmed routing context, then cross-check exact tags/line numbers against the underlying P&ID before using it in a LOTO.',

    'Never use obsolete/estimated simulator reference entries when a newer supplied P&ID conflicts. The newest supplied as-built/construction P&ID layer wins and the conflict must be stated.'

  ]

};

 

 

const OPERATOR_PROCESS_KNOWLEDGE_09M = {

  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_09',

  scope: 'Ryan knowledge + control-board/cause-effect corrections only. No 3D geometry changes from this batch.',

  controlPhilosophy: [

    'For interlocked automatic valves in this batch, an ESD/SD places the affected loop in MANUAL with CV at 0%. An authorized restart requires the operator to restore the appropriate loop to AUTO; then the controller resumes adjustment from SP/PV. Never operate that control for the user.',

    'All current readings below are operator-observed starting values, not immutable design values. Alarm/trip thresholds and described cause/effect are plant-specific operator knowledge unless superseded by a newer verified P&ID/control narrative.',

    'All motor-driven equipment represented on a control board should support a red-tag/inhibit state. A red-tagged motor must not start until the tag is cleared. Ryan may explain the DCS/control-board location and checks but must not start equipment for the operator.'

  ],

  refrigeration: {

    system: 'Closed-loop R-290 propane refrigeration; propane and process gas remain physically separate inside E-1241 tube-and-shell gas chiller. Refrigeration materially improves C2/propane recovery by precooling inlet gas.',

    accumulatorToEconomizer: [

      'V-1444 accumulator LT-1444 current about 44.79%; LO 33%, HI 85%.',

      'Liquid leaves V-1444 through LCV-1442, controlled by LIC-1442 SP 36%, PV 35.4%, CV 21.59%. If V-1442 economizer level falls below SP, LCV-1442 opens farther to admit more liquid propane; rising level closes it.'

    ],

    economizer: [

      'V-1442 economizer LT-1442 current 35.4%; LO 18%, HI 45%.',

      'Economizer vapor leaves top through PCV-1442 to refrigeration compressor interstage. PIC-1442 SP 70 psig, PV 69.61, CV 17.61%; PT-1442 is the associated pressure transmitter, LO 30, HI 130. Rising economizer pressure opens PCV-1442 farther.',

      'Economizer liquid leaves bottom through LCV-1241 controlled by LIC-1241 using E-1241 chiller level LT-1241. SP 33%, PV 33.7%, CV 22.2%; falling chiller level opens LCV-1241 farther.'

    ],

    chillerSuction: [

      'Downstream of LCV-1241 is PCV-1441B, controlled by PIC-1441B SP 12 psig, PV 16.94, CV 0%. If PV falls below SP the valve opens to bring high-pressure liquid from condenser/accumulator side toward chiller inlet and raise pressure.',

      'A 2-inch propane makeup tie enters this liquid line through a manual valve.',

      'E-1241 receives propane on shell side; propane flashes/boils while cooling process gas on its separate side. A 1.5-inch side line serves the refrigerant reclaimer, which separates compressor lube oil from propane.',

      'Chiller vapor goes to V-1441 refrigeration suction scrubber. PT-1441C current about 16.84 psig, LO 1, HI 30, HIHI 240; HIHI shuts down refrigeration only. PT-1441 current 16.94, LO 1, HI 30.',

      'PCV-1441A is controlled by PIC-1441A SP 30 psig, PV about 16.17, CV 100%; as pressure rises above SP it pinches. PIC-1441C is refrigeration-compressor suction-pressure controller: SP 16.56, PV 16.84, CV about 31.60.'

    ],

    compressorsCondensers: [

      'C-1140/C-1141/C-1142 screw compressors share common suction and discharge headers; normally one runs, two can run. Each package has two lube-oil cooler fans; loss/red-tag of a fan raises oil temperature.',

      'Before A-1343 condenser banks, PT-1140D current about 196.4 psig, LO 190, HI 285. PCV-1140D is controlled by PIC-1140D SP 180, PV about 199.92, CV 100%; if PV drops below SP the valve pinches to create backpressure.',

      'A-1343A/B/C contain nine condenser fans total. Each fan can start/stop/red-tag. Fewer fans or hotter ambient raises condensing pressure/temperature; more fans or cooler ambient lowers it.',

      'After condensation, PT-1444 is around 203.9/198.97 psig depending measurement location, LO 130, HI 285. PIC-1342 is condenser pressure controller SP 200, PV about 204.36, CV about 34.84 and reads PT-1444.',

      'Liquid can route toward PCV-1441B/chiller or normally through PCV-1444 toward V-1444. PIC-1444 SP 190, PV about 198.8, CV 0%; operator describes it as opening when PV drops below SP. Preserve this as operator-provided control action pending exact control narrative confirmation.'

    ]

  },

  hotOil: {

    flowPath: [

      'H-7100 heater SP 370 F; TE-202 current about 365.8 F. Heater can be red-tagged. In full rejection, loss of H-7100 rapidly removes demeth bottom heat, C2 in NGL rises, and controlled plant shutdown becomes necessary.',

      'H-7100 common supply header serves exactly three users: E-1125 trim reboiler tube side, E-5000 stabilizer inlet preheater shell side, and E-5040 stabilizer reboiler tube side. All three returns combine into V-7500 expansion tank.',

      'V-7500 PIT-7500A about 6.4 psig, HI 15, HIHI 200 hot-oil-only shutdown; TIT-7500A about 288 F, LO 255, HI 380; LIT-7505A about 60.6%, LO 15, HI 80.',

      'FV-7100A/FIC-7100A can route hot oil directly to expansion tank; FIC SP 1550 GPM, PV 1540.1, CV about 24.4%.',

      'P-7410/P-7420 are duty/standby circulation pumps; one always runs. PIT-7410A current about 7.5 psig with LO 4 / LOLO 2 hot-oil shutdown; PIT-7410B about 105.8 psig, HI 150; matching P-7420 transmitters exist.',

      'F-7600 filter side branch: FIT-7600A current about 164.1 GPM, LO 100, HI 190; PDIT-7600A current about 0.85 PSID, HI/change at 8 PSID.',

      'Main return FIT-7100A current about 1540.1 GPM; LOLO 880 / HIHI 2400 hot-oil shutdown. H-7100 fuel gas uses PCV-7100A (about 36% open) and FIT-7105A current about 0.70 MMSCFD.'

    ]

  },

  overheadCompressorAndAir: [

    'C-5700 main suction is PV-5700A controlled by PIC-5700A. Current SP 230 psig, PV about 176, CV 0; valve opens when PV rises above SP. PIT-5700B current about 177.52; LL SD 150, HIHI SD 300.',

    'Residue-gas assist/recycle line to overhead system uses PV-5900A controlled by PIC-5900A, SP 210, PV about 352, CV 0 in the observed condition.',

    'PIT-9241A is plant instrument-air pressure from air compressors. Normal current about 126.6 psig; LO alarm 90, LOLO 75 facility ESD, HI 160.'

  ],

  stabilizer: {

    inlet: [

      'After F-1050/F-1055 liquid solids filters, PDIT-1051 current about 1.22 PSID, HI/change at 8, HIHI 12 closes downstream XV-5000A and blocks filter flow until filter swap/change. TIT-5000A about 66.7 F; FIT-5000A about 0 GPM (LO 10 / LOLO 1); PIT-5000A about 279.9; TIT-5000B about 68.9.',

      'E-5000 inlet preheater: TIT-5000D about 67.05 F (LO 55, HI 140, HIHI 160 stabilizer-only SD) and TIC-5000D SP 80/PV 67.05/CV 0; hot-oil-side TV-5005A is controlled by TIC-5000C SP 70/PV 67.2/CV 0 using TIT-5000C (~67.2, LO 50, HI 140). These controllers are manual when stabilizer is not running.',

      'FIC-5010A/FV-5010A current SP 45 GPM, PV 0, CV 0, then XV-5010B and recycle tie from P-5060/P-5065 enter V-5010.',

      'V-5010 water/drip leg LIT-5010B about 10.4%; LIC-5010E SP 10/PV 10.9/CV 1.5 drives LV-5010E through XV-5010E to drain header. Main LIT-5010C about 47.3%.',

      'V-5010 vapor: PIT-5010D about 261.2 -> PV-5010D controlled by PIC-5010D SP 270/PV 261.3/CV 0 -> C-5700 overhead compressor.',

      'V-5010 liquid: PIT-5010A about 262.2, HI 365 / HIHI 380 stabilizer-only shutdown. LIT-5010A about 25.2, LO 15 / HI 70. LIC-5010G SP 25/PV ~25/CV 100 drives downstream feed demand. Liquid -> XV-5010F -> F-5015/F-5016; PDIT-5015 current ~0.53, HI 5 means swap/change duty filter.'

    ],

    towerProduct: [

      'After filters: FIT-5020A ~7.05 GPM; FIC-5020A SP 95/PV ~7/CV 100 on FV-5020A, also constrained by LIC-5010G. Split path 1: FI-5020B ~12.8 GPM -> FV-5020B via FIC-5020B SP 28/PV 12.79/CV 30 -> top of T-5030. Split path 2: TIT-5020C ~67.7 -> E-5020 tube side -> TIT-5020C downstream ~67.9 -> middle of tower.',

      'T-5030 overhead: TIT-5030D ~75.4, PIT-5030B ~190.7 (HIHI 370 shuts stabilizer + C-5700), PIT-5030A ~190.7 (LO 175/HI 300) -> PV-5030A controlled by PIC-5030A SP 210/PV 190.7/CV 0 -> overhead compressor. TIT-5030C top ~72.5 (LO 10/HI 130); TIT-5030B middle ~84.4 (HI 275).',

      'Tower bottoms circulate through E-5040 stabilizer reboiler: process on shell side, hot oil on tube side. TIT-5040A ~303.95 (LO 220/HI 280); TIT-5040C ~182 (LOLO SD 200, LO 210, HI 270, HIHI SD 400); PDIT-5040A spans reboiler/tower path, current 0, HI 2 / HIHI 4 stabilizer SD. LIT-5040B current ~100, LO 30 / HI 70.',

      'Heated bottoms then E-5020 shell side: TIT-5020D ~78.7 (LO 200/HI 300) before exchanger; TIT-5020F ~69.07 (LO 21/HI 210) after; then AC-5055 product cooler, whose fan motor is red-tag capable. TIT-5060C ~67.73 (LO 9/HI 130/HIHI 180).',

      'P-5060 and P-5065 are controlled from reboiler level: LIC-5060 SP45/PV56.6/CV64; LIC-5065 SP45/PV56.5/CV67. SI-5065 ~0.2% with pumps stopped; FIT-5060 ~0.02 GPM, LOLO62/LO67/HI102.4/HIHI136.4. FIC-5060A controls recycle FV-5030A (SP70/PV0.2/CV100). Product passes LV-5040A then XV-5040B to V-1422 or can recycle to V-5010 through XV-5040A.',

      'When the stabilizer unit is not running, suppress nuisance stabilizer process alarms and leave the identified stabilizer controllers in MANUAL/zero output until intentional startup.'

    ]

  }

};

 


// ===== OPERATOR PROCESS KNOWLEDGE — 2026-08-11 INLET / INLET COMPRESSION =====
// Current control-board corrections supplied directly by the operator. Current readings are
// observed snapshots, not immutable design values. Topology/control relationships below are
// operator-provided plant knowledge unless a newer verified P&ID/control narrative supersedes them.
const OPERATOR_PROCESS_KNOWLEDGE_0811 = {
  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_11',
  scope: 'Ryan knowledge + control-board/cause-effect corrections. No 3D geometry authority from this knowledge block.',
  inlet: {
    flowPath: [
      'Raw natural gas pipeline -> V-1000 inlet gas pig receiver -> PIT-1000 -> PIT-1000A -> ESD-1000D -> PIT-1010B -> PV-1010A -> PIT-1010A -> three parallel slug catcher legs V-1020/V-1025/V-1030 -> common slug-catcher vapor header -> PIT-1040B -> XV-1040A -> V-1040 vortex separator.',
      'V-1040 gas outlet feeds the inlet-compressor suction side only. V-1040 does NOT receive inlet-compressor discharge.',
      'Slug-catcher liquid routes toward the stabilizer liquid-transfer system; vapor combines before V-1040.'
    ],
    observedSnapshot: {
      PIT1000_psig: 487,
      PIT1010B_psig: 490,
      PIC1010A: { sp_psig: 445, pv_psig: 446, cv_pct_open: 40.6 },
      PIT1010A_psig: 445.04,
      LIC1020: { sp_pct: 29, pv_pct: 29, cv_pct_open: 85.0 },
      LIC1025: { sp_pct: 35, pv_pct: 35, cv_pct_open: 50.7 },
      LIC1030: { sp_pct: 33, pv_pct: 33, cv_pct_open: 63.8 },
      PIT1040B_psig: 446,
      LIC1040A: { sp_pct: 35, pv_pct: 8, cv_pct_open: 0 }
    },
    controls: [
      'ESD-1000D is discrete: CLOSED, OPENING, OPEN, CLOSING, FAILED, TRIPPED. Commands are OPEN, CLOSE, ESD TRIP, RESET; no percentage command.',
      'ESD-1000D differential pressure is calculated as PIT-1000A minus PIT-1010B.',
      'PV-1010A modulates to maintain downstream PIT-1010A near its pressure setpoint. If PIT-1010A is below SP, PV-1010A opens; if PIT-1010A is above SP, PV-1010A closes.',
      'Available pressure across PV-1010A is PIT-1010B minus PIT-1010A.',
      'Slug-catcher level controllers are independent and must preserve their different normal valve outputs/hydraulic behavior; stabilizer-transfer availability limits liquid discharge.',
      'V-1040 level controller LIC-1040A retains liquid when PV is below SP and opens progressively as level approaches/rises above SP, subject to downstream liquid-path availability.'
    ]
  },
  inletCompression: {
    flowPath: [
      'V-1040 gas -> PIT-1045A -> TIT-1045A -> FIT-1045A/FQI-1045A -> common inlet-compressor suction header.',
      'C-4100 and C-4200 take separate suction branches in parallel from the common suction header. Suction and discharge piping are physically separate.',
      'C-4100 and C-4200 each have their own discharge line; the two discharge lines combine into the C-4100/C-4200 common discharge header.',
      'Common inlet-compressor discharge then splits: normal process flow continues to V-1410 inlet gas separator; recycle returns discharge gas to inlet-compressor suction through the 4250 recycle path.',
      '4250 recycle path: common discharge header -> PV-4250A -> PIT-4250B -> XXY-4250B/XV-4250B -> PIT-4250C -> common compressor suction header.',
      'Dry-out/regen branch from C-1111 regen compressor is shown on the inlet-compression HMI through PIC-6805A controlling PV-6805A into the inlet-compressor suction system.',
      'Filtered-residue recycle from downstream/outlet of F-6800 is shown on the inlet-compression HMI through PIC-6810A/PV-6810A and XV-6810A/XXY-6810A into inlet-compressor suction.'
    ],
    observedSnapshot: {
      PIT1045A_psig: 441,
      TIT1045A_degF: 79.5,
      FIT1045A_MMSCFD: 212.6,
      PIT4250A_psig: 974,
      PIC4250A: { sp_psig: 1000, pv_psig: 929, cv_pct_open: 0 },
      PIC4250B: { sp_psig: 358, pv_psig: 442, cv_pct_open: 0 },
      PIT4250B_psig: 440.1,
      PIT4250C_status: 'Use current live simulator value when available; older initialized/observed values around 440-442 psig are snapshots, not a fixed design value.'
    },
    controls: [
      'PV-4250A is normally 0% open at normal suction conditions and is controlled in tandem/override by PIC-4250A and PIC-4250B.',
      'PIC-4250A is the discharge-pressure controller with SP 1000 psig; its PV is common inlet-compressor discharge pressure (PIT-4250A domain), not compressor suction pressure.',
      'PIC-4250B is the suction-protection controller with SP 358 psig. If inlet-compressor suction pressure falls below 358 psig, its demand opens PV-4250A progressively to recycle discharge gas back to suction and keep C-4100/C-4200 operating.',
      'For the shared PV-4250A, the control demand requiring more recycle should dominate; under normal conditions both demands can be 0% and the valve remains closed.',
      'Current HMI values are observations and must be superseded by LIVE simulator context whenever Ryan is asked what is happening now.'
    ],
    presentationRules: [
      'On the inlet-compression control board, preserve the real HMI-style relationships: left-side feeds point toward the compressor suction header; suction and discharge do not share a pipe; compressor data popups and GC DATA remain available.',
      'Do not simplify away established transmitters/controllers/valves merely to make the board cleaner. Improve/correct in place.'
    ]
  }
};



// ===== OPERATOR PROCESS KNOWLEDGE — 2026-08-12 VERIFIED CONTROL-BOARD PASS =====
const OPERATOR_PROCESS_KNOWLEDGE_0812 = {
  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_12',
  scope: 'Control-board behavior, trend presentation, startup defaults and screen topology. No 3D geometry authority.',
  corrections: [
    'On simulator load, P-5060 and P-5065 stabilizer booster pumps start STOPPED. With both stopped, stabilizer liquid circulation/transfer flow must collapse rather than showing pump-driven GPM, pressure rise or temperature rise.',
    'Only one of P-5060/P-5065 normally runs at a time; either pump may be red-tagged and a red-tagged stopped pump cannot start.',
    'V-1418 regen scrubber liquid level is operator-observed around 6% for this update. LIC-1418 SP remains 18%; when the dump cycle is called, the modeled level drains toward 0% and then begins accumulating again according to regen condensate load.',
    'Inlet-separation common slug-catcher vapor flow arrow points toward V-1040. F-1412 inlet filter/coalescer belongs to the inlet-system/downstream context and must not be represented as physically inside V-1040.',
    'Fuel-gas scrubber V-1460 top outlet continues to the fuel-gas header/Utilities distribution header.',
    'Trend displays should be visually subtle for small 10-minute changes: a roughly 1 psi, 1 degree F or 1 GPM movement must not be auto-zoomed into a dramatic full-scale swing. Retain up to 72 hours of history with approximately 30-second samples.',
    'The simulator process model continues running for the lifetime of the open browser tab; ordinary timer jitter must not change process rates.'
  ],
  uiAuditRules: [
    'Do not place duplicate source labels on the same Utilities flow path. Keep annotations out of process piping when open screen space is available.',
    'Every displayed transmitter intended for operations should remain trendable; do not remove existing controls or popups while cleaning graphics.',
    'Before deployment, verify requested renderer changes are present in the actual SCR.* functions and verify the matching Ryan build ID in both index.html and ryan.js.'
  ]
};

const KNOWLEDGE_REGISTRY = {
  operatorProcess0812: OPERATOR_PROCESS_KNOWLEDGE_0812,
  operatorProcess0811: OPERATOR_PROCESS_KNOWLEDGE_0811,

  stabilizer: STABILIZER_KNOWLEDGE,

  overheadCompressor: OVERHEAD_COMPRESSOR_KNOWLEDGE,

  controlValves: CONTROL_VALVE_KNOWLEDGE,

  pumpMaintenance: PUMP_MAINTENANCE_KNOWLEDGE,

  residueCompressors: RESIDUE_COMPRESSOR_KNOWLEDGE,

  simulatorUI: SIMULATOR_UI_KNOWLEDGE,

  oemManuals: OEM_MANUAL_KNOWLEDGE,

  petroSkills: PETROSKILLS_KNOWLEDGE,

  clearForkPIDs: CLEAR_FORK_PID_KNOWLEDGE,

  finalPIDs: FINAL_PID_MASTER_KNOWLEDGE,

  operatorProcess09J: OPERATOR_PROCESS_KNOWLEDGE_09J,

  operatorProcess09K: OPERATOR_PROCESS_KNOWLEDGE_09K,

  operatorProcess09L: OPERATOR_PROCESS_KNOWLEDGE_09L,

  operatorProcess09M: OPERATOR_PROCESS_KNOWLEDGE_09M,

};

 

const KNOWLEDGE_ROUTING_RULES = [
  { key: 'operatorProcess0812', re: /\b(V-1418|LIC-1418|regen scrubber|P-5060|P-5065|stabilizer pump|trend|72 hour|Utilities|fuel gas header|V-1460|inlet sep|V-1040|control board|deployment|build id)\b/i },
  { key: 'operatorProcess0811', re: /\b(inlet comp|inlet compressor|C-4100|C-4200|PIT-1045A|TIT-1045A|FIT-1045A|FQI-1045A|PIT-4250A|PIT-4250B|PIT-4250C|PIC-4250A|PIC-4250B|PV-4250A|XV-4250B|XXY-4250B|PIC-6805A|PV-6805A|PIC-6810A|PV-6810A|V-1000|ESD-1000D|PIT-1000|PIT-1010A|PIT-1010B|PV-1010A|V-1020|V-1025|V-1030|PIT-1040B|XV-1040A|V-1040|slug catcher|plant inlet)\b/i },

  { key: 'operatorProcess09M', re: /\b(refrigeration|refrig|R-290|V-1444|V-1442|V-1441|E-1241|LCV-1442|LCV-1241|PCV-1441B|PCV-1441A|PCV-1442|PCV-1444|PIC-1342|A-1343|hot oil|H-7100|V-7500|P-7410|P-7420|F-7600|C-5700|PIC-5700A|PIC-5900A|PIT-9241A|instrument air|stabilizer|V-5010|T-5030|E-5040|F-5015|F-5016|PDIT-1051|red tag)\b/i },

  { key: 'operatorProcess09L', re: /\b(primary fuel gas|supplemental fuel gas|ESD-8220A|PIT-8220D|PIT-8210A|FIT-8210A|V-8200|NGL product|P-1619|P-1620|P-1630|P-1635|A-1322|FCV-1422|FIC-1422A|PCV-1623|PCV-1624|ESD-8000B|V-8000|red tag|retrieval architecture|engineering revision)\b/i },

  { key: 'finalPIDs', re: /\b(M2600|M2610|M2615|M2680|M2690|M2700|M2710|M2900|M2901|M2902|M2910|M2915|M2920|M2921A|M2930|M2960|F-6800|F-1438|H-7100|V-8110|V-9100|C-9210|C-9220|D-9230|V-9241|TK-9300|flare|relief header|closed drain|instrument air|dehy sequence|regen sequence|piping rating|line spec|valve number|PSV rating)\b/i },

  { key: 'clearForkPIDs', re: /\b(M1110|M2040|M2050|M2105|M2110|M2130|M2135|M2140|M2145|M2150|M2155|M2160|M2165|M2175|M2200|M2205|M2210|M2225|M2240|M2260|M2500|M2505|M2510|M2514|M2515|M2520|M2560|M2570|M2571A|M2571B|M2600|M2610|M2615|M2900|M2901|M2922|M2960|V-1040|F-1050|F-1055|E-5000|V-5010|F-5015|F-5016|E-5020|T-5030|E-5040|P-5060|P-5065|AC-5055|C-5700|V-1460|E-1221|E-1222|E-1223|E-1224|E-1241|V-1421|EX-1121|C-1121|T-1521|E-1125|V-1422|P-1619|P-1620|P-1630|P-1635|A-1322|C-6100|C-6200|C-6300|AC-6101|AC-6201|AC-6301|P&ID|PID|flow path|isolation|LOTO|relief|depressure)\b/i },

  { key: 'stabilizer', re: /\b(V-1521|P-5060|P-5065|AC-5055|stabilizer|demethanizer|LT-5060|TT-5060|PSV-1521)\b/i },

  { key: 'overheadCompressor', re: /\b(C-5700|5700|overhead compressor|TT-5700|PS-5700|PSV-5700)\b/i },

  { key: 'controlValves', re: /\b(PCV-1438|LCV-1241|control valve|Fisher|pilot air|actuator)\b/i },

  { key: 'pumpMaintenance', re: /\b(P-1630|P-1635|ISO 68|pump oil|booster pump maintenance)\b/i },

  { key: 'residueCompressors', re: /\b(C-6100|C-6200|C-6300|6100|6200|6300|residue compressor|PT-620[1-6]|TT-62\d\d)\b/i },

  { key: 'simulatorUI', re: /\b(simulation speed|real time|toolbar|outages panel|live|pause|simulator UI)\b/i },

  { key: 'oemManuals', re: /\b(SN-?55|Sullair|P-1619|P-1620|P-7410|P-7420|hot oil pump|PumpWorks|PWH|JGQ\/?2|C-5700|RWF[ -]?II|refrigeration compressor|C-1140|C-1141|C-1142|KBZ\/?6|KBU|inlet compressor|residue compressor|EX\/?C-1121|EX-1121|C-1121|EX\/?C-121|Atlas Copco|Mafi-Trench|OEM manual)\b/i },

  { key: 'petroSkills', re: /\b(PetroSkills|process question|process troubleshooting|troubleshoot|diagnos|why is|what causes|phase behavior|phase envelope|dew ?point|bubble ?point|flash|cavitat|vapor lock|pump|reciprocating compressor|rod reversal|pulsation|P&ID|PFD|BFD|mass transfer|absorption|stripping|fractionation|stabilizer|reflux|reboiler|condenser|tray|packing|tower|contactor|glycol|dehydration|refrigeration|cryo|cryogenic|JT|demethanizer)\b/i },

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

  if (mode === 'recommend' || /\b(process|troubleshoot|diagnos|upset|off-spec|off spec|poor separation|low flow|high pressure|low pressure|high temperature|low temperature|why|cause)\b/i.test(haystack)) keys.add('petroSkills');

  if ((mode === 'loto' || mode === 'loto_workplan') || /\b(P&ID|PID|flow path|lineup|isolation|LOTO|lockout|relief|PSV|depressure|blowdown|upstream|downstream|continuation)\b/i.test(haystack)) keys.add('clearForkPIDs');

  if ((mode === 'loto' || mode === 'loto_workplan') || /\b(P&ID|PID|piping|line number|line spec|rating|valve|PSV|relief|flare|closed drain|instrument air|dehy|regen)\b/i.test(haystack)) keys.add('finalPIDs');

  if (!keys.size && /\b(alarm|setpoint|loto|lockout|isolation|psv|pressure relief|maintenance)\b/i.test(haystack)) {

    Object.keys(KNOWLEDGE_REGISTRY).forEach(k => keys.add(k));

  }

  return Object.fromEntries([...keys].map(k => [k, KNOWLEDGE_REGISTRY[k]]));

}

 

 

function lotoWorkplanOutputConfig() {

  const marker = {

    type: 'object',

    properties: {

      tag: { type: 'string' },

      action: { type: 'string' },

      purpose: { type: 'string' },

      sourceDrawing: { type: 'string' },

      verification: { type: 'string' }

    },

    required: ['tag','action','purpose','sourceDrawing','verification'],

    additionalProperties: false

  };

  return {

    format: {

      type: 'json_schema',

      schema: {

        type: 'object',

        properties: {

          title: { type: 'string' },

          status: { type: 'string' },

          scope: { type: 'string' },

          equipment: { type: 'array', items: { type: 'string' } },

          sourceDrawings: { type: 'array', items: { type: 'string' } },

          workPlanSteps: { type: 'array', items: { type: 'string' } },

          energySources: { type: 'array', items: { type: 'string' } },

          hazards: { type: 'array', items: { type: 'string' } },

          isolationPoints: { type: 'array', items: marker },

          blowdownPoints: { type: 'array', items: marker },

          psvMarkers: { type: 'array', items: marker },

          verificationChecklist: { type: 'array', items: { type: 'string' } },

          restorationSteps: { type: 'array', items: { type: 'string' } },

          missingInformation: { type: 'array', items: { type: 'string' } },

          fieldVerificationRequired: { type: 'boolean' },

          finalWarning: { type: 'string' }

        },

        required: ['title','status','scope','equipment','sourceDrawings','workPlanSteps','energySources','hazards','isolationPoints','blowdownPoints','psvMarkers','verificationChecklist','restorationSteps','missingInformation','fieldVerificationRequired','finalWarning'],

        additionalProperties: false

      }

    }

  };

}

 

function buildSystemPrompt(mode, selectedKnowledge, learnedKnowledge) {

  let modeInstructions = '';

  if (mode === 'loto' || mode === 'loto_workplan') {

    modeInstructions = `MODE: LOTO / WORK-PLAN DRAFTING. Build a source-traceable DRAFT work plan from Clear Fork P&ID knowledge and supplied context. Never present an AI-generated isolation as approved or ready to execute. Determine the requested work boundary first, then trace every process, pressure, thermal, electrical, mechanical, pneumatic, hydraulic, chemical, and stored-energy path that can enter the boundary. Use exact valve/ESD/bleed/blowdown/PSV tags ONLY when explicitly present in supplied source data. If the exact isolation or blowdown tag is not supported, put PENDING VERIFICATION in the tag/action and identify the drawing/field check needed; do not invent a tag. Include off-page continuation drawings and explicitly list any missing drawings that prevent a complete boundary. PSVs are protection devices: identify them and their relief destination when source-backed, but do not instruct the user to isolate a PSV unless an approved site procedure/source specifically requires it. Provide verification checks for zero-energy/zero-pressure and a restoration plan. The finalWarning must be exactly: NOT APPROVED — FIELD VERIFICATION REQUIRED. fieldVerificationRequired must be true.`;

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

For Clear Fork P&ID questions, prefer FINAL_PID_MASTER_KNOWLEDGE and newer verified drawing facts over older simulator notes.

For Clear Fork process/control-board/troubleshooting questions, also use OPERATOR_PROCESS_KNOWLEDGE_0811 plus OPERATOR_PROCESS_KNOWLEDGE_09J, OPERATOR_PROCESS_KNOWLEDGE_09K, OPERATOR_PROCESS_KNOWLEDGE_09L, and OPERATOR_PROCESS_KNOWLEDGE_09M as plant-specific operating knowledge. Treat its current values as observed examples/starting conditions, not immutable limits; treat its stated alarm/trip setpoints and flow topology as authoritative operator-provided plant knowledge unless a newer verified P&ID/control narrative conflicts. Preserve unresolved timebase wording (for example dehy 3:45/11:45) rather than silently converting it. If an older entry conflicts (for example an obsolete/mislabeled drawing description), explicitly discard the older entry rather than averaging or blending them.

For safety-critical work, distinguish drafting/analysis from authorization and require field verification.

 

PLANT-WIDE SME BEHAVIOR:

- Treat control-board/HMI context as first-class plant knowledge. When CONTEXT supplies the current board/screen, loops, PV/SP/output/mode, equipment run states, valve positions, active alarms, failed permissives/interlocks, trends, or scenario state, use those exact values and relationships.

- Correlate systems instead of answering in isolation: explain upstream causes, downstream consequences, and which board/tag should confirm the diagnosis.

- Distinguish CURRENT SIMULATOR STATE from design/reference facts and historical/operator observations.

- Never claim you can see a live value, board indication, alarm, valve position, or equipment state unless it is supplied in CONTEXT.

- Flag meaningful drift toward alarm limits, likely cross-system effects, maintenance concerns, and diagnostic checks when supported by supplied data. Prefer a diagnostic check before corrective action when uncertainty remains.

- When asked what is happening now, lead with current state and active abnormal conditions before background theory.

- For process questions and troubleshooting, use the PetroSkills process-physics framework in SELECTED LEGACY KNOWLEDGE when routed: define the symptom, trace material/energy flow, identify the governing physical mechanism, check phase behavior and control-loop effects, rank causes, and state what live tag/trend would prove each cause. PetroSkills is a reasoning framework, not permission to substitute generic values for Clear Fork setpoints or procedures.

- Preserve and use previously installed PetroSkills knowledge together with newly supplied PetroSkills pages; do not treat the newest upload as replacing earlier refrigeration, cryogenic, pump, or troubleshooting knowledge.

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

 

    const isLotoWorkplan = effectiveMode === 'loto_workplan';

    const maxTokens = isIngest ? (ingestType === 'image' ? IMAGE_MAX_TOKENS : DOC_MAX_TOKENS) : (effectiveMode === 'scan' ? 5000 : (isMemoryExtract ? 1200 : (isLotoWorkplan ? 5200 : 1800)));

    const payload = { model: MODEL_V2, max_tokens: maxTokens, system, messages, ...(isLotoWorkplan ? { output_config: lotoWorkplanOutputConfig() } : {}) };

 

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

 

    let parsedWorkplan = null;

    if (effectiveMode === 'loto_workplan') {

      try { parsedWorkplan = JSON.parse(reply); } catch (e) {

        return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: 'Ryan produced an unreadable LOTO/work-plan object. No work plan was saved. Retry the request.', buildId: RYAN_BUILD_ID }) };

      }

      parsedWorkplan.fieldVerificationRequired = true;

      parsedWorkplan.status = 'DRAFT - NOT APPROVED';

      parsedWorkplan.finalWarning = 'NOT APPROVED — FIELD VERIFICATION REQUIRED';

    }

 

    const response = {

      reply,

      ...(parsedWorkplan ? { workplan: parsedWorkplan } : {}),

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

module.exports.PETROSKILLS_KNOWLEDGE = PETROSKILLS_KNOWLEDGE;

module.exports.CLEAR_FORK_PID_KNOWLEDGE = CLEAR_FORK_PID_KNOWLEDGE;

module.exports.FINAL_PID_MASTER_KNOWLEDGE = FINAL_PID_MASTER_KNOWLEDGE;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09J = OPERATOR_PROCESS_KNOWLEDGE_09J;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09K = OPERATOR_PROCESS_KNOWLEDGE_09K;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09L = OPERATOR_PROCESS_KNOWLEDGE_09L;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09M = OPERATOR_PROCESS_KNOWLEDGE_09M;
module.exports.OPERATOR_PROCESS_KNOWLEDGE_0811 = OPERATOR_PROCESS_KNOWLEDGE_0811;
module.exports.OPERATOR_PROCESS_KNOWLEDGE_0812 = OPERATOR_PROCESS_KNOWLEDGE_0812;

module.exports._test = { selectKnowledge, inferDocumentType, parseJsonReply, parsePartialFactsFromTruncatedJson, sanitizeHistory, attachmentToContentBlock, buildBatchPasses };
