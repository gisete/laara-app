// components/study/RecentMaterials.tsx
import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";
import * as Haptics from "expo-haptics";
import { getRelativeTime } from "@utils/dateHelper";
import Svg, { Path, Circle, Rect } from "react-native-svg";

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

// Icon Components
const BookIcon = ({ size = 24, color = colors.grayDark }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Path
			d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<Path
			d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
);

const AudioIcon = ({ size = 24, color = colors.grayDark }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
		<Path
			d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
			stroke={color}
			strokeWidth="2"
		/>
		<Path d="M12 5V9" stroke={color} strokeWidth="2" strokeLinecap="round" />
	</Svg>
);

const PodcastIcon = ({ size = 24, color = colors.grayDark }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Circle cx="12" cy="8" r="2" stroke={color} strokeWidth="2" />
		<Path
			d="M12 10V14M12 14C10.8954 14 10 14.8954 10 16V19C10 20.1046 10.8954 21 12 21C13.1046 21 14 20.1046 14 19V16C14 14.8954 13.1046 14 12 14Z"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<Path
			d="M9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<Path
			d="M6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</Svg>
);

const VideoIcon = ({ size = 24, color = colors.grayDark }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Rect x="2" y="5" width="20" height="14" rx="2" stroke={color} strokeWidth="2" />
		<Path d="M10 9L15 12L10 15V9Z" fill={color} />
	</Svg>
);

const ClassIcon = ({ size = 24, color = colors.grayDark }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
		<Path d="M16 2V6M8 2V6M3 10H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
	</Svg>
);

const AppIcon = ({ size = 24, color = colors.grayDark }) => (
	<Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
		<Rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
		<Rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
		<Rect x="13" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
	</Svg>
);

const ICON_BG: Record<string, string> = {
	book: colors.categoryBook,
	audio: colors.categoryAudio,
	video: colors.categoryVideo,
	class: colors.categoryClass,
	app: colors.categoryApp,
};

// Get the appropriate icon based on material type and subtype
const MaterialIcon = ({ type, subtype }: { type: string; subtype?: string }) => {
	const iconSize = 32;
	const iconColor = colors.grayDark;

	if (type === "book") return <BookIcon size={iconSize} color={iconColor} />;
	if (type === "audio") {
		if (subtype === "podcast") return <PodcastIcon size={iconSize} color={iconColor} />;
		return <AudioIcon size={iconSize} color={iconColor} />;
	}
	if (type === "video") return <VideoIcon size={iconSize} color={iconColor} />;
	if (type === "class") return <ClassIcon size={iconSize} color={iconColor} />;
	if (type === "app") return <AppIcon size={iconSize} color={iconColor} />;
	return <BookIcon size={iconSize} color={iconColor} />;
};

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
					<View style={[styles.iconContainer, { backgroundColor: ICON_BG[material.type] || colors.categoryBook }]}>
						<MaterialIcon type={material.type} subtype={material.subtype} />
					</View>

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
		color: colors.grayDarkest,
		marginBottom: spacing.md,
	},
	materialCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.white,
		padding: spacing.md,
		borderRadius: borderRadius.sm,
		marginBottom: spacing.sm,
		borderWidth: 1,
		borderColor: colors.gray200,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: borderRadius.sm,
		alignItems: "center",
		justifyContent: "center",
		marginRight: spacing.md,
	},
	contentContainer: {
		flex: 1,
		justifyContent: "center",
	},
	materialName: {
		...typography.bodyLarge,
		color: colors.grayDarkest,
		fontWeight: "500",
		marginBottom: 4,
	},
	sessionInfo: {
		fontSize: 13,
		color: colors.grayMedium,
	},
	continueButton: {
		paddingHorizontal: spacing.sm,
		paddingVertical: spacing.xs,
	},
	continueText: {
		...typography.button,
		fontSize: 14,
		color: colors.primaryAccent,
		fontWeight: "600",
	},
});
