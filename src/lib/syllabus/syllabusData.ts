// Official RSSB Rajasthan CET (Graduation Level) — Complete Syllabus
// Source: RSMSSB / RSSB CET Graduation Level official notification
// Hierarchy: Subject -> Unit -> Topic

export type Difficulty = "आसान" | "मध्यम" | "कठिन";

export interface SubTopic { id: string; title: string; }
export interface Topic {
  id: string;
  title: string;
  estimatedMinutes: number;
  subTopics?: SubTopic[];
}
export interface Unit { id: string; title: string; topics: Topic[]; }
export interface Subject {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  color: string;
  units: Unit[];
}

const t = (id: string, title: string, minutes = 45): Topic => ({ id, title, estimatedMinutes: minutes });

export const SYLLABUS: Subject[] = [
  {
    id: "hist", name: "History, Art & Culture of Rajasthan", hindiName: "राजस्थान का इतिहास, कला व संस्कृति", icon: "Landmark", color: "accent",
    units: [
      { id: "hist-anc", title: "प्राचीन एवं मध्यकालीन इतिहास", topics: [
        t("hist-anc-1", "राजस्थान की प्रागैतिहासिक सभ्यताएँ — कालीबंगा, आहड़, गणेश्वर, बालाथल, बैराठ"),
        t("hist-anc-2", "8वीं से 18वीं शताब्दी तक के प्रमुख राजवंश — प्रतिहार, चौहान, गुहिल, राठौड़, कछवाहा"),
        t("hist-anc-3", "मेवाड़ का इतिहास — बप्पा रावल, रावल रतन सिंह, राणा कुम्भा, राणा सांगा"),
        t("hist-anc-4", "महाराणा प्रताप व हल्दीघाटी का युद्ध"),
        t("hist-anc-5", "मारवाड़ का इतिहास — राव जोधा, राव मालदेव, अमर सिंह राठौड़, वीर दुर्गादास"),
        t("hist-anc-6", "आमेर व जयपुर — सवाई जय सिंह, मानसिंह"),
        t("hist-anc-7", "बीकानेर, जैसलमेर व हाड़ौती के प्रमुख शासक"),
        t("hist-anc-8", "मुगल-राजपूत संबंध व संधियाँ"),
        t("hist-anc-9", "राजस्थान के प्रमुख युद्ध — तराइन, खानवा, सारंगपुर, दिवेर, गिंगोली"),
      ]},
      { id: "hist-mod", title: "आधुनिक इतिहास व एकीकरण", topics: [
        t("hist-mod-1", "1857 की क्रांति में राजस्थान का योगदान"),
        t("hist-mod-2", "प्रजामंडल आंदोलन — जयपुर, जोधपुर, बीकानेर, मेवाड़"),
        t("hist-mod-3", "किसान आंदोलन — बिजोलिया, बेगूं, मेवाड़ भील"),
        t("hist-mod-4", "जनजाति आंदोलन — भगत, एकी, मेव आंदोलन"),
        t("hist-mod-5", "राजस्थान के प्रमुख क्रांतिकारी व स्वतंत्रता सेनानी"),
        t("hist-mod-6", "राजस्थान का एकीकरण — सातों चरण (1948-1956)"),
      ]},
      { id: "hist-cult", title: "कला, संस्कृति, साहित्य व धरोहर", topics: [
        t("hist-cult-1", "राजस्थान के लोक देवता — पाबूजी, गोगाजी, तेजाजी, रामदेवजी, देवनारायणजी, मल्लिनाथजी"),
        t("hist-cult-2", "राजस्थान की लोक देवियाँ — करणी माता, जीण माता, शीला देवी, कैला देवी"),
        t("hist-cult-3", "प्रमुख संत — दादू, मीरा, रैदास, जांभोजी, जसनाथजी, हरिदास"),
        t("hist-cult-4", "लोक नृत्य — घूमर, गैर, कच्छी घोड़ी, तेरहताली, भवाई, चरी, अग्नि"),
        t("hist-cult-5", "शास्त्रीय व लोक संगीत — मांड, माण्डणा, वाद्ययंत्र (सारंगी, कामायचा, रावणहत्था)"),
        t("hist-cult-6", "राजस्थान के प्रमुख मेले व त्यौहार"),
        t("hist-cult-7", "चित्रकला की शैलियाँ — मेवाड़, मारवाड़, हाड़ौती, ढूँढाड़, किशनगढ़"),
        t("hist-cult-8", "हस्तशिल्प — ब्लू पॉटरी, बंधेज, लहरिया, मीनाकारी, थेवा, उस्ता कला"),
        t("hist-cult-9", "स्थापत्य कला — दुर्ग, महल, हवेलियाँ, छतरियाँ, स्तंभ"),
        t("hist-cult-10", "राजस्थानी भाषा व बोलियाँ — मारवाड़ी, मेवाड़ी, ढूँढाड़ी, हाड़ौती, मेवाती"),
        t("hist-cult-11", "राजस्थानी साहित्य व प्रमुख साहित्यकार"),
        t("hist-cult-12", "पारंपरिक वेशभूषा व आभूषण"),
        t("hist-cult-13", "राजस्थान के प्रमुख धार्मिक स्थल व मंदिर"),
      ]},
    ],
  },
  {
    id: "geo", name: "Geography of Rajasthan & India", hindiName: "राजस्थान व भारत का भूगोल", icon: "Globe2", color: "primary",
    units: [
      { id: "geo-raj", title: "राजस्थान का भूगोल", topics: [
        t("geo-raj-1", "स्थिति, विस्तार व भौगोलिक विभाजन"),
        t("geo-raj-2", "भौतिक विभाग — पश्चिमी रेगिस्तान, अरावली, पूर्वी मैदान, दक्षिण-पूर्वी पठार"),
        t("geo-raj-3", "जलवायु — तापमान, वर्षा, मानसून पैटर्न"),
        t("geo-raj-4", "अपवाह तंत्र — नदियाँ (चम्बल, बनास, लूणी, माही, साबरमती)"),
        t("geo-raj-5", "प्रमुख झीलें — मीठे व खारे पानी की"),
        t("geo-raj-6", "मिट्टियाँ व उनका वर्गीकरण"),
        t("geo-raj-7", "प्राकृतिक वनस्पति व वन"),
        t("geo-raj-8", "वन्य जीव अभयारण्य व राष्ट्रीय उद्यान"),
        t("geo-raj-9", "कृषि व प्रमुख फसलें (खरीफ/रबी/जायद)"),
        t("geo-raj-10", "पशुधन व डेयरी विकास"),
        t("geo-raj-11", "खनिज संसाधन — धात्विक व अधात्विक"),
        t("geo-raj-12", "ऊर्जा संसाधन — परंपरागत व गैर-परंपरागत"),
        t("geo-raj-13", "प्रमुख सिंचाई परियोजनाएँ व बहुउद्देशीय योजनाएँ"),
        t("geo-raj-14", "जनसंख्या — घनत्व, लिंगानुपात, साक्षरता (2011)"),
        t("geo-raj-15", "जनजातियाँ — भील, मीणा, गरासिया, सहरिया, डामोर"),
        t("geo-raj-16", "परिवहन — सड़क, रेल, वायु मार्ग"),
        t("geo-raj-17", "पर्यटन स्थल व सर्किट"),
      ]},
      { id: "geo-ind", title: "भारत का भूगोल", topics: [
        t("geo-ind-1", "भारत की भौतिक विशेषताएँ"),
        t("geo-ind-2", "प्रमुख नदियाँ व अपवाह प्रणाली"),
        t("geo-ind-3", "जलवायु व मानसून"),
        t("geo-ind-4", "मृदा व वनस्पति"),
        t("geo-ind-5", "कृषि व प्रमुख फसलें"),
        t("geo-ind-6", "प्रमुख उद्योग व औद्योगिक क्षेत्र"),
        t("geo-ind-7", "खनिज व ऊर्जा संसाधन"),
        t("geo-ind-8", "जनसंख्या व नगरीकरण"),
        t("geo-ind-9", "परिवहन व संचार"),
      ]},
      { id: "geo-world", title: "विश्व भूगोल (मूल)", topics: [
        t("geo-world-1", "सौरमंडल व पृथ्वी की गति"),
        t("geo-world-2", "अक्षांश, देशांतर व समय"),
        t("geo-world-3", "महाद्वीप, महासागर व प्रमुख पर्वत"),
        t("geo-world-4", "वायुमंडल व जलवायु प्रदेश"),
      ]},
    ],
  },
  {
    id: "poli", name: "Indian System of Governance & Rajasthan Polity", hindiName: "भारतीय शासन व्यवस्था व राजस्थान की राजव्यवस्था", icon: "Scale", color: "accent",
    units: [
      { id: "poli-const", title: "भारतीय संविधान", topics: [
        t("poli-const-1", "संविधान की प्रस्तावना, विशेषताएँ व स्रोत"),
        t("poli-const-2", "संविधान की अनुसूचियाँ व भाग"),
        t("poli-const-3", "मौलिक अधिकार व मौलिक कर्तव्य"),
        t("poli-const-4", "राज्य के नीति निदेशक तत्व"),
        t("poli-const-5", "संविधान संशोधन प्रक्रिया व प्रमुख संशोधन"),
      ]},
      { id: "poli-ind", title: "भारतीय शासन व्यवस्था", topics: [
        t("poli-ind-1", "राष्ट्रपति, उपराष्ट्रपति व प्रधानमंत्री"),
        t("poli-ind-2", "केंद्रीय मंत्रिपरिषद"),
        t("poli-ind-3", "संसद — लोकसभा व राज्यसभा"),
        t("poli-ind-4", "उच्चतम न्यायालय व उच्च न्यायालय"),
        t("poli-ind-5", "निर्वाचन आयोग व CAG"),
        t("poli-ind-6", "संघ लोक सेवा आयोग, वित्त आयोग"),
        t("poli-ind-7", "NITI आयोग, राष्ट्रीय मानवाधिकार आयोग"),
      ]},
      { id: "poli-raj", title: "राजस्थान की राजव्यवस्था", topics: [
        t("poli-raj-1", "राज्यपाल — नियुक्ति, शक्तियाँ"),
        t("poli-raj-2", "मुख्यमंत्री व राज्य मंत्रिपरिषद"),
        t("poli-raj-3", "राजस्थान विधानसभा — संरचना व कार्य"),
        t("poli-raj-4", "राजस्थान उच्च न्यायालय"),
        t("poli-raj-5", "राजस्थान लोक सेवा आयोग"),
        t("poli-raj-6", "राज्य निर्वाचन आयोग व सूचना आयोग"),
        t("poli-raj-7", "राज्य मानवाधिकार आयोग व महिला आयोग"),
        t("poli-raj-8", "पंचायती राज व्यवस्था — 73वाँ संशोधन"),
        t("poli-raj-9", "नगरीय स्वशासन — 74वाँ संशोधन"),
        t("poli-raj-10", "जिला प्रशासन व लोकायुक्त"),
      ]},
    ],
  },
  {
    id: "eco", name: "Economics of India & Rajasthan", hindiName: "भारत व राजस्थान की अर्थव्यवस्था", icon: "TrendingUp", color: "primary",
    units: [
      { id: "eco-ind", title: "भारतीय अर्थव्यवस्था", topics: [
        t("eco-ind-1", "बजट — केंद्रीय व राज्य बजट"),
        t("eco-ind-2", "राजकोषीय व मौद्रिक नीति"),
        t("eco-ind-3", "भारतीय रिज़र्व बैंक व बैंकिंग प्रणाली"),
        t("eco-ind-4", "मुद्रास्फीति, गरीबी व बेरोज़गारी"),
        t("eco-ind-5", "GST, कराधान व राजस्व"),
        t("eco-ind-6", "पंचवर्षीय योजनाएँ व नीति आयोग"),
        t("eco-ind-7", "प्रत्यक्ष व अप्रत्यक्ष विदेशी निवेश"),
        t("eco-ind-8", "आर्थिक सर्वेक्षण के मुख्य बिंदु"),
      ]},
      { id: "eco-raj", title: "राजस्थान की अर्थव्यवस्था", topics: [
        t("eco-raj-1", "राज्य GDP व प्रमुख क्षेत्र"),
        t("eco-raj-2", "कृषि, बागवानी व डेयरी"),
        t("eco-raj-3", "प्रमुख उद्योग व औद्योगिक नीति"),
        t("eco-raj-4", "MSME, हस्तशिल्प व कुटीर उद्योग"),
        t("eco-raj-5", "पर्यटन उद्योग व राजस्व"),
        t("eco-raj-6", "प्रमुख सरकारी योजनाएँ — किसान, महिला, युवा"),
        t("eco-raj-7", "सामाजिक कल्याण योजनाएँ — SC/ST/OBC"),
        t("eco-raj-8", "राज्य का बजट व वित्तीय स्थिति"),
      ]},
    ],
  },
  {
    id: "gs", name: "General Science", hindiName: "सामान्य विज्ञान", icon: "FlaskConical", color: "primary",
    units: [
      { id: "gs-phy", title: "भौतिक विज्ञान (Physics)", topics: [
        t("gs-phy-1", "मापन, गति व न्यूटन के नियम"),
        t("gs-phy-2", "गुरुत्वाकर्षण व घर्षण"),
        t("gs-phy-3", "कार्य, ऊर्जा व शक्ति"),
        t("gs-phy-4", "प्रकाश — परावर्तन, अपवर्तन, लेंस, दृष्टि दोष"),
        t("gs-phy-5", "विद्युत धारा व चुम्बकत्व"),
        t("gs-phy-6", "ऊष्मा व ऊष्मागतिकी"),
        t("gs-phy-7", "ध्वनि व तरंगें"),
        t("gs-phy-8", "आधुनिक भौतिकी — परमाणु, नाभिकीय ऊर्जा"),
      ]},
      { id: "gs-chem", title: "रसायन विज्ञान (Chemistry)", topics: [
        t("gs-chem-1", "परमाणु संरचना व आवर्त सारणी"),
        t("gs-chem-2", "रासायनिक बंधन व अभिक्रियाएँ"),
        t("gs-chem-3", "अम्ल, क्षार व लवण"),
        t("gs-chem-4", "धातु व अधातु"),
        t("gs-chem-5", "कार्बन व उसके यौगिक"),
        t("gs-chem-6", "दैनिक जीवन में रसायन — साबुन, प्लास्टिक, दवाइयाँ"),
      ]},
      { id: "gs-bio", title: "जीव विज्ञान (Biology)", topics: [
        t("gs-bio-1", "कोशिका — संरचना व कार्य"),
        t("gs-bio-2", "ऊतक व अंग तंत्र"),
        t("gs-bio-3", "पोषण, श्वसन व पाचन तंत्र"),
        t("gs-bio-4", "परिसंचरण, उत्सर्जन व तंत्रिका तंत्र"),
        t("gs-bio-5", "आनुवंशिकी व विकास"),
        t("gs-bio-6", "जैव-विविधता, पारिस्थितिकी व पर्यावरण"),
        t("gs-bio-7", "मानव रोग — संक्रामक व असंक्रामक"),
        t("gs-bio-8", "पौधों में जनन व फोटोसिंथेसिस"),
      ]},
      { id: "gs-tech", title: "विज्ञान व तकनीक", topics: [
        t("gs-tech-1", "अंतरिक्ष कार्यक्रम — ISRO व प्रमुख मिशन"),
        t("gs-tech-2", "रक्षा तकनीक व DRDO"),
        t("gs-tech-3", "नैनो तकनीक, जैव तकनीक, IT"),
        t("gs-tech-4", "पर्यावरणीय मुद्दे व सतत विकास"),
      ]},
    ],
  },
  {
    id: "reason", name: "Logical Reasoning & Mental Ability", hindiName: "तार्किक विवेचन व मानसिक योग्यता", icon: "Brain", color: "accent",
    units: [
      { id: "reason-verbal", title: "शाब्दिक व अशाब्दिक तर्क", topics: [
        t("reason-verbal-1", "सादृश्य (Analogy)"),
        t("reason-verbal-2", "श्रेणी व वर्गीकरण"),
        t("reason-verbal-3", "कोडिंग-डिकोडिंग"),
        t("reason-verbal-4", "रक्त संबंध"),
        t("reason-verbal-5", "दिशा ज्ञान"),
        t("reason-verbal-6", "क्रम व व्यवस्थापन (Seating Arrangement)"),
        t("reason-verbal-7", "न्याय निगमन (Syllogism)"),
        t("reason-verbal-8", "कथन व निष्कर्ष / तर्क"),
        t("reason-verbal-9", "आकृतियों की श्रेणी व वर्गीकरण"),
        t("reason-verbal-10", "दर्पण व जल प्रतिबिंब"),
        t("reason-verbal-11", "पासा, घन व घनाभ"),
        t("reason-verbal-12", "आकृति गणना"),
        t("reason-verbal-13", "वेन आरेख"),
        t("reason-verbal-14", "कैलेंडर व घड़ी"),
      ]},
      { id: "reason-math", title: "गणित (Mathematics)", topics: [
        t("reason-math-1", "संख्या पद्धति"),
        t("reason-math-2", "म.स. व ल.स."),
        t("reason-math-3", "प्रतिशत"),
        t("reason-math-4", "लाभ व हानि"),
        t("reason-math-5", "अनुपात व समानुपात"),
        t("reason-math-6", "औसत"),
        t("reason-math-7", "साझेदारी व मिश्रण"),
        t("reason-math-8", "समय व कार्य"),
        t("reason-math-9", "समय, चाल व दूरी"),
        t("reason-math-10", "नाव व धारा, रेलगाड़ी"),
        t("reason-math-11", "साधारण व चक्रवृद्धि ब्याज"),
        t("reason-math-12", "क्षेत्रमिति — 2D व 3D"),
        t("reason-math-13", "ज्यामिति — रेखा, कोण, त्रिभुज, वृत्त"),
        t("reason-math-14", "बीजगणित के मूल सूत्र"),
        t("reason-math-15", "सांख्यिकी — औसत, माध्यिका, बहुलक"),
        t("reason-math-16", "आँकड़ों की व्याख्या (Data Interpretation)"),
        t("reason-math-17", "प्रायिकता (Probability)"),
        t("reason-math-18", "क्रमचय व संचय"),
      ]},
    ],
  },
  {
    id: "eng", name: "General English", hindiName: "सामान्य अंग्रेजी", icon: "BookOpen", color: "primary",
    units: [
      { id: "eng-gram", title: "Grammar", topics: [
        t("eng-gram-1", "Tenses"),
        t("eng-gram-2", "Articles & Determiners"),
        t("eng-gram-3", "Prepositions"),
        t("eng-gram-4", "Conjunctions"),
        t("eng-gram-5", "Active & Passive Voice"),
        t("eng-gram-6", "Direct & Indirect Narration"),
        t("eng-gram-7", "Subject-Verb Agreement"),
        t("eng-gram-8", "Modals & Auxiliary Verbs"),
        t("eng-gram-9", "Transformation of Sentences"),
      ]},
      { id: "eng-voc", title: "Vocabulary & Usage", topics: [
        t("eng-voc-1", "Synonyms"),
        t("eng-voc-2", "Antonyms"),
        t("eng-voc-3", "One Word Substitution"),
        t("eng-voc-4", "Idioms & Phrases"),
        t("eng-voc-5", "Phrasal Verbs"),
        t("eng-voc-6", "Spelling Correction"),
        t("eng-voc-7", "Homophones & Confusable Words"),
      ]},
      { id: "eng-comp", title: "Comprehension & Composition", topics: [
        t("eng-comp-1", "Reading Comprehension (Unseen Passage)"),
        t("eng-comp-2", "Sentence Correction"),
        t("eng-comp-3", "Cloze Test"),
        t("eng-comp-4", "Para Jumbles"),
        t("eng-comp-5", "Letter & Notice Writing"),
      ]},
    ],
  },
  {
    id: "hin", name: "General Hindi", hindiName: "सामान्य हिन्दी", icon: "Languages", color: "accent",
    units: [
      { id: "hin-vyak", title: "व्याकरण", topics: [
        t("hin-vyak-1", "संधि व संधि विच्छेद"),
        t("hin-vyak-2", "समास"),
        t("hin-vyak-3", "उपसर्ग व प्रत्यय"),
        t("hin-vyak-4", "संज्ञा, सर्वनाम, विशेषण, क्रिया"),
        t("hin-vyak-5", "कारक व वचन"),
        t("hin-vyak-6", "काल — वर्तमान, भूत, भविष्यत्"),
        t("hin-vyak-7", "वाच्य परिवर्तन"),
        t("hin-vyak-8", "पर्यायवाची शब्द"),
        t("hin-vyak-9", "विलोम शब्द"),
        t("hin-vyak-10", "अनेकार्थी शब्द"),
        t("hin-vyak-11", "श्रुतिसम भिन्नार्थक शब्द"),
        t("hin-vyak-12", "वाक्यांश के लिए एक शब्द"),
        t("hin-vyak-13", "मुहावरे व लोकोक्तियाँ"),
        t("hin-vyak-14", "वाक्य शुद्धि"),
        t("hin-vyak-15", "वर्तनी शुद्धि"),
      ]},
      { id: "hin-rach", title: "शब्द रचना व प्रयोग", topics: [
        t("hin-rach-1", "पारिभाषिक शब्दावली — प्रशासनिक व कार्यालयी"),
        t("hin-rach-2", "अंग्रेजी शब्दों के हिन्दी समानार्थी"),
        t("hin-rach-3", "पत्र लेखन — औपचारिक व अनौपचारिक"),
        t("hin-rach-4", "संक्षेपण व पल्लवन"),
      ]},
    ],
  },
  {
    id: "comp", name: "Computer Knowledge", hindiName: "कंप्यूटर ज्ञान", icon: "Monitor", color: "primary",
    units: [
      { id: "comp-basic", title: "कंप्यूटर के मूल तत्व", topics: [
        t("comp-basic-1", "कंप्यूटर की विशेषताएँ व उपयोग"),
        t("comp-basic-2", "कंप्यूटर की पीढ़ियाँ व प्रकार"),
        t("comp-basic-3", "इनपुट व आउटपुट उपकरण"),
        t("comp-basic-4", "हार्डवेयर व सॉफ्टवेयर"),
        t("comp-basic-5", "मेमोरी — RAM, ROM, कैश, स्टोरेज"),
        t("comp-basic-6", "ऑपरेटिंग सिस्टम — Windows, Linux"),
        t("comp-basic-7", "फ़ाइल व फ़ोल्डर प्रबंधन"),
      ]},
      { id: "comp-app", title: "अनुप्रयोग व इंटरनेट", topics: [
        t("comp-app-1", "MS Word"),
        t("comp-app-2", "MS Excel"),
        t("comp-app-3", "MS PowerPoint"),
        t("comp-app-4", "इंटरनेट व वर्ल्ड वाइड वेब"),
        t("comp-app-5", "ईमेल व वेब ब्राउज़र"),
        t("comp-app-6", "साइबर सुरक्षा — वायरस, फ़ायरवॉल, पासवर्ड"),
        t("comp-app-7", "डिजिटल भुगतान — UPI, नेट बैंकिंग"),
        t("comp-app-8", "ई-गवर्नेंस व डिजिटल इंडिया"),
      ]},
    ],
  },
  {
    id: "ca", name: "Current Affairs", hindiName: "समसामयिकी", icon: "Newspaper", color: "accent",
    units: [
      { id: "ca-nat", title: "राष्ट्रीय व अंतर्राष्ट्रीय घटनाक्रम", topics: [
        t("ca-nat-1", "प्रमुख राष्ट्रीय घटनाएँ व योजनाएँ"),
        t("ca-nat-2", "अंतर्राष्ट्रीय संबंध व शिखर सम्मेलन"),
        t("ca-nat-3", "खेल — प्रमुख टूर्नामेंट व खिलाड़ी"),
        t("ca-nat-4", "पुरस्कार व सम्मान"),
        t("ca-nat-5", "विज्ञान व तकनीक समाचार"),
        t("ca-nat-6", "पर्यावरण व जलवायु समाचार"),
        t("ca-nat-7", "अर्थव्यवस्था व बैंकिंग समाचार"),
      ]},
      { id: "ca-raj", title: "राजस्थान समसामयिकी", topics: [
        t("ca-raj-1", "राज्य की नई योजनाएँ व नीतियाँ"),
        t("ca-raj-2", "नियुक्तियाँ व प्रशासनिक बदलाव"),
        t("ca-raj-3", "राजस्थान के प्रमुख आयोजन व मेले"),
        t("ca-raj-4", "राजस्थान से जुड़े खेल व खिलाड़ी"),
        t("ca-raj-5", "राज्य बजट के मुख्य बिंदु"),
      ]},
    ],
  },
  {
    id: "gk", name: "General Knowledge", hindiName: "सामान्य ज्ञान", icon: "Sparkles", color: "primary",
    units: [
      { id: "gk-mix", title: "विविध सामान्य ज्ञान", topics: [
        t("gk-mix-1", "पुस्तकें व लेखक"),
        t("gk-mix-2", "महत्वपूर्ण दिवस व तिथियाँ"),
        t("gk-mix-3", "अंतर्राष्ट्रीय संगठन व मुख्यालय"),
        t("gk-mix-4", "पुरस्कार व सम्मान"),
        t("gk-mix-5", "भारत व विश्व में प्रथम"),
        t("gk-mix-6", "प्रमुख आविष्कार व आविष्कारक"),
        t("gk-mix-7", "मुद्राएँ व राजधानियाँ"),
        t("gk-mix-8", "प्रमुख शोध संस्थान"),
        t("gk-mix-9", "संक्षिप्तीकरण (Abbreviations)"),
      ]},
    ],
  },
];

export interface TopicRef { subject: Subject; unit: Unit; topic: Topic; }

export function getAllTopics(): TopicRef[] {
  const out: TopicRef[] = [];
  for (const subject of SYLLABUS) {
    for (const unit of subject.units) {
      for (const topic of unit.topics) {
        out.push({ subject, unit, topic });
      }
    }
  }
  return out;
}

export function findSubject(id: string) { return SYLLABUS.find((s) => s.id === id); }
export function findUnit(subjectId: string, unitId: string) {
  return findSubject(subjectId)?.units.find((u) => u.id === unitId);
}
export function findTopic(topicId: string): TopicRef | undefined {
  return getAllTopics().find((r) => r.topic.id === topicId);
}

export const HINDI_QUOTES = [
  "सफलता उन्हीं को मिलती है जो कड़ी मेहनत करते हैं।",
  "आज का अभ्यास कल की सफलता है।",
  "छोटे-छोटे कदम भी बड़ी मंज़िल तक ले जाते हैं।",
  "मेहनत का कोई विकल्प नहीं है।",
  "हर दिन एक नई शुरुआत है — आगे बढ़ो।",
  "जो पढ़ता है वही आगे बढ़ता है।",
  "कठिन परिश्रम ही सबसे बड़ा शॉर्टकट है।",
  "अपने सपनों को कभी छोटा मत समझो।",
  "आत्मविश्वास ही सफलता की कुंजी है।",
  "जीत उसी की होती है जो हार नहीं मानता।",
  "पढ़ाई वो हथियार है जिससे आप दुनिया बदल सकते हैं।",
  "आज की मेहनत, कल का सुनहरा भविष्य।",
];
