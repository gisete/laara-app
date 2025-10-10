// components/forms/AppFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";

interface AppFormFieldsProps {
	appName: string;
	totalLevels: string;
	onAppNameChange: (text: string) => void;
	onTotalLevelsChange: (text: string) => void;
}

export default function AppFormFields({
	appName,
	totalLevels,
	onAppNameChange,
	onTotalLevelsChange,
}: AppFormFieldsProps) {
	return (
		<>
			{/* App Name Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>
					App name <Text style={styles.required}>*</Text>
				</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter app name"
					placeholderTextColor="#C4C4C4"
					value={appName}
					onChangeText={onAppNameChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Total Levels/Units Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Total levels/units</Text>
				<TextInput
					style={styles.input}
					placeholder="0"
					placeholderTextColor="#C4C4C4"
					value={totalLevels}
					onChangeText={onTotalLevelsChange}
					keyboardType="number-pad"
				/>
			</View>

			{/* Helper text */}
			<Text style={styles.helperText}>Add level count to track app progress</Text>
		</>
	);
}

const styles = StyleSheet.create({
	formSection: {
		marginBottom: 16,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#111827",
		marginBottom: 8,
	},
	required: {
		color: colors.primaryAccent,
	},
	input: {
		backgroundColor: "#F9F9F9",
		borderRadius: 5,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: "#111827",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	textArea: {
		minHeight: 100,
		paddingTop: 14,
	},
	helperText: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 24,
		fontStyle: "italic",
	},
});
