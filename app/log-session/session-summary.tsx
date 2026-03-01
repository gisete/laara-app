// app/log-session/session-summary.tsx
import React, { useCallback, useState } from "react";
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
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import {
	getMaterialById,
	getOrCreateTodaySession,
	addSessionActivity,
	updateSessionTotalDuration,
	updateMaterialProgress,
} from "@database/queries";
import CardCover from "@components/tabs/library/CardCover";
import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";

interface Material {
	id: number;
	name: string;
	type: string;
	subtype?: string;
	current_unit?: number;
	total_units?: number;
}

const getUnitLabel = (type: string, subtype?: string): string => {
	if (type === "book") return "Pages read";
	if (type === "audio") return "Episodes";
	if (type === "video") return "Videos watched";
	if (type === "class") return "Sessions completed";
	if (type === "app") return "Lessons completed";
	return "Units";
};

const getUnitPlaceholder = (type: string): string => {
	if (type === "book") return "How many pages?";
	if (type === "audio") return "How many episodes?";
	if (type === "video") return "How many videos?";
	if (type === "class") return "How many sessions?";
	if (type === "app") return "How many lessons?";
	return "How many units?";
};

export default function SessionSummaryScreen() {
	const { materialId, materialName, materialType, materialSubtype, date, elapsedSeconds } =
		useLocalSearchParams<{
			materialId: string;
			materialName: string;
			materialType: string;
			materialSubtype: string;
			date: string;
			elapsedSeconds: string;
		}>();

	const materialIdNum = parseInt(materialId, 10);
	const elapsedSecondsNum = parseInt(elapsedSeconds, 10);
	const elapsedMinutes = Math.max(1, Math.round(elapsedSecondsNum / 60));

	const [material, setMaterial] = useState<Material | null>(null);
	const [loadingMaterial, setLoadingMaterial] = useState(true);
	const [saving, setSaving] = useState(false);

	// Form state — duration pre-filled from the timer
	const [duration, setDuration] = useState(String(elapsedMinutes));
	const [units, setUnits] = useState("");
	const [notes, setNotes] = useState("");
	const [focusedField, setFocusedField] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			loadMaterial();
		}, [materialIdNum]),
	);

	const loadMaterial = async () => {
		try {
			setLoadingMaterial(true);
			const result = await getMaterialById(materialIdNum);
			setMaterial(result);
		} catch (error) {
			console.error("Error loading material:", error);
		} finally {
			setLoadingMaterial(false);
		}
	};

	const handleSave = async () => {
		const durationNum = parseInt(duration, 10);
		if (!durationNum || durationNum <= 0) {
			Alert.alert("Duration required", "Please enter how long you studied.");
			return;
		}

		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		try {
			setSaving(true);

			const session = (await getOrCreateTodaySession(date)) as { id: number };

			const unitsNum = units.trim() ? parseInt(units, 10) || null : null;
			const pagesReadNum = materialType === "book" ? unitsNum : null;

			await addSessionActivity({
				session_id: session.id,
				material_id: materialIdNum,
				duration_minutes: durationNum,
				units_studied: unitsNum,
				pages_read: pagesReadNum,
				notes: notes.trim() || null,
			});

			await updateSessionTotalDuration(session.id);

			if (unitsNum && unitsNum > 0 && material) {
				const newUnit = (material.current_unit || 0) + unitsNum;
				const progressPct =
					material.total_units && material.total_units > 0
						? Math.min((newUnit / material.total_units) * 100, 100)
						: 0;
				await updateMaterialProgress(materialIdNum, unitsNum, progressPct);
			}

			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			router.replace("/(tabs)");
		} catch (error) {
			console.error("Error saving session:", error);
			Alert.alert("Error", "Failed to save session. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	const handleDiscard = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		Alert.alert("Discard session?", "Your progress will be lost.", [
			{ text: "Keep going", style: "cancel" },
			{
				text: "Discard",
				style: "destructive",
				onPress: () => router.replace("/(tabs)"),
			},
		]);
	};

	if (loadingMaterial) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<View style={styles.content}>
				{/* Header */}
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Session Summary</Text>
					<TouchableOpacity onPress={handleDiscard} activeOpacity={0.7}>
						<Text style={styles.discardText}>Discard</Text>
					</TouchableOpacity>
				</View>

				<KeyboardAvoidingView
					style={styles.keyboardView}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
					keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
				>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						{/* Material info */}
						<View style={styles.materialRow}>
							<CardCover type={materialType} />
							<View style={styles.materialInfo}>
								<Text style={styles.materialName} numberOfLines={1}>
									{materialName}
								</Text>
								{materialSubtype ? (
									<Text style={styles.materialSubtype}>{materialSubtype}</Text>
								) : null}
							</View>
						</View>

						{/* Duration — pre-filled from timer */}
						<View style={styles.formSection}>
							<Text style={styles.label}>Duration (minutes)</Text>
							<TextInput
								style={[styles.input, focusedField === "duration" && styles.inputFocused]}
								value={duration}
								onChangeText={setDuration}
								onFocus={() => setFocusedField("duration")}
								onBlur={() => setFocusedField(null)}
								keyboardType="number-pad"
								placeholder="Minutes studied"
								placeholderTextColor={colors.grayMedium}
							/>
						</View>

						{/* Units — type-aware label and placeholder */}
						<View style={styles.formSection}>
							<Text style={styles.label}>
								{getUnitLabel(materialType, materialSubtype)}
							</Text>
							<TextInput
								style={[styles.input, focusedField === "units" && styles.inputFocused]}
								value={units}
								onChangeText={setUnits}
								onFocus={() => setFocusedField("units")}
								onBlur={() => setFocusedField(null)}
								keyboardType="number-pad"
								placeholder={getUnitPlaceholder(materialType)}
								placeholderTextColor={colors.grayMedium}
							/>
						</View>

						{/* Notes — all types */}
						<View style={styles.formSection}>
							<Text style={styles.label}>Notes (optional)</Text>
							<TextInput
								style={[
									styles.input,
									styles.notesInput,
									focusedField === "notes" && styles.inputFocused,
								]}
								value={notes}
								onChangeText={setNotes}
								onFocus={() => setFocusedField("notes")}
								onBlur={() => setFocusedField(null)}
								placeholder="Any notes about this session..."
								placeholderTextColor={colors.grayMedium}
								multiline
								numberOfLines={4}
								textAlignVertical="top"
							/>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>

				{/* Save button — outside KeyboardAvoidingView, fixed at bottom */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={[styles.saveButton, saving && styles.saveButtonDisabled]}
						onPress={handleSave}
						disabled={saving}
						activeOpacity={0.7}
					>
						{saving ? (
							<ActivityIndicator size="small" color={colors.white} />
						) : (
							<Text style={styles.saveButtonText}>Save Session</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	content: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		paddingBottom: spacing.lg,
	},
	headerTitle: {
		...typography.headingSmall,
		color: colors.grayDarkest,
	},
	discardText: {
		...typography.button,
		color: colors.grayMedium,
	},
	keyboardView: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.xl,
	},
	materialRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.white,
		padding: spacing.md,
		borderRadius: borderRadius.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
		marginBottom: spacing.xl,
	},
	materialInfo: {
		flex: 1,
		marginLeft: spacing.md,
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
	formSection: {
		marginBottom: spacing.lg,
	},
	label: {
		fontSize: 15,
		fontWeight: "500",
		color: colors.grayMedium,
		marginBottom: spacing.xs,
	},
	input: {
		backgroundColor: colors.white,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		color: colors.grayDarkest,
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		minHeight: 48,
	},
	inputFocused: {
		borderColor: colors.primaryAccent,
	},
	notesInput: {
		minHeight: 96,
		paddingTop: 12,
	},
	buttonContainer: {
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.lg,
		paddingTop: spacing.md,
		backgroundColor: colors.gray50,
	},
	saveButton: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 16,
		borderRadius: borderRadius.sm,
		alignItems: "center",
	},
	saveButtonDisabled: {
		backgroundColor: colors.gray300,
	},
	saveButtonText: {
		...typography.button,
		color: colors.white,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
