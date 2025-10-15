// app/index.tsx - Welcome/Intro screen
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import your global styles and the new SVG component
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";
import IntroIllustration from "@components/svgGraphics/IntroScreen";

export default function WelcomeScreen() {
	const handleGetStarted = (): void => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/language-selection");
	};

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />
			<View style={styles.content}>
				<View style={styles.illustrationContainer}>
					<IntroIllustration width="100%" height="100%" accentColor={colors.primaryAccent} />
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>Welcome to Laara</Text>
					<Text style={styles.subtitle}>Keep your language learning tools organized, track your progress</Text>
				</View>

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
		paddingBottom: 60,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	illustrationContainer: {
		width: "70%",
		aspectRatio: 160 / 180, // Aspect ratio from the SVG's viewBox (width / height)
		marginBottom: spacing.lg,
	},
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
