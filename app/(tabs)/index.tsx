// app/(tabs)/index.tsx
import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
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

import { formatDateToYYYYMMDD } from "@utils/dateHelper";
import DashboardHeader from "@components/tabs/study/DashboardHeader";
import CalendarStrip from "@components/tabs/study/CalendarStrip";
import PreviousSessionsCard, { SessionRow } from "@components/tabs/study/PreviousSessionsCard";
import LanguageSwitcher from "@components/ui/LanguageSwitcher";

import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { fonts } from "@theme/typography";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getLastSevenDays = (): Date[] => {
	const today = new Date();
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(today);
		d.setDate(today.getDate() - (6 - i));
		return d;
	});
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

	if (loading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.appBackground} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.accentPrimary} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<>
			<SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.appBackground} />

				<View style={styles.topBlock}>
					<DashboardHeader
						greeting={greeting}
						flag={flag}
						streakCount={streakCount}
						onFlagPress={() => setSwitcherVisible(true)}
					/>

					<CalendarStrip weekDates={weekDates} studyDays={studyDays} />

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

				<PreviousSessionsCard sessionRows={sessionRows} />
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
		backgroundColor: colors.appBackground,
	},
	topBlock: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	heroSection: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	ctaGroup: { alignItems: "center" },
	readyLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 1.5,
		color: colors.textSecondary,
		textTransform: "uppercase",
		marginBottom: 4,
	},
	materialTitle: {
		fontFamily: fonts.heading.italic,
		fontSize: 15,
		color: colors.textTertiary,
		marginBottom: spacing.md,
		maxWidth: 260,
		textAlign: "center",
	},
	beginButton: {
		width: 144,
		height: 144,
		borderRadius: 72,
		backgroundColor: colors.accentPrimary,
		alignItems: "center",
		justifyContent: "center",
		marginTop: spacing.lg,
	},
	beginIcon: { fontSize: 32, color: colors.buttonOnAccentText, marginLeft: 4, marginBottom: 2 },
	beginLabel: {
		fontSize: 11,
		fontWeight: "500",
		color: colors.buttonOnAccentText,
		letterSpacing: 2,
		textTransform: "uppercase",
	},
});
