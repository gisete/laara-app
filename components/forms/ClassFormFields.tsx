// components/forms/ClassFormFields.tsx
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";

interface ClassFormFieldsProps {
	className: string;
	instructor: string;
	location: string;
	courseDuration: string;
	endDate: string;
	onClassNameChange: (text: string) => void;
	onInstructorChange: (text: string) => void;
	onLocationChange: (text: string) => void;
	onCourseDurationChange: (text: string) => void;
	onEndDateChange: (text: string) => void;
}

export default function ClassFormFields({
	className,
	instructor,
	location,
	courseDuration,
	endDate,
	onClassNameChange,
	onInstructorChange,
	onLocationChange,
	onCourseDurationChange,
	onEndDateChange,
}: ClassFormFieldsProps) {
	return (
		<>
			{/* Class Name Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>
					Class name <Text style={styles.required}>*</Text>
				</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter class name"
					placeholderTextColor="#C4C4C4"
					value={className}
					onChangeText={onClassNameChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Instructor/Teacher Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Instructor/Teacher</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter instructor name"
					placeholderTextColor="#C4C4C4"
					value={instructor}
					onChangeText={onInstructorChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Location/Platform Input */}
			<View style={styles.formSection}>
				<Text style={styles.label}>Location/Platform</Text>
				<TextInput
					style={styles.input}
					placeholder="e.g., Zoom, Community Center"
					placeholderTextColor="#C4C4C4"
					value={location}
					onChangeText={onLocationChange}
					autoCapitalize="words"
				/>
			</View>

			{/* Two-column layout for Duration and End Date */}
			<View style={styles.twoColumnContainer}>
				<View style={styles.columnSection}>
					<Text style={styles.label}>Duration (weeks)</Text>
					<TextInput
						style={styles.input}
						placeholder="0"
						placeholderTextColor="#C4C4C4"
						value={courseDuration}
						onChangeText={onCourseDurationChange}
						keyboardType="number-pad"
					/>
				</View>

				<View style={styles.columnSection}>
					<Text style={styles.label}>End date</Text>
					<TextInput
						style={styles.input}
						placeholder="MM/DD/YYYY"
						placeholderTextColor="#C4C4C4"
						value={endDate}
						onChangeText={onEndDateChange}
					/>
				</View>
			</View>

			{/* Helper text */}
			<Text style={styles.helperText}>Add duration or end date to track class progress</Text>
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
