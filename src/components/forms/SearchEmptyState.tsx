// components/forms/SearchEmptyState.tsx
import * as Haptics from "expo-haptics";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "@theme/colors";

import HoldingBook from "@components/svgGraphics/HoldingBook";

interface SearchEmptyStateProps {
	onManualAdd: () => void;
	helperText?: string;
	buttonText?: string;
	illustration?: ImageSourcePropType;
}

export default function SearchEmptyState({
	onManualAdd,
	helperText = "If you're offline or can't find what you're\nlooking for you can enter it manually",
	buttonText = "Enter manually",
	illustration,
}: SearchEmptyStateProps) {
	const handleManualAdd = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		onManualAdd();
	};

	return (
		<View style={styles.container}>
			{/* Divider line */}
			<View style={styles.divider} />

			{/* Manual entry button */}
			<TouchableOpacity style={styles.manualButton} onPress={handleManualAdd} activeOpacity={0.8}>
				<Text style={styles.manualButtonIcon}>+</Text>
				<Text style={styles.manualButtonText}>{buttonText}</Text>
			</TouchableOpacity>

			{/* Helper text */}
			<Text style={styles.helperText}>{helperText}</Text>

			{/* Illustration */}
			{illustration && (
				<View style={styles.illustrationContainer}>
					<HoldingBook width="100%" height="100%" accentColor={colors.primaryAccent} />
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	divider: {
		height: 1,
		backgroundColor: "#E5E7EB",
		marginBottom: 24,
		marginTop: 8,
	},
	manualButton: {
		backgroundColor: colors.gray300,
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderRadius: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	manualButtonIcon: {
		fontSize: 20,
		color: colors.grayDarkest,
		marginRight: 8,
		fontWeight: "400",
	},
	manualButtonText: {
		color: colors.grayDarkest,
		fontSize: 16,
		fontWeight: "400",
	},
	helperText: {
		fontSize: 14,
		color: "#9CA3AF",
		textAlign: "center",
		lineHeight: 20,
		marginBottom: 40,
	},
	illustrationContainer: {
		alignItems: "center",
		marginTop: 20,
	},
	illustration: {
		width: 200,
		height: 200,
	},
});
