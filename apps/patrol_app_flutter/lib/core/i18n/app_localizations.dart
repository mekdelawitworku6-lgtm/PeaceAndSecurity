import 'package:flutter/cupertino.dart' show DefaultCupertinoLocalizations;
import 'package:flutter/material.dart';

class AppLocalizationsScope extends InheritedWidget {
  final AppLocalizations l10n;

  const AppLocalizationsScope({
    super.key,
    required this.l10n,
    required super.child,
  });

  @override
  bool updateShouldNotify(AppLocalizationsScope oldWidget) =>
      l10n.current != oldWidget.l10n.current;
}

class AppLocalizations {
  static const supportedLocales = [Locale('en'), Locale('am'), Locale('om')];
  static const localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    DefaultMaterialLocalizations.delegate,
    DefaultWidgetsLocalizations.delegate,
    DefaultCupertinoLocalizations.delegate,
  ];

  String _lang = 'en';

  String get current => _lang;

  Locale get locale => Locale(_lang);

  ValueNotifier<String> notifier = ValueNotifier('en');

  Future<void> init() async {
    // Set by LanguageBloc from SessionManager
  }

  void setLanguage(String lang) {
    _lang = lang;
    notifier.value = lang;
  }

  String t(String key, [Map<String, String>? params]) {
    final value = _strings[key]?[_lang] ?? _strings[key]?['en'] ?? key;
    if (params == null) return value;
    var result = value;
    params.forEach((k, v) {
      result = result.replaceAll('{$k}', v);
    });
    return result;
  }

  static AppLocalizations of(BuildContext context) {
    return context
            .dependOnInheritedWidgetOfExactType<AppLocalizationsScope>()
            ?.l10n ??
        _fallback;
  }

  static final _fallback = AppLocalizations();

  static final Map<String, Map<String, String>> _strings = {
    'appName': {'en': 'Peace & Security', 'am': 'ሰላም እና ደህንነት', 'om': 'Nagaa fi Walaboo'},
    'addisAbabaCitizens': {
      'en': 'Addis Ababa Peace and Security Citizens',
      'am': 'የአዲስ አበባ ሰላም እና ደህንነት ዜጎች',
      'om': 'Lammii Nagaa fi Tasgabbii Finfinnee',
    },
    'tagline': {'en': 'Report. Respond. Resolve.', 'am': 'ዘግብ። ምላሽ ስጥ። ፍታ።', 'om': 'Gabaagi. Deebisi. Fur.'},
    'serving': {'en': 'Serving Addis Ababa.', 'am': 'አዲስ አበባን በማገልገል ላይ።', 'om': 'Finfinnee tajaajilaa.'},
    'goodMorning': {'en': 'Good Morning, {name}', 'am': 'እንደምን አደሩ፣ {name}', 'om': 'Bariiti, {name}'},
    'goodAfternoon': {'en': 'Good Afternoon, {name}', 'am': 'እንደምን ዋሉ፣ {name}', 'om': 'Galgalana, {name}'},
    'goodEvening': {'en': 'Good Evening, {name}', 'am': 'እንደምን አመሹ፣ {name}', 'om': 'Halkan gaarii, {name}'},
    'home': {'en': 'Home', 'am': 'መነሻ', 'om': 'Mana'},
    'map': {'en': 'Map', 'am': 'ካርታ', 'om': 'Maapii'},
    'reports': {'en': 'Reports', 'am': 'ሪፖርቶች', 'om': 'Gabaasa'},
    'profile': {'en': 'Profile', 'am': 'መገለጫ', 'om': 'Pirootila'},
    'reportIncident': {'en': 'Report Incident', 'am': 'አደጋ ዘግብ', 'om': 'Dhimma Gabaagi'},
    'typesAvailable': {'en': '10 types available', 'am': '10 ዓይነቶች ይገኛሉ', 'om': 'Gosa 10 argamu'},
    'viewIncidentMap': {'en': 'View Incident Map', 'am': 'የአደጋ ካርታ ይመልከቱ', 'om': 'Maapii Dhimma Ilaali'},
    'activeMarks': {'en': '18 active marks', 'am': '18 ንቁ ምልክቶች', 'om': 'Mallattoo 18'},
    'recentReports': {'en': 'Recent Reports', 'am': 'የቅርብ ሪፖርቶች', 'om': 'Gabaasa Dhiyoo'},
    'seeAll': {'en': 'See all', 'am': 'ሁሉንም ይመልከቱ', 'om': 'Hunda Ilaali'},
    'noReportsYet': {'en': 'No reports submitted yet', 'am': 'እስካሁን ሪፖርት አልተላለፈም', 'om': 'Gabaasni hin galchamne'},
    'noReportsSub': {
      'en': 'Use "Report Incident" to report security issues in your area.',
      'am': 'በአካባቢዎ የደህንነት ችግሮችን ለማሳወቅ "አደጋ ዘግብ" ይጠቀሙ።',
      'om': 'Rakkoo tasgabbii naannoo kee gabaachuuf "Dhimma Gabaagi" fayyadami.',
    },
    'impactStats': {'en': 'Impact Stats', 'am': 'የተፅዕኖ ስታቲስቲክስ', 'om': 'Raabsa Ijoo'},
    'reportsThisMonth': {'en': 'Reports This Month', 'am': 'የዚህ ወር ሪፖርቶች', 'om': "Gabaasa Ji'aa Kanaa"},
    'avgResponseTime': {'en': 'Avg Response Time', 'am': 'አማካይ የምላሽ ጊዜ', 'om': 'Yeroo Deebii'},
    'selectLanguage': {'en': 'Select Language', 'am': 'ቋንቋ ይምረጡ', 'om': 'Afaan Filadhu'},
    'close': {'en': 'Close', 'am': 'ዝጋ', 'om': 'Cufi'},
    'searchLocation': {'en': 'Search location…', 'am': 'ቦታ ይፈልጉ…', 'om': 'Bakka barbaadi…'},
    'all': {'en': 'All', 'am': 'ሁሉም', 'om': 'Hunda'},
    'emergency': {'en': 'Emergency', 'am': 'ድንገተኛ', 'om': 'Dhilbahaa'},
    'crime': {'en': 'Crime', 'am': 'ወንጀል', 'om': 'Yakka'},
    'illegalActivity': {'en': 'Illegal Activity', 'am': 'ህገ-ወጥ እንቅስቃሴ', 'om': 'Gocha Seeraan Alaa'},
    'securityThreat': {'en': 'Security Threat', 'am': 'የደህንነት ስጋት', 'om': 'Sabaqa Tasgabbii'},
    'activeIncidents': {'en': 'Active Incidents', 'am': 'ንቁ አደጋዎች', 'om': "Dhimma Socho'aa"},
    'trackCase': {'en': 'Track Case', 'am': 'ጉዳይ ይከታተሉ', 'om': 'Dhimma Hordofi'},
    'onboardingTitle': {
      'en': 'Report Incidents, Protect the City',
      'am': 'አደጋዎችን ዘግቡ፣ ከተማዋን ይጠብቁ',
      'om': 'Dhimma Gabaagi, Magaalaa Eegi',
    },
    'onboardingSub': {
      'en': 'Help keep Addis Ababa safe by reporting incidents directly to the Police and Security Bureau.',
      'am': 'አደጋዎችን በቀጥታ ለፖሊስ እና ለደህንነት ቢሮ በማሳወቅ አዲስ አበባን ደህንነት ለመጠበቅ ይረዱ።',
      'om': 'Dhimma gara biiroo poolisii fi tasgabbii dabarsuun Finfinnee nagaa taasisuuf gargaari.',
    },
    'getStarted': {'en': 'Get Started', 'am': 'ይጀምሩ', 'om': 'Eegali'},
    'continueAsGuest': {'en': 'Continue as Guest', 'am': 'እንደ እንግዳ ይቀጥሉ', 'om': 'Keessummaadhaan Itti Fufi'},
    'liveTicker1': {'en': 'Incident captured near Meskel Sq. • LIVE', 'am': 'በመስቀል አደባባይ አካባቢ አደጋ ተይዟል • የቀጥታ', 'om': 'Dhimma bakka Meskel irratti qabame • LAAFU'},
    'liveTicker2': {'en': 'Incident captured near Bole Road • LIVE', 'am': 'በቦሌ መንገድ አካባቢ አደጋ ተይዟል • የቀጥታ', 'om': 'Dhimma karaa Bole irratti qabame • LAAFU'},
    'liveTicker3': {'en': 'Incident captured near Mexico Sq. • LIVE', 'am': 'በሜክሲኮ አደባባይ አካባቢ አደጋ ተይዟል • የቀጥታ', 'om': 'Dhimma bakka Mexico irratti qabame • LAAFU'},
    'sharedWithPolice': {'en': 'Shared with Addis Ababa Police Bureau', 'am': 'ለአዲስ አበባ ፖሊስ ቢሮ ተጋርቷል', 'om': 'Biroo Poolisii Finfinneetti qoodame'},
    'sharedWithSecurity': {'en': 'Shared with Addis Ababa Security Bureau', 'am': 'ለአዲስ አበባ ደህንነት ቢሮ ተጋርቷል', 'om': 'Biroo Tasgabbii Finfinneetti qoodame'},
    'welcomeBack': {'en': 'Welcome back', 'am': 'እንኳን ደህና መጡ', 'om': 'Baga nagaan dhufte'},
    'loginSub': {'en': 'Sign in with your phone number and PIN.', 'am': 'በስልክ ቁጥር እና ፒን ይግቡ።', 'om': 'Lakkoofsa bilbilaa fi PIIN\'ii fayyadamuun seeni.'},
    'phoneNumber': {'en': 'Phone number', 'am': 'ስልክ ቁጥር', 'om': 'Lakkoofsa Bilbilaa'},
    'pin': {'en': 'PIN', 'am': 'ፒን', 'om': 'PIIN'},
    'login': {'en': 'Login', 'am': 'ግባ', 'om': 'Seeni'},
    'newHere': {'en': 'New here?', 'am': 'አዲስ ነዎት?', 'om': 'Haaraa?',},
    'createAccount': {'en': 'Create an account', 'am': 'መለያ ይፍጠሩ', 'om': 'Herrega Uumi'},
    'registerSub': {
      'en': 'Register as a citizen of the Peace & Security system.',
      'am': 'በሰላም እና ደህንነት ስርዓት ውስጥ እንደ ዜጋ ይመዝገቡ።',
      'om': 'Sistimii Nagaa fi Tasgabbii keessatti lammii ta\'uun galmaa\'i.',
    },
    'fullName': {'en': 'Full name', 'am': 'ሙሉ ስም', 'om': 'Maqaa Guutuu'},
    'confirmPin': {'en': 'Confirm PIN', 'am': 'ፒን ያረጋግጡ', 'om': 'PIIN\'ii Mirkaneessi'},
    'register': {'en': 'Register', 'am': 'ይመዝገቡ', 'om': 'Galmaa\'i'},
    'alreadyHaveAccount': {'en': 'Already have an account?', 'am': 'መለያ አለዎት?', 'om': 'Herrega qabduu?'},
    'verifyPhone': {'en': 'Verify Phone', 'am': 'ስልክ ያረጋግጡ', 'om': 'Bilbila Mirkaneessi'},
    'verifySub': {
      'en': 'Enter the verification code sent to {phone}.',
      'am': 'ወደ {phone} የተላከውን የማረጋገጫ ኮድ ያስገቡ።',
      'om': 'Koodii mirkaneessaa gara {phone} ergame galchi.',
    },
    'devCodeHint': {
      'en': 'For local development, the code is printed in the backend console.',
      'am': 'ለአካባቢያዊ ልማት፣ ኮዱ በባክኤንድ ኮንሶል ውስጥ ይታተማል።',
      'om': 'Misooma naannootiif, koodiin console backend keessatti maxxanfama.',
    },
    'verificationCode': {'en': 'Verification code', 'am': 'የማረጋገጫ ኮድ', 'om': 'Koodii Mirkaneessaa'},
    'verifyContinue': {'en': 'Verify & Continue', 'am': 'አረጋግጥ እና ቀጥል', 'om': 'Mirkaneessi & Itti Fufi'},
    'resendCode': {'en': 'Resend code', 'am': 'ኮድ እንደገና ይላኩ', 'om': 'Koodii Deebisii Ergi'},
    'verifyHint': {
      'en': 'After verification your account is activated and you will be logged in with the PIN you chose.',
      'am': 'ከማረጋገጥ በኋላ መለያዎ ይነቃል እና በመረጡት ፒን ይገባሉ።',
      'om': 'Mirkaneessa booda herregan kee ni banama; PIIN\'ii filatteen seenita.',
    },
    'incidentType': {'en': 'Incident Type', 'am': 'የአደጋ ዓይነት', 'om': 'Gosa Dhimmaa'},
    'description': {'en': 'Description', 'am': 'መግለጫ', 'om': 'Ibsa'},
    'currentLocation': {'en': 'Current Location', 'am': 'የአሁኑ ቦታ', 'om': 'Bakka Ammaa'},
    'change': {'en': 'Change', 'am': 'ቀይር', 'om': 'Jijjiiri'},
    'reportAnonymously': {'en': 'Report anonymously', 'am': 'በማንነት ሳይገለጽ ዘግብ', 'om': 'Maqaa malee Gabaagi'},
    'anonymousSub': {'en': "Your name won't be visible to others", 'am': 'ስምዎ ለሌሎች አይታይም', 'om': 'Maqaan kee warra biroof hin mul\'atu'},
    'submitReport': {'en': 'Submit Report', 'am': 'ሪፖርት አስገባ', 'om': 'Gabaasa Dhiyeessi'},
    'submitEmergency': {'en': 'Submit Emergency Report', 'am': 'የድንገተኛ ሪፖርት አስገባ', 'om': 'Gabaasa Dhibbataa Dhiyeessi'},
    'emergencyMode': {'en': 'Emergency Mode', 'am': 'የድንገተኛ ሁኔታ', 'om': 'Haala Dhibbataa'},
    'minor': {'en': 'Minor', 'am': 'ቀላል', 'om': 'Xixiqqaa'},
    'moderate': {'en': 'Moderate', 'am': 'መካከለኛ', 'om': 'Giddugaleessa'},
    'severe': {'en': 'Severe', 'am': 'ከባድ', 'om': 'Cimaa'},
    'photos': {'en': 'Photos ({n}/4)', 'am': 'ፎቶዎች ({n}/4)', 'om': 'Suuraa ({n}/4)'},
    'video': {'en': '+ Video', 'am': '+ ቪዲዮ', 'om': '+ Viidiyoo'},
    'videoAdded': {'en': 'Video Added', 'am': 'ቪዲዮ ተጨምሯል', 'om': 'Viidiyoon dabale'},
    'voice': {'en': '+ Voice', 'am': '+ ድምፅ', 'om': '+ Sagalee'},
    'audioAdded': {'en': 'Audio Added', 'am': 'ድምፅ ተጨምሯል', 'om': 'Sagaleen dabale'},
    'selectIncidentType': {'en': 'Please select an incident type', 'am': 'እባክዎ የአደጋ ዓይነት ይምረጡ', 'om': 'Maaloo gosa dhimmaa filadhu'},
    'describeWhatHappened': {
      'en': 'Please describe what happened (at least 5 characters)',
      'am': 'እባክዎ የሆነውን ይግለጹ (ቢያንስ 5 ቁምፊዎች)',
      'om': 'Maaloo waan ta\'e ibsi (xinnoodhaan 5 qubee)',
    },
    'reportSubmitted': {'en': 'Report Submitted!', 'am': 'ሪፖርት ቀርቧል!', 'om': 'Gabaasni Dhiyaate!'},
    'reportSubmittedSub': {'en': 'Thank you for helping keep Addis Ababa safe.', 'am': 'አዲስ አበባን ደህንነት ለመጠበቅ ስለረዱ እናመሰግናለን።', 'om': 'Finfinnee nagaa taasisuuf gargaartaniif galatoomi.'},
    'reportId': {'en': 'REPORT ID', 'am': 'የሪፖርት መለያ', 'om': 'Imaan Gabaasa'},
    'submittedOn': {'en': 'Submitted on {date}', 'am': 'የቀረበበት ቀን {date}', 'om': 'Guyyaa {date} dhiyaate'},
    'assignedTo': {'en': 'Assigned to Bole Sub-City Security Unit', 'am': 'ለቦሌ ንዑስ ከተማ የደህንነት ክፍል ተመድቧል', 'om': 'Gara kutaa tasgabbii Bole aanaatti ramadame'},
    'shareReport': {'en': 'Share Report', 'am': 'ሪፖርት አጋራ', 'om': 'Gabaasa Qoodi'},
    'viewOnMap': {'en': 'View on Map', 'am': 'በካርታ ይመልከቱ', 'om': 'Maapiirratti Ilaali'},
    'returnHome': {'en': 'Return to Home', 'am': 'ወደ መነሻ ይመለሱ', 'om': 'Gara Mana Deebi\'i'},
    'chatAboutReport': {'en': 'Chat about this report', 'am': 'ስለዚህ ሪፖርት ይወያዩ', 'om': 'Waa\'ee gabaasa kanaa haasa\'i'},
    'noConversations': {'en': 'No conversations yet', 'am': 'እስካሁን ውይይቶች የሉም', 'om': 'Haasa\'ii hin jiru'},
    'noConversationsSub': {
      'en': 'Start chatting with the response team from any of your reports.',
      'am': 'ከማንኛውም ሪፖርትዎ ከምላሽ ቡድን ጋር መወያየት ይጀምሩ።',
      'om': 'Gabaasa kee kamiyyuu irraa garee deebii waliin haasa\'uu eegali.',
    },
    'myReports': {'en': 'My Reports', 'am': 'ሪፖርቶቼ', 'om': 'Gabaasa Koo'},
    'typeMessage': {'en': 'Type a message…', 'am': 'መልዕክት ይጻፉ…', 'om': 'Ergama barreessi…'},
    'loadingMessages': {'en': 'Loading messages…', 'am': 'መልዕክቶች በመጫን ላይ…', 'om': 'Ergama sochiiraa jira…'},
    'notifications': {'en': 'Notifications', 'am': 'ማሳወቂያዎች', 'om': 'Beeksisa'},
    'markAllRead': {'en': 'Mark all read', 'am': 'ሁሉንም እንደተነበቡ ምልክት ያድርጉ', 'om': 'Hunda dubbifamootti akeeki'},
    'noNotifications': {'en': 'No notifications', 'am': 'ማሳወቂያዎች የሉም', 'om': 'Beeksisni hin jiru'},
    'noNotificationsSub': {'en': 'Updates about your reports will appear here.', 'am': 'ስለ ሪፖርቶችዎ ዝማኔዎች እዚህ ይታያሉ።', 'om': 'Odeeffannoon gabaasa kee asitti mul\'ata.'},
    'settings': {'en': 'Settings', 'am': 'ቅንብሮች', 'om': 'Qindeessa'},
    'account': {'en': 'Account', 'am': 'መለያ', 'om': 'Herrega'},
    'changePin': {'en': 'Change PIN', 'am': 'ፒን ቀይር', 'om': 'PIIN\'ii Jijjiiri'},
    'logOut': {'en': 'Log out', 'am': 'ውጣ', 'om': 'Ba\'i'},
    'logOutConfirm': {'en': 'Are you sure you want to log out?', 'am': 'መውጣት እርግጠኛ ነዎት?', 'om': 'Ba\'uu mirkaneeffattee?'},
    'about': {'en': 'About', 'am': 'ስለ መተግበሪያው', 'om': 'Waa\'ee'},
    'idLabel': {'en': 'ID: {code}', 'am': 'መለያ፡ {code}', 'om': 'Lakkoofsa: {code}'},
    'aboutApp': {
      'en': 'Patrol officer app for the Addis Ababa Peace & Security system.',
      'am': 'የአዲስ አበባ ሰላም እና ደህንነት ስርዓት የፖትሮል መኮንን መተግበሪያ።',
      'om': 'Appii qondaala poolisii nageenyaa fi tasgabbii Finfinneetiif.',
    },
    'trackCaseSub': {'en': 'Enter the case ID you received when submitting your report.', 'am': 'ሪፖርትዎን ሲያስገቡ የተቀበሉትን የጉዳይ መለያ ያስገቡ።', 'om': 'Imaan dhimma yeroo gabaasa dhiyeesitan argattan galchi.'},
    'caseId': {'en': 'Case ID', 'am': 'የጉዳይ መለያ', 'om': 'Imaan Dhimma'},
    'submit': {'en': 'Submit', 'am': 'አስገባ', 'om': 'Dhiyeessi'},
    'details': {'en': 'Details', 'am': 'ዝርዝሮች', 'om': 'Ibsa'},
    'address': {'en': 'Address', 'am': 'አድራሻ', 'om': 'Teessoo'},
    'area': {'en': 'Area', 'am': 'አካባቢ', 'om': 'Naannoo'},
    'incident': {'en': 'Incident', 'am': 'አደጋ', 'om': 'Dhimma'},
    'reported': {'en': 'Reported', 'am': 'ተዘግቧል', 'om': 'Gabaafame'},
    'anonymous': {'en': 'Anonymous', 'am': 'ማንነት የማይገለጽ', 'om': 'Maqaa-malee'},
    'yes': {'en': 'Yes', 'am': 'አዎ', 'om': 'Eeyyee'},
    'no': {'en': 'No', 'am': 'አይ', 'om': 'Lakki'},
    'ongoing': {'en': 'Ongoing', 'am': 'በመካሄድ ላይ', 'om': 'Itti fufaa'},
    'noiseLevel': {'en': 'Noise level', 'am': 'የድምፅ መጠን', 'om': 'Sadarkaa Sagalee'},
    'peopleInvolved': {'en': 'People involved', 'am': 'የተሳተፉ ሰዎች', 'om': 'Namoonni Hirman'},
    'suspect': {'en': 'Suspect', 'am': 'ተጠርጣሪ', 'om': 'Shakkamaa'},
    'victim': {'en': 'Victim', 'am': 'ተጎጂ', 'om': 'Miidhamaa'},
    'witness': {'en': 'Witness', 'am': 'ምስክር', 'om': 'Ragaa'},
    'noDetailsProvided': {'en': 'No additional details provided.', 'am': 'ተጨማሪ ዝርዝሮች አልተሰጡም።', 'om': 'Ibsa dabalataa hin kennamne.'},
    'assignedPatrol': {'en': 'Assigned patrol', 'am': 'የተመደበ ፖትሮል', 'om': 'Poolisii Ramadame'},
    'patrolOfficer': {'en': 'Patrol officer', 'am': 'የፖትሮል መኮንን', 'om': 'Qondaala Poolisii'},
    'timeline': {'en': 'Timeline', 'am': 'የጊዜ መስመር', 'om': 'Yeroo Tartiira'},
    'noTimeline': {'en': 'No timeline events yet.', 'am': 'እስካሁን የጊዜ መስመር ክስተቶች የሉም።', 'om': 'Tartiibni yeroo hin jiru.'},
    'chats': {'en': 'Chats', 'am': 'ውይይቶች', 'om': 'Haasa\'ii'},
    'loading': {'en': 'Loading…', 'am': 'በመጫን ላይ…', 'om': 'Sochiiraa…'},
    'cancel': {'en': 'Cancel', 'am': 'ሰርዝ', 'om': 'Haqi'},
    'ok': {'en': 'OK', 'am': 'እሺ', 'om': 'Tole'},
    'noLocation': {'en': 'Location is required. Tap "Change" to update location.', 'am': 'ቦታ ያስፈልጋል። ቦታን ለማዘመን "ቀይር" ይንኩ።', 'om': 'Bakki barbaachisa. Bakka haaromsuuf "Jijjiiri" tuqi.'},
    'submitMessage': {'en': 'Submitting…', 'am': 'በማስገባት ላይ…', 'om': 'Dhiyeechaa…'},
  };
}