/**
 * Ryan AI Backend — Clearfork Cryogenic Unit #1 Simulator
 * COMPLETE WITH ALL SYSTEMS: Stabilizer, Overhead Compressor, Control Valves, Pumps
 * August 8, 2026
 */
 
const fetch = require('node-fetch');
 
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
      reliefValves: [
        { tag: 'PSV-1521', setPoint: 'TBD', destination: 'Vent or atmosphere' },
      ],
      depressurizationMethod: 'Via XV-1521-6 vent after XV-1521-5 isolation',
    },
    'P-5060': {
      name: 'Stabilizer Booster Pump #1',
      type: 'Centrifugal pump',
      service: 'Recirculate stabilizer bottoms through cooler to feed inlet',
      feedSource: 'V-1521 sump (gravity)',
      dischargeDestination: 'Through AC-5055 cooler to stabilizer feed inlet',
      isolationValves: [
        { tag: 'XV-5060-1', location: 'Pump inlet (check valve)' },
        { tag: 'XV-5060-2', location: 'Pump discharge manual block' },
      ],
      controlValve: 'LCV-5060 on discharge',
      pressureRelief: { tag: 'PSV-5060', setPoint: '~100-120 psi' },
    },
    'P-5065': {
      name: 'Stabilizer Booster Pump #2',
      type: 'Centrifugal pump',
      service: 'Standby or parallel operation with P-5060',
      feedSource: 'V-1521 sump (gravity)',
      dischargeDestination: 'Through AC-5055 cooler to stabilizer feed inlet',
      isolationValves: [
        { tag: 'XV-5065-1', location: 'Pump inlet (check valve)' },
        { tag: 'XV-5065-2', location: 'Pump discharge manual block' },
      ],
      pressureRelief: { tag: 'PSV-5065', setPoint: '~120-150 psi' },
    },
    'AC-5055': {
      name: 'Stabilizer Product Cooler',
      type: 'Air-cooled heat exchanger',
      service: 'Cool booster pump discharge from stabilizer',
      inlet: 'From P-5060/5065 discharge',
      outlet: 'To stabilizer feed inlet (split-feed recycle)',
      coolingMedium: 'Air (fan-cooled)',
      temperatureControl: 'Fan speed modulation or bypass valve',
      isolationValves: [
        { tag: 'XV-5055-1', location: 'Cooler inlet' },
        { tag: 'XV-5055-2', location: 'Cooler outlet' },
      ],
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
      name: 'Overhead Compressor (C-5700)',
      type: 'Reciprocating, double-acting, two-stage',
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
      reliefValve: {
        tag: 'PSV-5700',
        type: 'Pilot-operated, recirculating type',
        setPoint: '~620 psi (estimated — requires nameplate verification)',
        destination: 'Pilot-operated recycle to suction via orifice',
        function: 'Protects compressor discharge at ~600 psi HH alarm; may activate pilot unload'
      },
      oilSystem: {
        type: 'Pressure-fed full-lube',
        cooler: 'Built-in or external oil cooler',
        pressureMinimum: '35-45 psi',
        temperatureNormal: '100-180°F',
        temperatureLimit_H: '180°F (alarm setpoint)',
        temperatureLimit_HH: '200°F (shutdown setpoint)',
        temperatureLimit_Start: 'Minimum 40°F required to load compressor (cold-start sump heater)',
      },
      unloadingMechanism: {
        suction: 'Unloader actuated when suction pressure < 150 psi (LL) — reduces work, prevents cavitation',
        discharge: 'Relief opens when discharge > 600 psi (HH) — may activate pilot unload',
        description: 'Suction valves held open by pilot air; when air exhausted, suction closes and compressor loads normally',
      },
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
 
  operatingLimits: {
    minSuctionPressure: '150 psi (below which unloader activates, compressor unloads)',
    maxDischargeTemperature: '300°F (throw outlet limit — HH alarm)',
    maxOilTemperature: '200°F (shutdown setpoint HH)',
    minOilTemperature_Start: '40°F (sump heater active below this)',
    minOilTemperature_Load: '40°F (permissive to load)',
    maxOilTemperature_Load: '180°F (maximum to load without cooler fan)',
    maxDischargeTemperature_Normal: '300°F (throw outlet)',
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
    tag: 'PCV-1438',
    name: 'Discharge Pressure Control Valve',
    manufacturer: 'Fisher Controls International LLC',
    type: 'Type 667 Proportional Pilot-Operated Control Valve',
    service: 'Discharge pressure modulation on V-1040 or similar residue vessel',
    
    actuator: {
      serialNumber: 'F002239151',
      type: '667 (Fisher proportional)',
      spoolSize: '70i',
      travel: '2 inches',
      benchSet: '10-30 psi (tuning/sensitivity range)',
      pressureUnits: 'PSI',
      operatingRange_PilotAir: '0-33 psi',
    },
    
    body: {
      serialNumber: 'F002239151',
      type: '51 (Fisher valve body)',
      portSize: '4" inlet/outlet',
      portConnection: '4-3/8" BSP',
      rating: 'CL600/1500 PSI CWP (high-pressure class)',
      materials: {
        plug: 'SST (Stainless Steel Trim)',
        stem: 'SST (Stainless Steel)',
        body: 'STL (Carbon Steel)',
        seat: 'SST (Stainless Steel)',
      },
    },
    
    function: 'Proportional pressure reduction. Modulates discharge flow to maintain setpoint. 0-33 psi pilot air controls valve opening.',
    maintenance: {
      pilotAirVerification: 'Check continuous 0-33 psi pilot air supply',
      seatLeakage: 'Monitor for weeping; indicates seat wear',
      benchSetTuning: '10-30 psi tuning allows sensitivity adjustment',
    },
  },
 
  LCV_1241: {
    tag: 'LCV-1241',
    name: 'Stabilizer Sump Level Control Valve',
    manufacturer: 'Fisher Controls International LLC',
    type: 'Type EWT (Explorer Wide Temperature) Proportional Pilot-Operated Control Valve',
    service: 'V-1521 Stabilizer bottoms level modulation',
    
    actuator: {
      serialNumber: 'F001757111',
      type: '667 (Fisher proportional)',
      spoolSize: '45i',
      travel: '2 inches',
      benchSet: '10-30 psi (tuning/sensitivity range)',
      pressureUnits: 'PSI',
      operatingRange_PilotAir: '0-33 psi',
    },
    
    body: {
      serialNumber: 'F001737111',
      type: 'EWT (Explorer Wide Temperature)',
      ports: '4X4" (4" inlet/outlet)',
      portSize: '4-3/8"',
      rating: 'CL150/290 PSI CWP (standard pressure class)',
      materials: {
        plug: 'SST/HF (Stainless Steel with Hardface)',
        stem: 'SST (Stainless Steel)',
        body: 'STL (Carbon Steel)',
        seat: 'SST/HF (Stainless Steel with Hardface)',
      },
    },
    
    function: 'Proportional level control. Modulates sump drain based on level transmitter signal. LT-5060 generates pilot air signal.',
    operatingLogic: {
      lowLevel_LL: 'Pilot air reduced, valve closes, level rises',
      normalLevel_50pct: 'Pilot air ~16.5 psi, valve mid-stroke, level stable',
      highLevel_HH: 'Pilot air increased, valve opens, level reduces',
    },
    
    maintenance: {
      pilotAirSupply: 'Verify 0-33 psi pilot air',
      levelTransmitter: 'Check LT-5060 calibration (4-20mA)',
      seatInspection: 'Hardface seat for durability',
      benchSetTuning: '10-30 psi tuning for proportional gain',
    },
  },
};
 
// ===== PUMP MAINTENANCE KNOWLEDGE =====
 
const PUMP_MAINTENANCE_KNOWLEDGE = {
  P_1630: {
    tag: 'P-1630',
    name: 'Booster Pump (Recirculation Duty)',
    service: 'Recirculate stabilizer bottoms through cooler (AC-5055)',
    type: 'Centrifugal pump',
    
    oilSpecifications: {
      capacity: '4 quarts per pump',
      changeInterval: '2000 operating hours or annually (whichever comes first)',
      viscosityGrade: 'ISO 68 (all acceptable oils are ISO 68)',
      acceptableOilOptions: [
        'Mobil 1 SHC 626 (ISO 68)',
        'Phillips Syncon R&O Oil 68 (ISO 68)',
        'Royall Supply Synfill GT68 (ISO 68)',
      ],
      substitution: 'Any of the three acceptable. Do NOT mix without flushing sump.',
    },
    
    maintenance_schedule: {
      everyShift: 'Check oil level via dipstick.',
      every500hrs: 'Perform oil analysis (wear metals, acid number, water).',
      every2000hrs: 'Routine oil change.',
      annually: 'Full pump inspection (bearings, seals, impeller).',
    },
  },
 
  P_1635: {
    tag: 'P-1635',
    name: 'Booster Pump (Suction System)',
    service: 'Primary booster pump',
    type: 'Centrifugal pump',
    note: 'Identical to P-1630 specifications',
    
    oilSpecifications: {
      capacity: '4 quarts per pump',
      changeInterval: '2000 operating hours or annually (whichever comes first)',
      viscosityGrade: 'ISO 68',
      acceptableOilOptions: [
        'Mobil 1 SHC 626 (ISO 68)',
        'Phillips Syncon R&O Oil 68 (ISO 68)',
        'Royall Supply Synfill GT68 (ISO 68)',
      ],
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
    'Oil_Pressure': { LL_no_alarm: null, L: 50, tag: 'PT-6206' },
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
 
// ===== RYAN AI HANDLER =====
 
async function handleRyanRequest(mode, userPrompt, plantState, currentScreen) {
  const systemPrompt = `You are Ryan, an AI assistant for Clearfork Cryogenic Processing Unit #1.
 
You have detailed expertise in:
- Stabilizer System (V-1521, P-5060/5065, AC-5055) with full LOTO procedures
- Overhead Compressor (C-5700) with alarm parameters and control logic
- Residue Compressors (C-6100, C-6200, C-6300) with multi-stage configuration
- Control Valves (PCV-1438, LCV-1241) with proportional pilot-air logic
- Pump Maintenance (P-1630, P-1635) with oil specifications and change intervals
- All equipment tag numbers, isolation valves, relief valves, instrumentation
 
When asked to:
- "Build a LOTO for [equipment]": Provide step-by-step isolation procedure with specific tag numbers
- "What are the alarm setpoints for [compressor]": Give complete LL, L, H, HH parameters
- "What isolates [equipment]": List all manual isolation valves with functions
- "What oil goes in [pump]": Cite nameplate data with all three acceptable options
- "How does [system] work": Explain with equipment tags and control logic
 
Provide accurate, field-verified information citing specific nameplate data and P&ID references.`;
 
  const userMessage = `${userPrompt}
 
Current context:
- Mode: ${mode}
- Screen: ${currentScreen}
 
Available systems: Stabilizer (V-1521), Overhead Compressor (C-5700), Residue Compressors (C-6100/6200/6300), Control Valves (PCV-1438, LCV-1241), Pumps (P-1630, P-1635)`;
 
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: userMessage,
          }
        ],
        system: systemPrompt,
      }),
    });
 
    if (!response.ok) {
      const error = await response.text();
      return { error: `API Error: ${response.status}` };
    }
 
    const data = await response.json();
    const text = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
 
    return {
      response: text,
      mode,
      timestamp: new Date().toISOString(),
      cost: {
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        costUSD: ((data.usage.input_tokens * 0.003 + data.usage.output_tokens * 0.015) / 1000).toFixed(4),
      },
    };
  } catch (err) {
    return { error: err.message };
  }
}
 
// ===== EXPORT =====
 
module.exports = {
  STABILIZER_KNOWLEDGE,
  OVERHEAD_COMPRESSOR_KNOWLEDGE,
  CONTROL_VALVE_KNOWLEDGE,
  PUMP_MAINTENANCE_KNOWLEDGE,
  RESIDUE_COMPRESSOR_KNOWLEDGE,
  handleRyanRequest,
};
