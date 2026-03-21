// app/(tabs)/index.tsx
import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import LanguageSwitcher from "@components/ui/LanguageSwitcher";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import {
	getUserSettings,
	getLanguageByCode,
	getStudyDaysInRange,
	getRecentSessions,
	getRecentlyStudiedMaterials,
	getStreakCount,
} from "@database/queries";

import { getDayLetter, formatDateToYYYYMMDD, getRelativeTime } from "@utils/dateHelper";
import CardCover from "@components/tabs/library/CardCover";

import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography, fonts } from "@theme/typography";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Activity {
	id: number;
	material_name: string;
	material_type: string;
	duration_minutes: number;
}

interface Session {
	id: number;
	session_date: string;
	total_duration: number;
	activities: Activity[];
}

interface SessionRow {
	key: string;
	materialName: string;
	materialType: string;
	sessionDate: string;
	durationMinutes: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLastSevenDays = (): Date[] => {
	const today = new Date();
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() - (6 - i));
		return d;
	});
};

const formatDuration = (minutes: number): string => {
	if (minutes < 60) return `${minutes} min`;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const formatSessionDate = (dateStr: string): string => {
	if (dateStr === formatDateToYYYYMMDD(new Date())) return "Today";
	return getRelativeTime(dateStr);
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function StudyScreen() {
	const [greeting, setGreeting] = useState("Hello!");
	const [flag, setFlag] = useState("🌍");
	const [streakCount, setStreakCount] = useState(0);
	const [studyDays, setStudyDays] = useState<string[]>([]);
	const [lastMaterialName, setLastMaterialName] = useState<string | null>(null);
	const [sessionRows, setSessionRows] = useState<SessionRow[]>([]);
	const [loading, setLoading] = useState(true);
	const [switcherVisible, setSwitcherVisible] = useState(false);

	const loadData = useCallback(async () => {
		try {
			setLoading(true);
			const today = new Date();
			const windowDates = getLastSevenDays();
			const windowStart = formatDateToYYYYMMDD(windowDates[0]);
			const windowEnd = formatDateToYYYYMMDD(today);

			const [settings, days, recent, materials, streak] = await Promise.all([
				getUserSettings(),
				getStudyDaysInRange(windowStart, windowEnd),
				getRecentSessions(5),
				getRecentlyStudiedMaterials(1),
				getStreakCount(),
			]);

			if (settings?.primary_language) {
				const lang = await getLanguageByCode(settings.primary_language);
				if (lang?.greeting) setGreeting(lang.greeting);
				if (lang?.flag) setFlag(lang.flag);
			}

			setStudyDays(days);
			setStreakCount(streak);
			setLastMaterialName((materials as { name: string }[])?.[0]?.name ?? null);

			const rows: SessionRow[] = (recent as Session[]).flatMap((session) =>
				session.activities.map((activity) => ({
					key: `${session.id}-${activity.id}`,
					materialName: activity.material_name,
					materialType: activity.material_type,
					sessionDate: session.session_date,
					durationMinutes: activity.duration_minutes,
				})),
			);
			setSessionRows(rows);
		} catch (error) {
			console.error("Error loading study data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadData();
		}, [loadData]),
	);

	const handleBegin = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push({
			pathname: "/log-session/select-material",
			params: { date: formatDateToYYYYMMDD(new Date()) },
		});
	};

	const weekDates = getLastSevenDays();
	const todayStr = formatDateToYYYYMMDD(new Date());

	const getDayState = (date: Date): "today" | "studied" | "notStudied" => {
		const dateStr = formatDateToYYYYMMDD(date);
		if (dateStr === todayStr) return "today";
		if (studyDays.includes(dateStr)) return "studied";
		return "notStudied";
	};

	if (loading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
				</View>
			</SafeAreaView>
		);
	}

	const displayedRows = sessionRows.slice(0, 3);

	return (
		<>
		<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<View style={styles.topBlock}>
				<View style={styles.header}>
					<View style={styles.greetingRow}>
						<Text style={styles.greeting}>{greeting}</Text>
						<TouchableOpacity
							style={styles.flagTappable}
							onPress={() => {
								Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								setSwitcherVisible(true);
							}}
							activeOpacity={0.7}
						>
							<Text style={styles.flagEmoji}>{flag}</Text>
							<Text style={styles.flagChevron}>▾</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.statusPill}>
						<Text style={styles.streakText}>
							🔥 {streakCount} {streakCount === 1 ? "DAY" : "DAYS"}
						</Text>
					</View>
				</View>

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
								<View style={styles.dotContainer}>{state === "studied" && <View style={styles.studiedDot} />}</View>
							</View>
						);
					})}
				</View>

				{/* HERO SECTION: Now centers the button in the middle of available space */}
				<View style={styles.heroSection}>
					<View style={styles.ctaGroup}>
						<Text style={styles.readyLabel}>
						{sessionRows.length === 0 && lastMaterialName === null ? "READY TO START?" : "READY TO CONTINUE?"}
					</Text>
						{lastMaterialName ? (
							<Text style={styles.materialTitle} numberOfLines={1}>
								{lastMaterialName}
							</Text>
						) : null}

						<TouchableOpacity style={styles.beginButton} onPress={handleBegin} activeOpacity={0.85}>
							<Text style={styles.beginIcon}>▶</Text>
							<Text style={styles.beginLabel}>BEGIN</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>

			<View style={styles.sessionsCard}>
				<View style={styles.sessionsCardHeader}>
					<Text style={styles.sessionsCardTitle}>Previous sessions</Text>
					{sessionRows.length > 0 && (
						<TouchableOpacity activeOpacity={0.7}>
							<Text style={styles.seeAllText}>See all</Text>
						</TouchableOpacity>
					)}
				</View>

				{displayedRows.length === 0 ? (
					<Text style={styles.emptyText}>Your previous sessions will appear here</Text>
				) : (
					displayedRows.map((row, index) => (
						<View
							key={row.key}
							style={[styles.sessionRow, index === displayedRows.length - 1 && styles.sessionRowLast]}
						>
							<CardCover type={row.materialType} size={40} />
							<View style={styles.sessionInfo}>
								<Text style={styles.sessionName} numberOfLines={1}>
									{row.materialName}
								</Text>
								<Text style={styles.sessionMeta}>{formatSessionDate(row.sessionDate)}</Text>
							</View>
							<Text style={styles.sessionDuration}>{formatDuration(row.durationMinutes)}</Text>
						</View>
					))
				)}
			</View>
		</SafeAreaView>

		<LanguageSwitcher
			visible={switcherVisible}
			onClose={() => setSwitcherVisible(false)}
			onLanguageSelected={() => loadData()}
		/>
		</>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.gray50,
	},
	topBlock: {
		flex: 1, // Takes up all remaining space above the card
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.md,
		paddingBottom: spacing.xs,
	},
	greetingRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.xs,
	},
	greeting: {
		fontFamily: fonts.heading.medium,
		fontSize: 30,
		color: colors.grayDarkest,
	},
	statusPill: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.primaryAccent,
		paddingVertical: 6,
		paddingHorizontal: spacing.sm,
		borderRadius: borderRadius.pill,
	},
	flagTappable: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
	},
	flagEmoji: { fontSize: 24 },
	flagChevron: {
		fontSize: 12,
		color: colors.grayMedium,
		marginTop: 2,
	},
	streakText: {
		fontSize: 11,
		fontWeight: "800",
		color: colors.white,
		letterSpacing: 0.5,
	},
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

	heroSection: {
		flex: 1, // Expands to fill the space between calendar and card
		alignItems: "center",
		justifyContent: "center", // Centers the ctaGroup vertically
	},
	ctaGroup: { alignItems: "center" },
	readyLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1.5,
		color: colors.grayMedium,
		textTransform: "uppercase",
		marginBottom: 4,
	},
	materialTitle: {
		fontFamily: fonts.heading.italic,
		fontSize: 15,
		color: colors.grayLightMedium,
		marginBottom: spacing.md,
		maxWidth: 260,
		textAlign: "center",
	},
	beginButton: {
		width: 144,
		height: 144,
		borderRadius: 72,
		backgroundColor: colors.primaryAccent,
		alignItems: "center",
		justifyContent: "center",
		marginTop: spacing.lg,
		shadowColor: colors.grayDarkest,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	beginIcon: { fontSize: 32, color: colors.white, marginLeft: 4, marginBottom: 2 },
	beginLabel: {
		fontSize: 11,
		fontWeight: "500",
		color: colors.white,
		letterSpacing: 2,
		textTransform: "uppercase",
	},
	sessionsCard: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md, // Adjust if you want more space at the bottom
	},
	sessionsCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.md,
	},
	sessionsCardTitle: { ...typography.headingSmall, color: colors.grayDarkest },
	seeAllText: { fontSize: 14, fontWeight: "600", color: colors.primaryAccent },
	emptyText: {
		fontSize: 15,
		color: colors.grayMedium,
		fontStyle: "italic",
		textAlign: "center",
		paddingVertical: spacing.lg,
	},
	sessionRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.gray200,
	},
	sessionRowLast: { borderBottomWidth: 0 },
	sessionInfo: { flex: 1 },
	sessionName: { fontSize: 15, fontWeight: "600", color: colors.grayDarkest, marginBottom: 2 },
	sessionMeta: { fontSize: 12, color: colors.grayMedium },
	sessionDuration: {
		fontFamily: fonts.heading.italic,
		fontSize: 14,
		color: colors.grayDark,
	},
});
