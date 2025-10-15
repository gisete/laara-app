// components/forms/VideoFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@theme/colors";

interface VideoFormFieldsProps {
	title: string;
	creator: string;
	totalVideos: string;
	totalDuration: string;
	onTitleChange: (text: string) => void;
	onCreatorChange: (text: string) => void;
	onTotalVideosChange: (text: string) => void;
	onTotalDurationChange: (text: string) => void;
}

export default function VideoFormFields({
	title,
	creator,
	totalVideos,
	totalDuration,
	onTitleChange,
	onCreatorChange,
	onTotalVideosChange,
	onTotalDurationChange,
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
