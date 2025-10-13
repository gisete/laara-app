// app/(tabs)/index.tsx - Complete Study Screen Implementation
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

// Import database queries
import { getAllMaterials, getStudyDaysInMonth, getRecentMaterials } from "../../database/queries";

// Import components
import TopBar from "../../components/ui/TopBar";
import EmptyState from "../../components/EmptyState";
import CalendarWeek from "../../components/tabs/study/CalendarWeek";
import RecentMaterials from "../../components/tabs/study/RecentMaterials";

// Import theme
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function StudyScreen() {
	const [materials, setMaterials] = useState([]);
	const [recentMaterials, setRecentMaterials] = useState([]);
	const [studyDays, setStudyDays] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);

	// Reload data when screen comes into focus (when user returns from other screens)
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

			// Load study days for current month
			const now = new Date();
			const year = now.getFullYear();
			const month = now.getMonth() + 1;
			const daysData = await getStudyDaysInMonth(year, month);
			setStudyDays(daysData);

			// Load recent materials (only if materials exist)
			if (materialsData.length > 0) {
				const recentData = await getRecentMaterials(3);
				setRecentMaterials(recentData);
			}
		} catch (error) {
			console.error("Error loading study data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleLogSession = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		// TODO: Navigate to session logging screen
		console.log("Open session logging screen");
		// router.push('/log-session');
	};

	const handleContinueSession = (materialId: number) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		// TODO: Navigate to session logging screen with pre-selected material
		console.log("Continue session for material:", materialId);
		// router.push(`/log-session?materialId=${materialId}`);
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
						<CalendarWeek
							studyDays={studyDays}
							onDayPress={undefined} // Navigation deferred for future
						/>

						{/* Today Label */}
						<Text style={styles.todayLabel}>Today</Text>

						{/* Log Session Button */}
						<TouchableOpacity style={styles.logSessionButton} onPress={handleLogSession} activeOpacity={0.9}>
							<Text style={styles.logSessionText}>Log Study Session</Text>
						</TouchableOpacity>

						{/* Recent Materials - only show if sessions exist */}
						{recentMaterials.length > 0 && (
							<RecentMaterials materials={recentMaterials} onContinue={handleContinueSession} />
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
		paddingHorizontal: spacing.xl, // 32
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
		color: colors.grayDarkest, // #211E1C
		marginTop: spacing.lg, // 24
		marginBottom: spacing.md, // 16
	},
	logSessionButton: {
		backgroundColor: colors.primaryAccent, // #D9635B - Coral/red accent
		paddingVertical: 16,
		borderRadius: 5,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: spacing.xl, // 32
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
});
