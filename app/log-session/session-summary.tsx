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
import { formatDateToYYYYMMDD } from "@utils/dateHelper";
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
	language_code?: string;
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
	const { materialId, materialName, materialType, materialSubtype, date, elapsedSeconds, entryMode, returnTo } =
		useLocalSearchParams<{
			materialId: string;
			materialName: string;
			materialType: string;
			materialSubtype: string;
			date: string;
			elapsedSeconds: string;
			entryMode: string;
			returnTo: string;
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
			router.replace(returnTo === "history" ? "/history" : "/(tabs)");
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
				onPress: () => router.replace(returnTo === "history" ? "/history" : "/(tabs)"),
			},
		]);
	};

	const formatDateLabel = (dateStr: string): string => {
		if (!dateStr) return "Today";
		const todayStr = formatDateToYYYYMMDD(new Date());
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		const yesterdayStr = formatDateToYYYYMMDD(yesterday);
		if (dateStr === todayStr) return "Today";
		if (dateStr === yesterdayStr) return "Yesterday";
		const [year, month, day] = dateStr.split("-").map(Number);
		const d = new Date(year, month - 1, day);
		return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
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
					<View style={{ flex: 1 }}>
						<Text style={styles.headerTitle}>Log Session</Text>
						<Text style={styles.headerDate}>{formatDateLabel(date)}</Text>
					</View>
					<TouchableOpacity style={styles.discardButton} onPress={handleDiscard} activeOpacity={0.7}>
						<Text style={styles.discardButtonText}>×</Text>
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

						{/* Duration + Units — side by side */}
						<View style={styles.fieldRow}>
							<View style={styles.durationField}>
								<Text style={globalStyles.inputLabel}>Duration (minutes)</Text>
								<TextInput
									style={[globalStyles.input, focusedField === "duration" && globalStyles.inputFocused]}
									value={duration}
									onChangeText={setDuration}
									onFocus={() => setFocusedField("duration")}
									onBlur={() => setFocusedField(null)}
									keyboardType="number-pad"
									placeholder="Minutes"
									placeholderTextColor={colors.grayMedium}
								/>
							</View>
							<View style={styles.unitField}>
								<Text style={globalStyles.inputLabel}>
									{getUnitLabel(materialType, materialSubtype)}
								</Text>
								<TextInput
									style={[globalStyles.input, focusedField === "units" && globalStyles.inputFocused]}
									value={units}
									onChangeText={setUnits}
									onFocus={() => setFocusedField("units")}
									onBlur={() => setFocusedField(null)}
									keyboardType="number-pad"
									placeholder={getUnitPlaceholder(materialType)}
									placeholderTextColor={colors.grayMedium}
								/>
							</View>
						</View>

						{/* Notes — all types */}
						<View style={globalStyles.inputContainer}>
							<Text style={globalStyles.inputLabel}>Notes (optional)</Text>
							<TextInput
								style={[
									globalStyles.input,
									styles.notesInput,
									focusedField === "notes" && globalStyles.inputFocused,
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
	headerDate: {
		fontSize: 13,
		color: colors.grayMedium,
		marginTop: 2,
	},
	discardButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: colors.gray300,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.white,
	},
	discardButtonText: {
		fontSize: 20,
		color: colors.grayDarkest,
		lineHeight: 22,
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
	fieldRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: spacing.lg,
	},
	durationField: {
		flex: 2,
	},
	unitField: {
		flex: 1,
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
		height: 56,
		borderRadius: borderRadius.button,
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	saveButtonDisabled: {
		backgroundColor: colors.gray300,
	},
	saveButtonText: {
		...typography.button,
		color: colors.buttonOnAccentText,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
