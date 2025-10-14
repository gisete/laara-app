// components/session/ActivityDetailsForm.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Import theme
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { typography } from "../../theme/typography";

const quickTimeOptions = [15, 30, 45, 60];

interface ActivityDetailsFormProps {
	materialType: string;
	// Time state
	timeMode: "quick" | "custom" | null;
	selectedQuickTime: number | null;
	customTime: string;
	onQuickTimeSelect: (minutes: number) => void;
	onCustomTimeChange: (text: string) => void;
	// Units state
	pagesRead: string;
	chaptersRead: string;
	unitsStudied: string;
	onPagesReadChange: (text: string) => void;
	onChaptersReadChange: (text: string) => void;
	onUnitsStudiedChange: (text: string) => void;
}

export default function ActivityDetailsForm(props: ActivityDetailsFormProps) {
	const {
		materialType,
		timeMode,
		selectedQuickTime,
		customTime,
		onQuickTimeSelect,
		onCustomTimeChange,
		pagesRead,
		chaptersRead,
		unitsStudied,
		onPagesReadChange,
		onChaptersReadChange,
		onUnitsStudiedChange,
	} = props;

	const handleQuickTimeSelect = (minutes: number) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onQuickTimeSelect(minutes);
	};

	return (
		<>
			{/* Time Studied Section */}
			<View style={styles.section}>
				<Text style={styles.sectionLabel}>
					Time Studied <Text style={styles.required}>*</Text>
				</Text>

				{/* Quick Time Buttons */}
				<View style={styles.quickTimeContainer}>
					{quickTimeOptions.map((minutes) => (
						<TouchableOpacity
							key={minutes}
							style={[styles.quickTimeButton, selectedQuickTime === minutes && styles.quickTimeButtonSelected]}
							onPress={() => handleQuickTimeSelect(minutes)}
							activeOpacity={0.7}
						>
							<Text style={[styles.quickTimeText, selectedQuickTime === minutes && styles.quickTimeTextSelected]}>
								{minutes}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Custom Time Input */}
				<Text style={styles.customTimeLabel}>Or enter custom amount</Text>
				<TextInput
					style={styles.input}
					value={customTime}
					onChangeText={onCustomTimeChange}
					placeholder="e.g., 90 minutes"
					keyboardType="numeric"
					placeholderTextColor={colors.grayMedium}
				/>
			</View>

			{/* Type-Specific Units */}
			{materialType === "book" && (
				<>
					<View style={styles.section}>
						<Text style={styles.sectionLabel}>Pages Read</Text>
						<TextInput
							style={styles.input}
							value={pagesRead}
							onChangeText={onPagesReadChange}
							placeholder="e.g., 25 pages"
							keyboardType="numeric"
							placeholderTextColor={colors.grayMedium}
						/>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionLabel}>Chapters Read</Text>
						<TextInput
							style={styles.input}
							value={chaptersRead}
							onChangeText={onChaptersReadChange}
							placeholder="e.g., 2 chapters"
							keyboardType="numeric"
							placeholderTextColor={colors.grayMedium}
						/>
					</View>
				</>
			)}

			{materialType === "audio" && (
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Episodes Completed</Text>
					<TextInput
						style={styles.input}
						value={unitsStudied}
						onChangeText={onUnitsStudiedChange}
						placeholder="e.g., 3 episodes"
						keyboardType="numeric"
						placeholderTextColor={colors.grayMedium}
					/>
				</View>
			)}

			{materialType === "video" && (
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Videos Watched</Text>
					<TextInput
						style={styles.input}
						value={unitsStudied}
						onChangeText={onUnitsStudiedChange}
						placeholder="e.g., 5 videos"
						keyboardType="numeric"
						placeholderTextColor={colors.grayMedium}
					/>
				</View>
			)}

			{materialType === "class" && (
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Sessions Attended</Text>
					<TextInput
						style={styles.input}
						value={unitsStudied}
						onChangeText={onUnitsStudiedChange}
						placeholder="e.g., 1 session"
						keyboardType="numeric"
						placeholderTextColor={colors.grayMedium}
					/>
				</View>
			)}

			{materialType === "app" && (
				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Lessons Completed</Text>
					<TextInput
						style={styles.input}
						value={unitsStudied}
						onChangeText={onUnitsStudiedChange}
						placeholder="e.g., 10 lessons"
						keyboardType="numeric"
						placeholderTextColor={colors.grayMedium}
					/>
				</View>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	section: {
		marginBottom: spacing.lg,
	},
	sectionLabel: {
		...typography.bodyMedium,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: spacing.sm,
	},
	required: {
		color: colors.primaryAccent,
	},
	quickTimeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: spacing.md,
	},
	quickTimeButton: {
		flex: 1,
		paddingVertical: spacing.sm,
		marginHorizontal: 4,
		backgroundColor: colors.grayLightest,
		borderRadius: borderRadius.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
		alignItems: "center",
	},
	quickTimeButtonSelected: {
		backgroundColor: colors.primaryAccent,
		borderColor: colors.primaryAccent,
	},
	quickTimeText: {
		...typography.bodyMedium,
		color: colors.grayDarkest,
		fontWeight: "600",
	},
	quickTimeTextSelected: {
		color: colors.white,
	},
	customTimeLabel: {
		...typography.bodySmall,
		color: colors.grayMedium,
		marginBottom: spacing.xs,
	},
	input: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.gray200,
		borderRadius: borderRadius.sm,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		fontSize: 16,
		color: colors.grayDarkest,
	},
});
