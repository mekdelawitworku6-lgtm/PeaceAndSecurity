import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "en" | "am" | "om";

const LANGUAGE_KEY = "@citizen_app_lang";

type TranslationKey = keyof typeof en;

const en = {
  // Common & Header
  appName: "Peace & Security",
  subAppName: "Citizens App",
  addisAbabaCitizens: "Addis Ababa Peace and Security Citizens",
  tagline: "Report. Respond. Resolve.",
  taglineSub: "Serving Addis Ababa.",
  goodMorning: "Good Morning",
  goodAfternoon: "Good Afternoon",
  goodEvening: "Good Evening",
  hello: "Hello",
  guest: "Guest User",
  language: "Language",
  selectLanguage: "Select Language",
  english: "English",
  amharic: "አማርኛ (Amharic)",
  oromo: "Afaan Oromoo (Oromo)",
  close: "Close",
  cancel: "Cancel",
  save: "Save",
  back: "Back",
  loading: "Loading…",
  error: "Error",
  success: "Success",
  seeAll: "See all",
  viewOnMap: "View on Map",
  active: "Active",

  // Onboarding
  onboardingTitle: "Report Incidents, Protect the City",
  onboardingSub:
    "Help keep Addis Ababa safe by reporting incidents directly to the Police and Security Bureau.",
  getStarted: "Get Started",
  continueAsGuest: "Continue as Guest",
  liveTicker1: "Incident captured near Meskel Sq. • LIVE",
  liveTicker2: "Incident captured near Bole Road • LIVE",
  liveTicker3: "Incident captured near Mexico Sq. • LIVE",

  // Home Screen
  reportIncident: "Report Incident",
  reportIncidentSub: "10 types available",
  viewIncidentMap: "View Incident Map",
  viewIncidentMapSub: "18 active marks",
  recentReports: "Recent Reports",
  noReportsYet: "No reports submitted yet",
  noReportsSub: "Use “Report Incident” to report security issues in your area.",
  impactStats: "Impact Stats",
  reportsThisMonth: "Reports This Month",
  avgResponseTime: "Avg Response Time",
  vsLastMonth: "+12% vs last month",
  improvement: "-14m improvement",
  emergencySos: "EMERGENCY SOS",
  emergencySosSub: "Send your location for immediate help",

  // Quick Action Labels
  quickReport: "Report",
  quickMap: "Map",
  quickChat: "Chat",
  quickAlerts: "Alerts",
  quickTrack: "Track Case",
  quickProfile: "Profile",

  // Tab Titles
  tabHome: "Home",
  tabMap: "Map",
  tabReports: "Reports",
  tabNotifications: "Alerts",
  tabSettings: "Settings",

  // Report Create Screen
  reportSecurityIncident: "Report Security Incident",
  attachNotice: "Attach images, videos, audio and description",
  tapToAddFiles: "Tap to add files, photos and videos",
  upToAttachments: "Up to 4 attachments",
  incidentType: "Incident Type",
  selectIncidentType: "Select incident type",
  description: "Description",
  describeWhatHappened: "Describe what happened…",
  currentLocation: "Current Location",
  changeLocation: "Change",
  reportAnonymously: "Report anonymously",
  anonymousSub: "Your name won't be visible to others",
  submitReport: "Submit Report",
  submitting: "Submitting…",

  // Emergency Mode Drawer/Slider
  emergencyMode: "Emergency Mode",
  severityLevel: "Severity Level",
  minor: "Minor",
  moderate: "Moderate",
  severe: "Severe",
  submitEmergencyReport: "Submit Emergency Report",

  // Incident Types
  typeRobbery: "Robbery / Theft / Crime",
  typeWeapons: "Illegal Weapons",
  typeFraud: "Forgery / Fraud / Illegal Money",
  typeThreat: "Security Threat",
  typeBegging: "Street Children / Begging",
  typeDisruptive: "Disruptive / Illegal Activity",
  typeIllegalBusiness: "Illegal Business / Broker Activity",
  typeEventSecurity: "Event / Holiday Security Screen",
  typeInspection: "Institution Inspection Request",
  typeNoise: "Noise Pollution",
  typeLittering: "Illegal Dumping / Littering",
  typeOthers: "Other Incident",

  // Map Screen
  searchLocation: "Search location…",
  filterAll: "All",
  filterCrime: "Emergency / Crime",
  filterIllegal: "Illegal Activity",
  filterThreat: "Security Threat",
  activeIncidentsCount: "Active Incidents",

  // Success Screen
  reportSubmitted: "Report Submitted!",
  thankYouHelp: "Thank you for helping keep Addis Ababa safe.",
  reportId: "REPORT ID",
  submittedOn: "Submitted on",
  assignedTo: "Assigned to",
  shareReport: "Share Report",
  returnToHome: "Return to Home",

  // Auth / Login / Register
  welcomeBack: "Welcome back",
  signInSub: "Sign in with your phone number and PIN.",
  phoneNumber: "Phone number",
  pin: "PIN (4-6 digits)",
  confirmPin: "Confirm PIN",
  newHere: "New here?",
  createAccount: "Create Account",
  registerAsCitizen: "Register as a citizen of Addis Ababa Peace & Security.",
  fullName: "Full name",
  alreadyAccount: "Already have an account?",
  login: "Log in",
  verifyPhone: "Verify Phone",
  verifyCodeSub: "Enter the verification code sent to your phone.",
  resendCode: "Resend code",

  // Notifications / Chat / Settings
  notifications: "Notifications",
  chat: "Chat",
  settings: "Settings",
  account: "Account",
  changePin: "Change PIN",
  logout: "Log out",
  loginOrRegister: "Log in or Register",
  trackCase: "Track Case",
  trackCaseSub: "Enter the case ID you received when submitting your report.",
  enterCaseId: "Enter Case ID",
  track: "Track",
};

const am: typeof en = {
  // Common & Header
  appName: "ሰላምና ጸጥታ",
  subAppName: "የዜጎች መተግበሪያ",
  addisAbabaCitizens: "የአዲስ አበባ ሰላምና ጸጥታ ዜጎች",
  tagline: "ሪፖርት ያድርጉ። ምላሽ ያግኙ። ይፍቱ።",
  taglineSub: "አዲስ አበባን ያገለግላል።",
  goodMorning: "እንደምን አደሩ",
  goodAfternoon: "እንደምን ዋሉ",
  goodEvening: "እንደምን አመሹ",
  hello: "ሰላም",
  guest: "እንግዳ ተጠቃሚ",
  language: "ቋንቋ",
  selectLanguage: "ቋንቋ ይምረጡ",
  english: "English",
  amharic: "አማርኛ",
  oromo: "Afaan Oromoo",
  close: "ዝጋ",
  cancel: "ሰርዝ",
  save: "ስራ አስቀምጥ",
  back: "ተመለስ",
  loading: "በመጫን ላይ…",
  error: "ስህተት",
  success: "ተሳክቷል",
  seeAll: "ሁሉንም እይ",
  viewOnMap: "ካርታ ላይ እይ",
  active: "ንቁ",

  // Onboarding
  onboardingTitle: "ክስተቶችን ሪፖርት ያድርጉ፣ ከተማዋን ይጠብቁ",
  onboardingSub: "ክስተቶችን በቀጥታ ለፖሊስ እና ሰላም ጸጥታ ቢሮ ሪፖርት በማድረግ አዲስ አበባን ደህንነቷ የተጠበቀ ያድርጉ።",
  getStarted: "ጀምር",
  continueAsGuest: "እንደ እንግዳ ቀጥል",
  liveTicker1: "መስቀል አደባባይ አቅራቢያ የተከሰተ ክስተት • ቀጥታ",
  liveTicker2: "ቦሌ መንገድ አቅራቢያ የተከሰተ ክስተት • ቀጥታ",
  liveTicker3: "ሜክሲኮ አደባባይ አቅራቢያ የተከሰተ ክስተት • ቀጥታ",

  // Home Screen
  reportIncident: "ክስተት ሪፖርት ያድርጉ",
  reportIncidentSub: "10 የሪፖርት አይነቶች አሉ",
  viewIncidentMap: "የክስተቶች ካርታ እይ",
  viewIncidentMapSub: "18 ንቁ ምልክቶች",
  recentReports: "የቅርብ ጊዜ ሪፖርቶች",
  noReportsYet: "ምንም ሪፖርት አልተላከም",
  noReportsSub: "በአካባቢዎ የደህንነት ችግር ሲኖር “ክስተት ሪፖርት ያድርጉ” የሚለውን ይጠቀሙ።",
  impactStats: "የተከናወኑ ስታቲስቲክስ",
  reportsThisMonth: "በዚህ ወር የተላኩ ሪፖርቶች",
  avgResponseTime: "አማካይ የምላሽ ጊዜ",
  vsLastMonth: "+12% ካለፈው ወር",
  improvement: "-14 ደቂቃ መሻሻል",
  emergencySos: "የአደጋ ጊዜ ጥሪ (SOS)",
  emergencySosSub: "ለአስቸኳይ እርዳታ ቦታዎን ይላኩ",

  // Quick Action Labels
  quickReport: "ሪፖርት",
  quickMap: "ካርታ",
  quickChat: "ውይይት",
  quickAlerts: "ማስታወቂያ",
  quickTrack: "ተከታተል",
  quickProfile: "መገለጫ",

  // Tab Titles
  tabHome: "መነሻ",
  tabMap: "ካርታ",
  tabReports: "ሪፖርቶች",
  tabNotifications: "ማስታወቂያ",
  tabSettings: "ማስተካከያ",

  // Report Create Screen
  reportSecurityIncident: "የደህንነት ክስተት ሪፖርት ያድርጉ",
  attachNotice: "ምስሎችን፣ ቪዲዮዎችን፣ ድምጽን እና መግለጫን ያያይዙ",
  tapToAddFiles: "ፋይሎችን፣ ፎቶዎችን እና ቪዲዮዎችን ለማከል ይጫኑ",
  upToAttachments: "እስከ 4 ፋይሎች",
  incidentType: "የክስተት አይነት",
  selectIncidentType: "የክስተት አይነት ይምረጡ",
  description: "መግለጫ",
  describeWhatHappened: "ምን እንደተከሰተ ይግለጹ…",
  currentLocation: "የአሁኑ ቦታዎ",
  changeLocation: "ቀይር",
  reportAnonymously: "በምስጢር ሪፖርት ያድርጉ",
  anonymousSub: "ስምዎ ለሌሎች አይታይም",
  submitReport: "ሪፖርት ላክ",
  submitting: "በመላክ ላይ…",

  // Emergency Mode Drawer/Slider
  emergencyMode: "የአደጋ ጊዜ ሁኔታ",
  severityLevel: "የአደጋ ደረጃ",
  minor: "ቀሊል",
  moderate: "መካከለኛ",
  severe: "ከፍተኛ",
  submitEmergencyReport: "የአደጋ ጊዜ ሪፖርት ላክ",

  // Incident Types
  typeRobbery: "ዘረፋ / ስርቆት / ወንጀል",
  typeWeapons: "ህገ-ወጥ መሳሪያዎች",
  typeFraud: "ማጭበርበር / ህገ-ወጥ ገንዘብ",
  typeThreat: "የደህንነት ስጋት",
  typeBegging: "የጎዳና ተዳዳሪዎች / ለምና",
  typeDisruptive: "ሁከት / ህገ-ወጥ እንቅስቃሴ",
  typeIllegalBusiness: "ህገ-ወጥ ንግድ / ደላላነት",
  typeEventSecurity: "የበዓላትና ዝግጅቶች ደህንነት",
  typeInspection: "የተቋማት ፍተሻ ጥያቄ",
  typeNoise: "የድምፅ ብክለት",
  typeLittering: "ህገ-ወጥ የቆሻሻ ጣላ",
  typeOthers: "ሌላ ክስተት",

  // Map Screen
  searchLocation: "ቦታ ፈልግ…",
  filterAll: "ሁሉም",
  filterCrime: "አደጋ / ወንጀል",
  filterIllegal: "ህገ-ወጥ እንቅስቃሴ",
  filterThreat: "የደህንነት ስጋት",
  activeIncidentsCount: "ንቁ ክስተቶች",

  // Success Screen
  reportSubmitted: "ሪፖርቱ ተልኳል!",
  thankYouHelp: "አዲስ አበባን ደህንነቷ የተጠበቀ ስላደረጉ እናመሰግናለን።",
  reportId: "የሪፖርት መለያ (ID)",
  submittedOn: "የተላከበት ጊዜ",
  assignedTo: "የተመደበው ክፍል",
  shareReport: "ሪፖርት አጋራ",
  returnToHome: "ወደ முதன்மை ገጽ ተመለስ",

  // Auth / Login / Register
  welcomeBack: "እንኳን ደህና መጡ",
  signInSub: "በስልክ ቁጥርዎ እና በፒን ቁጥርዎ ይግቡ።",
  phoneNumber: "የስልክ ቁጥር",
  pin: "ፒን (4-6 አሃዞች)",
  confirmPin: "ፒን ያረጋግጡ",
  newHere: "አዲስ ነዎት?",
  createAccount: "መለያ ክፈት",
  registerAsCitizen: "የአዲስ አበባ ሰላምና ጸጥታ ዜጋ ሆነው ይመዝገቡ።",
  fullName: "ሙሉ ስም",
  alreadyAccount: "መለያ አለዎት?",
  login: "ይግቡ",
  verifyPhone: "ስልክ ያረጋግጡ",
  verifyCodeSub: "ወደ ስልክዎ የተላከውን የማረጋገጫ ኮድ ያስገቡ።",
  resendCode: "ኮድ እንደገና ላክ",

  // Notifications / Chat / Settings
  notifications: "ማስታወቂያዎች",
  chat: "ውይይት",
  settings: "ማስተካከያ",
  account: "መለያ",
  changePin: "ፒን ቀይር",
  logout: "ውጣ",
  loginOrRegister: "ይግቡ ወይም ይመዝገቡ",
  trackCase: "ጉዳይ ተከታተል",
  trackCaseSub: "ሪፖርት ሲልኩ የተቀበሉትን የጉዳይ መለያ ቁጥር ያስገቡ።",
  enterCaseId: "የጉዳይ መለያ ያስገቡ",
  track: "ተከታተል",
};

const om: typeof en = {
  // Common & Header
  appName: "Nagaa fi Nageenya",
  subAppName: "Appii Lammiilee",
  addisAbabaCitizens: "Lammiilee Nagaa fi Nageenya Finfinnee",
  tagline: "Gabaasaa. Deebii Argadhaa. Furmaata Kenaa.",
  taglineSub: "Finfinneedhaaf Tajaajila.",
  goodMorning: "Akkam Bultan",
  goodAfternoon: "Akkam Ooltan",
  goodEvening: "Akkam Galgaltan",
  hello: "Akkam",
  guest: "Keessummaa",
  language: "Afaan",
  selectLanguage: "Afaan Filadhaa",
  english: "English",
  amharic: "አማርኛ",
  oromo: "Afaan Oromoo",
  close: "Cufaa",
  cancel: "Dhiisaa",
  save: "Olkaa'aa",
  back: "Deebi'aa",
  loading: "Fe'amaa jira…",
  error: "Dogoggora",
  success: "Milkaa'eera",
  seeAll: "Hunda Ilaalaa",
  viewOnMap: "Kaartaa irratti ilaalaa",
  active: "Socho'aa",

  // Onboarding
  onboardingTitle: "Uumama Gabaasaa, Magaalaa Eegaa",
  onboardingSub: "Uumama nageenyaa kallattiin Waajjira Poolisii fi Nageenyaaf gabaasuun Finfinnee nagaa taasisaa.",
  getStarted: "Jalqabaa",
  continueAsGuest: "Akka Keessummaatti Itti Fufaa",
  liveTicker1: "Uumama Masqal Addabaabaay biratti raawwatame • KALLATTIIN",
  liveTicker2: "Uumama Karaa Boolee biratti raawwatame • KALLATTIIN",
  liveTicker3: "Uumama Meeksiikoo Addabaabaay biratti raawwatame • KALLATTIIN",

  // Home Screen
  reportIncident: "Gabaasa Dhiheessaa",
  reportIncidentSub: "Gosa 10 qaba",
  viewIncidentMap: "Kaartaa Uumamaa Ilaalaa",
  viewIncidentMapSub: "Mallattoo 18 socho'aan",
  recentReports: "Gabaasota Dhiyoo",
  noReportsYet: "Gabaasni hin dhihaanne",
  noReportsSub: "Nageenya naannoo keessanii gabaasuuf “Gabaasa Dhiheessaa” fayyadamaa.",
  impactStats: "Staatiastiksii Milkaa'inaa",
  reportsThisMonth: "Gabaasota Ji'a Kanaa",
  avgResponseTime: "Waggai Deebii Gahaa",
  vsLastMonth: "+12% ji'a darbee irraa",
  improvement: "-14daqiqa fooyya'iinsa",
  emergencySos: "WAAMICHA SUTAA (SOS)",
  emergencySosSub: "Gargaarsa hatattamaaf bakka keessan ergaa",

  // Quick Action Labels
  quickReport: "Gabaasa",
  quickMap: "Kaartaa",
  quickChat: "Waliin Haasaa",
  quickAlerts: "Akeekkachiisa",
  quickTrack: "Hordofaa",
  quickProfile: "Puroofaayilii",

  // Tab Titles
  tabHome: "Home",
  tabMap: "Kaartaa",
  tabReports: "Gabaasota",
  tabNotifications: "Beeksisa",
  tabSettings: "Sirna",

  // Report Create Screen
  reportSecurityIncident: "Uumama Nageenyaa Gabaasaa",
  attachNotice: "Fakkii, viidiyoo, sagalee fi ibsa qabsiisaa",
  tapToAddFiles: "Faayila, suuraa fi viidiyoo dabaluuf tuqaa",
  upToAttachments: "Hanga faayila 4",
  incidentType: "Gosa Uumamaa",
  selectIncidentType: "Gosa uumamaa filadhaa",
  description: "Ibsa",
  describeWhatHappened: "Maaltu akka raawwatame ibsaa…",
  currentLocation: "Bakka Ammaa Keessan",
  changeLocation: "Jijjiiraa",
  reportAnonymously: "Iccitiidhaan gabaasaa",
  anonymousSub: "Maqaan keessan namoota biroof hin mul'atu",
  submitReport: "Gabaasa Ergaa",
  submitting: "Ergamaa jira…",

  // Emergency Mode Drawer/Slider
  emergencyMode: "Haala Suta (Emergency)",
  severityLevel: "Sadarkaa Balaa",
  minor: "Salphaa",
  moderate: "Giddu-galeessa",
  severe: "Cimsaa",
  submitEmergencyReport: "Gabaasa Balaa Ergaa",

  // Incident Types
  typeRobbery: "Hattummaa / Hannaa / Yakka",
  typeWeapons: "Meeshaa Seeraan Alaa",
  typeFraud: "Gowwoomsaa / Malaammaltummaa",
  typeThreat: "Sodaa Nageenyaa",
  typeBegging: "Daandii Irra Jiraattota / Kadhaa",
  typeDisruptive: "Jiraachisa / Sochii Seeraan Alaa",
  typeIllegalBusiness: "Daldala Seeraan Alaa / Dalaaltummaa",
  typeEventSecurity: "Nageenya Ayyaanaa fi Qophii",
  typeInspection: "Gaaffii Sakatta'iinsa Dhaabbata",
  typeNoise: "Sagalee Sagaleessuu",
  typeLittering: "Balfa Seeraan Alaa Gatuu",
  typeOthers: "Uumama Biroo",

  // Map Screen
  searchLocation: "Bakka barbaadaa…",
  filterAll: "Hunda",
  filterCrime: "Balaa / Yakka",
  filterIllegal: "Sochii Seeraan Alaa",
  filterThreat: "Sodaa Nageenyaa",
  activeIncidentsCount: "Uumama Socho'an",

  // Success Screen
  reportSubmitted: "Gabaasni Ergameera!",
  thankYouHelp: "Finfinnee nagaa gochuu keessaniif galatoomaa.",
  reportId: "Eenyummeessaa Gabaasaa (ID)",
  submittedOn: "Yeroo ergame",
  assignedTo: "Kutaa itti kenname",
  shareReport: "Gabaasa Qooddaa",
  returnToHome: "Gara Fuula Duraatti Deebi'aa",

  // Auth / Login / Register
  welcomeBack: "Baga Nagaan Deebitan",
  signInSub: "Lakk lakkoofsa bilbilaa fi PIN keessaniin seenaa.",
  phoneNumber: "Lakkoofsa Bilbilaa",
  pin: "PIN (Lakkoofsa 4-6)",
  confirmPin: "PIN Mirkaneessaa",
  newHere: "Haaraadhaa?",
  createAccount: "Akkaawuntii Banadhaa",
  registerAsCitizen: "Lammii Nagaa fi Nageenya Finfinnee ta'uun galmeeffamaa.",
  fullName: "Maqaa Guutuu",
  alreadyAccount: "Akkaawuntii qabduu?",
  login: "Seenaa",
  verifyPhone: "Bilbila Mirkaneessaa",
  verifyCodeSub: "Koodii mirkaneessaa bilbila keessaniif ergame galchaa.",
  resendCode: "Koodii Irra Deebi'ii Ergaa",

  // Notifications / Chat / Settings
  notifications: "Beeksisa",
  chat: "Waliin Haasaa",
  settings: "Sirna (Settings)",
  account: "Akkaawuntii",
  changePin: "PIN Jijjiiraa",
  logout: "Ba'aa",
  loginOrRegister: "Seenaa Ykn Galmeeffamaa",
  trackCase: "Dhimma Hordofaa",
  trackCaseSub: "Koodii ID dhimmaa yeroo gabaasaa argattan galchaa.",
  enterCaseId: "ID Dhimmaa Galchaa",
  track: "Hordofaa",
};

const translations: Record<Language, typeof en> = { en, am, om };

let currentLanguage: Language = "en";
const listeners = new Set<(lang: Language) => void>();

export async function initLanguage(): Promise<Language> {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored === "am" || stored === "om" || stored === "en") {
      currentLanguage = stored;
    }
  } catch {}
  return currentLanguage;
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export async function setAppLanguage(lang: Language): Promise<void> {
  currentLanguage = lang;
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
  listeners.forEach((fn) => fn(lang));
}

export function subscribeLanguageChange(fn: (lang: Language) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function t(key: TranslationKey): string {
  const dict = translations[currentLanguage] || translations.en;
  return dict[key] || translations.en[key] || key;
}
