// components/library/CategoryBadge.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface CategoryBadgeProps {
	type: string;
}

export default function CategoryBadge({ type }: CategoryBadgeProps) {
	return (
		<View style={styles.badge}>
			<Text style={styles.badgeText}>{type}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		backgroundColor: "#F3F4F6",
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: "500",
		color: "#6B7280",
		textTransform: "capitalize",
	},
});
