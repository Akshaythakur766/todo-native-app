import { AuthProvider, useAuth } from "@/lib/authContext";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

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
    }, [user, segments]);
    return <>{children}</>;
  }
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}
