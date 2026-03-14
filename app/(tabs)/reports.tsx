// app/(tabs)/reports.tsx
import React, { useCallback, useState } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import Svg, { Circle } from "react-native-svg";

import { getReportData, getStreakCount } from "@database/queries";
import CardCover from "@components/tabs/library/CardCover";
import ScreenHeader from "@components/ui/ScreenHeader";
import { getUnitLabel } from "@utils/materialUtils";
import { formatDateToYYYYMMDD } from "@utils/dateHelper";

import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";
import { globalStyles } from "@theme/styles";

// ── Types ─────────────────────────────────────────────────────────────────────

type Filter = "week" | "month" | "all";

interface TypeBreakdown {
	type: string;
	totalMinutes: number;
}

interface MostStudied {
	name: string;
	type: string;
	subtype?: string;
	totalMinutes: number;
}

interface UnitBreakdown {
	type: string;
	totalUnits: number;
}

interface ReportData {
	totalMinutes: number;
	sessionCount: number;
	daysStudied: number;
	byType: TypeBreakdown[];
	mostStudiedMaterial: MostStudied | null;
	unitsByType: UnitBreakdown[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CHART_SIZE = 200;
const STROKE_WIDTH = 36;
const RADIUS = (CHART_SIZE - STROKE_WIDTH) / 2; // 82
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2;

const CATEGORY_COLORS: Record<string, string> = {
	book: colors.categoryBook,
	audio: colors.categoryAudio,
	video: colors.categoryVideo,
	class: colors.categoryClass,
	app: colors.categoryApp,
};

const TYPE_LABELS: Record<string, string> = {
	book: "Book",
	audio: "Audio",
	video: "Video",
	class: "Class",
	app: "App",
};

const FILTERS: { key: Filter; label: string }[] = [
	{ key: "week", label: "This Week" },
	{ key: "month", label: "This Month" },
	{ key: "all", label: "All Time" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDuration = (minutes: number): string => {
	if (minutes === 0) return "0m";
	if (minutes < 60) return `${minutes}m`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const getDateRange = (filter: Filter): { startDate: string; endDate: string } => {
	const today = new Date();
	const todayStr = formatDateToYYYYMMDD(today);
	if (filter === "week") {
		const start = new Date(today);
		start.setDate(today.getDate() - 6);
		return { startDate: formatDateToYYYYMMDD(start), endDate: todayStr };
	}
	if (filter === "month") {
		const start = new Date(today.getFullYear(), today.getMonth(), 1);
		return { startDate: formatDateToYYYYMMDD(start), endDate: todayStr };
	}
	return { startDate: "2020-01-01", endDate: todayStr };
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
// SVG <circle> draws CW starting at 3 o'clock (rightmost point).
// strokeDashoffset = C/4 - cumulative shifts each segment to start from 12 o'clock.

function DonutChart({ byType, total }: { byType: TypeBreakdown[]; total: number }) {
	const cx = CHART_SIZE / 2;
	const cy = CHART_SIZE / 2;

	if (total === 0 || byType.length === 0) {
		return (
			<Svg width={CHART_SIZE} height={CHART_SIZE}>
				<Circle
					cx={cx}
					cy={cy}
					r={RADIUS}
					fill="none"
					stroke={colors.gray200}
					strokeWidth={STROKE_WIDTH}
				/>
			</Svg>
		);
	}

	const multiSegment = byType.length > 1;
	let cumulative = 0;

	return (
		<Svg width={CHART_SIZE} height={CHART_SIZE}>
			{byType.map((item) => {
				const arcLength = (item.totalMinutes / total) * CIRCUMFERENCE;
				const visibleArc = multiSegment ? Math.max(0, arcLength - GAP) : arcLength;
				const dashOffset = CIRCUMFERENCE / 4 - cumulative;
				cumulative += arcLength;

				return (
					<Circle
						key={item.type}
						cx={cx}
						cy={cy}
						r={RADIUS}
						fill="none"
						stroke={CATEGORY_COLORS[item.type] ?? colors.gray200}
						strokeWidth={STROKE_WIDTH}
						strokeDasharray={`${visibleArc} ${CIRCUMFERENCE - visibleArc}`}
						strokeDashoffset={dashOffset}
						strokeLinecap="butt"
					/>
				);
			})}
		</Svg>
	);
}

// ── Screen ────────────────────────────────────────────────────────────────────

const EMPTY_DATA: ReportData = {
	totalMinutes: 0,
	sessionCount: 0,
	daysStudied: 0,
	byType: [],
	mostStudiedMaterial: null,
	unitsByType: [],
};

export default function ReportsScreen() {
	const [filter, setFilter] = useState<Filter>("week");
	const [data, setData] = useState<ReportData>(EMPTY_DATA);
	const [streak, setStreak] = useState(0);
	const [loading, setLoading] = useState(true);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const { startDate, endDate } = getDateRange(filter);
			const [reportData, streakCount] = await Promise.all([
				getReportData(startDate, endDate),
				getStreakCount(),
			]);
			setData(reportData as ReportData);
			setStreak(streakCount as number);
		} catch (error) {
			console.error("Error loading report data:", error);
		} finally {
			setLoading(false);
		}
	}, [filter]);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData]),
	);

	if (loading) {
		return (
			<SafeAreaView style={globalStyles.container} edges={["top", "left", "right"]}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container} edges={["top", "left", "right"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<ScreenHeader title="Reports" />

				{/* Filter tabs */}
				<View style={styles.filterBar}>
					{FILTERS.map((f) => {
						const selected = filter === f.key;
						return (
							<TouchableOpacity
								key={f.key}
								style={[styles.filterTab, selected && styles.filterTabSelected]}
								onPress={() => setFilter(f.key)}
								activeOpacity={0.7}
							>
								<Text style={[styles.filterTabText, selected && styles.filterTabTextSelected]}>
									{f.label}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				{/* Hero card — total time */}
				<View style={[globalStyles.card, styles.heroCard]}>
					<Text style={styles.heroTime}>{formatDuration(data.totalMinutes)}</Text>
					<Text style={[globalStyles.inputLabel, styles.heroLabel]}>TOTAL TIME</Text>
				</View>

				{/* Donut chart */}
				<View style={styles.chartSection}>
					<DonutChart byType={data.byType} total={data.totalMinutes} />
					{data.byType.length > 0 && (
						<View style={styles.legend}>
							{data.byType.map((item) => (
								<View key={item.type} style={styles.legendItem}>
									<View
										style={[
											styles.legendDot,
											{ backgroundColor: CATEGORY_COLORS[item.type] ?? colors.gray200 },
										]}
									/>
									<Text style={styles.legendLabel}>{TYPE_LABELS[item.type] ?? item.type}</Text>
								</View>
							))}
						</View>
					)}
				</View>

				{/* Stats row */}
				<View style={styles.statsRow}>
					{[
						{ value: data.sessionCount, label: "SESSIONS" },
						{ value: data.daysStudied, label: "DAYS STUDIED" },
						{ value: streak, label: "DAY STREAK" },
					].map((stat) => (
						<View key={stat.label} style={[globalStyles.card, styles.statCard]}>
							<Text style={styles.statValue}>{stat.value}</Text>
							<Text style={[globalStyles.inputLabel, styles.statLabel]}>{stat.label}</Text>
						</View>
					))}
				</View>

				{/* Most studied */}
				<View style={[globalStyles.card, styles.cardGap]}>
					<Text style={globalStyles.inputLabel}>MOST STUDIED</Text>
					{data.mostStudiedMaterial ? (
						<View style={styles.mostStudiedRow}>
							<CardCover type={data.mostStudiedMaterial.type} size={44} />
							<View style={styles.mostStudiedInfo}>
								<Text style={styles.mostStudiedName} numberOfLines={2}>
									{data.mostStudiedMaterial.name}
								</Text>
								<Text style={styles.mostStudiedTime}>
									{formatDuration(data.mostStudiedMaterial.totalMinutes)}
								</Text>
							</View>
						</View>
					) : (
						<Text style={styles.emptyCardText}>No sessions this period</Text>
					)}
				</View>

				{/* Units breakdown */}
				{data.unitsByType.length > 0 && (
					<View style={[globalStyles.card, styles.cardGap]}>
						<Text style={globalStyles.inputLabel}>UNITS STUDIED</Text>
						{data.unitsByType.map((item) => (
							<View key={item.type} style={styles.unitRow}>
								<View
									style={[
										styles.legendDot,
										{ backgroundColor: CATEGORY_COLORS[item.type] ?? colors.gray200 },
									]}
								/>
								<Text style={styles.unitText}>
									{item.totalUnits} {getUnitLabel(item.type, item.totalUnits)}
								</Text>
							</View>
						))}
					</View>
				)}

				<View style={styles.bottomPadding} />
			</ScrollView>
		</SafeAreaView>
	);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		paddingHorizontal: spacing.md,
	},

	// Filter tabs
	filterBar: {
		flexDirection: "row",
		gap: spacing.xs,
		marginBottom: spacing.lg,
	},
	filterTab: {
		flex: 1,
		paddingVertical: 10,
		borderRadius: borderRadius.pill,
		alignItems: "center",
		borderWidth: 1.5,
		borderColor: colors.gray300,
	},
	filterTabSelected: {
		backgroundColor: colors.grayDarkest,
		borderColor: colors.grayDarkest,
	},
	filterTabText: {
		...typography.bodySmall,
		fontWeight: "600",
		color: colors.grayMedium,
	},
	filterTabTextSelected: {
		color: colors.white,
	},

	// Hero card
	heroCard: {
		alignItems: "center",
		paddingVertical: spacing.xl,
		marginBottom: spacing.lg,
	},
	heroTime: {
		fontFamily: "Domine-SemiBold",
		fontSize: 48,
		lineHeight: 56,
		color: colors.grayDarkest,
		marginBottom: spacing.xs,
	},
	heroLabel: {
		marginBottom: 0,
		marginLeft: 0,
	},

	// Donut chart
	chartSection: {
		alignItems: "center",
		marginBottom: spacing.lg,
	},
	legend: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: spacing.md,
		marginTop: spacing.md,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	legendDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	legendLabel: {
		...typography.bodySmall,
		color: colors.grayDark,
	},

	// Stats row
	statsRow: {
		flexDirection: "row",
		gap: spacing.xs,
		marginBottom: spacing.lg,
	},
	statCard: {
		flex: 1,
		alignItems: "center",
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.xs,
	},
	statValue: {
		fontFamily: "Domine-Medium",
		fontSize: 20,
		fontWeight: "500",
		lineHeight: 28,
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	statLabel: {
		marginBottom: 0,
		marginLeft: 0,
		textAlign: "center",
	},

	// Shared card spacing
	cardGap: {
		marginBottom: spacing.lg,
	},

	// Most studied
	mostStudiedRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		marginTop: spacing.sm,
	},
	mostStudiedInfo: {
		flex: 1,
	},
	mostStudiedName: {
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	mostStudiedTime: {
		fontFamily: "Domine-Medium",
		fontStyle: "italic",
		fontSize: 15,
		color: colors.grayMedium,
	},
	emptyCardText: {
		...typography.bodyMedium,
		fontStyle: "italic",
		color: colors.grayLightMedium,
		marginTop: spacing.sm,
	},

	// Units breakdown
	unitRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginTop: spacing.sm,
	},
	unitText: {
		...typography.bodyMedium,
		color: colors.grayDark,
	},

	bottomPadding: {
		height: spacing.xxl,
	},
});
