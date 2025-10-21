// components/forms/FormHeader.tsx
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { spacing } from "@theme/spacing";

interface FormHeaderProps {
	title: string;
	onBack: () => void;
	backButtonText?: string;
}

export default function FormHeader({ title, onBack, backButtonText = "←" }: FormHeaderProps) {
	const handleBack = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onBack();
	};

	return (
		<View style={styles.header}>
			<TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
				<Text style={styles.backButtonText}>{backButtonText}</Text>
			</TouchableOpacity>
			<Text style={styles.title}>{title}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: spacing.lg,
		paddingTop: spacing.sm,
		paddingBottom: spacing.sm,
		paddingLeft: spacing.sm,
		// No border
	},
	backButton: {
		width: 40,
		height: 40,
		justifyContent: "center",
		alignItems: "center",
		marginRight: spacing.sm,
	},
	backButtonText: {
		fontSize: 28,
		color: "#111827",
	},
	title: {
		fontSize: 18, // Slightly bigger body font
		fontWeight: "500", // Medium bold
		color: "#111827",
		flex: 1,
	},
});
