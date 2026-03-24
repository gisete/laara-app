// src/components/history/HistoryCalendar.tsx
import React, { useMemo } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { fonts, typography } from "@theme/typography";

const CELL_SIZE = (Dimensions.get("window").width - spacing.md * 2) / 7;
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface Props {
	displayMonth: Date;
	selectedDate: string | null;
	sessionDates: Set<string>;
	onDayPress: (date: string) => void;
	onMonthChange: (direction: "prev" | "next") => void;
}

type DayStyle = {
	circleBg: string | undefined;
	textColor: string;
	dimOpacity: number;
	fontWeight: "400" | "500";
};

// All day-state logic in one place. Priority order matters:
// today wins over selected, selected wins over has-session, etc.
function getDayStyle(isToday: boolean, isSelected: boolean, isPast: boolean, hasSession: boolean): DayStyle {
	if (isToday) {
		return {
			circleBg: colors.textPrimary,
			textColor: colors.surfaceDefault,
			dimOpacity: 1,
			fontWeight: "500",
		};
	}
	if (isSelected) {
		return {
			circleBg: colors.accentDark,
			textColor: colors.surfaceDefault,
			dimOpacity: 1,
			fontWeight: "500",
		};
	}
	if (isPast && hasSession) {
		return {
			circleBg: colors.accentPrimary,
			textColor: colors.buttonOnAccentText,
			dimOpacity: 1,
			fontWeight: "500",
		};
	}
	if (isPast) {
		return {
			circleBg: colors.borderDefault,
			textColor: colors.textSecondary,
			dimOpacity: 0.5,
			fontWeight: "500",
		};
	}
	// Future date
	return {
		circleBg: undefined,
		textColor: colors.textSecondary,
		dimOpacity: 1,
		fontWeight: "400",
	};
}

const pad = (n: number) => String(n).padStart(2, "0");

const toDateString = (year: number, month: number, day: number): string => `${year}-${pad(month + 1)}-${pad(day)}`;

function buildCells(displayMonth: Date): (string | null)[] {
	const year = displayMonth.getFullYear();
	const month = displayMonth.getMonth();
	const firstDay = new Date(year, month, 1);
	// getDay(): 0=Sun … 6=Sat — convert to Mon-first index
	const offset = (firstDay.getDay() + 6) % 7;
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const cells: (string | null)[] = [];
	for (let i = 0; i < 42; i++) {
		const dayNum = i - offset + 1;
		cells.push(dayNum < 1 || dayNum > daysInMonth ? null : toDateString(year, month, dayNum));
	}
	return cells;
}

// Stable: today's date string never changes within a session.
const TODAY_STR = new Date().toISOString().split("T")[0];

export default function HistoryCalendar({
	displayMonth,
	selectedDate,
	sessionDates,
	onDayPress,
	onMonthChange,
}: Props) {
	// Memoised: only recompute when displayMonth changes.
	const { cells, rows } = useMemo(() => {
		const c = buildCells(displayMonth);
		const r = Array.from({ length: 6 }, (_, i) => c.slice(i * 7, i * 7 + 7));
		return { cells: c, rows: r };
	}, [displayMonth]);

	const title = displayMonth.toLocaleString("default", { month: "long", year: "numeric" });

	// When there are no sessions yet, don't clamp prev navigation at all —
	// fall back to null so isPrevDisabled stays false.
	const earliestSessionDate = useMemo<Date | null>(() => {
		if (sessionDates.size === 0) return null;
		const sorted = Array.from(sessionDates).sort();
		return new Date(sorted[0] + "T00:00:00");
	}, [sessionDates]);

	const today = new Date();

	const isPrevDisabled =
		earliestSessionDate !== null &&
		displayMonth.getFullYear() === earliestSessionDate.getFullYear() &&
		displayMonth.getMonth() === earliestSessionDate.getMonth();

	const isNextDisabled =
		displayMonth.getFullYear() === today.getFullYear() && displayMonth.getMonth() === today.getMonth();

	const handlePrev = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onMonthChange("prev");
	};

	const handleNext = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onMonthChange("next");
	};

	return (
		<View style={styles.container}>
			{/* Month header */}
			<View style={styles.headerRow}>
				<Text style={styles.monthTitle}>{title}</Text>
				<View style={styles.navButtons}>
					<TouchableOpacity
						onPress={isPrevDisabled ? undefined : handlePrev}
						disabled={isPrevDisabled}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={{ opacity: isPrevDisabled ? 0.3 : 1 }}
					>
						<Text style={styles.navButton}>‹</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={isNextDisabled ? undefined : handleNext}
						disabled={isNextDisabled}
						hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						style={{ opacity: isNextDisabled ? 0.3 : 1 }}
					>
						<Text style={styles.navButton}>›</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Day-of-week headers */}
			<View style={styles.dayLabelsRow}>
				{DAY_LABELS.map((label) => (
					<View key={label} style={styles.cell}>
						<Text style={styles.dayLabel}>{label}</Text>
					</View>
				))}
			</View>

			{/* Day grid */}
			{rows.map((row, rowIndex) => (
				<View key={rowIndex} style={styles.row}>
					{row.map((dateStr, colIndex) => {
						if (!dateStr) {
							return <View key={colIndex} style={styles.cell} />;
						}

						const isToday = dateStr === TODAY_STR;
						const isSelected = dateStr === selectedDate;
						const isPast = dateStr < TODAY_STR;
						const hasSession = sessionDates.has(dateStr);
						const isTappable = hasSession || isPast || isToday;
						const dayNum = Number(dateStr.split("-")[2]);

						const { circleBg, textColor, dimOpacity, fontWeight } = getDayStyle(
							isToday,
							isSelected,
							isPast,
							hasSession,
						);

						return (
							<TouchableOpacity
								key={colIndex}
								style={styles.cell}
								onPress={
									isTappable
										? () => {
												Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
												onDayPress(dateStr);
											}
										: undefined
								}
								disabled={!isTappable}
								activeOpacity={0.7}
							>
								<View
									style={[
										styles.circle,
										circleBg !== undefined && { backgroundColor: circleBg },
										dimOpacity < 1 && { opacity: dimOpacity },
									]}
								>
									<Text style={[styles.dayNumber, { color: textColor, fontWeight }]}>{dayNum}</Text>
								</View>
							</TouchableOpacity>
						);
					})}
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: spacing.md,
		paddingTop: spacing.md,
		paddingBottom: spacing.sm,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: spacing.sm,
	},
	monthTitle: {
		fontFamily: fonts.heading.medium,
		fontSize: 18,
		color: colors.textPrimary,
	},
	navButtons: {
		flexDirection: "row",
		gap: spacing.md,
	},
	navButton: {
		fontSize: 22,
		color: colors.textPrimary,
		lineHeight: 26,
	},
	dayLabelsRow: {
		flexDirection: "row",
		paddingBottom: spacing.xs,
	},
	dayLabel: {
		...(typography.caption as object),
		color: colors.textSecondary,
		textTransform: "uppercase",
		textAlign: "center",
	},
	row: {
		flexDirection: "row",
	},
	cell: {
		width: CELL_SIZE,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	circle: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
	},
	dayNumber: {
		fontSize: 14,
	},
});
