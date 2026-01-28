import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Copy, Check, ChevronUp, ChevronDown, ArrowLeft, ArrowRight, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hadith {
  id: string;
  collection: string;
  book: string;
  hadithNumber: string;
  narrator: string;
  text: string;
  arabic?: string;
  grade: 'Sahih' | 'Hasan' | 'Da\'if' | 'Mawdu';
  reference: string;
  translation?: { [key: string]: string }; // For multilingual support
}

interface Translation {
  code: string;
  name: string;
  englishName: string;
}

// Available translations for Hadith
const availableTranslations: Translation[] = [
  { code: "en", name: "English", englishName: "English" },
  { code: "ar", name: "العربية", englishName: "Arabic" },
  { code: "ur", name: "اردو", englishName: "Urdu" },
  { code: "hi", name: "हिंदी", englishName: "Hindi" },
  { code: "bn", name: "বাংলা", englishName: "Bengali" },
  { code: "ml", name: "മലയാളം", englishName: "Malayalam" },
  { code: "fr", name: "Français", englishName: "French" },
  { code: "de", name: "Deutsch", englishName: "German" },
  { code: "es", name: "Español", englishName: "Spanish" },
  { code: "tr", name: "Türkçe", englishName: "Turkish" },
  { code: "id", name: "Bahasa Indonesia", englishName: "Indonesian" },
  { code: "ms", name: "Bahasa Melayu", englishName: "Malay" },
  { code: "fa", name: "فارسی", englishName: "Persian" },
  { code: "ru", name: "Русский", englishName: "Russian" },
  { code: "zh", name: "中文", englishName: "Chinese" },
  { code: "ja", name: "日本語", englishName: "Japanese" },
  { code: "ko", name: "한국어", englishName: "Korean" },
  { code: "th", name: "ไทย", englishName: "Thai" },
  { code: "vi", name: "Tiếng Việt", englishName: "Vietnamese" },
  { code: "sw", name: "Kiswahili", englishName: "Swahili" }
];

interface HadithSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertHadith?: (hadith: string) => void;
}

// Sample hadith data with multilingual support - In a real app, this would come from an API
const sampleHadiths: Hadith[] = [
  {
    id: "1",
    collection: "Sahih Bukhari",
    book: "Book of Faith",
    hadithNumber: "1",
    narrator: "Umar ibn al-Khattab",
    text: "I heard the Messenger of Allah (ﷺ) say: 'Actions are but by intention and every man shall have but that which he intended. Thus he whose migration was for Allah and His messenger, his migration was for Allah and His messenger, and he whose migration was to achieve some worldly benefit or to take some woman in marriage, his migration was for that for which he migrated.'",
    arabic: "عَنْ أَمِيرِ الْمُؤْمِنِينَ أَبِي حَفْصٍ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْت رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: إنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
    grade: "Sahih",
    reference: "Bukhari 1",
    translation: {
      "ur": "میں نے اللہ کے رسول ﷺ کو یہ کہتے سنا: 'اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔'",
      "hi": "मैंने अल्लाह के रसूल ﷺ को यह कहते सुना: 'कर्म केवल नीयत पर आधारित हैं और हर व्यक्ति को वही मिलेगा जिसकी उसने नीयत की।'",
      "ml": "അല്ലാഹുവിന്റെ റസൂൽ ﷺ പറയുന്നത് ഞാൻ കേട്ടു: 'പ്രവൃത്തികൾ നിയ്യത്തിനനുസരിച്ചാണ്, ഓരോ മനുഷ്യനും അവൻ ഉദ്ദേശിച്ചത് അനുസരിച്ച് കിട്ടും.'",
      "fr": "J'ai entendu le Messager d'Allah ﷺ dire: 'Les actions ne valent que par les intentions et chacun n'aura que ce qu'il a eu l'intention de faire.'",
      "de": "Ich hörte den Gesandten Allahs ﷺ sagen: 'Die Taten sind nur entsprechend den Absichten, und jedem Menschen wird nur das zuteil, was er beabsichtigt hat.'"
    }
  },
  {
    id: "2",
    collection: "Sahih Muslim",
    book: "Book of Faith",
    hadithNumber: "99",
    narrator: "Abu Huraira",
    text: "The Messenger of Allah (ﷺ) said: 'Islam is built upon five pillars: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing the prayer, paying the Zakat, making the pilgrimage to the House, and fasting in Ramadan.'",
    arabic: "عَنْ أَبِي عَبْدِ الرَّحْمَنِ عَبْدِ اللَّهِ بْنِ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُمَا قَالَ: سَمِعْت رَسُولَ اللَّهِ صلى الله عليه وسلم يَقُولُ: بُنِيَ الْإِسْلَامُ عَلَى خَمْسٍ",
    grade: "Sahih",
    reference: "Muslim 16",
    translation: {
      "ur": "اللہ کے رسول ﷺ نے فرمایا: 'اسلام پانچ ستونوں پر قائم ہے: اس بات کی گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد اللہ کے رسول ہیں، نماز قائم کرنا، زکوٰۃ دینا، حج کرنا اور رمضان کے روزے رکھنا۔'",
      "hi": "अल्लाह के रसूल ﷺ ने कहा: 'इस्लाम पांच स्तंभों पर आधारित है: इस बात की गवाही देना कि अल्लाह के अलावा कोई पूज्य नहीं और मुहम्मद अल्लाह के रसूल हैं, नमाज़ स्थापित करना, ज़कात देना, हज करना और रमज़ान के रोज़े रखना।'",
      "ml": "അല്ലാഹുവിന്റെ റസൂൽ ﷺ പറഞ്ഞു: 'ഇസ്‌ലാം അഞ്ച് സ്തംഭങ്ങളിൽ നിർമ്മിച്ചിരിക്കുന്നു: അല്ലാഹു അല്ലാതെ ആരാധ്യനില്ലെന്നും മുഹമ്മദ് അല്ലാഹുവിന്റെ റസൂൽ ആണെന്നും സാക്ഷ്യം പറയുക, നമസ്കാരം സ്ഥാപിക്കുക, സകാത്ത് നൽകുക, ഹജ്ജ് ചെയ്യുക, റമദാനിൽ നോമ്പ് നോൽക്കുക.'",
      "fr": "Le Messager d'Allah ﷺ a dit: 'L'Islam est bâti sur cinq piliers: témoigner qu'il n'y a de divinité digne d'adoration qu'Allah et que Muhammad est le Messager d'Allah, accomplir la prière, s'acquitter de la Zakat, faire le pèlerinage à la Maison et jeûner pendant le Ramadan.'",
      "de": "Der Gesandte Allahs ﷺ sagte: 'Der Islam ist auf fünf Säulen aufgebaut: zu bezeugen, dass es keine Gottheit gibt, die der Anbetung würdig ist, außer Allah, und dass Muhammad der Gesandte Allahs ist, das Gebet zu verrichten, die Zakat zu entrichten, die Pilgerfahrt zum Hause zu vollziehen und im Ramadan zu fasten.'"
    }
  },
  {
    id: "3",
    collection: "Sahih Bukhari",
    book: "Book of Knowledge",
    hadithNumber: "67",
    narrator: "Abu Musa",
    text: "The Prophet (ﷺ) said: 'The example of guidance and knowledge with which Allah has sent me is like abundant rain falling on the earth, some of which was fertile soil that absorbed rain water and brought forth vegetation and grass in abundance.'",
    arabic: "عَنْ أَبِي مُوسَى رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ النَّبِيُّ صلى الله عليه وسلم: مَثَلُ مَا بَعَثَنِي اللَّهُ بِهِ مِنْ الْهُدَى وَالْعِلْمِ",
    grade: "Sahih",
    reference: "Bukhari 79",
    translation: {
      "ur": "نبی ﷺ نے فرمایا: 'اس ہدایت اور علم کی مثال جو اللہ نے میرے ساتھ بھیجا ہے، اس بارش کی طرح ہے جو زمین پر برستی ہے۔'",
      "hi": "नबी ﷺ ने कहा: 'उस मार्गदर्शन और ज्ञान की मिसाल जो अल्लाह ने मेरे साथ भेजा है, उस बारिश की तरह है जो धरती पर बरसती है।'",
      "ml": "നബി ﷺ പറഞ്ഞു: 'അല്ലാഹു എന്നോടൊപ്പം അയച്ച മാർഗദർശനത്തിന്റെയും അറിവിന്റെയും ഉദാഹരണം ഭൂമിയിൽ പെയ്യുന്ന സമൃദ്ധമായ മഴ പോലെയാണ്।'",
      "fr": "Le Prophète ﷺ a dit: 'L'exemple de la guidance et de la connaissance avec lesquelles Allah m'a envoyé est comme une pluie abondante tombant sur la terre.'",
      "de": "Der Prophet ﷺ sagte: 'Das Beispiel der Rechtleitung und des Wissens, womit Allah mich gesandt hat, ist wie reichlicher Regen, der auf die Erde fällt.'"
    }
  },
  {
    id: "4",
    collection: "Sahih Muslim",
    book: "Book of Purification",
    hadithNumber: "223",
    narrator: "Abu Huraira",
    text: "The Messenger of Allah (ﷺ) said: 'When a Muslim, or a believer, washes his face (in the course of Wudu), every sin he contemplated with his eyes, will be washed away from his face along with water.'",
    arabic: "عَنْ أَبِي هُرَيْرَةَ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ: إِذَا تَوَضَّأَ الْعَبْدُ الْمُسْلِمُ أَوْ الْمُؤْمِنُ فَغَسَلَ وَجْهَهُ",
    grade: "Sahih",
    reference: "Muslim 244",
    translation: {
      "ur": "اللہ کے رسول ﷺ نے فرمایا: 'جب کوئی مسلمان یا مومن وضو کرتے وقت اپنا چہرہ دھوتا ہے تو اس کے چہرے سے پانی کے ساتھ ہر وہ گناہ دھل جاتا ہے جو اس نے آنکھوں سے دیکھا تھا۔'",
      "hi": "अल्लाह के रसूल ﷺ ने कहा: 'जब कोई मुसलमान या मोमिन वुज़ू करते समय अपना चेहरा धोता है तो उसके चेहरे से पानी के साथ हर वह गुनाह धुल जाता है जो उसने आंखों से देखा था।'",
      "ml": "അല്ലാഹുവിന്റെ റസൂൽ ﷺ പറഞ്ഞു: 'ഒരു മുസ്‌ലിം അല്ലെങ്കിൽ മുഅ്‌മിൻ വുദു ചെയ്യുമ്പോൾ മുഖം കഴുകുമ്പോൾ, കണ്ണുകൊണ്ട് കണ്ട എല്ലാ പാപങ്ങളും വെള്ളത്തോടൊപ്പം കഴുകിപ്പോകും।'",
      "fr": "Le Messager d'Allah ﷺ a dit: 'Quand un musulman ou un croyant fait ses ablutions et lave son visage, tous les péchés qu'il a contemplés avec ses yeux sont lavés de son visage avec l'eau.'",
      "de": "Der Gesandte Allahs ﷺ sagte: 'Wenn ein Muslim oder Gläubiger die Gebetswaschung verrichtet und sein Gesicht wäscht, wird jede Sünde, die er mit seinen Augen betrachtet hat, mit dem Wasser von seinem Gesicht weggewaschen.'"
    }
  },
  {
    id: "5",
    collection: "Sahih Bukhari",
    book: "Book of Prayer",
    hadithNumber: "528",
    narrator: "Anas ibn Malik",
    text: "The Prophet (ﷺ) said: 'Whoever prays like us and faces our Qibla and eats our slaughtered animals is a Muslim and is under Allah's and His Apostle's protection. So do not betray Allah by betraying those who are in His protection.'",
    arabic: "عَنْ أَنَسِ بْنِ مَالِكٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ النَّبِيُّ صلى الله عليه وسلم: مَنْ صَلَّى صَلَاتَنَا",
    grade: "Sahih",
    reference: "Bukhari 391",
    translation: {
      "ur": "نبی ﷺ نے فرمایا: 'جو ہماری طرح نماز پڑھے، ہمارے قبلے کی طرف رخ کرے اور ہمارے ذبح کیے گئے جانور کھائے، وہ مسلمان ہے۔'",
      "hi": "नबी ﷺ ने कहा: 'जो हमारी तरह नमाज़ पढ़े, हमारे क़िब्ले की तरफ़ मुंह करे और हमारे ज़बह किए गए जानवर खाए, वह मुसलमान है।'",
      "ml": "നബി ﷺ പറഞ്ഞു: 'നമ്മുടെ പോലെ നമസ്കാരം ചെയ്യുകയും നമ്മുടെ ഖിബ്‌ലയിലേക്ക് മുഖം തിരിക്കുകയും നമ്മുടെ അറുത്ത മൃഗങ്ങൾ ഭക്ഷിക്കുകയും ചെയ്യുന്നവൻ മുസ്‌ലിമാണ്।'",
      "fr": "Le Prophète ﷺ a dit: 'Celui qui prie comme nous, fait face à notre Qibla et mange nos animaux abattus est un musulman.'",
      "de": "Der Prophet ﷺ sagte: 'Wer wie wir betet, unsere Qibla wendet und unsere geschlachteten Tiere isst, ist ein Muslim.'"
    }
  },
  {
    id: "6",
    collection: "Sahih Muslim",
    book: "Book of Charity",
    hadithNumber: "1006",
    narrator: "Abu Huraira",
    text: "The Messenger of Allah (ﷺ) said: 'Charity does not decrease wealth, no one forgives another except that Allah increases his honor, and no one humbles himself for the sake of Allah except that Allah raises his status.'",
    arabic: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ",
    grade: "Sahih",
    reference: "Muslim 2588",
    translation: {
      "ur": "اللہ کے رسول ﷺ نے فرمایا: 'صدقہ مال کو کم نہیں کرتا، کوئی شخص معاف نہیں کرتا مگر اللہ اس کی عزت بڑھاتا ہے۔'",
      "hi": "अल्लाह के रसूल ﷺ ने कहा: 'दान धन को कम नहीं करता, कोई माफ़ नहीं करता सिवाय इसके कि अल्लाह उसकी इज़्ज़त बढ़ाता है।'",
      "ml": "അല്ലാഹുവിന്റെ റസൂൽ ﷺ പറഞ്ഞു: 'ദാനം സമ്പത്ത് കുറയ്ക്കുന്നില്ല, ആരെങ്കിലും ക്ഷമിക്കുമ്പോൾ അല്ലാഹു അവന്റെ മാന്യത വർദ്ധിപ്പിക്കുന്നു।'",
      "fr": "Le Messager d'Allah ﷺ a dit: 'La charité ne diminue pas la richesse, personne ne pardonne sans qu'Allah n'augmente son honneur.'",
      "de": "Der Gesandte Allahs ﷺ sagte: 'Wohltätigkeit verringert nicht den Reichtum, niemand vergibt, ohne dass Allah seine Ehre erhöht.'"
    }
  },
  {
    id: "7",
    collection: "Sahih Bukhari",
    book: "Book of Manners",
    hadithNumber: "273",
    narrator: "Abdullah ibn Amr",
    text: "The Prophet (ﷺ) said: 'A Muslim is the one who avoids harming Muslims with his tongue and hands. And a Muhajir (emigrant) is the one who gives up (abandons) all what Allah has forbidden.'",
    arabic: "عَنْ عَبْدِ اللَّهِ بْنِ عَمْرٍو رَضِيَ اللَّهُ عَنْهُمَا أَنَّ النَّبِيَّ صلى الله عليه وسلم قَالَ: الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
    grade: "Sahih",
    reference: "Bukhari 10",
    translation: {
      "ur": "نبی ﷺ نے فرمایا: 'مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔'",
      "hi": "नबी ﷺ ने कहा: 'मुसलमान वह है जिसकी ज़बान और हाथ से दूसरे मुसलमान सुरक्षित रहें।'",
      "ml": "നബി ﷺ പറഞ്ഞു: 'മുസ്‌ലിം എന്നത് അവന്റെ നാവിൽ നിന്നും കൈകളിൽ നിന്നും മറ്റ് മുസ്‌ലിംകൾ സുരക്ഷിതരായിരിക്കുന്നവനാണ്।'",
      "fr": "Le Prophète ﷺ a dit: 'Le musulman est celui dont les musulmans sont à l'abri de sa langue et de ses mains.'",
      "de": "Der Prophet ﷺ sagte: 'Ein Muslim ist derjenige, vor dessen Zunge und Händen die Muslime sicher sind.'"
    }
  },
  {
    id: "8",
    collection: "Sahih Muslim",
    book: "Book of Paradise",
    hadithNumber: "2822",
    narrator: "Abu Huraira",
    text: "The Messenger of Allah (ﷺ) said: 'Allah the Almighty said: I have prepared for My righteous servants what no eye has seen and no ear has heard, nor has it occurred to the human heart.'",
    arabic: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: قَالَ اللَّهُ: أَعْدَدْتُ لِعِبَادِي الصَّالِحِينَ مَا لَا عَيْنٌ رَأَتْ",
    grade: "Sahih",
    reference: "Muslim 2824",
    translation: {
      "ur": "اللہ کے رسول ﷺ نے فرمایا: 'اللہ تعالیٰ نے فرمایا: میں نے اپنے نیک بندوں کے لیے وہ چیز تیار کی ہے جسے کسی آنکھ نے نہیں دیکھا۔'",
      "hi": "अल्लाह के रसूल ﷺ ने कहा: 'अल्लाह तआला ने फ़रमाया: मैंने अपने नेक बंदों के लिए वह चीज़ तैयार की है जिसे किसी आंख ने नहीं देखा।'",
      "ml": "അല്ലാഹുവിന്റെ റസൂൽ ﷺ പറഞ്ഞു: 'അല്ലാഹു പറഞ്ഞു: എന്റെ നല്ല ദാസന്മാർക്കായി ഞാൻ തയ്യാറാക്കിയത് ഒരു കണ്ണും കണ്ടിട്ടില്ല।'",
      "fr": "Le Messager d'Allah ﷺ a dit: 'Allah le Tout-Puissant a dit: J'ai préparé pour Mes serviteurs vertueux ce qu'aucun œil n'a vu.'",
      "de": "Der Gesandte Allahs ﷺ sagte: 'Allah der Allmächtige sagte: Ich habe für Meine rechtschaffenen Diener vorbereitet, was kein Auge gesehen hat.'"
    }
  },
  {
    id: "9",
    collection: "Jami' at-Tirmidhi",
    book: "Book of Righteousness and Maintaining Good Relations",
    hadithNumber: "1924",
    narrator: "Abu Huraira",
    text: "The Messenger of Allah (ﷺ) said: 'The believer is not one who eats his fill while his neighbor goes hungry.'",
    arabic: "عَنْ أَبِي هُرَيْرَةَ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: لَيْسَ الْمُؤْمِنُ الَّذِي يَشْبَعُ وَجَارُهُ جَائِعٌ",
    grade: "Hasan",
    reference: "Tirmidhi 2369",
    translation: {
      "ur": "اللہ کے رسول ﷺ نے فرمایا: 'وہ مومن نہیں جو پیٹ بھر کر کھائے جبکہ اس کا پڑوسی بھوکا ہو۔'",
      "hi": "अल्लाह के रसूल ﷺ ने कहा: 'वह मोमिन नहीं जो पेट भर कर खाए जबकि उसका पड़ोसी भूखा हो।'",
      "ml": "അല്ലാഹുവിന്റെ റസൂൽ ﷺ പറഞ്ഞു: 'അവന്റെ അയൽക്കാരൻ വിശന്നിരിക്കുമ്പോൾ വയറു നിറച്ച് ഭക്ഷിക്കുന്നവൻ മുഅ്‌മിൻ അല്ല।'",
      "fr": "Le Messager d'Allah ﷺ a dit: 'Le croyant n'est pas celui qui mange à sa faim tandis que son voisin a faim.'",
      "de": "Der Gesandte Allahs ﷺ sagte: 'Der Gläubige ist nicht derjenige, der sich satt isst, während sein Nachbar hungrig ist.'"
    }
  },
  {
    id: "10",
    collection: "Sahih Bukhari",
    book: "Book of Fasting",
    hadithNumber: "1904",
    narrator: "Abu Huraira",
    text: "The Prophet (ﷺ) said: 'Whoever does not give up forged speech and evil actions, Allah is not in need of his leaving his food and drink (i.e. Allah will not accept his fasting.)'",
    arabic: "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ صلى الله عليه وسلم: مَنْ لَمْ يَدَعْ قَوْلَ الزُّورِ وَالْعَمَلَ بِهِ",
    grade: "Sahih",
    reference: "Bukhari 1903",
    translation: {
      "ur": "نبی ﷺ نے فرمایا: 'جو شخص جھوٹ بولنا اور برے کام نہیں چھوڑتا، اللہ کو اس کے کھانا پینا چھوڑنے کی ضرورت نہیں۔'",
      "hi": "नबी ﷺ ने कहा: 'जो व्यक्ति झूठ बोलना और बुरे काम नहीं छोड़ता, अल्लाह को उसके खाना-पीना छोड़ने की ज़रूरत नहीं।'",
      "ml": "നബി ﷺ പറഞ്ഞു: 'കള്ളം പറയുന്നതും തിന്മകൾ ചെയ്യുന്നതും ഉപേക്ഷിക്കാത്തവന്റെ ഭക്ഷണവും പാനീയവും ഉപേക്ഷിക്കുന്നതിൽ അല്ലാഹുവിന് ആവശ്യമില്ല।'",
      "fr": "Le Prophète ﷺ a dit: 'Celui qui n'abandonne pas les faux discours et les mauvaises actions, Allah n'a pas besoin qu'il abandonne sa nourriture et sa boisson.'",
      "de": "Der Prophet ﷺ sagte: 'Wer falsche Rede und schlechte Taten nicht aufgibt, Allah braucht nicht, dass er sein Essen und Trinken aufgibt.'"
    }
  }
];

const hadithCollections = [
  "All Collections",
  "Sahih Bukhari",
  "Sahih Muslim",
  "Sunan Abu Dawood",
  "Jami' at-Tirmidhi",
  "Sunan an-Nasa'i",
  "Sunan Ibn Majah"
];

export const HadithSearch = ({ isOpen, onClose, onInsertHadith }: HadithSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("All Collections");
  const [selectedTranslation, setSelectedTranslation] = useState("en");
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const { toast } = useToast();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          // Navigate through collection tabs
          {
            const currentIndex = hadithCollections.indexOf(selectedCollection);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : hadithCollections.length - 1;
            setSelectedCollection(hadithCollections[prevIndex]);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          // Navigate through collection tabs
          {
            const currentIdx = hadithCollections.indexOf(selectedCollection);
            const nextIndex = currentIdx < hadithCollections.length - 1 ? currentIdx + 1 : 0;
            setSelectedCollection(hadithCollections[nextIndex]);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (searchResults.length > 0) {
            setSelectedResultIndex(prev => 
              prev > 0 ? prev - 1 : searchResults.length - 1
            );
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (searchResults.length > 0) {
            setSelectedResultIndex(prev => 
              prev < searchResults.length - 1 ? prev + 1 : 0
            );
          }
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults.length > 0 && selectedResultIndex >= 0) {
            insertHadith(searchResults[selectedResultIndex]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'c':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (searchResults.length > 0 && selectedResultIndex >= 0) {
              copyHadith(searchResults[selectedResultIndex]);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, searchResults, selectedResultIndex, selectedCollection]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedResultIndex(0);
  }, [searchResults]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enhanced multilingual search - search in both English and Arabic text
    const filtered = sampleHadiths.filter(hadith => {
      const query = searchQuery.toLowerCase();
      
      // Search in English text, narrator, and book
      const matchesEnglish = 
        hadith.text.toLowerCase().includes(query) ||
        hadith.narrator.toLowerCase().includes(query) ||
        hadith.book.toLowerCase().includes(query) ||
        hadith.collection.toLowerCase().includes(query);
      
      // Search in Arabic text if available
      const matchesArabic = hadith.arabic ? 
        hadith.arabic.includes(searchQuery) || 
        hadith.arabic.includes(query) : false;
      
      // Search by common Arabic/English terms mapping
      const getArabicTerms = (englishTerm: string): string[] => {
        const termMap: { [key: string]: string[] } = {
          'prayer': ['صلاة', 'صلى', 'يصلي', 'الصلاة'],
          'salah': ['صلاة', 'صلى', 'يصلي', 'الصلاة'],
          'fasting': ['صوم', 'صيام', 'يصوم', 'الصوم'],
          'ramadan': ['رمضان'],
          'charity': ['صدقة', 'زكاة', 'الصدقة', 'الزكاة'],
          'zakat': ['زكاة', 'الزكاة'],
          'hajj': ['حج', 'الحج'],
          'pilgrimage': ['حج', 'الحج'],
          'faith': ['إيمان', 'الإيمان', 'مؤمن'],
          'iman': ['إيمان', 'الإيمان', 'مؤمن'],
          'islam': ['إسلام', 'الإسلام', 'مسلم'],
          'muslim': ['مسلم', 'المسلم', 'مسلمون'],
          'allah': ['الله', 'اللَّه'],
          'prophet': ['نبي', 'النبي', 'رسول', 'الرسول'],
          'muhammad': ['محمد', 'النبي', 'الرسول'],
          'quran': ['قرآن', 'القرآن'],
          'knowledge': ['علم', 'العلم', 'يعلم'],
          'paradise': ['جنة', 'الجنة'],
          'hell': ['نار', 'النار', 'جهنم'],
          'forgiveness': ['مغفرة', 'المغفرة', 'يغفر'],
          'mercy': ['رحمة', 'الرحمة', 'رحيم'],
          'guidance': ['هداية', 'الهداية', 'هدى'],
          'intention': ['نية', 'النية', 'نوى'],
          'niyyah': ['نية', 'النية', 'نوى'],
          'worship': ['عبادة', 'العبادة', 'يعبد'],
          'dua': ['دعاء', 'الدعاء', 'يدعو'],
          'supplication': ['دعاء', 'الدعاء', 'يدعو']
        };
        return termMap[englishTerm] || [];
      };
      
      // Check if search query matches any Arabic terms
      let matchesTermMapping = false;
      const termMapEntries = Object.entries({
        'prayer': ['صلاة', 'صلى', 'يصلي', 'الصلاة'],
        'salah': ['صلاة', 'صلى', 'يصلي', 'الصلاة'],
        'fasting': ['صوم', 'صيام', 'يصوم', 'الصوم'],
        'ramadan': ['رمضان'],
        'charity': ['صدقة', 'زكاة', 'الصدقة', 'الزكاة'],
        'zakat': ['زكاة', 'الزكاة'],
        'hajj': ['حج', 'الحج'],
        'pilgrimage': ['حج', 'الحج'],
        'faith': ['إيمان', 'الإيمان', 'مؤمن'],
        'iman': ['إيمان', 'الإيمان', 'مؤمن'],
        'islam': ['إسلام', 'الإسلام', 'مسلم'],
        'muslim': ['مسلم', 'المسلم', 'مسلمون'],
        'allah': ['الله', 'اللَّه'],
        'prophet': ['نبي', 'النبي', 'رسول', 'الرسول'],
        'muhammad': ['محمد', 'النبي', 'الرسول'],
        'quran': ['قرآن', 'القرآن'],
        'knowledge': ['علم', 'العلم', 'يعلم'],
        'paradise': ['جنة', 'الجنة'],
        'hell': ['نار', 'النار', 'جهنم'],
        'forgiveness': ['مغفرة', 'المغفرة', 'يغفر'],
        'mercy': ['رحمة', 'الرحمة', 'رحيم'],
        'guidance': ['هداية', 'الهداية', 'هدى'],
        'intention': ['نية', 'النية', 'نوى'],
        'niyyah': ['نية', 'النية', 'نوى'],
        'worship': ['عبادة', 'العبادة', 'يعبد'],
        'dua': ['دعاء', 'الدعاء', 'يدعو'],
        'supplication': ['دعاء', 'الدعاء', 'يدعو']
      });
      
      for (const [englishTerm, arabicTermsList] of termMapEntries) {
        if (query.includes(englishTerm)) {
          // If searching in English, also search for Arabic equivalents
          matchesTermMapping = arabicTermsList.some(arabicTerm => 
            hadith.arabic?.includes(arabicTerm) || 
            hadith.text.toLowerCase().includes(arabicTerm)
          );
          if (matchesTermMapping) break;
        } else if (arabicTermsList.some(term => searchQuery.includes(term))) {
          // If searching in Arabic, also search for English equivalents
          matchesTermMapping = hadith.text.toLowerCase().includes(englishTerm) ||
                              hadith.narrator.toLowerCase().includes(englishTerm) ||
                              hadith.book.toLowerCase().includes(englishTerm);
          if (matchesTermMapping) break;
        }
      }
      
      // Search by narrator names in both languages
      const narratorMappingEntries = Object.entries({
        'abu huraira': ['أبو هريرة', 'أبي هريرة'],
        'umar': ['عمر', 'عُمَر', 'الخطاب'],
        'ali': ['علي', 'عَلِي'],
        'aisha': ['عائشة', 'عَائِشَة'],
        'anas': ['أنس', 'أَنَس'],
        'abdullah': ['عبد الله', 'عَبْد اللَّه'],
        'abu bakr': ['أبو بكر', 'أبي بكر']
      });
      
      let matchesNarrator = false;
      for (const [englishName, arabicNamesList] of narratorMappingEntries) {
        if (query.includes(englishName)) {
          matchesNarrator = arabicNamesList.some(arabicName => 
            hadith.narrator.includes(arabicName) || hadith.arabic?.includes(arabicName)
          );
          if (matchesNarrator) break;
        } else if (arabicNamesList.some(name => searchQuery.includes(name))) {
          matchesNarrator = hadith.narrator.toLowerCase().includes(englishName);
          if (matchesNarrator) break;
        }
      }
      
      const matchesQuery = matchesEnglish || matchesArabic || matchesTermMapping || matchesNarrator;
      
      const matchesCollection = 
        selectedCollection === "All Collections" || 
        hadith.collection === selectedCollection;
      
      return matchesQuery && matchesCollection;
    });
    
    setSearchResults(filtered);
    setIsSearching(false);
  };

  const copyHadith = async (hadith: Hadith) => {
    const translatedText = getTranslatedText(hadith);
    const hadithText = `${translatedText}\n\nNarrator: ${hadith.narrator}\nReference: ${hadith.reference}\nGrade: ${hadith.grade}`;
    
    try {
      await navigator.clipboard.writeText(hadithText);
      setCopiedId(hadith.id);
      setTimeout(() => setCopiedId(null), 2000);
      
      toast({
        title: "Hadith Copied",
        description: "The hadith has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy hadith to clipboard.",
        variant: "destructive",
      });
    }
  };

  const insertHadith = (hadith: Hadith) => {
    const translatedText = getTranslatedText(hadith);
    
    // Get the selected translation info
    const selectedTranslationInfo = availableTranslations.find(t => t.code === selectedTranslation);
    const translationLanguage = selectedTranslationInfo?.code || 'en';
    const translationName = selectedTranslationInfo?.englishName || 'English';
    
    // Create language-specific instruction for the AI
    let languageInstruction = '';
    if (translationLanguage !== 'en') {
      languageInstruction = `\n\n[Please respond in ${translationName} language since the user selected ${translationName} translation]`;
    }
    
    const hadithText = `Here's a relevant hadith:\n\n"${translatedText}"\n\nNarrator: ${hadith.narrator}\nReference: ${hadith.reference}\nGrade: ${hadith.grade}${languageInstruction}`;
    onInsertHadith?.(hadithText);
    onClose();
  };

  // Get translated text based on selected language
  const getTranslatedText = (hadith: Hadith): string => {
    if (selectedTranslation === "ar" && hadith.arabic) {
      return hadith.arabic;
    } else if (selectedTranslation === "en") {
      return hadith.text;
    } else if (hadith.translation && hadith.translation[selectedTranslation]) {
      return hadith.translation[selectedTranslation];
    } else {
      // Fallback to English if translation not available
      return hadith.text;
    }
  };

  const getGradeBadgeVariant = (grade: string) => {
    switch (grade) {
      case 'Sahih': return 'default';
      case 'Hasan': return 'secondary';
      case 'Da\'if': return 'outline';
      case 'Mawdu': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Hadith Search
            <div className="ml-auto text-xs text-muted-foreground">
              {/* Navigation instructions removed */}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Controls */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search hadiths in Arabic or English (e.g., صلاة, prayer, أبو هريرة, Abu Huraira)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full rounded-2xl"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/* Collection Filter with Arrow Navigation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft className="w-3 h-3" />
              <span>{/* Arrow navigation instruction removed */}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <Tabs value={selectedCollection} onValueChange={setSelectedCollection}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                {hadithCollections.map((collection, index) => (
                  <TabsTrigger 
                    key={collection} 
                    value={collection}
                    className={`text-xs flex items-center gap-1 ${
                      selectedCollection === collection ? "bg-gradient-emerald" : ""
                    }`}
                  >
                    {index === 0 && <ArrowLeft className="w-2 h-2" />}
                    {collection.replace("All Collections", "All")}
                    {index === hadithCollections.length - 1 && <ArrowRight className="w-2 h-2" />}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Translation Language Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Translation:</span>
              </div>
              <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableTranslations.map((translation) => (
                    <SelectItem key={translation.code} value={translation.code}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{translation.englishName}</span>
                        <span className="text-xs text-muted-foreground">({translation.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Results */}
          <ScrollArea className="h-[60vh]">
            {searchResults.length === 0 && searchQuery ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isSearching ? "Searching hadiths..." : "No hadiths found matching your search."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or select a different collection.
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Search through authentic hadith collections in multiple languages
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter keywords in any language and select your preferred translation language above.
                </p>
                <div className="mt-4 text-xs text-center space-y-1">
                  <p>Keyboard shortcuts:</p>
                  <p>{/* Navigation instructions removed */}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((hadith, index) => (
                  <Card 
                    key={hadith.id} 
                    className={`border-l-4 border-l-emerald-500 transition-all duration-200 ${
                      index === selectedResultIndex
                        ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium flex items-center gap-2">
                            {hadith.collection} - {hadith.book}
                            {index === selectedResultIndex && (
                              <div className="flex items-center gap-1 text-xs">
                                <ChevronUp className="w-3 h-3" />
                                <ChevronDown className="w-3 h-3" />
                              </div>
                            )}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground mt-1">
                            Hadith #{hadith.hadithNumber} • Narrator: {hadith.narrator}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getGradeBadgeVariant(hadith.grade)}>
                            {hadith.grade}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Arabic Text - Always show if available */}
                      {hadith.arabic && selectedTranslation !== "ar" && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-right text-lg leading-relaxed font-arabic">
                            {hadith.arabic}
                          </p>
                        </div>
                      )}
                      
                      {/* Translated Text */}
                      <p className="text-sm leading-relaxed mb-4">
                        {getTranslatedText(hadith)}
                      </p>
                      
                      {/* Show language indicator if not English */}
                      {selectedTranslation !== "en" && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs">
                            {availableTranslations.find(t => t.code === selectedTranslation)?.englishName || "Translation"}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Reference */}
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Reference: {hadith.reference}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyHadith(hadith)}
                            className="text-xs"
                            title={index === selectedResultIndex ? "Press Ctrl+C" : "Copy hadith"}
                          >
                            {copiedId === hadith.id ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            {copiedId === hadith.id ? "Copied" : "Copy"}
                          </Button>
                          {onInsertHadith && (
                            <Button
                              variant={index === selectedResultIndex ? "default" : "outline"}
                              size="sm"
                              onClick={() => insertHadith(hadith)}
                              className="text-xs"
                            >
                              {index === selectedResultIndex ? "Press Enter" : "Insert"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {searchResults.length > 0 && (
                  <div className="text-center text-xs text-muted-foreground py-2">
                    {/* Navigation instructions removed */}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};