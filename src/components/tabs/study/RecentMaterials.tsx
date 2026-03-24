// components/study/RecentMaterials.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "@theme/colors";
import { spacing } from "@theme/spacing";
import { typography } from "@theme/typography";
import * as Haptics from "expo-haptics";
import { getRelativeTime } from "@utils/dateHelper";
import { MaterialIcon } from "@components/shared/MaterialIcon";

interface Material {
	id: number;
	name: string;
	type: string;
	subtype?: string;
	last_session: string; // ISO timestamp
	units_studied?: number;
	duration_minutes?: number;
}

interface RecentMaterialsProps {
	materials: Material[];
	onContinue: (materialId: number) => void;
}

export default function RecentMaterials({ materials, onContinue }: RecentMaterialsProps) {
	const formatSessionInfo = (material: Material): string => {
		if (material.units_studied && material.units_studied > 0) {
			const unit = material.units_studied === 1 ? "chapter" : "chapters";
			return `${material.units_studied} ${unit}`;
		} else if (material.duration_minutes && material.duration_minutes > 0) {
			const hours = Math.floor(material.duration_minutes / 60);
			const minutes = material.duration_minutes % 60;

			if (hours > 0 && minutes > 0) {
				return `${hours}h ${minutes}m`;
			} else if (hours > 0) {
				return `${hours} ${hours === 1 ? "hour" : "hours"}`;
			} else {
				return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
			}
		}
		return "Study session";
	};

	const handleContinue = (materialId: number) => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		onContinue(materialId);
	};

	if (materials.length === 0) {
		return null;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Recent Materials</Text>
			{materials.map((material) => (
				<View key={material.id} style={styles.materialCard}>
					<MaterialIcon type={material.type} size={56} />

					<View style={styles.contentContainer}>
						<Text style={styles.materialName} numberOfLines={1}>
							{material.name}
						</Text>
						<Text style={styles.sessionInfo} numberOfLines={1}>
							{getRelativeTime(material.last_session)} • {formatSessionInfo(material)}
						</Text>
					</View>

					<TouchableOpacity
						style={styles.continueButton}
						onPress={() => handleContinue(material.id)}
						activeOpacity={0.7}
					>
						<Text style={styles.continueText}>CONTINUE</Text>
					</TouchableOpacity>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: spacing.xl,
	},
	header: {
		...typography.headingSmall,
		color: colors.textPrimary,
		marginBottom: spacing.md,
	},
	materialCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		backgroundColor: colors.surfaceDefault,
		padding: spacing.md,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.sm,
		borderWidth: 1,
		borderColor: colors.borderDefault,
	},
	contentContainer: {
		flex: 1,
		justifyContent: "center",
	},
	materialName: {
		...typography.bodyLarge,
		color: colors.textPrimary,
		fontWeight: "500",
		marginBottom: 4,
	},
	sessionInfo: {
		fontSize: 13,
		color: colors.textSecondary,
	},
	continueButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	continueText: {
		...typography.button,
		fontSize: 14,
		color: colors.textLink,
		fontWeight: "500",
	},
});
