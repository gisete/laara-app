// components/navigation/TabIcon.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@theme/colors";

import LibraryIcon from "@components/icons/NavLibraryIcon";
import ReportsIcon from "@components/icons/NavReportsIcon";
import SettingsIcon from "@components/icons/NavSettingsIcon";
import StudyIcon from "@components/icons/NavStudyIcon";

interface TabIconProps {
	focused: boolean;
	iconName: "study" | "library" | "reports" | "settings";
}

export default function TabIcon({ focused, iconName }: TabIconProps) {
	const iconColor = focused ? colors.primaryAccent : "#9CA3AF";
	const iconSize = 24;

	const renderIcon = () => {
		switch (iconName) {
			case "study":
				return <StudyIcon width={iconSize} height={iconSize} color={iconColor} />;

			case "library":
				return <LibraryIcon width={iconSize} height={iconSize} color={iconColor} />;

			case "reports":
				return <ReportsIcon width={iconSize} height={iconSize} color={iconColor} />;

			case "settings":
				return <SettingsIcon width={iconSize} height={iconSize} color={iconColor} />;

			default:
				return <View style={[styles.iconPlaceholder, { backgroundColor: iconColor }]} />;
		}
	};

	return <View style={styles.container}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		width: 28,
		height: 28,
	},
	iconPlaceholder: {
		width: 20,
		height: 20,
		borderRadius: 3,
	},
});
