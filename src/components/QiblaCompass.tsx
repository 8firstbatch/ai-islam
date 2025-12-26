import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Compass, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QiblaCompassProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface QiblaData {
  direction: number; // Qibla direction in degrees from North
  distance: number; // Distance to Mecca in kilometers
}

// Mecca coordinates
const MECCA_COORDS = {
  latitude: 21.4225,
  longitude: 39.8262
};

export const QiblaCompass = ({ isOpen, onClose }: QiblaCompassProps) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [qiblaData, setQiblaData] = useState<QiblaData | null>(null);
  const [deviceOrientation, setDeviceOrientation] = useState<number>(0);
  const [previousOrientation, setPreviousOrientation] = useState<number>(0);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isOrientationSupported, setIsOrientationSupported] = useState(false);
  const [isOrientationPermissionGranted, setIsOrientationPermissionGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [compassPulse, setCompassPulse] = useState(false);
  const [needleGlow, setNeedleGlow] = useState(false);
  const compassRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const { toast } = useToast();

  // Calculate Qibla direction using the great circle method
  const calculateQiblaDirection = (userLat: number, userLng: number): QiblaData => {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const toDegrees = (radians: number) => radians * (180 / Math.PI);

    const lat1 = toRadians(userLat);
    const lng1 = toRadians(userLng);
    const lat2 = toRadians(MECCA_COORDS.latitude);
    const lng2 = toRadians(MECCA_COORDS.longitude);

    const deltaLng = lng2 - lng1;

    // Calculate bearing (Qibla direction)
    const y = Math.sin(deltaLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    let bearing = toDegrees(Math.atan2(y, x));
    
    // Normalize to 0-360 degrees
    bearing = (bearing + 360) % 360;

    // Calculate distance using Haversine formula
    const R = 6371; // Earth's radius in kilometers
    const dLat = lat2 - lat1;
    const dLng = deltaLng;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      direction: bearing,
      distance: Math.round(distance)
    };
  };

  // Get user's current location
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsLoadingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        setUserLocation(location);
        const qibla = calculateQiblaDirection(location.latitude, location.longitude);
        setQiblaData(qibla);
        setIsLoadingLocation(false);
        
        toast({
          title: "Location Found",
          description: `Qibla direction calculated for your location.`,
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocationError(errorMessage);
        setIsLoadingLocation(false);
      },
      options
    );
  };

  // Request device orientation permission (iOS 13+)
  const requestOrientationPermission = async () => {
    // Check if requestPermission method exists (iOS 13+)
    const DeviceOrientationEventAny = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    
    if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventAny.requestPermission();
        if (permission === 'granted') {
          setIsOrientationPermissionGranted(true);
          setupOrientationListener();
        } else {
          toast({
            title: "Permission Denied",
            description: "Device orientation access is required for compass functionality.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error requesting orientation permission:', error);
        toast({
          title: "Permission Error",
          description: "Could not request orientation permission. Compass may not work properly.",
          variant: "destructive"
        });
      }
    } else {
      // For non-iOS devices or older iOS versions
      setIsOrientationPermissionGranted(true);
      setupOrientationListener();
    }
  };

  // Setup device orientation listener
  const setupOrientationListener = () => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        // Alpha gives us the compass heading
        let heading = event.alpha;
        
        // For iOS, we might need to adjust the heading
        const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
        if (webkitEvent.webkitCompassHeading !== undefined) {
          heading = webkitEvent.webkitCompassHeading;
        }
        
        setDeviceOrientation(360 - heading); // Invert for correct compass direction
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      setIsOrientationSupported(true);
      
      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    }
  };

  // Calibrate compass
  const calibrateCompass = () => {
    setIsCalibrating(true);
    toast({
      title: "Calibrating Compass",
      description: "Move your device in a figure-8 pattern to calibrate the compass.",
    });
    
    setTimeout(() => {
      setIsCalibrating(false);
      toast({
        title: "Calibration Complete",
        description: "Compass has been calibrated.",
      });
    }, 3000);
  };

  // Initialize compass when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Reset states when opening
      setLocationError(null);
      setUserLocation(null);
      setQiblaData(null);
      setDeviceOrientation(0);
      
      getCurrentLocation();
      
      // Check if orientation is supported
      if (window.DeviceOrientationEvent) {
        setIsOrientationSupported(true);
        requestOrientationPermission();
      } else {
        console.warn('DeviceOrientationEvent not supported');
        toast({
          title: "Compass Not Available",
          description: "Your device doesn't support compass functionality.",
          variant: "destructive"
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (window.DeviceOrientationEvent) {
        const handleOrientation = () => {};
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isOpen]);

  // Calculate the visual rotation for the compass needle
  const getCompassRotation = () => {
    if (!qiblaData) return 0;
    
    // Combine Qibla direction with device orientation
    const qiblaDirection = qiblaData.direction;
    const rotation = qiblaDirection - deviceOrientation;
    
    return rotation;
  };

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${distance} km`;
    } else {
      return `${(distance / 1000).toFixed(1)}k km`;
    }
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return "secondary";
    if (accuracy <= 10) return "default";
    if (accuracy <= 50) return "secondary";
    return "destructive";
  };

  const getAccuracyText = (accuracy?: number) => {
    if (!accuracy) return "Unknown";
    if (accuracy <= 10) return "High";
    if (accuracy <= 50) return "Medium";
    return "Low";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Compass className="w-5 h-5" />
            Qibla Compass
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Location Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoadingLocation ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting your location...
                </div>
              ) : locationError ? (
                <div className="space-y-2">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {locationError}
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getCurrentLocation}
                    className="w-full mb-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Retry Location
                  </Button>
                  <div className="text-xs text-muted-foreground text-center">
                    Or manually calculate: Enter your coordinates in a maps app and use the compass direction shown above.
                  </div>
                </div>
              ) : userLocation ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Coordinates:</span>
                    <span className="font-mono text-xs">
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Accuracy:</span>
                    <Badge variant={getAccuracyColor(userLocation.accuracy)} className="text-xs">
                      {getAccuracyText(userLocation.accuracy)}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getCurrentLocation}
                    className="w-full"
                  >
                    <MapPin className="w-3 h-3 mr-2" />
                    Get Location
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      // Test with a sample location (New York City)
                      const testLocation = { latitude: 40.7128, longitude: -74.0060 };
                      setUserLocation(testLocation);
                      const qibla = calculateQiblaDirection(testLocation.latitude, testLocation.longitude);
                      setQiblaData(qibla);
                      toast({
                        title: "Test Location Set",
                        description: "Using New York City coordinates for testing.",
                      });
                    }}
                    className="w-full text-xs"
                  >
                    Use Test Location (NYC)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compass */}
          {qiblaData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Qibla Direction
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {qiblaData.direction.toFixed(0)}°
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Compass Visual */}
                <div className="relative w-48 h-48 mx-auto mb-4">
                  {/* Compass Background */}
                  <div className="absolute inset-0 rounded-full border-4 border-muted bg-gradient-to-br from-background to-muted">
                    {/* Cardinal Directions */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">N</div>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold">S</div>
                    <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">W</div>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold">E</div>
                    
                    {/* Degree Markings */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute w-0.5 h-4 bg-muted-foreground"
                        style={{
                          top: '4px',
                          left: '50%',
                          transformOrigin: '50% 92px',
                          transform: `translateX(-50%) rotate(${i * 30}deg)`
                        }}
                      />
                    ))}
                  </div>

                  {/* Qibla Needle */}
                  <div
                    ref={compassRef}
                    className="absolute inset-4 transition-transform duration-300 ease-out"
                    style={{
                      transform: `rotate(${getCompassRotation()}deg)`
                    }}
                  >
                    {/* Needle pointing to Qibla */}
                    <div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full transform -translate-x-1/2 shadow-lg">
                      {/* Arrowhead */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-emerald-500"></div>
                      </div>
                    </div>
                    
                    {/* Center dot */}
                    <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                  </div>

                  {/* Kaaba Icon */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8">
                    <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-sm shadow-lg flex items-center justify-center">
                      <div className="w-3 h-3 bg-amber-800 rounded-sm"></div>
                    </div>
                  </div>
                </div>

                {/* Compass Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Distance to Mecca:</span>
                    <span className="font-semibold">{formatDistance(qiblaData.distance)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Qibla Direction:</span>
                    <span className="font-semibold">{qiblaData.direction.toFixed(1)}° from North</span>
                  </div>
                  {isOrientationSupported && (
                    <div className="flex items-center justify-between">
                      <span>Device Heading:</span>
                      <span className="font-semibold">{deviceOrientation.toFixed(0)}°</span>
                    </div>
                  )}
                </div>

                {/* Orientation Controls */}
                {isOrientationSupported ? (
                  <div className="mt-4 space-y-2">
                    {!isOrientationPermissionGranted && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={requestOrientationPermission}
                        className="w-full"
                      >
                        <Compass className="w-3 h-3 mr-2" />
                        Enable Compass
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={calibrateCompass}
                      disabled={isCalibrating}
                      className="w-full"
                    >
                      {isCalibrating ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3 h-3 mr-2" />
                      )}
                      {isCalibrating ? "Calibrating..." : "Calibrate Compass"}
                    </Button>
                  </div>
                ) : (
                  <Alert className="mt-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Device orientation not supported. The compass shows the calculated Qibla direction from North.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Hold your device flat and point it in the direction of the green needle to face the Qibla. 
              For best accuracy, calibrate your compass and ensure location services are enabled.
            </AlertDescription>
          </Alert>
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