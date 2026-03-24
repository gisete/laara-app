// components/EmptyState.tsx
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { fonts } from "@theme/typography";
import { seedLibraryData, seedTwoLanguages, seedFullState } from "@utils/seedLibraryData";

interface EmptyStateProps {
	onAddNew: () => void;
	onDataSeeded?: () => void; // Optional callback to refresh data after seeding
}

export default function EmptyState({ onAddNew, onDataSeeded }: EmptyStateProps) {
	const [seedingScenario, setSeedingScenario] = useState<string | null>(null);

	const handleAddNew = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		onAddNew();
	};

	const runSeed = (
		scenarioKey: string,
		fn: () => Promise<{ success: boolean; added?: number; sessions?: number; error?: string }>,
		title: string,
		description: string,
	) => {
		Alert.alert(title, description, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Add Data",
				onPress: async () => {
					try {
						setSeedingScenario(scenarioKey);
						const result = await fn();
						if (result.success) {
							const parts = [
								result.added != null && `${result.added} materials`,
								result.sessions != null && `${result.sessions} sessions`,
							].filter(Boolean);
							Alert.alert("✅ Done!", `Added ${parts.join(" + ")}.`, [
								{ text: "OK", onPress: () => onDataSeeded?.() },
							]);
						} else {
							Alert.alert("Error", `Failed: ${result.error}`);
						}
					} catch (error: unknown) {
						Alert.alert("Error", `Something went wrong: ${(error as Error).message}`);
					} finally {
						setSeedingScenario(null);
					}
				},
			},
		]);
	};

	const handleSeedBasic = () =>
		runSeed("basic", seedLibraryData, "Seed Basic Library?", "Adds 25+ sample materials for testing.");

	const handleSeedTwoLanguages = () =>
		runSeed(
			"two-languages",
			seedTwoLanguages,
			"Seed Two Languages?",
			"Sets up Spanish (active) + Japanese materials with partial progress.",
		);

	const handleSeedFullState = () =>
		runSeed(
			"full-state",
			seedFullState,
			"Seed Full State?",
			"Sets up two languages + 5 study sessions across the last 7 days.",
		);

	return (
		<View style={styles.container}>
			{/* Illustration */}
			<View style={styles.illustrationContainer}>
				<Image
					source={require("../../assets/images/graphics/empty-library.png")}
					style={styles.illustration}
					resizeMode="contain"
				/>
			</View>

			<Text style={styles.title}>Your library is empty</Text>

			<Text style={styles.description}>
				Add books, audio lessons, podcasts or courses to start logging study sessions
			</Text>

			<TouchableOpacity style={styles.addButton} onPress={handleAddNew} activeOpacity={0.9}>
				<Text style={styles.addButtonText}>+ New Item</Text>
			</TouchableOpacity>

			{/* Development: Seed Data Buttons */}
			{__DEV__ && (
				<>
					<View style={styles.divider}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>OR</Text>
						<View style={styles.dividerLine} />
					</View>

					<TouchableOpacity
						style={[styles.seedButton, seedingScenario !== null && { opacity: 0.6 }]}
						onPress={handleSeedBasic}
						activeOpacity={0.9}
						disabled={seedingScenario !== null}
					>
						{seedingScenario === "basic" ? (
							<ActivityIndicator color={colors.surfaceDefault} />
						) : (
							<Text style={styles.seedButtonText}>🌱 Basic library (one language)</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.seedButton, { marginTop: spacing.sm }, seedingScenario !== null && { opacity: 0.6 }]}
						onPress={handleSeedTwoLanguages}
						activeOpacity={0.9}
						disabled={seedingScenario !== null}
					>
						{seedingScenario === "two-languages" ? (
							<ActivityIndicator color={colors.surfaceDefault} />
						) : (
							<Text style={styles.seedButtonText}>🎌 Two languages (Japanese + Spanish)</Text>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.seedButton, { marginTop: spacing.sm }, seedingScenario !== null && { opacity: 0.6 }]}
						onPress={handleSeedFullState}
						activeOpacity={0.9}
						disabled={seedingScenario !== null}
					>
						{seedingScenario === "full-state" ? (
							<ActivityIndicator color={colors.surfaceDefault} />
						) : (
							<Text style={styles.seedButtonText}>📊 Full state (two languages + sessions)</Text>
						)}
					</TouchableOpacity>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 32,
		paddingVertical: 40,
	},
	illustrationContainer: {
		marginBottom: 32,
	},
	illustration: {
		width: 200,
		height: 200,
	},
	title: {
		fontFamily: fonts.heading.medium,
		fontSize: 22,
		color: colors.textPrimary,
		marginBottom: 12,
		textAlign: "center",
	},
	description: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
		lineHeight: 24,
		marginBottom: 32,
		maxWidth: 280,
	},
	addButton: {
		backgroundColor: colors.borderStrong,
		borderWidth: 1,
		borderColor: colors.borderStrong,
		height: 56,
		borderRadius: borderRadius.button,
		minWidth: 140,
		alignItems: "center",
		justifyContent: "center",
		elevation: 8,
	},
	addButtonText: {
		color: colors.textPrimary,
		fontSize: 16,
		fontWeight: "500",
	},

	// Seed button styles (only in dev mode)
	divider: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: spacing.lg,
		width: "100%",
		maxWidth: 280,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: colors.borderStrong,
	},
	dividerText: {
		paddingHorizontal: spacing.md,
		color: colors.textSecondary,
		fontSize: 14,
		fontWeight: "500",
	},
	seedButton: {
		backgroundColor: colors.accentPrimary,
		height: 56,
		borderRadius: borderRadius.button,
		minWidth: 240,
		alignItems: "center",
		justifyContent: "center",
		elevation: 4,
	},
	seedButtonText: {
		color: colors.surfaceDefault,
		fontSize: 15,
		fontWeight: "500",
	},
});
