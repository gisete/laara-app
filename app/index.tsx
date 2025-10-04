// app/index.tsx - Welcome/Intro screen
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import global styles
import { globalStyles } from "../theme/styles";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

export default function WelcomeScreen() {
	const handleGetStarted = (): void => {
		// Haptic feedback for better UX
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		// Navigate to language selection (we'll create this next)
		router.push("/language-selection");
	};

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

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
	content: {
		flex: 1,
		paddingHorizontal: spacing.xl,
		paddingVertical: 60,
		justifyContent: "space-between",
		alignItems: "center",
	},
	illustrationContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: spacing.xxl,
	},
	illustration: {
		width: 400,
		height: 400,
	},

	// Text content
	textContainer: {
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.xxl,
	},
	title: {
		...typography.headingMedium,
		fontSize: 28,
		color: colors.grayDarkest,
		marginBottom: spacing.md,
		textAlign: "center",
	},
	subtitle: {
		...globalStyles.bodyMedium,
		fontSize: 16,
		color: colors.grayMedium,
		textAlign: "center",
		lineHeight: 24,
		maxWidth: 280,
	},

	// Button
	getStartedButton: {
		...globalStyles.buttonPrimary,
		paddingVertical: 18,
		paddingHorizontal: 48,
		borderRadius: 5,
		width: "100%",
		maxWidth: 330,
		elevation: 8,
	},
	buttonText: {
		...globalStyles.buttonPrimaryText,
		fontSize: 18,
	},
});
