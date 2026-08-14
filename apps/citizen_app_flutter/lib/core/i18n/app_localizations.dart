import 'package:flutter/cupertino.dart' show DefaultCupertinoLocalizations;
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

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
  static const supportedLocales = [
    Locale('en'),
    Locale('am'),
    Locale('om'),
    Locale('ti'),
  ];
  static const localizationsDelegates = <LocalizationsDelegate<dynamic>>[
    GlobalMaterialLocalizations.delegate,
    GlobalWidgetsLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
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
    'appName': {
      'en': 'Peace & Security',
      'am': 'ሰላም እና ደህንነት',
      'om': 'Nagaa fi Walaboo',
      'ti': 'ሰላምን ድሕንነትን',
    },
    'addisAbabaCitizens': {
      'en': 'Addis Ababa Peace and Security Citizens',
      'am': 'የአዲስ አበባ ሰላም እና ደህንነት ዜጎች',
      'om': 'Lammii Nagaa fi Tasgabbii Finfinnee',
      'ti': 'ሰላምን ድሕንነትን',
    },
    'tagline': {
      'en': 'Report. Respond. Resolve.',
      'am': 'ዘግብ። ምላሽ ስጥ። ፍታ።',
      'om': 'Gabaagi. Deebisi. Fur.',
      'ti': 'ሪፖርት ግበር። ምላሽ ሃብ። ፍታሕ።',
    },
    'serving': {
      'en': 'Serving Addis Ababa.',
      'am': 'አዲስ አበባን በማገልገል ላይ።',
      'om': 'Finfinnee tajaajilaa.',
      'ti': 'ንኣዲስ ኣበባ እናገልግል ኣለና።',
    },
    'goodMorning': {
      'en': 'Good Morning, {name}',
      'am': 'እንደምን አደሩ፣ {name}',
      'om': 'Bariiti, {name}',
      'ti': 'ደሓን ንግሆ፣ {name}',
    },
    'goodAfternoon': {
      'en': 'Good Afternoon, {name}',
      'am': 'እንደምን ዋሉ፣ {name}',
      'om': 'Galgalana, {name}',
      'ti': 'ደሓን ድሕር ቀትሪ፣ {name}',
    },
    'goodEvening': {
      'en': 'Good Evening, {name}',
      'am': 'እንደምን አመሹ፣ {name}',
      'om': 'Halkan gaarii, {name}',
      'ti': 'ደሓን ምሸት፣ {name}',
    },
    'home': {'en': 'Home', 'am': 'መነሻ', 'om': 'Mana', 'ti': 'መበቆል'},
    'map': {'en': 'Map', 'am': 'ካርታ', 'om': 'Maapii', 'ti': 'ካርታ'},
    'reports': {'en': 'Reports', 'am': 'ሪፖርቶች', 'om': 'Gabaasa', 'ti': 'ሪፖርታት'},
    'profile': {
      'en': 'Profile',
      'am': 'መገለጫ',
      'om': 'Pirootila',
      'ti': 'ፕሮፋይል',
    },
    'reportIncident': {
      'en': 'Report Incident',
      'am': 'አደጋ ዘግብ',
      'om': 'Dhimma Gabaagi',
      'ti': 'ፍጻመ ሪፖርት ግበር',
    },
    'typesAvailable': {
      'en': '10 types available',
      'am': '10 ዓይነቶች ይገኛሉ',
      'om': 'Gosa 10 argamu',
      'ti': '10 ዓይነታት ይርከቡ',
    },
    'viewIncidentMap': {
      'en': 'View Incident Map',
      'am': 'የአደጋ ካርታ ይመልከቱ',
      'om': 'Maapii Dhimma Ilaali',
      'ti': 'ካርታ ፍጻማት ርኣይ',
    },
    'activeMarks': {
      'en': '18 active marks',
      'am': '18 ንቁ ምልክቶች',
      'om': 'Mallattoo 18',
      'ti': '18 ንጡፍ ምልክታት',
    },
    'recentReports': {
      'en': 'Recent Reports',
      'am': 'የቅርብ ሪፖርቶች',
      'om': 'Gabaasa Dhiyoo',
      'ti': 'ቀረባ ሪፖርታት',
    },
    'seeAll': {
      'en': 'See all',
      'am': 'ሁሉንም ይመልከቱ',
      'om': 'Hunda Ilaali',
      'ti': 'ኩሉ ርኣይ',
    },
    'noReportsYet': {
      'en': 'No reports submitted yet',
      'am': 'እስካሁን ሪፖርት አልተላለፈም',
      'om': 'Gabaasni hin galchamne',
      'ti': 'ገና ሪፖርታት ኣይተላእኩን',
    },
    'noReportsSub': {
      'en': 'Use "Report Incident" to report security issues in your area.',
      'am': 'በአካባቢዎ የደህንነት ችግሮችን ለማሳወቅ "አደጋ ዘግብ" ይጠቀሙ።',
      'om':
          'Rakkoo tasgabbii naannoo kee gabaachuuf "Dhimma Gabaagi" fayyadami.',
      'ti': 'ሪፖርት ግበር። ምላሽ ሃብ። ፍታሕ።',
    },
    'impactStats': {
      'en': 'Impact Stats',
      'am': 'የተፅዕኖ ስታቲስቲክስ',
      'om': 'Raabsa Ijoo',
      'ti': 'ውጽኢት ስታቲስቲክስ',
    },
    'reportsThisMonth': {
      'en': 'Reports This Month',
      'am': 'የዚህ ወር ሪፖርቶች',
      'om': "Gabaasa Ji'aa Kanaa",
      'ti': 'እዚ ወርሒ ሪፖርታት',
    },
    'avgResponseTime': {
      'en': 'Avg Response Time',
      'am': 'አማካይ የምላሽ ጊዜ',
      'om': 'Yeroo Deebii',
      'ti': 'ማእከላይ ግዜ ምላሽ',
    },
    'selectLanguage': {
      'en': 'Select Language',
      'am': 'ቋንቋ ይምረጡ',
      'om': 'Afaan Filadhu',
      'ti': 'ቋንቋ ምረጽ',
    },
    'close': {'en': 'Close', 'am': 'ዝጋ', 'om': 'Cufi', 'ti': 'ዕጾ'},
    'searchLocation': {
      'en': 'Search location…',
      'am': 'ቦታ ይፈልጉ…',
      'om': 'Bakka barbaadi…',
      'ti': 'ቦታ ድለይ…',
    },
    'all': {'en': 'All', 'am': 'ሁሉም', 'om': 'Hunda', 'ti': 'ኩሉ'},
    'emergency': {
      'en': 'Emergency',
      'am': 'ድንገተኛ',
      'om': 'Dhilbahaa',
      'ti': 'ህጹጽ',
    },
    'crime': {'en': 'Crime', 'am': 'ወንጀል', 'om': 'Yakka', 'ti': 'ወንጀል'},
    'illegalActivity': {
      'en': 'Illegal Activity',
      'am': 'ህገ-ወጥ እንቅስቃሴ',
      'om': 'Gocha Seeraan Alaa',
      'ti': 'ሕገ-ወጻኢ ተግባር',
    },
    'securityThreat': {
      'en': 'Security Threat',
      'am': 'የደህንነት ስጋት',
      'om': 'Sabaqa Tasgabbii',
      'ti': 'ስግኣት ድሕንነት',
    },
    'activeIncidents': {
      'en': 'Active Incidents',
      'am': 'ንቁ አደጋዎች',
      'om': "Dhimma Socho'aa",
      'ti': 'ንጡፋት ፍጻማት',
    },
    'trackCase': {
      'en': 'Track Case',
      'am': 'ጉዳይ ይከታተሉ',
      'om': 'Dhimma Hordofi',
      'ti': 'ጉዳይ ክትትል',
    },
    'onboardingTitle': {
      'en': 'Report Incidents, Protect the City',
      'am': 'አደጋዎችን ዘግቡ፣ ከተማዋን ይጠብቁ',
      'om': 'Dhimma Gabaagi, Magaalaa Eegi',
      'ti': 'ውጽኢት ስታቲስቲክስ',
    },
    'onboardingSub': {
      'en':
          'Help keep Addis Ababa safe by reporting incidents directly to the Police and Security Bureau.',
      'am': 'አደጋዎችን በቀጥታ ለፖሊስ እና ለደህንነት ቢሮ በማሳወቅ አዲስ አበባን ደህንነት ለመጠበቅ ይረዱ።',
      'om':
          'Dhimma gara biiroo poolisii fi tasgabbii dabarsuun Finfinnee nagaa taasisuuf gargaari.',
      'ti': 'ፍጻማት ብቐጥታ ናብ ቢሮ ፖሊስን ድሕንነትን ብምጽባር ንኣዲስ ኣበባ ደሓን ክትገብር ሓግዝ።',
    },
    'getStarted': {
      'en': 'Get Started',
      'am': 'ይጀምሩ',
      'om': 'Eegali',
      'ti': 'ጀምር',
    },
    'continueAsGuest': {
      'en': 'Continue as Guest',
      'am': 'እንደ እንግዳ ይቀጥሉ',
      'om': 'Keessummaadhaan Itti Fufi',
      'ti': 'ከም እንግዳ ቀጽል',
    },
    'liveTicker1': {
      'en': 'Incident captured near Meskel Sq. • LIVE',
      'am': 'በመስቀል አደባባይ አካባቢ አደጋ ተይዟል • የቀጥታ',
      'om': 'Dhimma bakka Meskel irratti qabame • LAAFU',
      'ti': 'ኣብ ጥቓ ሜስከል ስኩዌር ዝተሓዝ ፍጻመ • ህያው',
    },
    'liveTicker2': {
      'en': 'Incident captured near Bole Road • LIVE',
      'am': 'በቦሌ መንገድ አካባቢ አደጋ ተይዟል • የቀጥታ',
      'om': 'Dhimma karaa Bole irratti qabame • LAAFU',
      'ti': 'ኣብ ጥቓ መንገዲ ቦሌ ዝተሓዝ ፍጻመ • ህያው',
    },
    'liveTicker3': {
      'en': 'Incident captured near Mexico Sq. • LIVE',
      'am': 'በሜክሲኮ አደባባይ አካባቢ አደጋ ተይዟል • የቀጥታ',
      'om': 'Dhimma bakka Mexico irratti qabame • LAAFU',
      'ti': 'ኣብ ጥቓ ሜክሲኮ ስኩዌር ዝተሓዝ ፍጻመ • ህያው',
    },
    'sharedWithPolice': {
      'en': 'Shared with Addis Ababa Police Bureau',
      'am': 'ለአዲስ አበባ ፖሊስ ቢሮ ተጋርቷል',
      'om': 'Biroo Poolisii Finfinneetti qoodame',
      'ti': 'ምስ ቢሮ ፖሊስ ኣዲስ ኣበባ ተካፊሉ',
    },
    'sharedWithSecurity': {
      'en': 'Shared with Addis Ababa Security Bureau',
      'am': 'ለአዲስ አበባ ደህንነት ቢሮ ተጋርቷል',
      'om': 'Biroo Tasgabbii Finfinneetti qoodame',
      'ti': 'ምስ ቢሮ ድሕንነት ኣዲስ ኣበባ ተካፊሉ',
    },
    'welcomeBack': {
      'en': 'Welcome back',
      'am': 'እንኳን ደህና መጡ',
      'om': 'Baga nagaan dhufte',
      'ti': 'እንቋዕ ተመላስካ',
    },
    'loginSub': {
      'en': 'Sign in with your phone number and PIN.',
      'am': 'በስልክ ቁጥር እና ፒን ይግቡ።',
      'om': 'Lakkoofsa bilbilaa fi PIIN\'ii fayyadamuun seeni.',
      'ti': 'ብስልኪ ቁጽርኻን PINኻን እቶ።',
    },
    'phoneNumber': {
      'en': 'Phone number',
      'am': 'ስልክ ቁጥር',
      'om': 'Lakkoofsa Bilbilaa',
      'ti': 'ቁጽሪ ስልኪ',
    },
    'pin': {'en': 'PIN', 'am': 'ፒን', 'om': 'PIIN', 'ti': 'PIN'},
    'login': {'en': 'Login', 'am': 'ግባ', 'om': 'Seeni', 'ti': 'እቶ'},
    'guest': {'en': 'Guest', 'am': 'እንግዳ', 'om': 'Keessummaa', 'ti': 'እንግዳ'},
    'guestSub': {
      'en': 'Reporting anonymously',
      'am': 'በማንነት ተደብቆ ሪፖርት በማድረግ ላይ',
      'om': 'Waan dhoksaadhaan gabaachaa jira',
      'ti': 'ብዘይ መለለዪ እናሪፖርት',
    },
    'signInForReports': {
      'en': 'Sign in to see your reports',
      'am': 'ሪፖርቶችዎን ለማየት ይግቡ',
      'om': 'Gabaasa kee argachuuf seeni',
      'ti': 'ሪፖርታትካ ንምርኣይ እቶ',
    },
    'guestReportsSub': {
      'en': 'Anonymous reports can be tracked with your case ID',
      'am': 'የማይታወቁ ሪፖርቶች በኬዝ መለያዎ መከታተል ይችላሉ',
      'om': 'Gabaasni dhokataan koodii keessiin hordofuu ni dandeessaa',
      'ti': 'ስሙይ-ዘይብ ሪፖርታት ብናይ ጉዳይ IDኻ ክትትል ትኽእል',
    },
    'signInForNotifications': {
      'en': 'Sign in to get updates',
      'am': 'ዝማኔዎችን ለማግኘት ይግቡ',
      'om': 'Oduu argachuuf seeni',
      'ti': 'ዝርዝራት ንምርካብ እቶ',
    },
    'guestNotificationsSub': {
      'en': 'Updates about your reports will appear here after signing in',
      'am': 'ከመግባትዎ በኋላ ስለ ሪፖርቶችዎ ዝማኔዎች እዚህ ይታያሉ',
      'om': 'Erga seenitan booda oduun gabaasa kee asitti mul\'ata',
      'ti': 'ስለ ሪፖርታትካ ዝምጽኡ ዝርዝራት ድሕሪ ምእታው ኣብዚ ክርአዩ',
    },
    'endSession': {
      'en': 'End session',
      'am': 'ክፍለ ጊዜ ጨርስ',
      'om': 'Sima xumuri',
      'ti': 'ክፍለ-ግዜ ደምዝም',
    },
    'endSessionConfirm': {
      'en':
          'You are in anonymous (guest) mode. Ending the session will return you to the welcome screen.',
      'am':
          'በማንነት ተደብቆ (እንግዳ) ሁነታ ላይ ነዎት። ክፍለ ጊዜውን ማጠናቀቅ ወደ እንኳን ደህና መጡ ማያ ገጽ ይመልስዎታል።',
      'om':
          'Haala dhoksaa (keessummaa) keessa jirtu. Xumuruun simaa gara fuulduraa nama si deebisa.',
      'ti': 'ኣብ ስሙይ-ዘይብ (እንግዳ) ስርዓት ኢኻ። ክፍለ-ግዜ ምድማዝ ናብ እንቋዕ ተመላስካ ገጽ ክመልስካ እዩ።',
    },
    'newHere': {
      'en': 'New here?',
      'am': 'አዲስ ነዎት?',
      'om': 'Haaraa?',
      'ti': 'ሓድሽ ኢኻ?',
    },
    'createAccount': {
      'en': 'Create an account',
      'am': 'መለያ ይፍጠሩ',
      'om': 'Herrega Uumi',
      'ti': 'ሕሳብ ፍጠር',
    },
    'registerSub': {
      'en': 'Register as a citizen of the Peace & Security system.',
      'am': 'በሰላም እና ደህንነት ስርዓት ውስጥ እንደ ዜጋ ይመዝገቡ።',
      'om': 'Sistimii Nagaa fi Tasgabbii keessatti lammii ta\'uun galmaa\'i.',
      'ti': 'ጀምር',
    },
    'fullName': {
      'en': 'Full name',
      'am': 'ሙሉ ስም',
      'om': 'Maqaa Guutuu',
      'ti': 'ምሉእ ስም',
    },
    'confirmPin': {
      'en': 'Confirm PIN',
      'am': 'ፒን ያረጋግጡ',
      'om': 'PIIN\'ii Mirkaneessi',
      'ti': 'PIN ኣረጋግጽ',
    },
    'register': {
      'en': 'Register',
      'am': 'ይመዝገቡ',
      'om': 'Galmaa\'i',
      'ti': 'ተመዝገብ',
    },
    'alreadyHaveAccount': {
      'en': 'Already have an account?',
      'am': 'መለያ አለዎት?',
      'om': 'Herrega qabduu?',
      'ti': 'ደኣ ሕሳብ ኣለካ?',
    },
    'verifyPhone': {
      'en': 'Verify Phone',
      'am': 'ስልክ ያረጋግጡ',
      'om': 'Bilbila Mirkaneessi',
      'ti': 'ስልኪ ኣረጋግጽ',
    },
    'verifySub': {
      'en': 'Enter the verification code sent to {phone}.',
      'am': 'ወደ {phone} የተላከውን የማረጋገጫ ኮድ ያስገቡ።',
      'om': 'Koodii mirkaneessaa gara {phone} ergame galchi.',
      'ti': 'ምሉእ ስም',
    },
    'devCodeHint': {
      'en':
          'For local development, the code is printed in the backend console.',
      'am': 'ለአካባቢያዊ ልማት፣ ኮዱ በባክኤንድ ኮንሶል ውስጥ ይታተማል።',
      'om':
          'Misooma naannootiif, koodiin console backend keessatti maxxanfama.',
      'ti': 'ንልምዓት ልማት፣ ኮድ ኣብ ኮንሶል ድሕረ-ባይታ ይትሓተም።',
    },
    'verificationCode': {
      'en': 'Verification code',
      'am': 'የማረጋገጫ ኮድ',
      'om': 'Koodii Mirkaneessaa',
      'ti': 'ናይ ምርግጋጽ ኮድ',
    },
    'verifyContinue': {
      'en': 'Verify & Continue',
      'am': 'አረጋግጥ እና ቀጥል',
      'om': 'Mirkaneessi & Itti Fufi',
      'ti': 'ኣረጋግጽን ቀጽልን',
    },
    'resendCode': {
      'en': 'Resend code',
      'am': 'ኮድ እንደገና ይላኩ',
      'om': 'Koodii Deebisii Ergi',
      'ti': 'ኮድ እደግም',
    },
    'verifyHint': {
      'en':
          'After verification your account is activated and you will be logged in with the PIN you chose.',
      'am': 'ከማረጋገጥ በኋላ መለያዎ ይነቃል እና በመረጡት ፒን ይገባሉ።',
      'om':
          'Mirkaneessa booda herregan kee ni banama; PIIN\'ii filatteen seenita.',
      'ti': 'ድሕሪ ምርግጋጽ ሕሳብካ ይንቀሳቐስ ከምኡ\'ውን በቲ ዝመረጽካዮ PIN ክትእቶ ኢኻ።',
    },
    'incidentType': {
      'en': 'Incident Type',
      'am': 'የአደጋ ዓይነት',
      'om': 'Gosa Dhimmaa',
      'ti': 'ዓይነት ፍጻመ',
    },
    'description': {
      'en': 'Description',
      'am': 'መግለጫ',
      'om': 'Ibsa',
      'ti': 'መግለጺ',
    },
    'currentLocation': {
      'en': 'Current Location',
      'am': 'የአሁኑ ቦታ',
      'om': 'Bakka Ammaa',
      'ti': 'ህሉው ቦታ',
    },
    'change': {'en': 'Change', 'am': 'ቀይር', 'om': 'Jijjiiri', 'ti': 'ለውጥ'},
    'reportAnonymously': {
      'en': 'Report anonymously',
      'am': 'በማንነት ሳይገለጽ ዘግብ',
      'om': 'Maqaa malee Gabaagi',
      'ti': 'ብስሙይ-ዘይብ ሪፖርት ግበር',
    },
    'anonymousSub': {
      'en': "Your name won't be visible to others",
      'am': 'ስምዎ ለሌሎች አይታይም',
      'om': 'Maqaan kee warra biroof hin mul\'atu',
      'ti': 'ስሙይካ ምስ ሪፖርትካ ኣይክረኣይ እዩ',
    },
    'submitReport': {
      'en': 'Submit Report',
      'am': 'ሪፖርት አስገባ',
      'om': 'Gabaasa Dhiyeessi',
      'ti': 'ሪፖርት ስደድ',
    },
    'submitEmergency': {
      'en': 'Submit Emergency Report',
      'am': 'የድንገተኛ ሪፖርት አስገባ',
      'om': 'Gabaasa Dhibbataa Dhiyeessi',
      'ti': 'ህጹጽ ሪፖርት ስደድ',
    },
    'emergencyMode': {
      'en': 'Emergency Mode',
      'am': 'የድንገተኛ ሁኔታ',
      'om': 'Haala Dhibbataa',
      'ti': 'ህጹጽ ስርዓት',
    },
    'minor': {'en': 'Minor', 'am': 'ቀላል', 'om': 'Xixiqqaa', 'ti': 'ትሑት'},
    'moderate': {
      'en': 'Moderate',
      'am': 'መካከለኛ',
      'om': 'Giddugaleessa',
      'ti': 'ማእከላይ',
    },
    'severe': {'en': 'Severe', 'am': 'ከባድ', 'om': 'Cimaa', 'ti': 'ከቢድ'},
    'photos': {
      'en': 'Photos ({n}/4)',
      'am': 'ፎቶዎች ({n}/4)',
      'om': 'Suuraa ({n}/4)',
      'ti': 'ፎቶታት ({n}/4)',
    },
    'video': {
      'en': '+ Video',
      'am': '+ ቪዲዮ',
      'om': '+ Viidiyoo',
      'ti': '+ ቪድዮ',
    },
    'videoAdded': {
      'en': 'Video Added',
      'am': 'ቪዲዮ ተጨምሯል',
      'om': 'Viidiyoon dabale',
      'ti': 'ቪድዮ ተወሲኹ',
    },
    'voice': {'en': '+ Voice', 'am': '+ ድምፅ', 'om': '+ Sagalee', 'ti': '+ ድምጺ'},
    'audioAdded': {
      'en': 'Audio Added',
      'am': 'ድምፅ ተጨምሯል',
      'om': 'Sagaleen dabale',
      'ti': 'ድምጺ ተወሲኹ',
    },
    'selectIncidentType': {
      'en': 'Please select an incident type',
      'am': 'እባክዎ የአደጋ ዓይነት ይምረጡ',
      'om': 'Maaloo gosa dhimmaa filadhu',
      'ti': 'በጃኻ ዓይነት ፍጻመ ምረጽ',
    },
    'describeWhatHappened': {
      'en': 'Please describe what happened (at least 5 characters)',
      'am': 'እባክዎ የሆነውን ይግለጹ (ቢያንስ 5 ቁምፊዎች)',
      'om': 'Maaloo waan ta\'e ibsi (xinnoodhaan 5 qubee)',
      'ti': 'ዓይነት ፍጻመ',
    },
    'reportSubmitted': {
      'en': 'Report Submitted!',
      'am': 'ሪፖርት ቀርቧል!',
      'om': 'Gabaasni Dhiyaate!',
      'ti': 'ሪፖርት ተላኢኹ!',
    },
    'reportSubmittedSub': {
      'en': 'Thank you for helping keep Addis Ababa safe.',
      'am': 'አዲስ አበባን ደህንነት ለመጠበቅ ስለረዱ እናመሰግናለን።',
      'om': 'Finfinnee nagaa taasisuuf gargaartaniif galatoomi.',
      'ti': 'ንኣዲስ ኣበባ ደሓን ንምግባር ስለ ዝሓገዝካ የቐንየለይ!',
    },
    'reportId': {
      'en': 'REPORT ID',
      'am': 'የሪፖርት መለያ',
      'om': 'Imaan Gabaasa',
      'ti': 'ናይ ሪፖርት ID',
    },
    'submittedOn': {
      'en': 'Submitted on {date}',
      'am': 'የቀረበበት ቀን {date}',
      'om': 'Guyyaa {date} dhiyaate',
      'ti': 'ኣብ {date} ተላኢኹ',
    },
    'assignedTo': {
      'en': 'Assigned to Bole Sub-City Security Unit',
      'am': 'ለቦሌ ንዑስ ከተማ የደህንነት ክፍል ተመድቧል',
      'om': 'Gara kutaa tasgabbii Bole aanaatti ramadame',
      'ti': 'ናት ክፍሊ ድሕንነት ዞባ ተመዲቡ',
    },
    'shareReport': {
      'en': 'Share Report',
      'am': 'ሪፖርት አጋራ',
      'om': 'Gabaasa Qoodi',
      'ti': 'ሪፖርት ኣካፍል',
    },
    'viewOnMap': {
      'en': 'View on Map',
      'am': 'በካርታ ይመልከቱ',
      'om': 'Maapiirratti Ilaali',
      'ti': 'ኣብ ካርታ ርኣይ',
    },
    'returnHome': {
      'en': 'Return to Home',
      'am': 'ወደ መነሻ ይመለሱ',
      'om': 'Gara Mana Deebi\'i',
      'ti': 'ናብ መበቆል ተመለስ',
    },
    'chatAboutReport': {
      'en': 'Chat about this report',
      'am': 'ስለዚህ ሪፖርት ይወያዩ',
      'om': 'Waa\'ee gabaasa kanaa haasa\'i',
      'ti': 'ብዛዕባ እዚ ሪፖርት ምይይጥ ኣብዕል',
    },
    'noConversations': {
      'en': 'No conversations yet',
      'am': 'እስካሁን ውይይቶች የሉም',
      'om': 'Haasa\'ii hin jiru',
      'ti': 'ገና ምይይጣታት የለን',
    },
    'noConversationsSub': {
      'en': 'Start chatting with the response team from any of your reports.',
      'am': 'ከማንኛውም ሪፖርትዎ ከምላሽ ቡድን ጋር መወያየት ይጀምሩ።',
      'om': 'Gabaasa kee kamiyyuu irraa garee deebii waliin haasa\'uu eegali.',
      'ti': 'ሪፖርት ተላኢኹ!',
    },
    'myReports': {
      'en': 'My Reports',
      'am': 'ሪፖርቶቼ',
      'om': 'Gabaasa Koo',
      'ti': 'ሪፖርታተይ',
    },
    'typeMessage': {
      'en': 'Type a message…',
      'am': 'መልዕክት ይጻፉ…',
      'om': 'Ergama barreessi…',
      'ti': 'መልእኽቲ ጽሓፍ…',
    },
    'loadingMessages': {
      'en': 'Loading messages…',
      'am': 'መልዕክቶች በመጫን ላይ…',
      'om': 'Ergama sochiiraa jira…',
      'ti': 'መልእኽትታት እናጸዓነ…',
    },
    'notifications': {
      'en': 'Notifications',
      'am': 'ማሳወቂያዎች',
      'om': 'Beeksisa',
      'ti': 'ዝርዝራት',
    },
    'markAllRead': {
      'en': 'Mark all read',
      'am': 'ሁሉንም እንደተነበቡ ምልክት ያድርጉ',
      'om': 'Hunda dubbifamootti akeeki',
      'ti': 'ኩሉ ከም ዝተነበበ ምልክት ግበር',
    },
    'noNotifications': {
      'en': 'No notifications',
      'am': 'ማሳወቂያዎች የሉም',
      'om': 'Beeksisni hin jiru',
      'ti': 'ዝርዝራት የለን',
    },
    'noNotificationsSub': {
      'en': 'Updates about your reports will appear here.',
      'am': 'ስለ ሪፖርቶችዎ ዝማኔዎች እዚህ ይታያሉ።',
      'om': 'Odeeffannoon gabaasa kee asitti mul\'ata.',
      'ti': 'ስለ ሪፖርታትካ ዝምጽኡ ዝርዝራት ኣብዚ ክርአዩ።',
    },
    'settings': {
      'en': 'Settings',
      'am': 'ቅንብሮች',
      'om': 'Qindeessa',
      'ti': 'ቅጥባጣት',
    },
    'account': {'en': 'Account', 'am': 'መለያ', 'om': 'Herrega', 'ti': 'ሕሳብ'},
    'changePin': {
      'en': 'Change PIN',
      'am': 'ፒን ቀይር',
      'om': 'PIIN\'ii Jijjiiri',
      'ti': 'PIN ለውጥ',
    },
    'logOut': {'en': 'Log out', 'am': 'ውጣ', 'om': 'Ba\'i', 'ti': 'ውጻእ'},
    'logOutConfirm': {
      'en': 'Are you sure you want to log out?',
      'am': 'መውጣት እርግጠኛ ነዎት?',
      'om': 'Ba\'uu mirkaneeffattee?',
      'ti': 'ብርግጽ ክትወጽእ ትደሊ?',
    },
    'trackCaseSub': {
      'en': 'Enter the case ID you received when submitting your report.',
      'am': 'ሪፖርትዎን ሲያስገቡ የተቀበሉትን የጉዳይ መለያ ያስገቡ።',
      'om': 'Imaan dhimma yeroo gabaasa dhiyeesitan argattan galchi.',
      'ti': 'ንመጻምዕካ ዝተረኽበ ናይ ጉዳይ ID ኣእቱ።',
    },
    'caseId': {
      'en': 'Case ID',
      'am': 'የጉዳይ መለያ',
      'om': 'Imaan Dhimma',
      'ti': 'ናይ ጉዳይ ID',
    },
    'submit': {'en': 'Submit', 'am': 'አስገባ', 'om': 'Dhiyeessi', 'ti': 'ኣእቱ'},
    'details': {'en': 'Details', 'am': 'ዝርዝሮች', 'om': 'Ibsa', 'ti': 'ዝርዝራት'},
    'address': {'en': 'Address', 'am': 'አድራሻ', 'om': 'Teessoo', 'ti': 'ኣድራሻ'},
    'area': {'en': 'Area', 'am': 'አካባቢ', 'om': 'Naannoo', 'ti': 'ዞባ'},
    'incident': {'en': 'Incident', 'am': 'አደጋ', 'om': 'Dhimma', 'ti': 'ፍጻመ'},
    'reported': {
      'en': 'Reported',
      'am': 'ተዘግቧል',
      'om': 'Gabaafame',
      'ti': 'ተጸቢሩ',
    },
    'anonymous': {
      'en': 'Anonymous',
      'am': 'ማንነት የማይገለጽ',
      'om': 'Maqaa-malee',
      'ti': 'ስሙይ-ዘይብ',
    },
    'yes': {'en': 'Yes', 'am': 'አዎ', 'om': 'Eeyyee', 'ti': 'እወ'},
    'no': {'en': 'No', 'am': 'አይ', 'om': 'Lakki', 'ti': 'ኣይፋል'},
    'ongoing': {
      'en': 'Ongoing',
      'am': 'በመካሄድ ላይ',
      'om': 'Itti fufaa',
      'ti': 'እናቐጸለ',
    },
    'noiseLevel': {
      'en': 'Noise level',
      'am': 'የድምፅ መጠን',
      'om': 'Sadarkaa Sagalee',
      'ti': 'ደረጃ ሃውቲ',
    },
    'peopleInvolved': {
      'en': 'People involved',
      'am': 'የተሳተፉ ሰዎች',
      'om': 'Namoonni Hirman',
      'ti': 'ዝተሳተፉ ሰባት',
    },
    'suspect': {
      'en': 'Suspect',
      'am': 'ተጠርጣሪ',
      'om': 'Shakkamaa',
      'ti': 'ተጠርጣሪ',
    },
    'victim': {'en': 'Victim', 'am': 'ተጎጂ', 'om': 'Miidhamaa', 'ti': 'ተጎዳኢ'},
    'witness': {'en': 'Witness', 'am': 'ምስክር', 'om': 'Ragaa', 'ti': 'ምስክር'},
    'noDetailsProvided': {
      'en': 'No additional details provided.',
      'am': 'ተጨማሪ ዝርዝሮች አልተሰጡም።',
      'om': 'Ibsa dabalataa hin kennamne.',
      'ti': 'ተወሳኺ ዝርዝራት ኣይተረኽቡን።',
    },
    'assignedPatrol': {
      'en': 'Assigned patrol',
      'am': 'የተመደበ ፖትሮል',
      'om': 'Poolisii Ramadame',
      'ti': 'ተመዲቡ ጠባቒ',
    },
    'patrolOfficer': {
      'en': 'Patrol officer',
      'am': 'የፖትሮል መኮንን',
      'om': 'Qondaala Poolisii',
      'ti': 'መኮንን ጥቕታ',
    },
    'timeline': {
      'en': 'Timeline',
      'am': 'የጊዜ መስመር',
      'om': 'Yeroo Tartiira',
      'ti': 'ሰሌዳ ግዜ',
    },
    'noTimeline': {
      'en': 'No timeline events yet.',
      'am': 'እስካሁን የጊዜ መስመር ክስተቶች የሉም።',
      'om': 'Tartiibni yeroo hin jiru.',
      'ti': 'ገና ናይ ግዜ መዝገብ የለን።',
    },
    'chats': {'en': 'Chats', 'am': 'ውይይቶች', 'om': 'Haasa\'ii', 'ti': 'ምይይጣታት'},
    'loading': {
      'en': 'Loading…',
      'am': 'በመጫን ላይ…',
      'om': 'Sochiiraa…',
      'ti': 'እናጸዓነ…',
    },
    'cancel': {'en': 'Cancel', 'am': 'ሰርዝ', 'om': 'Haqi', 'ti': 'ስረዝ'},
    'ok': {'en': 'OK', 'am': 'እሺ', 'om': 'Tole', 'ti': 'እሺ'},
    'noLocation': {
      'en': 'Location is required. Tap "Change" to update location.',
      'am': 'ቦታ ያስፈልጋል። ቦታን ለማዘመን "ቀይር" ይንኩ።',
      'om': 'Bakki barbaachisa. Bakka haaromsuuf "Jijjiiri" tuqi.',
      'ti': 'ቦታ ኣድላይ እዩ። ቦታ ንምዕባይ "ለውጥ" ጠዊቕ።',
    },
    'submitMessage': {
      'en': 'Submitting…',
      'am': 'በማስገባት ላይ…',
      'om': 'Dhiyeechaa…',
      'ti': 'እናላአኸ…',
    },
  };
}
