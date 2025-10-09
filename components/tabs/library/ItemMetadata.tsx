// components/tabs/library/ItemMetadata.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import CalendarIcon from "../../icons/small/CalendarIcon";
import ClockIcon from "../../icons/small/ClockIcon";
import MovieIcon from "../../icons/small/MovieIcon";
import PageIcon from "../../icons/small/PageIcon";
import TargetIcon from "../../icons/small/TargetIcon";

interface ItemMetadataProps {
	type: string;
	totalUnits?: number | null;
}

// Helper function to get the appropriate icon component
const getMetadataIcon = (type: string) => {
	const iconColor = "#9CA3AF";
	const iconSize = 14;

	switch (type) {
		case "book":
			return <PageIcon width={iconSize} height={iconSize} color={iconColor} />;
		case "audio":
			return <ClockIcon width={iconSize} height={iconSize} color={iconColor} />;
		case "video":
			return <MovieIcon width={iconSize} height={iconSize} color={iconColor} />;
		case "class":
			return <CalendarIcon width={iconSize} height={iconSize} color={iconColor} />;
		case "app":
			return <TargetIcon width={iconSize} height={iconSize} color={iconColor} />;
		default:
			return null;
	}
};

// Helper function to get metadata text for each material type
const getMetadataText = (type: string, totalUnits?: number | null): string | null => {
	// Show unit count (if exists)
	if (!totalUnits || totalUnits <= 0) {
		return null;
	}

	switch (type) {
		case "book":
			return `${totalUnits} ${totalUnits === 1 ? "page" : "pages"}`;
		case "audio":
			return `${totalUnits} ${totalUnits === 1 ? "episode" : "episodes"}`;
		case "video":
			return `${totalUnits} ${totalUnits === 1 ? "video" : "videos"}`;
		case "class":
			return `${totalUnits} ${totalUnits === 1 ? "week" : "weeks"}`;
		case "app":
			return `${totalUnits} ${totalUnits === 1 ? "level" : "levels"}`;
		default:
			return null;
	}
};

export default function ItemMetadata({ type, totalUnits }: ItemMetadataProps) {
	const metadataText = getMetadataText(type, totalUnits);
	const icon = getMetadataIcon(type);

	// Don't render anything if no metadata
	if (!metadataText || !icon) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.metadataRow}>
				{icon}
				<Text style={styles.metadataText}>{metadataText}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 12,
	},
	metadataRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	metadataText: {
		fontSize: 13,
		color: "#9CA3AF",
		marginLeft: 6,
	},
});
