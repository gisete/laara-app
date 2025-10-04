// app/(tabs)/index.tsx - Study screen with new add-item route
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllMaterials } from "../../database/queries";

// Import components
import EmptyState from "../../components/EmptyState";
import TopBar from "../../components/ui/TopBar";

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
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
	container: {
		flex: 1,
		backgroundColor: "#FAF9F6",
	},
	content: {
		flex: 1,
		paddingHorizontal: 32,
	},
	scrollContent: {
		flex: 1,
	},

	// Calendar
	calendarContainer: {
		backgroundColor: "#F9FAFB",
		borderRadius: 12,
		padding: 20,
		marginBottom: 30,
	},
	calendarHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
	},
	navigationButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
	},
	navigationText: {
		fontSize: 18,
		color: "#6B7280",
		fontWeight: "600",
	},
	monthText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
	},
	weekContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dayContainer: {
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderRadius: 8,
		minWidth: 36,
	},
	currentDay: {
		backgroundColor: "#E5E7EB",
	},
	studyDay: {
		backgroundColor: "#DC581F",
	},
	dayName: {
		fontSize: 12,
		color: "#6B7280",
		marginBottom: 4,
		fontWeight: "500",
	},
	dayNumber: {
		fontSize: 16,
		color: "#111827",
		fontWeight: "600",
	},
	currentDayText: {
		color: "#111827",
	},

	// Action Button
	actionContainer: {
		marginBottom: 30,
	},
	logSessionButton: {
		backgroundColor: "#DC581F",
		paddingVertical: 16,
		borderRadius: 5,
		alignItems: "center",
		elevation: 8,
	},
	logSessionText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},

	// Sessions
	sessionsContainer: {
		marginBottom: 30,
	},
	sessionsTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 12,
	},
	noSessionsText: {
		fontSize: 14,
		color: "#9CA3AF",
		fontStyle: "italic",
	},
});
