// components/forms/BookFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface BookFormFieldsProps {
	title: string;
	author: string;
	totalPages: string;
	totalChapters: string;
	onTitleChange: (text: string) => void;
	onAuthorChange: (text: string) => void;
	onTotalPagesChange: (text: string) => void;
	onTotalChaptersChange: (text: string) => void;
}

export default function BookFormFields({
	title,
	author,
	totalPages,
	totalChapters,
	onTitleChange,
	onAuthorChange,
	onTotalPagesChange,
	onTotalChaptersChange,
}: BookFormFieldsProps) {
	return (
		<>
			{/* Title Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Title</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter book title"
					placeholderTextColor="#C4C4C4"
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
					placeholderTextColor="#C4C4C4"
					value={author}
					onChangeText={onAuthorChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Two-column layout for Pages and Chapters */}
			<View style={styles.twoColumnContainer}>
				<View style={styles.columnSection}>
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

				<View style={styles.columnSection}>
					<Text style={styles.label}>Number of chapters</Text>
					<TextInput
						style={styles.input}
						placeholder="0"
						placeholderTextColor="#C4C4C4"
						value={totalChapters}
						onChangeText={onTotalChaptersChange}
						keyboardType="number-pad"
					/>
				</View>
			</View>

			{/* Helper text */}
			<Text style={styles.helperText}>Add page count to track reading progress</Text>
		</>
	);
}

const styles = StyleSheet.create({
	formSection: {
		marginBottom: 16,
	},
	twoColumnContainer: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 16,
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
