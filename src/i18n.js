export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' }
];

export const translations = {
  en: {
    // Nav
    'nav.overview': 'Overview',
    'nav.simulate': 'Simulate',
    'nav.network': 'PHC Network',
    'nav.results': 'Results',
    'nav.about': 'About',
    
    // Layout
    'layout.title': 'HealthRipple AI',
    'layout.subtitle': 'National Healthcare Resilience Simulator',
    'layout.region': 'Region',
    'layout.language': 'Language',
    
    // Common
    'common.allIndia': 'All India',
    'common.noData': 'No PHC data available for this region.',
    'common.totalPHCs': 'Total PHCs',
    'common.critical': 'Critical',
    'common.atRisk': 'At Risk',
    'common.stable': 'Stable',
    'common.capacity': 'Capacity',
    'common.medicines': 'Medicines',
    'common.staff': 'Staff',
    'common.patientsDay': 'Patients/day',
    
    // Overview
    'overview.networkTitle': '{region} PHC Network',
    
    // Simulate
    'simulate.title': 'What-If Simulation',
    'simulate.desc': 'Select a PHC, choose a disruption, and simulate how the impact cascades across the network.',
    'simulate.loadDemo': 'Load Demo Scenario',
    'simulate.step1': 'Select Disruption Type',
    'simulate.step2': 'Select Affected PHC',
    'simulate.step3': 'Configure Severity & Duration',
    'simulate.step4': 'Run Simulation',
    'simulate.disruption.medicine': 'Medicine Shortage',
    'simulate.disruption.closure': 'PHC Closure',
    'simulate.disruption.surge': 'Patient Demand Surge',
    'simulate.disruption.staff': 'Staff Shortage',
    'simulate.disruption.medicineDesc': 'A critical medicine runs out. Nearby PHCs absorb redistributed demand.',
    'simulate.disruption.closureDesc': 'A PHC shuts down. Its full patient load is redistributed across the network.',
    'simulate.disruption.surgeDesc': 'An outbreak or seasonal surge rapidly increases patient volumes.',
    'simulate.disruption.staffDesc': 'Key staff are unavailable, reducing practical capacity and creating overflow.',
    'simulate.runBtn': 'Run Simulation',
    'simulate.phcLabel': 'Primary Health Centre',
    'simulate.medLabel': 'Affected Medicine',
    'simulate.sevLabel': 'Disruption Severity',
    'simulate.durLabel': 'Duration',
    'simulate.choosePHC': '— Choose a PHC —',
    'simulate.chooseMed': '— Choose medicine —',
    'simulate.low': 'Low',
    'simulate.medium': 'Medium',
    'simulate.high': 'High',
    
    // Results
    'results.title': 'Simulation Results',
    'results.affectedPhcs': 'Affected PHCs',
    'results.patientsAffected': 'Patients Affected',
    'results.secondaryRisks': 'Secondary Risks',
    
    // Network
    'network.title': 'Primary Health Centres',
    'network.desc': 'Monitor live capacity and operational status across the network.',
    'network.search': 'Search PHCs by name, city, or district...',
    'network.filterAll': 'All Status',
    
    // AI Action Plan
    'ai.planTitle': 'AI Action Plan',
    'ai.summary': 'Situation Summary',
    'ai.primary': 'Primary Impact',
    'ai.secondary': 'Secondary Impact',
    'ai.actions': 'Recommended Actions',
    'ai.facilities': 'Priority Facilities',
    'ai.why': 'Why This Matters',
  },
  hi: {
    'nav.overview': 'अवलोकन',
    'nav.simulate': 'सिमुलेशन',
    'nav.network': 'पीएचसी नेटवर्क',
    'nav.results': 'परिणाम',
    'nav.about': 'हमारे बारे में',
    
    'layout.title': 'HealthRipple AI',
    'layout.subtitle': 'राष्ट्रीय स्वास्थ्य देखभाल लचीलापन सिम्युलेटर',
    'layout.region': 'क्षेत्र',
    'layout.language': 'भाषा',
    
    'common.allIndia': 'संपूर्ण भारत',
    'common.noData': 'इस क्षेत्र के लिए कोई पीएचसी डेटा उपलब्ध नहीं है।',
    'common.totalPHCs': 'कुल पीएचसी',
    'common.critical': 'गंभीर',
    'common.atRisk': 'जोखिम में',
    'common.stable': 'स्थिर',
    'common.capacity': 'क्षमता',
    'common.medicines': 'दवाइयां',
    'common.staff': 'कर्मचारी',
    'common.patientsDay': 'मरीज/दिन',
    
    'overview.networkTitle': '{region} पीएचसी नेटवर्क',
    
    'simulate.title': 'व्हाट-इफ सिमुलेशन',
    'simulate.desc': 'एक पीएचसी चुनें, बाधा चुनें, और देखें कि प्रभाव नेटवर्क में कैसे फैलता है।',
    'simulate.loadDemo': 'डेमो परिदृश्य लोड करें',
    'simulate.step1': 'बाधा का प्रकार चुनें',
    'simulate.step2': 'प्रभावित पीएचसी चुनें',
    'simulate.step3': 'गंभीरता और अवधि कॉन्फ़िगर करें',
    'simulate.step4': 'सिमुलेशन चलाएँ',
    'simulate.disruption.medicine': 'दवा की कमी',
    'simulate.disruption.closure': 'पीएचसी बंद',
    'simulate.disruption.surge': 'मरीजों की मांग में वृद्धि',
    'simulate.disruption.staff': 'कर्मचारियों की कमी',
    'simulate.disruption.medicineDesc': 'एक महत्वपूर्ण दवा खत्म हो जाती है।',
    'simulate.disruption.closureDesc': 'एक पीएचसी बंद हो जाती है।',
    'simulate.disruption.surgeDesc': 'प्रकोप या मौसमी वृद्धि।',
    'simulate.disruption.staffDesc': 'कर्मचारियों की अनुपलब्धता।',
    'simulate.runBtn': 'सिमुलेशन चलाएँ',
    'simulate.phcLabel': 'प्राथमिक स्वास्थ्य केंद्र',
    'simulate.medLabel': 'प्रभावित दवा',
    'simulate.sevLabel': 'बाधा की गंभीरता',
    'simulate.durLabel': 'अवधि',
    'simulate.choosePHC': '— एक पीएचसी चुनें —',
    'simulate.chooseMed': '— दवा चुनें —',
    'simulate.low': 'कम',
    'simulate.medium': 'मध्यम',
    'simulate.high': 'उच्च',
    
    'results.title': 'सिमुलेशन परिणाम',
    'results.affectedPhcs': 'प्रभावित पीएचसी',
    'results.patientsAffected': 'प्रभावित मरीज',
    'results.secondaryRisks': 'द्वितीयक जोखिम',
    
    'network.title': 'प्राथमिक स्वास्थ्य केंद्र',
    'network.desc': 'नेटवर्क में लाइव क्षमता की निगरानी करें।',
    'network.search': 'नाम या जिले से पीएचसी खोजें...',
    'network.filterAll': 'सभी स्थितियां',
  },
  mr: {
    'nav.overview': 'आढावा',
    'nav.simulate': 'सिम्युलेट',
    'nav.network': 'PHC नेटवर्क',
    'nav.results': 'निकाल',
    'nav.about': 'माहिती',
    
    'layout.title': 'HealthRipple AI',
    'layout.subtitle': 'राष्ट्रीय आरोग्य सेवा लवचिकता सिम्युलेटर',
    'layout.region': 'प्रदेश',
    'layout.language': 'भाषा',
    
    'common.allIndia': 'संपूर्ण भारत',
    'common.noData': 'या प्रदेशासाठी कोणताही PHC डेटा उपलब्ध नाही.',
    'common.totalPHCs': 'एकूण PHC',
    'common.critical': 'गंभीर',
    'common.atRisk': 'धोक्यात',
    'common.stable': 'स्थिर',
    'common.capacity': 'क्षमता',
    'common.medicines': 'औषधे',
    'common.staff': 'कर्मचारी',
    'common.patientsDay': 'रुग्ण/दिवस',
    
    'overview.networkTitle': '{region} PHC नेटवर्क',
    
    'simulate.title': 'व्हॉट-इफ सिम्युलेशन',
    'simulate.desc': 'एक PHC निवडा, व्यत्यय निवडा आणि परिणाम कसा पसरतो ते पहा.',
    'simulate.loadDemo': 'डेमो दृश्य लोड करा',
    'simulate.step1': 'व्यत्ययाचा प्रकार निवडा',
    'simulate.step2': 'प्रभावित PHC निवडा',
    'simulate.step3': 'तीव्रता आणि कालावधी कॉन्फिगर करा',
    'simulate.step4': 'सिम्युलेशन चालवा',
    'simulate.disruption.medicine': 'औषधांचा तुटवडा',
    'simulate.disruption.closure': 'PHC बंद',
    'simulate.disruption.surge': 'रुग्णांच्या मागणीत वाढ',
    'simulate.disruption.staff': 'कर्मचाऱ्यांचा तुटवडा',
    'simulate.disruption.medicineDesc': 'एक महत्त्वाचे औषध संपले.',
    'simulate.disruption.closureDesc': 'एक PHC बंद झाला.',
    'simulate.disruption.surgeDesc': 'रुग्णांची संख्या वेगाने वाढली.',
    'simulate.disruption.staffDesc': 'कर्मचारी उपलब्ध नाहीत.',
    'simulate.runBtn': 'सिम्युलेशन चालवा',
    'simulate.phcLabel': 'प्राथमिक आरोग्य केंद्र',
    'simulate.medLabel': 'प्रभावित औषध',
    'simulate.sevLabel': 'व्यत्ययाची तीव्रता',
    'simulate.durLabel': 'कालावधी',
    'simulate.choosePHC': '— PHC निवडा —',
    'simulate.chooseMed': '— औषध निवडा —',
    'simulate.low': 'कमी',
    'simulate.medium': 'मध्यम',
    'simulate.high': 'उच्च',
    
    'results.title': 'सिम्युलेशन निकाल',
    'results.affectedPhcs': 'प्रभावित PHC',
    'results.patientsAffected': 'प्रभावित रुग्ण',
    'results.secondaryRisks': 'दुय्यम धोके',
    
    'network.title': 'प्राथमिक आरोग्य केंद्रे',
    'network.desc': 'नेटवर्कवर थेट क्षमतेचे परीक्षण करा.',
    'network.search': 'नाव किंवा जिल्ह्यानुसार PHC शोधा...',
    'network.filterAll': 'सर्व स्थिती',
  },
  ta: {
    'nav.overview': 'கண்ணோட்டம்',
    'nav.simulate': 'உருவகப்படுத்து',
    'nav.network': 'PHC நெட்வொர்க்',
    'nav.results': 'முடிவுகள்',
    'nav.about': 'பற்றி',
    
    'layout.title': 'HealthRipple AI',
    'layout.subtitle': 'தேசிய சுகாதார பின்னடைவு சிமுலேட்டர்',
    'layout.region': 'பகுதி',
    'layout.language': 'மொழி',
    
    'common.allIndia': 'அகில இந்தியா',
    'common.noData': 'இந்த பகுதிக்கு PHC தரவு எதுவும் இல்லை.',
    'common.totalPHCs': 'மொத்த PHCகள்',
    'common.critical': 'முக்கியமான',
    'common.atRisk': 'ஆபத்தில்',
    'common.stable': 'நிலையான',
    'common.capacity': 'திறன்',
    'common.medicines': 'மருந்துகள்',
    'common.staff': 'பணியாளர்கள்',
    'common.patientsDay': 'நோயாளிகள்/நாள்',
    
    'overview.networkTitle': '{region} PHC நெட்வொர்க்',
    
    'simulate.title': 'என்ன-என்றால் உருவகப்படுத்துதல்',
    'simulate.desc': 'ஒரு PHC ஐத் தேர்வுசெய்க, ஒரு இடையூறைத் தேர்வுசெய்க, மற்றும் தாக்கம் எவ்வாறு பரவுகிறது என்பதை உருவகப்படுத்தவும்.',
    'simulate.loadDemo': 'டெமோ காட்சியை ஏற்றவும்',
    'simulate.step1': 'இடையூறு வகையைத் தேர்ந்தெடுக்கவும்',
    'simulate.step2': 'பாதிக்கப்பட்ட PHC ஐத் தேர்ந்தெடுக்கவும்',
    'simulate.step3': 'தீவிரம் மற்றும் கால அளவை உள்ளமைக்கவும்',
    'simulate.step4': 'உருவகப்படுத்தலை இயக்கவும்',
    'simulate.disruption.medicine': 'மருந்து தட்டுப்பாடு',
    'simulate.disruption.closure': 'PHC மூடப்படுதல்',
    'simulate.disruption.surge': 'நோயாளிகளின் தேவை அதிகரிப்பு',
    'simulate.disruption.staff': 'பணியாளர் பற்றாக்குறை',
    'simulate.disruption.medicineDesc': 'ஒரு முக்கியமான மருந்து தீர்ந்துவிடும்.',
    'simulate.disruption.closureDesc': 'ஒரு PHC மூடப்பட்டது.',
    'simulate.disruption.surgeDesc': 'நோயாளிகளின் அளவு வேகமாக அதிகரிக்கிறது.',
    'simulate.disruption.staffDesc': 'பணியாளர்கள் இல்லை.',
    'simulate.runBtn': 'உருவகப்படுத்தலை இயக்கவும்',
    'simulate.phcLabel': 'ஆரம்ப சுகாதார நிலையம்',
    'simulate.medLabel': 'பாதிக்கப்பட்ட மருந்து',
    'simulate.sevLabel': 'இடையூறு தீவிரம்',
    'simulate.durLabel': 'கால அளவு',
    'simulate.choosePHC': '— ஒரு PHC ஐத் தேர்வுசெய்க —',
    'simulate.chooseMed': '— மருந்தை தேர்வுசெய்க —',
    'simulate.low': 'குறைந்த',
    'simulate.medium': 'நடுத்தர',
    'simulate.high': 'உயர்',
    
    'results.title': 'உருவகப்படுத்துதல் முடிவுகள்',
    'results.affectedPhcs': 'பாதிக்கப்பட்ட PHCகள்',
    'results.patientsAffected': 'பாதிக்கப்பட்ட நோயாளிகள்',
    'results.secondaryRisks': 'இரண்டாம் நிலை அபாயங்கள்',
    
    'network.title': 'ஆரம்ப சுகாதார நிலையங்கள்',
    'network.desc': 'நெட்வொர்க் முழுவதும் நேரடி திறனைக் கண்காணிக்கவும்.',
    'network.search': 'பெயர் அல்லது மாவட்டத்தின் மூலம் தேடுங்கள்...',
    'network.filterAll': 'அனைத்து நிலை',
  }
};

export function getTranslation(lang, key, params = {}) {
  const dict = translations[lang] || translations['en'];
  let text = dict[key] || translations['en'][key] || key;
  
  // Replace params like {region}
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(new RegExp(`{${k}}`, 'g'), v);
  });
  
  return text;
}
