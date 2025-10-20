// app/onboarding/level-selection.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { updateUserLevel } from "@database/queries";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";
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

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<Text style={styles.title}>What's your current level in {selectedLanguage}?</Text>

				<View style={styles.optionsContainer}>
					{levels.map((level) => (
						<TouchableOpacity
							key={level.code}
							style={[styles.levelOption, selectedLevel === level.code && styles.levelOptionSelected]}
							onPress={() => handleLevelSelect(level.code)}
							activeOpacity={0.7}
						>
							<View style={styles.radioContainer}>
								<View style={[styles.radioOuter, selectedLevel === level.code && styles.radioOuterSelected]}>
									{selectedLevel === level.code && <View style={styles.radioInner} />}
								</View>
							</View>
							<View style={styles.levelInfo}>
								<Text style={[styles.levelName, selectedLevel === level.code && styles.levelNameSelected]}>
									{level.code} - {level.name}
								</Text>
								<Text style={styles.levelDescription}>{level.description}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>

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
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	content: {
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.xxl,
		paddingBottom: spacing.xl,
	},
	title: {
		fontSize: 28,
		fontWeight: "700",
		color: colors.grayDarkest,
		marginBottom: spacing.xl,
		textAlign: "left",
	},
	optionsContainer: {
		gap: spacing.md,
		marginBottom: spacing.lg,
	},
	levelOption: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.md,
		borderRadius: borderRadius.sm,
		borderWidth: 1.5,
		borderColor: colors.gray200,
		backgroundColor: colors.white,
	},
	levelOptionSelected: {
		borderColor: colors.primaryAccent,
		backgroundColor: "#FEF5F3",
	},
	radioContainer: {
		marginRight: spacing.md,
	},
	radioOuter: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: colors.gray300,
		justifyContent: "center",
		alignItems: "center",
	},
	radioOuterSelected: {
		borderColor: colors.primaryAccent,
	},
	radioInner: {
		width: 12,
		height: 12,
		borderRadius: 6,
		backgroundColor: colors.primaryAccent,
	},
	levelInfo: {
		flex: 1,
	},
	levelName: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	levelNameSelected: {
		color: colors.primaryAccent,
	},
	levelDescription: {
		fontSize: 14,
		color: colors.grayMedium,
	},
	buttonContainer: {
		gap: spacing.md,
		marginTop: spacing.xl,
	},
	skipButton: {
		padding: spacing.md,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: colors.gray200,
		backgroundColor: colors.white,
	},
	skipButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.grayMedium,
	},
	continueButton: {
		padding: spacing.md,
		borderRadius: borderRadius.sm,
		backgroundColor: colors.primaryAccent,
		alignItems: "center",
	},
	continueButtonDisabled: {
		opacity: 0.5,
	},
	continueButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.white,
	},
});
