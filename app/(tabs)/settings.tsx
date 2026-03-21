// app/(tabs)/settings.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	Modal,
	ScrollView,
	StatusBar,
	StyleSheet,
	Switch,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Svg, { Path } from "react-native-svg";

import { getLevels, getUserSettings, clearLanguageData, nukeAllData } from "@database/queries";
import ScreenHeader from "@components/ui/ScreenHeader";
import { useUserProfile } from "@hooks/useUserProfile";

import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";
import { globalStyles } from "@theme/styles";
import { fonts } from "@theme/typography";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Level {
	code: string;
	label: string;
	sort_order: number;
}

type SheetStep = "reason" | "level";

const formatJoinedDate = (ts: string): string => {
	if (!ts) return "—";
	const d = new Date(ts);
	if (isNaN(d.getTime())) return "—";
	return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
};

// ─── Chevron Icon ─────────────────────────────────────────────────────────────

const ChevronRight = ({ color = colors.grayLightMedium }: { color?: string }) => (
	<Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
		<Path d="M6 4L10 8L6 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
	</Svg>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
	// 1. Profile
	const { profile, currentLevel, addLevelChange } = useUserProfile();

	// 2. State
	const [notifications, setNotifications] = useState(false);
	const [levels, setLevels] = useState<Level[]>([]);

	// Level modal
	const [levelModalVisible, setLevelModalVisible] = useState(false);
	const [sheetStep, setSheetStep] = useState<SheetStep>("reason");
	const [selectedReason, setSelectedReason] = useState<"leveled_up" | "correction" | null>(null);

	// Toast
	const toastAnim = useRef(new Animated.Value(0)).current;
	const [toastMessage, setToastMessage] = useState("");
	const [toastVisible, setToastVisible] = useState(false);

	// 3. Effects
	useEffect(() => {
		getLevels()
			.then((rows: any) => setLevels(rows))
			.catch(console.error);
	}, []);

	// 4. Handlers — Toast
	const showToast = useCallback(
		(message: string) => {
			setToastMessage(message);
			setToastVisible(true);
			toastAnim.setValue(0);
			Animated.sequence([
				Animated.timing(toastAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
				Animated.delay(2000),
				Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
			]).start(() => setToastVisible(false));
		},
		[toastAnim],
	);

	// 4. Handlers — Level modal
	const handleLevelRowPress = () => {
		if (levels.length === 0) return;
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setSheetStep("reason");
		setSelectedReason(null);
		setLevelModalVisible(true);
	};

	const handleReasonSelect = (reason: "leveled_up" | "correction") => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setSelectedReason(reason);
		setSheetStep("level");
	};

	const handleLevelSelect = async (code: string) => {
		if (!selectedReason) return;
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		try {
			await addLevelChange(code, selectedReason);
			setLevelModalVisible(false);
			if (selectedReason === "leveled_up") {
				const label = levels.find((l) => l.code === code)?.label ?? code;
				showToast(`🎉 ${label} unlocked!`);
			}
		} catch (error) {
			console.error("Error saving level change:", error);
		}
	};

	// 4. Handlers — Dev
	const handleNukeEverything = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
		Alert.alert(
			"💣 Nuke Everything",
			"This will delete ALL data and reset the app to first launch. Are you sure?",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Nuke it",
					style: "destructive",
					onPress: async () => {
						try {
							await nukeAllData();
							router.replace("/");
						} catch {
							Alert.alert("Error", "Something went wrong.");
						}
					},
				},
			]
		);
	};

	// 4. Handlers — Destructive
	const handleClearData = async () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		let activeLanguage: string | null = null;
		try {
			const settings = await getUserSettings() as { primary_language?: string } | null;
			activeLanguage = settings?.primary_language ?? null;
		} catch {
			// proceed without language code — Alert will still show
		}
		Alert.alert(
			"Clear all data",
			"This will delete all materials and study history for your current language. This cannot be undone.",
			[
				{
					text: "Delete everything",
					style: "destructive",
					onPress: async () => {
						try {
							if (activeLanguage) {
								await clearLanguageData(activeLanguage);
								console.log("clearLanguageData called with:", activeLanguage);
							}
							router.replace("/(tabs)");
						} catch {
							Alert.alert("Error", "Something went wrong. Please try again.");
						}
					},
				},
				{ text: "Cancel", style: "cancel" },
			],
		);
	};

	// 5. Derived
	const currentLevelSortOrder = levels.find((l) => l.code === currentLevel)?.sort_order ?? 0;
	const currentLevelLabel = levels.find((l) => l.code === currentLevel)?.label ?? currentLevel;
	const levelOptions: Level[] =
		sheetStep === "level" && selectedReason === "leveled_up"
			? levels.filter((l) => l.sort_order > currentLevelSortOrder)
			: levels;
	const joinedDisplay = profile?.created_at ? formatJoinedDate(profile.created_at) : "—";

	// 6. Render
	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				<ScreenHeader title="Settings" />

				{/* ─── MY LANGUAGE ────────────────────────────────────────── */}
				<Text style={globalStyles.inputLabel}>My language</Text>
				<View style={styles.sectionCard}>

					{/* Manage languages */}
					<TouchableOpacity
						style={[styles.row, styles.rowBorder]}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							router.push("/settings/manage-languages");
						}}
						activeOpacity={0.7}
					>
						<Text style={styles.rowLabel}>Manage languages</Text>
						<ChevronRight />
					</TouchableOpacity>

					{/* Level */}
					<TouchableOpacity
						style={[styles.row, styles.rowBorder]}
						onPress={handleLevelRowPress}
						activeOpacity={0.7}
					>
						<Text style={styles.rowLabel}>Level</Text>
						<View style={styles.rowRight}>
							<Text style={styles.rowValue}>{currentLevelLabel}</Text>
							<ChevronRight />
						</View>
					</TouchableOpacity>

					{/* Joined — read-only */}
					<View style={styles.row}>
						<Text style={styles.rowLabel}>Joined</Text>
						<Text style={styles.rowValue}>{joinedDisplay}</Text>
					</View>
				</View>

				{/* ─── APP ─────────────────────────────────────────────────── */}
				<Text style={globalStyles.inputLabel}>App</Text>
				<View style={styles.sectionCard}>

					{/* Notifications */}
					<View style={[styles.row, styles.rowBorder]}>
						<Text style={styles.rowLabel}>Notifications</Text>
						<Switch
							value={notifications}
							// TODO: Implement daily study reminder using expo-notifications
						// - Install expo-notifications
						// - Request permissions on toggle-on
						// - Show time picker
						// - Schedule repeating daily local notification
						// - Requires physical device to test on iOS
						onValueChange={(val) => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								setNotifications(val);
							}}
							trackColor={{ false: colors.gray200, true: colors.primaryAccent }}
							thumbColor={colors.white}
						/>
					</View>

					{/* Export data */}
					<TouchableOpacity
						style={[styles.row, styles.rowBorder]}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							Alert.alert("Coming soon", "Data export is coming in a future update.");
						}}
						activeOpacity={0.7}
					>
						<Text style={styles.rowLabel}>Export data</Text>
						<ChevronRight />
					</TouchableOpacity>

					{/* Restore from backup */}
					<TouchableOpacity
						style={[styles.row, styles.rowBorder]}
						onPress={() => {
							Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
							Alert.alert("Coming soon", "Backup restore is coming in a future update.");
						}}
						activeOpacity={0.7}
					>
						<Text style={styles.rowLabel}>Restore from backup</Text>
						<ChevronRight />
					</TouchableOpacity>

					{/* About */}
					<View style={styles.row}>
						<Text style={styles.rowLabel}>About</Text>
						<Text style={styles.rowValue}>1.0.0</Text>
					</View>
				</View>

				{/* ─── DESTRUCTIVE ZONE ────────────────────────────────────── */}
				<View style={styles.sectionCard}>

					{/* Clear all data */}
					<TouchableOpacity style={styles.row} onPress={handleClearData} activeOpacity={0.7}>
						<Text style={[styles.rowLabel, styles.rowLabelDestructive]}>Clear all data</Text>
						<ChevronRight color={colors.error} />
					</TouchableOpacity>
				</View>

				<View style={{ height: spacing.xxl }} />

				{__DEV__ && (
					<>
						<Text style={[globalStyles.inputLabel, { marginTop: spacing.xl, color: colors.error }]}>
							DEV ONLY
						</Text>
						<View style={styles.sectionCard}>
							<TouchableOpacity style={styles.row} onPress={handleNukeEverything} activeOpacity={0.7}>
								<Text style={[styles.rowLabel, styles.rowLabelDestructive]}>
									💣 Nuke everything & reset onboarding
								</Text>
							</TouchableOpacity>
						</View>
					</>
				)}
			</ScrollView>

			{/* ─── Toast ───────────────────────────────────────────────────── */}
			{toastVisible && (
				<Animated.View style={[styles.toast, { opacity: toastAnim }]} pointerEvents="none">
					<Text style={styles.toastText}>{toastMessage}</Text>
				</Animated.View>
			)}

			{/* ─── Level Modal ───────────────────────────────────────────────── */}
			<Modal
				visible={levelModalVisible}
				transparent
				animationType="slide"
				onRequestClose={() => setLevelModalVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setLevelModalVisible(false)}
				>
					<View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
						<View style={styles.modalHandle} />
						{sheetStep === "reason" ? (
							<>
								<Text style={styles.sheetTitle}>Update your level</Text>
								<TouchableOpacity
									style={styles.sheetOption}
									onPress={() => handleReasonSelect("leveled_up")}
									activeOpacity={0.7}
								>
									<Text style={styles.sheetOptionText}>🎉 I leveled up!</Text>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.sheetOption}
									onPress={() => handleReasonSelect("correction")}
									activeOpacity={0.7}
								>
									<Text style={styles.sheetOptionText}>✏️ I picked the wrong level</Text>
								</TouchableOpacity>
							</>
						) : (
							<>
								<Text style={styles.sheetTitle}>
									{selectedReason === "leveled_up" ? "Which level did you reach?" : "What is your current level?"}
								</Text>
								{levelOptions.length === 0 ? (
									<Text style={styles.sheetEmptyText}>You're already at the highest level!</Text>
								) : (
									levelOptions.map((level) => (
										<TouchableOpacity
											key={level.code}
											style={styles.sheetOption}
											onPress={() => handleLevelSelect(level.code)}
											activeOpacity={0.7}
										>
											<Text style={styles.sheetOptionText}>{level.label}</Text>
											{level.code === currentLevel && (
												<Text style={styles.currentBadge}>current</Text>
											)}
										</TouchableOpacity>
									))
								)}
							</>
						)}
					</View>
				</TouchableOpacity>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	scroll: { flex: 1 },
	scrollContent: {
		paddingHorizontal: spacing.md,
	},

	// Section card
	sectionCard: {
		backgroundColor: colors.white,
		borderRadius: borderRadius.md,
		marginBottom: spacing.lg,
		overflow: "hidden",
	},

	// Row
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		minHeight: 52,
	},
	rowBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.gray200,
	},
	rowLabel: {
		fontSize: 15,
		fontWeight: "500",
		color: colors.grayDarkest,
	},
	rowRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	rowValue: {
		fontSize: 15,
		color: colors.grayMedium,
	},
	rowLabelDestructive: {
		color: colors.error,
	},

	// Toast
	toast: {
		position: "absolute",
		bottom: 90,
		alignSelf: "center",
		backgroundColor: colors.grayDarkest,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.sm,
		borderRadius: borderRadius.pill,
	},
	toastText: {
		color: colors.white,
		fontSize: 14,
		fontWeight: "600",
	},

	// Level modal
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	modalSheet: {
		backgroundColor: colors.white,
		borderTopLeftRadius: borderRadius.lg,
		borderTopRightRadius: borderRadius.lg,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.xl,
	},
	modalHandle: {
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.gray300,
		alignSelf: "center",
		marginBottom: spacing.md,
	},
	sheetTitle: {
		fontFamily: fonts.heading.medium,
		fontSize: 18,
		color: colors.grayDarkest,
		textAlign: "center",
		marginBottom: spacing.lg,
	},
	sheetOption: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.md,
		borderRadius: borderRadius.sm,
		backgroundColor: colors.gray50,
		marginBottom: spacing.sm,
	},
	sheetOptionText: {
		fontSize: 16,
		fontWeight: "500",
		color: colors.grayDarkest,
	},
	sheetEmptyText: {
		fontSize: 15,
		color: colors.grayMedium,
		textAlign: "center",
		paddingVertical: spacing.lg,
		fontStyle: "italic",
	},
	currentBadge: {
		fontSize: 12,
		color: colors.grayMedium,
		fontStyle: "italic",
	},
});
