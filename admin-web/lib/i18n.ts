export type Language = "en" | "km";

export interface Translations {
  // Navigation
  navHowItWorks: string;
  navDriver: string;
  navOperations: string;
  navOemParts: string;
  navWorkstation: string;
  navTrust: string;
  navSignIn: string;
  navPartnerPortal: string;
  navAiScan: string;

  // Hero Section
  heroEyebrow: string;
  heroTitle1: string;
  heroTitle2: string;
  heroSubtitle: string;
  heroCtaDriver: string;
  heroCtaPartner: string;
  heroCtaAiScan: string;

  // Hero Technical Annotations
  heroRefLabel: string;
  heroRefVal: string;
  heroRefSub: string;
  heroSlaLabel: string;
  heroSlaVal: string;
  heroSlaSub: string;
  heroReachLabel: string;
  heroReachVal: string;
  heroReachSub: string;
  heroPayLabel: string;
  heroPayVal: string;
  heroPaySub: string;

  // Philosophy / 3 Pillars
  philosophyEyebrow: string;
  philosophyTitle: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;

  // How It Works
  howEyebrow: string;
  howTitle: string;
  howSubtitle: string;
  step1Stage: string;
  step1Title: string;
  step1Desc: string;
  step2Stage: string;
  step2Title: string;
  step2Desc: string;
  step3Stage: string;
  step3Title: string;
  step3Desc: string;

  // Driver Platform
  driverEyebrow: string;
  driverTitle: string;
  driverSubtitle: string;
  driverRadarTitle: string;
  driverRadarDesc: string;
  driverSosTitle: string;
  driverSosDesc: string;
  driverObdTitle: string;
  driverObdDesc: string;
  driverChatTitle: string;
  driverChatDesc: string;

  // Operations Section
  opsEyebrow: string;
  opsTitle: string;
  opsSubtitle: string;
  ops1Title: string;
  ops1Badge: string;
  ops1Desc: string;
  ops2Title: string;
  ops2Badge: string;
  ops2Desc: string;
  ops3Title: string;
  ops3Badge: string;
  ops3Desc: string;

  // OEM Parts
  partsEyebrow: string;
  partsTitle: string;
  partsSubtitle: string;
  partsWarrantyNote: string;
  partsSpecTitle: string;

  // Workstation Console
  wsEyebrow: string;
  wsTitle: string;
  wsSubtitle: string;
  wsCtaLaunch: string;
  wsCtaRegister: string;
  wsFeature1Title: string;
  wsFeature1Desc: string;
  wsFeature2Title: string;
  wsFeature2Desc: string;
  wsFeature3Title: string;
  wsFeature3Desc: string;

  // Trust & Proof
  trustEyebrow: string;
  trustTitle: string;
  trustCard1Title: string;
  trustCard1Desc: string;
  trustCard2Title: string;
  trustCard2Desc: string;
  trustCard3Title: string;
  trustCard3Desc: string;
  trustCard4Title: string;
  trustCard4Desc: string;

  // Final Action
  joinEyebrow: string;
  joinTitle: string;
  joinSubtitle: string;
  joinBtnRegister: string;
  joinBtnLogin: string;

  // Footer
  footerTagline: string;
  footerRights: string;

  // Auth Modal
  authSignInTab: string;
  authRegisterTab: string;
  authSignInTitle: string;
  authSignInSub: string;
  authRegisterTitle: string;
  authRegisterSub: string;
  authEmailLabel: string;
  authPasswordLabel: string;
  authFullNameLabel: string;
  authBusinessNameLabel: string;
  authPhoneLabel: string;
  authAddressLabel: string;
  authConfirmPassLabel: string;
  authDemoFill: string;
  authSubmitSignIn: string;
  authSubmitRegister: string;
  authSigningIn: string;
  authRegistering: string;

  // AI Scanner Modal
  aiModalTitle: string;
  aiModalSub: string;
  aiTabUpload: string;
  aiTabPresets: string;
  aiDropzonePrompt: string;
  aiDropzoneSub: string;
  aiBrowseFile: string;
  aiPresetPrompt: string;
  aiScanningText: string;
  aiReportTitle: string;
  aiSeverityLabel: string;
  aiConfidenceLabel: string;
  aiDtcCodeLabel: string;
  aiCostEstimateLabel: string;
  aiSafetyAdvisoryLabel: string;
  aiNearestBayLabel: string;
  aiBtnDispatch: string;
  aiBtnBookBay: string;
  aiBtnScanAnother: string;
  aiRunDiagnosticBtn: string;
  aiClose: string;
  aiEmergencyNotice: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    navHowItWorks: "How It Works",
    navDriver: "Driver",
    navOperations: "Operations",
    navOemParts: "OEM Parts",
    navWorkstation: "Service Centers",
    navTrust: "Trust",
    navSignIn: "Sign In",
    navPartnerPortal: "Partner Portal",
    navAiScan: "AI Scan",

    heroEyebrow: "AUTOCARE • ON-DEMAND ROADSIDE INFRASTRUCTURE • PHNOM PENH",
    heroTitle1: "Roadside rescue.",
    heroTitle2: "Instantly dispatched.",
    heroSubtitle: "When vehicles break down, TechTune Healer connects drivers directly to verified repair facilities, mobile emergency units, and genuine OEM parts.",
    heroCtaDriver: "Explore Driver App",
    heroCtaPartner: "Onboard Service Center",
    heroCtaAiScan: "Try AI Diagnostic Scan",

    heroRefLabel: "Facility Reference",
    heroRefVal: "Tuol Kork Bay 01 • Active",
    heroRefSub: "CAN-Bus • OBD-II Telemetry",
    heroSlaLabel: "Response SLA",
    heroSlaVal: "< 15 mins",
    heroSlaSub: "Average dispatch arrival",
    heroReachLabel: "Municipal Reach",
    heroReachVal: "20 km Radius",
    heroReachSub: "Phnom Penh & Kandal border",
    heroPayLabel: "Settlement Protocol",
    heroPayVal: "Bakong KHQR",
    heroPaySub: "Instant ABA Bank clearance",

    philosophyEyebrow: "THE PHILOSOPHY",
    philosophyTitle: "Breakdowns happen without warning. Getting help shouldn't take hours.",
    pillar1Title: "ZERO\nPHONE CALLS",
    pillar1Desc: "GPS dispatch directly connects drivers to the nearest verified technician without haggling or repeating your location.",
    pillar2Title: "CERTIFIED\nBAYS",
    pillar2Desc: "50+ vetted repair facilities equipped with heavy hydraulic lifts, precision calibration, and certified mechanics.",
    pillar3Title: "GENUINE\nPARTS",
    pillar3Desc: "100% genuine OEM components with verified manufacturer warranties and direct workshop installation.",

    howEyebrow: "OPERATIONAL FLOW",
    howTitle: "Request. Dispatch. Resolution.",
    howSubtitle: "A transparent 3-step loop that turns emergency roadside anxiety into guaranteed automotive recovery.",
    step1Stage: "STAGE 01 • THE INCIDENT",
    step1Title: "Driver Reports Problem",
    step1Desc: "One tap on the mobile app pinpoints breakdown coordinates and vehicle diagnostic symptoms—flat battery, puncture, or engine overheat.",
    step2Stage: "STAGE 02 • TELEMETRY DISPATCH",
    step2Title: "Nearest Tech Dispatched",
    step2Desc: "The closest verified mobile rescue unit or facility manager accepts the job on their workstation, with live GPS routing under 15 minutes.",
    step3Stage: "STAGE 03 • CERTIFIED CLEARANCE",
    step3Title: "Repaired & Settled",
    step3Desc: "Fixed on-site or serviced on a hydraulic lift with genuine OEM parts. Final payment clears instantly with transparent Bakong KHQR.",

    driverEyebrow: "DRIVER MOBILE APPLICATION",
    driverTitle: "Map. Tap. Rescued.",
    driverSubtitle: "Your driver platform in the palm of your hand. Built with Expo React Native for instant roadside responsiveness.",
    driverRadarTitle: "LIVE RADAR MAP",
    driverRadarDesc: "Interactive Phnom Penh GPS radar locating mechanics within 5–20 km with verified arrival estimates.",
    driverSosTitle: "24/7 ROADSIDE SOS",
    driverSosDesc: "Emergency Dead 12V Battery jumpstart, tire puncture repair, and heavy flatbed recovery towing.",
    driverObdTitle: "OBD-II & AI DIAGNOSTICS",
    driverObdDesc: "Live sensor scores covering engine oil viscosity, battery drain, coolant temperature, and tire pressure.",
    driverChatTitle: "DIRECT MESSENGER",
    driverChatDesc: "Direct two-way chat with the responding technician to confirm breakdown landmarks and photo evidence.",

    opsEyebrow: "OPERATIONAL CAPACITY",
    opsTitle: "Built for real-world mechanical demands.",
    opsSubtitle: "From dead 12V battery jumpstarts on the roadside to multi-ton hydraulic lift rebuilds inside certified service bays.",
    ops1Title: "01 • Mobile Emergency Rescue Units",
    ops1Badge: "24/7 Active Fleet",
    ops1Desc: "On-site battery swaps, tire puncture repairs, fuel delivery, and flatbed transport to certified partner centers.",
    ops2Title: "02 • Digital CAN-Bus Diagnostics",
    ops2Badge: "OBD-II Protocol",
    ops2Desc: "Real-time ECU fault code interpretation, sensor telemetry, and hybrid high-voltage battery cell analysis.",
    ops3Title: "03 • Heavy Hydraulic Lifts",
    ops3Badge: "Up to 4.5 Tons",
    ops3Desc: "Equipped for major suspension rebuilds, ceramic brake overhauls, and complete transmission servicing.",

    partsEyebrow: "TECHNICAL PARTS SHOWROOM",
    partsTitle: "Genuine OEM parts. Installed with warranty.",
    partsSubtitle: "Every component is verified authentic, distributed on the driver app, and installed by certified mechanics.",
    partsWarrantyNote: "Genuine manufacturer warranty included with all installations.",
    partsSpecTitle: "TECHNICAL SPECIFICATIONS",

    wsEyebrow: "FOR SERVICE CENTERS • B2B STATION CONSOLE",
    wsTitle: "Fill empty bays. Zero paperwork.",
    wsSubtitle: "From roadside SOS intake to physical hydraulic lift scheduling. Certified service centers manage live telemetry, bay turnover, and instant ABA Bank KHQR settlements in one unified operating system.",
    wsCtaLaunch: "Launch Live Workstation →",
    wsCtaRegister: "Register Workshop",
    wsFeature1Title: "Real-Time Proximity Intake",
    wsFeature1Desc: "Automatic GPS matching directs stranded motorists to your facility with vehicle symptoms and pre-cleared pricing.",
    wsFeature2Title: "Physical Lift Management",
    wsFeature2Desc: "Assign active work orders to 2-post, 4-post, and scissor lifts with live mechanic status and completion alerts.",
    wsFeature3Title: "Instant Bakong KHQR Net",
    wsFeature3Desc: "Zero invoicing backlog. Automated 90% workshop settlements clear directly to your local bank account.",

    trustEyebrow: "NETWORK STANDARDS",
    trustTitle: "Built on trust. Backed by verified data.",
    trustCard1Title: "Verified Facilities",
    trustCard1Desc: "Authorized partner workshops equipped with certified heavy hydraulic lifts.",
    trustCard2Title: "Dispatch Radius",
    trustCard2Desc: "Guaranteed coverage reaching drivers across Tuol Kork, Chamkarmon, Sen Sok, and Daun Penh.",
    trustCard3Title: "OEM Parts",
    trustCard3Desc: "Every component distributed is authenticated and backed by workshop warranties.",
    trustCard4Title: "Dispatch Network",
    trustCard4Desc: "Round-the-clock emergency assistance with instant Bakong KHQR checkout.",

    joinEyebrow: "JOIN THE NETWORK",
    joinTitle: "Connect your repair facility today.",
    joinSubtitle: "No hardware fees. No monthly subscriptions. Approved facilities receive direct customer dispatches within 24 hours of verification.",
    joinBtnRegister: "Register Workshop",
    joinBtnLogin: "Partner Sign In",

    footerTagline: "Automotive Roadside Infrastructure • Phnom Penh",
    footerRights: "TechTune Healer. All rights reserved.",

    authSignInTab: "Partner Sign In",
    authRegisterTab: "Register Facility",
    authSignInTitle: "Workshop Workstation Sign In",
    authSignInSub: "Enter your partner credentials to manage active dispatches",
    authRegisterTitle: "Onboard Your Service Center",
    authRegisterSub: "Join Phnom Penh's premier on-demand automotive network",
    authEmailLabel: "Email Address",
    authPasswordLabel: "Password",
    authFullNameLabel: "Primary Contact Name",
    authBusinessNameLabel: "Workshop / Garage Name",
    authPhoneLabel: "Phone Number",
    authAddressLabel: "District / Location (Phnom Penh)",
    authConfirmPassLabel: "Confirm Password",
    authDemoFill: "Autofill Sokha Motors (Demo)",
    authSubmitSignIn: "Sign In to Workstation",
    authSubmitRegister: "Register Workshop Partner",
    authSigningIn: "Verifying credentials...",
    authRegistering: "Registering workshop...",

    aiModalTitle: "AI Vehicle Telemetry & Damage Scanner",
    aiModalSub: "Upload a vehicle photo or test preset automotive symptoms for real-time neural diagnosis with OBD-II fault code matching.",
    aiTabUpload: "Upload Vehicle Photo",
    aiTabPresets: "Quick Diagnostic Presets",
    aiDropzonePrompt: "Drop vehicle photo here or click to browse",
    aiDropzoneSub: "Accepts dashboard warning lights, brake pads, engine bay, fluid leaks, or tire photos (JPG, PNG, WebP up to 10MB)",
    aiBrowseFile: "Select Vehicle Image",
    aiPresetPrompt: "Select a real-world roadside issue to test instant AI diagnostics:",
    aiScanningText: "Analyzing optical telemetry & scanning SAE fault databases...",
    aiReportTitle: "AI Diagnostic Inspection Report",
    aiSeverityLabel: "Severity Level",
    aiConfidenceLabel: "AI Neural Confidence",
    aiDtcCodeLabel: "SAE / OBD-II DTC Code",
    aiCostEstimateLabel: "Estimated Repair Cost",
    aiSafetyAdvisoryLabel: "Safety Advisory & Immediate Action",
    aiNearestBayLabel: "Nearest Matched Service Bay (Phnom Penh)",
    aiBtnDispatch: "Dispatch Mobile Rescue Unit",
    aiBtnBookBay: "Reserve Hydraulic Bay",
    aiBtnScanAnother: "Scan Another Issue",
    aiRunDiagnosticBtn: "Run AI Neural Diagnostic",
    aiClose: "Close",
    aiEmergencyNotice: "Emergency SOS: In case of smoking engine or highway collision, pull over and call 119 immediately.",
  },

  km: {
    navHowItWorks: "ដំណើរការ",
    navDriver: "អ្នកបើកបរ",
    navOperations: "ប្រតិបត្តិការ",
    navOemParts: "គ្រឿងបន្លាស់ OEM",
    navWorkstation: "យានដ្ឋានដៃគូ",
    navTrust: "ទំនុកចិត្ត",
    navSignIn: "ចូលគណនី",
    navPartnerPortal: "ផតថលដៃគូ",
    navAiScan: "ស្កេនវិភាគ AI",

    heroEyebrow: "សេវាកម្មជួសជុលរថយន្ត • ប្រព័ន្ធសង្គ្រោះបន្ទាន់លើដងផ្លូវ • រាជធានីភ្នំពេញ",
    heroTitle1: "សង្គ្រោះលើដងផ្លូវ។",
    heroTitle2: "បញ្ជូនជាងក្នុង ១៥ នាទី។",
    heroSubtitle: "នៅពេលរថយន្តរបស់អ្នកជួបបញ្ហា TechTune Healer នឹងភ្ជាប់ទំនាក់ទំនងអ្នកបើកបរទៅកាន់យានដ្ឋានស្តង់ដារ ក្រុមសង្គ្រោះបន្ទាន់ចល័ត និងគ្រឿងបន្លាស់ OEM ពិតប្រាកដ។",
    heroCtaDriver: "សាកល្បងកម្មវិធីអ្នកបើកបរ",
    heroCtaPartner: "ចុះឈ្មោះយានដ្ឋានជួសជុល",
    heroCtaAiScan: "ស្កេនវិភាគបញ្ហាដោយ AI",

    heroRefLabel: "យានដ្ឋានយោង",
    heroRefVal: "ទួលគោក បន្ទប់លេខ ០១ • កំពុងដំណើរការ",
    heroRefSub: "ប្រព័ន្ធទិន្នន័យ CAN-Bus & OBD-II",
    heroSlaLabel: "ល្បឿនឆ្លើយតប SLA",
    heroSlaVal: "< ១៥ នាទី",
    heroSlaSub: "រយៈពេលមកដល់ជាមធ្យម",
    heroReachLabel: "តំបន់គ្របដណ្តប់",
    heroReachVal: "រង្វង់ ២០ គ.ម",
    heroReachSub: "ទូទាំងភ្នំពេញ & ព្រំប្រទល់កណ្តាល",
    heroPayLabel: "ប្រព័ន្ធទូទាត់",
    heroPayVal: "បាគង KHQR",
    heroPaySub: "ទូទាត់រហ័សតាមធនាគារ ABA",

    philosophyEyebrow: "គោលការណ៍ចម្បង",
    philosophyTitle: "ការខូចរថយន្តកើតឡើងដោយមិនដឹងមុន។ ការស្វែងរកជំនួយមិនគួរត្រូវចំណាយពេលរាប់ម៉ោងឡើយ។",
    pillar1Title: "មិនបាច់ទូរស័ព្ទ\nតថ្លៃ",
    pillar1Desc: "ប្រព័ន្ធ GPS ភ្ជាប់អ្នកបើកបរទៅកាន់ជាងជិតបំផុតដោយផ្ទាល់ មិនបាច់តថ្លៃ ឬពន្យល់ទីតាំងស្មុគស្មាញ។",
    pillar2Title: "យានដ្ឋានមាន\nស្តង់ដារ",
    pillar2Desc: "យានដ្ឋានដៃគូជាង ៥០+ ដែលមានជើងទម្រធារាសាស្ត្រទំនើប ឧបករណ៍វាស់ស្ទង់ច្បាស់លាស់ និងជាងជំនាញ។",
    pillar3Title: "គ្រឿងបន្លាស់\nសុទ្ធ ១០០%",
    pillar3Desc: "គ្រឿងបន្លាស់សុទ្ធពីក្រុមហ៊ុន ១០០% ធានាគុណភាពពីរោងចក្រ និងតម្លើងដោយជាងជំនាញ។",

    howEyebrow: "លំហូរការងារជាក់ស្តែង",
    howTitle: "ស្នើសុំ • បញ្ជូនជាង • ជួសជុលរួចរាល់",
    howSubtitle: "ដំណើរការ ៣ ជំហានប្រកបដោយតម្លាភាព ដែលដោះស្រាយការបារម្ភរបស់អ្នកពេលរថយន្តខូចលើដងផ្លូវ។",
    step1Stage: "ដំណាក់កាលទី ០១ • ពេលជួបបញ្ហា",
    step1Title: "អ្នកបើកបររាយការណ៍បញ្ហា",
    step1Desc: "ចុចតែម្តងលើទូរស័ព្ទដើម្បីកំណត់ទីតាំង GPS និងរោគសញ្ញារថយន្ត—អស់អាគុយ បែកកង់ ឬម៉ាស៊ីនឡើងកម្តៅខ្លាំង។",
    step2Stage: "ដំណាក់កាលទី ០២ • ការបញ្ជូនជាងជំនាញ",
    step2Title: "បញ្ជូនជាងដែលនៅជិតបំផុត",
    step2Desc: "ក្រុមសង្គ្រោះចល័ត ឬយានដ្ឋានដែលជិតបំផុតទទួលការងារលើកុំព្យូទ័រ ជាមួយការធ្វើដំណើរតាម GPS ក្រោម ១៥ នាទី។",
    step3Stage: "ដំណាក់កាលទី ០៣ • បញ្ចប់ការជួសជុល",
    step3Title: "ជួសជុល និងទូទាត់ប្រាក់",
    step3Desc: "ជួសជុលផ្ទាល់នៅកន្លែង ឬលើកឡើងជើងទម្រធារាសាស្ត្រជាមួយគ្រឿងបន្លាស់ OEM។ ទូទាត់ប្រាក់រហ័សតាមបាគង KHQR។",

    driverEyebrow: "កម្មវិធីទូរស័ព្ទសម្រាប់អ្នកបើកបរ",
    driverTitle: "មើលផែនទី • ចុចស្នើសុំ • ទទួលបានការសង្គ្រោះ",
    driverSubtitle: "ប្រព័ន្ធជំនួយក្នុងដៃរបស់អ្នក បង្កើតឡើងដោយ Expo React Native ឆ្លើយតបរហ័សទាន់ចិត្តលើដងផ្លូវ។",
    driverRadarTitle: "ផែនទីរ៉ាដាបន្តផ្ទាល់",
    driverRadarDesc: "រ៉ាដា GPS ភ្នំពេញស្វែងរកជាងជំនាញក្នុងរង្វង់ ៥-២០ គ.ម ជាមួយការប៉ាន់ស្មានម៉ោងមកដល់ជាក់ស្តែង។",
    driverSosTitle: "សង្គ្រោះបន្ទាន់ ២៤/៧",
    driverSosDesc: "សេវាបញ្ឆេះអាគុយ ១២V ប៉ះកង់បន្ទាន់ និងរថយន្តសណ្តោងធុនធ្ងន់គ្រប់ពេលវេលា។",
    driverObdTitle: "ការវិភាគ OBD-II & AI",
    driverObdDesc: "ពិនិត្យកម្រិតប្រេងម៉ាស៊ីន ថាមពលអាគុយ កម្តៅទឹកស្អំ និងសម្ពាធកង់រថយន្តដោយស្វ័យប្រវត្តិ។",
    driverChatTitle: "ជជែកផ្ទាល់ជាមួយជាង",
    driverChatDesc: "ផ្ញើសារនិងរូបភាពរថយន្តខូចដោយផ្ទាល់ទៅកាន់ជាង ដើម្បីកំណត់ទីតាំងជាក់លាក់។",

    opsEyebrow: "សមត្ថភាពប្រតិបត្តិការ",
    opsTitle: "រៀបចំឡើងសម្រាប់តម្រូវការជួសជុលជាក់ស្តែង។",
    opsSubtitle: "ពីការឆ្នៃបញ្ឆេះអាគុយតាមផ្លូវ រហូតដល់ការលើករថយន្តជួសជុលធំៗលើជើងទម្រធារាសាស្ត្រក្នុងយានដ្ឋាន។",
    ops1Title: "០១ • ក្រុមសង្គ្រោះបន្ទាន់ចល័ត",
    ops1Badge: "ក្រុមប្រចាំការ ២៤/៧",
    ops1Desc: "ដូរអាគុយដល់កន្លែង ប៉ះកង់ ដឹកប្រេងសាំងបន្ទាន់ និងដឹកជញ្ជូនរថយន្តទៅកាន់យានដ្ឋានដៃគូ។",
    ops2Title: "០២ • ប្រព័ន្ធវិភាគឌីជីថល CAN-Bus",
    ops2Badge: "ពិធីការ OBD-II",
    ops2Desc: "បកស្រាយកូដកំហុស ECU ទិន្នន័យឧបករណ៍ចាប់សញ្ញា និងវិភាគអាគុយរថយន្ត Hybrid។",
    ops3Title: "០៣ • ជើងទម្រធារាសាស្ត្រធុនធ្ងន់",
    ops3Badge: "ទម្ងន់រហូតដល់ ៤.៥ តោន",
    ops3Desc: "បំពាក់សម្រាប់ជួសជុលជើងក្រោម ប្តូរប្រព័ន្ធហ្វ្រាំង និងប្រអប់លេខទាំងមូល។",

    partsEyebrow: "បន្ទប់តាំងបង្ហាញគ្រឿងបន្លាស់បច្ចេកទេស",
    partsTitle: "គ្រឿងបន្លាស់សុទ្ធ OEM។ ធានាគុណភាពពេលតម្លើង។",
    partsSubtitle: "រាល់គ្រឿងបន្លាស់សុទ្ធតែបានត្រួតពិនិត្យភាពត្រឹមត្រូវ ចែកចាយលើកម្មវិធី និងតម្លើងដោយជាងជំនាញ។",
    partsWarrantyNote: "ការធានាគុណភាពពីរោងចក្រផ្ទាល់លើគ្រប់ការតម្លើង។",
    partsSpecTitle: "លក្ខណៈបច្ចេកទេសលម្អិត",

    wsEyebrow: "សម្រាប់យានដ្ឋានជួសជុល • ផ្ទាំងគ្រប់គ្រង B2B",
    wsTitle: "បង្កើនអតិថិជនពេញយានដ្ឋាន។ កាត់បន្ថយការងារក្រដាសស្នាម។",
    wsSubtitle: "ពីការទទួលការងារសង្គ្រោះតាមផ្លូវ ដល់ការកក់ជើងទម្រធារាសាស្ត្រ។ យានដ្ឋានដៃគូគ្រប់គ្រងទិន្នន័យជាក់ស្តែង ការប្រើប្រាស់បន្ទប់ជួសជុល និងទទួលប្រាក់ភ្លាមៗតាមបាគង KHQR។",
    wsCtaLaunch: "បើកផ្ទាំងគ្រប់គ្រងយានដ្ឋាន →",
    wsCtaRegister: "ចុះឈ្មោះយានដ្ឋានថ្មី",
    wsFeature1Title: "ការទទួលការងារតាមចម្ងាយជិតបំផុត",
    wsFeature1Desc: "ប្រព័ន្ធស្វ័យប្រវត្តិនឹងបញ្ជូនអ្នកបើកបរដែលជួបបញ្ហាមកកាន់យានដ្ឋានរបស់អ្នក ជាមួយរោគសញ្ញានិងតម្លៃកំណត់ស្រេច។",
    wsFeature2Title: "គ្រប់គ្រងជើងទម្រធារាសាស្ត្រជាក់ស្តែង",
    wsFeature2Desc: "បែងចែកការងារជួសជុលទៅកាន់ជើងទម្រ ២ សសរ ៤ សសរ ឬកន្ត្រៃ ជាមួយការជូនដំណឹងពីស្ថានភាពជាង។",
    wsFeature3Title: "ទូទាត់ប្រាក់ភ្លាមៗតាមបាគង KHQR",
    wsFeature3Desc: "គ្មានការពន្យារពេលវិក្កយបត្រ។ ប្រាក់ចំណូល ៩០% របស់យានដ្ឋានត្រូវបានផ្ទេរចូលគណនីធនាគារផ្ទាល់ភ្លាមៗ។",

    trustEyebrow: "ស្តង់ដារបណ្តាញ",
    trustTitle: "កសាងឡើងដោយទំនុកចិត្ត។ គាំទ្រដោយទិន្នន័យច្បាស់លាស់។",
    trustCard1Title: "យានដ្ឋានស្តង់ដារ",
    trustCard1Desc: "យានដ្ឋានដៃគូផ្លូវការបំពាក់ដោយជើងទម្រធារាសាស្ត្រធុនធ្ងន់។",
    trustCard2Title: "រង្វង់បញ្ជូនជាង",
    trustCard2Desc: "គ្របដណ្តប់ទួលគោក ចំការមន សែនសុខ និងដូនពេញ។",
    trustCard3Title: "គ្រឿងបន្លាស់ OEM",
    trustCard3Desc: "គ្រប់គ្រឿងបន្លាស់សុទ្ធតែមានការធានាត្រឹមត្រូវ។",
    trustCard4Title: "បណ្តាញសង្គ្រោះ",
    trustCard4Desc: "ជំនួយសង្គ្រោះបន្ទាន់ ២៤ ម៉ោង ជាមួយការទូទាត់រហ័សតាមបាគង KHQR។",

    joinEyebrow: "ចូលរួមបណ្តាញរបស់យើង",
    joinTitle: "ភ្ជាប់យានដ្ឋានរបស់អ្នកថ្ងៃនេះ។",
    joinSubtitle: "មិនមានថ្លៃឧបករណ៍។ មិនមានកម្រៃប្រចាំខែ។ យានដ្ឋានដែលបានអនុម័តនឹងទទួលបានការងារពីអតិថិជនក្នុងរយៈពេល ២៤ ម៉ោង។",
    joinBtnRegister: "ចុះឈ្មោះយានដ្ឋាន",
    joinBtnLogin: "ចូលប្រព័ន្ធដៃគូ",

    footerTagline: "ប្រព័ន្ធហេដ្ឋារចនាសម្ព័ន្ធសង្គ្រោះរថយន្តលើដងផ្លូវ • រាជធានីភ្នំពេញ",
    footerRights: "TechTune Healer។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",

    authSignInTab: "ចូលប្រព័ន្ធដៃគូ",
    authRegisterTab: "ចុះឈ្មោះយានដ្ឋាន",
    authSignInTitle: "ចូលផ្ទាំងការងារយានដ្ឋាន",
    authSignInSub: "បញ្ចូលព័ត៌មានគណនីដៃគូរបស់អ្នក ដើម្បីគ្រប់គ្រងការងារសង្គ្រោះ",
    authRegisterTitle: "ចុះឈ្មោះយានដ្ឋានរបស់អ្នក",
    authRegisterSub: "ចូលរួមក្នុងបណ្តាញសេវាកម្មយានយន្តឈានមុខគេនៅរាជធានីភ្នំពេញ",
    authEmailLabel: "អាសយដ្ឋានអ៊ីមែល",
    authPasswordLabel: "ពាក្យសម្ងាត់",
    authFullNameLabel: "ឈ្មោះអ្នកទំនាក់ទំនង",
    authBusinessNameLabel: "ឈ្មោះយានដ្ឋាន / ហ្គារ៉ាស",
    authPhoneLabel: "លេខទូរស័ព្ទ",
    authAddressLabel: "ខណ្ឌ / ទីតាំង (រាជធានីភ្នំពេញ)",
    authConfirmPassLabel: "បញ្ជាក់ពាក្យសម្ងាត់",
    authDemoFill: "បំពេញគំរូ សុខា ម៉ូតូ (សាកល្បង)",
    authSubmitSignIn: "ចូលទៅកាន់ផ្ទាំងការងារ",
    authSubmitRegister: "ចុះឈ្មោះយានដ្ឋានដៃគូ",
    authSigningIn: "កំពុងផ្ទៀងផ្ទាត់...",
    authRegistering: "កំពុងចុះឈ្មោះ...",

    aiModalTitle: "ប្រព័ន្ធ AI ស្កេនវិភាគរថយន្ត & បញ្ហាបច្ចេកទេស",
    aiModalSub: "បញ្ចូលរូបភាពរថយន្ត ឬជ្រើសរើសរោគសញ្ញាជាក់ស្តែង ដើម្បីឱ្យ AI វិភាគកំហុសបច្ចេកទេស និងកូដ OBD-II ភ្លាមៗ។",
    aiTabUpload: "បញ្ចូលរូបភាពរថយន្ត",
    aiTabPresets: "គំរូរោគសញ្ញារហ័ស",
    aiDropzonePrompt: "អូសទម្លាក់រូបភាពនៅទីនេះ ឬចុចដើម្បីជ្រើសរើស",
    aiDropzoneSub: "ទទួលរូបភាពភ្លើងសញ្ញា ហ្វ្រាំង ម៉ាស៊ីន ការលេចធ្លាយប្រេង ឬកង់ (JPG, PNG, WebP រហូតដល់ 10MB)",
    aiBrowseFile: "ជ្រើសរើសរូបភាពរថយន្ត",
    aiPresetPrompt: "ជ្រើសរើសករណីខូចរថយន្តជាក់ស្តែងដើម្បីសាកល្បងការវិភាគ AI ភ្លាមៗ៖",
    aiScanningText: "កំពុងវិភាគទិន្នន័យរូបភាព & ផ្ទៀងផ្ទាត់កូដកំហុស SAE...",
    aiReportTitle: "របាយការណ៍វិភាគបច្ចេកទេស AI",
    aiSeverityLabel: "កម្រិតគ្រោះថ្នាក់",
    aiConfidenceLabel: "ភាពជឿជាក់ AI",
    aiDtcCodeLabel: "កូដកំហុស OBD-II",
    aiCostEstimateLabel: "តម្លៃប៉ាន់ស្មានជួសជុល",
    aiSafetyAdvisoryLabel: "ការណែនាំសុវត្ថិភាព & ដំណោះស្រាយ",
    aiNearestBayLabel: "យានដ្ឋានជិតបំផុតដែលអាចទទួលជួសជុល (រាជធានីភ្នំពេញ)",
    aiBtnDispatch: "បញ្ជូនក្រុមសង្គ្រោះចល័ត",
    aiBtnBookBay: "កក់ជើងទម្រធារាសាស្ត្រ",
    aiBtnScanAnother: "ស្កេនរោគសញ្ញាថ្មី",
    aiRunDiagnosticBtn: "ដំណើរការវិភាគ AI ឥឡូវនេះ",
    aiClose: "បិទ",
    aiEmergencyNotice: "ការសង្គ្រោះបន្ទាន់៖ ក្នុងករណីមានផ្សែងចេញពីម៉ាស៊ីន ឬគ្រោះថ្នាក់លើផ្លូវល្បឿនលឿន សូមអែបខាង និងទូរស័ព្ទទៅលេខ ១១៩ ជាបន្ទាន់។",
  },
};
