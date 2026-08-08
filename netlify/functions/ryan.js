/**
 * Ryan AI Backend — Clearfork Cryogenic Unit #1 Simulator
 * UPDATED with Field-Verified Control Valve & Pump Nameplate Data
 * August 8, 2026
 */
 
const fetch = require('node-fetch');
 
// ===== FIELD-VERIFIED CONTROL VALVE KNOWLEDGE =====
 
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
      description: 'Proportional spool controlled by pilot air signal. 0 psi pilot = closed, 33 psi pilot = full open. Intermediate pilot pressures proportionally throttle flow.',
    },
    
    body: {
      serialNumber: 'F002239151',
      type: '51 (Fisher valve body designation)',
      portSize: '4" inlet/outlet',
      portConnection: '4-3/8" BSP',
      rating: 'CL600/1500 PSI CWP (high-pressure class)',
      materials: {
        plug: 'SST (Stainless Steel Trim)',
        stem: 'SST (Stainless Steel)',
        body: 'STL (Carbon Steel)',
        seat: 'SST (Stainless Steel)',
        description: 'Stainless trim provides corrosion resistance; steel body provides strength',
      },
    },
    
    function: 'Proportional pressure reduction valve. Modulates discharge flow to maintain setpoint pressure. Receives 0-33 psi pilot air signal from pressure controller. As pilot pressure increases, spool opens proportionally, reducing downstream pressure.',
    
    operatingLogic: {
      lowPressure: 'If downstream pressure < setpoint, controller reduces pilot air, PCV-1438 closes, restricts flow, pressure rises',
      normal: 'At setpoint, pilot air maintains valve at stable position',
      highPressure: 'If downstream pressure > setpoint, controller increases pilot air, PCV-1438 opens wider, allows more flow, pressure reduces',
    },
    
    applications: [
      'Backpressure control on booster pump discharge',
      'Pressure reducing valve for downstream equipment protection',
      'Recycle line pressure maintenance',
    ],
    
    maintenance: {
      pilotAirVerification: 'Check continuous 0-33 psi pilot air supply from main plant air system (must be filtered/regulated)',
      seatLeakage: 'Monitor for continuous weeping at outlet. Persistent leakage indicates seat wear; requires seat refacing or valve replacement',
      benchSetTuning: '10-30 psi tuning allows adjustment of proportional sensitivity. Higher setting = more responsive, lower setting = less sensitive',
      frequencyCheck: 'Verify operation during shift rounds; check for pressure oscillation or sluggish response',
    },
  },
 
  LCV_1241: {
    tag: 'LCV-1241',
    name: 'Stabilizer Sump Level Control Valve',
    manufacturer: 'Fisher Controls International LLC',
    type: 'Type EWT (Explorer Wide Temperature) Proportional Pilot-Operated Control Valve',
    service: 'V-1521 Stabilizer bottoms level modulation. Drains sump based on level signal.',
    
    actuator: {
      serialNumber: 'F001757111',
      type: '667 (Fisher proportional)',
      spoolSize: '45i',
      travel: '2 inches',
      benchSet: '10-30 psi (tuning/sensitivity range)',
      pressureUnits: 'PSI',
      operatingRange_PilotAir: '0-33 psi',
      description: 'Proportional spool controlled by pilot air from level controller. Pilot air varies 0-33 psi based on level transmitter signal.',
    },
    
    body: {
      serialNumber: 'F001737111',
      type: 'EWT (Explorer Wide Temperature variant)',
      portSize: '4" inlet, 4" outlet (4X4)',
      portConnection: '4-3/8" BSP',
      rating: 'CL150/290 PSI CWP (standard pressure class)',
      materials: {
        plug: 'SST/HF (Stainless Steel with Hardface)',
        stem: 'SST (Stainless Steel)',
        body: 'STL (Carbon Steel)',
        seat: 'SST/HF (Stainless Steel with Hardface)',
        description: 'Hardface trim (plug & seat) provides superior erosion/corrosion resistance for long valve life',
      },
    },
    
    function: 'Proportional level control valve. Modulates sump drain flow to maintain stabilizer level at setpoint. Receives 0-33 psi pilot air signal derived from level transmitter reading.',
    
    controlLoop: {
      step1: 'Level Transmitter (LT-5060) reads V-1521 sump level continuously (0-100% range)',
      step2: 'Level Controller compares LT signal to setpoint (typically 50%). Outputs proportional 4-20mA signal.',
      step3: 'Pneumatic I/P Converter transforms 4-20mA to proportional pilot air 0-33 psi',
      step4: 'LCV-1241 proportionally opens/closes based on pilot air. Spool position controls bottoms drain flow.',
      atSetpoint: 'At 50% level setpoint, pilot air = ~16.5 psi, valve at mid-stroke (50% open)',
    },
    
    operatingLogic: {
      lowLevel_LL: 'If level < setpoint (e.g., 40%), controller reduces pilot air. LCV-1241 closes partially. Drain flow decreases. Level rises back to setpoint.',
      normalLevel_50pct: 'At setpoint (50%), pilot air maintains valve at stable mid-stroke position. Inflow = outflow. Level stable.',
      highLevel_HH: 'If level > setpoint (e.g., 60%), controller increases pilot air. LCV-1241 opens wider. Drain flow increases. Level drops back to setpoint.',
      proportionalResponse: 'Valve responds proportionally to any level deviation. Continuous modulation prevents overshoot.',
    },
    
    maintenance: {
      pilotAirSupply: 'Verify 0-33 psi pilot air supply to valve actuator. Check main air regulators and filters.',
      levelTransmitter: 'Check LT-5060 calibration (should read 4-20mA for 0-100% level). Verify wiring connections.',
      seatInspection: 'Hardface seat should be durable. If valve leaks continuously (external, not through drain), seat wear indicated.',
      benchSetTuning: '10-30 psi tuning allows proportional gain adjustment. Higher = more responsive, lower = more stable but slower',
      responseTest: 'Slowly change setpoint and observe level response. Should be smooth with minimal oscillation.',
      frequencyCheck: 'Monitor level trending on DCS. Alert if level oscillates rapidly (indicates high sensitivity) or drifts slowly (indicates low sensitivity)',
    },
  },
};
 
// ===== FIELD-VERIFIED PUMP MAINTENANCE KNOWLEDGE =====
 
const PUMP_MAINTENANCE_KNOWLEDGE = {
  P_1630: {
    tag: 'P-1630',
    name: 'Booster Pump (Recirculation Duty)',
    service: 'Recirculate stabilizer bottoms through cooler (AC-5055) to feed inlet',
    type: 'Centrifugal pump',
    
    oilSpecifications: {
      capacity: '4 quarts per pump',
      changeInterval: '2000 operating hours or annually (whichever comes first)',
      viscosityGrade: 'ISO 68 (all acceptable oils are ISO 68)',
      acceptableOilOptions: [
        {
          name: 'Mobil 1 SHC 626',
          grade: 'ISO 68',
          notes: 'Premium synthetic, excellent oxidation stability',
        },
        {
          name: 'Phillips Syncon R&O Oil 68',
          grade: 'ISO 68',
          notes: 'R&O (Rust & Oxidation inhibited), standard mineral',
        },
        {
          name: 'Royall Supply Synfill GT68',
          grade: 'ISO 68',
          notes: 'General purpose industrial oil, ISO 68',
        },
      ],
      substitution: 'Any of the three options acceptable. Do NOT mix brands without flushing sump. If switching brands, drain old oil completely, flush sump with new oil, then refill.',
    },
    
    oilChangeStep_by_step: [
      '1. Stop pump. Allow oil to cool for 15+ minutes.',
      '2. Locate sump drain plug (bottom of pump housing). Place collection pan underneath.',
      '3. Open drain plug fully. Allow oil to drain completely (may take 10+ minutes for full drain).',
      '4. Close drain plug when flow stops completely.',
      '5. If changing oil brands: Add 1 quart of new oil, run pump at low speed for 2 minutes, drain again to flush residue. Repeat if necessary.',
      '6. Refill sump with exactly 4 quarts of new oil.',
      '7. Check oil level on dipstick (should be at "FULL" mark when pump is stopped and cool).',
      '8. Start pump at low speed. Run for 5 minutes.',
      '9. Stop pump. Wait 5 minutes. Recheck oil level on dipstick (oil expands when warm). Top up if necessary.',
      '10. Resume normal operation.',
    ],
    
    oilAnalysisSampling: {
      frequency: 'Every 500 operating hours or every 6 months (whichever is first)',
      parameters: [
        { name: 'Wear Metals', target: 'Iron <100 ppm, Copper <50 ppm', alert: 'High wear = internal wear. Investigate pump condition.' },
        { name: 'Acid Number (TAN)', target: '<2.0 TAN', alert: 'High TAN = oil degradation. Change oil sooner.' },
        { name: 'Water Content', target: '<500 ppm', alert: 'High water = corrosion risk. Drain and refill immediately.' },
        { name: 'Viscosity', target: 'ISO 68 ± 10%', alert: 'Out of range = oil breakdown or incorrect oil used.' },
      ],
      actionIfAbnormal: 'If any parameter abnormal, change oil immediately and investigate cause. High wear metals may indicate bearing/seal wear requiring pump repair.',
    },
    
    coldWeatherOperation: {
      condition: 'Ambient temperature < 32°F (0°C)',
      issue: 'Oil viscosity increases at low temp, reducing flow to bearings and increasing starting load',
      solution: [
        'Option 1: Preheat sump with immersion heater or heat tape before startup (target 40°F minimum)',
        'Option 2: Allow 15+ minutes idle at minimum speed before loading pump',
        'Option 3: Monitor oil pressure (should reach normal pressure within 30 seconds of startup)',
      ],
      warning: 'DO NOT full-load cold pump. Bearing damage risk if oil pressure insufficient.',
    },
 
    maintenance_schedule: {
      everyShift: 'Check oil level via dipstick. Report any unusual noise or vibration.',
      every500hrs: 'Perform oil analysis (wear metals, acid number, water). Change oil if parameters out of range.',
      every2000hrs: 'Routine oil change (regardless of analysis results).',
      annually: 'Full pump inspection (bearings, seals, impeller wear). Check suction/discharge pressures.',
    },
  },
 
  P_1635: {
    tag: 'P-1635',
    name: 'Booster Pump (Suction System)',
    service: 'Primary booster pump for feed inlet pressurization',
    type: 'Centrifugal pump',
    note: 'Identical oil specifications to P-1630',
    
    oilSpecifications: {
      capacity: '4 quarts per pump',
      changeInterval: '2000 operating hours or annually (whichever comes first)',
      viscosityGrade: 'ISO 68 (all acceptable oils are ISO 68)',
      acceptableOilOptions: [
        'Mobil 1 SHC 626 (ISO 68)',
        'Phillips Syncon R&O Oil 68 (ISO 68)',
        'Royall Supply Synfill GT68 (ISO 68)',
      ],
      identicalTo_P1630: 'P-1635 uses same oil as P-1630. Can consolidate maintenance stock.',
    },
    
    oilChangeStep_by_step: 'Same as P-1630 (see above)',
    oilAnalysisSampling: 'Same as P-1630 (see above)',
    coldWeatherOperation: 'Same as P-1630 (see above)',
    maintenance_schedule: 'Same as P-1630 (see above)',
  },
};
 
// ===== RYAN AI SYSTEM PROMPT ENHANCEMENT =====
 
const SYSTEM_PROMPT_ENHANCEMENT = `
You now have detailed knowledge of field-verified equipment nameplates:
 
CONTROL VALVES:
- PCV-1438: Fisher Type 667 proportional pressure control valve (CL600/1500 PSI, Serial F002239151)
  * Function: Discharge pressure modulation on V-1040
  * Pilot air range: 0-33 psi
  * Bench set tuning: 10-30 psi
  * Can answer: "What is PCV-1438?", "How does proportional pilot air work?", "Why is bench set important?"
  
- LCV-1241: Fisher Type EWT proportional level control valve (CL150/290 PSI, Serial F001757111)
  * Function: V-1521 Stabilizer sump level control
  * Pilot air range: 0-33 psi
  * Controlled by LT-5060 level transmitter signal
  * Can answer: "What controls the stabilizer level?", "How does LCV-1241 work?", "Why does pilot air vary?"
 
PUMP MAINTENANCE:
- P-1630: 4 quarts oil capacity, 2000-hour change interval
  * Acceptable oils: Mobil 1 SHC 626, Phillips Syncon R&O 68, Royall Synfill GT68 (all ISO 68)
  * Can answer: "What oil does P-1630 use?", "When to change pump oil?", "How to check oil level?"
  
- P-1635: Identical to P-1630
  * Same oil, same change interval
  * Can cite field nameplate data for both pumps
 
When asked equipment questions, cite specific nameplate data:
- Serial numbers (F002239151, F001757111, etc.)
- Pressure ratings (CL600/1500 PSI, CL150/290 PSI)
- Control ranges (0-33 psi pilot air)
- Specifications (Type 667, Type EWT, 4 quarts, 2000 hours)
 
This data is from actual field equipment photographs, 100% verified.
`;
 
// ===== RYAN AI HANDLER (ENHANCED) =====
 
async function handleRyanRequest(mode, userPrompt, plantState, currentScreen) {
  const systemPrompt = `You are Ryan, an AI assistant for Clearfork Cryogenic Processing Unit #1.
 
You have field-verified knowledge of:
- Control Valve PCV-1438 (Fisher Type 667, proportional pressure control, CL600/1500 PSI, Serial F002239151)
- Control Valve LCV-1241 (Fisher Type EWT, proportional level control, CL150/290 PSI, Serial F001757111)
- Pump P-1630 and P-1635 (4 quarts oil, 2000-hour change interval, ISO 68 oil options)
- All equipment nameplate data verified from field photographs
 
When asked about equipment:
- Cite specific nameplate serial numbers, types, pressure ratings
- Reference field data with confidence (this is from actual equipment)
- Answer maintenance questions with exact specifications
- Explain proportional control logic for Fisher valves
 
${mode === 'loto' ? `For LOTO work, if equipment uses proportional pilot air control (PCV-1438, LCV-1241), note that pilot air supply must be isolated as part of lockout procedure.` : ''}
 
Provide accurate, field-verified information. This equipment data comes from physical equipment photographs, not estimates.`;
 
  const userMessage = `${userPrompt}
 
Available context:
- Current screen: ${currentScreen}
- Mode: ${mode}
 
Control Valve Knowledge: PCV-1438 (proportional pressure control), LCV-1241 (proportional level control)
Pump Knowledge: P-1630/P-1635 (4 quarts, ISO 68 oil, 2000-hour intervals)`;
 
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
      return { error: `API Error: ${response.status} — ${error}` };
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
 
// ===== EXPORT ALL KNOWLEDGE =====
 
module.exports = {
  CONTROL_VALVE_KNOWLEDGE,
  PUMP_MAINTENANCE_KNOWLEDGE,
  SYSTEM_PROMPT_ENHANCEMENT,
  handleRyanRequest,
};
 
