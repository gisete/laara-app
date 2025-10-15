// app/log-session/details.tsx
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import database queries
import {
	getOrCreateTodaySession,
	addSessionActivity,
	updateSessionTotalDuration,
	updateMaterialProgress,
} from "@database/queries";

// Import components
import CardCover from "@components/tabs/library/CardCover";
import ActivityDetailsForm from "@components/logSession/ActivityDetailsForm";

// Import utils
import { validateActivityForm } from "@utils/activityLogValidation";

// Import theme
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";

export default function SessionDetailsScreen() {
	const params = useLocalSearchParams();
	const [loading, setLoading] = useState(false);

	// Time state
	const [timeMode, setTimeMode] = useState<"quick" | "custom" | null>(null);
	const [selectedQuickTime, setSelectedQuickTime] = useState<number | null>(null);
	const [customTime, setCustomTime] = useState("");

	// Units state
	const [pagesRead, setPagesRead] = useState("");
	const [chaptersRead, setChaptersRead] = useState("");
	const [unitsStudied, setUnitsStudied] = useState("");

	const handleQuickTimeSelect = (minutes: number) => {
		setTimeMode("quick");
		setSelectedQuickTime(minutes);
		setCustomTime(""); // Clear custom input
	};

	const handleCustomTimeChange = (text: string) => {
		setTimeMode("custom");
		setCustomTime(text);
		setSelectedQuickTime(null); // Clear quick selection
	};

	const getTimeValue = (): number | null => {
		if (timeMode === "quick" && selectedQuickTime) return selectedQuickTime;
		if (timeMode === "custom" && customTime) return parseInt(customTime, 10);
		return null;
	};

	const handleSaveActivity = async () => {
		const timeValue = getTimeValue();
		const totalProgress = params.totalProgress ? parseInt(params.totalProgress as string, 10) : null;
		const currentProgress = params.currentProgress ? parseInt(params.currentProgress as string, 10) : 0;

		// Validate form using utility function
		const isValid = validateActivityForm({
			materialType: params.materialType as string,
			totalProgress,
			currentProgress,
			timeValue,
			pagesRead,
			chaptersRead,
			unitsStudied,
		});

		if (!isValid) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

			// Step 1: Get or create today's session
			const session = await getOrCreateTodaySession(today);
			console.log("Got session:", session.id);

			// Step 2: Determine units_studied based on material type
			let unitsValue: number | null = null;

			if (params.materialType === "book") {
				// Prioritize pages over chapters
				if (pagesRead && parseInt(pagesRead, 10) > 0) {
					unitsValue = parseInt(pagesRead, 10);
				} else if (chaptersRead && parseInt(chaptersRead, 10) > 0) {
					unitsValue = parseInt(chaptersRead, 10);
				}
			} else if (unitsStudied && parseInt(unitsStudied, 10) > 0) {
				unitsValue = parseInt(unitsStudied, 10);
			}

			// Step 3: Add activity to session
			const activityData = {
				session_id: session.id,
				material_id: parseInt(params.materialId as string, 10),
				duration_minutes: timeValue!,
				units_studied: unitsValue,
			};

			await addSessionActivity(activityData);
			console.log("Activity added:", activityData);

			// Step 4: Update session's total duration
			await updateSessionTotalDuration(session.id);
			console.log("Session total duration updated");

			// Step 5: Update material progress (if units provided)
			if (unitsValue) {
				const materialId = parseInt(params.materialId as string, 10);
				const newCurrentUnit = currentProgress + unitsValue;
				const progressPercentage =
					totalProgress && totalProgress > 0 ? Math.min((newCurrentUnit / totalProgress) * 100, 100) : 0;

				await updateMaterialProgress(materialId, newCurrentUnit, progressPercentage);
				console.log("Material progress updated:", { newCurrentUnit, progressPercentage });
			}

			// Success feedback
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			// Navigate back to Study screen
			router.replace("/(tabs)");

			// Show success alert
			setTimeout(() => {
				Alert.alert("Success", "✓ Activity logged");
			}, 300);
		} catch (error) {
			console.error("Error saving activity:", error);
			Alert.alert("Error", "Failed to save activity. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.back();
	};

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
			>
				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{/* Back Button */}
					<TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
						<Text style={styles.backButtonText}>←</Text>
					</TouchableOpacity>

					{/* Selected Material Card */}
					<View style={styles.selectedMaterialCard}>
						<CardCover type={params.materialType as string} />
						<View style={styles.materialInfo}>
							<Text style={styles.materialName} numberOfLines={1}>
								{params.materialName}
							</Text>
							{params.materialSubtype && <Text style={styles.materialSubtype}>{params.materialSubtype}</Text>}
						</View>
					</View>

					{/* Activity Details Form Component */}
					<ActivityDetailsForm
						materialType={params.materialType as string}
						timeMode={timeMode}
						selectedQuickTime={selectedQuickTime}
						customTime={customTime}
						onQuickTimeSelect={handleQuickTimeSelect}
						onCustomTimeChange={handleCustomTimeChange}
						pagesRead={pagesRead}
						chaptersRead={chaptersRead}
						unitsStudied={unitsStudied}
						onPagesReadChange={setPagesRead}
						onChaptersReadChange={setChaptersRead}
						onUnitsStudiedChange={setUnitsStudied}
					/>

					{/* Extra space for keyboard */}
					<View style={{ height: 200 }} />
				</ScrollView>

				{/* Fixed Bottom Buttons */}
				<View style={styles.actionButtons}>
					<TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.7}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.saveButton, loading && styles.saveButtonDisabled]}
						onPress={handleSaveActivity}
						disabled={loading}
						activeOpacity={0.7}
					>
						{loading ? (
							<ActivityIndicator color={colors.white} />
						) : (
							<Text style={styles.saveButtonText}>Save Activity</Text>
						)}
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	keyboardView: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: spacing.lg,
	},
	backButton: {
		width: 40,
		height: 40,
		paddingVertical: spacing.md,
	},
	backButtonText: {
		fontSize: 28,
		color: colors.grayDarkest,
	},
	selectedMaterialCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.md,
		backgroundColor: colors.grayLightest,
		borderRadius: borderRadius.md,
		marginBottom: spacing.xl,
	},
	materialInfo: {
		marginLeft: spacing.md,
		flex: 1,
	},
	materialName: {
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.grayDarkest,
	},
	materialSubtype: {
		...typography.bodySmall,
		color: colors.grayMedium,
		marginTop: 2,
		textTransform: "capitalize",
	},
	actionButtons: {
		flexDirection: "row",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		backgroundColor: colors.white,
		borderTopWidth: 1,
		borderTopColor: colors.gray200,
		gap: spacing.sm,
	},
	cancelButton: {
		flex: 1,
		paddingVertical: spacing.md,
		backgroundColor: colors.gray200,
		borderRadius: borderRadius.sm,
		alignItems: "center",
	},
	cancelButtonText: {
		...typography.bodyMedium,
		color: colors.grayDarkest,
		fontWeight: "600",
	},
	saveButton: {
		flex: 1,
		paddingVertical: spacing.md,
		backgroundColor: colors.primaryAccent,
		borderRadius: borderRadius.sm,
		alignItems: "center",
	},
	saveButtonDisabled: {
		opacity: 0.6,
	},
	saveButtonText: {
		...typography.bodyMedium,
		color: colors.white,
		fontWeight: "600",
	},
});
