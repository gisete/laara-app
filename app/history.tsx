// app/history.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
	FlatList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { getAllSessions } from "@database/queries";
import CardCover from "@components/tabs/library/CardCover";
import FormHeader from "@components/forms/FormHeader";
import HistoryCalendar from "@components/history/HistoryCalendar";
import { getActivityText } from "@utils/materialUtils";
import { formatDateToYYYYMMDD } from "@utils/dateHelper";

import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { fonts, typography } from "@theme/typography";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Activity {
	id: number;
	session_id: number;
	material_id: number;
	material_name: string;
	material_type: string;
	material_subtype?: string;
	duration_minutes: number;
	units_studied?: number;
}

interface Session {
	id: number;
	session_date: string;
	total_duration: number;
	activities: Activity[];
}

type ListItem =
	| { kind: "header"; date: string; totalMinutes: number; key: string }
	| { kind: "activity"; activity: Activity; isLast: boolean; key: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDuration = (minutes: number): string => {
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const formatSessionDateLabel = (dateStr: string): string => {
	const today = formatDateToYYYYMMDD(new Date());
	if (dateStr === today) return "Today";

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	if (dateStr === formatDateToYYYYMMDD(yesterday)) return "Yesterday";

	// "Monday, March 18"
	const [year, month, day] = dateStr.split("-").map(Number);
	const d = new Date(year, month - 1, day);
	return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const buildListItems = (sessions: Session[]): ListItem[] => {
	const items: ListItem[] = [];
	for (const session of sessions) {
		items.push({
			kind: "header",
			date: session.session_date,
			totalMinutes: session.total_duration,
			key: `header-${session.id}`,
		});
		session.activities.forEach((activity, index) => {
			items.push({
				kind: "activity",
				activity,
				isLast: index === session.activities.length - 1,
				key: `activity-${activity.id}`,
			});
		});
	}
	return items;
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function HistoryScreen() {
	const [allSessions, setAllSessions] = useState<Session[]>([]);
	const [displayMonth, setDisplayMonth] = useState<Date>(() => new Date());
	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			(getAllSessions() as Promise<Session[]>).then(setAllSessions).catch(console.error);
		}, [])
	);

	const sessionDates = useMemo(
		() => new Set(allSessions.map((s: Session) => s.session_date)),
		[allSessions]
	);

	const filteredSessions = useMemo(() => {
		if (selectedDate) {
			return allSessions.filter((s: Session) => s.session_date === selectedDate);
		}
		const y = displayMonth.getFullYear();
		const m = String(displayMonth.getMonth() + 1).padStart(2, "0");
		const prefix = `${y}-${m}`;
		return allSessions.filter((s: Session) => s.session_date.startsWith(prefix));
	}, [allSessions, selectedDate, displayMonth]);

	const handleDayPress = (date: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		setSelectedDate((prev) => (prev === date ? null : date));
	};

	const handleMonthChange = (direction: "prev" | "next") => {
		setDisplayMonth((prev) => {
			const d = new Date(prev);
			d.setMonth(d.getMonth() + (direction === "next" ? 1 : -1));
			return d;
		});
		setSelectedDate(null);
	};

	const handleFabPress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push({
			pathname: "/log-session/select-material",
			params: {
				date: selectedDate ?? formatDateToYYYYMMDD(new Date()),
				entryMode: "manual",
				returnTo: "history",
			},
		});
	};

	const listItems = buildListItems(filteredSessions);


	const renderItem = ({ item }: { item: ListItem }) => {
		if (item.kind === "header") {
			return (
				<View style={styles.dateHeader}>
					<Text style={styles.dateLabel}>{formatSessionDateLabel(item.date)}</Text>
					<Text style={styles.dateTotalDuration}>{formatDuration(item.totalMinutes)}</Text>
				</View>
			);
		}

		const { activity, isLast } = item;
		return (
			<View style={[styles.activityRow, isLast && styles.activityRowLast]}>
				<CardCover type={activity.material_type} size={44} />
				<View style={styles.activityInfo}>
					<Text style={styles.activityName} numberOfLines={1}>
						{activity.material_name}
					</Text>
					{activity.units_studied != null && activity.units_studied > 0 && (
						<Text style={styles.activityUnits}>
							{getActivityText(activity.material_type, activity.units_studied)}
						</Text>
					)}
				</View>
				<Text style={styles.activityDuration}>{formatDuration(activity.duration_minutes)}</Text>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.appBackground} />
			<FormHeader title="Session History" onBack={() => router.back()} />

			<FlatList
				data={listItems}
				keyExtractor={(item) => item.key}
				renderItem={renderItem}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<HistoryCalendar
						displayMonth={displayMonth}
						selectedDate={selectedDate}
						sessionDates={sessionDates}
						onDayPress={handleDayPress}
						onMonthChange={handleMonthChange}
					/>
				}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyStateText}>
							{selectedDate
								? "No sessions on this day"
								: `No sessions in ${displayMonth.toLocaleString("default", { month: "long" })}`}
						</Text>
							</View>
				}
			/>

			<View style={styles.fabContainer} pointerEvents="box-none">
				<TouchableOpacity style={styles.fab} onPress={handleFabPress} activeOpacity={0.85}>
					<Text style={styles.fabIcon}>+</Text>
					<Text style={styles.fabLabel}>Log session</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.appBackground,
	},
	listContent: {
		paddingBottom: spacing.xxl,
	},
	emptyState: {
		paddingVertical: spacing.xl,
		alignItems: "center",
		paddingHorizontal: spacing.lg,
	},
	emptyStateText: {
		...(typography.bodyMedium as object),
		color: colors.textSecondary,
		marginBottom: spacing.md,
		textAlign: "center",
	},
	// Date section header
	dateHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.sm,
	},
	dateLabel: {
		fontSize: 13,
		fontWeight: "600",
		color: colors.textSecondary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	dateTotalDuration: {
		fontFamily: fonts.heading.italic,
		fontSize: 13,
		color: colors.textTertiary,
	},

	// Session card
	activityRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surfaceDefault,
		paddingVertical: 12,
		paddingHorizontal: spacing.lg,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.borderDefault,
	},
	activityRowLast: {
		borderBottomWidth: 0,
	},
	activityInfo: {
		flex: 1,
		marginLeft: spacing.sm,
		marginRight: spacing.sm,
	},
	activityName: {
		fontSize: 15,
		fontWeight: "600",
		color: colors.textPrimary,
		marginBottom: 2,
	},
	activityUnits: {
		fontSize: 13,
		color: colors.textTertiary,
	},
	activityDuration: {
		fontFamily: fonts.heading.italic,
		fontSize: 14,
		color: colors.textSecondary,
	},

	// FAB
	fabContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		alignItems: "flex-end",
		paddingRight: spacing.lg,
		paddingBottom: spacing.xl,
		pointerEvents: "box-none",
	},
	fab: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingVertical: 14,
		borderRadius: borderRadius.pill,
		backgroundColor: colors.primaryAccent,
		gap: spacing.xs,
	},
	fabIcon: {
		fontSize: 22,
		color: colors.buttonOnAccentText,
		fontWeight: "300",
	},
	fabLabel: {
		fontSize: 15,
		fontWeight: "500",
		color: colors.buttonOnAccentText,
	},
});
