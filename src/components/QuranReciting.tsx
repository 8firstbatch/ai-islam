import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X, Play, Pause, Volume2, VolumeX, Loader2, SkipBack, SkipForward, Book } from "lucide-react";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  folder: string;
  bitrate: string;
}

interface Juz {
  number: number;
  name: string;
  startSurah: number;
  startVerse: number;
  endSurah: number;
  endVerse: number;
}

interface QuranRecitingProps {
  isOpen: boolean;
  onClose: () => void;
}

type RecitationType = "surah" | "juz";

// Available Quran reciters with everyayah.com compatible folder names
const availableReciters: Reciter[] = [
  { id: "alafasy", name: "Mishary Rashid Al-Afasy", arabicName: "مشاري راشد العفاسي", folder: "Alafasy_128kbps", bitrate: "128kbps" },
  { id: "husary", name: "Mahmoud Khalil Al-Husary", arabicName: "محمود خليل الحصري", folder: "Husary_128kbps", bitrate: "128kbps" },
  { id: "sudais", name: "Abdul Rahman Al-Sudais", arabicName: "عبد الرحمن السديس", folder: "Sudais_128kbps", bitrate: "128kbps" },
  { id: "shuraim", name: "Saud Al-Shuraim", arabicName: "سعود الشريم", folder: "Shuraim_128kbps", bitrate: "128kbps" },
  { id: "maher", name: "Maher Al-Muaiqly", arabicName: "ماهر المعيقلي", folder: "MaherAlMuaiqly128kbps", bitrate: "128kbps" },
  { id: "minshawi", name: "Mohamed Siddiq Al-Minshawi", arabicName: "محمد صديق المنشاوي", folder: "Minshawi_Murattal_128kbps", bitrate: "128kbps" },
  { id: "ajmi", name: "Ahmed ibn Ali Al-Ajmi", arabicName: "أحمد بن علي العجمي", folder: "Ajmi_128kbps", bitrate: "128kbps" },
  { id: "ghamdi", name: "Saad Al-Ghamdi", arabicName: "سعد الغامدي", folder: "Ghamdi_40kbps", bitrate: "40kbps" },
  { id: "basfar", name: "Abdullah Basfar", arabicName: "عبد الله بصفر", folder: "basfar", bitrate: "128kbps" },
  { id: "rifai", name: "Hani Ar-Rifai", arabicName: "هاني الرفاعي", folder: "Rifai_192kbps", bitrate: "192kbps" },
  { id: "shatri", name: "Abu Bakr Al-Shatri", arabicName: "أبو بكر الشاطري", folder: "Shatri_128kbps", bitrate: "128kbps" },
  { id: "tablawi", name: "Muhammad At-Tablawi", arabicName: "محمد الطبلاوي", folder: "Tablawi_128kbps", bitrate: "128kbps" },
  { id: "huthaify", name: "Ali Al-Huthaify", arabicName: "علي الحذيفي", folder: "Huthaify_128kbps", bitrate: "128kbps" },
  { id: "qasim", name: "AbdulMuhsin Al-Qasim", arabicName: "عبد المحسن القاسم", folder: "Qasim_192kbps", bitrate: "192kbps" },
  { id: "thubaity", name: "Ali Abdur-Rahman Ath-Thubaity", arabicName: "علي عبد الرحمن الثبيتي", folder: "Thubaity_128kbps", bitrate: "128kbps" },
];

// List of all 30 Juz (Para)
const juzList: Juz[] = [
  { number: 1, name: "Alif Lam Meem", startSurah: 1, startVerse: 1, endSurah: 2, endVerse: 141 },
  { number: 2, name: "Sayaqool", startSurah: 2, startVerse: 142, endSurah: 2, endVerse: 252 },
  { number: 3, name: "Tilkal Rusul", startSurah: 2, startVerse: 253, endSurah: 3, endVerse: 92 },
  { number: 4, name: "Lan Tanaloo", startSurah: 3, startVerse: 93, endSurah: 4, endVerse: 23 },
  { number: 5, name: "Wal Mohsanat", startSurah: 4, startVerse: 24, endSurah: 4, endVerse: 147 },
  { number: 6, name: "La Yuhibbullah", startSurah: 4, startVerse: 148, endSurah: 5, endVerse: 81 },
  { number: 7, name: "Wa Iza Samiu", startSurah: 5, startVerse: 82, endSurah: 6, endVerse: 110 },
  { number: 8, name: "Wa Lau Annana", startSurah: 6, startVerse: 111, endSurah: 7, endVerse: 87 },
  { number: 9, name: "Qalal Malao", startSurah: 7, startVerse: 88, endSurah: 8, endVerse: 40 },
  { number: 10, name: "Wa A'lamoo", startSurah: 8, startVerse: 41, endSurah: 9, endVerse: 92 },
  { number: 11, name: "Ya'tazeroon", startSurah: 9, startVerse: 93, endSurah: 11, endVerse: 5 },
  { number: 12, name: "Wa Ma Min Dabbah", startSurah: 11, startVerse: 6, endSurah: 12, endVerse: 52 },
  { number: 13, name: "Wa Ma Ubrioo", startSurah: 12, startVerse: 53, endSurah: 14, endVerse: 52 },
  { number: 14, name: "Rubama", startSurah: 15, startVerse: 1, endSurah: 16, endVerse: 128 },
  { number: 15, name: "Subhan Allazi", startSurah: 17, startVerse: 1, endSurah: 18, endVerse: 74 },
  { number: 16, name: "Qal Alam", startSurah: 18, startVerse: 75, endSurah: 20, endVerse: 135 },
  { number: 17, name: "Aqtarabo", startSurah: 21, startVerse: 1, endSurah: 22, endVerse: 78 },
  { number: 18, name: "Qad Aflaha", startSurah: 23, startVerse: 1, endSurah: 25, endVerse: 20 },
  { number: 19, name: "Wa Qalallazina", startSurah: 25, startVerse: 21, endSurah: 27, endVerse: 55 },
  { number: 20, name: "A'man Khalaq", startSurah: 27, startVerse: 56, endSurah: 29, endVerse: 45 },
  { number: 21, name: "Utlu Ma Oohi", startSurah: 29, startVerse: 46, endSurah: 33, endVerse: 30 },
  { number: 22, name: "Wa Man Yaqnut", startSurah: 33, startVerse: 31, endSurah: 36, endVerse: 27 },
  { number: 23, name: "Wa Maliya", startSurah: 36, startVerse: 28, endSurah: 39, endVerse: 31 },
  { number: 24, name: "Fa Man Azlam", startSurah: 39, startVerse: 32, endSurah: 41, endVerse: 46 },
  { number: 25, name: "Elahe Yuraddo", startSurah: 41, startVerse: 47, endSurah: 45, endVerse: 37 },
  { number: 26, name: "Ha'a Meem", startSurah: 46, startVerse: 1, endSurah: 51, endVerse: 30 },
  { number: 27, name: "Qala Fama Khatbukum", startSurah: 51, startVerse: 31, endSurah: 57, endVerse: 29 },
  { number: 28, name: "Qad Sami Allah", startSurah: 58, startVerse: 1, endSurah: 66, endVerse: 12 },
  { number: 29, name: "Tabarakallazi", startSurah: 67, startVerse: 1, endSurah: 77, endVerse: 50 },
  { number: 30, name: "Amma Yatasa'aloon", startSurah: 78, startVerse: 1, endSurah: 114, endVerse: 6 },
];

// List of all 114 Surahs
const surahs: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatihah", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, name: "آل عمران", englishName: "Ali 'Imran", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, name: "النساء", englishName: "An-Nisa", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, name: "يونس", englishName: "Yunus", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, name: "هود", englishName: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, name: "يوسف", englishName: "Yusuf", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, name: "النحل", englishName: "An-Nahl", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, name: "مريم", englishName: "Maryam", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, name: "طه", englishName: "Taha", numberOfAyahs: 135, revelationType: "Meccan" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbya", numberOfAyahs: 112, revelationType: "Meccan" },
  { number: 22, name: "الحج", englishName: "Al-Hajj", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun", numberOfAyahs: 118, revelationType: "Meccan" },
  { number: 24, name: "النور", englishName: "An-Nur", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, name: "النمل", englishName: "An-Naml", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, name: "القصص", englishName: "Al-Qasas", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, name: "الروم", englishName: "Ar-Rum", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, name: "لقمان", englishName: "Luqman", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, name: "سبأ", englishName: "Saba", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, name: "فاطر", englishName: "Fatir", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, name: "يس", englishName: "Ya-Sin", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, name: "الصافات", englishName: "As-Saffat", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, name: "ص", englishName: "Sad", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, name: "غافر", englishName: "Ghafir", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, name: "فصلت", englishName: "Fussilat", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, name: "الشورى", englishName: "Ash-Shuraa", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, name: "محمد", englishName: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, name: "الفتح", englishName: "Al-Fath", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, name: "ق", englishName: "Qaf", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, name: "الطور", englishName: "At-Tur", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, name: "النجم", englishName: "An-Najm", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, name: "القمر", englishName: "Al-Qamar", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadila", numberOfAyahs: 22, revelationType: "Medinan" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr", numberOfAyahs: 24, revelationType: "Medinan" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", numberOfAyahs: 13, revelationType: "Medinan" },
  { number: 61, name: "الصف", englishName: "As-Saff", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, name: "الملك", englishName: "Al-Mulk", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, name: "القلم", englishName: "Al-Qalam", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, name: "نوح", englishName: "Nuh", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, name: "الجن", englishName: "Al-Jinn", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, name: "الإنسان", englishName: "Al-Insan", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, name: "النبأ", englishName: "An-Naba", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, name: "عبس", englishName: "Abasa", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, name: "التكوير", englishName: "At-Takwir", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, name: "البروج", englishName: "Al-Buruj", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, name: "الطارق", englishName: "At-Tariq", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, name: "البلد", englishName: "Al-Balad", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, name: "الليل", englishName: "Al-Layl", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, name: "الضحى", englishName: "Ad-Duhaa", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, name: "التين", englishName: "At-Tin", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, name: "العلق", englishName: "Al-Alaq", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, name: "القدر", englishName: "Al-Qadr", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, name: "العصر", englishName: "Al-Asr", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, name: "الفيل", englishName: "Al-Fil", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, name: "قريش", englishName: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, name: "النصر", englishName: "An-Nasr", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, name: "المسد", englishName: "Al-Masad", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, name: "الناس", englishName: "An-Nas", numberOfAyahs: 6, revelationType: "Meccan" },
];
export const QuranReciting = ({ isOpen, onClose }: QuranRecitingProps) => {
  const [selectedReciter, setSelectedReciter] = useState("alafasy");
  const [recitationType, setRecitationType] = useState<RecitationType>("surah");
  const [selectedSurah, setSelectedSurah] = useState("1");
  const [selectedJuz, setSelectedJuz] = useState("1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef.current]);

  const playRecitation = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    const reciter = availableReciters.find(r => r.id === selectedReciter) || availableReciters[0];

    try {
      let audioSources: string[] = [];
      
      if (recitationType === "surah") {
        const surahNum = String(selectedSurah).padStart(3, "0");
        // Prioritize everyayah.com as the primary source
        audioSources = [
          `https://www.everyayah.com/data/${reciter.folder}/${surahNum}.mp3`,
          `https://everyayah.com/data/${reciter.folder}/${surahNum}.mp3`,
          `https://download.quranicaudio.com/quran/${reciter.folder}/${surahNum}.mp3`,
          `https://server8.mp3quran.net/afs/${reciter.folder}/${surahNum}.mp3`,
          `https://server6.mp3quran.net/qtm/${reciter.folder}/${surahNum}.mp3`,
        ];
      } else {
        // Juz recitation sources - everyayah.com first
        const juzNum = String(selectedJuz).padStart(2, "0");
        audioSources = [
          `https://www.everyayah.com/data/${reciter.folder}/Juz${juzNum}.mp3`,
          `https://everyayah.com/data/${reciter.folder}/Juz${juzNum}.mp3`,
          `https://download.quranicaudio.com/quran/${reciter.folder}/Para${String(selectedJuz).padStart(3, "0")}.mp3`,
          `https://server8.mp3quran.net/afs/${reciter.folder}/Para${String(selectedJuz).padStart(3, "0")}.mp3`,
          `https://server6.mp3quran.net/qtm/${reciter.folder}/Para${String(selectedJuz).padStart(3, "0")}.mp3`,
        ];
      }

      // Try each audio source until one works with improved error handling
      const tryAudioSource = async (sourceIndex: number): Promise<void> => {
        if (sourceIndex >= audioSources.length) {
          throw new Error("All audio sources failed");
        }

        const audioUrl = audioSources[sourceIndex];
        console.log(`Trying audio source ${sourceIndex + 1}/${audioSources.length}:`, audioUrl);

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        const audio = new Audio();
        audio.crossOrigin = "anonymous"; // Enable CORS
        audio.preload = "metadata";
        audio.volume = isMuted ? 0 : volume;

        return new Promise((resolve, reject) => {
          let timeoutId: NodeJS.Timeout;
          let resolved = false;

          const cleanup = () => {
            if (timeoutId) clearTimeout(timeoutId);
            audio.onloadeddata = null;
            audio.onerror = null;
            audio.oncanplaythrough = null;
          };

          const resolveOnce = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            audioRef.current = audio;
            setIsLoading(false);
            setIsPlaying(true);
            
            // Show success message
            toast({
              title: "Audio Loaded",
              description: `Playing ${recitationType === "surah" ? `Surah ${selectedSurah}` : `Juz ${selectedJuz}`} by ${reciter.name}`,
              variant: "default",
            });
            
            audio.play().catch(console.error);
            resolve();
          };

          const tryNext = () => {
            if (resolved) return;
            resolved = true;
            cleanup();
            console.log(`Audio source ${sourceIndex + 1} failed, trying next...`);
            tryAudioSource(sourceIndex + 1).then(resolve).catch(reject);
          };

          // Success handlers
          audio.onloadeddata = resolveOnce;
          audio.oncanplaythrough = resolveOnce;

          // Error handler
          audio.onerror = (e) => {
            console.log(`Audio error for source ${sourceIndex + 1}:`, e);
            tryNext();
          };

          audio.onended = () => {
            setIsPlaying(false);
          };

          // Shorter timeout for faster fallback (3 seconds instead of 5)
          timeoutId = setTimeout(() => {
            if (!resolved && audio.readyState < 2) {
              console.log(`Audio source ${sourceIndex + 1} timeout (3s), trying next...`);
              tryNext();
            }
          }, 3000);

          // Start loading
          audio.src = audioUrl;
          audio.load();
        });
      };

      await tryAudioSource(0);

    } catch (error) {
      setIsLoading(false);
      console.error("All audio sources failed:", error);
      
      // More helpful error message
      const reciterName = reciter.name;
      const contentType = recitationType === "surah" ? `Surah ${selectedSurah}` : `Juz ${selectedJuz}`;
      
      toast({
        title: "Audio Not Available",
        description: `${contentType} by ${reciterName} is currently unavailable. Please try a different reciter or check your internet connection.`,
        variant: "destructive",
      });
    }
  };

  const stopRecitation = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
    }
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectedSurahInfo = surahs.find(s => s.number === parseInt(selectedSurah));
  const selectedJuzInfo = juzList.find(j => j.number === parseInt(selectedJuz));
  const currentSelection = recitationType === "surah" ? selectedSurahInfo : selectedJuzInfo;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-soft overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-emerald flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground">Quran Recitation</h2>
              <p className="text-xs text-muted-foreground">Listen to beautiful Quran recitations</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4">
          {/* Recitation Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Recitation Type</label>
            <div className="flex gap-2">
              <Button
                variant={recitationType === "surah" ? "default" : "outline"}
                size="sm"
                onClick={() => setRecitationType("surah")}
                className={recitationType === "surah" ? "bg-gradient-emerald" : ""}
              >
                <Book className="w-4 h-4 mr-2" />
                Surah
              </Button>
              <Button
                variant={recitationType === "juz" ? "default" : "outline"}
                size="sm"
                onClick={() => setRecitationType("juz")}
                className={recitationType === "juz" ? "bg-gradient-emerald" : ""}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Juz (Para)
              </Button>
            </div>
          </div>

          {/* Reciter Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Reciter</label>
            <Select value={selectedReciter} onValueChange={setSelectedReciter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {availableReciters.map((reciter) => (
                  <SelectItem key={reciter.id} value={reciter.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{reciter.name}</span>
                      <span className="text-xs text-muted-foreground">{reciter.arabicName}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Surah/Juz Selection */}
          {recitationType === "surah" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Surah</label>
              <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {surahs.map((surah) => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{surah.number}. {surah.englishName}</span>
                        <span className="text-xs text-muted-foreground">({surah.name})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Juz (Para)</label>
              <Select value={selectedJuz} onValueChange={setSelectedJuz}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {juzList.map((juz) => (
                    <SelectItem key={juz.number} value={juz.number.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">Juz {juz.number}: {juz.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Surah {juz.startSurah}:{juz.startVerse} - {juz.endSurah}:{juz.endVerse}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Current Selection Info */}
          {currentSelection && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Book className="w-4 h-4 text-primary" />
                {recitationType === "surah" ? (
                  <span className="font-medium text-foreground">
                    {(currentSelection as Surah).englishName} ({(currentSelection as Surah).name})
                  </span>
                ) : (
                  <span className="font-medium text-foreground">
                    Juz {(currentSelection as Juz).number}: {(currentSelection as Juz).name}
                  </span>
                )}
              </div>
              {recitationType === "surah" ? (
                <p className="text-xs text-muted-foreground">
                  {(currentSelection as Surah).numberOfAyahs} verses • {(currentSelection as Surah).revelationType}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  From Surah {(currentSelection as Juz).startSurah}:{(currentSelection as Juz).startVerse} to {(currentSelection as Juz).endSurah}:{(currentSelection as Juz).endVerse}
                </p>
              )}
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              onClick={stopRecitation}
              disabled={!isPlaying && currentTime === 0}
              variant="outline"
              size="icon"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={playRecitation}
              disabled={isLoading}
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-emerald hover:opacity-90"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>

            <Button
              onClick={() => {/* Skip forward functionality can be added later */}}
              disabled={true}
              variant="outline"
              size="icon"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress Bar */}
          {duration > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};