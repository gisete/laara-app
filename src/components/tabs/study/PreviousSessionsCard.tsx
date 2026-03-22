import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MaterialIcon } from "@components/shared/MaterialIcon";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";
import { fonts } from "@theme/typography";
import { formatDateToYYYYMMDD, getRelativeTime } from "@utils/dateHelper";

export interface SessionRow {
	key: string;
	materialName: string;
	materialType: string;
	sessionDate: string;
	durationMinutes: number;
}

interface PreviousSessionsCardProps {
	sessionRows: SessionRow[];
}

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

export default function PreviousSessionsCard({ sessionRows }: PreviousSessionsCardProps) {
	const displayedRows = sessionRows.slice(0, 3);

	return (
		<View style={styles.sessionsCard}>
			<View style={styles.sessionsCardHeader}>
				<Text style={styles.sessionsCardTitle}>Previous sessions</Text>
				{sessionRows.length > 0 && (
					<TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/history")}>
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
						<MaterialIcon type={row.materialType} />
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
	);
}

const styles = StyleSheet.create({
	sessionsCard: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
	},
	sessionsCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacing.md,
	},
	sessionsCardTitle: { ...typography.headingSmall, color: colors.grayDarkest },
	seeAllText: { fontSize: 14, fontWeight: "600", color: colors.textLink },
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
		gap: spacing.sm,
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
