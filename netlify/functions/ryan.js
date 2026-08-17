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

    plantApplicability: 'Plant/order-specific OEM documentation for the Clear Fork EX-1121/C-1121 turboexpander/booster package. Re-verified 2026-08-15 against the complete 254-page Atlas Copco manual uploaded by the operator.',

    equipmentIds: ['EX-1121','C-1121','EX/C-1121'], manufacturer: 'Atlas Copco Gas and Process / Mafi-Trench',

    model: 'Expander Compressor (Oil Bearing), Frame 3.0', verificationStatus: 'VERIFIED',

    source: 'Atlas Copco Mafi-Trench Instruction Manual, Order 1039, Machine EX/C-121, built 2018, customer order 5972241, Ref. US-107468',

    sourceScope: 'Complete instruction manual including safety, erection, operating instructions, plant description, technical data, maintenance, drawings, control-system setpoints and recommended spares. OEM values below are reference limits/setpoints from the delivered package documentation; current DCS values and approved plant procedures still govern live operation.',

    identity: {
      machine: 'EX/C-121',
      order: '1039',
      frame: 'EC 3.0 / Frame 3.0',
      bearingType: 'Oil bearing',
      built: 2018,
      customerReference: 'US-107468',
      nameplate: { maxPowerHP: 3700, ratedRPM: 27000, flowSCFH: 6900000, fluid: 'Natural gas', expanderMaxPressurePSIG: 1100, compressorMaxPressurePSIG: 675 }
    },

    designAndConstruction: [
      'Three principal sections: expander, rotating assembly, and compressor. Expander and compressor are mechanically coupled on one shaft but have separate process gas paths.',
      'IGVs are pneumatically actuated with an integral positioner and regulate expander mass flow. The OEM description gives an approximate 0-125% flow capability; IGVs do not seal gas-tight because mechanical stops leave a small tip gap.',
      'Hydrodynamic radial/thrust bearings use embedded RTDs. Low bearing temperature can be used as a prevent-start condition; high bearing temperature is alarm/trip protected.',
      'The shaft is designed to operate below first bending critical speed. Wheels are retained on tapered shaft ends with a center stretch rod.',
      'Labyrinth shaft seals minimize process-gas leakage. A replaceable stainless rotating labyrinth is paired with a sacrificial stationary element intended to wear first if contact occurs.',
      'Automatic Thrust Equalizer uses opposing thrust-pressure signals and a spool/gate arrangement to regulate pressure behind the compressor wheel and reduce rotor thrust.',
      'Minimum inlet screen guidance is 30 mesh upstream of both expander inlet and compressor inlet. Exact installed screen configuration remains subject to Clear Fork drawings/field verification.'
    ],

    controlSetpoints: {
      sealGasDifferential: { normalPSID: 50, alarmLowPSID: 30, tripLowPSID: 20, tags: 'PT-101/PT-102 -> PDI-101' },
      lubeOilDifferential: { normalPSID: 150, alarmLowPSID: 110, tripLowPSID: 90, tags: 'PT-106/PT-107 -> PDI-106' },
      lubeOilFilterDP: { normalPSID: 5, alarmHighPSID: 35, tags: 'PT-107/PT-108 -> PDI-108' },
      lubeOilSupplyTemperature: { normalF: '90-130', alarmHighF: 130, controlTargetF: 110, tag: 'TE-105 / TCV-101' },
      lubeOilReservoir: { normalLevelInAboveDeckplate: '28-30', alarmLowInAboveDeckplate: 21.3, resetInAboveDeckplate: 22, heaterControlF: 90, heaterElementOvertempF: 225 },
      expanderThrustDP: { normalPSID: '0-50', alarmHighPSID: 150, tripHighPSID: 300 },
      compressorThrustDP: { normalPSID: '0-50', alarmHighPSID: 150, tripHighPSID: 300 },
      expanderBearingTemperature: { preventStartLowF: 60, normalF: 150, alarmHighF: 190, tripHighF: 200 },
      compressorBearingTemperature: { normalF: 150, alarmHighF: 190, tripHighF: 200 },
      vibration: { normalMils: 0.5, alarmHighMils: 1.0, tripHighMils: 1.6, expanderTags: 'VT-101A/B', compressorTags: 'VT-102A/B' },
      speed: { normalRPM: 24300, alarmHighRPM: 28400, tripHighRPM: 29800, tag: 'SE-101' },
      surgeControlReference: { K: 0.425, setpointPercent: 78, designFlowACFM: 7608, designRPM: 24300, molecularWeight: 16.38, Z: 0.98, inletTemperatureRankine: 578 },
      regulatorsAndRelief: { sealGasPDCV101PSID: 50, lubeOilPDCV102PSID: 150, lubeOilTCV101F: 110, PSV101PSIG: 675, lubePumpRV101PSID: 260, instrumentAirPR300PSIG: 65, accumulatorsA101A102PrechargePSIG: 200 }
    },

    startupSequence: [
      'After a standstill longer than 7 days, perform checks in the same manner as initial commissioning.',
      'Verify control power ON; keep IGVs closed and in LOCAL initially.',
      'Establish dry seal gas first. Purge housings/drains and pressurize expander housing, compressor housing and lube-oil reservoir progressively and approximately together. Do not exceed 50 psid differential between housings during pressurization.',
      'When compressor housing pressure is nearly equal to compressor inlet piping pressure, open compressor inlet block valve; when expander housing pressure is nearly equal to expander discharge piping pressure, open expander discharge block valve.',
      'Before lube-oil pump start: power available, valves in correct lineup, lube-oil heater target 90 F, reservoir oil at least 70 F, and seal/separation gas differential established. Start with return bypass open and close gradually after pumps have run to avoid collapsing filters.',
      'OEM D12 sequence: start both lube pumps on HAND, establish 90-110 F inlet oil, confirm pressure, then place one pump in AUTO standby.',
      'Clear alarms/shutdowns, verify IGVs closed, open required block valves, then use EXPANDER START to open the inlet trip valve. Gradually open IGVs while continuously monitoring machine and auxiliary instruments so the housings reach thermal equilibrium gradually.',
      'Compressor recycle/anti-surge should be open at startup and remain available to prevent surge until sufficient compressor flow is established.'
    ],

    shutdownSequence: [
      'Controlled shutdown: move HIC from REMOTE to LOCAL and slowly close IGVs. The plant control system should transfer flow toward the JT path as expander flow decreases.',
      'Once IGVs are closed, stop the expander to close the expander inlet shutdown valve. Surge control valve should move fully open when the turboexpander stops.',
      'Coastdown to near zero should occur in about 10-15 seconds. Confirm stop using tachometer and vibration indication, then isolate expander inlet and compressor discharge to prevent wind-milling.',
      'For a short outage of roughly one or two hours, lube-oil pump and seal gas may remain in service with the expander discharge block valve left open, subject to the approved plant procedure.',
      'For full depressurization: secure lube pumps and seal gas, close inlet/discharge block valves, and bleed casing pressure slowly. OEM guidance says depressurization should take about an hour rather than a few minutes to avoid forcing lube oil into the compressor housing.'
    ],

    troubleshooting: [
      'High oil temperature: verify oil-cooler fan, verify TCV/cooler bypass operation, and check reservoir oil viscosity for condensate dilution. Ambient-temperature effects can cause some normal oil-temperature movement.',
      'Unbalanced thrust toward expander bearing: possible washed expander wheel seal or plugged expander wheel relief holes. The manual links plugged relief holes to saturated/inoperative upstream dehydration and calls for warm-process-gas thawing; washed seal requires OEM assistance.',
      'Unbalanced thrust toward compressor bearing: possible washed compressor wheel seal associated with excessive compressor temperature; contact OEM Aftermarket.',
      'Frozen seal-gas line: seal-gas pressure or temperature too low can allow process gas to back into the seal-gas line. Check regulator and correct seal-gas pressure/temperature.',
      'Cold oil-drain temperature: low seal-gas pressure may allow cold process gas into the bearing housing; correct seal-gas differential and then verify oil temperature response.',
      'Compressor surge: insufficient compressor-inlet flow. Keep/open compressor recycle until adequate flow is restored. OEM notes tachometer oscillation around 150-200 RPM every 4-6 seconds as a surge symptom and warns prolonged surge can damage bearings.',
      'Large pressure drop across the trip valve or inlet screens reduces turboexpander performance. Treat rising DP as a real process/mechanical constraint, not merely an indication issue.'
    ],

    operatingAndMaintenanceGuidance: [
      'Protect the expander inlet from liquids, dust/sand, hydrates, welding slag and other construction contamination. This is an explicit OEM protection requirement.',
      'Seal gas has two key duties: keep cold/unclean process gas away from bearings and keep lube oil out of the process stream. A dry external seal-gas supply is required during startup and normal operation.',
      'Dual lube-oil filters use continuous-flow switching so one element can be changed without shutting down. Seal-gas filters may be changed online only if the installed system is the dual-filter arrangement.',
      'Lube-oil accumulator(s) maintain bearing oil during pump switchover/loss. Charge with dry nitrogen only; air charging is prohibited by the OEM because of explosion risk.',
      'Oil viscosity matters directly to hydrodynamic bearing behavior: too high can run bearings hot, too low weakens oil-film stiffness and can increase shaft vibration. OEM states viscosity down to 20 cSt at 100 F may be acceptable if vibration remains within recommended limits.',
      'OEM recommended viscosity checks after startup: 1 week, 4 weeks, 8 weeks, then at plant discretion. Initial fill recommendation remains plant-specific and should not be guessed.',
      'The OEM manual does not replace Clear Fork LOTO/permit procedures. Most maintenance requires the unit stopped, isolated and depressurized; electrical work requires local lockout/tagout.'
    ],

    monitoringCadence: {
      startup: 'Record operating parameters hourly for the first four hours after startup.',
      normal: 'Prefer once per shift thereafter; OEM minimum is daily.',
      parameters: ['expander inlet/discharge pressure','compressor inlet/discharge pressure','expander inlet/discharge temperature','compressor inlet/discharge temperature','process gas flow','seal-gas pressure and temperature','oil pressure and temperature to bearings','oil drain temperature','speed','vibration','thrust pressures']
    },

    recommendedSparesAndInstrumentation: [
      'Recommended spares include the spare rotating assembly, expander/compressor wheels and bearings, shaft seals, vibration pickups/transmitters, tachometer pickup, ATE rebuild kits, lube-oil and seal-gas filter elements, PSV/relief components, RTDs/temperature sensors, pressure transmitters, PLC I/O/CPU/power modules, and special assembly tools.',
      'RSPL identifies Fisher Type 585C Size 50 actuator package associated with PV-101/ZT-101/PR-300 and includes a smart positioner, feedback transmitter and filter regulator.',
      'Do not infer currently installed part revision solely from the 2018 RSPL when field replacements may have occurred; verify actual installed component/nameplate before ordering.'
    ],

    keyOEMFacts: [
      'This uploaded 254-page manual matches the already identified Order 1039 / Machine EX/C-121 source and therefore confirms, rather than conflicts with, the existing Clear Fork expander mapping.',
      'Use the detailed OEM alarm/trip/reference values above for Ryan troubleshooting and cross-checking, while current DCS indication, current approved setpoints and current operating procedures remain higher priority for live operations.',
      'For plant-specific operating questions, combine this OEM source with Clear Fork P&IDs, current control-board indications, operator-confirmed topology and the newest live snapshot. Never replace a newer verified plant value with an older design-case number from the OEM data sheets.'
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

const RYAN_BUILD_ID = 'RYAN-2026-08-17CD';
const RYAN_DIAGNOSTIC_REVISION = 'CF-DIAG-12CA-20260815';
const RYAN_SOURCE_BASELINE = 'operator-uploaded-08-11A';
const NETLIFY_BUFFERED_PAYLOAD_BYTES = 6 * 1024 * 1024;
const NETLIFY_SAFE_BINARY_BYTES = 4 * 1024 * 1024;

const RYAN_CODE_SIGNATURE = 'CF-RYAN-12CD-PETROSKILLS-KNOWLEDGE-20260817';

const OPERATOR_NGL_HYDRAULICS_12AU = [
  'Operator-confirmed NGL product-pump point (8/12/26 late shift): with product export established, FT-1422 is about 406 GPM after the pumps, FIT-1630A is about 285 GPM and fluctuating, and FIT-8000A is about 335 GPM.',
  'At that same point PCV-1624 is 100% open, PCV-1623 is about 1.5-2% open, and FCV-1422 recycle is 0% open. PIT-8000B is about 918 psig while pumping/exporting and falls toward about 850 psig when not pumping.',
  'PCV-1623 is governed by the LIC-1422B / PIC-1623 pair. Current LIC-1422B: SP 5%, PV 29.1%, CV 100%. Current PIC-1623: SP 1000 psig, PV 1012 psig, CV about 1.5%. Treat the more restrictive controller demand as the active valve demand unless verified selector logic says otherwise.',
  'PCV-1624 is governed by the LIC-1422C / PIC-1624 pair. Current LIC-1422C: SP 30%, PV 29.1%, CV 100%. Current PIC-1624: SP 980 psig, PV 1004 psig, CV 100%. Treat the more restrictive controller demand as the active valve demand unless verified selector logic says otherwise.',
  'The four controller readings are operator-observed live values, not universal tuning constants. Ryan must preserve them as a calibration point and distinguish observed behavior from any inferred selector/control action.',
  'Do not confuse PIT-8000A/PIT-8000B pressure tags (psig) with FIT-8000A flow (GPM).'
];

const RYAN_CHANGESET_12BF = Object.freeze([
  '12CA REFERENCE/EXPANDER UI FIX: PetroSkills exact source PDFs are served from the frontend Reference Library as original documents; Ryan keeps the installed process/OEM knowledge. Expander HIC-101 MAN/AUTO and +/- controls now use explicit browser event listeners in the matched frontend. ',
  '12BY EXPANDER OEM FULL-MANUAL PASS: re-verified Atlas Copco Mafi-Trench Order 1039 / Machine EX/C-121 against the complete 254-page operator upload and expanded Ryan with package identity, nameplate limits, control-system setpoints, startup/shutdown, seal-gas/lube-oil behavior, thrust/vibration/speed protection, troubleshooting, monitoring cadence and spare/instrument references. No credential/passcode data is retained.',
  '12BV PETROSKILLS STUDY PACK: installed operator-supplied PetroSkills Mechanical Refrigeration pp.25-55 to 25-61 and Gas Expansion NGL Recovery / Cryogenic Plant Operations pp.22-50 to 22-67 as verified generic training references. Ryan must use them for refrigeration/cryo physics and troubleshooting while Clear Fork P&IDs, approved procedures, OEM requirements and verified plant knowledge retain priority.',
  '12BX PETROSKILLS PUMP STUDY PACK: installed operator-supplied PetroSkills Centrifugal Pumps pp.11-3 to 11-37 covering construction, head/pressure, NPSH/cavitation, performance curves, startup/control, minimum-flow recycle, troubleshooting and positive-displacement/vacuum pump fundamentals. Generic training reference only; Clear Fork and OEM sources retain priority.',
  '12BJ CONTROL-BOARD FLOW CLEANUP: corrected the dehy sequence everywhere to V-1410 -> F-1412 -> active mol-sieve beds V-1413/V-1414/V-1415 -> F-1416/F-1417; corrected the Utilities seal-gas source label to F-1438 -> E-1227; kept F-6800 limited to its verified dryout/regen, inlet-recycle, F-1438 and main sales takeoffs. Hot-oil topology was intentionally left unchanged. Stabilizer truck-loading detail is intentionally out of scope.',
  '12BI V-1040 INLET FEED CONFIRMATION: operator confirmed 2026-08-15 that V-1040 is the main inlet-gas feed to the C-4100/C-4200 inlet compressors. Preserve V-1040 -> PIT/TIT/FIT-1045A -> common inlet-compressor suction header. The compressor discharge after AC-4101/AC-4201 goes to V-1410/F-1412/dehydration; never route compressor discharge back into V-1040.',
  '12BH EQT FLOW-PATH TRAINING AID: incorporated the operator-supplied Clearfork colour-coded process-flow training aid dated 2026-08-15 as TRAINING_AID_NOT_CONTROLLED. It is used for plantwide flow orientation and reconciliation, never to override an issued P&ID/control narrative. Corrected the explicit F-6800 branch summary: seal gas to E-1227 comes from F-1438, not directly from F-6800.',
  '12BG DOCUMENT LEARNING REPORT: after PDF/P&ID/manual/image ingestion, every retained extracted fact is returned to the operator in numbered chat-style parts. Display chunking never controls retention; facts are persisted first, then reported. Duplicate sources still do not create duplicate facts.',
  '12BG RETENTION CAPACITY: browser learned-fact storage cap raised to 5000 extracted atomic facts per learned-source run; source/page/classification metadata remains attached to every retained fact.',
  '12BF EXPANDER CURRENT CORRECTION: normal running condition has EX-1121 IGV taking the cold-separator vapor and PCV-1121A JT pinched near 0%; as IGV opens, JT closes. If EX-1121 is lost, IGV walks toward 0 while JT ramps quickly but not instantaneously toward about 80%.',
  '12BF EX-1121 LIVE SNAPSHOT: PT/PIC-1121E about 249 psig, PT-1121B about 875.6 psig, PT-1121A about 241.43 psig, SE-1121 about 24,030 RPM, TE-1121D about -85.70 F, PT-1121D about 249 psig, TE-1421A cold-separator outlet about -7 F, and lube-oil differential about 152 PSID with small normal fluctuation. PT-106/107 alarm low 110 and trip low 90 PSID.',
  '12BF BOOSTER/EXPANDER TOPOLOGY: EX-1121 discharge goes to T-1521 and never through A-1321. Only C-1121 booster discharge goes through A-1321. Booster anti-surge recycle comes off downstream of A-1321, passes FCV-1211A (currently about 0% open), and returns to the common C-1121 suction header.',
  '12BF RED TAG: EX-1121/C-1121 red tag blocks restart from both the board START button and the ACMTC controller after the machine is stopped.',
  '12BF GC OPERATING ENVELOPE: current shift reports show roughly 221-225 MMSCFD, demeth bottoms about 166.2-170.4 F, and NGL ethane about 0.51-0.76%; use roughly 0.6-0.65% C2 near 220-224 MMSCFD and ~168 F as the local calibration, not a permanent constant.',
  '12BF REGEN/DEHY ROUTING: dry-out branch through PV-6805A/PIT-6805A continues rightward to REGEN GAS DRY OUT TO INLET COMP; dead-ended elbow remnants are not real process piping.',
  '12BE CURRENT EX-1121 OPERATING SNAPSHOT: PT-1121E/PIC-1121E PV ~249 psig; PT-1121B ~875.6 psig; PT-1121A ~241.43 psig; SE-1121 ~24,030 RPM; TE-1121D ~-85.70 F; PT-1121D ~249 psig; TE-1421A from the cold separator ~-7 F. Expander and C-1121 booster share a shaft but their gas paths are separate; only the C-1121 compressor stream goes through A-1321.',
  '12BE EXPANDER TRANSIENT: normal IGV control is AUTO. Startup is MANUAL, ramp IGV to about 20%, then transfer to AUTO. On expander loss the IGV walks toward 0 while PCV-1121A JT opens rapidly but not instantaneously toward about 80%, preserving tower flow with reduced refrigeration efficiency/recovery.',
  '12BE GC FIELD CALIBRATION: current plant reports around 220 MMSCFD and about 168 F demeth bottoms with NGL GC C2 around 0.64%. Treat this as an operator-observed calibration envelope, not a permanent constant; C2 still responds to bottoms heat, tower pressure, throughput, JT/expander share, reflux quality and dehy condition.',
  '12BE DOCUMENT DUPLICATE POLICY: when the exact same PDF/image content has already been fully learned, report it as a duplicate and add no duplicate facts. If a prior ingestion was incomplete, allow a retry rather than treating it as complete.',
  '12BC EXPANDER/COLD-SECTION CALIBRATION: cold-separator vapor has three parallel paths (E-1222 reflux, PCV-1121A JT, XV-1121B/EX-1121); current expander instrumentation is PDT-1121B 3.4 PSID, PT-1121B 876.7 psig, TE-1121D -85.7 F, PT-1121D 249 psig; PDT HI 5 / HIHI EX shutdown 15.',
  '12BC PIC-1521D SPLIT CONTROL: JT faceplate SP 265/PV ~264 and EX faceplate SP 268/PV ~265/CV 100%; EX SP range 225-350 psig. Once IGV is saturated, additional pressure/throughput demand recruits PCV-1121A; current JT near 0% during the current high-IGV operating condition, extreme 350-psig example calibrates near 50% JT and roughly 240-245 MMSCFD. Compressor load steps remain preferred rate control.',
  '12BC TURBOEXPANDER PHYSICS: Atlas Copco principle retained as OEM/general support—IGVs meter expander flow, expansion work drives the common-shaft booster compressor, and turboexpansion provides stronger cryogenic refrigeration/liquid recovery than simple JT pressure letdown. Clear Fork HMI/operator values govern plant-specific behavior.',
  '12BD EXCHANGER SPLIT HOTFIX: TCV-1221 current 100%, TCV-1223 current 24%; each operator click is exactly 1.00 percentage point. The obsolete second/legacy TCV click handler was removed so it cannot corrupt the active split state. Additional 1221-open demand above 100 spills to 1223. Once 1223 exceeds 50%, it progressively pinches 1221 to a protected 10% minimum. TIC-1224B current 63/62.9/12.97 and TDIC-1224B 20/45/100.',
  '12BC ALARM HISTORY: ACK no longer implies deletion; chronological alarm/event history retains first-in, acknowledgement, clear/reset, duration, recurrence and alarm/trip/ESD/event type for trend review.',
  '12BC E-5000 HOT OIL: TV-5005A is physically on the hot-oil supply to the stabilizer inlet preheater; TIC-5000D current SP 80 F, PV 85.9 F, CV 0% MAN. In AUTO, PV above SP drives the valve open; hot-oil return leaves the exchanger bottom.',
  '12BB LEARNED-DOCUMENT RETRIEVAL: ordinary questions never resend an already-learned P&ID; the browser sends only a small ranked set of retained facts.',
  '12BB DOCUMENT SUMMARY: what-did-you-learn questions can be answered directly from the local retained-fact index without another Anthropic/Netlify round trip.',
  '12BA P&ID EXTRACTION FIX: structured JSON extraction requests never enable document citations; source/page provenance is stored in extracted fact metadata instead, avoiding Anthropic citations + output_config incompatibility.',
  '12AZ DOCUMENT RELIABILITY: removes Message Batches from the interactive learning path; PDFs/P&IDs are uploaded once then processed one pass per normal Messages API request so the UI cannot sit in batch in_progress indefinitely.',
  '12AZ PARTIAL SUCCESS: each P&ID/manual pass has its own result, timeout/error state and retained facts; one failed pass does not discard successful passes.',
  '12AZ IMAGE LEARNING: images use a single fast structured vision extraction instead of background batches, with a bounded request timeout and visible completion/failure.',
  '12AZ TIMEOUT DISCIPLINE: upstream requests time out before Netlify inactivity limits so Ryan returns a useful error instead of an HTML 504.',
  'Simple chat defaults to a fast, attachment-free route to avoid Netlify inactivity timeouts.',
  'Selected documents are attached to chat only when the operator explicitly asks about the attachment or invokes a document/LOTO workflow.',
  'Local PDF/P&ID selection and drag/drop do not require HTTPS.',
  'P&ID learning explicitly performs visual linework/tag/symbol inspection for scanned drawings.',

  '12AX CONVERSATION CONTINUITY: Ask Ryan now preserves recent chat context locally, provides a dedicated follow-up composer, and resolves short follow-ups such as why, what next, or compare that against the immediately preceding subject instead of treating each turn as isolated.',
  '12AX THREAD UX: assistant responses expose quick follow-up prompts and the follow-up composer sends with Enter (Shift+Enter for newline), scrolls to the newest answer, and keeps tool-button results in the same conversation thread.',
  '12AX CONTEXT DISCIPLINE: backend conversation history is expanded but bounded; prior turns are used for referents and continuity while current live plant state remains authoritative and stale prior live values are not silently reused.',
  '12AX RELIABILITY AUDIT: retains 12AW blank-answer recovery, six-pass generic-PDF / seven-pass P&ID learning, attachment-description classification, ingestion-failure diagnostics, and large-source Send/drop support.',

  '12AT VERIFIED NGL PUMP STAGING: one P-1619/P-1620 boost pump supplies the suction of the operating P-1630/P-1635 pipeline pump. A pipeline pump must not run without a boost pump running; loss of the booster stage removes the pipeline-pump run permissive / requires the pipeline stage to stop.',
  '12AT VERIFIED NGL CIRCULATION: while the boost + pipeline train is running, liquid is always moving. Depending on outlet acceptance, the common discharge is (1) all recycle back to V-1422, (2) split between recycle and the sales pipeline, or (3) all sales-pipeline flow with recycle closed. As sales outlet capacity opens, recycle closes correspondingly.',
  'General pump-engineering support: centrifugal/high-head pump systems commonly use minimum-flow recycle to keep a running pump above minimum stable flow; series pumps add head and each stage requires adequate suction/NPSH. Treat Clear Fork P&IDs, HMI/interlocks and operator observations as authoritative for the exact permissives and valve logic.',
  '12AU NGL selective-control calibration: current established export is FT-1422 ~406 GPM, FIT-1630A ~285 GPM fluctuating, FIT-8000A ~335 GPM, PIT-8000B ~918 psig, FCV-1422 0%, PCV-1624 100%, PCV-1623 ~1.5-2%. PCV-1623 is associated with LIC-1422B/PIC-1623 and PCV-1624 with LIC-1422C/PIC-1624; preserve the observed controller values and do not invent unverified selector details.',
  '12AU verified outlet flow permits: PY-1623 and PY-1624 each require FT-1422 >291.50 GPM for initial opening and each interlock its associated PCV closed below 265.00 GPM; hold prior permit state inside the 265.00-291.50 GPM deadband.',
  '12AI is a material Ryan architecture upgrade built from the verified 12AC physical backend baseline.',
  'Adds a Clear Fork cryogenic expert engine: dependency reasoning, trend-aware diagnosis, cause/effect forecasting, equipment health, maintenance prediction, provenance discipline, and instructor scenarios.',
  '12AM retains operator decision support: What Changed chronology, current-vs-normal comparison, bad-instrument-vs-bad-process discrimination, startup/shutdown readiness checks, concise operator-first answers, and explicit diagnostic confidence.',
  '12AM keeps the verified Ryan exchanger/reboiler expertise while preserving the older HMI flow-through lines for real exchanger passes; the false duplicate upper GSP/C2 return is removed, PDCV-1222B is physically connected, and FFIC-1222/FCV-1222 stay on the single lower GSP + LCV-1421B return to T-1521.',
  'Generic process questions now use Ryan built-in process knowledge by default; internet search is invoked only when the operator explicitly asks to research, look up, verify, cite, source, web-search, or get latest/current external information.',
  'Backend rebuilt from the operator-supplied 11A Ryan source and carried forward through 12Y.',
  'Active troubleshooting policy is injected into Q&A/recommendation requests and ranks causes with proof tags/trends.',
  'Residue compressor topology guard: EX/C-1121 is the common suction source; F-6800 recycle returns through PV-6050A/PIT-6050B/XV-6060/PIT-6050C to that common suction header, not directly to C-6200.',
  'Demeth return temperatures: RSV return TE-1222K observed -146.90 F and GSP return TE-1222D observed -146.20 F.',
  'Large-document learning supports asynchronous multi-pass P&ID/manual ingestion through Anthropic fileId or HTTPS sourceUrl to avoid Netlify request-size limits.',
  'Health response exposes build, diagnostic revision, code signature, and change set so stale Netlify deployments are obvious.',
  'Fast-path routing keeps generic process questions out of the full Clear Fork plant context to reduce latency and token use.',
  'Optional Anthropic web-search tool is enabled for generic technical research requests while Clear Fork plant facts remain source-priority.',
  'Conversation history is bounded and compact for performance; 12AX defaults to ten recent messages so short follow-ups retain enough local context without flooding the request.',
  'Large P&ID learning uses seven specialized passes; manuals use six passes; Ryan can retain up to 5000 extracted facts per learned-source run in the browser knowledge store, with page/tag indexing for retrieval.',
  'Multi-digit Clear Fork tag detection is authoritative before generic fast-path routing so tags such as PV-6050A and PIC-1441C cannot be misclassified as generic questions.',
  '12AO adds operator-photographed DCS interlock knowledge for ESD-1000D, XV-1410, XV-6810A, XV-4250B, XV-1040B, EX-1121 and PCV-1121E; photographed row order is authoritative and unseen numeric trip setpoints remain PENDING_VERIFICATION.',
  '12AP consolidates the GC display to one lower analyzer panel; V-1040 is one shared vessel on Plant Inlet/Inlet Separation with drain path V-1040 -> XV-1040B -> LCV-1040A -> closed-drain header and LIC-1040A controlling LCV-1040A.',
  '12AQ screen-targeted corrections: FV-5030A is physically on the P-5060/P-5065 return line to T-5030; C-5700 vapor return joins the Plant Inlet header downstream of PV-1010A; E-1125 hot-oil supply reconnects to the trim-reboiler top connection; E-1223 bottom-reboiler process continues to E-1125; E-1241 process gas uses the left bell-end U-pass with TE-1241A upstream of the inlet and outlet returning to V-1421.',
  'V-1040 calibration: LIC-1040A SP 35%, PV 8.7%, LCV-1040A CV 0% open; above SP the controller opens LCV-1040A and below SP closes toward 0%. The physical liquid drain path is V-1040 -> XV-1040B -> LCV-1040A -> closed-drain header. Plant Inlet and Inlet Separation screens represent the same vessel level and same two drain-valve states.',
  'EX-1121 red tag is a restart inhibit: a running expander may be tagged for maintenance planning, but once stopped it cannot restart until the tag is removed.',
  'P&ID ingestion now builds page/tag/continuation indexes plus a LOTO boundary matrix so large drawing sets can be retained and retrieved without inventing isolation points.'
]);
const MODEL_V2 = process.env.RYAN_MODEL || 'claude-sonnet-5';
const FAST_MODEL = process.env.RYAN_FAST_MODEL || 'claude-haiku-4-5-20251001';

const MAX_HISTORY_TURNS = Number(process.env.RYAN_MAX_HISTORY_TURNS || 10);

const MAX_HISTORY_CHARS = Number(process.env.RYAN_MAX_HISTORY_CHARS || 3600);

const MAX_MESSAGE_CHARS = Number(process.env.RYAN_MAX_MESSAGE_CHARS || 24000);

const MAX_CONTEXT_CHARS = Number(process.env.RYAN_MAX_CONTEXT_CHARS || 120000);

const MAX_ATTACHMENT_BYTES = Number(process.env.RYAN_MAX_ATTACHMENT_BYTES || 50 * 1024 * 1024);

const REQUEST_TIMEOUT_MS = Number(process.env.RYAN_REQUEST_TIMEOUT_MS || 22000);

const INPUT_PRICE_PER_MILLION = Number(process.env.RYAN_INPUT_PRICE_PER_MILLION || 2);

const OUTPUT_PRICE_PER_MILLION = Number(process.env.RYAN_OUTPUT_PRICE_PER_MILLION || 10);

const DOC_MAX_TOKENS = Math.max(1600, Math.min(6000, Number(process.env.RYAN_DOC_MAX_TOKENS || 3200)));

const IMAGE_MAX_TOKENS = Math.max(1200, Math.min(5000, Number(process.env.RYAN_IMAGE_MAX_TOKENS || 2400)));

const FACTS_PER_PASS = Math.max(15, Math.min(60, Number(process.env.RYAN_FACTS_PER_PASS || 30)));

const MAX_LEARNED_FACTS = Math.max(200, Math.min(3000, Number(process.env.RYAN_MAX_LEARNED_FACTS || 1800)));

 

 

// ===== PETROSKILLS PROCESS / TROUBLESHOOTING BRAIN KNOWLEDGE =====
// 12CD: full 13-set / 227-page PetroSkills study coverage retained for Ryan; Reference Library presentation is condensed only.

// Expanded 2026-08-09 from operator-supplied PetroSkills pages. These are training/reference principles,

// not plant-specific setpoints. Ryan must combine them with Clear Fork P&IDs, OEM manuals, procedures,

// live simulator context, and operator-confirmed plant knowledge. If a generic PetroSkills rule conflicts

// with a plant/OEM requirement, the plant/OEM source wins and the conflict must be called out.

const PETROSKILLS_KNOWLEDGE = {

  provenance: {

    verificationStatus: 'VERIFIED_REFERENCE',

    sourceFamily: 'PetroSkills gas processing/operator training pages supplied by operator',

    currentSources: [
      '2026-07-29 16-40(2).pdf — PetroSkills Mechanical Refrigeration pp. 25-55 through 25-61: condenser duty, surge drum/makeup quality, refrigeration principles and capacity/condenser control',
      '2026-07-29 16-43(2).pdf — PetroSkills Gas Expansion NGL Recovery pp. 22-50 through 22-67: ethane rejection, cryogenic operations, startup/shutdown, JT operation and troubleshooting',
      '2026-07-29 16-52(2).pdf — Centrifugal Pumps pp. 11-3 through 11-25: construction, impellers/casings, multistage pumps, seal systems, head vs pressure, affinity-law relationships, NPSH/cavitation, pump power and performance curves',
      '2026-07-29 16-55(2).pdf — Centrifugal Pumps pp. 11-26 through 11-37: startup, flow control, low-flow recycle, speed control, routine checks, vapor-lock/low-flow troubleshooting, reciprocating/rotary PD pumps and vacuum pumps',

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

      'Variable speed changes capacity, head and power; use actual pump curves/OEM data for Clear Fork decisions.',
      'Head is energy per unit weight and is not identical to pressure. For comparable conditions, flow changes approximately with speed, head with speed squared, and power with speed cubed; liquid density determines the pressure rise corresponding to a given head.',
      'NPSHA must exceed NPSHR with suitable margin. Low source level or vessel pressure, hotter liquid/higher vapor pressure, suction-line friction/restriction and higher flow reduce cavitation margin.',
      'Multistage pumps add head through successive impellers; axial thrust must be controlled by opposed impellers, balance piston and/or thrust bearing arrangements as designed.',
      'Pump power depends on flow, developed differential pressure and efficiency. Very low-flow operation can convert driver energy into liquid heat, increasing vapor-lock and mechanical-damage risk.'

    ],

    diagnosticPatterns: [

      'Vapor lock signature: discharge pressure approximately suction pressure / little developed differential. Check source vessel level, low pump flow, suction valve restriction, suction obstruction/strainer, and excessive casing heat.',

      'Low flow: calculate/compare discharge minus suction pressure. High differential suggests discharge restriction/high backpressure; low suction pressure suggests source-level or suction-side restriction; low discharge with wear can indicate worn impeller/casing; vapor lock remains a competing cause.',

      'Routine performance check: compare suction pressure, discharge pressure, differential/head and flow against the applicable performance curve and historical baseline; trend decline before failure.',
      'Performance below the expected curve can support wear/internal leakage. High developed differential with low flow supports discharge restriction/backpressure; low suction pressure supports source/suction problems.',
      'Startup proof points from the supplied training pages are liquid-filled/vented casing, developed discharge pressure, normal noise/vibration and acceptable seal behavior; a hot casing can flash incoming liquid and require cooling/venting before stable pumping.'

    ],

    positiveDisplacementPumps: [

      'Reciprocating pumps are positive-displacement devices; speed and bypassing are effective capacity controls and a startup/capacity bypass is required by the generic training configuration.',

      'Suction piping should preserve NPSH and avoid excessive velocity/restriction; pulsation dampening can reduce velocity surge.',

      'Rotary PD pump families include external/internal gear, sliding vane, single/three-screw and progressive cavity; suitability depends on service, viscosity, differential pressure and entrained vapor.',
      'Because positive-displacement pumps keep displacing volume, a safe relief/bypass path is essential; do not treat a throttled/blocked discharge like a centrifugal-pump control method.',
      'Vacuum-service equipment can include ejectors, vane/lobe machines, liquid-ring pumps and Roots blowers; service fluid compatibility, compression ratio and sealing/lubrication requirements determine suitability.'

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

  completeStudyCoverage_20260817: {
    authority: 'COMPLETE_OPERATOR_SUPPLIED_PETROSKILLS_STUDY_SET_REVIEWED_AS_GENERIC_TRAINING_REFERENCE',
    pageCoverage: 227,
    sourceSets: [
      '2026-07-29 16-40(2): Mechanical Refrigeration, 7 pages',
      '2026-07-29 16-43(2): Gas Expansion / Cryogenic NGL Recovery, 18 pages',
      '2026-07-29 16-52(2): Centrifugal Pumps fundamentals, 23 pages',
      '2026-07-29 16-55(2): Pump operation/troubleshooting and PD/vacuum pumps, 13 pages',
      '2026-07-29 17-05(2): Reciprocating Compressors part 1, 15 pages',
      '2026-07-29 17-08(2): Reciprocating Compressors part 2, 10 pages',
      '2026-07-29 17-10(2): Process Drawings, 10 pages',
      '2026-07-29 17-13(2): Phase Behavior Fundamentals, 17 pages',
      '2026-07-29 17-16(2): Mass Transfer Operations, 21 pages',
      '2026-07-29 17-28(2): NGL Stabilization & Fractionation, 26 pages',
      '2026-07-29 17-33(2): Water/Hydrocarbon Behavior & Hydrates, 26 pages',
      '2026-07-29 17-36(2): Solid Bed Adsorbers part 1, 17 pages',
      '2026-07-29 17-38(2): Solid Bed Adsorbers part 2, 24 pages'
    ],
    retentionRule: 'Ryan retains the detailed technical reasoning already extracted from all of these source sets. The operator-facing Reference Library is intentionally condensed for study/navigation, but Ryan must not reduce its internal process knowledge to those shorter summaries.',
    applicationRule: 'Use this complete generic process knowledge to explain mechanisms, correlate symptoms, and audit simulator physics. Verified Clear Fork P&IDs, procedures, OEM manuals, live simulator values, and operator-confirmed plant facts remain authoritative for plant-specific tags, setpoints, permissives, trips, lineups, and maintenance actions.'
  },

  mechanicalRefrigeration_20260729: {
    source: 'Operator-supplied PetroSkills Mechanical Refrigeration, pp.25-55 to 25-61, file 2026-07-29 16-40(2).pdf',
    authority: 'VERIFIED_GENERIC_TRAINING_REFERENCE_NOT_CLEAR_FORK_SETPOINT_AUTHORITY',
    reasoning: [
      'Condenser duty is chiller/process refrigeration duty plus compressor work. Condensing pressure and condensing temperature are linked; lowering practical condensing temperature reduces compressor horsepower and condenser duty, limited by ambient conditions and equipment/control requirements.',
      'Condenser airflow is a primary condensing-pressure control mechanism. Changes in ambient temperature or fan/louver/pitch/speed should propagate into condensing pressure, compressor work and liquid inventory instead of behaving as isolated indications.',
      'The refrigerant surge drum normally runs near mid-level and its indicated level can shift with condensing temperature. Slow loss can reflect normal losses/maintenance; sudden rapid loss supports a leak or refrigerant migration/hang-up investigation.',
      'Light non-condensables such as methane/ethane/nitrogen accumulate on the high side, elevate apparent condensing/discharge pressure and horsepower, and consume condenser area. Heavy/high-boiling contamination can accumulate in the chiller, coat/flood heat-transfer surfaces and force lower suction pressure for the same process temperature.',
      'After equipment is opened, purge/vacuum discipline and maintaining positive chiller/compressor-suction pressure reduce air ingress. Refrigerant makeup quality should be verified; makeup dilutes contaminants most efficiently when system inventory is low.',
      'Chiller pressure establishes refrigerant boiling temperature and therefore process outlet temperature. Chiller level/feed control establishes refrigerant circulation rate needed to match duty; compressor capacity must match the vapor generation rate.',
      'At low refrigeration circulation, compressor minimum-flow/surge protection is required. At high circulation, compressor/driver capacity can become the limiting constraint and may force a higher chiller pressure or reduced circulation, sacrificing process outlet temperature.',
      'For Clear Fork, apply these principles to the verified R-290 loop only after plant-specific valve action, alarms, trips, limits and actual Frick screw-compressor behavior are applied.'
    ]
  },

  cryogenicPlantOperations_20260729: {
    source: 'Operator-supplied PetroSkills Gas Expansion NGL Recovery, pp.22-50 to 22-67, file 2026-07-29 16-43(2).pdf',
    authority: 'VERIFIED_GENERIC_TRAINING_REFERENCE_NOT_CLEAR_FORK_PROCEDURE_AUTHORITY',
    reasoning: [
      'Cryogenic operation balances product quality, production/recovery and operating cost. More recovery is not automatically optimal when residue recompression, reboil/reflux, methanol, downtime or equipment-stress costs exceed the value of added product.',
      'Ethane rejection is a tower heat/pressure/composition problem: generic operation moves toward conditions that drive ethane overhead with residue rather than into NGL. Example values in the PetroSkills pages are illustrative and must never replace Clear Fork setpoints.',
      'Stable feed to the demethanizer is essential. Expander-feed separators should act as surge buffers; overly tight level/pressure tuning can create erratic tower feed. Reboiler temperature response is inherently slow because of equipment and heat-transfer inertia.',
      'Generic total startup after opening/depressuring proceeds through dryout, cooldown on JT, then expander/compressor startup. Seal gas and lube-oil circulation precede admitting/ramping expander flow. Use this only as theory; Clear Fork approved startup/OEM procedure governs execution.',
      'When the expander is unavailable and flow transfers to JT bypass, liquid recovery falls materially, temperatures rise and tower/recompression pressures shift. Stabilization after the transfer can take a long time because cold-box and tower thermal inventories are large.',
      'Normal cryo monitoring should correlate inlet flow/P/T, exchanger temperatures and DP, expander-feed separator P/T/level, JT and IGV/controller outputs, expander DP, seal/lube conditions, brake-compressor suction/discharge, reboiler temperatures, demeth bottom temperature/level, tower pressure/DP and NGL composition.',
      'Freeze-up is a first-line cryo troubleshooting concern. Hydrates and solid CO2 can both create rising DP; dehydration performance, temperatures, pressures and composition determine which mechanism is plausible.',
      'Methanol can help hydrate/ice only when it reaches the restriction; the supplied reference specifically states it does not melt a solid-CO2 plug. Solid CO2 requires approved derime/warming/depressuring strategy, never an improvised plug-clearing move.',
      'A vapor-locked thermosiphon reboiler loses liquid circulation and heat transfer. Look for falling bottom temperature, increasing methane in bottoms, liquid backup, abnormal exchanger temperatures/DP and warm-side gas failing to cool normally before blaming the temperature controller.',
      'Snowballing is a self-reinforcing cold cycle: colder separator/expander conditions create more liquid and colder residue, which increases cold-box chilling and drives conditions colder still. Diagnose reboiler heat and feed split/control before making aggressive expander/JT moves.',
      'The PetroSkills procedures are explicitly generic guidelines. For Clear Fork, exact startup, shutdown, venting, isolation, methanol use, derime and trip-response actions require verified site procedures/P&IDs/OEM documentation.'
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

      'Operator-confirmed 2026-08-12 screen correction: FV-5030A/FIC-5060A belongs on the booster-pump liquid return from the P-5060/P-5065 common discharge header back to T-5030 stabilizer tower; do not describe FV-5030A as a floating or unrelated recycle valve.',

      'Operator-confirmed 2026-08-12 Plant Inlet correction: C-5700 overhead-compressor return joins the common inlet header downstream of PV-1010A before distribution to V-1020/V-1025/V-1030.',

      'Operator-confirmed E-1241 control-board orientation: process gas from E-1221/2 reaches TE-1241A before entering the top nozzle on the left bell end of E-1241, makes the process-side U-pass, exits the lower left-side connection, and continues back to V-1421 cold separator. Refrigerant remains a separate shell-side service and must not be drawn as mixing with the process gas.',

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

const CLEAR_FORK_INTERLOCK_UPDATE_20260812 = Object.freeze({
  source: 'Operator photographs of real Clear Fork DCS interlock popups, 2026-08-12 night shift',
  authority: 'Plant-specific photographed DCS evidence; preserve photographed row order and do not invent unseen numeric setpoints.',
  v1040: { lic1040a: { sp_pct:35, pv_pct:8.7, cv_pct:0, action:'PV above SP opens LV-1040A; PV below SP closes toward 0%' } },
  devices: ['ESD-1000D','XV-1040A','XV-1040B','XV-1410','XV-6810A','XV-4250B','EX-1121','PCV-1121E'],
  lotoRule: 'Interlock popups are control/protection evidence, not isolation lists. Never substitute interlocks for P&ID tracing, energy-source identification, authorized procedure, or field verification.'
});

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

    'Minor bottom/side side: TCV-1223 -> reboilers. Current observed split is TCV-1221 100% / TCV-1223 23%, with most flow on 1221. TIC-1224B SP 63 F, PV 62.9, CV 12.97%; TDIC-1224B SP 20 F, PV 45, CV 100%. Manual valve steps are 1%. Additional TCV-1221 opening demand after 100% transfers to TCV-1223; once TCV-1223 exceeds 50%, it progressively pinches TCV-1221 to a protected 10% minimum.',

    'Bottom/side exchanger inlet: TE-1223A about 98.9 F; PDT-1223A about 4.7 PSID, HI 15, HIHI facility ESD 20; outlet TE-1224C about 2.5 F; then joins gas/gas outlet at common chiller inlet header.'

  ],

  refrigerationColdSepExpander: [

    'Combined header -> TE-1241A about 2.3 F (LOLO -50) -> E-1241 chiller tube side. TE-1241C/TIC-1241C SP -7 F, PV about -7.4, CV 33.79%. PIC-1441C SP 17 psig, PV 16.56, CV 32.39%; PIC-1441A SP 30 psig, PV 16.65, CV 100%. PT-1441C LO 1 psig, HI 30, HIHI 240 and this shutdown is refrigeration-system-only.',

    'V-1421 cold separator: side horizontal gas inlet from chiller; gas leaves top vertically; liquid leaves bottom horizontally. PT-1421 about 893.35 psig HI 1035; TE-1421 about -9.9 F LO -45 HI 12; TE-1421A about -7.4 F LOLO facility ESD -50. LIC-1421 SP/PV 35%, CV about 43%; rising level increases liquid GPM. HIHI level facility ESD; LOLO closes liquid outlet valve only. TCV-1421 cold-spin valve normally stays closed, TIC-1421 SP -30 F, PV about -9.2, CV 0.',

    'Cold-sep vapor splits three ways: E-1222 reflux branch, JT PCV-1121A, and expander. Current expander path XV-1121B -> PDT-1121B 3.4 PSID (HI 5, HIHI 15 expander-only SD) -> PT-1121B 876.7 psig -> EX-1121 -> TE-1121D -85.7 F -> PT-1121D 249 psig -> T-1521. JT path starts near TE-1421A -7 F and current TE-1121A is about -61.6 F. PIC-1521D JT SP 265/PV ~264; PIC-1521D EX SP 268/PV ~265/CV 100%, range 225-350 psig. Current JT is near 0% with the expander/IGV carrying the present load. Raising EX pressure SP can increase tower pressure/throughput and JT share; at an extreme 350-psig example, model JT approaches ~50% and plant throughput ~240-245 MMSCFD, but compressor load steps are the preferred normal rate lever.'

  ],

  demeth: [

    'T-1521 top-to-bottom process order: overhead methane-rich outlet to reflux; RSV return; GSP/reflux return; expander/JT feed; cold-separator liquid; side-reboiler return then side-reboiler draw; bottom-reboiler outlet toward trim; equalization line to V-1422; trim return; NGL bottoms to V-1422.',

    'PT-1521D about 264.7 psig; PDT-1521 about 2.44 PSID, HI 15; PT-1521A about 267.70, HI 425 and HIHI facility ESD 500. TE-1521F about 165.70 and TE-1521E about 166.20, each LOLO -20, LO 0, HI 200. XV-1521 is on NGL liquid outlet to surge tank.',

    'V-1422 surge tank TE-1422 about 162.2 F, LO 0, HI 200. LT-1422A about 29.3%; changing NGL pump speed or level SP changes drawdown. Around 5% LOLO closes outlet ESD. Top receives stabilizer liquid and NGL-pump recycle on a common header.'

  ],

  capacity: ['Normal throughput should be managed primarily with inlet/residue compressor load steps. Operator-observed/high tower-pressure operation can push the model into roughly 240-245 MMSCFD with EX IGV saturated and increasing JT share; this is an extreme operating envelope, not the preferred normal rate-control method.']

};

 

const OPERATOR_PROCESS_KNOWLEDGE_09K = {

  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_09',

  instruction: 'Use these plant-specific flow paths, current observations, alarms and interlocks for Clear Fork troubleshooting/control-board questions. Current readings are observations, not immutable design limits. Do not infer 3D geometry from this 09K batch; the operator explicitly restricted it to control boards and Ryan knowledge.',

  gasGasRefluxGSP: [

    'Corrected 12AM GSP/reflux path: the pre-expander C/EX-1121 branch carries FT-1222-COMP (~35.70 MMSCFD) through PDCV-1222B under PDIC-1222B (MANUAL snapshot SP 2.20 PSID, PV 0.62 PSID, CV 100%). The V-1421 cold-separator-bottoms line downstream of LCV-1421B joins this same lower common return header. That single lower path enters the E-1222 reflux service and continues to T-1521; do not invent a second parallel upper C2-recovery line. FFIC-1222 / FCV-1222 and the associated return temperature indication belong on this real lower return path.',

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

    'The three compressor discharges combine, pass PIT-6050A ~974.4 psig, then F-6800 residue gas filter. The 2026-08-15 EQT colour-coded flow-path training aid (TRAINING AID - NOT A CONTROLLED DRAWING) explicitly identifies three service takeoffs from F-6800: 1040-8-inch dryout/regen gas to dehydration, 1017-10-inch recycle back to the inlet header, and 558-6-inch to F-1438, plus the main residue/sales path. It explicitly states seal gas is NOT sourced directly from F-6800; the 1051-2-inch gas line to E-1227 comes off F-1438. Issued P&IDs remain authoritative if a conflict is found.'

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

    'PIT-1630A ~315.77 psig LO 275 / LOLO 260 product-system SD. PIT-1635A ~316.2 psig LO 275 / LOLO 275 product-system SD. PT-1630B ~944.46 psig, HI/HIHI 1700 product-system SD. FIT-1630A is the combined/common P-1630/P-1635 discharge-header flow. Operator-confirmed 8/12/26: one pipeline pump commonly gives roughly 300 GPM; latest observed calibration is about 285 GPM and fluctuating. LOLO 180 SD, LO 200, HI 375.',

    'Pump demand can be selected LEVEL or FLOW. LEVEL: LIC-1422A SP 30%, PV ~29.08%, CV ~83.17. FLOW: FIC-1422 SP 625 GPM, PV ~381 GPM, CV ~70%.',

    'Common discharge FT-1422 ~376 GPM: LOLO 265, LO 280. Six-inch recycle to V-1422 uses FCV-1422 controlled by FIC-1422A, SP 385 GPM, PV ~377, CV ~68.20; more recycle means less net pipeline flow.',

    'A-1322 NGL product cooler normally cools about 164 F at TE-1422 to about 78.4 F at TE-1322B. TE-1322B HIHI product SD 190 F; TE-1322C HI 135 F. Two cooler fan motors can be red-tagged.',

    'After A-1322, parallel outlet paths use paired level/pressure control. Current observed PCV-1623 pair: LIC-1422B SP 5%, PV 29.1%, CV 100%; PIC-1623 SP 1000 psig, PV 1012 psig, CV 1.5%. Current observed PCV-1624 pair: LIC-1422C SP 30%, PV 29.1%, CV 100%; PIC-1624 SP 980 psig, PV 1004 psig, CV 100%. Ryan must treat the selector/action interpretation as pending verification beyond these observed values.',

    'VERIFIED DCS FLOW PERMITS (photo 8/12/26): PY-1623 permits PCV-1623 to open initially only when FT-1422 > 291.50 GPM and interlocks PCV-1623 closed when FT-1422 < 265.00 GPM. PY-1624 applies the identical thresholds to PCV-1624. Between 265.00 and 291.50 GPM, retain the existing permit state (hysteresis/deadband) rather than chattering the valves. These thresholds are plant-specific verified control logic and override generic theory.',

    'Plant outlet NGL: PIT-8000A is pressure (psig), while FIT-8000A is flow (GPM). Operator-confirmed 8/12/26: with both NGL outlet PCVs closed, FIT-8000A must be 0 GPM because no product is being sent to the sales pipeline. Later established-export calibration: FT-1422 ~406 GPM, FIT-1630A ~285 GPM fluctuating, FIT-8000A ~335 GPM, PIT-8000B ~918 psig, FCV-1422 0%, PCV-1624 100%, PCV-1623 ~1.5-2%. PIT-8000B falls toward ~850 psig when not pumping. PIT-8000A HI 1475 / HIHI 2100; daily NGL totalizer resets every 24 h; FIT-8000A LO 100 HI 900; TIT-8000A ~88.99 F HI 130; PIT-8000N ~863.58 psig; ESD-8000B; PIT-8000F ~846 psig HI 2050 / HIHI 2100; then V-8000 NGL pig launcher and pipeline.'

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

      'P-5060 and P-5065 are controlled from reboiler level: LIC-5060 SP45/PV56.6/CV64; LIC-5065 SP45/PV56.5/CV67. SI-5065 ~0.2% with pumps stopped; FIT-5060 ~0.02 GPM, LOLO62/LO67/HI102.4/HIHI136.4. FIC-5060A controls FV-5030A on the booster-pump return line back to T-5030 (legacy snapshot SP70/PV0.2/CV100; current live values govern). Product passes LV-5040A then XV-5040B to V-1422 or can recycle to V-5010 through XV-5040A.',

      'When the stabilizer unit is not running, suppress nuisance stabilizer process alarms and leave the identified stabilizer controllers in MANUAL/zero output until intentional startup.'

    ]

  }

};

 


// ===== EQT CLEARFORK COLOUR-CODED PROCESS FLOW TRAINING AID — 2026-08-15 =====
const CLEAR_FORK_FLOW_PATH_TRAINING_AID_20260815 = {
  sourceStatus: 'TRAINING_AID_NOT_CONTROLLED_DRAWING',
  source: 'EQT Clearfork Processing Facility — Colour-Coded Process Flow Path, operator-supplied 2026-08-15',
  authority: 'Plant training/orientation aid. The source itself states TRAINING AID — NOT A CONTROLLED DRAWING and instructs users to work from the issued P&ID. Use for plantwide orientation, section-to-section flow direction, service grouping, and reconciliation flags. Never let it override a newer issued P&ID, control narrative, OEM package drawing, or verified live DCS evidence.',
  inletAndDehy: [
    'Operator clarification 2026-08-15 resolves the simplified training-aid ambiguity: V-1040 is the MAIN inlet-gas feed to C-4100/C-4200. Correct plant path is V-1000 -> V-1020/V-1025/V-1030 -> V-1040 -> PIT-1045A/TIT-1045A/FIT-1045A -> common inlet-compressor suction header -> C-4100/C-4200 -> AC-4101/AC-4201 -> V-1410 -> F-1412 -> dehydration. LP gathering gas and approved recycle/dryout streams may also join the compressor suction header as shown by the applicable P&IDs.',
    'Dehydration overview: inlet header -> V-1410 -> F-1412 -> two adsorbing beds among V-1413/V-1414/V-1415 -> F-1416/F-1417 -> dry-gas section 2. Regen gas flows counter to adsorption through the regenerating bed, then A-1311 -> V-1418 -> C-1111 and back toward the inlet/regen header.',
    '12BJ DEHY ORDER: F-1412 is upstream of the mol-sieve beds. The normal process sequence is V-1410 -> F-1412 -> active adsorption beds V-1413/V-1414/V-1415 -> F-1416/F-1417 dust filters. Never place F-1416/F-1417 ahead of the beds in Ryan answers or control-board descriptions.'
  ],
  cryogenicAndDemeth: [
    'Dry gas enters the cryogenic section through E-1221/E-1222 gas/gas + reflux services, E-1223/E-1224 bottom/side-reboiler heat-recovery services, E-1241 propane gas chiller, then V-1421 cold separator. V-1421 vapor goes to EX-1121; C-1121 is the shaft-driven booster and discharges through A-1321 toward residue compression.',
    'T-1521 training-aid tower connections: overhead residue out to E-1222/E-1221; reflux liquid return from E-1222; EX-1121 top feed; JT PCV-1121A to the same feed nozzle when expander is down; V-1421 cold-separator liquid feed; E-1224 side-reboiler draw/return; E-1223 bottom-reboiler draw/return; trim-reboiler sump draw/return; bottoms/Y-grade out.',
    'Training aid labels the trim reboiler E-1225. Current detailed simulator P&ID repository identifies the equipment as E-1125 with TIC-1225. Preserve the detailed P&ID tag unless a newer issued drawing proves otherwise; keep the training-aid label as a reconciliation conflict.'
  ],
  residueAndSales: [
    'Residue path: Section 2 -> C-6100/C-6200/C-6300 -> AC-6101/AC-6201/AC-6301 -> F-6800 -> GC/meter skid -> V-8200 residue pig launcher -> residue/sales gas.',
    'The aid explicitly states THREE SERVICES COME OFF F-6800: 1040-8-inch dryout/regen gas to dehydration (M2105), 1017-10-inch recycle back to the inlet header, and 558-6-inch to F-1438 residue recycle gas filter.',
    'The aid explicitly states seal gas is NOT off F-6800. The 1051-2-inch gas line to E-1227 seal-gas heater comes off F-1438. This corrects older simulator wording that showed E-1227 as a direct F-6800 branch.',
    '12BJ UTILITIES DISPLAY: label the E-1227 seal-gas source as FROM F-1438 RESIDUE RECYCLE FILTER. F-6800 itself must not be shown as a direct E-1227 source.'
  ],
  nglAndStabilizer: [
    'NGL/Y-grade path: T-1521 bottoms -> A-1322 demethanized cooler -> V-1422 demethanizer surge tank -> P-1619/P-1620 product booster pumps -> P-1630/P-1635 NGL pipeline pumps -> V-8000 NGL pig launcher -> NGL pipeline.',
    'Condensate stabilization orientation: slug-catcher liquids -> F-1050/F-1055 -> E-5000 inlet preheater -> V-5010 flash tank -> F-5015/F-5016 -> E-5020 feed/bottoms exchanger -> T-5030 + E-5040 -> AC-5055 -> P-5060/P-5065 booster pumps. Downstream truck-loading detail is intentionally out of scope for the current control-board work.',
    'C-5700 + P-5700 recover V-5010 flash vapor and stabilizer overhead, then compressed vapor returns to Section 1 / plant inlet.',
    'The aid shows AC-5055 upstream of P-5060/P-5065 in the product path. Preserve any verified recycle branch such as FV-5030A separately; do not describe the pumps as only recirculating through AC-5055 back to T-5030.'
  ],
  refrigerationHotOilUtilities: [
    'Propane refrigeration overview: E-1241 -> V-1441 suction scrubber -> C-1140/C-1141/C-1142 -> A-1343A/B/C condensers -> V-1444 accumulator -> V-1442 economizer -> E-1241, with V-1443 refrigerant reclaimer and compressor lube-oil coolers as auxiliaries.',
    'Hot-oil training overview draws H-7100 -> P-7410/P-7420 -> F-7600 -> hot-oil users, with V-7500 expansion tank. Current simulator circulation ordering differs; use M2700/M2710 before changing the modeled loop.',
    'Fuel/seal/dryout/methanol overview groups V-1460 fuel-gas scrubber, fuel-gas header, F-1438 residue recycle filter, TK-1640 methanol tank, P-1629 methanol injection pump, and E-1227 seal-gas heater.',
    'Flare/relief/drain overview: V-8110 compressor-building flare KO -> V-9100 flare KO -> FL-9110 emergency flare; V-1650 cold drain and V-8100 closed drain are separate liquid-drain systems; instrument-air section includes C-9210/C-9220, D-9230, V-9241 and TK-9300 oil.'
  ]
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
      'Slug-catcher liquid routes toward the stabilizer liquid-transfer system; vapor combines before V-1040. V-1040 liquid itself drains through XV-1040B then LCV-1040A to the closed-drain header.'
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
      'V-1040 level controller LIC-1040A controls LCV-1040A. Current calibration SP 35%, PV 8.7%, CV 0%; as PV rises above SP, LCV-1040A opens progressively, subject to XV-1040B being open and closed-drain-header availability. The V-1040 level and drain states are shared across Plant Inlet and Inlet Separation displays.'
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


// ===== CLEAR FORK 2026-08-12 LIVE CORRECTIONS + ACTIVE TROUBLESHOOTING =====
const OPERATOR_PROCESS_KNOWLEDGE_0812Y = {
  sourceStatus: 'OPERATOR_PROVIDED_CLEAR_FORK_CONTROL_BOARD_KNOWLEDGE_2026_08_12',
  priority: 'LATEST_OPERATOR_CORRECTIONS',
  residueCompression: [
    'Main residue-compressor suction is the common header from EX/C-1121. C-6100/C-6200/C-6300 each take separate suction branches from that header.',
    'Filtered residue recycle returns from downstream of F-6800 through PV-6050A -> PIT-6050B -> XV-6060 -> PIT-6050C and then ties into the common EX/C-1121 suction header upstream of all three compressor suction branches. It does not feed C-6200 directly.',
    'Residue compressor discharge piping is separate from suction piping. The three compressor discharges combine into a common discharge header before F-6800.'
  ],
  demethanizer: [
    'RSV return temperature transmitter TE-1222K is on the RSV return line and the current observed value is about -146.90 F.',
    'GSP/reflux return temperature transmitter TE-1222D is on the GSP return line and the current observed value is about -146.20 F.',
    'Current values are observations and must yield to LIVE simulator context when available.'
  ],
  shiftReportCalibration_2026_08_12: {
    sourceStatus: 'OPERATOR_SUPPLIED_SHIFT_REPORTS_8AM_THROUGH_8PM_PLUS_CURRENT_OPERATOR_READINGS',
    interpretation: 'Use as empirical Clear Fork calibration/trend evidence, not design limits. Prefer the newest timestamp for current-state questions and preserve older points as trend history.',
    current_8PM: {
      richInlet_MMSCFD: 222, residue_MMSCFD: 209,
      inletLoadSteps: { C4100:5, C4200:5 }, residueLoadSteps: { C6100:2, C6200:3, C6300:3 },
      inletSuction_psig_report: 438, inletDischarge_psig_report: 947,
      operatorCurrentHigherPrecision: { inletSuction_psig:440, inletDischarge_psig:952, residueSuction_psig:294.2, residueDischarge_psig:982.1, FIT8210A_MMSCFD:208.6 },
      recycleStatus: 'No inlet or residue recycle valves open', JT_pct_open:22,
      RSV_MMSCFD:36, GSP_MMSCFD:36, demethPressure_psig:264, demethOverhead_degF:-91, demethBottom_degF:168,
      coldSeparator_GPM:214, coldSeparator_degF:-7, coldSeparator_psig:867,
      refrigerationSuction_psig:16.3, refrigerationControllerSP_psig:17.0,
      expanderRPM:23730, expanderCompThrustDifferential:99,
      NGL_volume:354, NGL_ethane_pct:0.5, NGL_pressure_psig:900, C3_recovery_pct:97,
      bottomReboiler_TE1223A_degF:95.5, sideReboiler_TE1224B_degF:58.4, sideReboiler_TE1224C_degF:1.8, sideReboiler_TE1224A_degF:-44.8
    },
    dayTrend: [
      '8AM: inlet 223.25, residue 208.72 MMSCFD; inlet steps 5/5; residue 2/3/4; inlet suction/discharge 439.2/960.45 psig; JT 0%; RSV/GSP 32.71/37.24; expander 23980 rpm.',
      '10AM: inlet 223.17, residue 209.32; steps 5/5 and 2/3/3; inlet suction/discharge 439.88/954.28; JT 0%; RSV/GSP 32.38/33.97; expander 23900 rpm.',
      '12PM: inlet 222.79, residue 208.89; steps 5/5 and 2/3/4; inlet suction/discharge 438.75/962.39; JT 0%; RSV/GSP 32.29/36.30; expander 23940 rpm.',
      '2PM: inlet 216.10, residue 204.01; inlet steps 5/4; residue 2/3/3; inlet suction/discharge 439.46/934.46; JT 0%; RSV/GSP 31.79/32.76; expander 23720 rpm.',
      '4PM: inlet 217.53, residue 202.87; inlet steps 5/4; residue 2/3/3; inlet suction/discharge 439.55/934.94; JT 0%; RSV/GSP 32.87/34.30; expander 23660 rpm.',
      '6PM: inlet 223.95, residue 209.47; inlet steps 5/5; residue 3/3/3; inlet suction/discharge 440.14/966.24; JT 0%; RSV/GSP 33.16/34.20; expander 24020 rpm.',
      '8PM: inlet 222, residue 209; inlet steps 5/5; residue 2/3/3; inlet suction/discharge 438/947 reported (operator live precision separately 440/952); JT 22%; RSV/GSP 36/36; expander 23730 rpm.'
    ],
    industryResearchReferences: [
      'Ariel Application Manual — Capacity and Load Control: compressor capacity is adjusted for process-flow demand, suction/discharge pressure management and load management; bypass/recycle from discharge to suction reduces net downstream capacity and generally does not reduce compressor power unless fully bypassed. Source: https://www.arielcorp.com/support/application-manual/capacity_control.html',
      'Ariel Application Manual — Compressor Theory: reciprocating compression performance depends on suction/discharge conditions, clearance and volumetric behavior; do not infer equal flow from equal numeric load-step increments without machine-specific performance data. Source: https://www.arielcorp.com/support/application-manual/calculations/compressor_theory.html',
      'Chart Industries — Brazed Aluminum Heat Exchangers: BAHX/plate-fin exchangers are core cryogenic natural-gas/NGL-recovery equipment; Ryan should correlate changing flow with exchanger duty, pressure drop, approach temperatures and downstream separation rather than treating each pass independently. Source: https://www.chartindustries.com/Products/Brazed-Aluminum-Heat-Exchangers'
    ],
    modelingRules: [
      'Do not model reciprocating-compressor load steps as equal linear percentages. Clear Fork field data supports discrete/nonlinear capacity increments; loading is used to manage flow and suction/discharge conditions.',
      'Recycle returning discharge gas to suction reduces net downstream capacity and should not be treated as additional sales throughput.',
      'At the current no-recycle 5/5 inlet and 2/3/3 residue condition, calibrate around ~222 MMSCFD rich inlet and ~208.6-209 MMSCFD residue sales flow, ~440/952 psig inlet suction/discharge, and ~294.2/982.1 psig residue suction/discharge.',
      'JT and expander are coordinated parallel pressure/flow-sharing paths. Current verified operation has the JT valve near 0% while EX-1121 IGV is carrying the present load; as IGV accepts more flow the JT pinches closed, while loss/saturation of the expander recruits the JT path. Use the newest live data over older snapshots.',
      'The 17 psig refrigeration suction value is the controller setpoint for the one-compressor condition; actual PV may operate on either side of SP (8 PM report ~16.3 psig).'
    ]
  },
  currentOperatorCorrections: [
    'PIC-1441C refrigeration suction-pressure SP is 17 psig for the current one-compressor operating condition.',
    'V-1418 regen scrubber liquid level is currently about 6%. LIC-1418 SP is 18%; inventory rises from the bottom and the dump cycle returns level toward 0% when the dump condition is reached.',
    'P-5060 and P-5065 stabilizer pumps are duty/standby. Normally only one runs. Both may be red-tagged. With both stopped, actual stabilizer transfer flow is zero and pump-generated pressure/temperature rise must collapse.',
    'V-1040 belongs on the inlet system upstream of inlet compression. F-1412 is the inlet filter/coalescer on the inlet/dehydration path and should not be represented as part of the V-1040 inlet-separation board.',
    'V-1460 dry fuel-gas scrubber outlet continues to the plant fuel-gas header. Hot-oil return physically enters V-7500 expansion tank.'
  ],
  troubleshootingMethod: [
    'Start with the symptom, then trace the actual process path upstream -> equipment/control -> downstream before naming a failed component.',
    'For every control loop compare SP, PV, CV/output, AUTO/MANUAL, permissives, red-tag state, valve state and the resulting process response.',
    'Separate command failure, instrument/indication failure, process limitation and mechanical failure. A valve command with no expected process response is diagnostic evidence, not proof of a bad valve.',
    'Use peer-unit comparison on parallel compressors, pumps, fans and filters. Compare suction/discharge, differential pressure, temperatures, capacity/load, recycle, current/run state and alarms.',
    'Use trends and time order. Respect valve travel, vessel holdup, thermal mass, compressor loading, column inventory and analyzer dead time.',
    'Rank likely causes and name the exact tag/trend/condition that would confirm or reject each cause. Do not parts-swap by guesswork.'
  ],
  documentLearning: [
    'Large P&IDs/manuals are learned through uploaded-file interactive multi-pass Messages requests; each pass completes independently, retains partial success, and structured extraction keeps page/source metadata without enabling API citation blocks.',
    'P&ID passes separately cover physical topology, instruments/controls, relief/isolation/LOTO-relevant detail and notes/specifications.',
    'Manual passes separately cover applicability/specifications, controls/safety, operations and maintenance/troubleshooting.',
    'Netlify buffered function requests are limited to about 6 MB; base64 binary uploads effectively need to stay near 4.5 MB. Larger sources must be supplied through an Anthropic Files fileId or another server-side file reference rather than being silently truncated.'
  ]
};

function buildActiveTroubleshootingGuide(message, context){
  const h = `${message || ''}\n${context || ''}`.toLowerCase();
  const areas = [];
  if(/residue|6100|6200|6300|6050|6800/.test(h)) areas.push('RESIDUE: verify EX/C-1121 common suction, F-6800 recycle tie-in through PV-6050A/PIT-6050B/XV-6060/PIT-6050C, individual compressor suction branches, and separate common discharge.');
  if(/refrig|1140|1141|1142|1441|1442|1444|1241/.test(h)) areas.push('REFRIGERATION: correlate compressor count/load, PIC-1441C SP/PV/CV, condenser fan availability, condensing pressure, chiller duty and cold-separator response.');
  if(/demeth|1521|rsv|gsp|1222/.test(h)) areas.push('DEMETH: correlate tower pressure/DP, RSV/GSP return temperatures, reboiler duty, reflux/recycle flows, temperature profile and product composition.');
  if(/stabil|5030|5040|5060|5065|5055/.test(h)) areas.push('STABILIZER: verify feed, tower pressure/temperature/levels, reboiler heat, active pump, actual transfer flow and destination valve lineup.');
  if(/dehy|regen|1413|1414|1415|1418|1711/.test(h)) areas.push('DEHY/REGEN: verify active bed lineup, heat/cool phase, regen scrubber inventory/dump, bed DP and outlet moisture/dewpoint trend.');
  if(/hot oil|7100|7410|7420|7500|7600/.test(h)) areas.push('HOT OIL: separate heater firing from circulation; verify pump, supply/return temperatures, flow, user duties and V-7500 inventory/pressure.');
  if(/inlet|1040|4100|4200|4250/.test(h)) areas.push('INLET: verify V-1040 -> PIT/TIT/FIT-1045A -> common compressor suction, separate compressor discharges, and 4250 recycle cause/effect.');
  return [
    'ACTIVE CLEAR FORK TROUBLESHOOTING METHOD:',
    '1) Define the symptom and first time it changed.',
    '2) Trace the real material/energy path upstream-to-downstream.',
    '3) Compare SP/PV/CV/mode/permissives with actual process response.',
    '4) Check peer equipment and common-header effects.',
    '5) Rank process, control/instrument, mechanical and indication causes.',
    '6) For each cause name the exact live tag/trend that proves or rejects it.',
    ...areas
  ].join('\n');
}

const CRYO_EXPERT_ENGINE_12AM = {
  purpose: 'Make Ryan behave like a plant-wide cryogenic operator/troubleshooter, not a disconnected FAQ bot.',
  sourcePriority: ['LIVE simulator context','Verified Clear Fork P&IDs/procedures','Applicable OEM/manual/nameplate data','Operator-provided Clear Fork corrections','PetroSkills/process fundamentals','Web/general industry research','Engineering inference'],
  dependencyMethod: [
    'For each important tag identify upstream drivers, downstream effects, response strength, response delay, and feedback loops.',
    'Do not treat a transmitter as an isolated number. Trace pressure, flow, temperature, level, composition, valve position, equipment load and utility availability through the connected process.',
    'When a plant graph/dependency matrix is supplied in CONTEXT, use its directed relationships and confidence labels before generic inference.'
  ],
  trendMethod: [
    'Use 10-minute behavior for immediate control/valve/process response, 3-hour behavior for developing upsets, 24-hour behavior for shift-scale drift, and 72-hour behavior for slow fouling/wear/ambient/cycle effects.',
    'Distinguish step change, ramp, oscillation, drift, flat-lined/bad indication and delayed analyzer response.',
    'Small absolute changes must be judged against engineering span, historical noise and correlated tags; do not exaggerate a 1 psi/1 F/1 GPM movement without context.'
  ],
  proofBasedTroubleshooting: [
    'Return the most likely causes in ranked order, normally no more than three primary causes before lower-probability alternatives.',
    'For every ranked cause state the exact tag, trend, peer comparison or field observation that would confirm it and the observation that would reject it.',
    'Separate process limitation, control/instrument issue, equipment/mechanical issue and indication/data issue.'
  ],
  forecastMethod: [
    'For a proposed SP/valve/load change, forecast immediate control response, seconds-to-minutes hydraulic response, minutes thermal/equipment response, and slower downstream separation/composition response.',
    'Do not claim a numerical future value unless the simulator supplies a model sufficient to calculate it; otherwise give direction, likely magnitude class and uncertainty.'
  ],
  crossSystemCorrelation: [
    'Inlet throughput can propagate through compression, dehydration, refrigeration, cold section, expander/JT, demethanizer, residue compression, NGL/stabilizer, fuel gas and utilities.',
    'Refrigeration availability affects chiller/cold-separator temperature, phase split, expander/JT loading, demethanizer feed and product recovery.',
    'Hot-oil/reboiler duty affects tower temperature profile and product composition; compressor/recycle changes can alter upstream suction pressure and downstream throughput.'
  ],
  equipmentHealth: [
    'Compare each machine against its own recent baseline plus peer machines where appropriate: suction/discharge pressure, temperature, DP, load/capacity, recycle, oil conditions, vibration/alarms, starts/run hours and cooler/fan availability.',
    'Do not declare degradation from one snapshot; require a trend, peer divergence, alarm, or source-backed limit.'
  ],
  maintenancePrediction: [
    'Use run hours, starts, oil consumption, rising DP, temperature drift, repeated recycle/unload behavior and recurring operator-observed service intervals as planning indicators, not hard guarantees.',
    'State what condition/trend should be confirmed before recommending maintenance timing.'
  ],
  provenanceRules: [
    'Label material claims LIVE, VERIFIED, OPERATOR_OBSERVED, OEM_GUIDANCE, WEB_GENERAL, INFERRED, or PENDING_VERIFICATION when source class matters.',
    'Internet/general process research can explain how equipment/processes work but cannot overwrite Clear Fork plant topology, approved procedures, verified setpoints or live state.'
  ],
  instructorMode: [
    'When explicitly asked for an instructor scenario, create a controlled training fault with hidden root cause, observable symptoms, expected tag correlations, safe diagnostic objectives and scoring criteria.',
    'Do not automatically change live controls or plant state. Scenario injection belongs to the simulator/instructor layer and must be explicit.'
  ],
  largeDocumentLearning: [
    'Dense P&IDs/manuals must be learned in multiple passes and deduplicated by atomic fact statement while preserving source label/page and verification status.',
    'P&ID learning must separately cover topology, instrumentation/control, safety/relief/isolation, notes/specifications and a final diagnostic/dependency index.',
    'Manual learning must separately cover applicability/specs, controls/safety, operations, maintenance/troubleshooting and symptom-to-cause diagnostic tables.',
    'If a source is too large for browser-to-Netlify payload limits, use the supported fileId/server-side source path rather than truncating it.'
  ]

};

const CRYO_OPERATOR_DECISION_ENGINE_12AM = {
  operatorFirstResponse: [
    'For operator/troubleshooting requests, answer in two layers: first an OPERATOR BRIEF of no more than 6 concise bullets, then ENGINEERING DETAIL only when useful.',
    'The OPERATOR BRIEF should state: what changed/what matters now, top likely cause(s), the single best confirming tag/trend, immediate safe checks, and confidence.',
    'Do not bury the actionable diagnosis under a long process-theory introduction.'
  ],
  currentVsNormal: [
    'Compare the current state against the most relevant normal reference: configured setpoint/normal state, recent stable baseline, peer equipment, verified operating range, or operator-provided normal behavior.',
    'Name the reference used. Never call something abnormal without stating what baseline or source makes it abnormal.',
    'If the simulator does not provide a valid baseline, say BASELINE NOT AVAILABLE and use peer/correlated-tag evidence instead of inventing one.'
  ],
  whatChangedEngine: [
    'When asked what changed, reconstruct chronology from trend windows and event/alarm history. Prioritize the first meaningful movement, not the largest final deviation.',
    'Use 10-minute data for control/valve sequencing, 3-hour data for developing process upsets, 24-hour data for shift drift, and 72-hour data for fouling/wear/ambient-cycle patterns.',
    'Return FIRST MOVERS, FOLLOWERS, and LIKELY CONSEQUENCE. Correlation is evidence, not proof of causation.'
  ],
  instrumentVsProcess: [
    'Actively test BAD INDICATION vs REAL PROCESS CHANGE. A suspect indication is more likely when one tag moves without physically consistent movement in upstream/downstream/peer tags, is flat-lined, jumps unrealistically, disagrees with redundant indication, or produces no expected controller/final-element response.',
    'A real process change is more likely when multiple independent tags move in physically consistent sequence and the controller/final element responds plausibly.',
    'Never declare a transmitter failed solely because its value looks unusual; identify the corroborating or contradicting measurements needed.'
  ],
  readinessChecks: [
    'For STARTUP READINESS, verify required utilities, permissives/interlocks, source/destination availability, suction inventory/pressure, discharge path, lube/cooling/seal systems, recycle/minimum-flow protection, valves/modes, red tags/maintenance holds, and downstream capacity before recommending a start.',
    'For SHUTDOWN READINESS, verify downstream consequence, recycle/unload/minimum-flow needs, alternate equipment or flow path, inventory/pressure control, utility implications, isolation/blowdown needs, and restart risks.',
    'Readiness answers are advisory. Any missing site procedure, field status, permissive, valve lineup, or energy-control requirement must be called out explicitly.'
  ],
  confidenceMethod: [
    'Give diagnostic confidence as HIGH, MEDIUM, or LOW with one short reason.',
    'HIGH requires source-backed topology plus correlated live/trend evidence; MEDIUM has a plausible mechanism but incomplete confirmation; LOW means important data/source gaps or competing causes remain.',
    'Confidence describes the diagnosis, not safety authorization. Never use confidence to waive field verification or procedures.'
  ],
  fastestProof: [
    'For each diagnosis identify the single highest-value next observation, tag, trend, or field check that most efficiently separates the leading cause from its strongest alternative.',
    'Prefer non-intrusive read-only checks before recommending manipulation of equipment or controls.'
  ],
  learnedKnowledgeIndexing: [
    'When learned P&ID/manual facts are available, retrieve by equipment tag, instrument/valve tag, system, drawing/source label, alarm/interlock, maintenance topic, energy/isolation relationship, and upstream/downstream flow path.',
    'Do not flood a response with the entire learned document. Pull only source-backed facts relevant to the question and preserve source/page provenance.'
  ]
};

const LOTO_PID_AUDIT_ENGINE_12AM = {
  doctrine: 'Ryan may draft and audit a LOTO/work plan from P&ID evidence, but cannot approve, authorize, or field-verify it.',
  requiredSequence: [
    '1. Define the exact work boundary and equipment/nozzle/line segment involved.',
    '2. Identify every energy source that can cross the boundary: process pressure/flow, electrical, rotating/mechanical, thermal/cryogenic/hot oil, pneumatic/instrument air, hydraulic, chemical, gravity/liquid head, trapped pressure, and stored energy.',
    '3. Trace each energy path upstream and downstream on the detailed P&ID, including bypasses, recycles, drains, vents, check-valve bypass risk, common headers, utilities, and off-page continuations.',
    '4. For each proposed isolation, require source-backed tag/service/drawing and identify what it isolates. Never infer a valve tag or physical isolation point from a generic process description.',
    '5. Identify pressure-release/depressurization/bleed paths and their destination. A drain or vent is not proof of zero energy.',
    '6. Identify PSV/relief protection and destination. Never casually isolate or defeat a PSV; approved site procedure governs any required PSV isolation arrangement.',
    '7. Determine whether any continuation drawing, electrical one-line/MCC source, OEM stored-energy requirement, or field-only detail is missing. Missing boundary evidence blocks execution.',
    '8. Define zero-energy verification criteria: zero pressure where applicable, drained/depressured state, electrical absence-of-voltage by authorized method, mechanical/rotational stop, temperature/chemical hazard controls, and field valve/blank verification as required by site procedure.',
    '9. Build restoration in reverse with independent verification of blinds/locks/valves, relief protection, drains/vents, controls/permissives, utilities, and affected downstream/upstream equipment before return to service.'
  ],
  sourceRules: [
    'Detailed Clear Fork P&IDs govern plant-specific piping and valve topology. PFD/BFD/HMI graphics may orient the draft but cannot establish an exact isolation boundary by themselves.',
    'OEM manuals may add stored-energy, electrical, mechanical, lubrication, or package-specific hazards but do not replace plant energy-control procedure.',
    'Operator observations may identify likely field configuration but must be marked OPERATOR_OBSERVED until drawing/field verification.',
    'Every isolation/blowdown/PSV marker must carry a source drawing/reference and a verification statement.'
  ],
  executionBlockers: [
    'Any invented/unreadable tag, unknown continuation, ambiguous shared header, missing source drawing, unknown pressure-release destination, unresolved PSV arrangement, or unverified electrical/mechanical energy source is an EXECUTION BLOCKER.',
    'When an execution blocker exists, status must be DRAFT - INCOMPLETE and executionBlocked must be true.'
  ]
};


const EXCHANGER_REBOILER_EXPERT_12AM = {
  clearForkTopology: [
    'VERIFIED/OPERATOR-CORRECTED: E-1221 is the upper gas/gas service and E-1222 is the lower reflux-condenser service within the same brazed-aluminum exchanger assembly. They are separate internal passes and do not mix process streams.',
    'After F-1416/F-1417 dust filters the dry-gas header splits: one branch can continue directly toward V-1421, one branch passes TCV-1223 toward E-1223/E-1224 reboiler heat recovery, and the TCV-1221 branch enters the TOP of E-1221 vertically and exits horizontally from the lower part of the E-1221 service toward the expander train.',
    'RSV pass: gas from F-1438 enters the top of the gas/gas service, passes through the shared BAHX passages, leaves vertically from the bottom of the E-1222 reflux section, passes TE-1222J (operator snapshot -89.80 F) and FCV-1438. FIC-1438 snapshot SP 33.00 MMSCFD, PV 32.98 MMSCFD, CV 58.5% open; when PV rises above SP the controller pinches FCV-1438, and when PV falls below SP it opens.',
    'Methane-rich T-1521 overhead enters from the bottom of the E-1222 reflux service, traverses the reflux/gas-gas heat-recovery passes, exits at the top of E-1221, then turns toward the booster side of C/EX-1121. Keep its outlet temperature/DP indications on that physical line.',
    'GSP/recovery feed correction: the C/EX-1121 pre-expander branch includes FT-1222-COMP (operator snapshot 35.70 MMSCFD) and PDCV-1222B. PDIC-1222B is currently MANUAL with SP 2.20 PSID, PV 0.62 PSID and CV 100% open. Cold-separator bottoms downstream of LCV-1421B joins this same LOWER common header. The combined path enters the E-1222 reflux service and then continues on the one lower return to T-1521. There is no separate upper duplicate return line.'
  ],
  hmi_drawing_rules: [
    'Do not draw process pipe through the interior of E-1221/E-1222 merely to imply an internal exchanger pass. Show the inlet connection at the exchanger boundary and the outlet connection at its own boundary; the BAHX core represents the internal passage.',
    'E-1221 and E-1222 are separate services in the same brazed-aluminum exchanger body; the on-screen horizontal divider is a red equipment/service divider, not a process pipe.',
    'Do not duplicate the GSP/C2 return: PDCV-1222B preflow and LCV-1421B cold-separator bottoms join one lower common E-1222 return path to T-1521.'
  ],
  thermal_operation: [
    'BAHX performance depends on balanced stream flow and temperature approach. More warm-side flow at unchanged cold-side capacity tends to raise warm-side outlet temperature / increase downstream refrigeration load; more cold-side flow or colder return can increase heat pickup and cool the warm stream more, subject to exchanger UA and pressure-drop limits.',
    'Increasing flow generally increases exchanger pressure drop and can change approach temperature. Treat rising DP together with falling heat-transfer performance as possible restriction/fouling/maldistribution evidence rather than assuming more flow always means more duty.',
    'Avoid abrupt flow/temperature changes across brazed-aluminum exchangers. Excessive thermal gradients and rapid temperature-rate changes can create thermal stress and reduce exchanger life; operator changes should be evaluated against stream temperature trends, DP and downstream response.',
    'For reboiler service, more circulating/heating flow normally increases available boil-up until constrained by approach, two-phase hydraulics, heat-source temperature or circulation resistance; less flow/duty reduces boil-up and changes tower separation. Always trace the effect into tower temperatures, overhead/bottom composition and downstream compressor/refrigeration load.'
  ],
  heatExchangerReasoning: [
    'BAHX duty is a coupled heat balance: changing flow on one pass changes heat-transfer duty, outlet temperatures, approach temperatures and pressure drop on that pass and can shift temperatures on neighboring passes sharing the core.',
    'At fixed opposing-stream capacity, increasing warm-side flow generally increases total heat load but gives each unit of warm gas less residence/available duty, so its outlet may be warmer; decreasing flow can produce a colder outlet until control limits, minimum-flow limits or maldistribution dominate. Always confirm with actual inlet/outlet temperatures and flow rather than assuming a fixed temperature response.',
    'Pressure drop rises strongly with flow. A rising PDT at similar flow can indicate fouling/restriction, while rising PDT with rising flow may be expected hydraulic response. Use normalized DP-vs-flow trend before diagnosing fouling.',
    'Brazed-aluminum exchangers are sensitive to rapid temperature change and uneven thermal gradients. Large step changes in valve position/flow should be treated as a thermal-stress concern; use controlled changes and watch temperature rate-of-change and cross-pass temperature differences.',
    'Heat recovered in E-1221 reduces the refrigeration duty required downstream. Sending more feed around/away from E-1221 can increase downstream mechanical refrigeration/chiller load; sending more through E-1221 can increase exchanger DP and change cold-end approach, so the optimum is not simply maximum flow through one pass.'
  ],
  reboilerReasoning: [
    'Reboilers convert heat duty into tower boil-up. More reboiler duty generally increases vapor traffic and strips more light components upward from tower liquid; less duty does the reverse. The exact C2/C1 product response depends on recovery/rejection mode and reflux conditions.',
    'In cryogenic plants where inlet/feed gas supplies reboiler heat, changing the dry-gas split changes both feed cooling and tower reboil duty, so it propagates into cold-separator phase split, demethanizer temperatures, residue flow, NGL composition and refrigeration load.',
    'Thermosiphon/reboiler circulation depends on density head overcoming piping/exchanger pressure drop. Too little heat/flow can make circulation unstable or stall; fouling/restriction raises resistance and can reduce circulation even when tower inventory is available.',
    'When troubleshooting a reboiler, correlate draw/return temperatures, DP, tower level/profile, feed flow, valve positions, lift-gas status where applicable and downstream product composition. Never diagnose from one temperature alone.'
  ],
  proofChecks: [
    'For E-1221 performance: compare TCV-1221 position, dry-gas flow, TE-1221 inlet/outlet temperatures, PDT-1221 and downstream chiller/cold-separator temperature over the same trend window.',
    'For RSV control: compare FIC-1438 SP/PV/CV, TE-1222J, upstream F-1438 flow/pressure and T-1521 response.',
    'For GSP/recovery path: compare FT-1222-COMP, PDIC-1222B/PDCV-1222B mode/output, LCV-1421B flow availability, common-header DP and T-1521 top temperature/composition response.',
    'For suspected BAHX restriction/fouling: normalize DP against flow and compare approach temperatures. Rising DP at unchanged flow plus degrading approach is stronger evidence than either symptom alone.'
  ],
  researchBasis: [
    'OEM_GUIDANCE: Chart Industries BAHX operations guidance emphasizes controlled temperature rates of change and monitoring overlapping-header temperature differences; use these as general mechanical-integrity guidance, not Clear Fork alarm setpoints.',
    'INDUSTRY_REFERENCE: Gas Processing & LNG dynamic NGL-plant studies describe thermosiphon circulation as density-head driven against piping/exchanger resistance; low heat/flow or increased exchanger resistance can destabilize or stall circulation.',
    'INDUSTRY_REFERENCE: Gas Processing & LNG notes that inlet-flow splits between reboiler and gas/gas passes materially affect heat/material balance, refrigeration load and plant limits; model the actual valve Cv/pressure-drop path rather than a fixed split.'
  ],
  sourceClass: 'Clear Fork topology from operator/real HMI; general BAHX/reboiler physics from Chart Industries and Gas Processing & LNG references. General research must not overwrite verified Clear Fork piping or current operator snapshots.'
};

function hasClearForkTag(text) {
  return /\b(?:C|V|P|E|F|T|A|H)-\d{3,4}[A-Z]?\b|\bEX\/?C?-?\d{3,4}[A-Z]?\b|\b(?:PIC|PIT|PT|TIT|TE|FIT|FT|FIC|LIC|LIT|PDIT|PDIC|PV|PCV|FCV|LCV|TCV|XV|ESD|PSV|FQI|FFIC)-?\d{3,4}[A-Z]?\b/i.test(String(text || ''));
}

const KNOWLEDGE_REGISTRY = {
  flowPathTrainingAid0815: CLEAR_FORK_FLOW_PATH_TRAINING_AID_20260815,
  cryoExpert12AM: CRYO_EXPERT_ENGINE_12AM,
  operatorDecision12AM: CRYO_OPERATOR_DECISION_ENGINE_12AM,
  lotoPidAudit12AM: LOTO_PID_AUDIT_ENGINE_12AM,
  exchangerReboiler12AM: EXCHANGER_REBOILER_EXPERT_12AM,
  operatorProcess0812Y: OPERATOR_PROCESS_KNOWLEDGE_0812Y,
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

  interlocks0812: CLEAR_FORK_INTERLOCK_UPDATE_20260812,

  operatorProcess09J: OPERATOR_PROCESS_KNOWLEDGE_09J,

  operatorProcess09K: OPERATOR_PROCESS_KNOWLEDGE_09K,

  operatorProcess09L: OPERATOR_PROCESS_KNOWLEDGE_09L,

  operatorProcess09M: OPERATOR_PROCESS_KNOWLEDGE_09M,

};

 

const KNOWLEDGE_ROUTING_RULES = [
  { key: 'flowPathTrainingAid0815', re: /\b(flow path|colour-coded|color-coded|training aid|F-6800|E-1227|F-1438|V-1040|E-1225|E-1125|P-5060|P-5065|AC-5055|V-1422|P-1619|P-1620|P-1630|P-1635|V-8000)\b/i },
  { key: 'exchangerReboiler12AM', re: /\b(E-1221|E-1222|E-1223|E-1224|gas\/?gas exchanger|reflux condenser|BAHX|brazed aluminum|TCV-1221|TCV-1223|TE-1222J|FCV-1438|FIC-1438|FT-1222-COMP|PDIC-1222B|PDCV-1222B|reboiler|thermosiphon|heat integration|approach temperature|exchanger DP)\b/i },
  { key: 'operatorDecision12AM', re: /\b(what changed|first moved|first mover|normal state|baseline|bad transmitter|bad indication|instrument issue|startup readiness|shutdown readiness|ready to start|ready to stop|confidence|operator brief|fastest proof|proof check|troubleshoot|diagnos|upset|abnormal)\b/i },
  { key: 'lotoPidAudit12AM', re: /\b(LOTO|lockout|work plan|workplan|isolation boundary|zero energy|depressure|blowdown|bleed|energy source|off-page continuation|field verification)\b/i },
  { key: 'operatorProcess0812Y', re: /\b(troubleshoot|diagnos|residue|C-6100|C-6200|C-6300|PV-6050A|XV-6060|EX\/C-1121|demeth|RSV|GSP|TE-1222K|TE-1222D|refrigeration|PIC-1441C|V-1418|LIC-1418|stabilizer|P-5060|P-5065|V-1040|F-1412|fuel gas|V-1460|hot oil|V-7500|P&ID|manual|large file)\b/i },
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

 

function isPlantSpecificQuery(message, context, mode) {
  const text = `${message || ''}\n${context || ''}`;
  if (['audit','scan','loto','loto_workplan','recommend','forecast','health_profile','maintenance','instructor','what_changed','readiness','operator_brief','digest','learn','ingest','image_learn','digest_prepare','digest_pass','digest_batch_start','digest_batch_status','memory_extract'].includes(String(mode || '').toLowerCase())) return true;
  return hasClearForkTag(text) || /\b(Clear\s*Fork|HMI|control board|current PV|current SP|current CV|live plant|this plant|our plant|plant inlet|residue compressor|demethanizer|stabilizer tower|Ryan scan|LOTO|P&ID|PID)\b/i.test(text);
}

function wantsWebResearch(message, mode) {
  const text = String(message || '');
  if (!text.trim()) return false;
  if (!['qa','recommend'].includes(String(mode || 'qa').toLowerCase())) return false;
  // Keep ordinary process questions fast and reliable. Ryan already has PetroSkills/OEM/process
  // fundamentals for explanations. Invoke internet research only when the operator explicitly asks
  // for external research/sources/current verification. This avoids unnecessary web-tool latency
  // and reduces upstream overload risk.
  return /\b(research(?: the)? (?:internet|web|online)|search (?:the )?(?:internet|web|online)|look up|lookup|web search|internet search|online source|cite sources?|provide sources?|verify online|verify on the web|latest|current external|current industry|find sources?)\b/i.test(text);
}

function genericProcessKnowledge(message) {
  const text = String(message || '');
  const out = {};
  if (/\b(stabiliz|fractionat|demeth|reboil|reflux|tower|NGL)\b/i.test(text)) out.petroSkills = PETROSKILLS_KNOWLEDGE;
  if (/\b(compressor|reciprocating|centrifugal|screw|surge|recycle)\b/i.test(text)) out.petroSkills = PETROSKILLS_KNOWLEDGE;
  if (/\b(valve|control valve|Cv|actuator|Fisher)\b/i.test(text)) out.controlValves = CONTROL_VALVE_KNOWLEDGE;
  if (/\b(dehy|dehydrat|molecular sieve|adsorb|hydrate|dew point)\b/i.test(text)) out.petroSkills = PETROSKILLS_KNOWLEDGE;
  if (/\b(refrigerat|propane|chiller|expander|JT|cryogenic|cold separator|phase)\b/i.test(text)) out.petroSkills = PETROSKILLS_KNOWLEDGE;
  if (!Object.keys(out).length) out.petroSkills = PETROSKILLS_KNOWLEDGE;
  return out;
}

function selectKnowledge(message, context, mode) {

  const haystack = `${message || ''}\n${context || ''}`;
  const modeKey = String(mode || 'qa').toLowerCase();
  const plantSpecific = isPlantSpecificQuery(message, context, mode);

  if (!plantSpecific && ['qa','qa_fast','recommend'].includes(modeKey)) {
    return genericProcessKnowledge(message);
  }

  const keys = new Set();
  if (plantSpecific || ['recommend','forecast','health_profile','maintenance','instructor','audit','scan'].includes(modeKey)) keys.add('cryoExpert12AM');

  for (const rule of KNOWLEDGE_ROUTING_RULES) if (rule.re.test(haystack)) keys.add(rule.key);

  if (mode === 'audit' || mode === 'scan') Object.keys(KNOWLEDGE_REGISTRY).forEach(k => keys.add(k));

  if (mode === 'recommend' || /\b(process|troubleshoot|diagnos|upset|off-spec|off spec|poor separation|low flow|high pressure|low pressure|high temperature|low temperature|why|cause)\b/i.test(haystack)) { keys.add('petroSkills'); keys.add('operatorProcess0812Y'); }

  if ((mode === 'loto' || mode === 'loto_workplan') || /\b(P&ID|PID|flow path|lineup|isolation|LOTO|lockout|relief|PSV|depressure|blowdown|upstream|downstream|continuation)\b/i.test(haystack)) { keys.add('clearForkPIDs'); keys.add('lotoPidAudit12AM'); }

  if ((mode === 'loto' || mode === 'loto_workplan') || /\b(P&ID|PID|piping|line number|line spec|rating|valve|PSV|relief|flare|closed drain|instrument air|dehy|regen)\b/i.test(haystack)) keys.add('finalPIDs');

  if (['recommend','forecast','health_profile','maintenance','what_changed','readiness','operator_brief'].includes(String(mode || '').toLowerCase()) || /\b(troubleshoot|diagnos|what changed|abnormal|bad indication|ready to start|ready to stop)\b/i.test(haystack)) keys.add('operatorDecision12AM');

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

      verification: { type: 'string' },
      sourceType: { type: 'string' },
      serviceOrEnergy: { type: 'string' },
      upstreamBoundary: { type: 'string' },
      downstreamBoundary: { type: 'string' },
      confidence: { type: 'string' }

    },

    required: ['tag','action','purpose','sourceDrawing','verification','sourceType','serviceOrEnergy','upstreamBoundary','downstreamBoundary','confidence'],

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

          workBoundary: { type: 'string' },

          sourceEvidence: { type: 'array', items: { type: 'string' } },

          continuationDrawings: { type: 'array', items: { type: 'string' } },

          energyPathTrace: { type: 'array', items: { type: 'string' } },

          workPlanSteps: { type: 'array', items: { type: 'string' } },

          energySources: { type: 'array', items: { type: 'string' } },

          hazards: { type: 'array', items: { type: 'string' } },

          isolationPoints: { type: 'array', items: marker },

          blowdownPoints: { type: 'array', items: marker },

          psvMarkers: { type: 'array', items: marker },

          verificationChecklist: { type: 'array', items: { type: 'string' } },

          zeroEnergyCriteria: { type: 'array', items: { type: 'string' } },

          conflictsAndAmbiguities: { type: 'array', items: { type: 'string' } },

          approvalRequirements: { type: 'array', items: { type: 'string' } },

          executionBlocked: { type: 'boolean' },

          restorationSteps: { type: 'array', items: { type: 'string' } },

          missingInformation: { type: 'array', items: { type: 'string' } },

          fieldVerificationRequired: { type: 'boolean' },

          finalWarning: { type: 'string' }

        },

        required: ['title','status','scope','equipment','sourceDrawings','workBoundary','sourceEvidence','continuationDrawings','energyPathTrace','workPlanSteps','energySources','hazards','isolationPoints','blowdownPoints','psvMarkers','verificationChecklist','zeroEnergyCriteria','conflictsAndAmbiguities','approvalRequirements','executionBlocked','restorationSteps','missingInformation','fieldVerificationRequired','finalWarning'],

        additionalProperties: false

      }

    }

  };

}

 

function buildSystemPrompt(mode, selectedKnowledge, learnedKnowledge) {

  let modeInstructions = '';

  if (mode === 'loto' || mode === 'loto_workplan') {

    modeInstructions = `MODE: LOTO / WORK-PLAN DRAFTING. Build a source-traceable DRAFT only. Apply LOTO_PID_AUDIT_ENGINE_12AM in order. First define the exact physical work boundary, then trace every process and stored-energy path that can cross it upstream and downstream, including shared headers, bypasses, recycles, drains/vents, utilities, common sources, and every off-page continuation. Detailed P&IDs are required for exact plant isolation points; HMI/PFD/process descriptions may orient but cannot prove a boundary. For every isolation/blowdown/PSV marker provide exact tag only when source-backed, source drawing/reference, source type, service/energy, upstream/downstream boundary, verification action and confidence. If a tag or relationship is unreadable/unsupported, write PENDING VERIFICATION instead of guessing. Explicitly list source evidence, continuation drawings, energy-path trace, zero-energy criteria, conflicts/ambiguities, approval requirements and missing information. PSVs are protective devices; identify relief destination and protection relationship but never recommend defeating/isolation unless an approved site procedure/source explicitly governs it. Missing continuation drawings, ambiguous common headers, unknown pressure-release destination, unresolved PSV arrangement, unknown electrical/mechanical energy source, or any invented/unverified isolation makes executionBlocked=true and status='DRAFT - INCOMPLETE'. If the source set appears complete, executionBlocked still does not mean approved: fieldVerificationRequired must always be true and finalWarning must be exactly 'NOT APPROVED — FIELD VERIFICATION REQUIRED'. Include restoration/return-to-service verification in reverse order and require authorized field/site-procedure approval before execution.`;

  } else if (mode === 'audit') {

    modeInstructions = `MODE: AUDIT. Identify contradictions, unsupported values, mismatched tags, unsafe assumptions, and missing source provenance. Suggestions only.`;

  } else if (mode === 'scan') {

    modeInstructions = `MODE: RYAN SCAN. Audit the supplied code/question bank for wrong answers, contradictory comments, tag mismatches, and backwards logic. Cite line/question references when available.`;

  } else if (mode === 'recommend') {

    modeInstructions = `MODE: RECOMMENDATIONS. Use live CONTEXT first. Separate verified facts from inference. Rank likely causes, name the tag/value that would confirm each cause, then recommend checks before corrective action.`;

  } else if (mode === 'forecast') {
    modeInstructions = `MODE: CAUSE/EFFECT FORECAST. Use live state and the dependency method. Forecast immediate, short, medium and slower downstream effects. State uncertainty and the tags/trends that would validate the forecast.`;

  } else if (mode === 'health_profile') {
    modeInstructions = `MODE: EQUIPMENT HEALTH. Compare current condition with recent trend/baseline and peer equipment. Separate normal variation from degradation. Identify evidence, confidence, and next checks.`;

  } else if (mode === 'maintenance') {
    modeInstructions = `MODE: PREDICTIVE MAINTENANCE. Use trends, run state/hours, starts, DP, temperatures, oil/utility behavior and operator-observed intervals. Treat intervals as planning indicators, not guarantees. State confirmation needed before scheduling.`;

  } else if (mode === 'instructor') {
    modeInstructions = `MODE: INSTRUCTOR SCENARIO. Create a controlled training scenario with hidden root cause, symptoms, expected correlations, diagnostic objectives and scoring. Do not operate the live simulator or reveal the root cause unless the instructor requests it.`;

  } else if (mode === 'what_changed') {
    modeInstructions = `MODE: WHAT CHANGED. Reconstruct chronology from available live state, alarms/events and 10m/3h/24h/72h trend context. Return FIRST MOVERS, FOLLOWERS, likely consequence, competing explanation, the single fastest proof check, and diagnostic confidence. Do not confuse correlation with proof.`;

  } else if (mode === 'readiness') {
    modeInstructions = `MODE: STARTUP/SHUTDOWN READINESS. Determine whether the requested equipment/system appears ready based on utilities, permissives/interlocks, source/destination, inventories/pressures, lubrication/cooling/seal systems, recycle/minimum-flow protection, valves/modes, red tags/maintenance holds and downstream/upstream capacity. List READY, NOT READY and PENDING VERIFICATION items. Advisory only; never substitute for the approved operating procedure.`;

  } else if (mode === 'operator_brief') {
    modeInstructions = `MODE: OPERATOR BRIEF. Answer in no more than six concise bullets first: current concern, top cause(s), fastest proof tag/trend, immediate safe check, downstream/upstream consequence and confidence. Add deeper engineering detail only if it materially helps.`;

  } else if (mode === 'memory_extract') {

    modeInstructions = `MODE: MEMORY EXTRACTION. Extract only durable plant-specific memory candidates explicitly provided by the operator or clearly supported by supplied context. Do not store temporary live values, generic process theory, secrets, passwords, API keys, speculation, or unsupported safety-critical limits. Return strict JSON only: {"memories":[{"text":"...","title":"...","equipmentIds":[],"tags":[],"confidence":"high|medium|low"}]}. If none, return {"memories":[]}.`;

  } else if (['digest','learn','ingest'].includes(mode)) {

    modeInstructions = `MODE: DOCUMENT INGESTION. Extract only facts actually visible or stated in the supplied document. Do not merge in general knowledge. Do not silently correct the document. Return strict JSON only as instructed in the user message.`;

  } else if (mode === 'qa_fast') {
    modeInstructions = `MODE: FAST Q&A. Answer immediately and compactly. Use current supplied plant context and recent conversation only when relevant. Do not ingest documents, run broad audits, or expand into unrelated systems. If a document is needed, tell the operator to use Learn from attached document.`;

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

 

CURRENT BACKEND REVISION:
- Build: ${RYAN_BUILD_ID}
- Diagnostic revision: ${RYAN_DIAGNOSTIC_REVISION}
- Code signature: ${RYAN_CODE_SIGNATURE}
- Active change set: ${RYAN_CHANGESET_12BF.join(' | ')}
- Current NGL product hydraulics: ${OPERATOR_NGL_HYDRAULICS_12AU.join(' | ')}

PLANT-WIDE SME BEHAVIOR:

- Treat control-board/HMI context as first-class plant knowledge. When CONTEXT supplies the current board/screen, loops, PV/SP/output/mode, equipment run states, valve positions, active alarms, failed permissives/interlocks, trends, or scenario state, use those exact values and relationships.
- CONTINUING CONVERSATION: use the recent USER/ASSISTANT history to resolve pronouns and short follow-ups (for example: why, what next, what about that valve, compare it to C-6200). Do not ask the operator to repeat an equipment tag or system that is unambiguous from the immediately preceding turns.
- HISTORY SAFETY: conversation history is context, not a frozen live-state source. If an older turn contains a PV/SP/valve position that conflicts with the current LIVE/SEARCH CONTEXT, the current context wins. Explicitly say when a prior value is stale or no longer present.
- CONTINUITY STYLE: answer the new question first; do not restate the entire previous answer. Briefly carry forward only the facts needed to make the follow-up understandable.

- Correlate systems instead of answering in isolation: explain upstream causes, downstream consequences, and which board/tag should confirm the diagnosis.

- Distinguish CURRENT SIMULATOR STATE from design/reference facts and historical/operator observations.

- Never claim you can see a live value, board indication, alarm, valve position, or equipment state unless it is supplied in CONTEXT.

- Flag meaningful drift toward alarm limits, likely cross-system effects, maintenance concerns, and diagnostic checks when supported by supplied data. Prefer a diagnostic check before corrective action when uncertainty remains.

- When asked what is happening now, lead with current state and active abnormal conditions before background theory.

- For process questions and troubleshooting, use the PetroSkills process-physics framework in SELECTED LEGACY KNOWLEDGE when routed: define the symptom, trace material/energy flow, identify the governing physical mechanism, check phase behavior and control-loop effects, rank causes, and state what live tag/trend would prove each cause. PetroSkills is a reasoning framework, not permission to substitute generic values for Clear Fork setpoints or procedures.

- Preserve and use previously installed PetroSkills knowledge together with newly supplied PetroSkills pages; do not treat the newest upload as replacing earlier refrigeration, cryogenic, pump, or troubleshooting knowledge.

- When asked about a control board, explain what the displayed controls/indicators do, their current states when supplied, and the process consequence of changing them.

- If a requested simulator detail is absent from CONTEXT/reference data, say what Ryan needs exposed by the simulator rather than inventing it.

- Apply CRYO_EXPERT_ENGINE_12AM when routed: use dependency relationships, 10m/3h/24h/72h trend windows, ranked proof tests, cause/effect time horizons, equipment health and maintenance prediction.
- Apply EXCHANGER_REBOILER_EXPERT_12AM for E-1221/E-1222/E-1223/E-1224 questions: preserve the verified individual passes, explain heat-integration/DP/approach effects, and trace downstream refrigeration/tower/composition consequences.

- For GENERAL INDUSTRY questions, you may use web-search results when provided by the API. Clearly separate web/general knowledge from Clear Fork-specific facts. Never let a web result overwrite a verified Clear Fork P&ID, procedure, OEM fact, or LIVE simulator value.

 

${modeInstructions}`;

 

  const activeTroubleshooting = buildActiveTroubleshootingGuide('', '');
  const reference = `SELECTED LEGACY KNOWLEDGE (treat unsourced/estimated/TBD items as PENDING_VERIFICATION):\n${JSON.stringify(selectedKnowledge)}\n\nACTIVE TROUBLESHOOTING POLICY:\n${activeTroubleshooting}\n\nLEARNED DOCUMENT KNOWLEDGE (each fact keeps its own verification status/source):\n${JSON.stringify(Array.isArray(learnedKnowledge) ? learnedKnowledge.slice(-60) : [])}`;

 

  return [

    { type: 'text', text: core },

    { type: 'text', text: reference, cache_control: { type: 'ephemeral', ttl: '1h' } },

  ];

}

 

function inferDocumentType(attachment, requestedType) {

  if (requestedType) return String(requestedType).toLowerCase();

  const label = String((attachment && attachment.label) || '').toLowerCase();

  const description = String((attachment && attachment.description) || '').toLowerCase();

  const identityText = label + ' ' + description;

  const mediaType = String((attachment && attachment.mediaType) || '').toLowerCase();

  if (/p\s*&\s*id|p\s*and\s*id|\bpid\b|piping.*instrument|process.*instrument|drawing|flowsheet|process drawing/.test(identityText)) return 'pid';

  if (/manual|oem|operation|maintenance|iom|instruction|handbook|datasheet/.test(identityText)) return 'manual';

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

  const common = `Source label: ${label || 'unnamed document'}. Return ONLY valid compact JSON, no markdown fences and no prose outside JSON. Every extracted fact must keep sourceLabel and verificationStatus="DOCUMENT_EXTRACTED_UNVERIFIED". Be comprehensive inside the assigned pass: emit every distinct readable/source-supported atomic fact that fits the pass scope; do not omit a fact merely because it seems routine. The browser persists all returned facts before displaying them. Existing P&ID Reference Library context may be supplied only to flag duplicates/conflicts; never use it to fill unreadable or missing facts in the attachment.`;

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

 

async function postJsonWithRetry(url, headers, payload, attempts = 5) {

  let last;
  const retryable = new Set([429,500,502,503,504,529]);

  for (let i = 0; i < attempts; i++) {

    try {
      last = await postJson(url, headers, payload);
    } catch (e) {
      if (i === attempts - 1) throw e;
      const waitMs = Math.min(6500, 700 * Math.pow(2, i)) + Math.floor(Math.random() * 250);
      await new Promise(r => setTimeout(r, waitMs));
      continue;
    }

    if (last.ok || !retryable.has(last.status) || i === attempts - 1) return last;

    // Anthropic 529/5xx overloads are normally transient. Give the service meaningful recovery
    // time instead of retrying three times in roughly one second. Respect Retry-After when the
    // response object exposes it; otherwise use bounded exponential backoff with jitter.
    const retryAfterRaw = last && last.headers && (last.headers['retry-after'] || last.headers['Retry-After']);
    const retryAfterMs = retryAfterRaw && !Number.isNaN(Number(retryAfterRaw)) ? Number(retryAfterRaw) * 1000 : 0;
    const waitMs = Math.max(retryAfterMs, Math.min(6500, 700 * Math.pow(2, i))) + Math.floor(Math.random() * 250);
    await new Promise(r => setTimeout(r, waitMs));

  }

  return last;

}

 

function httpRequestBuffer(method, url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method, headers: { ...(headers || {}) } }, res => {
      const chunks = []; let total = 0;
      res.on('data', chunk => { chunks.push(chunk); total += chunk.length; if (total > MAX_ATTACHMENT_BYTES) req.destroy(new Error('Downloaded source exceeds Ryan attachment ceiling.')); });
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
    });
    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error(`Source download timed out after ${REQUEST_TIMEOUT_MS} ms.`)));
    req.on('error', reject);
    req.end();
  });
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

  // Large browser uploads cannot cross Netlify's ~6 MB buffered request ceiling after base64 overhead.
  // Ryan therefore supports a server-side HTTPS source URL as an alternate transport when available.
  if (!attachment.base64 && attachment.sourceUrl) {
    const u = new URL(String(attachment.sourceUrl));
    if (u.protocol !== 'https:') throw new Error('Large-document sourceUrl must use HTTPS.');
    const fetched = await httpRequestBuffer('GET', u.toString(), { 'user-agent': 'ClearFork-Ryan/12Y' });
    if (!fetched.ok) throw new Error(`Could not download large source file (HTTP ${fetched.status}).`);
    attachment = { ...attachment, base64: fetched.body.toString('base64') };
  }

  if (!attachment.base64) throw new Error('Document learning requires base64 data, an Anthropic fileId, or an HTTPS sourceUrl.');

  const estimatedBytes = estimateBase64Bytes(attachment.base64);
  if (estimatedBytes > MAX_ATTACHMENT_BYTES) throw new Error(`Attachment exceeds Ryan server learning ceiling (${Math.round(estimatedBytes/1024/1024)} MB > ${Math.round(MAX_ATTACHMENT_BYTES/1024/1024)} MB). Use an Anthropic fileId or split the source.`);

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

  return { type: 'document', source: { type: 'file', file_id: fileId }, title: safeString(label || 'Ryan source document', 200), context: 'Structured extraction source. Citations intentionally disabled because output_config JSON schema is active; preserve page/sourceLabel fields inside extracted facts instead.' };

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

  const existing = safeString(existingContext || '', 24000);

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

      { id: 'pid_notes_specs', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 4 - DRAWING NOTES / SPECIAL DETAILS / GAPS. Extract process notes, line/service annotations, special valve notes, tie-in/continuation drawing references, explicit operating/normal-position notes, material/spec callouts, and remaining legible plant-specific details not already covered. Flag ambiguities, conflicts, and anything requiring field verification.` },
      { id: 'pid_dependency_diagnostic_index', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 5 - DEPENDENCY / DIAGNOSTIC INDEX. From relationships actually shown, extract compact source-backed upstream->downstream dependencies, controller PV/SP/final-element associations, shared headers, recycle/bypass paths, peer equipment groupings, and which measurements can prove flow/restriction/valve-response hypotheses. Do not invent physics or connections absent from the drawing.` },
      { id: 'pid_page_tag_register', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 6 - PAGE / TAG / CONTINUATION REGISTER. Build a compact retrieval index keyed by drawing/page, equipment tag, valve tag, instrument tag, line number and off-page continuation. Record the page/drawing source with every entry. Preserve duplicate tags as separate source observations when they occur on different sheets instead of silently merging them.` },
      { id: 'pid_loto_boundary_matrix', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: P&ID / PROCESS DRAWING. PASS 7 - LOTO BOUNDARY MATRIX. For each major equipment item visible, enumerate ONLY source-shown energy paths that must be checked for a draft isolation: process inlet/outlet, recycle/bypass/common header, pressure source, liquid inventory, drains/vents/blowdown, relief/PSV path, utilities, rotating/electrical/pneumatic/hydraulic energy when explicitly shown, and every off-page continuation. For each potential isolation point record tag, side of boundary, source page/drawing, and whether positive-isolation capability is actually shown. If any path lacks a proven isolation or destination, mark the boundary INCOMPLETE and executionBlocked=true. Never approve a LOTO.` }

    ];

  }

  if (documentType === 'manual') {

    return [

      { id: 'manual_applicability_specs', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 1 - APPLICABILITY / EQUIPMENT / SPECIFICATIONS. Extract manufacturer/model applicability, capacities, ratings, operating envelope, temperatures/pressures, lubrication requirements, materials, clearances, torque values, parts/specifications, and units exactly as written.` },

      { id: 'manual_controls_safety', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 2 - CONTROLS / ALARMS / SAFETY. Extract alarms, trips, permissives, shutdown conditions, warnings/cautions, instrumentation/control requirements, protective devices, and safety prerequisites stated by the manual.` },

      { id: 'manual_operations', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 3 - OPERATIONS. Extract startup, shutdown, warm-up/cool-down, loading/unloading, normal operating checks, abnormal operating guidance, and required tests actually stated.` },

      { id: 'manual_maintenance_troubleshooting', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 4 - MAINTENANCE / TROUBLESHOOTING. Extract inspection and maintenance intervals, replacement criteria, troubleshooting cause/action tables, required measurements/tests, preservation/storage instructions, consumables, and maintenance warnings. Keep OEM guidance separate from Clear Fork-specific practice unless explicitly stated.` },
      { id: 'manual_diagnostic_matrix', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 5 - DIAGNOSTIC MATRIX. Extract source-stated symptom -> possible cause -> check/test -> corrective guidance relationships, operating conditions that change capacity/temperature/pressure, and condition-monitoring indicators. Preserve OEM wording/units and do not convert family guidance into Clear Fork setpoints.` },
      { id: 'manual_page_index_crossrefs', max_tokens: limit, text: `${rules}\n\nDOCUMENT TYPE: MANUAL. PASS 6 - PAGE INDEX / CROSS-REFERENCE. Build a compact retrieval index by section/page, equipment/model applicability, alarm/trip, maintenance interval, part/specification, troubleshooting symptom and referenced figure/table. Keep page/section citations in the extracted facts so Ryan can retrieve the right small slice later instead of reloading the whole manual.` }

    ];

  }

  // Auto mode for generic PDF names. Each pass must classify the actual source from visible content.

  return [

    { id: 'auto_classify_physical', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 1 - SOURCE TYPE / PHYSICAL CONTENT. Inspect the actual PDF pages first and set documentType to pid, manual, or document from visible content, not filename alone. IF P&ID/DRAWING: extract equipment, valves, piping topology, line numbers/sizes/specs, explicit flow direction, continuations, drains/vents/bypasses and physical notes. IF MANUAL: extract applicability, equipment specs, ratings, limits, lubrication/material/parts information. IF OTHER DOCUMENT: extract only clearly stated plant-specific facts. A dense drawing with sparse prose is still useful; read graphical relationships and tag text.` },

    { id: 'auto_tags_topology', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 2 - TAG / TOPOLOGY RECOVERY. Re-inspect all visible pages. IF P&ID: visually inspect the rendered drawing itself, including piping linework, symbols, arrows, tag bubbles, continuation notes and small annotations; do not rely only on embedded/searchable PDF text. For scanned/image-only drawings, treat each page as an engineering image and recover visible topology systematically. THEN: prioritize equipment tags, instrument tags, automated/manual valve tags, line numbers, arrows, branches, shared headers, off-page connectors and upstream/downstream relationships. Convert each supported relationship into an atomic fact. IF MANUAL: prioritize model/equipment applicability and section/page indexing. Never treat absence of prose as absence of useful information.` },

    { id: 'auto_controls_operations', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 3 - CONTROLS / OPERATIONS. IF P&ID: visually inspect the rendered drawing itself, including piping linework, symbols, arrows, tag bubbles, continuation notes and small annotations; do not rely only on embedded/searchable PDF text. For scanned/image-only drawings, treat each page as an engineering image and recover visible topology systematically. THEN: extract instrumentation, sensing points, controller-transmitter-final-element relationships, signal lines, fail/normal positions, analyzers, alarms/trips/interlocks and operating notes actually shown. IF MANUAL: extract controls, alarms/trips, startup/shutdown, operations, inspections and maintenance intervals.` },

    { id: 'auto_safety_loto', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 4 - SAFETY / LOTO. IF P&ID: visually inspect the rendered drawing itself, including piping linework, symbols, arrows, tag bubbles, continuation notes and small annotations; do not rely only on embedded/searchable PDF text. For scanned/image-only drawings, treat each page as an engineering image and recover visible topology systematically. THEN: extract PSVs/relief destinations/set pressures only when visible, shutdown valves, isolation relationships, drains/vents/bleeds/blowdown, stored-pressure paths, utilities and every off-page continuation relevant to a draft LOTO boundary. IF MANUAL: extract warnings/cautions, safety prerequisites, lockout/isolation requirements and required tests. Never approve a LOTO.` },

    { id: 'auto_notes_continuations', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 5 - NOTES / CONTINUATIONS / REMAINING DETAIL. Inspect drawing notes, service labels, line specs, continuation drawing numbers, tie-ins, normal-position notes, table/legend text, revision-visible details, figures and remaining readable facts missed by earlier passes. Flag unreadable items instead of returning an empty result merely because the source is graphical or dense.` },

    { id: 'auto_retrieval_diagnostic_index', max_tokens: limit, text: `${rules}\n\nAUTO-DETECT PASS 6 - RETRIEVAL / DIAGNOSTIC INDEX. IF P&ID: visually inspect the rendered drawing itself, including piping linework, symbols, arrows, tag bubbles, continuation notes and small annotations; do not rely only on embedded/searchable PDF text. For scanned/image-only drawings, treat each page as an engineering image and recover visible topology systematically. THEN: create atomic facts tying drawing/page to equipment, valves, instruments, upstream/downstream paths, recycles/bypasses, common headers, control loops, proof measurements and LOTO-relevant continuations. IF MANUAL: index section/page by equipment/model, alarm/trip, maintenance interval, troubleshooting symptom and figure/table. This pass should recover useful indexing even when earlier extraction was sparse.` }

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

    model: FAST_MODEL,

    max_tokens: IMAGE_MAX_TOKENS,

    output_config: documentExtractionOutputConfig(),

    messages: [{ role: 'user', content }]

  };

  const result = await postJsonWithRetry('https://api.anthropic.com/v1/messages', {

    'content-type': 'application/json',

    'x-api-key': apiKey,

    'anthropic-version': ANTHROPIC_VERSION_V2,

    ...(attachment.fileId ? { 'anthropic-beta': 'files-api-2025-04-14' } : {})

  }, payload, 2);

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

 


async function prepareInteractiveDocument(attachment, documentType, existingContext, apiKey) {
  if (!attachment) throw new Error('Document learning requires an attachment.');
  const docType = inferDocumentType(attachment, documentType);
  const fileId = await uploadAttachmentToAnthropic(attachment, apiKey);
  const mediaType = String(attachment && attachment.mediaType || 'application/pdf').toLowerCase();
  const sourceLabel = safeString(attachment && attachment.label || 'Ryan source document', 200);
  const passes = buildBatchPasses(docType, fileId, sourceLabel, existingContext, mediaType);
  return { fileId, documentType: docType, mediaType, sourceLabel, passCount: passes.length, passIds: passes.map(p => p.id) };
}

async function runInteractiveDocumentPass(job, passIndex, existingContext, apiKey) {
  if (!job || !job.fileId) throw new Error('Document pass requires an uploaded fileId.');
  const docType = String(job.documentType || 'auto').toLowerCase();
  const sourceLabel = safeString(job.sourceLabel || 'Ryan source document', 200);
  const mediaType = String(job.mediaType || 'application/pdf').toLowerCase();
  const passes = buildBatchPasses(docType, job.fileId, sourceLabel, existingContext, mediaType);
  const idx = Math.max(0, Math.min(passes.length - 1, Number(passIndex || 0)));
  const pass = passes[idx];
  if (!pass) throw new Error(`Document pass ${idx} does not exist.`);
  const payload = {
    model: FAST_MODEL,
    max_tokens: Math.min(pass.max_tokens || DOC_MAX_TOKENS, DOC_MAX_TOKENS),
    output_config: documentExtractionOutputConfig(),
    messages: [{ role: 'user', content: [batchSourceBlock(job.fileId, sourceLabel, mediaType), { type: 'text', text: pass.text }] }]
  };
  const result = await postJsonWithRetry('https://api.anthropic.com/v1/messages', {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': ANTHROPIC_VERSION_V2,
    'anthropic-beta': 'files-api-2025-04-14'
  }, payload, 2);
  if (!result.ok) {
    const d = result.data || {};
    throw new Error(d.error && d.error.message ? d.error.message : `Document pass failed (HTTP ${result.status}).`);
  }
  const data = result.data || {};
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('\n');
  const parsed = parseJsonReply(text);
  const partialFacts = !parsed ? parsePartialFactsFromTruncatedJson(text) : [];
  const facts = parsed && Array.isArray(parsed.facts) ? parsed.facts : (Array.isArray(parsed) ? parsed : partialFacts);
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
  }).slice(0, FACTS_PER_PASS);
  const usage = data.usage || {};
  return {
    passIndex: idx,
    passId: pass.id,
    facts: cleaned,
    warnings: [...(parsed && parsed.warnings || []), ...(!parsed ? [`Pass output needed recovery (stop_reason=${data.stop_reason || 'unknown'}).`] : [])],
    stopReason: data.stop_reason || null,
    usage: { inputTokens: Number(usage.input_tokens || 0), outputTokens: Number(usage.output_tokens || 0) }
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

 

    const effectiveMode = String(mode || 'qa').toLowerCase();

    if (effectiveMode === 'health') {
      return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID, 'x-ryan-diagnostic': RYAN_DIAGNOSTIC_REVISION }, body: JSON.stringify({ ok: true, buildId: RYAN_BUILD_ID, diagnosticRevision: RYAN_DIAGNOSTIC_REVISION, codeSignature: RYAN_CODE_SIGNATURE, changeSet: RYAN_CHANGESET_12BF, sourceBaseline: RYAN_SOURCE_BASELINE, largeDocumentBatchLearning: false, interactiveDocumentPassLearning: true, supportsAnthropicFileId: true, supportsHttpsSourceUrl: true, fastGenericProcessPath: true, genericWebResearch: true, operatorDecisionEngine: true, whatChangedEngine: true, readinessChecks: true, lotoPidAuditEngine: true, pidBoundaryMatrix: true, pidPageTagIndex: true, manualPageIndex: true, exchangerReboilerExpert: true, diagnosticConfidence: true, emptyReplyRecovery: true, autoPdfSixPass: true, attachmentDescriptionClassification: true, conversationalFollowups: true, persistentThreadContext: true, historyLiveStatePrecedence: true, fastQaModel: FAST_MODEL, simpleChatAttachmentIsolation: true, localPdfDropWithoutHttps: true, boundedImageLearning: true, perPassPartialSuccess: true, structuredExtractionCitationsDisabled: true, learnedDocumentRetrieval: true, learnedSummaryFastPath: true, learnedFactReportAll: true, learnedFactRetentionCap: 5000, learnedPromptFactCap: 60, maxHistoryTurns: MAX_HISTORY_TURNS, netlifyBufferedPayloadMB: 6, safeBrowserBinaryMB: 4 }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { statusCode: 500, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set on the server.', buildId: RYAN_BUILD_ID, diagnosticRevision: RYAN_DIAGNOSTIC_REVISION }) };

    if (clientBuild && String(clientBuild) !== RYAN_BUILD_ID) {

      return { statusCode: 409, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: `Ryan version mismatch: client ${clientBuild}, backend ${RYAN_BUILD_ID}. Deploy the matching index.html and ryan.js together.`, buildId: RYAN_BUILD_ID }) };

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

 

    // Interactive document learning: upload once, then run one bounded extraction pass per request.
    // This avoids Message Batches sitting in_progress for an interactive operator workflow.
    if (effectiveMode === 'digest_prepare') {
      if (!attachment) return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Document learning requires an attachment.' }) };
      try {
        const job = await prepareInteractiveDocument(attachment, documentType, context, apiKey);
        return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ buildId: RYAN_BUILD_ID, job }) };
      } catch (e) {
        return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: `Could not prepare document learning: ${e.message || e}`, buildId: RYAN_BUILD_ID }) };
      }
    }
    if (effectiveMode === 'digest_pass') {
      const job = body && body.job;
      const passIndex = Number(body && body.passIndex || 0);
      if (!job || !job.fileId) return { statusCode: 400, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'Missing interactive document job/fileId.' }) };
      try {
        const pass = await runInteractiveDocumentPass(job, passIndex, context, apiKey);
        return { statusCode: 200, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ buildId: RYAN_BUILD_ID, pass }) };
      } catch (e) {
        return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: `Document pass ${passIndex + 1} failed: ${e.message || e}`, buildId: RYAN_BUILD_ID, passIndex }) };
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

    const fastQa = effectiveMode === 'qa_fast';
    const ctx = safeString(context, fastQa ? 22000 : MAX_CONTEXT_CHARS);

    const plantSpecificQuery = isPlantSpecificQuery(msg, ctx, effectiveMode);
    const webResearchRequested = wantsWebResearch(msg, effectiveMode) && !plantSpecificQuery;
    const selectedKnowledge = selectKnowledge(msg, ctx, effectiveMode);

    const system = buildSystemPrompt(effectiveMode, selectedKnowledge, learnedKnowledge);

    const messages = sanitizeHistory(history);
    if (fastQa && messages.length > 6) messages.splice(0, messages.length - 6);

    const userContent = [];

 

    if (attachment) {

      const block = attachmentToContentBlock(attachment);

      if (block) userContent.push(block);

    }

 

    let userText = msg;

    if (!userText && attachment && String(attachment.mediaType || '').toLowerCase().startsWith('image/')) userText = 'Analyze the attached plant image carefully. Describe what is actually visible, identify legible tags/values/controls, relate it to supplied plant context, and clearly mark anything unreadable or uncertain instead of guessing.';

    if (ctx && plantSpecificQuery) userText += `\n\n--- LIVE/SEARCH CONTEXT ---\n${ctx}`;
    else if (ctx && !plantSpecificQuery) userText += `\n\n--- LIMITED CONTEXT NOTE ---\nA simulator context was available but omitted from this generic industry question for speed. Ask a Clear Fork/tag-specific question if plant state is needed.`;

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

    const operatorToolModes = new Set(['recommend','forecast','health_profile','maintenance','instructor','what_changed','readiness','operator_brief','audit']);
    const maxTokens = fastQa ? 1100 : (isIngest ? (ingestType === 'image' ? IMAGE_MAX_TOKENS : DOC_MAX_TOKENS) : (effectiveMode === 'scan' ? 5000 : (isMemoryExtract ? 1200 : (isLotoWorkplan ? 5200 : (operatorToolModes.has(effectiveMode) ? 3200 : (plantSpecificQuery ? 2400 : 1400))))));

    const webTools = webResearchRequested ? [{ type: 'web_search_20250305', name: 'web_search', max_uses: 4 }] : [];
    const requestModel = fastQa ? FAST_MODEL : MODEL_V2;
    const payload = { model: requestModel, max_tokens: maxTokens, system, messages, ...(webTools.length ? { tools: webTools } : {}), ...(isLotoWorkplan ? { output_config: lotoWorkplanOutputConfig() } : {}) };

 

    let result;

    try {

      result = await postJsonWithRetry('https://api.anthropic.com/v1/messages', {

        'content-type': 'application/json',

        'x-api-key': apiKey,

        'anthropic-version': ANTHROPIC_VERSION_V2,

        ...((attachment && attachment.fileId) || webResearchRequested ? { 'anthropic-beta': [attachment && attachment.fileId ? 'files-api-2025-04-14' : null, webResearchRequested ? 'web-search-2025-03-05' : null].filter(Boolean).join(',') } : {}),

      }, payload);

    } catch (networkErr) {

      return { statusCode: 502, body: JSON.stringify({ error: `Could not reach Anthropic API: ${networkErr.message || 'network error'}` }) };

    }

 

    if (!result.ok) {

      const d = result.data;

      const apiMessage = d && d.error && d.error.message ? d.error.message : `Anthropic API error (HTTP ${result.status})`;
      const overloaded = result.status === 529 || /overload|overloaded|capacity/i.test(String(apiMessage));

      return {
        statusCode: result.status === 413 ? 413 : (overloaded ? 503 : 502),
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID, ...(overloaded ? { 'retry-after': '10' } : {}) },
        body: JSON.stringify({
          error: overloaded ? 'Anthropic is temporarily overloaded. Ryan retried automatically but the upstream service is still busy. Wait about 10 seconds and retry; this is not a Ryan deployment/version problem.' : apiMessage,
          upstreamError: apiMessage,
          upstreamStatus: result.status,
          retryable: overloaded,
          buildId: RYAN_BUILD_ID,
          diagnosticRevision: RYAN_DIAGNOSTIC_REVISION
        })
      };

    }

 

    let data = result.data || {};
    const initialData = data;

    function visibleReplyFromData(d) {
      return (d && d.content || []).filter(block => block && block.type === 'text' && typeof block.text === 'string').map(block => block.text).join('\n').trim();
    }

    let reply = visibleReplyFromData(data);

    // Some reasoning-heavy requests can consume the entire output budget before a visible final answer is emitted.
    // A successful HTTP response with zero visible text is not a successful Ryan answer. Recover once with a concise-final request.
    const recoverableTextMode = !isIngest && !isMemoryExtract && !isLotoWorkplan;
    if (!reply && recoverableTextMode) {
      const recoveryMessages = messages.map(m => ({ ...m, content: Array.isArray(m.content) ? m.content.slice() : m.content }));
      const finalInstruction = { type: 'text', text: 'Return the FINAL OPERATOR-FACING ANSWER now. No hidden analysis, no preamble. Be concise and actionable. Use at most 8 bullets and include confidence / fastest proof check when relevant.' };
      if (recoveryMessages.length && recoveryMessages[recoveryMessages.length - 1].role === 'user' && Array.isArray(recoveryMessages[recoveryMessages.length - 1].content)) recoveryMessages[recoveryMessages.length - 1].content.push(finalInstruction);
      else recoveryMessages.push({ role: 'user', content: [finalInstruction] });
      const recoveryPayload = { model: requestModel, max_tokens: fastQa ? 1100 : 2600, system, messages: recoveryMessages };
      const recovery = await postJsonWithRetry('https://api.anthropic.com/v1/messages', {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION_V2
      }, recoveryPayload);
      if (recovery.ok && recovery.data) {
        data = recovery.data;
        reply = visibleReplyFromData(data);
      }
    }

    if (!reply && recoverableTextMode) {
      return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: 'Ryan received an upstream response but no visible final answer was produced. Retry once; if it repeats, check the Anthropic response/stop reason in the Netlify log.', buildId: RYAN_BUILD_ID, diagnosticRevision: RYAN_DIAGNOSTIC_REVISION, upstreamStopReason: data && data.stop_reason || null }) };
    }

    const webSearchBlocks = (data.content || []).filter(block => block && (block.type === 'web_search_tool_result' || block.type === 'server_tool_use'));
    const usedWebSearch = webResearchRequested && webSearchBlocks.length > 0;

    const usage = data.usage || {};
    const initialUsage = initialData && initialData !== data ? (initialData.usage || {}) : {};

    const inputTokens = Number(usage.input_tokens || 0) + Number(initialUsage.input_tokens || 0);

    const outputTokens = Number(usage.output_tokens || 0) + Number(initialUsage.output_tokens || 0);

    const costUsd = (inputTokens * INPUT_PRICE_PER_MILLION + outputTokens * OUTPUT_PRICE_PER_MILLION) / 1_000_000;

 

    let parsedWorkplan = null;

    if (effectiveMode === 'loto_workplan') {

      try { parsedWorkplan = JSON.parse(reply); } catch (e) {

        return { statusCode: 502, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-ryan-build': RYAN_BUILD_ID }, body: JSON.stringify({ error: 'Ryan produced an unreadable LOTO/work-plan object. No work plan was saved. Retry the request.', buildId: RYAN_BUILD_ID }) };

      }

      parsedWorkplan.fieldVerificationRequired = true;
      const lotoBlockers = [];
      const missing = Array.isArray(parsedWorkplan.missingInformation) ? parsedWorkplan.missingInformation : [];
      const conflicts = Array.isArray(parsedWorkplan.conflictsAndAmbiguities) ? parsedWorkplan.conflictsAndAmbiguities : [];
      const continuations = Array.isArray(parsedWorkplan.continuationDrawings) ? parsedWorkplan.continuationDrawings : [];
      const markers = [].concat(parsedWorkplan.isolationPoints || [], parsedWorkplan.blowdownPoints || [], parsedWorkplan.psvMarkers || []);
      if (missing.length) lotoBlockers.push('missing information');
      if (conflicts.length) lotoBlockers.push('unresolved conflicts/ambiguities');
      if (markers.some(m => /PENDING VERIFICATION|UNKNOWN|UNREADABLE/i.test(`${m && m.tag || ''} ${m && m.sourceDrawing || ''} ${m && m.verification || ''}`))) lotoBlockers.push('unverified marker/tag/source');
      if (continuations.some(x => /MISSING|PENDING|UNKNOWN|UNAVAILABLE/i.test(String(x)))) lotoBlockers.push('missing continuation drawing');
      parsedWorkplan.executionBlocked = Boolean(parsedWorkplan.executionBlocked || lotoBlockers.length);
      parsedWorkplan.status = parsedWorkplan.executionBlocked ? 'DRAFT - INCOMPLETE' : 'DRAFT - NOT APPROVED';
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

      meta: { model: requestModel, mode: effectiveMode, buildId: RYAN_BUILD_ID, diagnosticRevision: RYAN_DIAGNOSTIC_REVISION, codeSignature: RYAN_CODE_SIGNATURE, knowledgeSections: Object.keys(selectedKnowledge), plantSpecificQuery, webResearchRequested, usedWebSearch, stopReason: data.stop_reason || null }

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
module.exports.CLEAR_FORK_INTERLOCK_UPDATE_20260812 = CLEAR_FORK_INTERLOCK_UPDATE_20260812;

module.exports.FINAL_PID_MASTER_KNOWLEDGE = FINAL_PID_MASTER_KNOWLEDGE;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09J = OPERATOR_PROCESS_KNOWLEDGE_09J;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09K = OPERATOR_PROCESS_KNOWLEDGE_09K;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09L = OPERATOR_PROCESS_KNOWLEDGE_09L;

module.exports.OPERATOR_PROCESS_KNOWLEDGE_09M = OPERATOR_PROCESS_KNOWLEDGE_09M;
module.exports.OPERATOR_PROCESS_KNOWLEDGE_0811 = OPERATOR_PROCESS_KNOWLEDGE_0811;
module.exports.OPERATOR_PROCESS_KNOWLEDGE_0812Y = OPERATOR_PROCESS_KNOWLEDGE_0812Y;
module.exports.CRYO_EXPERT_ENGINE_12AM = CRYO_EXPERT_ENGINE_12AM;
module.exports.EXCHANGER_REBOILER_EXPERT_12AM = EXCHANGER_REBOILER_EXPERT_12AM;
module.exports.buildActiveTroubleshootingGuide = buildActiveTroubleshootingGuide;

module.exports._test = { selectKnowledge, isPlantSpecificQuery, hasClearForkTag, inferDocumentType, parseJsonReply, parsePartialFactsFromTruncatedJson, sanitizeHistory, attachmentToContentBlock, buildBatchPasses, buildSystemPrompt };

module.exports.RYAN_BUILD_ID = RYAN_BUILD_ID;
module.exports.RYAN_DIAGNOSTIC_REVISION = RYAN_DIAGNOSTIC_REVISION;
module.exports.RYAN_CODE_SIGNATURE = RYAN_CODE_SIGNATURE;
module.exports.RYAN_CHANGESET_12BF = RYAN_CHANGESET_12BF;
module.exports.OPERATOR_NGL_HYDRAULICS_12AU = OPERATOR_NGL_HYDRAULICS_12AU;

/* 12BX PetroSkills reference expansion: reciprocating compressors, process drawings, phase behavior, mass transfer.
   Source-derived logic may be used to diagnose/correct simulator behavior, but plant-specific values/tags remain governed by verified Clear Fork P&IDs and documents. */
window.RYAN_REFERENCE_LIBRARY = window.RYAN_REFERENCE_LIBRARY || {};
window.RYAN_REFERENCE_LIBRARY.petroskills_12BX = {
  title: 'PetroSkills operator reference expansion 12BX',
  categories: {
    reciprocating_compressors: {
      topics: [
        'piston, rings, rod, cylinder, suction/discharge valves, packing',
        'clearance pockets and valve lifters/unloaders',
        'cylinder and packing lubrication, divider blocks, oil alarms/shutdowns',
        'compressor cylinder cooling and frame lubrication',
        'crosshead, connecting rod, crankshaft/frame',
        'pulsation damping, suction/discharge bottles, vibration',
        'rod load and rod reversal, effects of loading/unloading and valve failures',
        'electric motor and natural gas engine driver considerations'
      ],
      simulator_guidance: [
        'Loaded starts for reciprocating compressors should be treated as abnormal unless verified plant logic specifically allows them.',
        'Low frame oil pressure and high frame oil temperature are valid protective-trip concepts; exact trip values must come from verified plant documents.',
        'Cylinder temperature, valve condition, lubrication flow, unloading state, speed and suction/discharge conditions should interact dynamically rather than as isolated indicators.',
        'Improper unloading or failed suction/discharge valves can impair rod reversal and should influence mechanical health/vibration/temperature behavior.',
        'Pulsation damping devices reduce harmful pulsation/vibration but do not eliminate pulsation.'
      ]
    },
    process_drawings: {
      topics: [
        'BFD vs PFD vs P&ID information levels',
        'control valve, controller, indicator and signal-line symbology',
        'instrument location/function symbols',
        'process piping, bypasses, drains, flares, utilities, spec breaks and off-page connectors',
        'equipment tags and descriptive notes'
      ],
      simulator_guidance: [
        'Use P&IDs as the highest-detail drawing basis for simulator topology and control relationships.',
        'Do not infer valve action, fail position, exact controller type, line spec, or hidden internals unless the verified drawing or supporting document identifies them.',
        'PFDs and BFDs can support process intent, but P&IDs control equipment/line/instrument detail when conflicts occur.'
      ]
    },
    phase_behavior: {
      topics: [
        'single-component P-T-V behavior, triple point and critical point',
        'multi-component phase envelopes, bubble point, dew point, quality lines',
        'cricondenbar, cricondentherm and retrograde condensation',
        'pump suction cavitation relationship to vapor pressure',
        'pipeline hydrocarbon dewpoint behavior',
        'flash separation and fractionation phase envelopes'
      ],
      simulator_guidance: [
        'Phase state should respond jointly to pressure, temperature and composition.',
        'Crossing dewpoint can create liquid from gas; crossing bubblepoint can create vapor from liquid.',
        'Pump cavitation risk should increase when suction pressure margin over vapor pressure is lost.',
        'Flash separator vapor and liquid products should have different compositions and therefore different phase envelopes.',
        'Do not use generic phase-envelope numbers as Clear Fork plant values unless verified by plant-specific analysis.'
      ]
    },
    mass_transfer: {
      topics: [
        'absorption, stripping and fractionation',
        'tray towers, downcomers, weirs, bubble-cap/sieve/valve trays',
        'packed towers, structured/random packing and liquid distribution',
        'equilibrium stages, tray efficiency and HETP',
        'relative volatility, reflux, reboilers and condensers',
        'stabilization, absorber/contactors and stripper/regenerator operation'
      ],
      simulator_guidance: [
        'Mass-transfer performance should depend on vapor/liquid rates, contact area, mixing, temperature, pressure, solvent condition and number/quality of contacts.',
        'Absorption is favored by conditions that maintain a concentration driving force into the solvent; stripping uses the opposite driving direction.',
        'Reflux directly affects overhead separation/composition; reboiler heat strongly affects bottoms stripping/composition.',
        'Tower flooding, weeping, poor distribution, inadequate reflux, low reboiler duty and degraded solvent should produce coherent performance symptoms rather than single-value failures.',
        'Use these relationships to audit simulator behavior without overriding verified Clear Fork-specific control narratives.'
      ]
    }
  },
  source_policy: 'Training/reference logic may explain or correct simulator relationships. Clear Fork-specific tags, limits, lineups, permissives, trips, setpoints and equipment details require verified plant sources; unknowns remain pending verification.'
};

/* 12BY: Full Atlas Copco Order 1039 expander manual verification installed above in OEM_MANUAL_KNOWLEDGE.expanderBooster. */
