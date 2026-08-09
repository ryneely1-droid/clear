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

const RYAN_BUILD_ID = 'RYAN-2026-08-09H';

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

 

const KNOWLEDGE_REGISTRY = {

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

};

 

const KNOWLEDGE_ROUTING_RULES = [

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

For Clear Fork P&ID questions, prefer FINAL_PID_MASTER_KNOWLEDGE and newer verified drawing facts over older simulator notes. If an older entry conflicts (for example an obsolete/mislabeled drawing description), explicitly discard the older entry rather than averaging or blending them.

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

module.exports._test = { selectKnowledge, inferDocumentType, parseJsonReply, parsePartialFactsFromTruncatedJson, sanitizeHistory, attachmentToContentBlock, buildBatchPasses };
