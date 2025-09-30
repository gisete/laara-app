// components/forms/BookFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface BookFormFieldsProps {
	title: string;
	author: string;
	totalPages: string;
	notes: string;
	onTitleChange: (text: string) => void;
	onAuthorChange: (text: string) => void;
	onTotalPagesChange: (text: string) => void;
	onNotesChange: (text: string) => void;
}

export default function BookFormFields({
	title,
	author,
	totalPages,
	notes,
	onTitleChange,
	onAuthorChange,
	onTotalPagesChange,
	onNotesChange,
}: BookFormFieldsProps) {
	return (
		<>
			{/* Title Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>
					Title <Text style={styles.required}>*</Text>
				</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter book title"
					placeholderTextColor="#9CA3AF"
					value={title}
					onChangeText={onTitleChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Author Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Author</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter author name"
					placeholderTextColor="#9CA3AF"
					value={author}
					onChangeText={onAuthorChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Total Pages Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Total Pages</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter number of pages"
					placeholderTextColor="#9CA3AF"
					value={totalPages}
					onChangeText={onTotalPagesChange}
					keyboardType="number-pad"
				/>
				<Text style={styles.helperText}>Add page count to track reading progress</Text>
			</View>

			{/* Notes Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Notes</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Add any notes about this book"
					placeholderTextColor="#9CA3AF"
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
		marginBottom: 24,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 8,
	},
	required: {
		color: "#DC581F",
	},
	input: {
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
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
		fontSize: 13,
		color: "#6B7280",
		marginTop: 6,
		fontStyle: "italic",
	},
});
