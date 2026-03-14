// src/components/ui/ScreenHeader.tsx
import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";

interface Props {
	title: string;
	rightElement?: ReactNode;
}

export default function ScreenHeader({ title, rightElement }: Props) {
	return (
		<View style={styles.container}>
			<Text style={styles.title} numberOfLines={1}>
				{title}
			</Text>
			<View style={styles.rightSlot}>{rightElement ?? null}</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: spacing.lg,
		paddingBottom: spacing.md,
	},
	title: {
		flex: 1,
		fontFamily: "Domine-Bold",
		fontSize: 32,
		color: colors.grayDarkest,
	},
	// Fixed-width slot keeps title left-aligned whether or not a right element is present.
	// Width matches the add button (48px) — the largest expected right element.
	rightSlot: {
		width: 48,
		alignItems: "flex-end",
	},
});
