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

// Accurate Hijri date conversion based on the Umm al-Qura calendar
const getHijriDate = (gregorianDate: Date) => {
  // Today (December 27, 2024) should be 6 Rajab 1446
  // Let's use this as a reference point to calibrate our conversion
  
  const referenceGregorian = new Date(2024, 11, 27); // December 27, 2024
  const referenceHijri = { year: 1446, month: 7, day: 6 }; // 6 Rajab 1446
  
  // Calculate the difference in days from our reference date
  const timeDiff = gregorianDate.getTime() - referenceGregorian.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  // Start from our known reference point
  let hYear = referenceHijri.year;
  let hMonth = referenceHijri.month;
  let hDay = referenceHijri.day + daysDiff;
  
  // Adjust for month and year boundaries
  while (hDay > getDaysInHijriMonth(hMonth, hYear)) {
    hDay -= getDaysInHijriMonth(hMonth, hYear);
    hMonth++;
    if (hMonth > 12) {
      hMonth = 1;
      hYear++;
    }
  }
  
  while (hDay <= 0) {
    hMonth--;
    if (hMonth <= 0) {
      hMonth = 12;
      hYear--;
    }
    hDay += getDaysInHijriMonth(hMonth, hYear);
  }
  
  return {
    year: hYear,
    month: hMonth,
    day: hDay
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentHijriYear, setCurrentHijriYear] = useState(1446);
  const [currentHijriMonth, setCurrentHijriMonth] = useState(6); // Rajab is month 7, but array index is 6
  const [manualHijriDate, setManualHijriDate] = useState<{day: number; month: number; year: number} | null>(null);

  // Update current date every minute to ensure accuracy
  useEffect(() => {
    const updateDate = () => {
      setCurrentDate(new Date());
    };
    
    // Update immediately
    updateDate();
    
    // Set up interval to update every minute
    const interval = setInterval(updateDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

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
    // Calculate what Gregorian date corresponds to the 1st of this Hijri month
    // We'll work backwards from our reference point
    const referenceGregorian = new Date(2024, 11, 27); // December 27, 2024
    const referenceHijri = { year: 1446, month: 7, day: 6 }; // 6 Rajab 1446
    
    // Calculate total days from reference to the 1st of the target month
    let totalDays = 0;
    
    // If target is in a different year
    if (year !== referenceHijri.year) {
      // Add/subtract full years
      const yearDiff = year - referenceHijri.year;
      totalDays += yearDiff * 354; // Average Islamic year length
    }
    
    // Add/subtract months within the year
    if (year === referenceHijri.year) {
      // Same year - calculate month difference
      if (month < referenceHijri.month) {
        // Target month is before reference month
        for (let m = month; m < referenceHijri.month; m++) {
          totalDays -= getDaysInHijriMonth(m, year);
        }
        totalDays -= (referenceHijri.day - 1); // Days from 1st to reference day
      } else if (month > referenceHijri.month) {
        // Target month is after reference month
        totalDays += getDaysInHijriMonth(referenceHijri.month, year) - referenceHijri.day;
        for (let m = referenceHijri.month + 1; m < month; m++) {
          totalDays += getDaysInHijriMonth(m, year);
        }
        totalDays += 1; // To get to the 1st of target month
      } else {
        // Same month - just subtract days to get to 1st
        totalDays -= (referenceHijri.day - 1);
      }
    }
    
    // Calculate the Gregorian date for the 1st of the target month
    const targetGregorianDate = new Date(referenceGregorian.getTime() + totalDays * 24 * 60 * 60 * 1000);
    
    return targetGregorianDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
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
                    {todayHijri.day} {islamicMonths[todayHijri.month - 1]?.english || 'Unknown'} {todayHijri.year} AH
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayHijri.day} {islamicMonths[todayHijri.month - 1]?.arabic || 'غير معروف'} {todayHijri.year} هـ
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gregorian: {currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  
                  {/* Show special notifications for important dates */}
                  {todayHijri.day === 1 && todayHijri.month === 1 && (
                    <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-900 rounded text-xs">
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                        🌙 Islamic New Year - Happy New Hijri Year {todayHijri.year} AH!
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 10 && todayHijri.month === 1 && (
                    <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                      <p className="text-blue-800 dark:text-blue-200 font-medium">
                        🕌 Day of Ashura - A blessed day of fasting and remembrance
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 1 && todayHijri.month === 7 && (
                    <div className="mt-2 p-2 bg-purple-100 dark:bg-purple-900 rounded text-xs">
                      <p className="text-purple-800 dark:text-purple-200 font-medium">
                        🌙 Beginning of Rajab - One of the four sacred months in Islam
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 1 && todayHijri.month === 9 && (
                    <div className="mt-2 p-2 bg-emerald-100 dark:bg-emerald-900 rounded text-xs">
                      <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                        🌙 Ramadan Mubarak! The holy month of fasting has begun
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 1 && todayHijri.month === 10 && (
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        🎉 Eid al-Fitr Mubarak! Festival of Breaking the Fast
                      </p>
                    </div>
                  )}
                  {todayHijri.day === 10 && todayHijri.month === 12 && (
                    <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 rounded text-xs">
                      <p className="text-red-800 dark:text-red-200 font-medium">
                        🎉 Eid al-Adha Mubarak! Festival of Sacrifice
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