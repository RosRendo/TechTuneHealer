import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  Image,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

// Conditionally import react-native-maps only on native platforms
let MapView: any = View;
let Marker: any = View;
let Circle: any = View;
let PROVIDER_DEFAULT: any = undefined;

if (Platform.OS !== "web") {
  try {
    const maps = require("react-native-maps");
    MapView = maps.default || maps;
    Marker = maps.Marker;
    Circle = maps.Circle;
    PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
  } catch {}
}
import * as Location from "expo-location";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProviderStackParamList } from "../../navigation/types";
import {
  colors,
  spacing,
  borderRadius,
  shadows,
} from "../../constants/theme";
import { useBookingStore, useAuthStore, useLocationStore, useTranslation } from "../../store";
import { Booking } from "../../types";
import { AnimatedEntrance } from "../../components/AnimatedEntrance";
import { LanguageToggle } from "../../components/LanguageToggle";
import { AppLogo } from "../../components/AppLogo";
import { SlideToConfirm } from "../../components/SlideToConfirm";
import {
  getProviderAvatarUrl,
  getCustomerAvatarUrl,
  getServiceVisualConfig,
  getConciseLocation,
  getBookingDistanceText,
  resolveBookingCoordinates,
} from "../../utils/helpers";

const { width } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<ProviderStackParamList>;

interface BookingItemProps {
  booking: Booking & { vehicle?: any; isEmergency?: boolean };
  onPress: () => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const BookingItem: React.FC<BookingItemProps> = ({ booking, onPress, onAccept, onDecline }) => {
  const { t } = useTranslation();
  const isEmergency = Boolean(
    booking.isEmergency ||
    booking.serviceType?.toLowerCase().includes("emergency") ||
    booking.serviceType?.toLowerCase().includes("roadside") ||
    booking.notes?.toLowerCase().includes("emergency")
  );

  const customerName = booking.customer?.name || booking.customerName || "Customer";
  const serviceVisual = getServiceVisualConfig(booking.serviceType, isEmergency);
  const distanceText = getBookingDistanceText(booking.customerLocation);
  const conciseLocation = getConciseLocation(booking.customerLocation?.address);
  const plateText = booking.vehicle?.plateNumber || booking.vehicle?.licensePlate || "2A-8888";
  const price = booking.estimatedPrice || (booking as any).totalPrice || 45;

  return (
    <TouchableOpacity
      style={styles.cleanBookingCard}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Top Header: Customer Name + SOS Pill + Price */}
      <View style={styles.cleanCardHeader}>
        <View style={styles.cleanHeaderLeft}>
          <Image
            source={{ uri: getCustomerAvatarUrl(booking.customer, customerName) }}
            style={styles.customerAvatarImage}
          />
          <Text style={styles.cleanCustomerTitle} numberOfLines={1}>
            {customerName}
          </Text>
          {isEmergency && (
            <View style={styles.cleanSosBadge}>
              <Text style={styles.cleanSosBadgeText}>SOS</Text>
            </View>
          )}
        </View>
        <Text style={styles.cleanPriceTag}>${price}</Text>
      </View>

      {/* Scheduled time chip (Screen 17 appointment queue) */}
      {booking.scheduledTime && (
        <View style={styles.cleanTimeRow}>
          <Ionicons name="time-outline" size={12} color={colors.primary[600]} />
          <Text style={styles.cleanTimeChipText}>
            {booking.scheduledTime}
            {" • "}
            {booking.status === "pending" ? "Upcoming" : "Today"}
          </Text>
        </View>
      )}

      {/* 1 Ultra-Clean Subtitle Line: Service â€¢ Distance (KM) â€¢ Location */}
      <View style={styles.cleanVehicleRow}>
        <Ionicons name={serviceVisual.icon} size={13} color={colors.neutral[500]} />
        <Text style={styles.cleanServiceSubtitle}>{serviceVisual.label}</Text>
        {distanceText ? (
          <>
            <Text style={styles.cleanDot}>â€¢</Text>
            <Ionicons name="navigate" size={11} color={colors.primary[600]} />
            <Text style={styles.cleanDistanceText}>{distanceText}</Text>
          </>
        ) : null}
        <Text style={styles.cleanDot}>â€¢</Text>
        <Ionicons name="location-outline" size={12} color={colors.neutral[400]} />
        <Text style={styles.cleanMetaText} numberOfLines={1}>{conciseLocation}</Text>
      </View>

      {/* Action Footer */}
      {booking.status === "pending" && (
        <View style={styles.cleanActionRow}>
          <TouchableOpacity
            style={styles.cleanDeclineButton}
            onPress={() => onDecline(booking.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.cleanDeclineText}>{t("decline")}</Text>
          </TouchableOpacity>

          <View style={styles.cleanActionRight}>
            <TouchableOpacity
              style={styles.cleanChatButton}
              onPress={() => (booking as any).onChatPress?.(booking.id)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.neutral[700]} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cleanAcceptButton}
              onPress={() => onAccept(booking.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.cleanAcceptText}>{t("acceptJob")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {booking.status === "accepted" && (
        <View style={styles.cleanActionRow}>
          <TouchableOpacity
            style={styles.cleanDispatchButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={15} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.cleanDispatchText}>{t("startNavigation")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanChatButton}
            onPress={() => (booking as any).onChatPress?.(booking.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>
      )}

      {booking.status === "in_progress" && (
        <View style={styles.cleanActionRow}>
          <TouchableOpacity
            style={styles.cleanDispatchButton}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Ionicons name="construct" size={15} color={colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.cleanDispatchText}>Resume Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cleanChatButton}
            onPress={() => (booking as any).onChatPress?.(booking.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.neutral[700]} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, isDutyOnline, setDutyOnline, dispatchRadiusKm, isEmergencyOnCall } = useAuthStore();
  const { bookings, fetchBookings, updateBookingStatus } = useBookingStore();
  const { t, language } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"pending" | "today">("pending");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedMapBookingId, setSelectedMapBookingId] = useState<string | null>(null);
  // S18: Incoming Emergency Dispatch Alert modal state
  const [dispatchModalId, setDispatchModalId] = useState<string | null>(null);
  const [dispatchCountdown, setDispatchCountdown] = useState(30);
  const dispatchModalBooking = bookings.find((b) => b.id === dispatchModalId) || null;

  React.useEffect(() => {
    if (!dispatchModalId) return;
    const started = Date.now();
    const interval = setInterval(() => {
      const left = Math.max(0, 30 - Math.floor((Date.now() - started) / 1000));
      setDispatchCountdown(left);
      if (left === 0) {
        clearInterval(interval);
        // Timeout: pass the dispatch to the next available unit
        setDispatchModalId(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dispatchModalId]);
  const selectedMapBooking = bookings.find((b) => b.id === selectedMapBookingId) || null;
  const activeDispatch = bookings.find(
    (b) => b.status?.toLowerCase() === "accepted" || b.status?.toLowerCase() === "in_progress"
  );
  const mapRef = useRef<any>(null);

  const { setLocation: setStoreLocation } = useLocationStore();
  const [liveLocation, setLiveLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          // Instant cache from OS
          const last = await Location.getLastKnownPositionAsync();
          if (last?.coords) {
            const { latitude, longitude } = last.coords;
            setLiveLocation({ latitude, longitude });
            setStoreLocation({ latitude, longitude });
          }

          // Fresh accurate GPS fix
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (loc?.coords) {
            const { latitude, longitude } = loc.coords;
            setLiveLocation({ latitude, longitude });
            setStoreLocation({ latitude, longitude });
          }
        }
      } catch {}
    })();
  }, [setStoreLocation]);

  const providerCoords = liveLocation || {
    latitude: (user as any)?.location?.latitude || (user as any)?.lat || 11.5600,
    longitude: (user as any)?.location?.longitude || (user as any)?.lng || 104.9100,
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const handleRequestAccept = (id: string) => {
    setDispatchCountdown(30);
    setDispatchModalId(id);
  };

  const handleAcceptJob = async (id: string) => {
    try {
      // 1. Dismiss the incoming card immediately so it doesn't linger on screen
      setSelectedMapBookingId(null);
      // 2. Update status in store to 'accepted'
      await updateBookingStatus(id, "accepted");
      // 3. Prompt provider for GPS navigation dispatch
      Alert.alert(
        t("jobAccepted"),
        t("startGpsNavPrompt"),
        [
          { text: t("later"), style: "cancel" },
          {
            text: t("startNavigation"),
            onPress: () => navigation.navigate("MechanicTracking", { 
              bookingId: id,
              providerCoords: liveLocation || providerCoords,
            } as any),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(t("error"), e?.message || "Failed to accept booking.");
    }
  };

  const handleDeclineJob = (id: string) => {
    Alert.alert(
      "Decline Request",
      "Select a reason for declining this request:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Currently Busy",
          onPress: async () => {
            setSelectedMapBookingId(null);
            await updateBookingStatus(id, "cancelled");
          },
        },
        {
          text: "Out of Service Area",
          onPress: async () => {
            setSelectedMapBookingId(null);
            await updateBookingStatus(id, "cancelled");
          },
        },
        {
          text: "Specialized Tools Needed",
          onPress: async () => {
            setSelectedMapBookingId(null);
            await updateBookingStatus(id, "cancelled");
          },
        },
      ]
    );
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === "pending") return booking.status?.toLowerCase() === "pending";
    if (activeFilter === "today") {
      const today = new Date().toDateString();
      return new Date(booking.scheduledDate).toDateString() === today;
    }
    return true;
  });

  const radarBookings = bookings.filter((b) => {
    const status = b.status?.toLowerCase();
    return status === "pending" || status === "accepted" || status === "in_progress";
  });

  const todayBookings = bookings.filter((booking) => {
    const today = new Date().toDateString();
    return new Date(booking.scheduledDate).toDateString() === today;
  });

  const pendingBookings = bookings.filter((b) => b.status?.toLowerCase() === "pending");
  const completedThisMonth = bookings.filter((b) => {
    const thisMonth = new Date().getMonth();
    return (
      b.status?.toLowerCase() === "completed" &&
      new Date(b.scheduledDate).getMonth() === thisMonth
    );
  });

  const monthlyRevenue = completedThisMonth.reduce(
    (sum, b) => sum + (b.finalPrice || b.estimatedPrice || b.estimatedCost || 0),
    0
  );
  const displayEarnings = monthlyRevenue > 0 ? `$${monthlyRevenue.toLocaleString()}` : "$1,250";

  // â”€â”€â”€ FULL-SCREEN MAP RADAR (NO HEADER, EDGE-TO-EDGE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (viewMode === "map") {
    return (
      <View style={styles.fullScreenMapContainer}>
        {/* Full-Screen Edge-to-Edge Map */}
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          initialRegion={{
            latitude: providerCoords.latitude,
            longitude: providerCoords.longitude,
            latitudeDelta: 0.09,
            longitudeDelta: 0.09,
          }}
          showsCompass={false}
          showsUserLocation={true}
        >
          {/* Dispatch Coverage Radius Circle */}
          <Circle
            center={providerCoords}
            radius={(dispatchRadiusKm || 20) * 1000}
            strokeColor="rgba(15, 23, 42, 0.25)"
            fillColor="rgba(15, 23, 42, 0.03)"
            strokeWidth={1.5}
          />

          {/* Workshop Base HQ Pin */}
          <Marker
            coordinate={providerCoords}
            title={user?.name || "Your Workshop Base"}
            description={`${dispatchRadiusKm || 20}km Dispatch Center`}
          >
            <View style={styles.radarWorkshopPin}>
              <Ionicons name="construct" size={14} color={colors.white} />
            </View>
          </Marker>

          {/* Active & Incoming Dispatch Radar Pins */}
          {radarBookings.map((b) => {
            const coords = resolveBookingCoordinates(b);
            const lat = coords.latitude;
            const lng = coords.longitude;
            if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return null;

            const isSelected = selectedMapBookingId === b.id;
            const isAccepted = b.status?.toLowerCase() === "accepted" || b.status?.toLowerCase() === "in_progress";
            const isEmergency = Boolean(
              b.isEmergency ||
              b.serviceType?.toLowerCase().includes("emergency") ||
              b.serviceType?.toLowerCase().includes("roadside")
            );
            const price = b.estimatedPrice || (b as any).totalPrice || 45;

            return (
              <Marker
                key={`pin-full-${b.id}`}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => {
                  setSelectedMapBookingId(b.id);
                  mapRef.current?.animateToRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                  }, 400);
                }}
              >
                <View
                  style={[
                    styles.radarPinPill,
                    isEmergency && !isAccepted && styles.radarPinPillEmergency,
                    isAccepted && styles.radarPinPillAccepted,
                    isSelected && styles.radarPinPillSelected,
                  ]}
                >
                  <Ionicons
                    name={isAccepted ? "navigate" : isEmergency ? "warning" : "briefcase"}
                    size={11}
                    color={colors.white}
                  />
                  <Text style={styles.radarPinPrice}>{isAccepted ? "En Route" : `$${price}`}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Minimal Floating Top Bar (Uber Driver Style, No Header Text) */}
        <SafeAreaView edges={["top"]} style={styles.floatingTopBar}>
          <View style={styles.floatingTopRow}>
            {/* Duty Status Pill */}
            <TouchableOpacity
              style={[
                styles.floatingDutyPill,
                isDutyOnline ? styles.dutyOnlinePill : styles.dutyOfflinePill,
              ]}
              onPress={() => setDutyOnline(!isDutyOnline)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dutyDot,
                  isDutyOnline ? styles.dutyDotOnline : styles.dutyDotOffline,
                ]}
              />
              <Text
                style={[
                  styles.dutyText,
                  isDutyOnline ? styles.dutyTextOnline : styles.dutyTextOffline,
                ]}
              >
                {isDutyOnline ? "Online" : "Offline"}
              </Text>
            </TouchableOpacity>

            {/* View Mode Toggle: Switch back to List */}
            <View style={styles.floatingViewToggle}>
              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setViewMode("list")}
                activeOpacity={0.8}
              >
                <Ionicons name="list" size={13} color={colors.neutral[600]} />
                <Text style={styles.toggleBtnText}>List</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, styles.toggleBtnActive]}
                onPress={() => setViewMode("map")}
                activeOpacity={0.8}
              >
                <Ionicons name="map" size={13} color={colors.white} />
                <Text style={[styles.toggleBtnText, styles.toggleBtnTextActive]}>Radar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Floating Recenter Map Button */}
        <TouchableOpacity
          style={[
            styles.floatingRecenterBtn,
            { bottom: selectedMapBooking ? 255 : (activeDispatch ? 86 : 44) },
          ]}
          onPress={() => {
            mapRef.current?.animateToRegion({
              latitude: providerCoords.latitude,
              longitude: providerCoords.longitude,
              latitudeDelta: 0.08,
              longitudeDelta: 0.08,
            }, 400);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={20} color={colors.neutral[800]} />
        </TouchableOpacity>

        {/* Floating Bottom Card: Selected Job or Status Pill */}
        {selectedMapBooking ? (
          <View style={styles.floatingBottomCardWrapper}>
            <View style={styles.radarCardDismissRow}>
              <Text style={styles.radarCardDismissLabel}>
                {selectedMapBooking.status?.toLowerCase() === "accepted" || selectedMapBooking.status?.toLowerCase() === "in_progress"
                  ? "ðŸš— Active Dispatch Â· En Route"
                  : selectedMapBooking.isEmergency
                    ? "ðŸš¨ Urgent Breakdown"
                    : "Scheduled Dispatch"}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedMapBookingId(null)}
                style={styles.radarCardCloseBtn}
              >
                <Ionicons name="close" size={16} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <BookingItem
              booking={{
                ...selectedMapBooking,
                onChatPress: (id: string) => navigation.navigate("Chat", { bookingId: id } as any),
              } as any}
              onPress={() => navigation.navigate("MechanicTracking", { 
                bookingId: selectedMapBooking.id,
                providerCoords: liveLocation || providerCoords,
              } as any)}
              onAccept={handleRequestAccept}
              onDecline={handleDeclineJob}
            />
          </View>
        ) : activeDispatch ? (
          <TouchableOpacity
            style={styles.floatingActiveDispatchPill}
            onPress={() => navigation.navigate("MechanicTracking", { 
              bookingId: activeDispatch.id,
              providerCoords: liveLocation || providerCoords,
            } as any)}
            activeOpacity={0.85}
          >
            <View style={styles.activeDispatchPillLeft}>
              <View style={styles.activePillDotGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activeDispatchPillTitle} numberOfLines={1}>
                  {language === "km" ? "áž€áŸ†áž–áž»áž„áž’áŸ’ážœáž¾ážŠáŸ†ážŽáž¾ážš Â· " : "En Route Â· "}
                  {activeDispatch.customerName || (language === "km" ? "áž¢ážáž·ážáž·áž‡áž“" : "Customer")}
                </Text>
                <Text style={styles.activeDispatchPillSub} numberOfLines={1}>
                  {activeDispatch.serviceType}
                </Text>
              </View>
            </View>
            <View style={styles.activeDispatchOpenBtn}>
              <Ionicons name="navigate" size={13} color={colors.white} />
              <Text style={styles.activeDispatchOpenText}>
                {language === "km" ? "áž”áž¾áž€áž•áŸ’áž›áž¼ážœ" : "Open Route"}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.floatingCounterPill}>
            <View style={styles.floatingPulseDot} />
            <Text style={styles.floatingCounterText}>
              {radarBookings.filter((b) => b.status?.toLowerCase() === "pending").length}{" "}
              {language === "km"
                ? "ážŸáŸ†ážŽáž¾áž€áŸ’áž“áž»áž„ážáŸ†áž”áž“áŸ‹ Â· áž…áž»áž…áž›áž¾áž˜áŸ’áž‡áž»áž›ážŠáž¾áž˜áŸ’áž”áž¸áž˜áž¾áž›"
                : "incoming requests in range Â· Tap a pin"}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header with Duty Toggle */}
      <AnimatedEntrance delay={0} direction="down">
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => (navigation as any).navigate("Profile")}
            activeOpacity={0.8}
          >
            <View style={styles.avatarLarge}>
              <Image
                source={{ uri: getProviderAvatarUrl(user) }}
                style={styles.avatarLargeImage}
              />
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={11} color={colors.white} />
              </View>
            </View>
            <View>
              <View style={{ marginBottom: 2 }}>
                <AppLogo variant="dark" width={68} />
              </View>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>{t("welcomeBack")}</Text>
                <View style={styles.masterBadge}>
                  <Text style={styles.masterBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.userName}>{user?.name?.split(' ')[0] || "Specialist"}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <LanguageToggle compact={true} />
            {/* Real-Time Duty Status Toggle Switch */}
            <TouchableOpacity
              style={[
                styles.dutyTogglePill,
                isDutyOnline ? styles.dutyOnlinePill : styles.dutyOfflinePill,
              ]}
              onPress={() => setDutyOnline(!isDutyOnline)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dutyDot,
                  isDutyOnline ? styles.dutyDotOnline : styles.dutyDotOffline,
                ]}
              />
              <Text
                style={[
                  styles.dutyText,
                  isDutyOnline ? styles.dutyTextOnline : styles.dutyTextOffline,
                ]}
              >
                {isDutyOnline ? t("online") : t("offline")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.neutral[700]} />
              {pendingBookings.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{pendingBookings.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </AnimatedEntrance>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
      >
        {/* Sleek 1-Line Offline Banner & Glance Card */}
        <AnimatedEntrance delay={80} direction="up">
          {!isDutyOnline && (
            <TouchableOpacity
              style={styles.compactOfflineBar}
              onPress={() => setDutyOnline(true)}
              activeOpacity={0.8}
            >
              <View style={styles.offlineDot} />
              <Text style={styles.compactOfflineText}>
                {t("dutyOfflineSubtitle")}
              </Text>
              <Text style={styles.compactOfflineAction}>{t("online")}</Text>
            </TouchableOpacity>
          )}

          {/* Today's Performance Metrics — 4 Grid Tiles (Batch 5 / Screen 17) */}
          <View style={styles.metricGrid}>
            <View style={styles.metricTile}>
              <View style={[styles.metricIcon, { backgroundColor: colors.success[50] }]}>
                <Ionicons name="wallet-outline" size={14} color={colors.success[600]} />
              </View>
              <Text style={styles.metricValue}>{displayEarnings}</Text>
              <Text style={[styles.metricSub, { color: colors.success[600] }]}>Today&apos;s Earnings</Text>
            </View>

            <View style={styles.metricTile}>
              <View style={[styles.metricIcon, { backgroundColor: colors.primary[50] }]}>
                <Ionicons name="checkmark-done-circle" size={14} color={colors.primary[600]} />
              </View>
              <Text style={styles.metricValue}>{todayBookings.length} Jobs</Text>
              <Text style={styles.metricSub}>Avg. ~38 mins/job</Text>
            </View>

            <View style={styles.metricTile}>
              <View style={[styles.metricIcon, { backgroundColor: colors.warning[50] }]}>
                <Ionicons name="stats-chart-outline" size={14} color={colors.warning[600]} />
              </View>
              <Text style={styles.metricValue}>
                {bookings.length > 0
                  ? `${Math.round(
                      (bookings.filter((b) => b.status?.toLowerCase() !== "cancelled").length /
                        bookings.length) *
                        100
                    )}%`
                  : "98%"}
              </Text>
              <Text style={styles.metricSub}>Acceptance Rate</Text>
            </View>

            <View style={styles.metricTile}>
              <View style={[styles.metricIcon, { backgroundColor: colors.secondary[50] }]}>
                <Ionicons name="star" size={14} color={colors.secondary[600]} />
              </View>
              <Text style={styles.metricValue}>4.9 ★</Text>
              <Text style={styles.metricSub}>
                {bookings.filter((b) => b.status?.toLowerCase() === "completed").length || 12} reviews
              </Text>
            </View>
          </View>
        </AnimatedEntrance>

        {/* Compact Readiness Strip */}
        <AnimatedEntrance delay={140} direction="up">
          <View style={styles.compactReadinessRow}>
            <TouchableOpacity
              style={styles.compactChip}
              onPress={() => (navigation as any).navigate("Profile")}
              activeOpacity={0.7}
            >
              <Ionicons name="radio" size={13} color={colors.primary[600]} />
              <Text style={styles.compactChipText}>{dispatchRadiusKm || 20} km {t("distance")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.compactChip, isEmergencyOnCall && styles.compactChipActive]}
              onPress={() => (navigation as any).navigate("Profile")}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isEmergencyOnCall ? "moon" : "sunny-outline"}
                size={13}
                color={isEmergencyOnCall ? colors.secondary[600] : colors.neutral[400]}
              />
              <Text style={[styles.compactChipText, isEmergencyOnCall && { color: colors.secondary[700], fontWeight: "700" }]}>
                {isEmergencyOnCall
                  ? (language === "km" ? "ážœáŸáž“áž™áž”áŸ‹ 24/7" : "24/7 Night Duty")
                  : (language === "km" ? "áž˜áŸ‰áŸ„áž„áž’áž˜áŸ’áž˜ážáž¶" : "Normal Hours")}
              </Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>

        {/* Bookings Section */}
        <AnimatedEntrance delay={190} direction="up">
          <View style={styles.bookingsSection}>
            <View style={styles.bookingsHeader}>
              <View>
                <Text style={styles.sectionTitle}>{t("providerDashboard")}</Text>
              </View>

              <View style={styles.headerControlsRow}>
                {/* Segmented View Mode Toggle: List vs Map Radar */}
                <View style={styles.viewToggle}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, styles.toggleBtnActive]}
                    onPress={() => setViewMode("list")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="list"
                      size={13}
                      color={colors.white}
                    />
                    <Text style={[styles.toggleBtnText, styles.toggleBtnTextActive]}>
                      {t("listView")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => setViewMode("map")}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="map"
                      size={13}
                      color={colors.neutral[600]}
                    />
                    <Text style={styles.toggleBtnText}>
                      {t("radarView")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tab Filter: Pending Requests vs Today's Schedule */}
            <View style={styles.filterTabs}>
              {(["pending", "today"] as const).map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterTabText, activeFilter === filter && styles.filterTabTextActive]}>
                    {filter === "pending" ? `${t("pendingJobs")} (${pendingBookings.length})` : `${t("todayJobs")} (${todayBookings.length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredBookings.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="folder-open" size={40} color={colors.neutral[400]} />
                </View>
                <Text style={styles.emptyStateTitle}>
                  {language === "km"
                    ? (activeFilter === "pending" ? "áž˜áž·áž“áž˜áž¶áž“áž€áž¶ážšáž„áž¶ážšážšáž„áŸ‹áž…áž¶áŸ†áž‘áŸ" : "áž˜áž·áž“áž˜áž¶áž“áž€áž¶ážšáž„áž¶ážšážáŸ’áž„áŸƒáž“áŸáŸ‡áž‘áŸ")
                    : `No ${activeFilter} jobs`}
                </Text>
                <Text style={styles.emptyStateSubtitle}>
                  {language === "km"
                    ? "áž¢áŸ’áž“áž€áž”áž¶áž“áž–áž·áž“áž·ážáŸ’áž™ážšáž½áž…ážšáž¶áž›áŸ‹áž áž¾áž™! ážŸáž¼áž˜áž”áŸ’ážšáž¶áž€ážŠážáž¶áž”áž¶áž“áž”áž¾áž€áž‘áž‘áž½áž›áž€áž¶ážšáž„áž¶ážš ážŠáž¾áž˜áŸ’áž”áž¸áž‘áž‘áž½áž›áž”áž¶áž“áž€áž¶ážšáž‡áž¼áž“ážŠáŸ†ážŽáž¹áž„ážŸáž„áŸ’áž‚áŸ’ážšáŸ„áŸ‡áž”áž“áŸ’áž‘áž¶áž“áŸ‹áŸ”"
                    : "You are all caught up! Make sure you are Online to receive emergency alerts."}
                </Text>
              </View>
            ) : (
              filteredBookings.slice(0, 10).map((booking) => (
                <BookingItem
                  key={booking.id}
                  booking={{
                    ...booking,
                    onChatPress: (id: string) => navigation.navigate("Chat", { bookingId: id } as any),
                  } as any}
                  onPress={() => navigation.navigate("MechanicTracking", { 
                    bookingId: booking.id,
                    providerCoords: liveLocation || providerCoords,
                  } as any)}
                  onAccept={handleRequestAccept}
                  onDecline={handleDeclineJob}
                />
              ))
            )}
          </View>
        </AnimatedEntrance>
      </ScrollView>

      {/* S18: Incoming Emergency Dispatch Alert Modal */}
      <Modal
        visible={Boolean(dispatchModalBooking)}
        transparent
        animationType="slide"
        onRequestClose={() => setDispatchModalId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.dispatchModalCard}>
            {/* Urgency header with countdown */}
            <View style={styles.dispatchUrgencyRow}>
              <View style={styles.countdownRing}>
                <Text style={styles.countdownText}>
                  {dispatchModalBooking?.isEmergency ? `00:${String(dispatchCountdown).padStart(2, "0")}` : "—"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dispatchModalTitle}>Urgent Roadside Dispatch Request</Text>
                <Text style={styles.dispatchModalSubtitle}>
                  Disposable response window — passes to the next unit on expiry
                </Text>
              </View>
            </View>

            {/* Payout & Distance highlight */}
            <View style={styles.dispatchHighlightRow}>
              <View style={styles.dispatchHighlightBox}>
                <Text style={styles.dispatchHighlightLabel}>Net Payout</Text>
                <Text style={styles.dispatchHighlightValue}>
                  ${dispatchModalBooking?.estimatedPrice || (dispatchModalBooking as any)?.totalPrice || 45}
                </Text>
              </View>
              <View style={styles.dispatchHighlightDivider} />
              <View style={styles.dispatchHighlightBox}>
                <Text style={styles.dispatchHighlightLabel}>Distance</Text>
                <Text style={styles.dispatchHighlightValue}>
                  {getBookingDistanceText(dispatchModalBooking?.customerLocation) || "1.4 km"}
                </Text>
              </View>
            </View>

            {/* Incident & vehicle details */}
            <View style={styles.dispatchDetailsCard}>
              <View style={styles.dispatchDetailRow}>
                <Ionicons name="construct-outline" size={14} color={colors.primary[600]} />
                <Text style={styles.dispatchDetailValue} numberOfLines={1}>
                  {dispatchModalBooking?.serviceType || "Emergency Battery Jumpstart & Diagnostic"}
                </Text>
              </View>
              <View style={styles.dispatchDetailRow}>
                <Ionicons name="location-outline" size={14} color={colors.neutral[500]} />
                <Text style={styles.dispatchDetailValue} numberOfLines={1}>
                  {getConciseLocation(dispatchModalBooking?.customerLocation?.address) ||
                    "Russian Blvd (Near Pochentong Flyover)"}
                </Text>
              </View>
              <View style={styles.dispatchDetailRow}>
                <Ionicons name="car-sport-outline" size={14} color={colors.neutral[500]} />
                <Text style={styles.dispatchDetailValue} numberOfLines={1}>
                  {dispatchModalBooking?.vehicle?.make || "Toyota"}{" "}
                  {dispatchModalBooking?.vehicle?.model || "Hilux Revo"}{" "}
                  (Plate: {dispatchModalBooking?.vehicle?.plateNumber || "2BB-1234"})
                </Text>
              </View>
              {Boolean(dispatchModalBooking?.notes) && (
                <View style={styles.dispatchNoteRow}>
                  <Text style={styles.dispatchNoteText} numberOfLines={2}>
                    &ldquo;{dispatchModalBooking?.notes}&rdquo;
                  </Text>
                </View>
              )}
            </View>

            {/* Swipe-to-accept + decline */}
            {dispatchModalBooking && (
              <SlideToConfirm
                label="Swipe to Accept Dispatch"
                icon="checkmark"
                color={colors.success[600]}
                onConfirm={() => {
                  const id = dispatchModalBooking.id;
                  setDispatchModalId(null);
                  handleAcceptJob(id);
                }}
                resetKey={dispatchModalBooking.id}
              />
            )}

            <TouchableOpacity
              style={styles.declineDispatchButton}
              onPress={() => {
                const id = dispatchModalId;
                setDispatchModalId(null);
                if (id) handleDeclineJob(id);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.declineDispatchText}>
                {t("decline")} (Pass to Next Unit)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[700],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.sm,
    position: "relative",
  },
  avatarLargeImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary[600],
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  masterBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  masterBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary[700],
    letterSpacing: 0.5,
  },
  avatarLargeText: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
  },
  greeting: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.5,
  },
  dutyTogglePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  dutyOnlinePill: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[100],
  },
  dutyOfflinePill: {
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[300],
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dutyDotOnline: {
    backgroundColor: colors.success[500],
  },
  dutyDotOffline: {
    backgroundColor: colors.neutral[400],
  },
  dutyText: {
    fontSize: 12,
    fontWeight: "700",
  },
  dutyTextOnline: {
    color: colors.success[700],
  },
  dutyTextOffline: {
    color: colors.neutral[600],
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.neutral[100],
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  notificationBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing["4xl"],
  },
  // Compact Offline Bar
  compactOfflineBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning[50],
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning[100],
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning[600],
  },
  compactOfflineText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.warning[700],
  },
  compactOfflineAction: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary[700],
  },

  // Today's Performance Metrics — 4 grid tiles (Batch 5 Screen 17)
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  metricTile: {
    flex: 1,
    minWidth: (width - spacing.xl * 2 - spacing.sm * 3) / 2,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    ...shadows.sm,
  },
  metricIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
    letterSpacing: -0.3,
  },
  metricSub: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.neutral[500],
    marginTop: 2,
  },

  // Compact Readiness Strip
  compactReadinessRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  compactChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    gap: 6,
  },
  compactChipActive: {
    backgroundColor: colors.secondary[50],
    borderColor: colors.secondary[100],
  },
  compactChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[700],
  },

  // Bookings Section
  bookingsSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  bookingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  headerControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: colors.neutral[200],
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
  },
  toggleBtnActive: {
    backgroundColor: colors.neutral[900],
    ...shadows.sm,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.neutral[600],
  },
  toggleBtnTextActive: {
    color: colors.white,
  },
  viewAllBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: "700",
  },
  fullScreenMapContainer: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    position: "relative",
  },
  floatingTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === "android" ? spacing.md : 0,
  },
  floatingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  floatingDutyPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...shadows.md,
  },
  floatingViewToggle: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...shadows.md,
  },
  radarWorkshopPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.neutral[900],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.sm,
  },
  radarPinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.neutral[800],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.white,
    ...shadows.sm,
  },
  radarPinPillEmergency: {
    backgroundColor: colors.error[600],
  },
  radarPinPillAccepted: {
    backgroundColor: "#059669",
  },
  radarPinPillSelected: {
    backgroundColor: colors.neutral[900],
    borderWidth: 2,
    borderColor: colors.white,
    transform: [{ scale: 1.15 }],
  },
  radarPinPrice: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.white,
  },
  floatingRecenterBtn: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    zIndex: 15,
    ...shadows.lg,
  },
  floatingBottomCardWrapper: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    zIndex: 20,
    ...shadows.lg,
  },
  radarCardDismissRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  radarCardDismissLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[400],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  radarCardCloseBtn: {
    padding: 4,
  },
  floatingCounterPill: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.neutral[900],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 15,
    ...shadows.lg,
  },
  floatingPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error[500],
  },
  floatingCounterText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  floatingActiveDispatchPill: {
    position: "absolute",
    bottom: 20,
    left: 12,
    right: 12,
    backgroundColor: "#0F172A",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    ...shadows.lg,
  },
  activeDispatchPillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  activePillDotGreen: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },
  activeDispatchPillTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  activeDispatchPillSub: {
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 1,
  },
  activeDispatchOpenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#059669",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeDispatchOpenText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.white,
  },
  filterTabs: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral[200],
    padding: 4,
    borderRadius: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  filterTabActive: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  filterTabTextActive: {
    color: colors.neutral[900],
    fontWeight: "800",
  },
  emptyStateContainer: {
    alignItems: "center",
    backgroundColor: colors.white,
    paddingVertical: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.neutral[900],
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 4,
    textAlign: "center",
  },

  // Clean Minimalist Booking Card (Uber / Apple style)
  cleanBookingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadows.sm,
  },
  cleanEmergencyAccent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error[500],
  },
  cleanCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cleanHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    marginRight: spacing.sm,
  },
  customerAvatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[200],
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cleanCustomerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  cleanServiceSubtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  cleanSosBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cleanSosBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.neutral[700],
    letterSpacing: 0.5,
  },
  cleanServiceTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.neutral[900],
    flex: 1,
  },
  cleanPriceTag: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  cleanVehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  cleanVehicleTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.neutral[800],
  },
  cleanTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary[50],
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  cleanTimeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary[700],
  },
  cleanDot: {
    fontSize: 12,
    color: colors.neutral[400],
  },
  cleanDistanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary[700],
  },
  cleanPlateBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.neutral[600],
  },
  cleanMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  cleanMetaText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  cleanTimeText: {
    fontSize: 12,
    color: colors.neutral[500],
    fontWeight: "500",
  },
  cleanNoteLine: {
    fontSize: 12,
    color: colors.neutral[500],
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  cleanActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.04)",
  },
  cleanActionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cleanDeclineButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cleanDeclineText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[500],
  },
  cleanChatButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
  },
  cleanAcceptButton: {
    backgroundColor: "#0F172A",
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cleanAcceptEmergencyButton: {
    backgroundColor: "#0F172A",
  },
  cleanAcceptText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },
  cleanDispatchButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  cleanDispatchText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white,
  },

  // S18: Incoming Emergency Dispatch Alert modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
  dispatchModalCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.lg,
  },
  dispatchUrgencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  countdownRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: colors.error[500],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.error[50],
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.error[600],
  },
  dispatchModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.neutral[900],
  },
  dispatchModalSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  dispatchHighlightRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral[50],
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  dispatchHighlightBox: {
    flex: 1,
    alignItems: "center",
  },
  dispatchHighlightDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.neutral[200],
  },
  dispatchHighlightLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.neutral[500],
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  dispatchHighlightValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.success[700],
    marginTop: 2,
  },
  dispatchDetailsCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    padding: spacing.md,
    gap: 8,
  },
  dispatchDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dispatchDetailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[800],
  },
  dispatchNoteRow: {
    backgroundColor: colors.warning[50],
    borderRadius: 10,
    padding: spacing.sm,
  },
  dispatchNoteText: {
    fontSize: 12,
    color: colors.warning[700],
    fontStyle: "italic",
  },
  declineDispatchButton: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  declineDispatchText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.neutral[600],
  },
});
