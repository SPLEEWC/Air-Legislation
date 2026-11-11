/* 9V CLEARANCE – mission content, sourced from ME2804 Air Legislation slides 43-63 & 156-161.
   R(question, correct, [wrong, wrong], explanation, slideRef)  -> a round: the 3 answers are placed on sites A/B/C
   T(statement, isTrue, explanation)                            -> a recon check in the buy phase            */
const R = (q, a, wrong, why, s) => ({ q, a, wrong, why, s });
const T = (t, ok, why) => ({ t, ok, why });

const MISSIONS = [
/* ─────────────── 1 · Singapore Air Operator ─────────────── */
{
  id: 'aoc', code: 'OP-01', name: 'Singapore Air Operator', short: 'AOC', color: '#ffb020',
  tagline: 'Start an airline: own it, register it, get the AOC, keep it maintained.',
  intel: [
    { h: 'Air Operator Certificate (AOC)', s: 'Slides 44, 156', b: 'For companies who wish to operate <b>Singapore-registered aircraft</b> for <b>passenger or cargo transport</b>.<br><br>Companies with their <b>principal place of business in Singapore</b> that wish to operate aircraft for <b>public transport</b> are required by the <b>Air Navigation Regulations (ANR)</b> to hold an AOC <b>before the start of operations</b>.' },
    { h: 'Who can own a Singapore aircraft?', s: 'Slide 46 · ANO Para 4(3)', b: 'Only these may own a legal or beneficial interest in a Singapore-registered aircraft:<ul><li>the <b>Government</b></li><li><b>citizens of Singapore</b></li><li><b>citizens of any Commonwealth country</b></li><li><b>bodies incorporated in Singapore or the Commonwealth</b>, with their principal place of business in the Commonwealth</li></ul>' },
    { h: 'Certificate of Registration (C of R)', s: 'Slide 48 · SAR 1.3', b: '<ul><li>Submit <b>proof of cancellation of foreign registration</b>, or proof the aircraft is <b>not registered elsewhere</b></li><li>Registration is a <b>one-off exercise</b></li><li>A C of R <b>alone does NOT permit the aircraft to fly</b></li></ul>' },
    { h: 'Maintenance responsibility', s: 'Slides 157-158', b: 'Every <b>Singapore-registered large aeroplane</b> must be maintained by either:<ul><li>the AOC holder\'s <b>own maintenance organisation</b> approved by the <b>DGCA</b>, or</li><li>an <b>external organisation</b> under a <b>formal maintenance support contract</b> acceptable to the DGCA</li></ul>A large aeroplane <b>not registered in Singapore</b> is maintained under an arrangement acceptable to <b>both the DGCA and its State of Registry</b>.' },
    { h: 'Continuing airworthiness information', s: 'Slide 159', b: 'For every large aeroplane in its fleet the AOC holder must:<ul><li><b>obtain and assess</b> airworthiness information from the organisation responsible for the <b>type design</b></li><li><b>implement</b> the measures or actions considered necessary</li></ul>' },
    { h: 'Maintenance Control Manual (MCM)', s: 'Slides 160-161', b: '<ul><li>Established by the AOC holder for <b>approval of the DGCA</b></li><li>Ensures <b>continuing airworthiness</b> and takes <b>human factors principles</b> into account</li><li>Must be in <b>English</b></li><li>No change to its scope of detail <b>without DGCA approval</b></li><li>Provided to <b>every</b> maintenance and operations person concerned, and kept <b>readily available</b></li></ul>' },
    { h: 'Mandatory reporting', s: 'Slide 56 · SAR 4.9', b: 'An <b>AOC holder or maintenance organisation</b> shall report any potentially hazardous <b>defect, failure or malfunction</b> detected during maintenance or flight operations to the Authority <b>within 72 hours</b>.' }
  ],
  rounds: [
    R('A Singapore company wants to carry fare-paying passengers. What must it hold BEFORE starting operations?', 'Air Operator Certificate (AOC)', ['Export C of A', 'Certificate of Fitness for Flight'], 'Companies with their principal place of business in Singapore that operate aircraft for public transport must hold an AOC before the start of operations.', 'Slide 156'),
    R('Which of these is NOT qualified to own a Singapore-registered aircraft?', 'A citizen of a non-Commonwealth country', ['A citizen of Singapore', 'The Government'], 'ANO Para 4(3): only the Government, Singapore citizens, Commonwealth citizens and bodies incorporated in Singapore / the Commonwealth qualify.', 'Slide 46'),
    R('What does a Certificate of Registration, on its own, allow?', 'Nothing in the air – it alone does not permit flight', ['Flight within Singapore only', 'Flight without passengers'], 'Registration is a one-off exercise, and the C of R alone does not permit the aircraft to fly.', 'Slide 48'),
    R('An AOC holder outsources maintenance of its 9V large aeroplanes. What is required?', 'A formal maintenance support contract acceptable to the DGCA', ['A verbal agreement with any hangar', 'Approval from the State of Design only'], 'Maintenance is done by the AOC holder\'s own DGCA-approved organisation OR an external organisation under a formal maintenance support contract acceptable to the DGCA.', 'Slide 157'),
    R('Who approves the AOC holder\'s Maintenance Control Manual?', 'Director-General of Civil Aviation', ['The aircraft manufacturer', 'The Accountable Manager alone'], 'The AOC holder must establish an MCM for the approval of the DGCA, and cannot change its scope of detail without DGCA approval.', 'Slide 160'),
    R('A hazardous defect is found during maintenance. How fast must it be reported to the Authority?', 'Within 72 hours', ['Within 7 days', 'At the next C of A renewal'], 'SAR 4.9 Mandatory Reporting: AOC holder or maintenance organisation reports potentially hazardous defects, failures or malfunctions within 72 hours.', 'Slide 56'),
    R('From whom must an AOC holder obtain and assess continuing airworthiness information?', 'The organisation responsible for the type design', ['The airport operator', 'Other airlines flying the type'], 'For every large aeroplane in its fleet, the AOC holder obtains and assesses information from the type-design organisation and implements the necessary actions.', 'Slide 159'),
    R('What must be submitted when registering an aircraft in Singapore?', 'Proof it is not registered in another country', ['A valid Export C of A from CAAS', 'A Noise Certificate from ICAO'], 'SAR 1.3: proof of cancellation of foreign registration, or proof that the aircraft is not registered elsewhere.', 'Slide 48')
  ],
  recon: [
    T('An AOC is needed to operate Singapore-registered aircraft for passenger or cargo transport.', true, 'Correct – that is exactly who the AOC is for.'),
    T('Aircraft registration must be renewed every year.', false, 'Registration is a ONE-OFF exercise (SAR 1.3).'),
    T('The Maintenance Control Manual must be written in English.', true, 'The MCM must be in the English language.'),
    T('The Maintenance Control Manual must take human factors principles into account.', true, 'It ensures continuing airworthiness AND takes human factors principles into account.'),
    T('Only the Quality Manager needs a copy of the Maintenance Control Manual.', false, 'It must be provided to EVERY maintenance and operations person concerned, and be readily available.'),
    T('A citizen of a Commonwealth country may own a Singapore-registered aircraft.', true, 'ANO Para 4(3) lists citizens of any Commonwealth country.'),
    T('A non-Singapore-registered large aeroplane in an AOC fleet only needs the DGCA to accept its maintenance arrangement.', false, 'The arrangement must be acceptable to BOTH the DGCA and the aeroplane\'s State of Registry.'),
    T('An AOC holder may change the scope of its Maintenance Control Manual freely.', false, 'No change to the scope of detail may be made without DGCA approval.')
  ]
},
/* ─────────────── 2 · C of A & Export C of A ─────────────── */
{
  id: 'cofa', code: 'OP-02', name: 'C of A & Export C of A', short: 'C of A', color: '#35d0c8',
  tagline: 'To get airborne you need a valid C of A. To sell abroad you need an Export C of A.',
  intel: [
    { h: 'Certificate of Airworthiness (C of A)', s: 'Slides 51-52 · SAR 2', b: '<ul><li><b>CAAS must be satisfied</b> with the airworthiness of the aircraft before issuing a C of A</li><li>Issued or renewed for a period <b>not exceeding one year</b> (SAR 2.3)</li><li><b>No aircraft shall fly</b> if there is no valid C of A in place</li></ul>' },
    { h: 'Categories of aircraft', s: 'Slide 52', b: 'A C of A is issued in one of five categories:<ul><li><b>Transport (Passenger)</b></li><li><b>Transport (Cargo)</b></li><li><b>Aerial Work</b></li><li><b>Private</b></li><li><b>Special Category</b></li></ul>' },
    { h: 'Export C of A – why?', s: 'Slides 53-54 · SAR 2.4', b: 'The airworthiness authority of the <b>country of import</b> usually requires <b>evidence of the aircraft\'s airworthiness</b> from the authority of the <b>country of export</b>.' },
    { h: 'Export C of A – the catches', s: 'Slide 54 · SAR 2.4', b: '<ul><li>An Export C of A <b>does NOT give authority for the aircraft to fly</b></li><li>The aircraft must be <b>de-registered in the country of export</b> before the Export C of A is issued</li></ul>' },
    { h: 'Weighing before the C of A', s: 'Slide 78 · SAR 5.1', b: '<b>All aircraft shall be weighed in Singapore prior to the issue of the C of A.</b><br><br>Aircraft are then re-weighed within 2 years of manufacture and at intervals not exceeding 5 years.' },
    { h: 'When the C of A stops', s: 'Slides 55-57', b: 'After an <b>incident</b>, <b>equipment malfunction/failure</b>, or <b>improper maintenance/modification</b> that affects airworthiness, the C of A <b>ceases to be in force</b>. Flying again needs a <b>Permit to Fly</b> – that is OP-04.' }
  ],
  rounds: [
    R('What is the maximum period a C of A is issued or renewed for?', 'Not exceeding one year', ['Not exceeding 7 days', 'For the life of the aircraft'], 'SAR 2.3: a C of A for every aircraft is issued or renewed for a period not exceeding a year.', 'Slide 52'),
    R('Which of these is a real C of A category?', 'Aerial Work', ['Military', 'Experimental Export'], 'The five categories are Transport (Passenger), Transport (Cargo), Aerial Work, Private and Special Category.', 'Slide 52'),
    R('What does an Export C of A authorise?', 'It gives no authority to fly', ['One delivery flight to the buyer', 'Flight in the importing country only'], 'SAR 2.4: an Export C of A does not give authority for the aircraft to fly – it is evidence of airworthiness for the importing authority.', 'Slide 54'),
    R('What must happen BEFORE an Export C of A is issued?', 'Aircraft de-registered in the country of export', ['Aircraft registered in the country of import', 'Noise Certificate is cancelled'], 'The aircraft has to be de-registered in the country of export prior to the issue of the Export C of A.', 'Slide 54'),
    R('Why does the importing country want an Export C of A?', 'As evidence of airworthiness from the exporting authority', ['To prove who owns the aircraft', 'To replace the Certificate of Registration'], 'The airworthiness authority of the country of import usually requires evidence of airworthiness from the authority of the country of export.', 'Slide 54'),
    R('A 9V aircraft has a valid C of R but no valid C of A. Can it fly?', 'No – no aircraft shall fly without a valid C of A', ['Yes – the C of R is enough', 'Yes – but only with cargo'], 'No aircraft shall fly if there is no valid C of A in place, and a C of R alone does not permit flight.', 'Slides 48, 52'),
    R('Who must be satisfied with the aircraft\'s airworthiness before a C of A is issued?', 'CAAS', ['ICAO Council', 'The aircraft owner'], 'CAAS will need to be satisfied with the airworthiness of the aircraft before issuing the C of A.', 'Slide 52'),
    R('What must be done in Singapore prior to the issue of the C of A?', 'The aircraft must be weighed', ['The aircraft must be repainted', 'The engines must be replaced'], 'SAR 5.1: all aircraft shall be weighed in Singapore prior to the issue of the Certificate of Airworthiness.', 'Slide 78')
  ],
  recon: [
    T('A C of A is valid for the life of the aircraft once issued.', false, 'It is issued or renewed for a period NOT exceeding one year (SAR 2.3).'),
    T('"Special Category" is one of the C of A categories.', true, 'Transport (Passenger), Transport (Cargo), Aerial Work, Private, Special Category.'),
    T('An Export C of A lets the aircraft fly to its new owner.', false, 'An Export C of A does NOT give authority for the aircraft to fly.'),
    T('The aircraft must be de-registered in the exporting country before an Export C of A is issued.', true, 'Correct – de-registration comes first (SAR 2.4).'),
    T('The C of A is covered in SAR Chapter 2.', true, 'C of A = SAR 2; Export C of A = SAR 2.4.'),
    T('"Transport (Passenger)" and "Transport (Cargo)" are separate C of A categories.', true, 'They are two of the five categories.'),
    T('A valid Certificate of Registration means the aircraft can fly without a C of A.', false, 'No aircraft shall fly without a valid C of A; the C of R alone does not permit flight.'),
    T('The exporting country\'s authority issues the Export C of A as evidence of airworthiness.', true, 'That is exactly what the importing authority asks for.')
  ]
},
/* ─────────────── 3 · Aircraft Noise Certificate ─────────────── */
{
  id: 'noise', code: 'OP-03', name: 'Aircraft Noise Certificate', short: 'Noise', color: '#b48cff',
  tagline: 'Aircraft noise is pollution. A 9V aircraft must prove it meets ICAO Annex 16.',
  intel: [
    { h: 'Noise Certificate', s: 'Slides 49-50 · SAR 1.4', b: 'Issued by <b>CAAS</b> for <b>9V-registered aircraft</b> when the Authority is satisfied that the aircraft meets the noise requirements specified in <b>ICAO Annex 16, Volume 1</b>.' },
    { h: 'One time only', s: 'Slide 50', b: 'The Noise Certificate is a <b>one-time exercise</b> – unlike the C of A, it is not renewed every year.' },
    { h: 'When to apply again', s: 'Slide 50', b: 'A <b>new application is required</b> when the <b>noise characteristics of the aircraft have changed</b> (for example after a modification that changes how loud it is).' },
    { h: 'Compare the paperwork', s: 'Slides 48-54', b: '<ul><li><b>C of R</b> (SAR 1.3) – one-off</li><li><b>Noise Certificate</b> (SAR 1.4) – one-time, re-apply if noise characteristics change</li><li><b>C of A</b> (SAR 2) – issued/renewed for not more than 1 year</li><li><b>Export C of A</b> (SAR 2.4) – no authority to fly</li></ul>' },
    { h: 'Why it matters', s: 'Slides 49, 148', b: 'Aircraft noise is a form of <b>pollution</b>. Singapore\'s aviation rules aim to protect the environment by <b>minimising noise pollution</b> and emissions from aircraft operations.' }
  ],
  rounds: [
    R('Which standard sets the noise requirements for a Noise Certificate?', 'ICAO Annex 16, Volume 1', ['ICAO Annex 8, Volume 2', 'SAR-145 Subpart D'], 'CAAS issues the Noise Certificate when the aircraft meets the noise requirements specified in ICAO Annex 16, Volume 1.', 'Slide 50'),
    R('Who issues the Noise Certificate for a 9V-registered aircraft?', 'CAAS', ['ICAO', 'The engine manufacturer'], 'It is issued by CAAS for 9V (Singapore) registered aircraft.', 'Slide 50'),
    R('How often is a Noise Certificate normally applied for?', 'It is a one-time exercise', ['Every year, with the C of A', 'Every 4 months'], 'The Noise Certificate is a one-time exercise.', 'Slide 50'),
    R('When is a NEW Noise Certificate application required?', 'When the aircraft\'s noise characteristics have changed', ['Every time the aircraft is repainted', 'Whenever the C of A is renewed'], 'A new application is required when the noise characteristics of the aircraft have changed.', 'Slide 50'),
    R('Which SAR reference covers the Noise Certificate?', 'SAR 1.4', ['SAR 2.4', 'SAR 4.9'], 'Noise Certificate = SAR 1.4. (SAR 2.4 is the Export C of A; SAR 4.9 is Mandatory Reporting.)', 'Slide 50'),
    R('An engine modification makes a 9V aircraft noticeably louder. What now?', 'Apply for a new Noise Certificate', ['Nothing – the certificate is permanent', 'Apply for an Export C of A'], 'The noise characteristics have changed, so a new application is required.', 'Slide 50'),
    R('Which document is renewed at intervals of not more than one year?', 'Certificate of Airworthiness', ['Noise Certificate', 'Certificate of Registration'], 'The Noise Certificate and C of R are one-time exercises; the C of A is issued/renewed for not more than a year.', 'Slides 48-52'),
    R('A Noise Certificate is issued for aircraft carrying which registration mark?', '9V', ['N', 'VH'], 'It is issued by CAAS for 9V-registered (Singapore) aircraft.', 'Slide 50')
  ],
  recon: [
    T('The Noise Certificate is renewed every year together with the C of A.', false, 'It is a ONE-TIME exercise.'),
    T('Noise requirements come from ICAO Annex 16, Volume 1.', true, 'Correct – Annex 16, Volume 1.'),
    T('If the noise characteristics of the aircraft change, a new application is required.', true, 'Exactly as stated in SAR 1.4.'),
    T('The Noise Certificate is issued by ICAO.', false, 'It is issued by CAAS for 9V-registered aircraft.'),
    T('The Noise Certificate is covered in SAR 1.4.', true, 'SAR 1.3 = C of R, SAR 1.4 = Noise Certificate.'),
    T('The Noise Certificate applies to 9V-registered aircraft.', true, '9V is the Singapore registration mark.'),
    T('CAAS issues the Noise Certificate without needing to be satisfied about noise levels.', false, 'The Authority must be satisfied the aircraft meets the Annex 16 Vol 1 noise requirements.'),
    T('Both the C of R and the Noise Certificate are one-time exercises.', true, 'Registration is one-off and the Noise Certificate is one-time.')
  ]
},
/* ─────────────── 4 · Aircraft Permit to Fly ─────────────── */
{
  id: 'permit', code: 'OP-04', name: 'Aircraft Permit to Fly', short: 'Permit', color: '#ff5d73',
  tagline: 'The C of A is no longer in force. How can the aircraft legally move?',
  intel: [
    { h: 'When the C of A ceases', s: 'Slide 57 · ANR-91 Reg 5', b: 'Following any <b>incident</b>, <b>equipment malfunction/failure</b>, or <b>improper maintenance/modification</b> that affects the airworthiness of the aircraft, the <b>C of A shall cease to be in force</b>.' },
    { h: 'Permit to Fly', s: 'Slide 57 · ANR-91 Reg 5', b: 'May be issued by the <b>Chief Executive of CAAS</b> to allow the aircraft to fly <b>without fare-paying passengers</b> to the <b>nearest location</b> where it can be <b>repaired / restored to an airworthy condition</b>.' },
    { h: 'Certificate of Fitness for Flight (C of F)', s: 'Slide 58 · SAR 4.1', b: '<ul><li>Issued by a <b>licensed aircraft engineer</b> with privileges in <b>airframe, engines or both (CAT B1)</b></li><li>Period of validity shall <b>not exceed 7 days</b></li></ul>' },
    { h: 'Flying without C of A or C of R', s: 'Slide 59 · ANO Second Schedule', b: 'The ANO (Second Schedule) states <b>4 conditions</b> that allow an aircraft to fly without a C of A or C of R:<br><br><b>\'A\' · \'B\' · \'C\' · \'D\' Conditions</b>' },
    { h: '\'A\' Conditions – qualify for C of A', s: 'Slide 60', b: '<ul><li>Flight to <b>qualify for the issue or renewal of a C of A</b></li><li>For an aircraft that previously had a C of A, or is <b>identical in design</b> to one that has</li><li>A <b>C of F must be issued before</b> the flight</li></ul>' },
    { h: '\'B\' Conditions – experiment & test', s: 'Slide 61', b: '<ul><li>For <b>experimenting with or testing</b> the aircraft (including engines and equipment)</li><li>Flight made under the <b>supervision of a person approved by the Chief Executive of CAAS</b></li></ul>' },
    { h: '\'C\' Conditions – sale & delivery', s: 'Slide 62', b: '<ul><li>For <b>testing/demonstrating with a view to sale</b>, or <b>delivering to the buyer</b></li><li>Operator must hold a valid <b>air dealer certificate</b></li><li>Aircraft shall fly <b>within Singapore only</b></li></ul>' },
    { h: '\'D\' Conditions – approved purpose', s: 'Slide 63', b: '<ul><li>Under supervision of a person <b>approved by the Chief Executive</b></li><li>Only for a <b>purpose approved by the Chief Executive</b></li><li><b>No cargo, no persons other than flight crew</b> unless approved</li><li><b>Not over congested areas</b>, cities, towns or settlements unless under approved procedures</li></ul>' }
  ],
  rounds: [
    R('Who may issue a Permit to Fly?', 'Chief Executive of CAAS', ['Any licensed aircraft engineer', 'The aircraft captain'], 'ANR-91 Regulation 5: a Permit to Fly may be issued by the Chief Executive of CAAS.', 'Slide 57'),
    R('Where may an aircraft fly on a Permit to Fly?', 'To the nearest location where it can be repaired', ['On its normal scheduled routes', 'To any airport the airline chooses'], 'The permit allows flight, without fare-paying passengers, to the nearest location where the aircraft can be repaired / restored to an airworthy condition.', 'Slide 57'),
    R('What is the maximum validity of a Certificate of Fitness for Flight?', '7 days', ['72 hours', '1 year'], 'SAR 4.1: the period of validity of a C of F shall not exceed 7 days.', 'Slide 58'),
    R('Who issues a Certificate of Fitness for Flight?', 'Licensed aircraft engineer (CAT B1)', ['Chief Executive of CAAS', 'The AOC holder\'s Quality Manager'], 'SAR 4.1: issued by a licensed aircraft engineer with privileges in airframe, engines or both (CAT B1).', 'Slide 58'),
    R('A flight to qualify for the RENEWAL of a C of A is made under which conditions?', '\'A\' Conditions', ['\'B\' Conditions', '\'C\' Conditions'], '\'A\' Conditions: flights to qualify for the issue or renewal of a C of A. A C of F must be issued beforehand.', 'Slide 60'),
    R('A prototype engine is being flight-tested. Which conditions apply?', '\'B\' Conditions', ['\'A\' Conditions', '\'C\' Conditions'], '\'B\' Conditions: experimenting with or testing the aircraft, its engines and equipment, under supervision of a person approved by the Chief Executive.', 'Slide 61'),
    R('Under \'C\' Conditions (sale / delivery flights), what must the operator hold?', 'A valid air dealer certificate', ['An Air Operator Certificate', 'An Export C of A'], '\'C\' Conditions: operator holds a valid air dealer certificate, and the aircraft flies within Singapore only.', 'Slide 62'),
    R('Which is a restriction under \'D\' Conditions?', 'No flight over congested areas unless approved', ['Must carry fare-paying passengers', 'Must fly outside Singapore'], '\'D\' Conditions: approved purpose only, no cargo or persons other than flight crew unless approved, and not over congested areas except under approved procedures.', 'Slide 63'),
    R('Which event causes a C of A to cease to be in force?', 'Improper maintenance affecting airworthiness', ['A change of airline livery', 'A change of flight crew'], 'Incidents, equipment malfunction/failure, or improper maintenance/modification that affect airworthiness cause the C of A to cease to be in force.', 'Slide 57'),
    R('Where are the \'A\', \'B\', \'C\' and \'D\' Conditions found?', 'ANO, Second Schedule', ['ICAO Annex 16', 'SAR-66'], 'The 4 conditions that allow flight without a C of A or C of R are stated in the ANO (Second Schedule).', 'Slide 59')
  ],
  recon: [
    T('An aircraft on a Permit to Fly may carry fare-paying passengers.', false, 'It flies WITHOUT fare-paying passengers.'),
    T('A C of F is valid for a period not exceeding 7 days.', true, 'SAR 4.1 – not exceeding 7 days.'),
    T('Under \'C\' Conditions the aircraft may fly anywhere in the world.', false, 'Under \'C\' Conditions the aircraft shall fly within Singapore only.'),
    T('A C of F must be issued before an \'A\' Conditions flight.', true, 'A Certificate of Fitness for Flight must be issued prior to an \'A\' Conditions flight.'),
    T('There are 4 conditions in the ANO Second Schedule allowing flight without a C of A or C of R.', true, '\'A\', \'B\', \'C\' and \'D\' Conditions.'),
    T('\'B\' Conditions flights need supervision by a person approved by the Chief Executive of CAAS.', true, 'Correct – for experimenting with or testing the aircraft.'),
    T('The Permit to Fly comes from ANR-91, Regulation 5.', true, 'Air Navigation (91 – General Operating Rules) Regulations, Regulation 5.'),
    T('After improper maintenance that affects airworthiness, the C of A stays in force until renewal.', false, 'The C of A shall cease to be in force.'),
    T('Under \'D\' Conditions the aircraft may freely carry cargo.', false, 'No cargo, and no person other than flight crew, except as approved by the Chief Executive.')
  ]
}
];

/* Playable specialists (original characters) */
const AGENTS = [
  { id: 'torque', name: 'TORQUE', role: 'Licensed Aircraft Engineer', color: '#ffb020', icon: '🔧',
    e: { name: 'Field Repair', desc: 'Restore 50 HP.' }, x: { name: 'Overhaul', desc: 'Full HP + armour and 50% damage resistance for 8 s.' } },
  { id: 'squawk', name: 'SQUAWK', role: 'Air Traffic Controller', color: '#35d0c8', icon: '📡',
    e: { name: 'Radar Sweep', desc: 'Reveal every hostile through walls for 7 s.' }, x: { name: 'Ground Stop', desc: 'Freeze all hostiles for 5 s.' } },
  { id: 'mach', name: 'MACH', role: 'Flight Test Pilot', color: '#ff5d73', icon: '⚡',
    e: { name: 'Afterburner', desc: 'Sprint at double speed for 3.5 s.' }, x: { name: 'Sonic Boom', desc: 'Shockwave: 70 damage + stun to hostiles within 16 m.' } },
  { id: 'audit', name: 'AUDIT', role: 'Airworthiness Inspector', color: '#b48cff', icon: '📋',
    e: { name: 'Document Check', desc: 'Strike out one WRONG site this round.' }, x: { name: 'Grounding Order', desc: '45 damage to every hostile and reveal them for 8 s.' } }
];

const WEAPONS = {
  pitot:  { name: 'PITOT',       type: 'Sidearm',  cost: 0,    dmg: 26, head: 2.4, rpm: 380, mag: 12, reload: 1.3, spread: 0.010, auto: false, kick: 0.020 },
  rotor:  { name: 'ROTOR',       type: 'SMG',      cost: 900,  dmg: 19, head: 2.0, rpm: 800, mag: 30, reload: 1.9, spread: 0.022, auto: true,  kick: 0.011 },
  mach:   { name: 'MACH-2',      type: 'Rifle',    cost: 2100, dmg: 34, head: 3.0, rpm: 600, mag: 25, reload: 2.2, spread: 0.008, auto: true,  kick: 0.016 },
  boom:   { name: 'AFTERBURNER', type: 'Shotgun',  cost: 1400, dmg: 13, head: 1.5, rpm: 85,  mag: 6,  reload: 2.4, spread: 0.060, auto: false, kick: 0.060, pellets: 9 },
  glide:  { name: 'GLIDESLOPE',  type: 'Marksman', cost: 2600, dmg: 95, head: 2.2, rpm: 55,  mag: 5,  reload: 2.6, spread: 0.001, auto: false, kick: 0.070 }
};
