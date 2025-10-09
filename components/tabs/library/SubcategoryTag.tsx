// components/tabs/library/SubcategoryTag.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";

interface SubcategoryTagProps {
	label: string | null | undefined;
}

export default function SubcategoryTag({ label }: SubcategoryTagProps) {
	if (!label) {
		return null;
	}

	return (
		<View style={styles.badge}>
			<Text style={styles.badgeText}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		backgroundColor: colors.grayLight,
		paddingHorizontal: 6,
		paddingVertical: 4,
		borderRadius: 5,
		alignSelf: "flex-start",
		marginBottom: 8,
	},
	badgeText: {
		fontSize: 14,
		fontWeight: "400",
		color: colors.gray600,
		textTransform: "capitalize",
	},
});
