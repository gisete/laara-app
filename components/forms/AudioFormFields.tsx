// components/forms/AudioFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";

interface AudioFormFieldsProps {
	title: string;
	creator: string;
	totalEpisodes: string;
	totalDuration: string;
	hasPageNumbers: boolean;
	totalPages: string;
	notes: string;
	onTitleChange: (text: string) => void;
	onCreatorChange: (text: string) => void;
	onTotalEpisodesChange: (text: string) => void;
	onTotalDurationChange: (text: string) => void;
	onHasPageNumbersChange: (value: boolean) => void;
	onTotalPagesChange: (text: string) => void;
	onNotesChange: (text: string) => void;
}

export default function AudioFormFields({
	title,
	creator,
	totalEpisodes,
	totalDuration,
	hasPageNumbers,
	totalPages,
	notes,
	onTitleChange,
	onCreatorChange,
	onTotalEpisodesChange,
	onTotalDurationChange,
	onHasPageNumbersChange,
	onTotalPagesChange,
	onNotesChange,
}: AudioFormFieldsProps) {
	return (
		<>
			{/* Title Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>
					Title <Text style={styles.required}>*</Text>
				</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter audio title"
					placeholderTextColor="#C4C4C4"
					value={title}
					onChangeText={onTitleChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Creator/Host/Author Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Creator/Host/Author</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter creator name"
					placeholderTextColor="#C4C4C4"
					value={creator}
					onChangeText={onCreatorChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Two-column layout for Episodes and Duration */}
			<View style={styles.twoColumnContainer}>
				<View style={styles.columnSection}>
					<Text style={styles.label}>Total episodes</Text>
					<TextInput
						style={styles.input}
						placeholder="0"
						placeholderTextColor="#C4C4C4"
						value={totalEpisodes}
						onChangeText={onTotalEpisodesChange}
						keyboardType="number-pad"
					/>
				</View>

				<View style={styles.columnSection}>
					<Text style={styles.label}>Duration (hours)</Text>
					<TextInput
						style={styles.input}
						placeholder="0"
						placeholderTextColor="#C4C4C4"
						value={totalDuration}
						onChangeText={onTotalDurationChange}
						keyboardType="decimal-pad"
					/>
				</View>
			</View>

			{/* Has Page Numbers Checkbox */}
			<TouchableOpacity
				style={styles.checkboxContainer}
				onPress={() => onHasPageNumbersChange(!hasPageNumbers)}
				activeOpacity={0.7}
			>
				<View style={[styles.checkbox, hasPageNumbers && styles.checkboxChecked]}>
					{hasPageNumbers && <Text style={styles.checkmark}>✓</Text>}
				</View>
				<Text style={styles.checkboxLabel}>Has page numbers (for audiobooks)</Text>
			</TouchableOpacity>

			{/* Conditional Page Numbers Field */}
			{hasPageNumbers && (
				<View style={styles.formSection}>
					<Text style={styles.label}>Total pages</Text>
					<TextInput
						style={styles.input}
						placeholder="0"
						placeholderTextColor="#C4C4C4"
						value={totalPages}
						onChangeText={onTotalPagesChange}
						keyboardType="number-pad"
					/>
				</View>
			)}

			{/* Helper text */}
			<Text style={styles.helperText}>Add episodes or duration to track listening progress</Text>

			{/* Notes Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Notes</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Add any notes about this audio content"
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
	twoColumnContainer: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 8,
	},
	columnSection: {
		flex: 1,
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
	checkboxContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 18,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 4,
		borderWidth: 2,
		borderColor: "#D1D5DB",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	checkboxChecked: {
		backgroundColor: "#DC581F",
		borderColor: "#DC581F",
	},
	checkmark: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	checkboxLabel: {
		fontSize: 14,
		color: "#374151",
	},
	helperText: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 24,
		fontStyle: "italic",
	},
});
