// components/library/FilterChip.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface FilterChipProps {
	label: string;
	isSelected: boolean;
	onPress: () => void;
}

export default function FilterChip({ label, isSelected, onPress }: FilterChipProps) {
	const handlePress = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onPress();
	};

	return (
		<TouchableOpacity
			style={[styles.chip, isSelected && styles.chipSelected]}
			onPress={handlePress}
			activeOpacity={0.7}
		>
			<Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{label}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	chip: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#9CA3AF",
		backgroundColor: "transparent",
	},
	chipSelected: {
		backgroundColor: "#111827",
		borderColor: "#111827",
	},
	chipText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#374151",
	},
	chipTextSelected: {
		color: "#FFFFFF",
		fontWeight: "600",
	},
});
