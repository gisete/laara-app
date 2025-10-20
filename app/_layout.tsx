// app/_layout.tsx - Root layout for Expo Router
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { initDatabase } from "@database/database";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [isReady, setIsReady] = useState(false);

	const [fontsLoaded] = useFonts({
		"Domine-Regular": require("../assets/fonts/Domine-Regular.ttf"),
		"Domine-Medium": require("../assets/fonts/Domine-Medium.ttf"),
		"Domine-SemiBold": require("../assets/fonts/Domine-SemiBold.ttf"),
		"Domine-Bold": require("../assets/fonts/Domine-Bold.ttf"),
	});

	// Database initialization - BEFORE any conditional returns
	useEffect(() => {
		async function prepare() {
			try {
				await initDatabase();
				console.log("Database initialized successfully");
			} catch (error) {
				console.error("Failed to initialize database:", error);
			} finally {
				setIsReady(true);
			}
		}

		prepare();
	}, []);

	// Font loading effect - BEFORE any conditional returns
	useEffect(() => {
		if (fontsLoaded) {
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded || !isReady) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#FF6B35" />
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
