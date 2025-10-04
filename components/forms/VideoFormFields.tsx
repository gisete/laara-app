// components/forms/VideoFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

interface VideoFormFieldsProps {
	title: string;
	creator: string;
	totalVideos: string;
	totalDuration: string;
	notes: string;
	onTitleChange: (text: string) => void;
	onCreatorChange: (text: string) => void;
	onTotalVideosChange: (text: string) => void;
	onTotalDurationChange: (text: string) => void;
	onNotesChange: (text: string) => void;
}

export default function VideoFormFields({
	title,
	creator,
	totalVideos,
	totalDuration,
	notes,
	onTitleChange,
	onCreatorChange,
	onTotalVideosChange,
	onTotalDurationChange,
	onNotesChange,
}: VideoFormFieldsProps) {
	return (
		<>
			{/* Title Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>
					Title <Text style={styles.required}>*</Text>
				</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter video title"
					placeholderTextColor="#C4C4C4"
					value={title}
					onChangeText={onTitleChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Creator/Channel Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Creator/Channel</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter creator or channel name"
					placeholderTextColor="#C4C4C4"
					value={creator}
					onChangeText={onCreatorChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Two-column layout for Videos and Duration */}
			<View style={styles.twoColumnContainer}>
				<View style={styles.columnSection}>
					<Text style={styles.label}>Total videos</Text>
					<TextInput
						style={styles.input}
						placeholder="0"
						placeholderTextColor="#C4C4C4"
						value={totalVideos}
						onChangeText={onTotalVideosChange}
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

			{/* Helper text */}
			<Text style={styles.helperText}>Add video count or duration to track watching progress</Text>

			{/* Notes Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Notes</Text>
				<TextInput
					style={[styles.input, styles.textArea]}
					placeholder="Add any notes about this video content"
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
	helperText: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 24,
		fontStyle: "italic",
	},
});
