// app/onboarding/level-selection.tsx
import React, { useState } from "react";
import Svg, { Path } from "react-native-svg";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { updateUserLevel, setOnboardingCompleted } from "@database/queries";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { fonts } from "@theme/typography";
import { globalStyles } from "@theme/styles";

interface LevelOption {
	code: string;
	name: string;
	description: string;
}

export default function LevelSelectionScreen() {
	const params = useLocalSearchParams();
	const selectedLanguage = params.language as string;

	const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const levels: LevelOption[] = [
		{ code: "A1", name: "Beginner", description: "Just starting out" },
		{ code: "A2", name: "Elementary", description: "Simple conversations" },
		{ code: "B1", name: "Intermediate", description: "Can get by comfortably" },
		{ code: "B2", name: "Upper-Intermediate", description: "Professional level" },
		{ code: "C1", name: "Advanced", description: "Near-fluent" },
		{ code: "C2", name: "Mastery", description: "Native-like fluency" },
	];

	const handleLevelSelect = (levelCode: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setSelectedLevel(levelCode);
	};

	const handleSkip = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		try {
			setLoading(true);
			await updateUserLevel(null);
			await setOnboardingCompleted();
			router.replace("/(tabs)");
		} catch (error) {
			console.error("Error skipping level:", error);
			Alert.alert("Error", "Failed to continue. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleContinue = async () => {
		if (!selectedLevel) {
			Alert.alert("Select a Level", "Please select your proficiency level or skip.");
			return;
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		try {
			setLoading(true);
			await updateUserLevel(selectedLevel);
			await setOnboardingCompleted();
			router.replace("/(tabs)");
		} catch (error) {
			console.error("Error saving level:", error);
			Alert.alert("Error", "Failed to save level. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.screen}>
				<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
					<Text style={styles.title}>What's your current level in {selectedLanguage}?</Text>

					<View style={styles.optionsContainer}>
						{levels.map((level) => (
							<TouchableOpacity
								key={level.code}
								style={styles.levelOption}
								onPress={() => handleLevelSelect(level.code)}
								activeOpacity={0.7}
							>
								<View style={styles.levelInfo}>
									<Text style={styles.levelName}>{level.code} – {level.name}</Text>
									<Text style={styles.levelDescription}>{level.description}</Text>
								</View>
								<Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={selectedLevel !== level.code && styles.checkmarkHidden}>
						<Path d="M5 12L10 17L19 8" stroke={colors.primaryAccent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
					</Svg>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>

				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={loading} activeOpacity={0.7}>
						<Text style={styles.skipButtonText}>Not sure / Skip</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.continueButton, (!selectedLevel || loading) && styles.continueButtonDisabled]}
						onPress={handleContinue}
						disabled={!selectedLevel || loading}
						activeOpacity={0.8}
					>
						<Text style={styles.continueButtonText}>{loading ? "Saving..." : "Continue"}</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
	},
	title: {
		fontFamily: fonts.heading.medium,
		fontSize: 26,
		color: colors.grayDarkest,
		marginBottom: spacing.xl,
		textAlign: "left",
	},
	optionsContainer: {
		marginBottom: spacing.lg,
	},
	levelOption: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.white,
		borderRadius: borderRadius.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
		padding: spacing.md,
		marginBottom: spacing.xs,
	},
	levelInfo: {
		flex: 1,
	},
	levelName: {
		fontSize: 16,
		fontWeight: "500",
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	levelDescription: {
		fontSize: 14,
		color: colors.grayMedium,
	},
	checkmarkHidden: {
		opacity: 0,
	},
	buttonContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.lg,
		paddingTop: spacing.sm,
		gap: spacing.xs,
		backgroundColor: colors.appBackground,
	},
	skipButton: {
		height: 56,
		borderRadius: borderRadius.button,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: colors.gray200,
		backgroundColor: colors.white,
	},
	skipButtonText: {
		fontSize: 16,
		fontWeight: "500",
		color: colors.grayMedium,
	},
	continueButton: {
		height: 56,
		borderRadius: borderRadius.button,
		backgroundColor: colors.primaryAccent,
		alignItems: "center",
		justifyContent: "center",
	},
	continueButtonDisabled: {
		opacity: 0.5,
	},
	continueButtonText: {
		fontSize: 16,
		fontWeight: "500",
		color: colors.buttonOnAccentText,
	},
});
