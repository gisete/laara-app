import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { fonts } from "@theme/typography";

interface DashboardHeaderProps {
	greeting: string;
	flag: string;
	streakCount: number;
	onFlagPress: () => void;
}

export default function DashboardHeader({ greeting, flag, streakCount, onFlagPress }: DashboardHeaderProps) {
	return (
		<View style={styles.header}>
			<View style={styles.greetingRow}>
				<Text style={styles.greeting}>{greeting}</Text>
				<TouchableOpacity
					style={styles.flagTappable}
					onPress={() => {
						Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
						onFlagPress();
					}}
					activeOpacity={0.7}
				>
					<Text style={styles.flagEmoji}>{flag}</Text>
					<Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
						<Path
							d="M6 9L12 15L18 9"
							stroke={colors.textSecondary}
							strokeWidth={2.5}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</Svg>
				</TouchableOpacity>
			</View>
			<View style={styles.statusPill}>
				<Text style={styles.streakText}>
					🔥 {streakCount} {streakCount === 1 ? "DAY" : "DAYS"}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
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
		color: colors.textPrimary,
	},
	flagTappable: {
		flexDirection: "row",
		alignItems: "center",
		gap: 2,
	},
	flagEmoji: { fontSize: 24 },
	statusPill: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.surfaceDefault,
		paddingVertical: 6,
		paddingHorizontal: spacing.sm,
		borderRadius: borderRadius.pill,
	},
	streakText: {
		fontSize: 11,
		fontWeight: "800",
		color: colors.textPrimary,
		letterSpacing: 0.5,
	},
});
