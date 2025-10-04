// components/library/ProgressBar.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressBarProps {
	current: number;
	total: number;
	unitLabel: string;
	percentage: number;
}

export default function ProgressBar({ current, total, unitLabel, percentage }: ProgressBarProps) {
	const remaining = total - current;

	return (
		<View style={styles.container}>
			<Text style={styles.progressText}>
				{remaining} {unitLabel} left
			</Text>
			<View style={styles.progressBar}>
				<View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 8,
	},
	progressText: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: 6,
	},
	progressBar: {
		height: 6,
		backgroundColor: "#E5E7EB",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#D6CCC2",
		borderRadius: 3,
	},
});
