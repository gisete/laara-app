// app/settings/manage-languages.tsx
import React, { useCallback, useState } from "react";
import {
	Alert,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";

import { getUserLanguages, removeUserLanguage } from "@database/queries";
import FormHeader from "@components/forms/FormHeader";

import { colors } from "@theme/colors";
import { borderRadius, spacing } from "@theme/spacing";
import { globalStyles } from "@theme/styles";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserLanguage {
	language_code: string;
	is_active: number;
	name: string;
	flag: string;
	greeting: string | null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ManageLanguagesScreen() {
	// 1. State
	const [languages, setLanguages] = useState<UserLanguage[]>([]);

	// 2. Load on focus (refreshes after returning from language-selection)
	const loadLanguages = useCallback(async () => {
		try {
			const result = await getUserLanguages();
			setLanguages(result as UserLanguage[]);
		} catch (error) {
			console.error("Error loading languages:", error);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadLanguages();
		}, [loadLanguages]),
	);

	// 3. Handlers
	const handleRemove = (lang: UserLanguage) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		Alert.alert(`Remove ${lang.name}?`, "Your materials and sessions won't be deleted.", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: async () => {
					try {
						await removeUserLanguage(lang.language_code);
						Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
						await loadLanguages();
					} catch {
						Alert.alert("Error", "Something went wrong. Please try again.");
					}
				},
			},
		]);
	};

	const handleAddLanguage = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push({ pathname: "/language-selection", params: { mode: "add" } });
	};

	// 4. Helpers
	const canRemove = (lang: UserLanguage): boolean => {
		if (languages.length <= 1) return false;
		if (lang.is_active === 1) return false;
		return true;
	};

	// 5. Render
	return (
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />
			<FormHeader title="My languages" onBack={() => router.back()} />

			<ScrollView
				style={styles.scroll}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.sectionCard}>
					{languages.length === 0 ? (
						<View style={styles.row}>
							<Text style={styles.emptyText}>No languages added yet.</Text>
						</View>
					) : (
						languages.map((lang, index) => {
							const isLast = index === languages.length - 1;
							const showRemove = canRemove(lang);
							return (
								<View key={lang.language_code} style={[styles.row, !isLast && styles.rowBorder]}>
									<Text style={styles.rowLabel}>
										{lang.flag}{"  "}{lang.name}
									</Text>
									{lang.is_active === 1 ? (
										<View style={styles.activeBadge}>
											<Text style={styles.activeBadgeText}>Active</Text>
										</View>
									) : showRemove ? (
										<TouchableOpacity onPress={() => handleRemove(lang)} activeOpacity={0.7}>
											<Text style={styles.removeText}>Remove</Text>
										</TouchableOpacity>
									) : null}
								</View>
							);
						})
					)}
				</View>

				<TouchableOpacity style={styles.addRow} onPress={handleAddLanguage} activeOpacity={0.7}>
					<Text style={styles.addRowText}>＋ Add a language</Text>
				</TouchableOpacity>
			</ScrollView>
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
		paddingTop: spacing.md,
	},

	// Section card (matches settings.tsx)
	sectionCard: {
		backgroundColor: colors.white,
		borderRadius: borderRadius.md,
		marginBottom: spacing.md,
		overflow: "hidden",
	},

	// Row (matches settings.tsx)
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

	// Active badge — coral pill
	activeBadge: {
		backgroundColor: colors.primaryAccent,
		borderRadius: borderRadius.pill,
		paddingHorizontal: spacing.xs,
		paddingVertical: 3,
	},
	activeBadgeText: {
		color: colors.white,
		fontSize: 12,
		fontWeight: "600",
	},

	// Remove button
	removeText: {
		fontSize: 14,
		fontWeight: "500",
		color: colors.error,
	},

	// Empty state
	emptyText: {
		fontSize: 15,
		color: colors.grayMedium,
		fontStyle: "italic",
	},

	// Add a language row
	addRow: {
		backgroundColor: colors.white,
		borderRadius: borderRadius.md,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		minHeight: 52,
	},
	addRowText: {
		fontSize: 15,
		fontWeight: "600",
		color: colors.primaryAccent,
	},
});
