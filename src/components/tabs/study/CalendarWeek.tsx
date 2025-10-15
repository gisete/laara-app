// components/study/CalendarWeek.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";

interface CalendarWeekProps {
	studyDays: string[]; // Array of dates in 'YYYY-MM-DD' format
	onDayPress?: (date: string) => void; // Optional for future
}

/**
 * Get current week dates ending with today (7 days back from today)
 */
const getCurrentWeekDates = (): Date[] => {
	const today = new Date();
	const weekDates = [];

	// Generate array of 7 dates ending with today
	for (let i = 6; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(today.getDate() - i);
		weekDates.push(date);
	}

	return weekDates;
};

/**
 * Format date to YYYY-MM-DD
 */
const formatDateToYYYYMMDD = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * Check if date is today
 */
const isToday = (date: Date): boolean => {
	const today = new Date();
	return formatDateToYYYYMMDD(date) === formatDateToYYYYMMDD(today);
};

/**
 * Get day letter for calendar display (M, T, W, T, F, S, S)
 */
const getDayLetter = (date: Date): string => {
	const days = ["S", "M", "T", "W", "T", "F", "S"];
	return days[date.getDay()];
};

export default function CalendarWeek({ studyDays, onDayPress }: CalendarWeekProps) {
	const weekDates = getCurrentWeekDates();

	const renderDay = (date: Date, index: number) => {
		const dateString = formatDateToYYYYMMDD(date);
		const isTodayDate = isToday(date);
		const hasStudySession = studyDays.includes(dateString);
		const dayLetter = getDayLetter(date);
		const dayNumber = date.getDate();

		return (
			<TouchableOpacity
				key={index}
				style={[
					styles.dayContainer,
					isTodayDate && styles.todayContainer,
					!isTodayDate && hasStudySession && styles.studyDayContainer,
				]}
				onPress={() => onDayPress?.(dateString)}
				activeOpacity={onDayPress ? 0.7 : 1}
				disabled={!onDayPress}
			>
				<Text style={[styles.dayLetter, isTodayDate && styles.todayText]}>{dayLetter}</Text>
				<Text style={[styles.dayNumber, isTodayDate && styles.todayText]}>{dayNumber}</Text>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.weekContainer}>{weekDates.map((date, index) => renderDay(date, index))}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginVertical: spacing.md,
	},
	weekContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	dayContainer: {
		alignItems: "center",
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.xs,
		borderRadius: "100%",
		minWidth: 40,
	},
	todayContainer: {
		backgroundColor: colors.grayDark, // #44403C - Stone 700
	},
	studyDayContainer: {
		backgroundColor: colors.primaryAccentLight, // #EF9381 - Light coral
	},
	dayLetter: {
		fontSize: 12,
		color: colors.grayMedium, // #78716C - Stone 500
		marginBottom: 4,
		fontWeight: "500",
	},
	dayNumber: {
		fontSize: 16,
		color: colors.grayDarkest, // #211E1C - Stone 900
		fontWeight: "600",
	},
	todayText: {
		color: colors.white, // White text on today's dark background
	},
});
