/* ME2804 Air Legislation – lesson & challenge content (sourced from slides 1-42) */
const Q = (q, a, wrong, w) => ({ q, a, wrong, w });   // question helper: a = correct answer text

const ZONES = [
/* ───────────────────────── 1 ───────────────────────── */
{
  id: 'history', name: 'Aviation History Hangar', topic: 'Convention on International Civil Aviation – why we needed it',
  color: 0xe67e22, npc: 'Capt. Wright', npcLook: { shirt: 0xe67e22, hat: 0xffffff },
  intro: "Welcome to the hangar! Before there was aviation law, there was aviation history. Read the timeline, then prove you can put it in order.",
  cards: [
    { i: '🛩️', t: '1903 – The Wright Flyer', s: 'Slide 3', b: 'The <b>Wright Flyer</b> made the <b>first powered, heavier-than-air machine flight</b>.' },
    { i: '💣', t: '1914 – World War I', s: 'Slide 3', b: '<b>Long-range bombers</b> appear (e.g. the German airship Schütte-Lanz SL2 bombing Warsaw in 1914). Aircraft can now cross borders in minutes.' },
    { i: '🌊', t: '1919 – Transatlantic & first airline', s: 'Slide 3', b: 'The <b>first non-stop transatlantic flight</b> takes place and the <b>first airline</b> is founded – <b>Chalks Flying Service</b>.' },
    { i: '🔥', t: '1937 – Hindenburg disaster', s: 'Slide 4', b: 'A <b>German passenger airship</b> suffers a <b>fatal accident</b> – a wake-up call about passenger safety.' },
    { i: '⚔️', t: '1939–1945 – World War II', s: 'Slide 4', b: 'Shows the <b>importance of air superiority</b> and drives the <b>building of more sophisticated aircraft</b> (e.g. the Spitfire and dive bombers).' },
    { i: '⚖️', t: 'The big idea', s: 'Slides 3-6', b: 'Fast-growing, cross-border flying needed <b>common rules</b>. That is why countries met in Chicago in 1944 – your next stop!' }
  ],
  stages: [
    { type: 'order', title: 'Build the timeline', prompt: 'Tap the events in the order they happened (earliest first).',
      items: ['1903 – Wright Flyer: first powered flight', '1914 – WWI long-range bombers', '1919 – First non-stop transatlantic flight & first airline', '1937 – Hindenburg disaster', '1939-1945 – World War II'] },
    { type: 'quiz', title: 'History check', qs: [
      Q('What happened in 1903?', 'First powered, heavier-than-air machine flight (Wright Flyer)', ['First non-stop transatlantic flight', 'The Chicago Convention was signed', 'The Hindenburg disaster'], 'The Wright Flyer flew in 1903.'),
      Q('The 1919 milestones were…', 'First non-stop transatlantic flight and first airline (Chalks Flying Service)', ['Long-range bombers and the Spitfire', 'ICAO was founded', 'The Hindenburg disaster'], '1919: first non-stop transatlantic flight + first airline, Chalks Flying Service.'),
      Q('The Hindenburg (1937) was…', 'A German passenger airship fatal accident', ['A WWII fighter plane', 'The first transatlantic flight', 'A long-range bomber'], 'The Hindenburg was a German passenger airship that suffered a fatal accident.'),
      Q('What did World War II highlight?', 'The importance of air superiority and building more sophisticated aircraft', ['That airships were the future', 'That airlines needed no rules', 'That flight was impossible over oceans'], 'WWII showed the importance of air superiority → more sophisticated aircraft.')
    ] }
  ]
},
/* ───────────────────────── 2 ───────────────────────── */
{
  id: 'chicago', name: 'Chicago Convention Hall', topic: 'Chicago Convention (Convention on International Civil Aviation)',
  color: 0x2e86de, npc: 'Delegate Marshall', npcLook: { shirt: 0x34495e, hat: 0x34495e },
  intro: "December 1944, Chicago. Fifty-three nations sat down to write the rules of the sky. Learn what they agreed, then pass the delegate's test.",
  cards: [
    { i: '🏛️', t: 'How it started…', s: 'Slides 5-6', b: 'Representatives from the <b>USA and 52 other countries</b> met in <b>Chicago in Dec 1944</b> to draw up regulations for aviation.' },
    { i: '✍️', t: 'Signed 7 December 1944', s: 'Slide 6', b: 'The <b>Convention on International Civil Aviation</b> – the <b>Chicago Convention</b> – was signed on <b>7 Dec 1944</b>.' },
    { i: '📜', t: '96 Articles', s: 'Slide 11', b: 'The Convention contains <b>96 articles</b> which:<ul><li>Establish <b>privileges and restrictions</b></li><li>Provide for adoption of <b>Standards and Recommended Practices (SARPs)</b></li><li>Accept the principle of <b>sovereignty of airspace</b> above a State\'s territory</li></ul>' },
    { i: '🌐', t: 'Significance (1)', s: 'Slide 10', b: 'It defined the <b>fundamental principles</b> of international air navigation and <b>sovereignty over airspace</b>.' },
    { i: '🏢', t: 'Significance (2)', s: 'Slide 10', b: 'It established the <b>International Civil Aviation Organization (ICAO)</b> as the governing body for international civil aviation, and facilitated the <b>harmonization of aviation regulations</b> and practices worldwide.' }
  ],
  stages: [
    { type: 'sort', title: 'True or False?', prompt: 'Is the statement true or false?', buckets: ['TRUE', 'FALSE'], items: [
      ['The Chicago Convention was signed on 7 December 1944', 0, 'Signed 7 Dec 1944.'],
      ['The Convention contains 96 articles', 0, 'It has 96 articles.'],
      ['Airspace above a State is free for everybody – no State sovereignty', 1, 'The Convention accepts the principle of SOVEREIGNTY of airspace above a State\'s territory.'],
      ['It provides for the adoption of Standards and Recommended Practices', 0, 'Yes – SARPs are provided for by the Convention.'],
      ['It established ICAO as the governing body for international civil aviation', 0, 'ICAO was established by the Convention.'],
      ['It was signed in Geneva in 1950', 1, 'It was signed in Chicago in 1944.']
    ] },
    { type: 'quiz', title: 'Delegate\'s test', qs: [
      Q('How many countries met in Chicago (besides the USA)?', '52', ['12', '96', '193'], 'Representatives from the USA and 52 other countries met in Chicago.'),
      Q('How many articles does the Chicago Convention contain?', '96', ['52', '193', '36'], '96 articles.'),
      Q('What principle about airspace does the Convention accept?', 'Sovereignty of airspace above a State\'s territory', ['Airspace is owned by ICAO', 'Airspace is open to all aircraft freely', 'Only military may use airspace'], 'Each State has sovereignty over the airspace above its territory.'),
      Q('The formal name of the Chicago Convention is…', 'Convention on International Civil Aviation', ['Air Navigation Act', 'Airworthiness Requirements Treaty', 'International Air Safety Pact'], 'Chicago Convention = Convention on International Civil Aviation.')
    ] }
  ]
},
/* ───────────────────────── 3 ───────────────────────── */
{
  id: 'icao', name: 'ICAO Headquarters', topic: 'International Civil Aviation Organization (ICAO)',
  color: 0x3498db, npc: 'Secretary Chen', npcLook: { shirt: 0x2980b9, hat: 0xffffff },
  intro: "This is ICAO HQ. ICAO governs the worldwide implementation of the Chicago Convention. Learn its aims and objectives.",
  cards: [
    { i: '🏢', t: 'What is ICAO?', s: 'Slide 8', b: 'The <b>International Civil Aviation Organization</b> is the organization governing the <b>worldwide implementation of the Chicago Convention</b>. Website: <i>icao.int</i>.' },
    { i: '🤝', t: 'Contracting States', s: 'Slide 8', b: 'Each ICAO <b>contracting state</b> is a party to the convention. There are <b>193 contracting states</b>.' },
    { i: '🎯', t: 'Aims & objectives (1)', s: 'Slide 16', b: 'Develop principles and techniques of international air navigation and foster international air transport so as to:<ul><li>Ensure <b>safe and orderly growth</b> of international civil aviation</li><li>Encourage the arts of <b>aircraft design and operation for peaceful purposes</b></li><li>Encourage <b>airways, airports and air navigation facilities</b></li><li>Meet the needs for <b>safe, regular, efficient and economical</b> air transport</li></ul>' },
    { i: '🎯', t: 'Aims & objectives (2)', s: 'Slide 17', b: '<ul><li><b>Prevent economic waste</b> caused by unreasonable competition</li><li>Ensure rights of Contracting States are fully respected – <b>fair opportunity</b> to operate international airlines</li><li><b>Avoid discrimination</b> between Contracting States</li><li>Promote <b>safety of flight</b> in international air navigation</li><li>Promote development of <b>all aspects of international civil aeronautics</b></li></ul>' }
  ],
  stages: [
    { type: 'sort', title: 'ICAO objective – or not?', prompt: 'Is this one of ICAO\'s objectives?', buckets: ['ICAO OBJECTIVE', 'NOT AN OBJECTIVE'], items: [
      ['Promote safety of flight in international air navigation', 0, 'Safety of flight is a core objective.'],
      ['Prevent economic waste caused by unreasonable competition', 0, 'Listed on the objectives slide.'],
      ['Favour the largest States when allocating airline routes', 1, 'ICAO aims to AVOID discrimination between Contracting States.'],
      ['Encourage aircraft design and operation for peaceful purposes', 0, 'Yes – "arts of aircraft design and operation for peaceful purposes".'],
      ['Ensure every Contracting State has a fair opportunity to operate international airlines', 0, 'Yes – fair opportunity for every State.'],
      ['Maximise profits for the airlines of founding members', 1, 'Not an ICAO objective – it contradicts fair opportunity & non-discrimination.']
    ] },
    { type: 'quiz', title: 'ICAO check', qs: [
      Q('ICAO is the organization governing…', 'the worldwide implementation of the Chicago Convention', ['Singapore\'s Air Navigation Act', 'airline ticket prices', 'military air forces'], 'ICAO governs worldwide implementation of the Chicago Convention.'),
      Q('How many contracting states are there?', '193', ['52', '96', '36'], '193 contracting states, each a party to the convention.'),
      Q('Which is an ICAO objective?', 'Ensure the safe and orderly growth of international civil aviation', ['Increase airfares', 'Restrict airlines to one per State', 'Promote military air superiority'], 'Safe and orderly growth is the first listed aim.')
    ] }
  ]
},
/* ───────────────────────── 4 ───────────────────────── */
{
  id: 'works', name: 'How ICAO Works', topic: 'How ICAO works',
  color: 0x8e44ad, npc: 'Dr. Assembly', npcLook: { shirt: 0x8e44ad, hat: 0x2c3e50 },
  intro: "ICAO is made up of an Assembly, a Council and a Secretariat. Learn who does what – and how ICAO makes States comply.",
  cards: [
    { i: '🏗️', t: 'Establishment & governance', s: 'Slide 12', b: 'Established in <b>1944</b> by the Chicago Convention. Governed by the <b>ICAO Assembly</b>, which meets <b>every three years</b>, composed of all <b>193</b> contracting states. ICAO develops <b>SARPs</b> adopted by member states for global harmonization.' },
    { i: '🗳️', t: '1. The Assembly', s: 'Slide 13', b: 'The <b>sovereign body</b> of ICAO, with representatives from <b>all contracting states</b>. Meets <b>every three years</b>, reviews the work of the Organization, sets policy and <b>votes a triennial budget</b>.' },
    { i: '👥', t: '2. The Council', s: 'Slide 14', b: 'The <b>governing body</b>, <b>elected by the Assembly</b> for a <b>three-year term</b>, made up of <b>36 States</b>. It gives continuing direction to ICAO\'s work. In the Council, <b>SARPs are adopted</b> and incorporated as <b>Annexes</b> to the Convention.' },
    { i: '🗂️', t: '3. The Secretariat', s: 'Slide 14', b: 'Headed by a <b>Secretary General</b>, divided into <b>five</b> main divisions: <ul><li>Air Navigation Bureau</li><li>Air Transport Bureau</li><li>Technical Co-operation Bureau</li><li>Legal Bureau</li><li>Bureau of Administration and Services</li></ul>' },
    { i: '🧭', t: 'Key responsibilities', s: 'Slide 15', b: '<ul><li><b>Policy development</b> – international standards, policies and recommended practices</li><li><b>Regulatory oversight</b> – monitors compliance with standards</li><li><b>Global collaboration</b> – coordination among States, airlines and stakeholders</li><li><b>Technological advancement</b> – promotes new technologies for safety, security and efficiency</li></ul>' },
    { i: '🔍', t: 'Compliance & enforcement', s: 'Slide 18', b: 'ICAO ensures compliance through <b>audits, inspections and incident reporting</b>. It can <b>investigate and take corrective action</b> against non-compliant states. Enforcement ranges from <b>warnings</b> to <b>suspending voting rights or even expelling</b> a state.' },
    { i: '🌱', t: 'Challenges & developments', s: 'Slide 24', b: '<b>Technological advancements</b>, <b>environmental concerns</b> (reducing emissions) and <b>regulatory harmonization</b> (aligning policies and standards across nations).' }
  ],
  stages: [
    { type: 'sort', title: 'Assembly, Council or Secretariat?', prompt: 'Which ICAO body does this describe?', buckets: ['ASSEMBLY', 'COUNCIL', 'SECRETARIAT'], items: [
      ['The sovereign body with representatives from all contracting states', 0, 'The Assembly is the sovereign body.'],
      ['Meets every three years and votes the triennial budget', 0, 'Assembly: every 3 years + triennial budget.'],
      ['36 States elected for a three-year term', 1, 'The Council has 36 States elected by the Assembly.'],
      ['Adopts SARPs and incorporates them as Annexes', 1, 'SARPs are adopted in the Council.'],
      ['Gives continuing direction to the work of ICAO', 1, 'That is the Council – the governing body.'],
      ['Headed by a Secretary General', 2, 'The Secretariat is headed by the Secretary General.'],
      ['Contains the Air Navigation Bureau and the Legal Bureau', 2, 'Five bureaus sit under the Secretariat.']
    ] },
    { type: 'quiz', title: 'How ICAO works', qs: [
      Q('How often does the ICAO Assembly meet?', 'Every three years', ['Every year', 'Every five years', 'Every ten years'], 'Assembly: every three years.'),
      Q('How many States sit on the ICAO Council?', '36', ['193', '96', '5'], 'The Council is made up of 36 States.'),
      Q('Where are SARPs adopted and incorporated as Annexes?', 'The Council', ['The Assembly', 'The Secretariat', 'The Legal Bureau only'], 'The Council adopts SARPs and incorporates them as Annexes to the Convention.'),
      Q('The most serious ICAO enforcement measure is…', 'Suspending voting rights or expelling the state', ['Sending a warning letter', 'Paying a fine in dollars', 'Closing the state\'s airports by force'], 'Enforcement ranges from warnings up to suspending voting rights or expelling a state.'),
      Q('How many main divisions does the Secretariat have?', 'Five', ['Three', 'Nine', '36'], 'Five: Air Navigation, Air Transport, Technical Co-operation, Legal, Administration & Services.')
    ] }
  ]
},
/* ───────────────────────── 5 ───────────────────────── */
{
  id: 'states', name: 'Contracting States Globe', topic: 'Current ICAO contracting states',
  color: 0x16a085, npc: 'Pilot Amelia', npcLook: { shirt: 0x16a085, hat: 0xf1c40f },
  intro: "193 states, one sky! Learn who they are and which authority regulates each country – then take to the air and fly through the right gates.",
  cards: [
    { i: '🌍', t: '193 contracting states', s: 'Slides 8-9', b: 'ICAO has over <b>190 contracting states</b> (193) that have signed the Chicago Convention. They span the globe and represent the <b>vast majority of aviation powers and emerging markets</b>.' },
    { i: '🤝', t: 'Working together', s: 'Slide 9', b: 'Member states <b>establish global standards</b> and recommended practices to ensure <b>safe, efficient and sustainable</b> civil aviation worldwide.' },
    { i: '🇺🇸🇪🇺', t: 'Foreign airworthiness authorities (1)', s: 'Slide 32', b: '<ul><li><b>USA</b> – Federal Aviation Administration (<b>FAA</b>)</li><li><b>EU</b> – European Aviation Safety Agency (<b>EASA</b>)</li><li><b>Australia</b> – Civil Aviation Safety Authority (<b>CASA</b>)</li><li><b>UK</b> – Civil Aviation Authority (<b>CAA</b>)</li></ul>' },
    { i: '🇨🇳🇲🇾', t: 'Foreign airworthiness authorities (2)', s: 'Slide 32', b: '<ul><li><b>China</b> – General Administration of Civil Aviation of China (<b>CAAC</b>)</li><li><b>Malaysia</b> – Department of Civil Aviation (<b>DCA</b>)</li><li><b>Thailand</b> – Department of Civil Aviation (<b>DCA</b>)</li><li><b>Singapore</b> – Civil Aviation Authority of Singapore (<b>CAAS</b>)</li></ul>' },
    { i: '🔎', t: 'Audited by ICAO', s: 'Slide 18', b: 'ICAO\'s safety oversight audits check compliance with the <b>Chicago Convention, State regulations, ICAO Standards, Recommended Practices, procedures and guidance material</b> – covering e.g. Annex 1 (PEL), Annex 6 (OPS) and Annex 8 (AIR).' }
  ],
  stages: [
    { type: 'flight', title: 'Flight challenge: fly through the correct gate', qs: [
      Q('Which authority regulates the USA?', 'FAA', ['EASA', 'CAAC', 'CASA'], 'USA → Federal Aviation Administration (FAA).'),
      Q('EASA is the aviation authority of the…', 'EU', ['USA', 'Australia', 'China'], 'EASA = European Aviation Safety Agency (EU).'),
      Q('Which authority regulates Australia?', 'CASA', ['CAA', 'FAA', 'DCA'], 'Australia → Civil Aviation Safety Authority (CASA).'),
      Q('CAAC is the authority of…', 'China', ['Thailand', 'UK', 'Malaysia'], 'CAAC = General Administration of Civil Aviation of China.'),
      Q('Which authority regulates Singapore?', 'CAAS', ['DCA', 'FAA', 'CASA'], 'Singapore → Civil Aviation Authority of Singapore (CAAS).'),
      Q('How many ICAO contracting states are there?', '193', ['96', '36', '52'], '193 contracting states.')
    ] },
    { type: 'quiz', title: 'Authorities check', qs: [
      Q('Which TWO countries both use "Department of Civil Aviation (DCA)"?', 'Malaysia and Thailand', ['USA and UK', 'China and Australia', 'Singapore and Malaysia'], 'Malaysia and Thailand each have a DCA.'),
      Q('The UK\'s authority is the…', 'Civil Aviation Authority (CAA)', ['Federal Aviation Administration', 'European Aviation Safety Agency', 'Civil Aviation Safety Authority'], 'UK → CAA.')
    ] }
  ]
},
/* ───────────────────────── 6 ───────────────────────── */
{
  id: 'act', name: 'Air Navigation Act – Parliament', topic: 'Air Navigation Act',
  color: 0xc0392b, npc: 'MP Tan', npcLook: { shirt: 0xc0392b, hat: 0x2c3e50 },
  intro: "Here is where Singapore's aviation law starts. Follow a Bill into an Act, then learn how far the Air Navigation Act reaches.",
  cards: [
    { i: '📝', t: 'Law making in Singapore', s: 'Slide 19', b: '<ol><li>A <b>Bill</b> is introduced in Parliament</li><li>MPs <b>debate</b> the passing of the Bill</li><li>MPs <b>vote</b></li><li>The Bill becomes an <b>Act</b> when passed by MPs and <b>signed by the President</b></li></ol>Singapore Acts: <i>statutes.agc.gov.sg</i>' },
    { i: '✈️', t: 'The Air Navigation Act', s: 'Slide 21', b: 'An act to provide for the <b>control and regulation of aviation</b>. The <b>Ministry of Transport</b> is responsible for regulating all transportation in Singapore, including air transport.' },
    { i: '🛡️', t: 'Why it matters', s: 'Slide 20', b: 'It is the <b>legal framework</b> for the safe and efficient movement of aircraft, protecting <b>passengers, crew and the general public</b>, and lets <b>national aviation authorities</b> oversee all aspects of air travel.' },
    { i: '🌏', t: 'Extraterritorial effect', s: 'Slide 22', b: 'Unless the context requires otherwise, it applies to:<ul><li><b>Singapore aircraft wherever</b> they might be</li><li><b>Other aircraft</b> when they are <b>within Singapore</b></li><li><b>Crew or any persons</b> of Singapore aircraft wherever they are</li><li><b>Any person</b> doing anything in relation to Singapore wherever they are</li></ul>' },
    { i: '📘', t: 'Air Navigation Order (ANO) & CAAS', s: 'Slide 23', b: 'The <b>ANO</b> contains all regulatory requirements for Singapore civil aviation, per the Air Navigation Act (Chapter 6, Section 3). <b>CAAS</b> governs Singapore civil aviation. The <b>Chief Executive</b> of CAAS is also called the <b>Director General of Civil Aviation (DGCA)</b>.' }
  ],
  stages: [
    { type: 'order', title: 'From Bill to Act', prompt: 'Tap the steps in the order a Bill becomes an Act.',
      items: ['A Bill is introduced in Parliament', 'MPs debate the Bill', 'MPs vote', 'The President signs the passed Bill', 'The Bill becomes an Act'] },
    { type: 'sort', title: 'Does the Act reach it?', prompt: 'Do the provisions apply?', buckets: ['APPLIES', 'DOES NOT APPLY'], items: [
      ['A Singapore aircraft flying over Africa', 0, 'Singapore aircraft – wherever they might be.'],
      ['A foreign aircraft flying inside Singapore', 0, 'Other aircraft when within Singapore.'],
      ['The crew of a Singapore aircraft while abroad', 0, 'Crew/persons of Singapore aircraft – wherever.'],
      ['A foreign aircraft over France with no link to Singapore', 1, 'No Singapore aircraft, not within Singapore, no link → does not apply.']
    ] },
    { type: 'quiz', title: 'Act check', qs: [
      Q('Which ministry is responsible for regulating air transport in Singapore?', 'Ministry of Transport', ['Ministry of Defence', 'Ministry of Education', 'Ministry of Health'], 'The Ministry of Transport.'),
      Q('A Bill becomes an Act when…', 'passed by MPs and signed by the President', ['signed by ICAO', 'announced by CAAS', 'published on a website'], 'Passed by MPs and signed by the President.'),
      Q('The DGCA is another title for…', 'The Chief Executive of CAAS', ['The Minister of Transport', 'The ICAO Secretary General', 'The ICAO Council President'], 'CE of CAAS = DGCA.'),
      Q('The ANO is made in accordance with…', 'Air Navigation Act (Chapter 6, Section 3)', ['Chicago Convention Article 96', 'CAAS Act Part IX', 'SAR-145'], 'ANO is in accordance with the Air Navigation Act (Chapter 6, Section 3).')
    ] }
  ]
},
/* ───────────────────────── 7 ───────────────────────── */
{
  id: 'sar', name: 'SAR & Regulations Archive', topic: 'Overview of SAR & Regulations',
  color: 0xf1c40f, npc: 'Eng. Lim', npcLook: { shirt: 0xf39c12, hat: 0xf1c40f },
  intro: "Welcome to the archive of Singapore's airworthiness documents. Learn the hierarchy, then sprint around the warehouse delivering the right document!",
  cards: [
    { i: '🧱', t: 'Singapore aviation legislation', s: 'Slides 25, 34', b: '<b>Chicago Convention (ICAO)</b> → Singapore Acts → <b>Air Navigation Act (Ch. 6)</b> → <b>Minister of Transport</b> → <b>Air Navigation Order (ANO)</b> → delegate: <b>Chief Executive CAAS</b> → <b>SAR, Airworthiness Notices (AN), Advisory Circulars (AC)</b>. The <b>Air Navigation Regulations 2018</b> are conferred by the Act.' },
    { i: '📘', t: 'ANO & SAR', s: 'Slide 26', b: '<b>ANO</b> – regulatory requirements for Singapore civil aviation.<br><b>SAR</b> – minimum requirements for <b>airworthiness of aircraft, aircraft engineering &amp; maintenance</b> and approval of persons and organisations.' },
    { i: '🔩', t: 'SAR-21 & SAR-39', s: 'Slides 26-27', b: '<b>SAR-21</b> – certification of <b>products and articles</b> and approval of <b>design &amp; production organisations</b>.<br><b>SAR-39</b> – issue of <b>Airworthiness Directives</b> for Singapore aircraft and components fitted to them.' },
    { i: '🪪', t: 'SAR-66, 145 & 147', s: 'Slides 27-28', b: '<b>SAR-66</b> – <b>licensing of aircraft maintenance personnel</b>.<br><b>SAR-145</b> – approval of <b>maintenance organisations</b>.<br><b>SAR-147</b> – approval of <b>maintenance training organisations</b>.' },
    { i: '📣', t: 'Regulations & Notices', s: 'Slide 28', b: '<b>Air Navigation Regulations 2018</b> – regulations made by CAAS using powers conferred by the Air Navigation Act.<br><b>Airworthiness Notices (AN)</b> – circulate information of an administrative or technical nature to all concerned with airworthiness of civil aircraft.' },
    { i: '📚', t: 'Circulars & amendments', s: 'Slide 29', b: '<b>Advisory Circulars (AC)</b> – expanded guidance on methods of compliance.<br><b>Information Circulars</b> – administrative, non-regulatory information.<br><b>Notice of amendments</b> – notice of changes to airworthiness documents.' }
  ],
  stages: [
    { type: 'order', title: 'Build the legislation pyramid', prompt: 'Tap from the TOP of the hierarchy (international) down to the airworthiness documents.',
      items: ['Chicago Convention (ICAO)', 'Air Navigation Act (Chapter 6)', 'Minister of Transport', 'Air Navigation Order (ANO)', 'Chief Executive, CAAS', 'SAR · Airworthiness Notices · Advisory Circulars'] },
    { type: 'crates', title: 'Warehouse dash: deliver the right document',
      labels: ['SAR-21', 'SAR-39', 'SAR-66', 'SAR-145', 'SAR-147', 'AN', 'AC'],
      rounds: [
        ['Certification of products & articles; approval of design & production organisations', 'SAR-21'],
        ['Airworthiness Directives for Singapore aircraft and fitted components', 'SAR-39'],
        ['Licensing of aircraft maintenance personnel', 'SAR-66'],
        ['Approval of maintenance organisations', 'SAR-145'],
        ['Approval of maintenance TRAINING organisations', 'SAR-147'],
        ['Circulates administrative/technical information on airworthiness (Airworthiness Notice)', 'AN'],
        ['Expanded guidance on methods of compliance (Advisory Circular)', 'AC']
      ] }
  ]
},
/* ───────────────────────── 8 ───────────────────────── */
{
  id: 'ano', name: 'ANO Checkpoint', topic: 'Air Navigation Order – registration, penalties & scope',
  color: 0x27ae60, npc: 'Officer Rahman', npcLook: { shirt: 0x1e8449, hat: 0x1e8449 },
  intro: "Every aircraft must pass the ANO checkpoint. Learn how the Order is organised and what happens to those who break it.",
  cards: [
    { i: '📑', t: 'ANO – the Parts', s: 'Slide 35', b: '<b>I</b> Preliminary · <b>II</b> Registration &amp; Marking of Aircraft · <b>III</b> Airworthiness &amp; Equipment · <b>IV</b> Aircraft Crew &amp; Licensing · <b>VB</b> Carriage of munitions of war &amp; dangerous goods · <b>VI</b> Aircraft Noise · <b>VIII</b> Documents &amp; Records · <b>IX</b> Control of Air Traffic · <b>X</b> Aerodromes, Aeronautical Lights &amp; Dangerous Lights · <b>XI</b> General' },
    { i: '🗒️', t: 'ANO – the Schedules (1)', s: 'Slide 36', b: '<b>1st</b> Classification of aircraft; nationality &amp; registration marks · <b>2nd</b> A, B, C &amp; D Conditions · <b>3rd</b> Categories of aircraft · <b>7th</b> Aircraft, engine &amp; propeller log books · <b>8th</b> Flight crew licences &amp; ratings · <b>11th</b> Rules of the Air &amp; ATC · <b>12th</b> Fees · <b>13th</b> Penalties · <b>14th</b> Medical examination &amp; fitness' },
    { i: '🗒️', t: 'ANO – the Schedules (2)', s: 'Slide 37', b: '<b>17th</b> Air Traffic Controller ratings · <b>18th</b> Aerodrome / Heliport Manual · <b>19th</b> Definitions (with Operator\'s &amp; Shipper\'s responsibilities, training, documents &amp; records).' },
    { i: '🛂', t: 'Aircraft to be registered', s: 'Slide 38', b: '<b>ANO Para 3(1)</b>: An aircraft shall <b>not fly in Singapore</b> unless it is registered in <b>Singapore</b>, <b>a Contracting State</b>, or a State that has an <b>agreement with Singapore</b>.' },
    { i: '⚖️', t: 'Penalties', s: 'Slide 39', b: '<b>ANO Para 80</b>: contravening the ANO → <b>fine or imprisonment</b>.<ul><li>Flying an unregistered / non-qualifying aircraft in Singapore: <b>$20,000</b> fine for a 1st timer; <b>$40,000</b> or max imprisonment of <b>15 months</b> thereafter</li><li>Hiding in an aircraft without consent, intending to leave Singapore: <b>$100,000</b> fine or max <b>5 years</b> imprisonment</li></ul>' },
    { i: '🪖', t: 'Military exemption', s: 'Slide 40', b: 'Unless otherwise required, the ANO does <b>NOT apply</b> to <b>members and property of Visiting Forces</b> (naval, military, air force) or <b>any military aircraft</b>.' }
  ],
  stages: [
    { type: 'quiz', title: 'Find the Part / Schedule', qs: [
      Q('Which Part of the ANO covers Aircraft Noise?', 'Part VI', ['Part II', 'Part IX', 'Part XI'], 'Part VI – Aircraft Noise.'),
      Q('Which Part covers Aircraft Crew and Licensing?', 'Part IV', ['Part III', 'Part VIII', 'Part X'], 'Part IV – Aircraft Crew and Licensing.'),
      Q('Registration and Marking of Aircraft is in…', 'Part II', ['Part I', 'Part VI', 'Part XI'], 'Part II.'),
      Q('Which Schedule lists the penalties?', '13th Schedule', ['12th Schedule', '14th Schedule', '8th Schedule'], '13th = Penalties (12th = Fees, 14th = Medical).'),
      Q('Where would you find Rules of the Air and Air Traffic Control?', '11th Schedule', ['3rd Schedule', '17th Schedule', '19th Schedule'], '11th Schedule.')
    ] },
    { type: 'sort', title: 'Checkpoint: may it fly in Singapore?', prompt: 'ANO Para 3(1): may this aircraft fly in Singapore?', buckets: ['ALLOWED', 'NOT ALLOWED'], items: [
      ['Aircraft registered in Singapore', 0, 'Registered in Singapore – allowed.'],
      ['Aircraft registered in a Contracting State', 0, 'Contracting State registration – allowed.'],
      ['Aircraft registered in a State with an agreement with Singapore', 0, 'Agreement with Singapore – allowed.'],
      ['Unregistered aircraft', 1, 'Must be registered in one of the three categories.'],
      ['Aircraft from a State with no agreement and not a Contracting State', 1, 'Not allowed – and penalties apply (Para 80).']
    ] },
    { type: 'quiz', title: 'Penalties & scope', qs: [
      Q('Fine for a 1st-time offender flying a non-qualifying aircraft in Singapore?', '$20,000', ['$40,000', '$100,000', '$5,000'], '$20,000 first time; $40,000 or max 15 months after.'),
      Q('Penalty for hiding in an aircraft intending to leave Singapore?', '$100,000 fine or max 5 years imprisonment', ['$20,000 fine', '15 months imprisonment only', 'A written warning'], '$100,000 or maximum 5 years.'),
      Q('The ANO does NOT apply to…', 'Any military aircraft', ['Any airline', 'Singapore-registered helicopters', 'Aerodromes'], 'Military aircraft and members/property of Visiting Forces are excluded.'),
      Q('Which ANO paragraph requires aircraft to be registered?', 'Para 3(1)', ['Para 80', 'Para 1', 'Para 101'], 'Para 3(1) – Aircraft to be registered. (Para 80 = penalties.)')
    ] }
  ]
},
/* ───────────────────────── 9 ───────────────────────── */
{
  id: 'uas', name: 'UAS Drone Zone', topic: 'Unmanned Aircraft Systems (UAS) in Singapore',
  color: 0xe84393, npc: 'Drone Marshal Ng', npcLook: { shirt: 0xe84393, hat: 0x2d3436 },
  intro: "Drones are aircraft too! Learn the Unmanned Aircraft Operations Regulations and decide what each drone pilot needs.",
  cards: [
    { i: '🚁', t: 'The regulation', s: 'Slide 41', b: '<b>Air Navigation Regulations 101 – Unmanned Aircraft Operations Regulation 2019</b>. An <b>Operator and/or activity permit</b> is required for certain operations. Rules differ for <b>recreational, educational</b> and <b>business / non-recreational</b> use.' },
    { i: '🏷️', t: 'Registration', s: 'Slide 41', b: 'For all three uses: registration is required if the UA weight exceeds <b>250 g</b>.' },
    { i: '🎓', t: 'Pilot requirements – recreational & educational', s: 'Slide 41', b: '<ul><li><b>Basic Training Certificate</b> or UA Pilot Licence if UA weight exceeds <b>1.5 kg but ≤ 7 kg</b> <i>and</i> flying in publicly accessible places or events with <b>&gt;50 individuals</b></li><li><b>UA Pilot Licence</b> required if UA weight exceeds <b>7 kg</b></li></ul>' },
    { i: '💼', t: 'Business / non-recreational', s: 'Slide 41', b: '<b>UA Pilot Licence</b> required <b>regardless of UA weight, location or height</b>. Also <b>Operator Permit and Class 1 Activity Permit</b> regardless of weight, location or height, plus additional <b>Singapore Police Force</b> permits for flying within protected areas.' },
    { i: '🪪', t: 'Permits – recreational & educational', s: 'Slide 41', b: '<ul><li><b>Operator Permit + Class 1 Activity Permit</b> for events with &gt;50 individuals</li><li><b>Class 2 Activity Permit</b> if flying at &gt;<b>200 feet</b> altitude, within restricted/danger areas, or within <b>5 km of any airport/military base</b> (recreational: UA ≤ 25 kg; educational: UA ≤ 7 kg)</li><li>Additional permits from the <b>Singapore Police Force</b> for flying within protected areas</li></ul>' }
  ],
  stages: [
    { type: 'sort', title: 'Registration needed?', prompt: 'A recreational drone has this weight. Must it be registered?', buckets: ['REGISTER IT', 'NO REGISTRATION'], items: [
      ['Mini drone weighing 200 g', 1, 'Registration is only required if the UA exceeds 250 g.'],
      ['Camera drone weighing 400 g', 0, '400 g > 250 g → registration required.'],
      ['Drone weighing exactly 250 g', 1, '"Exceeds 250 g" – exactly 250 g does not exceed it.'],
      ['Photography drone weighing 3 kg', 0, 'Over 250 g → registration required.']
    ] },
    { type: 'quiz', title: 'Pilot & permit scenarios', qs: [
      Q('A hobbyist flies a 2 kg drone in a public park at an event of 80 people. What pilot qualification is needed?', 'Basic Training Certificate or UA Pilot Licence', ['None', 'Only an Operator Permit', 'ATC controller rating'], '>1.5 kg ≤ 7 kg in publicly accessible places/events with >50 people → BTC or UA Pilot Licence.'),
      Q('A recreational pilot flies a 9 kg drone. What is required?', 'UA Pilot Licence', ['Basic Training Certificate only', 'Nothing', 'A passport'], 'Over 7 kg → UA Pilot Licence required.'),
      Q('A company uses a 300 g drone for a paid aerial photo shoot. Pilot requirement?', 'UA Pilot Licence (regardless of weight, location or height)', ['No licence – it is lightweight', 'Basic Training Certificate', 'Only registration'], 'Business use needs a UA Pilot Licence regardless of weight.'),
      Q('A business flies any drone. Which permits are needed?', 'Operator Permit and Class 1 Activity Permit', ['Class 2 Activity Permit only', 'None', 'ICAO permit'], 'Business use → Operator Permit and Class 1 Activity Permit, regardless of weight/location/height.'),
      Q('A recreational pilot (UA ≤ 25 kg) flies at 250 ft within 5 km of an airport. Extra permit?', 'Class 2 Activity Permit', ['No permit needed', 'Class 1 only', 'Pilot only needs registration'], '>200 ft, restricted/danger areas or within 5 km of airport/military base → Class 2 Activity Permit.'),
      Q('Flying within protected areas additionally requires permits from…', 'Singapore Police Force', ['ICAO', 'Ministry of Education', 'Chicago Convention Council'], 'Additional permits from the Singapore Police Force.')
    ] }
  ]
}
];

/* Collectible knowledge stars (facts from the slides) */
const FACTS = [
  ['1903', 'The Wright Flyer made the first powered, heavier-than-air machine flight.'],
  ['1919', 'The first airline founded was Chalks Flying Service.'],
  ['1937', 'The Hindenburg was a German passenger airship – its fatal accident shocked the world.'],
  ['1944', 'The Chicago Convention was signed on 7 December 1944.'],
  ['96', 'The Chicago Convention has 96 articles.'],
  ['193', 'ICAO has 193 contracting states.'],
  ['3 yrs', 'The ICAO Assembly meets every three years and votes a triennial budget.'],
  ['36', 'The ICAO Council has 36 States, elected for a three-year term.'],
  ['Annex', 'SARPs adopted by the Council are incorporated as Annexes to the Convention.'],
  ['DGCA', 'The Chief Executive of CAAS is also called the Director General of Civil Aviation.'],
  ['Ch. 6', 'The ANO is made under the Air Navigation Act (Chapter 6, Section 3).'],
  ['SAR-66', 'SAR-66 covers licensing of aircraft maintenance personnel.'],
  ['SAR-145', 'SAR-145 covers approval of maintenance organisations.'],
  ['250 g', 'Drones exceeding 250 g must be registered in Singapore.'],
  ['$100k', 'Hiding in an aircraft intending to leave Singapore: $100,000 fine or up to 5 years in jail.'],
  ['Para 3(1)', 'ANO Para 3(1): aircraft must be registered in Singapore, a Contracting State or a State with an agreement with Singapore.']
];
