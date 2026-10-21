import { Redirect } from "expo-router";
import { Alert } from "react-native";
import { useEffect } from "react";
import { useAuthStore } from "../src/store";

export default function Index() {
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();

  // Admin accounts have no in-app UI — the ops portal is the admin-web website.
  // Without this an admin loops forever between the role guards.
  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "admin") {
      Alert.alert(
        "Accounts Managed on Web Console",
        "Administrator accounts use the TechTune Admin web console (admin.techune-healer). You have been signed out. Sign in with a customer or mechanic account to use the mobile app.",
        [{ text: "OK", onPress: () => { logout(); } }]
      );
    }
  }, [isLoading, isAuthenticated, user, logout]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === "provider") {
    return <Redirect href="/(provider)" />;
  }

  if (user?.role === "admin") {
    // Avoid the (customer) guard bounce loop: send to welcome, alert above signs out
    return null;
  }

  return <Redirect href="/(customer)" />;
}
