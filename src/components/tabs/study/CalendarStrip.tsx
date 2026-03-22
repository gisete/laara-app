import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getDayLetter, formatDateToYYYYMMDD } from "@utils/dateHelper";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";

interface CalendarStripProps {
	weekDates: Date[];
	studyDays: string[];
}

export default function CalendarStrip({ weekDates, studyDays }: CalendarStripProps) {
	const todayStr = formatDateToYYYYMMDD(new Date());

	const getDayState = (date: Date): "today" | "studied" | "notStudied" => {
		const dateStr = formatDateToYYYYMMDD(date);
		if (dateStr === todayStr) return "today";
		if (studyDays.includes(dateStr)) return "studied";
		return "notStudied";
	};

	return (
		<View style={styles.calendarStrip}>
			{weekDates.map((date, i) => {
				const state = getDayState(date);
				return (
					<View key={i} style={styles.dayColumn}>
						<Text style={styles.dayLabel}>{getDayLetter(date)}</Text>
						<View style={[styles.dateCircle, state === "today" && styles.dateCircleToday]}>
							<Text
								style={[
									styles.dateNum,
									state === "today" && styles.dateNumToday,
									state === "studied" && styles.dateNumStudied,
									state === "notStudied" && styles.dateNumNotStudied,
								]}
							>
								{date.getDate()}
							</Text>
						</View>
						<View style={styles.dotContainer}>
							{state === "studied" && <View style={styles.studiedDot} />}
						</View>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	calendarStrip: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		paddingBottom: spacing.xs,
	},
	dayColumn: { alignItems: "center", width: 38 },
	dayLabel: {
		fontSize: 10,
		fontWeight: "700",
		color: colors.grayMedium,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 6,
	},
	dateCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	dateCircleToday: { backgroundColor: colors.grayDarkest },
	dateNum: { fontSize: 13, fontWeight: "600" },
	dateNumToday: { color: colors.white },
	dateNumStudied: { color: colors.grayDarkest },
	dateNumNotStudied: { color: colors.grayMedium },
	dotContainer: { height: 8, alignItems: "center", justifyContent: "center", marginTop: 3 },
	studiedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primaryAccent },
});
