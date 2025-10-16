// app/log-session/details.tsx - Updated with date param support
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

	// Get date from params, or default to today
	const sessionDate = (params.date as string) || new Date().toISOString().split("T")[0];

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
		const currentProgress = params.currentProgress ? parseInt(params.currentProgress as string, 10) : null;
		const materialType = params.materialType as string;

		// Validate form
		const validation = validateActivityForm({
			timeValue,
			materialType,
			pagesRead,
			chaptersRead,
			unitsStudied,
			totalProgress,
			currentProgress,
		});

		if (!validation.isValid) {
			Alert.alert("Invalid Input", validation.message);
			return;
		}

		try {
			setLoading(true);

			// Use the date from params (could be today or a past day)
			const session = await getOrCreateTodaySession(sessionDate);

			// Calculate duration
			const duration = timeValue || 0;

			// Calculate units based on material type
			let units = null;
			if (materialType === "book") {
				const pages = parseInt(pagesRead) || 0;
				const chapters = parseInt(chaptersRead) || 0;
				units = pages > 0 ? pages : chapters;
			} else {
				units = parseInt(unitsStudied) || null;
			}

			// Add activity to session
			await addSessionActivity({
				session_id: session.id,
				material_id: parseInt(params.materialId as string),
				duration_minutes: duration,
				units_studied: units,
			});

			// Update session total duration
			await updateSessionTotalDuration(session.id);

			// Update material progress if units were logged
			if (units && units > 0) {
				await updateMaterialProgress(parseInt(params.materialId as string), units);
			}

			console.log("Activity saved successfully for date:", sessionDate);

			// Show success feedback
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

			// Navigate back to study screen
			router.push("/(tabs)");
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
							<ActivityIndicator size="small" color={colors.white} />
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
		alignItems: "center",
		justifyContent: "center",
		marginTop: spacing.sm,
		marginBottom: spacing.md,
	},
	backButtonText: {
		fontSize: 28,
		color: colors.grayDarkest,
	},
	selectedMaterialCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.md,
		backgroundColor: colors.white,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.xl,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	materialInfo: {
		marginLeft: spacing.md,
		flex: 1,
	},
	materialName: {
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	materialSubtype: {
		...typography.bodySmall,
		color: colors.grayMedium,
		textTransform: "capitalize",
	},
	actionButtons: {
		flexDirection: "row",
		gap: spacing.md,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		backgroundColor: colors.white,
		borderTopWidth: 1,
		borderTopColor: colors.gray200,
	},
	cancelButton: {
		flex: 1,
		paddingVertical: 16,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.gray100,
	},
	cancelButtonText: {
		...typography.button,
		color: colors.grayDarkest,
	},
	saveButton: {
		flex: 1,
		paddingVertical: 16,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.primaryAccent,
	},
	saveButtonDisabled: {
		backgroundColor: colors.gray300,
	},
	saveButtonText: {
		...typography.button,
		color: colors.white,
	},
});
