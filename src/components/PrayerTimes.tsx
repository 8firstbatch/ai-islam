import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { X, Clock, MapPin, Bell, BellOff, RefreshCw, Sunrise, Sun, Sunset } from "lucide-react";

interface PrayerTime {
  name: string;
  time: string;
  icon: React.ReactNode;
  arabicName: string;
}

interface PrayerTimesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrayerTimes = ({ isOpen, onClose }: PrayerTimesProps) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<PrayerTime | null>(null);
  const [countdown, setCountdown] = useState("");
  const { toast } = useToast();

  const prayerIcons: Record<string, React.ReactNode> = {
    Fajr: <Sunrise className="w-5 h-5" />,
    Sunrise: <Sun className="w-5 h-5" />,
    Dhuhr: <Sun className="w-5 h-5" />,
    Asr: <Sun className="w-5 h-5" />,
    Maghrib: <Sunset className="w-5 h-5" />,
    Isha: <Clock className="w-5 h-5" />,
  };

  const arabicNames: Record<string, string> = {
    Fajr: "الفجر",
    Sunrise: "الشروق",
    Dhuhr: "الظهر",
    Asr: "العصر",
    Maghrib: "المغرب",
    Isha: "العشاء",
  };

  const getLocation = useCallback(async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Get city name from coordinates
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const geoData = await geoResponse.json();
      const city = geoData.city || geoData.locality || "Unknown Location";

      setLocation({ lat: latitude, lng: longitude, city });
      await fetchPrayerTimes(latitude, longitude);
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Could not get your location. Please enable location services.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?latitude=${lat}&longitude=${lng}&method=2`
      );
      const data = await response.json();

      if (data.code === 200) {
        const timings = data.data.timings;
        const prayerList: PrayerTime[] = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"].map((name) => ({
          name,
          time: timings[name],
          icon: prayerIcons[name],
          arabicName: arabicNames[name],
        }));
        setPrayerTimes(prayerList);
        calculateNextPrayer(prayerList);
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not fetch prayer times. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateNextPrayer = (prayers: PrayerTime[]) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayers) {
      if (prayer.name === "Sunrise") continue; // Skip Sunrise for next prayer
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer);
        return;
      }
    }

    // If no prayer found, next is Fajr tomorrow
    const fajr = prayers.find((p) => p.name === "Fajr");
    if (fajr) setNextPrayer(fajr);
  };

  const updateCountdown = useCallback(() => {
    if (!nextPrayer) return;

    const now = new Date();
    const [hours, minutes] = nextPrayer.time.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hours, minutes, 0, 0);

    if (prayerTime <= now) {
      prayerTime.setDate(prayerTime.getDate() + 1);
    }

    const diff = prayerTime.getTime() - now.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown(`${h}h ${m}m ${s}s`);
  }, [nextPrayer]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll receive prayer time reminders.",
      });
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "Permission Denied",
        description: "Enable notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      toast({
        title: "Notifications Disabled",
        description: "Prayer reminders have been turned off.",
      });
    } else {
      requestNotificationPermission();
    }
  };

  useEffect(() => {
    if (isOpen && !location) {
      getLocation();
    }
  }, [isOpen, location, getLocation]);

  useEffect(() => {
    if (!nextPrayer) return;
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextPrayer, updateCountdown]);

  // Check for prayer time and send notification
  useEffect(() => {
    if (!notificationsEnabled || !prayerTimes.length) return;

    const checkPrayerTime = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      prayerTimes.forEach((prayer) => {
        if (prayer.time === currentTime && prayer.name !== "Sunrise") {
          new Notification(`🕌 ${prayer.name} Prayer Time`, {
            body: `It's time for ${prayer.name} (${prayer.arabicName}) prayer`,
            icon: "/favicon.ico",
          });
        }
      });
    };

    const interval = setInterval(checkPrayerTime, 60000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, prayerTimes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-soft overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-emerald">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg text-primary-foreground">Prayer Times</h2>
              {location && (
                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location.city}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={getLocation}
              disabled={loading}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Next Prayer Countdown */}
        {nextPrayer && (
          <div className="p-4 bg-muted/50 border-b border-border">
            <p className="text-sm text-muted-foreground mb-1">Next Prayer</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center">
                  {nextPrayer.icon}
                </div>
                <div>
                  <p className="font-display text-xl text-foreground">{nextPrayer.name}</p>
                  <p className="text-sm text-muted-foreground">{nextPrayer.arabicName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl text-primary">{nextPrayer.time}</p>
                <p className="text-sm text-muted-foreground">{countdown}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notification Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {notificationsEnabled ? (
              <Bell className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">Prayer Notifications</p>
              <p className="text-xs text-muted-foreground">Get reminded at prayer times</p>
            </div>
          </div>
          <Switch checked={notificationsEnabled} onCheckedChange={toggleNotifications} />
        </div>

        {/* Prayer Times List */}
        <ScrollArea className="h-64">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : prayerTimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MapPin className="w-12 h-12 mb-4 opacity-50" />
              <p>Enable location to see prayer times</p>
              <Button onClick={getLocation} className="mt-4 bg-gradient-emerald">
                Get Location
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {prayerTimes.map((prayer) => {
                const isNext = nextPrayer?.name === prayer.name;
                return (
                  <div
                    key={prayer.name}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      isNext
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isNext ? "bg-gradient-emerald text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {prayer.icon}
                      </div>
                      <div>
                        <p className={`font-medium ${isNext ? "text-primary" : "text-foreground"}`}>
                          {prayer.name}
                        </p>
                        <p className="text-sm text-muted-foreground font-display">{prayer.arabicName}</p>
                      </div>
                    </div>
                    <p className={`font-display text-lg ${isNext ? "text-primary" : "text-foreground"}`}>
                      {prayer.time}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
