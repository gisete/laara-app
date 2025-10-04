// app/(tabs)/index.tsx - Study screen with new add-item route
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllMaterials } from "../../database/queries";

// Import components
import EmptyState from "../../components/EmptyState";
import TopBar from "../../components/ui/TopBar";

// Import global styles
import { globalStyles } from "../../theme/styles";
import { colors } from "../../theme/colors";
import { spacing, borderRadius } from "../../theme/spacing";

export default function StudyScreen() {
	const [materials, setMaterials] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadMaterials();
	}, []);

	const loadMaterials = async () => {
		try {
			setLoading(true);
			const materialsData = await getAllMaterials();
			setMaterials(materialsData);
		} catch (error) {
			console.error("Error loading materials:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={globalStyles.container}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.white} />

			<View style={styles.content}>
				{/* TopBar now handles language loading internally */}
				<TopBar />

				{/* Conditional content based on materials */}
				{!loading && materials.length === 0 ? (
					// Navigate to dedicated add-new-item screen instead of library
					<EmptyState onAddNew={() => router.push("/add-material")} />
				) : (
					// Show main study content when materials exist
					<ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
						{/* Calendar Week View */}
						<View style={styles.calendarContainer}>
							<View style={styles.calendarHeader}>
								<TouchableOpacity style={styles.navigationButton}>
									<Text style={styles.navigationText}>‹</Text>
								</TouchableOpacity>

								<Text style={styles.monthText}>December 2024</Text>

								<TouchableOpacity style={styles.navigationButton}>
									<Text style={styles.navigationText}>›</Text>
								</TouchableOpacity>
							</View>

							{/* Week days */}
							<View style={styles.weekContainer}>
								{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
									const dates = [13, 14, 15, 16, 17, 18, 19];
									const isToday = index === 4; // Friday (17th)
									const hasStudied = index === 1 || index === 2; // Tuesday and Wednesday

									return (
										<TouchableOpacity
											key={index}
											style={[styles.dayContainer, isToday && styles.currentDay, hasStudied && styles.studyDay]}
										>
											<Text style={[styles.dayName, isToday && styles.currentDayText]}>{day}</Text>
											<Text style={[styles.dayNumber, isToday && styles.currentDayText]}>{dates[index]}</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

						{/* Log Study Session Button */}
						<View style={styles.actionContainer}>
							<TouchableOpacity style={styles.logSessionButton}>
								<Text style={styles.logSessionText}>Log Study Session</Text>
							</TouchableOpacity>
						</View>

						{/* Today's Sessions (if any) */}
						<View style={styles.sessionsContainer}>
							<Text style={styles.sessionsTitle}>Today's Sessions</Text>
							<Text style={styles.noSessionsText}>No sessions logged yet</Text>
						</View>
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
	scrollContent: {
		flex: 1,
	},

	// Calendar
	calendarContainer: {
		backgroundColor: colors.grayLightest,
		borderRadius: borderRadius.md,
		padding: spacing.lg,
		marginBottom: spacing.lg,
	},
	calendarHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.lg,
	},
	navigationButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.white,
		alignItems: "center",
		justifyContent: "center",
	},
	navigationText: {
		fontSize: 18,
		color: colors.grayMedium,
		fontWeight: "600",
	},
	monthText: {
		fontSize: 18,
		fontWeight: "600",
		color: colors.grayDarkest,
	},
	weekContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dayContainer: {
		alignItems: "center",
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.xs,
		borderRadius: borderRadius.sm,
		minWidth: 36,
	},
	currentDay: {
		backgroundColor: colors.gray200,
	},
	studyDay: {
		backgroundColor: colors.primaryOrange,
	},
	dayName: {
		fontSize: 12,
		color: colors.grayMedium,
		marginBottom: 4,
		fontWeight: "500",
	},
	dayNumber: {
		fontSize: 16,
		color: colors.grayDarkest,
		fontWeight: "600",
	},
	currentDayText: {
		color: colors.grayDarkest,
	},

	// Action Button
	actionContainer: {
		marginBottom: spacing.lg,
	},
	logSessionButton: {
		...globalStyles.buttonPrimary,
		paddingVertical: 16,
		borderRadius: 5,
		elevation: 8,
	},
	logSessionText: {
		...globalStyles.buttonPrimaryText,
		fontSize: 16,
	},

	// Sessions
	sessionsContainer: {
		marginBottom: spacing.lg,
	},
	sessionsTitle: {
		...globalStyles.headingSmall,
		marginBottom: spacing.sm,
	},
	noSessionsText: {
		...globalStyles.bodyMedium,
		color: colors.grayMedium,
		fontStyle: "italic",
	},
});
