// components/forms/SubcategorySelector.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@theme/colors";

interface SubcategorySelectorProps {
	categories: string[];
	selectedCategory: string | null;
	onSelectCategory: (category: string) => void;
	label?: string;
	required?: boolean;
}

export default function SubcategorySelector({
	categories,
	selectedCategory,
	onSelectCategory,
	label = "Category",
	required = false,
}: SubcategorySelectorProps) {
	const handleSelect = (category: string) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onSelectCategory(category);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.label}>
				{label} {required && <Text style={styles.required}>*</Text>}
			</Text>
			<View style={styles.grid}>
				{categories.map((category) => (
					<TouchableOpacity
						key={category}
						style={[styles.chip, selectedCategory === category && styles.chipSelected]}
						onPress={() => handleSelect(category)}
						activeOpacity={0.7}
					>
						<Text style={[styles.chipText, selectedCategory === category && styles.chipTextSelected]}>{category}</Text>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 18,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 8,
	},
	required: {
		color: colors.primaryAccent,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	chip: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: "#F4EFEA",
		borderWidth: 1,
		borderColor: "transparent",
	},
	chipSelected: {
		backgroundColor: "#E1DBD4",
		borderColor: "#595350",
	},
	chipText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#6B7280",
	},
	chipTextSelected: {
		color: "#595350",
		fontWeight: "500",
	},
});
