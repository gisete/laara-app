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
	TextInput,
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
} from "../../database/queries";

// Import components
import CardCover from "../../components/tabs/library/CardCover";

// Import theme
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { typography } from "../../theme/typography";

const quickTimeOptions = [15, 30, 45, 60];

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
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

	const validateForm = (): boolean => {
		const timeValue = getTimeValue();

		if (!timeValue || timeValue <= 0 || isNaN(timeValue)) {
			Alert.alert("Required Field", "Please enter time studied");
			return false;
		}

		return true;
	};

	const handleSaveActivity = async () => {
		if (!validateForm()) return;

		try {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			setLoading(true);

			const timeValue = getTimeValue();
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
				const currentProgress = parseInt(params.currentProgress as string, 10) || 0;
				const totalProgress = parseInt(params.totalProgress as string, 10) || 0;

				// Calculate new current unit (add units studied to current progress)
				const newCurrentUnit = currentProgress + unitsValue;

				// Calculate progress percentage
				const progressPercentage = totalProgress > 0 ? Math.min((newCurrentUnit / totalProgress) * 100, 100) : 0;

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

					{/* Time Studied Section */}
					<View style={styles.section}>
						<Text style={styles.sectionLabel}>
							Time Studied <Text style={styles.required}>*</Text>
						</Text>

						{/* Quick Time Buttons */}
						<View style={styles.quickTimeContainer}>
							{quickTimeOptions.map((minutes) => (
								<TouchableOpacity
									key={minutes}
									style={[styles.quickTimeButton, selectedQuickTime === minutes && styles.quickTimeButtonSelected]}
									onPress={() => handleQuickTimeSelect(minutes)}
									activeOpacity={0.7}
								>
									<Text style={[styles.quickTimeText, selectedQuickTime === minutes && styles.quickTimeTextSelected]}>
										{minutes}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						{/* Custom Time Input */}
						<Text style={styles.customTimeLabel}>Or enter custom amount</Text>
						<TextInput
							style={styles.input}
							value={customTime}
							onChangeText={handleCustomTimeChange}
							placeholder="e.g., 90 minutes"
							keyboardType="numeric"
							placeholderTextColor={colors.grayMedium}
						/>
					</View>

					{/* Type-Specific Units */}
					{params.materialType === "book" && (
						<>
							<View style={styles.section}>
								<Text style={styles.sectionLabel}>Pages Read</Text>
								<TextInput
									style={styles.input}
									value={pagesRead}
									onChangeText={setPagesRead}
									placeholder="e.g., 25 pages"
									keyboardType="numeric"
									placeholderTextColor={colors.grayMedium}
								/>
							</View>

							<View style={styles.section}>
								<Text style={styles.sectionLabel}>Chapters Read</Text>
								<TextInput
									style={styles.input}
									value={chaptersRead}
									onChangeText={setChaptersRead}
									placeholder="e.g., 2 chapters"
									keyboardType="numeric"
									placeholderTextColor={colors.grayMedium}
								/>
							</View>
						</>
					)}

					{params.materialType === "audio" && (
						<View style={styles.section}>
							<Text style={styles.sectionLabel}>Episodes Completed</Text>
							<TextInput
								style={styles.input}
								value={unitsStudied}
								onChangeText={setUnitsStudied}
								placeholder="e.g., 3 episodes"
								keyboardType="numeric"
								placeholderTextColor={colors.grayMedium}
							/>
						</View>
					)}

					{params.materialType === "video" && (
						<View style={styles.section}>
							<Text style={styles.sectionLabel}>Videos Watched</Text>
							<TextInput
								style={styles.input}
								value={unitsStudied}
								onChangeChange={setUnitsStudied}
								placeholder="e.g., 5 videos"
								keyboardType="numeric"
								placeholderTextColor={colors.grayMedium}
							/>
						</View>
					)}

					{params.materialType === "class" && (
						<View style={styles.section}>
							<Text style={styles.sectionLabel}>Sessions Attended</Text>
							<TextInput
								style={styles.input}
								value={unitsStudied}
								onChangeText={setUnitsStudied}
								placeholder="e.g., 1 session"
								keyboardType="numeric"
								placeholderTextColor={colors.grayMedium}
							/>
						</View>
					)}

					{params.materialType === "app" && (
						<View style={styles.section}>
							<Text style={styles.sectionLabel}>Lessons Completed</Text>
							<TextInput
								style={styles.input}
								value={unitsStudied}
								onChangeText={setUnitsStudied}
								placeholder="e.g., 10 lessons"
								keyboardType="numeric"
								placeholderTextColor={colors.grayMedium}
							/>
						</View>
					)}

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
	section: {
		marginBottom: spacing.lg,
	},
	sectionLabel: {
		...typography.bodyMedium,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: spacing.sm,
	},
	required: {
		color: colors.primaryAccent,
	},
	quickTimeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: spacing.md,
	},
	quickTimeButton: {
		flex: 1,
		paddingVertical: spacing.sm,
		marginHorizontal: 4,
		backgroundColor: colors.grayLightest,
		borderRadius: borderRadius.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
		alignItems: "center",
	},
	quickTimeButtonSelected: {
		backgroundColor: colors.primaryAccent,
		borderColor: colors.primaryAccent,
	},
	quickTimeText: {
		...typography.bodyMedium,
		color: colors.grayDarkest,
		fontWeight: "600",
	},
	quickTimeTextSelected: {
		color: colors.white,
	},
	customTimeLabel: {
		...typography.bodySmall,
		color: colors.grayMedium,
		marginBottom: spacing.xs,
	},
	input: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		fontSize: 16,
		color: colors.grayDarkest,
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
