// components/forms/SubcategorySelector.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
		marginBottom: 24,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 8,
	},
	required: {
		color: "#DC581F",
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
		backgroundColor: "#F3F4F6",
		borderWidth: 2,
		borderColor: "transparent",
	},
	chipSelected: {
		backgroundColor: "#FEF3F2",
		borderColor: "#DC581F",
	},
	chipText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#6B7280",
	},
	chipTextSelected: {
		color: "#DC581F",
		fontWeight: "600",
	},
});
