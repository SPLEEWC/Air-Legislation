/* PENCIL WHIP – open-world maintenance caper. Content from ME2804 Air Legislation slides 64-73, 99-104, 110, 116, 121, 125, 127.
   Edit this file to change lessons, missions and questions. */
const TOPICS = {
  mx:   { name: 'Aircraft Maintenance', color: '#4fc3ff' },
  crs:  { name: 'Certificate of Release to Service', color: '#7dff8a' },
  cmr:  { name: 'Certificate of Maintenance Review', color: '#ffcf3f' },
  tlog: { name: 'Technical Log', color: '#ff7ad9' },
  tc:   { name: 'Type Certificate', color: '#9b8cff', island: true },
  stc:  { name: 'Supplemental Type Certificate', color: '#ff9b42', island: true },
  stso: { name: 'Singapore Technical Standard Order', color: '#3fe0c5', island: true }
};

/* Notebook facts – unlocked by mission dialogue and hidden logbook pages */
const FACTS = {
  mx1:  { t: 'mx',   s: 'Slide 64', x: 'Maintenance must be performed in accordance with a <b>Maintenance Schedule</b> prepared by the <b>Operator</b> and approved by the <b>Authority (DGCA)</b>.' },
  mx2:  { t: 'mx',   s: 'Slide 64', x: 'The <b>owner or operator</b> is responsible for ensuring maintenance work is conducted in accordance with <b>Singapore airworthiness requirements</b>.' },
  mx3:  { t: 'mx',   s: 'Slide 65', x: 'The Maintenance Schedule gives the <b>periods</b> at which the aircraft, components, equipment and installations are inspected, the <b>extent</b> of each inspection, and the practices and procedures to follow.' },
  mx4:  { t: 'mx',   s: 'Slide 65', x: 'It lists components/equipment to be <b>overhauled or retired</b> at specified periods – <b>calendar time, flying time or other approved service life</b>.' },
  mx5:  { t: 'mx',   s: 'Slide 65', x: 'It sets the procedures and documentation for certifying all checks and inspections, <b>issue of the CMR</b> and <b>issue of a CRS</b>.' },
  mx6:  { t: 'mx',   s: 'Slide 66', x: 'Check intervals depend on type, e.g. <b>A320: A check 500 FH</b>, C check 15 months · <b>B777: A check 1000 FH</b>, C check 5000 FH · <b>A340-500: A check 1200 FH</b>, C check 18 months.' },
  mx7:  { t: 'mx',   s: 'Slide 67', x: 'An aircraft is <b>not flown</b> unless all work has been <b>completed and certified</b> on the appropriate documents and the <b>pilot is notified</b> of its status.' },
  mx8:  { t: 'mx',   s: 'Slide 67', x: 'If maintenance may have affected the <b>flight characteristics</b>, the aircraft is not released until it is <b>certified as fit for flight</b>.' },
  mx9:  { t: 'mx',   s: 'Slide 73 · SAR 4.8', x: '<b>Duplicate inspection</b> is required after maintenance of any <b>flight control system</b>: inspected and certified by one qualified person, then <b>repeated and certified by a second</b> qualified person.' },
  crs1: { t: 'crs',  s: 'Slide 68', x: 'A <b>CRS</b> must be issued by <b>appropriately licensed personnel</b> after any <b>overhaul, maintenance, modification, replacement, repair or inspection</b>.' },
  crs2: { t: 'crs',  s: 'Slide 116 · SAR 145.1', x: '<b>No aircraft shall fly</b> unless a CRS is issued by an <b>approved (SAR-145) maintenance organisation</b> for the maintenance carried out.' },
  crs3: { t: 'crs',  s: 'Slide 110', x: 'An <b>AML alone does not</b> permit the holder to issue a CRS – they also need a <b>SAR-145 certification authorisation</b> from an approved maintenance organisation.' },
  crs4: { t: 'crs',  s: 'Slides 110, 121', x: 'Certifying staff need <b>6 months</b> of relevant maintenance experience in the <b>preceding 2 years</b>.' },
  crs5: { t: 'crs',  s: 'Slide 125 · SAR 145.50', x: 'The CRS is issued by <b>certifying staff on behalf of the SAR-145 organisation</b> after satisfactory completion of <b>all</b> applicable maintenance tasks.' },
  crs6: { t: 'crs',  s: 'Slide 125', x: 'A component maintained <b>off the aircraft</b> needs an <b>ARC</b> for that maintenance, and <b>another CRS</b> for its installation on the aircraft.' },
  crs7: { t: 'crs',  s: 'Slide 127 · SAR 145.55', x: 'The organisation gives the operator a <b>copy of the CRS</b> plus any approved repair/modification data, and keeps detailed records for <b>2 years</b> from release.' },
  crs8: { t: 'crs',  s: 'Slide 71', x: 'The CRS statement certifies the work was done in accordance with <b>SAR-145 and the Air Navigation Order</b>, and the aircraft/component is <b>ready for release to service</b>.' },
  crs9: { t: 'crs',  s: 'Slides 100-104', x: 'AML <b>Cat A</b> certifies simple/minor line tasks it personally performed · <b>B1</b> structure, powerplant, mechanical &amp; electrical · <b>B2</b> avionics &amp; electrical.' },
  cmr1: { t: 'cmr',  s: 'Slide 69 · SAR 4.3', x: 'The <b>CMR</b> provides evidence that the aircraft is in compliance with the <b>approved maintenance schedule</b>.' },
  cmr2: { t: 'cmr',  s: 'Slide 69', x: 'It is issued by an <b>authorised LAE</b> with <b>at least 8 years</b> of aircraft maintenance experience.' },
  cmr3: { t: 'cmr',  s: 'Slide 69', x: 'Aircraft <b>above 2730 kg MTWA</b>: CMR issued for <b>4 months</b>, or otherwise approved by CAAS.' },
  cmr4: { t: 'cmr',  s: 'Slide 69', x: 'Aircraft <b>below 2730 kg MTWA</b>: CMR issued for <b>1 year</b>.' },
  cmr5: { t: 'cmr',  s: 'Slide 69 (sample form)', x: 'The CMR form certifies a maintenance review of the aircraft and its equipment necessary for airworthiness was done per the <b>ANO</b>, stating the <b>date carried out</b> and the <b>date the next review is due</b>, signed with a licence/approval number.' },
  tl1:  { t: 'tlog', s: 'Slide 70 · SAR 4.5', x: 'The <b>Captain (pilot-in-command)</b> records <b>take-off and landing times</b>, <b>flight duration</b> and any <b>technical defects</b> during flight in the technical log.' },
  tl2:  { t: 'tlog', s: 'Slide 70', x: 'The technical log <b>remains on board at all times</b>; <b>copies</b> of the entry records are kept <b>on the ground</b>.' },
  tl3:  { t: 'tlog', s: 'Slide 70', x: 'All entry records are kept by the operator for <b>2 years</b> after the date of entry or period of validity.' },
  tl4:  { t: 'tlog', s: 'Slide 71', x: 'A tech log page has a <b>Defect Description</b>, an <b>Action Taken</b> section (MEL item, deferred defect, parts on/off), and a <b>signature with licence/authorisation number</b> under the CRS statement.' },
  tl5:  { t: 'tlog', s: 'Slide 71', x: 'Entries are in <b>BLOCK LETTERS</b> and all times in <b>GMT (Z)</b>. The blue and pink copies are removed before the next flight.' },
  tl6:  { t: 'tlog', s: 'Slide 72 · SAR 4.6', x: 'Public transport and aerial work aircraft keep an <b>Aircraft</b> log book, <b>Engine</b> log book, <b>Variable Pitch Propeller</b> log book and <b>Modification</b> log book.' },
  tl7:  { t: 'tlog', s: 'Slide 72', x: 'Relevant entries from the <b>technical log are transferred</b> to the respective log books.' },
  // ── Design Cay (SAR Part 21) ──
  tc1:  { t: 'tc',   s: 'Slide 81', x: 'Aircraft design &amp; production goes through three stages: <b>Design → Production → Flight Test</b>.' },
  tc2:  { t: 'tc',   s: 'Slide 82 · SAR-21 Subpart A/B', x: 'Each <b>new aircraft type</b> is issued a <b>Type Certificate (TC)</b> by the Civil Aviation Authority of the <b>State of Design</b>.' },
  tc3:  { t: 'tc',   s: 'Slide 82', x: 'CAAS grants a <b>letter of acceptance</b> of a TC issued by the <b>FAA</b> where the US is the State of Design, or by the <b>relevant authority of a contracting state</b>.' },
  tc4:  { t: 'tc',   s: 'Slide 88 · Subpart G', x: 'Holders of a <b>TC, STC, modification/repair approval or STSO</b> approval shall obtain <b>Design Organisation Approval (DOA)</b>.' },
  stc1: { t: 'stc',  s: 'Slide 83', x: 'All design changes are classified as <b>Minor</b> or <b>Major</b>.' },
  stc2: { t: 'stc',  s: 'Slide 83', x: '<b>Major</b> changes affect <b>weight &amp; balance</b>, <b>structural strength</b>, <b>flight performance &amp; characteristics</b>, <b>power plant operations</b> or other qualities affecting airworthiness.' },
  stc3: { t: 'stc',  s: 'Slide 83', x: '<b>Minor</b> changes are developed by Design Organisations and approved by the <b>Authority</b> or by <b>DOA holders</b>.' },
  stc4: { t: 'stc',  s: 'Slide 84 · Subpart C', x: 'A <b>Supplemental Type Certificate (STC)</b> is the design approval for a <b>major change to a type design</b> of a product.' },
  stc5: { t: 'stc',  s: 'Slide 84', x: 'The STC is issued by the Civil Aviation Authority of the <b>State of Registry</b> of the aircraft the modification is performed on.' },
  stc6: { t: 'stc',  s: 'Slide 85', x: 'Major changes are <b>developed by DOA holders</b> and can <b>only be approved by the Authority</b>, through the issue of an STC.' },
  stc7: { t: 'stc',  s: 'Slide 85', x: 'The STC holder keeps <b>complete and current technical data</b> for each STC <b>for the life of any product</b> incorporating it.' },
  stc8: { t: 'stc',  s: 'Slide 88', x: 'DOA privileges: develop design data, issue statements of compliance, approve minor changes, arrange production. <b>Only design signatories</b> certify design data and issue statements of compliance.' },
  so1:  { t: 'stso', s: 'Slide 86 · Subpart E', x: '<b>STSO approval</b> is the <b>design approval for products installed on aircraft</b> (articles such as avionics units, seat belts, emergency beacons).' },
  so2:  { t: 'stso', s: 'Slide 86', x: 'An STSO applicant shall <b>apply for or hold DOA</b>, or have an <b>arrangement for design configuration control</b>.' },
  so3:  { t: 'stso', s: 'Slide 86', x: 'The STSO holder keeps the complete and current technical data file until <b>2 years after production stops</b>.' },
  so4:  { t: 'stso', s: 'Slide 89 · Subpart J', x: 'A <b>Production Organisation Approval (POA)</b> holder may produce products and articles and issue an <b>Authorised Release Certificate CAAS(AW)95</b> for the articles produced.' },
  so5:  { t: 'stso', s: 'Slide 89', x: 'A POA holder must <b>hold DOA</b> or have an <b>arrangement with a DOA holder</b>.' },
  so6:  { t: 'stso', s: 'Slides 82-86', x: 'Tell them apart: <b>TC</b> → a whole new aircraft type · <b>STC</b> → a major change to an existing type design · <b>STSO</b> → an article that is installed on aircraft.' }
};

/* Hidden logbook pages (collectibles) – each reveals a fact */
const PAGES = ['mx3', 'mx6', 'mx9', 'crs2', 'crs6', 'crs9', 'cmr3', 'cmr4', 'cmr5', 'tl4', 'tl5', 'tl6', 'tc3', 'stc2', 'stc7', 'so3'];

const CONTACTS = {
  O: { name: 'Rina Okafor', role: 'Maintenance Planning', loc: 'ops',     color: '#4fc3ff', look: { shirt: 0x2b7bd6, hat: 0xffffff } },
  C: { name: 'Dev Raman',   role: 'Chief Certifying Engineer', loc: 'hangar', color: '#7dff8a', look: { shirt: 0x26a65b, hat: 0xffd21a } },
  Q: { name: 'Aisha Tan',   role: 'Quality Manager', loc: 'quality', color: '#ffcf3f', look: { shirt: 0xe0a106, hat: 0x222222 } },
  K: { name: 'Capt. Lim',   role: 'Line Captain', loc: 'crew',       color: '#ff7ad9', look: { shirt: 0xffffff, hat: 0x111a33 } },
  I: { name: 'Inspector Farah', role: 'CAAS Airworthiness', loc: 'caas', color: '#ff5252', look: { shirt: 0x1a237e, hat: 0x1a237e } },
  T: { name: 'Dr. Lena Ortiz', role: 'Type Certification · Design Cay', loc: 'tcc', color: '#9b8cff', island: true, look: { shirt: 0x5b4bc4, hat: 0xffffff } },
  S: { name: 'Marco Lim', role: 'DOA Design Engineer · Design Cay', loc: 'modh', color: '#ff9b42', island: true, look: { shirt: 0xe0701a, hat: 0x222222 } },
  P: { name: 'Priya Nair', role: 'STSO Parts Plant · Design Cay', loc: 'plant', color: '#3fe0c5', island: true, look: { shirt: 0x139a86, hat: 0xffd21a } }
};

const Q = (q, a, wrong, why, s) => ({ t: 'quiz', q, a, wrong, why, s });

const MISSIONS = [
/* ───── O · Aircraft Maintenance ───── */
{ id: 'm1', c: 'O', topic: 'mx', name: 'Schedule Run', cash: 500, steps: [
  { t: 'talk', lines: [
    ['O', "You're the new engineer? Good timing. Someone at Vista Bay has been <b>pencil-whipping</b> – signing off maintenance that was never done."],
    ['O', "So let's start with the rule they keep breaking. Maintenance follows a <b>Maintenance Schedule</b>. The <b>Operator</b> prepares it. The <b>Authority – DGCA</b> – approves it.", 'mx1'],
    ['O', "And the <b>owner or operator</b> answers for it: the work must meet <b>Singapore airworthiness requirements</b>.", 'mx2'],
    ['O', "Our approved copy is waiting at the <b>CAAS Office</b> in town. Grab any vehicle – press <b>F</b> – and go."]] },
  { t: 'goto', loc: 'caas', time: 80, text: 'Drive to the <b>CAAS Office</b> and collect the approved Maintenance Schedule.' },
  { t: 'talk', lines: [
    ['I', "Approved Maintenance Schedule for Vista Bay Air. Know what's in it:"],
    ['I', "The <b>periods</b> at which the aircraft, components, equipment and installations are inspected, the <b>extent</b> of each inspection, and the practices and procedures.", 'mx3'],
    ['I', "Which components are <b>overhauled or retired</b> and when – by <b>calendar time, flying time or other approved service life</b>.", 'mx4'],
    ['I', "And the procedures and paperwork for certifying checks – including issuing the <b>CMR</b> and the <b>CRS</b>.", 'mx5']] },
  { t: 'goto', loc: 'ops', time: 80, text: 'Bring the schedule back to the <b>Ops Centre</b>.' },
  { t: 'check', title: 'Planning desk', prompt: 'Which of these does the Maintenance Schedule provide? Select ALL that apply.',
    items: [['Inspection periods and the extent of each inspection', true], ['Components to overhaul or retire at specified periods', true], ['Procedures for certifying checks, issuing the CMR and the CRS', true], ['The crew hotel roster', false], ['Passenger ticket prices', false]],
    why: 'Slide 65: inspection periods & extent; overhaul/retirement schedule; procedures and documentation for checks, CMR and CRS.' },
  Q('Who APPROVES the Maintenance Schedule?', 'The Authority (DGCA)', ['The aircraft manufacturer', 'The aircraft captain'], 'The Operator prepares it; the Authority (DGCA) approves it.', 'Slide 64')
] },
{ id: 'm2', c: 'O', topic: 'mx', name: 'Overdue', cash: 800, steps: [
  { t: 'talk', lines: [
    ['O', "Each type has its own check intervals. Remember these three:", 'mx6'],
    ['O', "<b>A320 – A check every 500 flying hours.</b> <b>B777 – every 1000 FH.</b> <b>A340-500 – every 1200 FH.</b>"],
    ['O', "Word is Pencil Whip are about to dispatch an aircraft that is <b>overdue</b>. Find it before it moves."]] },
  { t: 'choose', time: 70, text: 'Drive to the aircraft that is <b>OVERDUE</b> for its A check.', opts: [
    { loc: 'standA', label: '9V-VBA · A320\n520 FH since A check', ok: true },
    { loc: 'standB', label: '9V-VBC · B777\n640 FH since A check', ok: false, why: 'The B777 A check is every 1000 FH – 640 FH is within limits.' },
    { loc: 'standC', label: '9V-VBD · A340-500\n900 FH since A check', ok: false, why: 'The A340-500 A check is every 1200 FH – 900 FH is within limits.' }],
    why: 'A320 A check every 500 FH: 520 FH is overdue.' },
  { t: 'chase', veh: 'tug', from: 'standA', to: 'runway', hits: 3, text: "Pencil Whip's tug is towing 9V-VBA to the runway! <b>Ram it 3 times</b> to stop it.", who: 'Pencil Whip tug' },
  { t: 'talk', lines: [
    ['O', "Nice driving. That's the whole point: <b>no aircraft is flown</b> until ALL work is <b>completed and certified</b> on the right documents – and the <b>pilot is notified</b> of its status.", 'mx7'],
    ['O', "And if the work could have affected <b>flight characteristics</b>, it is not released until <b>certified fit for flight</b>.", 'mx8']] },
  Q('After an aileron actuator change, flight characteristics may have been affected. When can the aircraft be released?', 'Only after it is certified as fit for flight', ['Immediately – the job is finished', 'At the next scheduled A check'], 'Slide 67: where flight characteristics may have been affected, the aircraft shall not be released until certified as fit for flight.', 'Slide 67')
] },
/* ───── C · Certificate of Release to Service ───── */
{ id: 'm3', c: 'C', topic: 'crs', name: 'Who Signs?', cash: 700, steps: [
  { t: 'talk', lines: [
    ['C', "Dev Raman, Chief Certifying Engineer. My signature is the last thing before an aircraft flies – the <b>Certificate of Release to Service</b>."],
    ['C', "A CRS must be issued by <b>appropriately licensed personnel</b> after any <b>overhaul, maintenance, modification, replacement, repair or inspection</b>.", 'crs1'],
    ['C', "And <b>no aircraft shall fly</b> unless the CRS comes from an <b>approved SAR-145 maintenance organisation</b>.", 'crs2'],
    ['C', "Careful – an <b>AML alone is NOT enough</b>. You also need a <b>SAR-145 certification authorisation</b> from the organisation…", 'crs3'],
    ['C', "…and <b>6 months</b> of relevant maintenance experience in the <b>preceding 2 years</b>.", 'crs4'],
    ['C', "9V-VBC's brake change is done. Three engineers are on the apron. Only ONE can sign."]] },
  { t: 'choose', time: 75, people: true, text: 'Find the engineer who can <b>legally sign the CRS</b> for 9V-VBC.', opts: [
    { loc: 'standA', label: 'KEN\nB1 licence · no SAR-145 authorisation', ok: false, why: 'An AML alone does not permit the holder to issue a CRS – a SAR-145 certification authorisation is also needed.' },
    { loc: 'standB', label: 'MEI\nB1 + SAR-145 authorisation\n8 months work in last 2 yrs', ok: true },
    { loc: 'standC', label: 'JO\nSAR-145 authorisation\n2 months work in last 2 yrs', ok: false, why: 'Certifying staff need 6 months of relevant maintenance experience in the preceding 2 years.' }],
    why: 'Mei holds an AML, a SAR-145 certification authorisation and enough recent experience.' },
  { t: 'check', title: 'Mei\'s checklist', prompt: 'A CRS must be issued after completing which kinds of work? Select ALL that apply.',
    items: [['Overhaul', true], ['Modification', true], ['Replacement of a part', true], ['Repair', true], ['Inspection', true], ['Boarding the passengers', false], ['Changing the crew roster', false]],
    why: 'Slide 68: after overhauls, maintenance, modification, replacements, repairs and inspections.' },
  { t: 'talk', lines: [
    ['C', "She signs on behalf of the <b>SAR-145 organisation</b>, only after <b>all</b> applicable tasks are satisfactorily done.", 'crs5'],
    ['C', "The CRS statement certifies the work was done per <b>SAR-145 and the Air Navigation Order</b>, and the aircraft is <b>ready for release to service</b>.", 'crs8'],
    ['C', "Licence categories matter too: <b>Cat A</b> – simple line tasks they did themselves. <b>B1</b> – structure, powerplant, mechanical, electrical. <b>B2</b> – avionics and electrical.", 'crs9']] },
  Q('An engineer holds a B1 AML but has no SAR-145 certification authorisation. Can they issue a CRS?', 'No – an AML alone does not permit issuing a CRS', ['Yes – the B1 licence is enough', 'Yes – but only at night'], 'Slide 110: to issue a CRS, an AML holder also needs a SAR-145 certification authorisation.', 'Slide 110')
] },
{ id: 'm4', c: 'C', topic: 'crs', name: 'Off-Wing', cash: 900, steps: [
  { t: 'talk', lines: [
    ['C', "9V-VBD's starter generator was repaired in the <b>Component Workshop</b> – off the aircraft."],
    ['C', "Off-aircraft maintenance gets an <b>ARC</b> – Authorised Release Certificate. Once it's installed, the installation needs <b>another CRS</b>.", 'crs6'],
    ['C', "Go collect it. Don't dawdle."]] },
  { t: 'goto', loc: 'workshop', time: 75, text: 'Collect the repaired starter generator from the <b>Component Workshop</b>.' },
  Q('Which certificate comes with the starter generator repaired in the workshop?', 'Authorised Release Certificate (ARC)', ['Certificate of Maintenance Review', 'Certificate of Registration'], 'Slide 125: a component maintained off the aircraft requires an ARC for that maintenance.', 'Slide 125'),
  { t: 'goto', loc: 'standC', time: 80, text: 'Deliver it to <b>9V-VBD at Stand C</b>.' },
  { t: 'sort', title: 'Which certificate?', prompt: 'Assign each job to the certificate it needs.', bins: ['ARC', 'CRS'],
    items: [['Starter generator repaired on the workshop bench', 0], ['Installing the starter generator on 9V-VBD', 1], ['Fuel pump overhauled in the component shop', 0], ['Replacing a main wheel on the aircraft', 1]],
    why: 'Off-aircraft component maintenance → ARC. Work on the aircraft, including fitting the component → CRS.' },
  { t: 'talk', lines: [
    ['C', "The engine controls were disturbed during the install. That's a control system – it needs a <b>duplicate inspection</b>.", 'mx9'],
    ['C', "One qualified person inspects and certifies. Then a <b>second</b> qualified person repeats it and certifies. Fetch our second inspector from the hangar."]] },
  { t: 'goto', loc: 'hangar', time: 70, text: 'Pick up the <b>second inspector</b> at the Line Maintenance Hangar.' },
  { t: 'goto', loc: 'standC', time: 70, text: 'Bring the inspector back to <b>Stand C</b>.' },
  { t: 'talk', lines: [
    ['C', "Both signatures in. We give the operator a <b>copy of the CRS</b> plus any approved repair data – and we keep our detailed records for <b>2 years</b> from release.", 'crs7']] },
  Q('How long must a SAR-145 organisation keep detailed maintenance records?', '2 years from release', ['72 hours', '7 days'], 'Slide 127: retain records for 2 years from the date the aircraft or component was released.', 'Slide 127')
] },
/* ───── Q · Certificate of Maintenance Review ───── */
{ id: 'm5', c: 'Q', topic: 'cmr', name: 'Review Board', cash: 800, steps: [
  { t: 'talk', lines: [
    ['Q', "Aisha Tan, Quality. I look after the <b>Certificate of Maintenance Review – CMR</b>, SAR 4.3."],
    ['Q', "A CMR is <b>evidence the aircraft complies with the approved maintenance schedule</b>.", 'cmr1'],
    ['Q', "Only an <b>authorised LAE</b> with <b>at least 8 years</b> of aircraft maintenance experience may issue it.", 'cmr2'],
    ['Q', "The form certifies the review was done per the <b>ANO</b>, gives the <b>date carried out</b> and the <b>date the next review is due</b>, and is signed with a licence number.", 'cmr5'],
    ['Q', "Pencil Whip forged 9V-VBA's CMR. Three people in town say they can issue a real one. Find the right one."]] },
  { t: 'choose', time: 90, people: true, text: 'Find the person who can <b>issue a genuine CMR</b>.', opts: [
    { loc: 'pW', label: 'TAN\nAuthorised LAE\n9 years maintenance', ok: true },
    { loc: 'pM', label: 'RAJ\nLAE\n5 years maintenance', ok: false, why: 'The CMR issuer needs at least 8 years of aircraft maintenance experience.' },
    { loc: 'pE', label: 'CAPT. ONG\nAirline pilot\n15 years flying', ok: false, why: 'The CMR is issued by an authorised LAE – flying hours are not maintenance experience.' }],
    why: 'An authorised LAE with at least 8 years of maintenance experience.' },
  { t: 'goto', loc: 'quality', time: 90, text: 'Drive Tan to the <b>Quality Office</b>.' },
  Q('What does a CMR provide evidence of?', 'Compliance with the approved maintenance schedule', ['That the aircraft is registered in Singapore', 'That the aircraft meets ICAO noise standards'], 'Slide 69: the CMR provides evidence that the aircraft complies with the approved maintenance schedule.', 'Slide 69')
] },
{ id: 'm6', c: 'Q', topic: 'cmr', name: 'Deadline', cash: 1000, steps: [
  { t: 'talk', lines: [
    ['Q', "How long a CMR lasts depends on weight – the maximum take-off weight authorised, <b>MTWA</b>."],
    ['Q', "<b>Above 2730 kg MTWA: 4 months</b> – or otherwise approved by CAAS.", 'cmr3'],
    ['Q', "<b>Below 2730 kg MTWA: 1 year.</b>", 'cmr4']] },
  { t: 'choose', time: 60, text: '9V-VBA (A320, MTWA 78,000 kg) had its review on <b>3 Feb</b>. Drive to the correct <b>next-due date</b>.', opts: [
    { loc: 'n_3_2', label: 'NEXT DUE\n2 JUN', ok: true },
    { loc: 'n_4_2', label: 'NEXT DUE\n2 AUG', ok: false, why: 'Over 2730 kg MTWA the CMR runs 4 months, not 6 – unless CAAS approves otherwise.' },
    { loc: 'n_4_3', label: 'NEXT DUE\n2 FEB next year', ok: false, why: '1 year is only for aircraft below 2730 kg MTWA.' }],
    why: '78,000 kg is above 2730 kg → 4 months: 3 Feb → 2 Jun.' },
  { t: 'choose', time: 60, text: '9V-VBX at the GA apron (MTWA 1,100 kg) had its review on <b>10 Mar</b>. When is the next one due?', opts: [
    { loc: 'n_4_1', label: 'NEXT DUE\n9 JUL', ok: false, why: '4 months is for aircraft ABOVE 2730 kg. 9V-VBX is only 1,100 kg.' },
    { loc: 'n_5_1', label: 'NEXT DUE\n9 MAR next year', ok: true },
    { loc: 'n_5_2', label: 'NEXT DUE\n17 MAR', ok: false, why: '7 days is the Certificate of Fitness for Flight, not the CMR.' }],
    why: 'Below 2730 kg MTWA → 1 year.' },
  { t: 'chase', veh: 'van', from: 'n_4_3', to: 'dock', hits: 3, text: "Pencil Whip's forger is fleeing with blank CMR forms! <b>Ram his van 3 times.</b>", who: 'Forger\'s van' },
  Q('A sample B777 CMR runs 6 months (3 Feb → 2 Aug), although the aircraft is over 2730 kg. How is that allowed?', 'The period was otherwise approved by CAAS', ['Heavy aircraft always get 6 months', 'The captain extended it'], 'Slide 69: above 2730 kg the CMR is 4 months "or otherwise approved by CAAS".', 'Slide 69')
] },
/* ───── K · Technical Log ───── */
{ id: 'm7', c: 'K', topic: 'tlog', name: 'Flight Paperwork', cash: 700, steps: [
  { t: 'talk', lines: [
    ['K', "Captain Lim. After every flight, I – the <b>pilot-in-command</b> – fill in the <b>technical log</b>."],
    ['K', "I record the <b>take-off and landing times</b>, the <b>flight duration</b>, and any <b>technical defects</b> during the flight.", 'tl1'],
    ['K', "<b>BLOCK LETTERS</b>, and every time in <b>GMT – 'Z'</b>.", 'tl5'],
    ['K', "A jet blast just scattered my notes over the apron. Grab what belongs in the tech log – leave the junk."]] },
  { t: 'collect', time: 90, text: 'Collect the <b>4 tech log entries</b>. Avoid the junk (red).', items: [
    { loc: 'n_1_2', label: 'TAKE-OFF 0342Z', ok: true }, { loc: 'n_2_2', label: 'LANDING 0718Z', ok: true },
    { loc: 'n_3_2', label: 'FLIGHT TIME 3:36', ok: true }, { loc: 'n_4_2', label: 'DEFECT: PACK 2 FAULT', ok: true },
    { loc: 'n_2_1', label: 'Passenger meal choices', ok: false, why: 'Meal choices are not tech log entries.' },
    { loc: 'n_3_1', label: 'Crew hotel room no.', ok: false, why: 'Hotel rooms have nothing to do with airworthiness.' },
    { loc: 'n_1_1', label: "Tomorrow's weather", ok: false, why: 'The tech log records what happened on the flight, not forecasts.' }] },
  { t: 'talk', lines: [
    ['K', "Got them all. Now the page itself: a <b>Defect Description</b> box, an <b>Action Taken</b> box – with the MEL item or deferred defect and parts on/off – and the <b>signature with licence/authorisation number</b> under the CRS statement.", 'tl4']] },
  { t: 'sort', title: 'Tech log page', prompt: 'Put each entry in the right section of the technical log page.', bins: ['Defect Description', 'Action Taken', 'Certification'],
    items: [['PACK 2 FAULT light on climb', 0], ['Pack 2 valve replaced IAW AMM, ops test OK', 1], ['Deferred under MEL item, Cat C', 1], ['Signature + licence/auth no. under the CRS statement', 2]],
    why: 'Slide 71: defect description · action taken (incl. MEL / deferred defect) · signature, licence/auth no. and the CRS statement.' },
  { t: 'talk', lines: [
    ['K', "One more rule. The tech log <b>stays on board at all times</b> – <b>copies</b> of the entries are kept <b>on the ground</b>. That's why the blue and pink copies come out before the next flight.", 'tl2']] },
  Q('Where must the technical log be kept?', 'On board at all times – copies of entries kept on the ground', ['In the Quality Office only', 'At CAAS, posted after each flight'], 'Slide 70: the tech log remains on board at all times; copies of entry records are kept on the ground.', 'Slide 70')
] },
{ id: 'm8', c: 'K', topic: 'tlog', name: 'Paper Trail', cash: 1000, steps: [
  { t: 'talk', lines: [
    ['K', "Tech log entries don't stay there. The relevant ones are <b>transferred to the log books</b>.", 'tl7'],
    ['K', "SAR 4.6: public transport and aerial work aircraft keep four – <b>Aircraft</b>, <b>Engine</b>, <b>Variable Pitch Propeller</b> and <b>Modification</b> log books.", 'tl6'],
    ['K', "And the operator keeps every entry record for <b>2 years</b> after the date of entry or period of validity.", 'tl3'],
    ['K', "The Log Book Archive is east of Quality. File these entries."]] },
  { t: 'choose', time: 60, text: 'File: <b>"No.2 engine fuel nozzle replaced"</b>', opts: 'books', ans: 1, why: 'Engine work → Engine log book.' },
  { t: 'choose', time: 45, text: 'File: <b>"Service bulletin cabin modification embodied"</b>', opts: 'books', ans: 3, why: 'An embodied modification → Modification log book.' },
  { t: 'choose', time: 45, text: 'File: <b>"Propeller pitch-change mechanism overhauled"</b>', opts: 'books', ans: 2, why: 'Propeller work → Variable Pitch Propeller log book.' },
  { t: 'choose', time: 45, text: 'File: <b>"Main landing gear brake unit replaced"</b>', opts: 'books', ans: 0, why: 'Airframe work such as landing gear → Aircraft log book.' },
  { t: 'chase', veh: 'truck', from: 'archive', to: 'dock', hits: 3, text: 'Pencil Whip are dumping last year\'s tech logs in the sea! <b>Ram the truck 3 times.</b>', who: 'Shredder truck' },
  Q('How long does the operator keep technical log entry records?', '2 years after the date of entry or period of validity', ['Until the aircraft is sold', '30 days'], 'Slide 70: all entry records shall be kept by the operator for 2 years.', 'Slide 70')
] },
/* ───── I · Final ───── */
{ id: 'm9', c: 'I', topic: null, name: 'Pencil Whip Takedown', cash: 2500, final: true, steps: [
  { t: 'talk', lines: [
    ['I', "Inspector Farah, CAAS. You've rattled them. Their boss, <b>Skipworth</b>, is about to dispatch 9V-VBC with a fake release."],
    ['I', "Do it by the book and we've got him. The captain at the <b>Crew Centre</b> has the tech log."]] },
  { t: 'goto', loc: 'crew', time: 70, text: 'Get to the <b>Crew Centre</b> and read 9V-VBC\'s tech log.' },
  Q('The tech log shows "NO.1 ENGINE VIBRATION" on the last flight. What must happen before 9V-VBC flies?', 'Rectify it, certify the work with a CRS and notify the pilot of its status', ['Nothing – the captain has accepted it', 'Write "OK" in pencil and dispatch'], 'Slides 67-68: work completed and certified (CRS), pilot notified of status.', 'Slides 67-68'),
  { t: 'goto', loc: 'hangar', time: 70, text: 'Grab a licensed team from the <b>Line Maintenance Hangar</b>.' },
  { t: 'goto', loc: 'standB', time: 70, text: 'Get to <b>9V-VBC at Stand B</b>.' },
  { t: 'check', title: 'Dispatch gate', prompt: 'Before 9V-VBC can go, which must be true? Select ALL that apply.',
    items: [['Work done per the approved Maintenance Schedule', true], ['CRS signed by staff with an AML + SAR-145 authorisation', true], ['CMR current – within 4 months (over 2730 kg) unless CAAS approved otherwise', true], ['Tech log completed; copies left on the ground', true], ['Skipworth said it\'s fine', false], ['The last CMR was issued 7 months ago', false]],
    why: 'Maintenance Schedule, CRS by authorised certifying staff, a current CMR and a complete tech log.' },
  { t: 'chase', veh: 'follow', from: 'standB', to: 'runway', hits: 4, slow: 0.7, text: 'Skipworth is running in the Follow-Me car! <b>Ram him 4 times.</b>', who: 'Skipworth' },
  { t: 'talk', lines: [
    ['I', "Got him. Pencil-whipping ends today."],
    ['I', "Come to the <b>CAAS Office</b> when you're ready. The <b>Licence Board</b> wants a word."]] }
] },
/* ───── Design Cay · T · Type Certificate ───── */
{ id: 'd1', c: 'T', island: true, topic: 'tc', name: 'State of Design', cash: 800, steps: [
  { t: 'talk', lines: [
    ['T', "Welcome to <b>Design Cay</b>. I'm Dr. Lena Ortiz – I deal with <b>Type Certificates</b>."],
    ['T', "Every new aircraft goes through three stages: <b>Design</b>, then <b>Production</b>, then <b>Flight Test</b>.", 'tc1'],
    ['T', "Show me you know the order: visit each stage on the island, in sequence."]] },
  { t: 'choose', time: 70, text: 'A brand-new aircraft type. <b>Stage 1</b> – drive to it.', opts: [{ loc: 'doa', label: 'DESIGN\nDesign Office', ok: true, why: '' }, { loc: 'prod', label: 'PRODUCTION\nProduction Plant', ok: false, why: 'You cannot produce an aircraft that has not been designed yet.' }, { loc: 'ftest', label: 'FLIGHT TEST\nTest Strip', ok: false, why: 'Flight test comes last – there is nothing to fly yet.' }], why: 'Design comes first.' },
  { t: 'choose', time: 70, text: '<b>Stage 2</b> – drive to it.', opts: [{ loc: 'doa', label: 'DESIGN\nDesign Office', ok: false, why: 'Design is done – what comes next?' }, { loc: 'prod', label: 'PRODUCTION\nProduction Plant', ok: true, why: '' }, { loc: 'ftest', label: 'FLIGHT TEST\nTest Strip', ok: false, why: 'The aircraft must be built before it can be flight tested.' }], why: 'Production comes second.' },
  { t: 'choose', time: 80, text: '<b>Stage 3</b> – drive to it.', opts: [{ loc: 'doa', label: 'DESIGN\nDesign Office', ok: false, why: 'Design is long finished.' }, { loc: 'prod', label: 'PRODUCTION\nProduction Plant', ok: false, why: 'Production is done – the aircraft now has to prove itself in the air.' }, { loc: 'ftest', label: 'FLIGHT TEST\nTest Strip', ok: true, why: '' }], why: 'Flight test completes the sequence.' },
  { t: 'talk', lines: [
    ['T', "When a new type has been through all that, it receives a <b>Type Certificate – TC</b>."],
    ['T', "The TC is issued by the Civil Aviation Authority of the <b>State of Design</b> – the country where the type was designed.", 'tc2'],
    ['T', "And whoever holds a TC – or an STC, a mod/repair approval or an STSO – must hold <b>Design Organisation Approval, DOA</b>.", 'tc4']] },
  Q('Who issues the Type Certificate for a new aircraft type?', 'The Civil Aviation Authority of the State of Design', ['CAAS, for every aircraft flown in Singapore', 'The airline that buys the first aircraft'], 'Slide 82: each new aircraft type is issued a TC by the CAA of the State of Design.', 'Slide 82')
] },
{ id: 'd2', c: 'T', island: true, topic: 'tc', name: 'Letter of Acceptance', cash: 1000, steps: [
  { t: 'talk', lines: [
    ['T', "Most aircraft flying in Singapore were designed somewhere else. CAAS doesn't issue them a new TC…"],
    ['T', "…it grants a <b>letter of acceptance</b> of the existing TC – one issued by the <b>FAA</b> where the US is the State of Design, or by the <b>relevant authority of a contracting state</b>.", 'tc3']] },
  { t: 'choose', time: 70, text: 'A jet type designed in the <b>United States</b> joins a Singapore airline. What does CAAS issue for its type design?', opts: [
    { loc: 'n1', label: 'LETTER OF ACCEPTANCE\nof the FAA TC', ok: true },
    { loc: 'n2', label: 'A NEW\nSingapore TC', ok: false, why: 'CAAS accepts the State of Design\'s TC with a letter of acceptance – it does not re-certificate the type.' },
    { loc: 'n3', label: 'AN STC', ok: false, why: 'An STC approves a major change to a type design – not a whole new type.' }],
    why: 'CAAS grants a letter of acceptance of the FAA TC (the US is the State of Design).' },
  { t: 'talk', lines: [['T', "Trouble – a dealer is trying to sneak a prototype with <b>no Type Certificate at all</b> off the island. Stop him before he reaches the bridge!"]] },
  { t: 'chase', veh: 'van', route: ['iNE', 'iE', 'iSE', 'iSW', 'iW', 'bE', 'bW'], hits: 3, text: 'Stop the uncertified dealer before he crosses the bridge! <b>Ram him 3 times.</b>', who: 'Uncertified dealer' },
  Q('A TC was issued by the aviation authority of another ICAO contracting state. What can CAAS do?', 'Grant a letter of acceptance of that TC', ['Nothing – only FAA TCs can be accepted', 'Insist the aircraft is redesigned in Singapore'], 'Slide 82: CAAS grants a letter of acceptance of a TC issued by the relevant authority of a contracting state.', 'Slide 82')
] },
/* ───── Design Cay · S · Supplemental Type Certificate ───── */
{ id: 'd3', c: 'S', island: true, topic: 'stc', name: 'Major or Minor', cash: 800, steps: [
  { t: 'talk', lines: [
    ['S', "Marco Lim, DOA design engineer. Airlines are always changing their aircraft – and every <b>design change</b> is classified <b>Minor</b> or <b>Major</b>.", 'stc1'],
    ['S', "It's <b>Major</b> if it affects <b>weight &amp; balance</b>, <b>structural strength</b>, <b>flight performance &amp; characteristics</b>, <b>power plant operations</b> or anything else affecting airworthiness.", 'stc2'],
    ['S', "<b>Minor</b> changes are developed by Design Organisations and approved by the <b>Authority</b> or a <b>DOA holder</b>.", 'stc3'],
    ['S', "My in-tray blew across the island. Collect only the <b>MAJOR</b> change requests – the markers won't tell you which is which."]] },
  { t: 'collect', blind: true, time: 100, text: 'Collect the <b>3 MAJOR</b> design changes. Leave the minor ones.', items: [
    { loc: 'n1', label: 'Bigger fuel tank\n(changes weight & balance)', ok: true },
    { loc: 's2', label: 'Wing spar reinforcement\n(structural strength)', ok: true },
    { loc: 'n3', label: 'Higher engine thrust rating\n(power plant operations)', ok: true },
    { loc: 's1', label: 'New seat-cover fabric', ok: false, why: 'No effect on weight & balance, strength, performance or the power plant – a minor change.' },
    { loc: 'n2', label: 'Galley curtain colour', ok: false, why: 'Cosmetic, no airworthiness effect – a minor change.' },
    { loc: 's3', label: 'Re-worded cabin placard', ok: false, why: 'No airworthiness effect – a minor change.' }] },
  { t: 'sort', title: 'Classify the change', prompt: 'Major or minor?', bins: ['Major', 'Minor'],
    items: [['Moving a heavy galley 6 m aft (weight & balance)', 0], ['Changing flight-control surface travel (flight characteristics)', 0], ['New carpet of the same weight and fire rating', 1], ['Adding a reading-light switch label', 1]],
    why: 'Major = affects weight & balance, structural strength, flight performance & characteristics, power plant operations or airworthiness.' },
  Q('Who can approve a MINOR design change?', 'The Authority, or a DOA holder', ['Only the State of Design', 'Any licensed mechanic'], 'Slide 83: minor changes are approved by the authority or by holders of Design Organisation Approval.', 'Slide 83')
] },
{ id: 'd4', c: 'S', island: true, topic: 'stc', name: 'The Supplemental', cash: 1000, steps: [
  { t: 'talk', lines: [
    ['S', "A <b>major</b> change to a type design needs a <b>Supplemental Type Certificate – STC</b>.", 'stc4'],
    ['S', "The STC is issued by the CAA of the <b>State of Registry</b> of the aircraft being modified.", 'stc5'],
    ['S', "Major changes are <b>developed by DOA holders</b> – but <b>only the Authority</b> can approve them, by issuing the STC.", 'stc6']] },
  { t: 'choose', time: 70, text: '<b>9V-VBA</b> (a Singapore-registered A320) is getting a satellite-comms antenna – a major change. <b>Who issues the STC?</b>', opts: [
    { loc: 's1', label: 'CAAS\nState of Registry', ok: true },
    { loc: 's2', label: 'STATE OF DESIGN\nauthority', ok: false, why: 'The STC is issued by the State of Registry of the aircraft being modified – Singapore, for a 9V aircraft.' },
    { loc: 's3', label: 'THE DOA HOLDER\nitself', ok: false, why: 'DOA holders develop major changes, but only the Authority can approve them through an STC.' }],
    why: '9V = Singapore registry, so CAAS issues the STC.' },
  { t: 'talk', lines: [['S', "The STC holder keeps <b>complete and current technical data</b> for each STC – for the <b>life of any product</b> that carries it. Take this data pack to the <b>Technical Data Vault</b>.", 'stc7']] },
  { t: 'goto', loc: 'vault', time: 80, text: 'Deliver the STC data pack to the <b>Technical Data Vault</b>.' },
  { t: 'talk', lines: [
    ['S', "One more thing: DOA holders can develop design data, issue statements of compliance and approve minor changes – but <b>only design signatories</b> can certify design data.", 'stc8'],
    ['S', "Alert! A shop is fitting an antenna with <b>no STC</b> and heading for the flight test strip. Stop them!"]] },
  { t: 'chase', veh: 'van', route: ['iSW', 'iSE', 'iNE', 'iNW', 'n1', 'ftest'], hits: 3, text: 'Stop the unapproved modification before it reaches the test strip! <b>Ram it 3 times.</b>', who: 'No-STC mod van' },
  Q('How long must an STC holder keep the technical data for that STC?', 'For the life of any product incorporating the STC', ['2 years', 'Until the next C of A renewal'], 'Slide 85: complete and current technical data for each STC for the life of any product incorporating it.', 'Slide 85')
] },
/* ───── Design Cay · P · Singapore Technical Standard Order ───── */
{ id: 'd5', c: 'P', island: true, topic: 'stso', name: 'Parts with Papers', cash: 800, steps: [
  { t: 'talk', lines: [
    ['P', "Priya Nair, STSO Parts Plant. <b>STSO</b> stands for <b>Singapore Technical Standard Order</b>."],
    ['P', "STSO approval is the <b>design approval for products installed on aircraft</b> – avionics boxes, seat belts, emergency beacons, lights.", 'so1'],
    ['P', "An applicant must <b>apply for or hold DOA</b> – or have an <b>arrangement for design configuration control</b>.", 'so2'],
    ['P', "Our delivery truck spilled its paperwork. Collect only the items that would get an <b>STSO</b>."]] },
  { t: 'collect', blind: true, time: 100, text: 'Collect the <b>3 articles</b> that would get STSO approval.', items: [
    { loc: 's1', label: 'Emergency locator\ntransmitter', ok: true },
    { loc: 'n2', label: 'Seat belt\nassembly', ok: true },
    { loc: 's3', label: 'Navigation light\nunit', ok: true },
    { loc: 'n1', label: 'A whole new\naircraft type', ok: false, why: 'A new aircraft type gets a Type Certificate, not an STSO.' },
    { loc: 's2', label: 'Cabin layout\nmodification', ok: false, why: 'A major change to a type design needs an STC.' },
    { loc: 'n3', label: 'Airline\ntimetable', ok: false, why: 'Not something installed on an aircraft.' }] },
  { t: 'check', title: 'STSO application', prompt: 'What must an STSO applicant have? Select ALL that apply.',
    items: [['DOA status – or an application for it', true], ['…or an arrangement for design configuration control', true], ['An Air Operator Certificate', false], ['A Certificate of Airworthiness for the article', false]],
    why: 'Slide 86: apply for/hold DOA, or have an arrangement for design configuration control.' },
  Q('An STSO approval is…', 'A design approval for an article installed on aircraft', ['An approval to operate an airline', 'A certificate that a whole aircraft is airworthy'], 'Slide 86: STSO approval is the design approval for products that are installed on aircraft.', 'Slide 86')
] },
{ id: 'd6', c: 'P', island: true, topic: 'stso', name: 'Production Run', cash: 1000, steps: [
  { t: 'talk', lines: [
    ['P', "Designing an article is one thing; making it is another. A <b>Production Organisation Approval – POA</b> holder may produce it and issue an <b>Authorised Release Certificate, CAAS(AW)95</b>.", 'so4'],
    ['P', "A POA holder must <b>hold DOA</b>, or have an <b>arrangement with a DOA holder</b>. Head to the Production Plant.", 'so5']] },
  { t: 'goto', loc: 'prod', time: 80, text: 'Drive to the <b>Production Plant</b>.' },
  Q('Which certificate does a POA holder issue for the articles it produces?', 'Authorised Release Certificate CAAS(AW)95', ['Supplemental Type Certificate', 'Certificate of Registration'], 'Slide 89: POA holders issue an Authorised Release Certificate CAAS(AW)95 for articles produced.', 'Slide 89'),
  { t: 'talk', lines: [['P', "This beacon line is being retired. When production stops, the STSO holder keeps the complete technical data file for <b>2 more years</b>. Take the file to the Vault.", 'so3']] },
  { t: 'goto', loc: 'vault', time: 80, text: 'Archive the data file at the <b>Technical Data Vault</b>.' },
  { t: 'talk', lines: [['P', "Let's make sure you can tell the three approvals apart.", 'so6']] },
  { t: 'sort', title: 'TC, STC or STSO?', prompt: 'Which design approval does each one need?', bins: ['TC', 'STC', 'STSO'],
    items: [['A brand-new aircraft type', 0], ['A major change to an existing type design', 1], ['An avionics unit fitted to many aircraft types', 2], ['Relocating the galley on a 9V A320 (weight & balance)', 1], ['A new seat belt assembly design', 2]],
    why: 'TC → new type · STC → major change to a type design · STSO → article installed on aircraft.' },
  Q('Production of an STSO article stops on 1 Jan 2026. Until when must the technical data file be kept?', '1 Jan 2028 – 2 years after production stops', ['1 Jan 2027', 'For the life of every aircraft'], 'Slide 86: until 2 years from the date of cessation of production.', 'Slide 86')
] }
];

/* Design Cay: Design Board exam */
const DEXAM = [
  Q('The three stages of aircraft design & production are…', 'Design → Production → Flight Test', ['Flight Test → Design → Production', 'Production → Design → Flight Test'], 'Slide 81.', 'Slide 81'),
  Q('Who issues the TC for a new aircraft type?', 'The CAA of the State of Design', ['CAAS for every type', 'The aircraft operator'], 'Slide 82.', 'Slide 82'),
  Q('For a type designed in the US, CAAS…', 'Grants a letter of acceptance of the FAA TC', ['Issues its own new TC', 'Issues an STC'], 'Slide 82.', 'Slide 82'),
  Q('Design changes are classified as…', 'Minor or Major', ['Small, Medium or Large', 'Internal or External'], 'Slide 83.', 'Slide 83'),
  Q('Which change is MAJOR?', 'One that affects structural strength', ['New seat-cover fabric', 'A re-worded placard'], 'Slide 83.', 'Slide 83'),
  Q('Who can approve a minor design change?', 'The Authority or a DOA holder', ['Only the State of Design', 'The pilot-in-command'], 'Slide 83.', 'Slide 83'),
  Q('An STC is the design approval for…', 'A major change to a type design', ['A whole new aircraft type', 'An article such as a seat belt'], 'Slide 84.', 'Slide 84'),
  Q('Who issues the STC?', 'The CAA of the State of Registry of the modified aircraft', ['The State of Design', 'The DOA holder'], 'Slide 84.', 'Slide 84'),
  Q('Major changes are developed by…', 'DOA holders – and approved only by the Authority via an STC', ['Any approved maintenance organisation, which approves them itself', 'The aircraft owner'], 'Slide 85.', 'Slide 85'),
  Q('How long does an STC holder keep the technical data?', 'For the life of any product incorporating the STC', ['2 years', '5 years'], 'Slide 85.', 'Slide 85'),
  Q('STSO approval is the design approval for…', 'Products installed on aircraft', ['A complete aircraft type', 'An airline\'s operations'], 'Slide 86.', 'Slide 86'),
  Q('An STSO applicant must…', 'Hold or apply for DOA, or have a design configuration control arrangement', ['Hold an AOC', 'Be a CAAS employee'], 'Slide 86.', 'Slide 86'),
  Q('STSO technical data is kept until…', '2 years after production stops', ['The article is first sold', 'Forever'], 'Slide 86.', 'Slide 86'),
  Q('Who must obtain Design Organisation Approval?', 'Holders of a TC, STC, mod/repair approval or STSO', ['Every airline pilot', 'Only aircraft owners'], 'Slide 88.', 'Slide 88'),
  Q('Within a DOA company, who certifies design data?', 'Only design signatories', ['Any employee', 'The accountable manager\'s secretary'], 'Slide 88.', 'Slide 88'),
  Q('A POA holder issues which certificate for articles it produces?', 'Authorised Release Certificate CAAS(AW)95', ['Type Certificate', 'Certificate of Maintenance Review'], 'Slide 89.', 'Slide 89')
];

/* Final Licence Board exam + Records Desk question bank */
const EXAM = [
  Q('Who prepares the Maintenance Schedule?', 'The Operator', ['CAAS', 'The aircraft captain'], 'Prepared by the Operator, approved by the Authority (DGCA).', 'Slide 64'),
  Q('Who is responsible for ensuring maintenance meets Singapore airworthiness requirements?', 'The owner or operator', ['ICAO', 'The airport authority'], 'Slide 64.', 'Slide 64'),
  Q('Components are overhauled or retired at specified periods measured in…', 'Calendar time, flying time or other approved service life', ['Passenger numbers only', 'Fuel burnt only'], 'Slide 65.', 'Slide 65'),
  Q('A320 A check interval (slide 66)?', '500 FH', ['5000 FH', '15 days'], 'A319/A320: A check 500 FH, C check 15 months.', 'Slide 66'),
  Q('Duplicate inspection is required after maintenance of…', 'Any flight control system', ['The passenger seats', 'The lavatory'], 'SAR 4.8: control surfaces, engine/propeller controls etc.', 'Slide 73'),
  Q('A duplicate inspection means…', 'Inspected and certified by one qualified person, then repeated and certified by a second', ['Two copies of the same form', 'The same person checks twice'], 'Slide 73.', 'Slide 73'),
  Q('Who must issue a CRS?', 'Appropriately licensed personnel (certifying staff)', ['Any ramp worker', 'The aircraft owner'], 'Slide 68.', 'Slide 68'),
  Q('Besides an AML, what does an engineer need to issue a CRS?', 'A SAR-145 certification authorisation', ['A Certificate of Registration', 'A private pilot licence'], 'Slide 110.', 'Slide 110'),
  Q('Certifying staff must have how much recent experience?', '6 months in the preceding 2 years', ['1 month in the last year', '8 years'], 'Slides 110, 121.', 'Slide 110'),
  Q('A component repaired off the aircraft and then fitted needs…', 'An ARC for the repair and another CRS for the installation', ['Only a CMR', 'Nothing more'], 'Slide 125.', 'Slide 125'),
  Q('No aircraft shall fly unless a CRS is issued by…', 'An approved SAR-145 maintenance organisation', ['The airline marketing team', 'Any overseas workshop'], 'SAR 145.1.', 'Slide 116'),
  Q('What does the CMR provide evidence of?', 'Compliance with the approved maintenance schedule', ['Noise compliance', 'Ownership of the aircraft'], 'SAR 4.3.', 'Slide 69'),
  Q('Minimum experience for the LAE issuing a CMR?', 'At least 8 years of aircraft maintenance', ['2 years', '6 months'], 'Slide 69.', 'Slide 69'),
  Q('CMR period for an aircraft ABOVE 2730 kg MTWA?', '4 months, or otherwise approved by CAAS', ['1 year', '7 days'], 'Slide 69.', 'Slide 69'),
  Q('CMR period for an aircraft BELOW 2730 kg MTWA?', '1 year', ['4 months', '2 years'], 'Slide 69.', 'Slide 69'),
  Q('Who records take-off/landing times and defects in the tech log?', 'The Captain (pilot-in-command)', ['The ground handler', 'The CAAS inspector'], 'SAR 4.5.', 'Slide 70'),
  Q('Where is the technical log kept?', 'On board at all times, with copies of entries on the ground', ['Only in the hangar', 'Only at CAAS'], 'Slide 70.', 'Slide 70'),
  Q('How long are tech log entry records kept by the operator?', '2 years after the date of entry or period of validity', ['3 months', 'Forever'], 'Slide 70.', 'Slide 70'),
  Q('Which is NOT one of the SAR 4.6 log books?', 'Cabin catering log book', ['Engine log book', 'Modification log book'], 'Aircraft, Engine, Variable Pitch Propeller, Modification.', 'Slide 72'),
  Q('Tech log times are written in…', 'GMT (Z)', ['Local Singapore time', 'Any time zone'], 'Slide 71.', 'Slide 71'),
  Q('Where do relevant tech log entries end up?', 'Transferred to the respective log books', ['Thrown away after landing', 'Emailed to passengers'], 'Slide 72.', 'Slide 72'),
  Q('Maintenance may have affected flight characteristics. The aircraft is released only when…', 'Certified as fit for flight', ['The captain says so', 'It has been washed'], 'Slide 67.', 'Slide 67')
];
