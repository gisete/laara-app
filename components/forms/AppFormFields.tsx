// components/forms/AppFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface AppFormFieldsProps {
	appName: string;
	totalLevels: string;
	notes: string;
	onAppNameChange: (text: string) => void;
	onTotalLevelsChange: (text: string) => void;
	onNotesChange: (text: string) => void;
}

export default function AppFormFields({
	appName,
	totalLevels,
	notes,
	onAppNameChange,
	onTotalLevelsChange,
	onNotesChange,
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

			{/* Notes Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Notes</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Add any notes about this app"
					placeholderTextColor="#C4C4C4"
					value={notes}
					onChangeText={onNotesChange}
					multiline
					numberOfLines={4}
					textAlignVertical="top"
				/>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	formSection: {
		marginBottom: 18,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#111827",
		marginBottom: 8,
	},
	required: {
		color: "#DC581F",
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
