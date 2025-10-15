// components/EmptyState.tsx
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from "react-native";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { seedLibraryData } from "@utils/seedLibraryData";

interface EmptyStateProps {
	onAddNew: () => void;
	onDataSeeded?: () => void; // Optional callback to refresh data after seeding
}

export default function EmptyState({ onAddNew, onDataSeeded }: EmptyStateProps) {
	const [seeding, setSeeding] = useState(false);

	const handleAddNew = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		onAddNew();
	};

	const handleSeedData = async () => {
		Alert.alert("Seed Library Data?", "This will add 25+ sample materials to your library for testing. Continue?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Add Sample Data",
				onPress: async () => {
					try {
						setSeeding(true);
						const result = await seedLibraryData();

						if (result.success) {
							Alert.alert("✅ Success!", `Added ${result.added} materials to your library.`, [
								{
									text: "OK",
									onPress: () => {
										// Call the callback to refresh materials list
										onDataSeeded?.();
									},
								},
							]);
						} else {
							Alert.alert("Error", `Failed to seed data: ${result.error}`);
						}
					} catch (error) {
						Alert.alert("Error", `Something went wrong: ${error.message}`);
					} finally {
						setSeeding(false);
					}
				},
			},
		]);
	};

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

			{/* Development: Seed Data Button */}
			{__DEV__ && (
				<>
					<View style={styles.divider}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>OR</Text>
						<View style={styles.dividerLine} />
					</View>

					<TouchableOpacity style={styles.seedButton} onPress={handleSeedData} activeOpacity={0.9} disabled={seeding}>
						{seeding ? (
							<ActivityIndicator color={colors.white} />
						) : (
							<Text style={styles.seedButtonText}>🌱 Add Sample Data (Dev)</Text>
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
		fontFamily: "Domine-Medium",
		fontSize: 22,
		fontWeight: "700",
		color: "#1F2937",
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
		backgroundColor: colors.gray300,
		borderWidth: 1,
		borderColor: colors.gray300,
		paddingVertical: 20,
		paddingHorizontal: 60,
		borderRadius: 5,
		minWidth: 140,
		alignItems: "center",
		elevation: 8,
	},
	addButtonText: {
		color: colors.grayDarkest,
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
		backgroundColor: colors.gray300,
	},
	dividerText: {
		paddingHorizontal: spacing.md,
		color: colors.grayMedium,
		fontSize: 14,
		fontWeight: "500",
	},
	seedButton: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 16,
		paddingHorizontal: 40,
		borderRadius: 5,
		minWidth: 240,
		alignItems: "center",
		elevation: 4,
	},
	seedButtonText: {
		color: colors.white,
		fontSize: 15,
		fontWeight: "600",
	},
});
