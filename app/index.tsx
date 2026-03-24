// app/index.tsx - Welcome/Intro screen
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { fonts } from "@theme/typography";
import IntroIllustration from "@components/svgGraphics/IntroScreen";

export default function WelcomeScreen() {
	const handleGetStarted = (): void => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/language-selection");
	};

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.surfaceDefault} />

			<ScrollView
				style={{ flex: 1 }}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.illustrationContainer}>
					<IntroIllustration width="100%" height="100%" accentColor={colors.accentPrimary} />
				</View>

				<View style={styles.textContainer}>
					<Text style={styles.title}>Welcome to Laara</Text>
					<Text style={styles.subtitle}>Keep your language learning tools organized, track your progress</Text>
				</View>
			</ScrollView>

			<View style={styles.buttonContainer}>
				<TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.9}>
					<Text style={styles.buttonText}>Get Started</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	scrollContent: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	illustrationContainer: {
		width: "70%",
		aspectRatio: 160 / 180,
		marginBottom: spacing.lg,
	},
	textContainer: {
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.xxl,
	},
	title: {
		fontFamily: fonts.heading.medium,
		fontSize: 28,
		color: colors.textPrimary,
		marginBottom: spacing.md,
		textAlign: "center",
	},
	subtitle: {
		...globalStyles.bodyMedium,
		fontSize: 16,
		color: colors.textSecondary,
		textAlign: "center",
		lineHeight: 24,
		maxWidth: 280,
	},
	buttonContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.lg,
		paddingTop: spacing.sm,
		gap: spacing.xs,
		backgroundColor: colors.appBackground,
	},
	getStartedButton: {
		...globalStyles.buttonPrimary,
		borderRadius: borderRadius.button,
		width: "100%",
	},
	buttonText: {
		...globalStyles.buttonPrimaryText,
	},
});
