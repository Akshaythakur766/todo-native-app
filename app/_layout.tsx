import { AuthProvider, useAuth } from "@/lib/authContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  function RouteGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const segments = useSegments();
    const { user, isLoadingUser } = useAuth();
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      const isAuthGroup = segments[0] === "auth";
      if (mounted && !user && !isAuthGroup && !isLoadingUser) {
        router.replace("/auth");
      } else if (mounted && user && isAuthGroup && !isLoadingUser) {
        router.replace("/");
      }
    }, [user, segments, mounted]);
    return <>{children}</>;
  }
  return (
    <AuthProvider>
      <PaperProvider theme={MD3LightTheme} >
        <SafeAreaProvider>
          <RouteGuard>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </RouteGuard>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
