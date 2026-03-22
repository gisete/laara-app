// app/_layout.tsx - Root layout for Expo Router
import { useFonts } from "expo-font";
import {
	Lora_400Regular,
	Lora_500Medium,
	Lora_600SemiBold,
	Lora_700Bold,
	Lora_400Regular_Italic,
	Lora_700Bold_Italic,
} from "@expo-google-fonts/lora";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { initDatabase } from "@database/database";
import { getOnboardingCompleted } from "@database/queries";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
import { colors } from "@theme/colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [isReady, setIsReady] = useState(false);
	const [skipOnboarding, setSkipOnboarding] = useState(false);

	const [fontsLoaded] = useFonts({
		"Heading-Regular":    Lora_400Regular,
		"Heading-Medium":     Lora_500Medium,
		"Heading-SemiBold":   Lora_600SemiBold,
		"Heading-Bold":       Lora_700Bold,
		"Heading-Italic":     Lora_400Regular_Italic,
		"Heading-BoldItalic": Lora_700Bold_Italic,
	});

	// Database initialization — check onboarding status before rendering
	useEffect(() => {
		async function prepare() {
			try {
				await initDatabase();
				const completed = await getOnboardingCompleted();
				setSkipOnboarding(completed);
				console.log("Database initialized successfully");
			} catch (error) {
				console.error("Failed to initialize database:", error);
			} finally {
				setIsReady(true);
			}
		}

		prepare();
	}, []);

	// Once the Stack is mounted and onboarding is already done, skip straight to tabs
	useEffect(() => {
		if (isReady && fontsLoaded && skipOnboarding) {
			router.replace("/(tabs)");
		}
	}, [isReady, fontsLoaded, skipOnboarding]);

	// Font loading effect - BEFORE any conditional returns
	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded || !isReady) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={colors.accentPrimary} />
				<Text style={styles.loadingText}>Initializing Laara...</Text>
			</View>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<PortalProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="index" />
					<Stack.Screen name="language-selection" />
					<Stack.Screen name="(tabs)" />
					<Stack.Screen name="history" />
				</Stack>
			</PortalProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6B7280",
	},
});
