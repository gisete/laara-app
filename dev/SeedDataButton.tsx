// components/dev/SeedDataButton.tsx
// Add this button to your Library or Settings screen during development

import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { seedLibraryData, verifyLibraryData } from "../utils/seedLibraryData";
import { colors } from "../theme/colors";
import { spacing, borderRadius } from "../theme/spacing";

export default function SeedDataButton({ onComplete }: { onComplete?: () => void }) {
	const [loading, setLoading] = useState(false);

	const handleSeed = async () => {
		Alert.alert("Seed Library Data?", "This will add 25+ sample materials to your library. Continue?", [
			{
				text: "Cancel",
				style: "cancel",
			},
			{
				text: "Seed Data",
				onPress: async () => {
					try {
						setLoading(true);
						const result = await seedLibraryData();

						if (result.success) {
							Alert.alert(
								"✅ Success!",
								`Added ${result.added} materials to your library.\n\nFailed: ${result.failed}`,
								[
									{
										text: "OK",
										onPress: () => {
											onComplete?.();
										},
									},
								]
							);

							// Verify the data
							await verifyLibraryData();
						} else {
							Alert.alert("Error", `Failed to seed data: ${result.error}`);
						}
					} catch (error) {
						Alert.alert("Error", `Something went wrong: ${error.message}`);
					} finally {
						setLoading(false);
					}
				},
			},
		]);
	};

	return (
		<TouchableOpacity style={styles.button} onPress={handleSeed} disabled={loading} activeOpacity={0.7}>
			{loading ? (
				<ActivityIndicator color={colors.white} />
			) : (
				<Text style={styles.buttonText}>🌱 Seed Library Data</Text>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: spacing.sm,
	},
	buttonText: {
		color: colors.white,
		fontSize: 15,
		fontWeight: "600",
	},
});
