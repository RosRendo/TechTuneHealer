import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  Platform,
  Linking,
  TextInput,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, type Socket } from 'socket.io-client';
// Conditionally import react-native-maps only on native platforms
let MapView: any = View;
let Marker: any = View;
let Polyline: any = View;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default || maps;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
  } catch {}
}

import { SlideToConfirm } from '../../components/SlideToConfirm';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../constants/theme';
import { AnimatedEntrance } from '../../components';
import { useBookingStore, useAuthStore, useLocationStore } from '../../store';
import api from '../../services/api';
import { WS_URL } from '../../config/api';

const haversineKm = (
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export function MechanicTrackingScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { bookingId, providerCoords: passedProviderCoords } = route.params || {};
  const { bookings, updateBookingStatus } = useBookingStore();
  const { user } = useAuthStore();
  const { currentLocation, setLocation: setStoreLocation } = useLocationStore();
  const storeBooking = bookings.find((b) => b.id === bookingId) as any;
  const [localBooking, setLocalBooking] = useState<any>(storeBooking || null);
  const currentBooking = storeBooking || localBooking;

  // Provider Workshop Base GPS matching seed / profile (Speedy Auto Fix: 11.5600, 104.9100)
  const defaultProviderPos = React.useMemo(() => ({
    lat: (user as any)?.location?.latitude || (user as any)?.lat || 11.5600,
    lng: (user as any)?.location?.longitude || (user as any)?.lng || 104.9100,
  }), [user]);

  // Initial live position check (passed parameter or cached store location)
  const initialLivePos = React.useMemo(() => {
    if (passedProviderCoords?.latitude && passedProviderCoords?.longitude) {
      return { lat: Number(passedProviderCoords.latitude), lng: Number(passedProviderCoords.longitude) };
    }
    if (passedProviderCoords?.lat && passedProviderCoords?.lng) {
      return { lat: Number(passedProviderCoords.lat), lng: Number(passedProviderCoords.lng) };
    }
    if (currentLocation?.latitude && currentLocation?.longitude) {
      return { lat: Number(currentLocation.latitude), lng: Number(currentLocation.longitude) };
    }
    return null;
  }, [passedProviderCoords, currentLocation]);

  // Resolve Customer Breakdown GPS matched 100% to the seed data
  const getDestinationCoords = useCallback((booking: any) => {
    if (booking?.customerLocation?.latitude && booking?.customerLocation?.longitude) {
      return {
        lat: Number(booking.customerLocation.latitude),
        lng: Number(booking.customerLocation.longitude),
      };
    }
    if (booking?.customerLocation?.lat && booking?.customerLocation?.lng) {
      return {
        lat: Number(booking.customerLocation.lat),
        lng: Number(booking.customerLocation.lng),
      };
    }
    // Match by breakdown address / notes or customer name from seed
    const notes = (booking?.notes || '').toLowerCase();
    const name = (booking?.customerName || booking?.customer?.name || '').toLowerCase();

    if (notes.includes('camtech') || notes.includes('chroy changvar')) {
      return { lat: 11.6146, lng: 104.9282 };
    }
    if (notes.includes('tuol kork') || name.includes('dara')) {
      return { lat: 11.5720, lng: 104.8950 };
    }
    if (notes.includes('aeon') || notes.includes('sen sok') || name.includes('vannak')) {
      return { lat: 11.5950, lng: 104.8820 };
    }
    if (notes.includes('riverside') || notes.includes('sisowath') || notes.includes('overheating')) {
      return { lat: 11.5680, lng: 104.9330 };
    }
    if (notes.includes('310') || name.includes('sophea')) {
      return { lat: 11.5450, lng: 104.9220 };
    }
    if (notes.includes('brake') || name.includes('sreymom')) {
      return { lat: 11.5530, lng: 104.9180 };
    }
    if (notes.includes('tesla') || name.includes('michael')) {
      return { lat: 11.5630, lng: 104.9150 };
    }
    return { lat: 11.5720, lng: 104.8950 };
  }, []);

  // Fetch booking directly from backend if not yet in client store
  useEffect(() => {
    if (bookingId && !storeBooking && !localBooking) {
      api.bookings.getById(bookingId)
        .then((b: any) => {
          if (b) setLocalBooking(b);
        })
        .catch(() => {});
    }
  }, [bookingId, storeBooking, localBooking]);

  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'tracking' | 'arrived' | 'in_progress' | 'completed'>('idle');
  const [pinInput, setPinInput] = useState('');
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  // Initialize coords from live position if available, or fallback to default provider pos until GPS loads
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(initialLivePos || defaultProviderPos);
  const [customerCoords, setCustomerCoords] = useState<{ lat: number; lng: number }>(getDestinationCoords(currentBooking));
  const [updateCount, setUpdateCount] = useState(0);

  const mapRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const customerCoordsRef = useRef<{ lat: number; lng: number }>(getDestinationCoords(currentBooking));
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);

  const [liveGpsCoords, setLiveGpsCoords] = useState<{ lat: number; lng: number } | null>(initialLivePos);

  // Dynamic initial region framing both the specialist position and motorist breakdown
  const initialRegion = React.useMemo(() => {
    const start = coords || initialLivePos || defaultProviderPos;
    const dest = getDestinationCoords(currentBooking);
    const midLat = (start.lat + dest.lat) / 2;
    const midLng = (start.lng + dest.lng) / 2;
    const deltaLat = Math.max(Math.abs(start.lat - dest.lat) * 1.8, 0.04);
    const deltaLng = Math.max(Math.abs(start.lng - dest.lng) * 1.8, 0.04);
    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: deltaLat,
      longitudeDelta: deltaLng,
    };
  }, [coords, initialLivePos, defaultProviderPos, currentBooking, getDestinationCoords]);

  // -â‚¬-â‚¬ Auto-fit map viewport to frame both specialist and customer -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const fitMapBounds = useCallback(() => {
    if (!mapRef.current) return;
    const currentLoc = coords || defaultProviderPos;
    const dest = customerCoordsRef.current || getDestinationCoords(currentBooking);
    
    const points = routeCoords && routeCoords.length > 0
      ? routeCoords
      : [
          { latitude: currentLoc.lat, longitude: currentLoc.lng },
          { latitude: dest.lat, longitude: dest.lng },
        ];

    mapRef.current.fitToCoordinates(points, {
      edgePadding: { top: 180, right: 60, bottom: 250, left: 60 },
      animated: true,
    });
  }, [coords, defaultProviderPos, currentBooking, getDestinationCoords, routeCoords]);

  // -â‚¬-â‚¬ Connect socket on mount -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  useEffect(() => {
    let active = true;

    (async () => {
      const token = (await AsyncStorage.getItem('authToken')) || '';
      if (!active) return;

      const socket = io(WS_URL, { auth: { token } });
      socketRef.current = socket;

      socket.on('connect', () => console.log('â€Å’ Socket connected'));
      socket.on('connect_error', (err) => console.warn('Socket connection failed:', err.message));
    })();

    return () => {
      active = false;
      socketRef.current?.disconnect();
      locationSubRef.current?.remove();
    };
  }, []);

  // -â‚¬-â‚¬ Handle app background / foreground -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // App came to foreground – tracking continues silently
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  // -â‚¬-â‚¬ Sync destination and route when currentBooking loads or changes -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  useEffect(() => {
    const dest = getDestinationCoords(currentBooking);
    customerCoordsRef.current = dest;
    setCustomerCoords(dest);

    let isMounted = true;

    // Immediately acquire device real GPS position and route from it
    (async () => {
      let gotGps = !!initialLivePos;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // 1. Instant check from OS cache (0ms)
          const last = await Location.getLastKnownPositionAsync();
          if (isMounted && last?.coords) {
            gotGps = true;
            const live = { lat: last.coords.latitude, lng: last.coords.longitude };
            setLiveGpsCoords(live);
            setCoords(live);
            setStoreLocation({ latitude: live.lat, longitude: live.lng });
            fetchRoute(live, dest);
          }

          // 2. Fresh accurate GPS fix
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (isMounted && pos?.coords) {
            gotGps = true;
            const live = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setLiveGpsCoords(live);
            setCoords(live);
            setStoreLocation({ latitude: live.lat, longitude: live.lng });
            fetchRoute(live, dest);
            return;
          }
        }
      } catch (err) {
        console.warn('GPS acquisition error:', err);
      }

      // Only if NO GPS could be acquired at all, route from seed base
      if (isMounted && !gotGps) {
        const fallback = defaultProviderPos;
        setCoords(fallback);
        fetchRoute(fallback, dest);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [currentBooking, getDestinationCoords, defaultProviderPos, initialLivePos, setStoreLocation]);


  // -â‚¬-â‚¬ Fetch OSRM Route with HTTPS & Reliable Waypoint Fallback -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const routePoints = data.routes[0].geometry.coordinates.map((c: [number, number]) => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(routePoints);
        setTimeout(fitMapBounds, 400);
        return;
      }
    } catch {
      // Smooth fallback path if offline / rate limited
    }

    // High-fidelity interpolated fallback route
    const fallbackPoints = [0.2, 0.4, 0.6, 0.8].map((fraction) => ({
      latitude: start.lat + (end.lat - start.lat) * fraction + 0.0008 * Math.sin(fraction * Math.PI),
      longitude: start.lng + (end.lng - start.lng) * fraction + 0.0008 * Math.cos(fraction * Math.PI),
    }));
    setRouteCoords([
      { latitude: start.lat, longitude: start.lng },
      ...fallbackPoints,
      { latitude: end.lat, longitude: end.lng },
    ]);
    setTimeout(fitMapBounds, 400);
  };

  // -â‚¬-â‚¬ Start tracking (Real GPS & Simulation) -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const startTracking = useCallback(async () => {
    setIsTracking(true);
    setStatus('tracking');
    if (bookingId) {
      updateBookingStatus(bookingId, 'in_progress');
    }

    // Ensure we start from the most accurate current location
    let startPos = coords || liveGpsCoords || initialLivePos || defaultProviderPos;
    try {
      const quickPos = await Location.getLastKnownPositionAsync();
      if (quickPos?.coords) {
        startPos = { lat: quickPos.coords.latitude, lng: quickPos.coords.longitude };
        setCoords(startPos);
        setLiveGpsCoords(startPos);
      }
    } catch {}

    const dest = customerCoordsRef.current || getDestinationCoords(currentBooking);

    socketRef.current?.emit('mechanic:location', {
      bookingId,
      latitude: startPos.lat,
      longitude: startPos.lng,
    });
    fetchRoute(startPos, dest);

    // Watch position if live GPS is available
    let hasLiveGpsUpdates = false;
    let watchSub: Location.LocationSubscription | null = null;
    try {
      const { status: permStatus } = await Location.getForegroundPermissionsAsync();
      if (permStatus === 'granted') {
        watchSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (newLocation) => {
            if (newLocation?.coords) {
              hasLiveGpsUpdates = true;
              const liveLoc = {
                lat: newLocation.coords.latitude,
                lng: newLocation.coords.longitude,
              };
              setCoords(liveLoc);
              setLiveGpsCoords(liveLoc);
              setUpdateCount((c) => c + 1);
              socketRef.current?.emit('mechanic:location', {
                bookingId,
                latitude: liveLoc.lat,
                longitude: liveLoc.lng,
              });
            }
          }
        );
      }
    } catch {}

    // Fallback progression interval if stationary or in emulator
    const intervalId = setInterval(() => {
      if (hasLiveGpsUpdates) return;
      setCoords((current) => {
        const base = current || defaultProviderPos;
        const target = customerCoordsRef.current || getDestinationCoords(currentBooking);
        // Advance 2.5% along the route toward the stranded customer
        const dLat = (target.lat - base.lat) * 0.025;
        const dLng = (target.lng - base.lng) * 0.025;
        const nextLoc = { lat: base.lat + dLat, lng: base.lng + dLng };

        setUpdateCount((c) => c + 1);
        socketRef.current?.emit('mechanic:location', {
          bookingId,
          latitude: nextLoc.lat,
          longitude: nextLoc.lng,
        });

        return nextLoc;
      });
    }, 3000);

    locationSubRef.current = {
      remove: () => {
        watchSub?.remove();
        clearInterval(intervalId);
      },
    } as any;
  }, [bookingId, coords, liveGpsCoords, initialLivePos, defaultProviderPos, currentBooking, getDestinationCoords, updateBookingStatus]);

  // -â‚¬-â‚¬ Stop tracking -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const stopTracking = useCallback(() => {
    locationSubRef.current?.remove();
    locationSubRef.current = null;
    setIsTracking(false);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (currentBooking?.status === 'in_progress' && status === 'idle') {
      setStatus('tracking');
      setIsTracking(true);
      startTracking();
    }
  }, [currentBooking?.status, status, startTracking]);

  // -â‚¬-â‚¬ Signal arrival -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const signalArrival = useCallback(() => {
    socketRef.current?.emit('mechanic:arrived', { bookingId });
    stopTracking();
    setStatus('arrived');
    // Persist arrival so the customer's booking reflect the real lifecycle
    if (bookingId) {
      updateBookingStatus(bookingId, 'arrived');
    }
    Alert.alert('Arrival Confirmed! 🚗', 'The customer has been alerted that you have reached the breakdown vehicle.');
  }, [bookingId, stopTracking, updateBookingStatus]);

  // -â‚¬-â‚¬ Complete Job & Invoice -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const handleCompleteJob = useCallback(() => {
    const totalAmount = currentBooking?.estimatedPrice || currentBooking?.totalPrice || 45;
    Alert.alert(
      'Complete Service & Issue Invoice',
      `Summary:\n• Service: ${currentBooking?.serviceType || 'Emergency Roadside Assistance'}\n• Emergency Callout Fee: $25.00\n• Diagnostics & Labor: $${Math.max(0, totalAmount - 25).toFixed(2)}\n• Total Amount: $${Number(totalAmount).toFixed(2)}\n\nConfirm job completion and issue customer invoice?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Complete',
          onPress: async () => {
            if (bookingId) {
              await updateBookingStatus(bookingId, 'completed');
            }
            setStatus('completed');
            Alert.alert('Job Completed! 🎉', 'Customer invoice generated and payout recorded in your earnings.');
          },
        },
      ]
    );
   }, [bookingId, currentBooking, updateBookingStatus]);

  // â”€â”€ Live route telemetry (distance + ETA at ~25 km/h city driving) â”€â”€â”€â”€â”€â”€â”€
  const remainingKm = haversineKm(coords || defaultProviderPos, customerCoords);
  const remainingM = Math.round(remainingKm * 1000);
  const etaMinutes = Math.max(1, Math.round(remainingKm / 0.42));
  const isNavActive = isTracking || status === 'tracking';
  const securityPin =
    (currentBooking as any)?.securityPin ||
    (bookingId ? bookingId.replace(/\D/g, '').slice(-4).padStart(4, '0') : '4821');

  const handlePinSubmit = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPinInput(digits);
    if (digits.length === 4 && digits === securityPin) {
      setPinVerified(true);
      // Verified: drop the keyboard and close the PIN entry overlay
      Keyboard.dismiss();
      setPinModalVisible(false);
    }
  };


  // -â‚¬-â‚¬ Status styles -â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬-â‚¬
  const statusMeta = {
    idle:        { icon: 'location-outline', color: colors.neutral[500], label: 'Ready for Dispatch' },
    tracking:    { icon: 'navigate',         color: colors.success[600], label: 'En Route to Motorist' },
    arrived:     { icon: 'checkmark-circle', color: colors.primary[600], label: 'Arrived at Scene' },
    in_progress: { icon: 'construct',        color: colors.warning[600], label: 'Diagnostics & Repair' },
    completed:   { icon: 'ribbon',           color: colors.success[600], label: 'Service Completed' },
  }[status];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Roadside Dispatch Tracking</Text>
          <View style={{ width: 24 }} />
        </View>
      </AnimatedEntrance>

      <View style={styles.body}>
        {coords ? (
          Platform.OS === 'web' ? (
            <View style={styles.webMapContainer}>
              <View style={styles.webMapInner}>
                <View style={styles.webGpsHeader}>
                  <View style={styles.webPulseDot} />
                  <Text style={styles.webGpsHeaderText}>
                    LIVE TELEMETRY RADAR • PHNOM PENH
                  </Text>
                </View>

                {/* Radar Simulation Board */}
                <View style={styles.webMapStage}>
                  {/* Route Line */}
                  <View style={styles.webRouteLine} />

                  {/* Specialist marker */}
                  <View style={[styles.webMarkerPos, { top: '35%', left: '25%' }]}>
                    <View style={styles.specialistHaloRing} />
                    <View style={styles.specialistMarkerBadge}>
                      <Ionicons name="navigate" size={16} color={colors.white} />
                    </View>
                    <View style={styles.specialistLabelPill}>
                      <Text style={styles.markerLabelText}>You (En Route)</Text>
                    </View>
                  </View>

                  {/* Stranded Motorist marker */}
                  <View style={[styles.webMarkerPos, { top: '65%', left: '70%' }]}>
                    <View style={styles.motoristHaloRing} />
                    <View style={styles.motoristMarkerBadge}>
                      <Ionicons name="alert" size={16} color={colors.white} />
                    </View>
                    <View style={styles.motoristLabelPill}>
                      <Text style={styles.markerLabelText}>Stranded Driver</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <MapView
              ref={mapRef as any}
              style={StyleSheet.absoluteFill}
              initialRegion={initialRegion}
              showsUserLocation={true}
              showsMyLocationButton={true}
              onMapReady={() => {
                setTimeout(fitMapBounds, 400);
              }}
            >
              {/* Custom Specialist Marker */}
              <Marker
                coordinate={{ latitude: coords.lat, longitude: coords.lng }}
                title="You (Specialist)"
                description="Current Location"
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={10}
              >
                <View style={styles.customMarkerContainer}>
                  <View style={styles.specialistHaloRing} />
                  <View style={styles.specialistMarkerBadge}>
                    <Ionicons name="navigate" size={15} color={colors.white} />
                  </View>
                  <View style={styles.specialistLabelPill}>
                    <Text style={styles.markerLabelText}>You</Text>
                  </View>
                </View>
              </Marker>

              {/* Custom Stranded Motorist Marker */}
              {customerCoords && (
                <Marker
                  coordinate={{ latitude: customerCoords.lat, longitude: customerCoords.lng }}
                  title="Stranded Driver"
                  anchor={{ x: 0.5, y: 0.5 }}
                  zIndex={9}
                >
                  <View style={styles.customMarkerContainer}>
                    <View style={styles.motoristHaloRing} />
                    <View style={styles.motoristMarkerBadge}>
                      <Ionicons name="alert" size={15} color={colors.white} />
                    </View>
                    <View style={styles.motoristLabelPill}>
                      <Text style={styles.markerLabelText}>Stranded Driver</Text>
                    </View>
                  </View>
                </Marker>
              )}

              {/* Route Outer Contrast Border */}
              {customerCoords && routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#1E3A8A"
                  strokeWidth={7}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
              {/* Route Inner Vibrant Neon Path */}
              {customerCoords && routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#3B82F6"
                  strokeWidth={4}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </MapView>
          )
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={colors.neutral[400]} />
            <Text style={styles.mapPlaceholderText}>Locating nearest route...</Text>
          </View>
        )}

        {/* Top Motorist & Vehicle Telemetry HUD */}
        <View style={styles.hudCard}>
          <View style={styles.hudHeader}>
            <View style={styles.customerAvatarSmall}>
              <Text style={styles.customerAvatarSmallText}>
                {(currentBooking?.customer?.name || currentBooking?.customerName || "M").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerNameText} numberOfLines={1}>
                {currentBooking?.customer?.name || currentBooking?.customerName || "Stranded Motorist"}
              </Text>
              <Text style={styles.serviceSubText} numberOfLines={1}>
                #{bookingId?.slice(-6).toUpperCase() || 'BK-8902'} • {currentBooking?.serviceType || "Emergency Roadside Assistance"}
              </Text>
            </View>
            <View style={styles.etaBadge}>
              <Ionicons name="time" size={13} color={colors.primary[600]} />
              <Text style={styles.etaText}>~12 min</Text>
            </View>
          </View>

          {/* Vehicle info & Cambodian Plate */}
          <View style={styles.vehicleRow}>
            <View style={styles.vehiclePill}>
              <Ionicons name="car-sport" size={14} color={colors.primary[600]} />
              <Text style={styles.vehicleModelText}>
                {currentBooking?.vehicle?.make || "Toyota"} {currentBooking?.vehicle?.model || "Camry"}{" "}
                {currentBooking?.vehicle?.year ? `(${currentBooking?.vehicle?.year})` : ""}
              </Text>
            </View>
            <View style={styles.cambodianPlateBadge}>
              <Text style={styles.cambodianPlateFlag}>â€¡Â°â€¡Â­</Text>
              <Text style={styles.cambodianPlateText}>
                {currentBooking?.vehicle?.plateNumber || "Phnom Penh 2B-8899"}
              </Text>
            </View>
          </View>

          {/* Breakdown Symptoms if available */}
          {Boolean(currentBooking?.notes) && (
            <View style={styles.notesRow}>
              <Ionicons name="alert-circle" size={13} color={colors.warning[700]} />
              <Text style={styles.notesText} numberOfLines={1}>
                {currentBooking?.notes}
              </Text>
            </View>
          )}

        </View>

        {/* Floating Turn-by-Turn Navigation HUD (Uber Driver style) */}
        {isNavActive && status !== 'completed' && (
          <View style={styles.navBanner}>
            <View style={styles.navBannerDirection}>
              <Ionicons name="arrow-up" size={20} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navBannerTitle} numberOfLines={1}>
                {remainingM >= 1000
                  ? `Continue ${(remainingM / 1000).toFixed(1)} km along the route`
                  : `In ${remainingM} m â€” follow the highlighted route`}
              </Text>
              <Text style={styles.navBannerSub} numberOfLines={1}>
                Live GPS guidance â€¢ head toward breakdown pin
              </Text>
            </View>
            <View style={styles.navBannerEta}>
              <Text style={styles.navBannerEtaTime}>~{etaMinutes} min</Text>
              <Text style={styles.navBannerEtaSub}>ETA</Text>
            </View>
          </View>
        )}

        {/* Overlay Card */}
        <View style={styles.overlayCard}>
          <View style={styles.overlayRow}>
            <Ionicons name={statusMeta.icon as any} size={24} color={statusMeta.color} />
            <Text style={[styles.statusLabel, { color: statusMeta.color, marginLeft: 8 }]}>{statusMeta.label}</Text>
          </View>
          {isTracking && (
            <View style={styles.updatesBadge}>
              <Text style={styles.updatesText}>{updateCount} live pings</Text>
            </View>
          )}
        </View>

        {/* Floating Contact Actions (Recenter, Call & Chat) */}
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={[styles.floatingActionBtn, styles.floatingRecenterBtn]}
            onPress={fitMapBounds}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color={colors.primary[600]} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatingActionBtn, { backgroundColor: colors.success[600] }]}
            onPress={() => Linking.openURL(`tel:${currentBooking?.customerPhone || currentBooking?.customer?.phone || '+85512889977'}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.floatingActionBtn, { backgroundColor: colors.primary[600] }]}
            onPress={() => (navigation as any).navigate("Chat", { bookingId })}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4-Step Dispatch Progress Stepper */}
      <AnimatedEntrance delay={100} direction="up">
        <View style={styles.stepperContainer}>
          {[
            { id: 'en_route', label: 'En Route', active: status === 'idle' || status === 'tracking', done: status === 'arrived' || status === 'in_progress' || status === 'completed', icon: 'navigate' },
            { id: 'arrived', label: 'Arrived', active: status === 'arrived', done: status === 'in_progress' || status === 'completed', icon: 'location' },
            { id: 'service', label: 'In Service', active: status === 'in_progress', done: status === 'completed', icon: 'construct' },
            { id: 'done', label: 'Complete', active: status === 'completed', done: status === 'completed', icon: 'checkmark-circle' },
          ].map((step, idx) => (
            <React.Fragment key={step.id}>
              <View style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  step.done ? styles.stepCircleDone : step.active ? styles.stepCircleActive : styles.stepCircleInactive
                ]}>
                  <Ionicons
                    name={step.done ? "checkmark" : (step.icon as any)}
                    size={13}
                    color={step.done || step.active ? colors.white : colors.neutral[400]}
                  />
                </View>
                <Text style={[
                  styles.stepLabel,
                  step.active && styles.stepLabelActive,
                  step.done && styles.stepLabelDone
                ]}>
                  {step.label}
                </Text>
              </View>
              {idx < 3 && (
                <View style={[
                  styles.stepConnector,
                  step.done && styles.stepConnectorDone
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </AnimatedEntrance>

      {/* Bottom Dispatch Action Hierarchy */}
      <AnimatedEntrance delay={160} direction="up">
        <View style={styles.actions}>
          {/* STAGE 1: Ready to Navigate */}
          {status === 'idle' && (
            <SlideToConfirm
              label="Slide to Start Navigation"
              icon="navigate"
              color={colors.primary[600]}
              onConfirm={startTracking}
              resetKey={status}
            />
          )}

          {/* STAGE 2: En Route (Driving to Motorist) */}
          {status === 'tracking' && (
            <View style={styles.stageButtonGroup}>
              {/* Drag to Confirm Arrival */}
              <SlideToConfirm
                label="Slide to Confirm Arrival"
                icon="checkmark-circle"
                color={colors.success[600]}
                onConfirm={signalArrival}
                resetKey={status}
              />

              {/* Secondary Utility Controls */}
              <View style={styles.secondaryControlsRow}>
                <TouchableOpacity
                  style={styles.secondaryUtilityBtn}
                  onPress={() => {
                    const dest = customerCoords || getDestinationCoords(currentBooking);
                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}`);
                  }}
                >
                  <Ionicons name="map-outline" size={16} color={colors.primary[600]} />
                  <Text style={styles.secondaryUtilityText}>Google Maps</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryUtilityBtn}
                  onPress={() => {
                    if (isTracking) {
                      locationSubRef.current?.remove();
                      setIsTracking(false);
                    } else {
                      startTracking();
                    }
                  }}
                >
                  <Ionicons name={isTracking ? "pause" : "play"} size={16} color={colors.neutral[700]} />
                  <Text style={styles.secondaryUtilityText}>{isTracking ? "Pause GPS" : "Resume GPS"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STAGE 3: Arrived (At Vehicle) â€” requires customer 4-digit PIN */}
          {status === 'arrived' && (
            <View style={styles.stageButtonGroup}>
              <View style={styles.pinBox}>
                <View style={styles.pinBoxHeader}>
                  <Ionicons name="keypad-outline" size={16} color={colors.neutral[700]} />
                  <Text style={styles.pinBoxLabel}>Enter Customer&apos;s 4-Digit Verification PIN</Text>
                  {pinVerified && (
                    <View style={styles.pinVerifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.white} />
                      <Text style={styles.pinVerifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                <Pressable onPress={() => !pinVerified && setPinModalVisible(true)}>
                  <View style={[styles.pinInputRow]}>
                    {Array.from({ length: 4 }).map((_, idx) => {
                      const digit = pinInput[idx];
                      const filled = Boolean(digit);
                      const match = pinVerified;
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.pinDisplayDigit,
                            filled && !pinVerified && styles.pinDisplayDigitFilled,
                            match && styles.pinDisplayDigitVerified,
                          ]}
                        >
                          <Text style={[styles.pinDisplayDigitText, !filled && styles.pinDisplayDigitEmpty]}>
                            {filled ? digit : (match ? 'â—' : '\u2022')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  {!pinVerified && (
                    <View style={styles.pinTapCtaRow}>
                      <Ionicons name="keypad-outline" size={14} color={colors.primary[600]} />
                      <Text style={styles.pinTapCtaText}>Tap to enter the 4-digit PIN</Text>
                    </View>
                  )}
                  {pinVerified && (
                    <Text style={styles.pinVerifiedHintText}>Customer identity confirmed</Text>
                  )}
                </Pressable>
              </View>
              <SlideToConfirm
                label="Slide to Start Repair"
                icon="construct"
                color={colors.primary[600]}
                onConfirm={() => {
                  if (!pinVerified) {
                    Alert.alert(
                      'Verification required',
                      "Enter the customer's 4-digit PIN before starting the repair."
                    );
                    return;
                  }
                  setStatus('in_progress');
                  if (bookingId) updateBookingStatus(bookingId, 'in_progress');
                }}
                resetKey={status}
              />
              <Text style={styles.stageHelperText}>
                Motorist has received confirmation that you are at their vehicle.
              </Text>
            </View>
          )}

          {/* STAGE 4: In Service (Diagnostics & Repair Session) */}
          {status === 'in_progress' && (
            <View style={styles.stageButtonGroup}>
              <SlideToConfirm
                label="Slide to Complete & Invoice"
                icon="checkmark-done-circle"
                color={colors.success[600]}
                onConfirm={handleCompleteJob}
                resetKey={status}
              />
              <View style={styles.inProgressInfoRow}>
                <Ionicons name="hourglass-outline" size={14} color={colors.warning[700]} />
                <Text style={styles.inProgressInfoText}>Active Diagnostics & Repair in Progress</Text>
              </View>
            </View>
          )}

          {/* STAGE 5: Completed */}
          {status === 'completed' && (
            <SlideToConfirm
              label="Slide to Return to Dashboard"
              icon="arrow-back"
              color={colors.neutral[800]}
              onConfirm={() => navigation.goBack()}
              resetKey={status}
            />
          )}
        </View>
      </AnimatedEntrance>

      {/* PIN entry modal â€” floats centered above the keyboard so it's never covered */}
      <Modal
        visible={pinModalVisible && !pinVerified}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.pinModalBackdrop}
        >
          <TouchableOpacity style={styles.pinModalBackdropTouch} activeOpacity={1} onPress={() => setPinModalVisible(false)} />
          <View style={styles.pinModalCard}>
            <View style={styles.pinModalHeader}>
              <Ionicons name="keypad-outline" size={18} color={colors.primary[600]} />
              <Text style={styles.pinModalTitle}>Customer Verification PIN</Text>
              <TouchableOpacity onPress={() => setPinModalVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <Text style={styles.pinModalSub}>
              Ask the customer for the 4-digit PIN shown on their tracking screen
            </Text>
            <View style={styles.pinModalDigitsRow}>
              {Array.from({ length: 4 }).map((_, idx) => {
                const digit = pinInput[idx];
                return (
                  <View
                    key={idx}
                    style={[
                      styles.pinDisplayDigit,
                      Boolean(digit) && styles.pinDisplayDigitFilled,
                      pinInput.length >= 4 && styles.pinDisplayDigitMismatch,
                    ]}
                  >
                    <Text style={styles.pinDisplayDigitText}>{digit || ''}</Text>
                  </View>
                );
              })}
            </View>
            {pinInput.length >= 4 && (
              <Text style={styles.pinModalMismatch}>Wrong PIN â€” check with the customer again</Text>
            )}
            <TextInput
              style={styles.pinModalHiddenInput}
              value={pinInput}
              onChangeText={handlePinSubmit}
              keyboardType="number-pad"
              autoFocus
              maxLength={4}
              contextMenuHidden
            />
            <TouchableOpacity style={styles.pinModalCancelBtn} onPress={() => setPinModalVisible(false)}>
              <Text style={styles.pinModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    marginTop: spacing.sm,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  hudCard: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customerAvatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  customerAvatarSmallText: {
    fontSize: 14,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  customerNameText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  serviceSubText: {
    fontSize: fontSize.xs,
    color: colors.primary[600],
    fontWeight: fontWeight.medium,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  etaText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    gap: spacing.xs,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  vehicleModelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
  },
  cambodianPlateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cambodianPlateFlag: {
    fontSize: 10,
  },
  cambodianPlateText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.warning[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  notesText: {
    fontSize: fontSize.xs,
    color: colors.warning[700],
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  overlayCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.md,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  coordsText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  updatesBadge: {
    backgroundColor: colors.success[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  updatesText: {
    fontSize: fontSize.xs,
    color: colors.success[700],
    fontWeight: fontWeight.semibold,
  },
  floatingActions: {
    position: 'absolute',
    bottom: spacing.md + 70,
    right: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  floatingActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  floatingRecenterBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  customMarkerContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  specialistHaloRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.45)',
  },
  specialistMarkerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.md,
  },
  specialistLabelPill: {
    position: 'absolute',
    top: 52,
    backgroundColor: colors.primary[700],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    ...shadows.sm,
  },
  motoristHaloRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  motoristMarkerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.md,
  },
  motoristLabelPill: {
    position: 'absolute',
    top: 52,
    backgroundColor: colors.error[700],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    ...shadows.sm,
  },
  markerLabelText: {
    fontSize: 9,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  floatingChatBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  bookingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  bookingText: {
    fontSize: fontSize.sm,
    color: colors.neutral[600],
    fontWeight: fontWeight.medium,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    minWidth: 54,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary[600],
    ...shadows.sm,
  },
  stepCircleDone: {
    backgroundColor: colors.success[600],
  },
  stepCircleInactive: {
    backgroundColor: colors.neutral[200],
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
    color: colors.neutral[400],
  },
  stepLabelActive: {
    fontWeight: fontWeight.bold,
    color: colors.primary[700],
  },
  stepLabelDone: {
    fontWeight: fontWeight.semibold,
    color: colors.success[700],
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepConnectorDone: {
    backgroundColor: colors.success[600],
  },
  stageButtonGroup: {
    gap: spacing.sm,
  },
  secondaryControlsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryUtilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    ...shadows.sm,
  },
  secondaryUtilityText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.neutral[700],
  },
  stageHelperText: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  inProgressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  inProgressInfoText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.warning[700],
  },
  navBanner: {
    position: 'absolute',
    top: spacing.md + 128,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.neutral[900],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    ...shadows.md,
  },
  navBannerDirection: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBannerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  navBannerSub: {
    fontSize: fontSize.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  navBannerEta: {
    alignItems: 'flex-end',
  },
  navBannerEtaTime: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  navBannerEtaSub: {
    fontSize: fontSize.xs,
    color: colors.success[500],
    fontWeight: fontWeight.semibold,
  },
  pinBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.md,
    ...shadows.sm,
  },
  pinBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  pinBoxLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.neutral[800],
  },
  pinVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success[600],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  pinVerifiedText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  pinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pinDisplayDigit: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDisplayDigitFilled: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  pinDisplayDigitVerified: {
    borderColor: colors.success[600],
    backgroundColor: colors.success[50],
  },
  pinDisplayDigitMismatch: {
    borderColor: colors.error[500],
    backgroundColor: colors.white,
  },
  pinDisplayDigitText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  pinDisplayDigitEmpty: {
    color: colors.neutral[300],
    fontSize: fontSize.sm,
  },
  pinTapCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  pinTapCtaText: {
    fontSize: fontSize.xs,
    color: colors.primary[700],
    fontWeight: fontWeight.semibold,
  },
  pinModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 13, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  pinModalBackdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pinModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  pinModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  pinModalTitle: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.neutral[900],
  },
  pinModalSub: {
    fontSize: fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  pinModalDigitsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  pinModalHiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  pinModalMismatch: {
    fontSize: fontSize.xs,
    color: colors.error[500],
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  pinModalCancelBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  pinModalCancelText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.neutral[700],
  },
  pinVerifiedHintText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.success[700],
    fontWeight: fontWeight.semibold,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  btnPrimary: { backgroundColor: colors.primary[600] },
  btnSuccess: { backgroundColor: colors.success[600] },
  btnDanger:  { backgroundColor: colors.error[500] },
  btnNeutral: { backgroundColor: colors.neutral[200] },
  btnTextLight: { color: colors.white, fontSize: fontSize.base, fontWeight: fontWeight.bold },
  btnTextDark:  { color: colors.neutral[800], fontSize: fontSize.base, fontWeight: fontWeight.bold },
  webMapContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  webMapInner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  webGpsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  webPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  webGpsHeaderText: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  webMapStage: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webRouteLine: {
    position: 'absolute',
    top: '40%',
    left: '28%',
    width: '45%',
    height: 3,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '32deg' }],
  },
  webMarkerPos: {
    position: 'absolute',
    alignItems: 'center',
  },
});
