// components/library/ProgressBar.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";

interface ProgressBarProps {
	current: number;
	total: number;
	unitLabel: string;
	percentage: number;
	color?: string;
}

export default function ProgressBar({ current, total, unitLabel, percentage, color }: ProgressBarProps) {
	const fillColor = color ?? colors.grayMedium;
	const clampedPct = Math.min(Math.max(percentage, 0), 100);
	const remaining = total - current;

	return (
		<View style={styles.container}>
			{total > 0 && (
				<View style={styles.labelsRow}>
					<Text style={styles.progressText}>
						{remaining} {unitLabel} left
					</Text>
					<Text style={styles.percentText}>{Math.round(clampedPct)}%</Text>
				</View>
			)}
			<View style={styles.track}>
				<View style={[styles.fill, { width: `${total > 0 ? clampedPct : 0}%`, backgroundColor: fillColor }]} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: spacing.sm,
		paddingTop: spacing.xs,
		paddingBottom: spacing.sm,
	},
	labelsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: 4,
	},
	progressText: {
		fontSize: 12,
		color: colors.grayMedium,
	},
	percentText: {
		fontSize: 12,
		color: colors.grayMedium,
	},
	track: {
		height: 7,
		backgroundColor: colors.grayLight,
		overflow: "hidden",
	},
	fill: {
		height: "100%",
	},
});
