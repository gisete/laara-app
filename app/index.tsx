// app/index.tsx - Welcome/Intro screen
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
	const handleGetStarted = (): void => {
		// Haptic feedback for better UX
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		// Navigate to language selection (we'll create this next)
		router.push("/language-selection");
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

			<View style={styles.content}>
				{/* Illustration */}
				<View style={styles.illustrationContainer}>
					<Image
						source={require("../assets/images/graphics/intro-screen-illustration.png")}
						style={styles.illustration}
						resizeMode="contain"
					/>
				</View>

				{/* Welcome Text */}
				<View style={styles.textContainer}>
					<Text style={styles.title}>Welcome to Laara</Text>
					<Text style={styles.subtitle}>Keep your language learning tools organized, track your progress</Text>
				</View>

				{/* Get Started Button */}
				<TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.9}>
					<Text style={styles.buttonText}>Get Started</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9F6F2",
	},
	content: {
		flex: 1,
		paddingHorizontal: 32,
		paddingVertical: 60,
		justifyContent: "space-between",
		alignItems: "center",
	},
	illustrationContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 40,
	},
	illustration: {
		width: 400,
		height: 400,
	},

	// Text content
	textContainer: {
		alignItems: "center",
		paddingHorizontal: 20,
		marginBottom: 40,
	},
	title: {
		fontFamily: "Domine-Medium",
		fontSize: 28,
		fontWeight: "700",
		color: "#111827",
		marginBottom: 16,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
		lineHeight: 24,
		maxWidth: 280,
	},

	// Button
	getStartedButton: {
		backgroundColor: "#DC581F",
		paddingVertical: 18,
		paddingHorizontal: 48,
		borderRadius: 5,
		width: "100%",
		maxWidth: 330,
		alignItems: "center",
		elevation: 8,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "600",
	},
});
