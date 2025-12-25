import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star } from "lucide-react";

interface IslamicEvent {
  hijriDate: { day: number; month: number; year: number };
  title: string;
  description: string;
  type: 'major' | 'minor' | 'recommended';
}

interface IslamicCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Islamic months in Arabic and English
const islamicMonths = [
  { arabic: "محرم", english: "Muharram" },
  { arabic: "صفر", english: "Safar" },
  { arabic: "ربيع الأول", english: "Rabi' al-Awwal" },
  { arabic: "ربيع الثاني", english: "Rabi' al-Thani" },
  { arabic: "جمادى الأولى", english: "Jumada al-Awwal" },
  { arabic: "جمادى الثانية", english: "Jumada al-Thani" },
  { arabic: "رجب", english: "Rajab" },
  { arabic: "شعبان", english: "Sha'ban" },
  { arabic: "رمضان", english: "Ramadan" },
  { arabic: "شوال", english: "Shawwal" },
  { arabic: "ذو القعدة", english: "Dhu al-Qi'dah" },
  { arabic: "ذو الحجة", english: "Dhu al-Hijjah" }
];

// Important Islamic events with approximate Hijri dates
const getIslamicEvents = (): IslamicEvent[] => [
  {
    hijriDate: { day: 1, month: 1, year: 0 }, // Every year
    title: "Islamic New Year",
    description: "The beginning of the Islamic calendar year (1st Muharram)",
    type: 'major'
  },
  {
    hijriDate: { day: 10, month: 1, year: 0 },
    title: "Day of Ashura",
    description: "The 10th day of Muharram, a day of fasting and remembrance",
    type: 'major'
  },
  {
    hijriDate: { day: 12, month: 3, year: 0 },
    title: "Mawlid an-Nabi",
    description: "Birth of Prophet Muhammad (peace be upon him) - 12th Rabi' al-Awwal",
    type: 'major'
  },
  {
    hijriDate: { day: 1, month: 7, year: 0 },
    title: "Beginning of Rajab",
    description: "Start of the sacred month of Rajab - one of the four sacred months",
    type: 'recommended'
  },
  {
    hijriDate: { day: 3, month: 7, year: 0 },
    title: "Birth of Imam Ali (AS)",
    description: "Birth of Ali ibn Abi Talib (may Allah be pleased with him) - 3rd Rajab",
    type: 'minor'
  },
  {
    hijriDate: { day: 27, month: 7, year: 0 },
    title: "Isra and Mi'raj",
    description: "The Night Journey and Ascension of Prophet Muhammad - 27th Rajab",
    type: 'major'
  },
  {
    hijriDate: { day: 15, month: 8, year: 0 },
    title: "Laylat al-Bara'at",
    description: "The Night of Forgiveness (15th Sha'ban)",
    type: 'recommended'
  },
  {
    hijriDate: { day: 1, month: 9, year: 0 },
    title: "Beginning of Ramadan",
    description: "Start of the holy month of fasting",
    type: 'major'
  },
  {
    hijriDate: { day: 21, month: 9, year: 0 },
    title: "Laylat al-Qadr (estimated)",
    description: "The Night of Power - occurs in the last 10 nights of Ramadan",
    type: 'major'
  },
  {
    hijriDate: { day: 27, month: 9, year: 0 },
    title: "Laylat al-Qadr (estimated)",
    description: "The Night of Power - most likely on the 27th night",
    type: 'major'
  },
  {
    hijriDate: { day: 1, month: 10, year: 0 },
    title: "Eid al-Fitr",
    description: "Festival of Breaking the Fast (1st Shawwal)",
    type: 'major'
  },
  {
    hijriDate: { day: 9, month: 12, year: 0 },
    title: "Day of Arafah",
    description: "The most important day of Hajj pilgrimage (9th Dhu al-Hijjah)",
    type: 'major'
  },
  {
    hijriDate: { day: 10, month: 12, year: 0 },
    title: "Eid al-Adha",
    description: "Festival of Sacrifice (10th Dhu al-Hijjah)",
    type: 'major'
  }
];

// Simplified and more accurate Hijri date conversion
const getHijriDate = (gregorianDate: Date) => {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth() + 1;
  const gDay = gregorianDate.getDate();
  
  // Calculate Julian Day Number
  const a = Math.floor((14 - gMonth) / 12);
  const y = gYear - a;
  const m = gMonth + 12 * a - 3;
  
  const jd = gDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721119;
  
  // Convert Julian Day to Hijri
  // Using a more accurate approximation
  const l = jd - 1948084;
  const n = Math.floor((30 * l) / 10631);
  const l2 = l - Math.floor((10631 * n) / 30) + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  let hMonth = Math.floor((24 * l3) / 709);
  let hDay = l3 - Math.floor((709 * hMonth) / 24);
  let hYear = 30 * n + j - 30;

  // Ensure valid ranges
  if (hDay <= 0) {
    hMonth--;
    if (hMonth <= 0) {
      hMonth = 12;
      hYear--;
    }
    hDay = getDaysInHijriMonth(hMonth, hYear);
  }
  
  if (hMonth <= 0) {
    hMonth = 12;
    hYear--;
  }
  
  if (hMonth > 12) {
    hMonth = 1;
    hYear++;
  }

  return {
    year: Math.max(1, hYear),
    month: Math.max(1, Math.min(12, hMonth)),
    day: Math.max(1, Math.min(getDaysInHijriMonth(hMonth, hYear), hDay))
  };
};

// Get days in Hijri month (alternating 30/29 days, with adjustments)
const getDaysInHijriMonth = (month: number, year: number) => {
  // Basic alternating pattern: odd months have 30 days, even have 29
  // In leap years, the last month (Dhu al-Hijjah) has 30 days instead of 29
  const isLeapYear = ((year * 11 + 14) % 30) < 11;
  
  if (month === 12 && isLeapYear) return 30;
  return month % 2 === 1 ? 30 : 29;
};

export const IslamicCalendar = ({ isOpen, onClose }: IslamicCalendarProps) => {
  const [currentDate] = useState(new Date());
  const [currentHijriYear, setCurrentHijriYear] = useState(1445);
  const [currentHijriMonth, setCurrentHijriMonth] = useState(0);
  const [manualHijriDate, setManualHijriDate] = useState<{day: number; month: number; year: number} | null>(null);

  useEffect(() => {
    // Get actual Hijri date instead of hardcoded override
    const hijriDate = manualHijriDate || getHijriDate(currentDate);
    setCurrentHijriYear(hijriDate.year);
    setCurrentHijriMonth(hijriDate.month - 1);
  }, [currentDate, manualHijriDate]);

  const events = getIslamicEvents();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentHijriMonth === 0) {
        setCurrentHijriMonth(11);
        setCurrentHijriYear(currentHijriYear - 1);
      } else {
        setCurrentHijriMonth(currentHijriMonth - 1);
      }
    } else {
      if (currentHijriMonth === 11) {
        setCurrentHijriMonth(0);
        setCurrentHijriYear(currentHijriYear + 1);
      } else {
        setCurrentHijriMonth(currentHijriMonth + 1);
      }
    }
  };

  const getEventsForMonth = (month: number) => {
    return events.filter(event => event.hijriDate.month === month + 1);
  };

  const currentMonthEvents = getEventsForMonth(currentHijriMonth);
  const todayHijri = manualHijriDate || getHijriDate(new Date());
  const daysInCurrentMonth = getDaysInHijriMonth(currentHijriMonth + 1, currentHijriYear);

  // Calculate the starting day of the week for the first day of the current Hijri month
  const getFirstDayOfWeek = (month: number, year: number) => {
    // Create a date for the 1st of the current Hijri month
    // This is an approximation - convert back to Gregorian to get day of week
    const approxGregorianYear = Math.floor(year * 0.970225 + 621.5643);
    const approxGregorianMonth = Math.floor((month - 1) * 0.970225) + 1;
    const testDate = new Date(approxGregorianYear, approxGregorianMonth - 1, 1);
    return testDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  };

  const firstDayOfWeek = getFirstDayOfWeek(currentHijriMonth + 1, currentHijriYear);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Islamic Calendar - {islamicMonths[currentHijriMonth].english} {currentHijriYear} AH
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {islamicMonths[currentHijriMonth].arabic}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {islamicMonths[currentHijriMonth].english} {currentHijriYear} AH
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="p-2" />
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: daysInCurrentMonth }, (_, i) => {
                    const day = i + 1;
                    const hasEvent = currentMonthEvents.some(event => event.hijriDate.day === day);
                    const isToday = todayHijri.year === currentHijriYear && 
                                   todayHijri.month - 1 === currentHijriMonth && 
                                   todayHijri.day === day;
                    
                    return (
                      <button
                        key={day}
                        className={`
                          p-2 text-sm rounded-lg transition-colors relative
                          ${isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                          ${hasEvent ? 'ring-2 ring-emerald-500' : ''}
                        `}
                        onClick={() => {
                          // Show events for the clicked day
                          const dayEvents = currentMonthEvents.filter(event => event.hijriDate.day === day);
                          if (dayEvents.length > 0) {
                            const eventTitles = dayEvents.map(e => e.title).join('\n');
                            alert(`Events on ${day} ${islamicMonths[currentHijriMonth].english}:\n\n${eventTitles}`);
                          } else if (isToday) {
                            alert(`Today is ${day} ${islamicMonths[currentHijriMonth].english} ${currentHijriYear} AH`);
                          }
                        }}
                      >
                        {day}
                        {hasEvent && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Today's Hijri Date */}
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Today's Hijri Date:</p>
                  <p className="font-semibold">
                    {todayHijri.day} {islamicMonths[todayHijri.month - 1]?.english} {todayHijri.year} AH
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayHijri.day} {islamicMonths[todayHijri.month - 1]?.arabic} {todayHijri.year} هـ
                  </p>
                  {/* Show special notifications for important dates */}
                  {todayHijri.day === 1 && todayHijri.month === 1 && (
                    <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-900 rounded text-xs">
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                        🌙 Islamic New Year - Happy New Hijri Year!
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 1 && todayHijri.month === 7 && (
                    <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-900 rounded text-xs">
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                        🌙 Today marks the beginning of Rajab, one of the four sacred months in Islam!
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 1 && todayHijri.month === 9 && (
                    <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-900 rounded text-xs">
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                        🌙 Ramadan Mubarak! The holy month of fasting has begun.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Panel */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Islamic Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-6">
                  <div className="space-y-4">
                    {currentMonthEvents.length > 0 ? (
                      currentMonthEvents.map((event, index) => (
                        <div key={index} className="border-l-4 border-emerald-500 pl-4 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {event.hijriDate.day} {islamicMonths[currentHijriMonth].english}
                              </p>
                            </div>
                            <Badge 
                              variant={event.type === 'major' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No major events this month
                      </p>
                    )}

                    {/* All Events List */}
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-3">All Annual Events</h4>
                      {events.map((event, index) => (
                        <div key={index} className="py-2 border-b border-muted last:border-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h5 className="text-sm font-medium">{event.title}</h5>
                              <p className="text-xs text-muted-foreground">
                                {event.hijriDate.day} {islamicMonths[event.hijriDate.month - 1]?.english}
                              </p>
                            </div>
                            <Badge 
                              variant={event.type === 'major' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-between items-center gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const currentHijri = manualHijriDate || getHijriDate(new Date());
              const currentDateStr = `${currentHijri.day}/${currentHijri.month}/${currentHijri.year}`;
              const newDate = prompt(`Current Hijri date: ${currentDateStr}\nEnter correct Hijri date (DD/MM/YYYY):`, currentDateStr);
              if (newDate && newDate !== currentDateStr) {
                const parts = newDate.split('/');
                if (parts.length === 3) {
                  const [day, month, year] = parts.map(Number);
                  if (day >= 1 && day <= 30 && month >= 1 && month <= 12 && year > 0) {
                    setManualHijriDate({ day, month, year });
                    setCurrentHijriYear(year);
                    setCurrentHijriMonth(month - 1);
                  } else {
                    alert("Please enter a valid date (DD/MM/YYYY)");
                  }
                }
              }
            }}
          >
            Correct Date
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setManualHijriDate(null);
                const hijriDate = getHijriDate(new Date());
                setCurrentHijriYear(hijriDate.year);
                setCurrentHijriMonth(hijriDate.month - 1);
              }}
            >
              Reset to Auto
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};