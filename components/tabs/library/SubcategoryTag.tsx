// components/library/SubcategoryTag.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";

interface SubcategoryTagProps {
	type: string;
}

const getCategoryColor = (type: string): string => {
	switch (type.toLowerCase()) {
		case "book":
			return colors.categoryBook;
		case "audio":
			return colors.categoryAudio;
		case "app":
			return colors.categoryApp;
		case "class":
			return colors.categoryClass;
		case "video":
			return colors.categoryVideo;
		default:
			return colors.gray200;
	}
};

export default function SubcategoryTag({ type }: SubcategoryTagProps) {
	const backgroundColor = getCategoryColor(type);

	return (
		<View style={[styles.badge, { backgroundColor }]}>
			<Text style={styles.badgeText}>{type}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: "500",
		color: colors.grayDarkest,
		textTransform: "capitalize",
	},
});
