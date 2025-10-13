// app/(tabs)/index.tsx - Updated Study Screen
// Replace the entire file with this updated version

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

// Import database queries
import { getAllMaterials, getTodaySession, getRecentSessions, getStudyDaysInMonth } from "../../database/queries";

// Import components
import TopBar from "../../components/ui/TopBar";
import EmptyState from "../../components/EmptyState";
import CalendarWeek from "../../components/tabs/study/CalendarWeek";
import CardCover from "../../components/tabs/library/CardCover";

// Import theme
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { typography } from "../../theme/typography";

interface Activity {
	id: number;
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

export default function StudyScreen() {
	const [materials, setMaterials] = useState([]);
	const [todaySession, setTodaySession] = useState<Session | null>(null);
	const [recentSessions, setRecentSessions] = useState<Session[]>([]);
	const [studyDays, setStudyDays] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	// Reload data when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			loadStudyData();
		}, [])
	);

	const loadStudyData = async () => {
		try {
			setLoading(true);

			// Check if user has materials
			const materialsData = await getAllMaterials();
			setMaterials(materialsData);

			// Get today's date
			const today = new Date().toISOString().split("T")[0];

			// Load today's session (if exists)
			const todayData = await getTodaySession(today);
			setTodaySession(todayData);

			// Load study days for calendar
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth() + 1;
			const daysData = await getStudyDaysInMonth(year, month);
			setStudyDays(daysData);

			// Load recent sessions (only if no activity today)
			let recentData = [];
			if (!todayData) {
				recentData = await getRecentSessions(3);
				setRecentSessions(recentData);
			} else {
				setRecentSessions([]);
			}

			console.log("Study data loaded:", {
				materials: materialsData.length,
				todayActivities: todayData?.activities?.length || 0,
				recentSessions: recentData.length,
			});
		} catch (error) {
			console.error("Error loading study data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogSession = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		router.push("/log-session/select-material");
	};

	const getRelativeDate = (dateString: string): string => {
		const date = new Date(dateString);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const dateOnly = date.toISOString().split("T")[0];
		const todayOnly = today.toISOString().split("T")[0];
		const yesterdayOnly = yesterday.toISOString().split("T")[0];

		if (dateOnly === todayOnly) return "Today";
		if (dateOnly === yesterdayOnly) return "Yesterday";

		// Days ago
		const diffTime = today.getTime() - date.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		if (diffDays <= 7) return `${diffDays} days ago`;

		// Format as date
		return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const formatDuration = (minutes: number): string => {
		if (minutes < 60) {
			return `${minutes} min`;
		}
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (mins === 0) {
			return `${hours}h`;
		}
		return `${hours}h ${mins}m`;
	};

	const getUnitsText = (activity: Activity): string | null => {
		if (!activity.units_studied) return null;

		const type = activity.material_type;
		const units = activity.units_studied;

		if (type === "book") {
			return `${units} ${units === 1 ? "page" : "pages"}`;
		} else if (type === "audio") {
			return `${units} ${units === 1 ? "episode" : "episodes"}`;
		} else if (type === "video") {
			return `${units} ${units === 1 ? "video" : "videos"}`;
		} else if (type === "class") {
			return `${units} ${units === 1 ? "session" : "sessions"}`;
		} else if (type === "app") {
			return `${units} ${units === 1 ? "lesson" : "lessons"}`;
		}
		return null;
	};

	if (loading) {
		return (
			<SafeAreaView style={globalStyles.container}>
				<StatusBar barStyle="dark-content" backgroundColor={colors.white} />
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color={colors.primaryAccent} />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				<TopBar />

				{/* Show empty state if no materials */}
				{materials.length === 0 ? (
					<EmptyState onAddNew={() => router.push("/add-material")} />
				) : (
					<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
						{/* Calendar Week */}
						<CalendarWeek studyDays={studyDays} onDayPress={undefined} />

						{/* Today Label */}
						<Text style={styles.todayLabel}>Today</Text>

						{/* Log Session / Add Activity Button */}
						<TouchableOpacity style={styles.logSessionButton} onPress={handleLogSession} activeOpacity={0.9}>
							<Text style={styles.logSessionText}>
								{todaySession && todaySession.activities.length > 0 ? "Add Activity" : "Log Study Session"}
							</Text>
						</TouchableOpacity>

						{/* Today's Session (if activities exist) */}
						{todaySession && todaySession.activities.length > 0 && (
							<View style={styles.todaySessionContainer}>
								<View style={styles.sessionHeader}>
									<Text style={styles.sectionTitle}>Today's Session</Text>
									<Text style={styles.sessionSummary}>
										{formatDuration(todaySession.total_duration)} •{" "}
										{todaySession.activities.length === 1
											? "1 activity"
											: `${todaySession.activities.length} activities`}
									</Text>
								</View>

								{/* Activities List */}
								<View style={styles.activitiesList}>
									{todaySession.activities.map((activity) => (
										<View key={activity.id} style={styles.activityCard}>
											<CardCover type={activity.material_type} />
											<View style={styles.activityInfo}>
												<Text style={styles.activityName}>{activity.material_name}</Text>
												<Text style={styles.activityDetails}>
													{formatDuration(activity.duration_minutes)}
													{getUnitsText(activity) && ` • ${getUnitsText(activity)}`}
												</Text>
											</View>
										</View>
									))}
								</View>
							</View>
						)}

						{/* Recent Sessions (only show if no activities today) */}
						{(!todaySession || todaySession.activities.length === 0) && recentSessions.length > 0 && (
							<View style={styles.recentSessionsContainer}>
								<Text style={styles.sectionTitle}>Recent Sessions</Text>
								{recentSessions.map((session) => (
									<View key={session.id} style={styles.recentSessionCard}>
										<View style={styles.recentSessionHeader}>
											<Text style={styles.recentSessionDate}>{getRelativeDate(session.session_date)}</Text>
											<Text style={styles.recentSessionDuration}>{formatDuration(session.total_duration)}</Text>
										</View>
										<View style={styles.recentSessionActivities}>
											{session.activities.map((activity, index) => (
												<Text key={index} style={styles.recentSessionActivity}>
													• {activity.material_name} ({formatDuration(activity.duration_minutes)})
												</Text>
											))}
										</View>
									</View>
								))}
							</View>
						)}
					</ScrollView>
				)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: spacing.xl,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	scrollContent: {
		flex: 1,
	},
	todayLabel: {
		...typography.headingSmall,
		color: colors.grayDarkest,
		marginTop: spacing.lg,
		marginBottom: spacing.md,
	},
	logSessionButton: {
		backgroundColor: colors.primaryAccent,
		paddingVertical: 16,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.xl,
		shadowColor: colors.primaryAccent,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	logSessionText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: "600",
	},
	todaySessionContainer: {
		marginBottom: spacing.xl,
	},
	sessionHeader: {
		marginBottom: spacing.md,
	},
	sectionTitle: {
		...typography.headingSmall,
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	sessionSummary: {
		...typography.bodyMedium,
		color: colors.grayMedium,
	},
	activitiesList: {
		gap: spacing.sm,
	},
	activityCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: spacing.md,
		backgroundColor: colors.white,
		borderRadius: borderRadius.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	activityInfo: {
		marginLeft: spacing.md,
		flex: 1,
	},
	activityName: {
		...typography.bodyLarge,
		fontWeight: "500",
		color: colors.grayDarkest,
		marginBottom: 4,
	},
	activityDetails: {
		...typography.bodySmall,
		color: colors.grayMedium,
	},
	recentSessionsContainer: {
		marginTop: spacing.lg,
		marginBottom: spacing.xl,
	},
	recentSessionCard: {
		padding: spacing.md,
		backgroundColor: colors.grayLightest,
		borderRadius: borderRadius.sm,
		marginTop: spacing.sm,
	},
	recentSessionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.sm,
	},
	recentSessionDate: {
		...typography.bodyLarge,
		fontWeight: "600",
		color: colors.grayDarkest,
	},
	recentSessionDuration: {
		...typography.bodyMedium,
		color: colors.grayMedium,
	},
	recentSessionActivities: {
		gap: 4,
	},
	recentSessionActivity: {
		...typography.bodySmall,
		color: colors.grayMedium,
	},
});
