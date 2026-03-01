// components/tabs/library/CardCover.tsx - NEW COMPONENT
import React from "react";
import { StyleSheet, View } from "react-native";
import BookIcon from "@components/icons/BookIcon";
import AudioIcon from "@components/icons/AudioIcon";
import VideoIcon from "@components/icons/VideoIcon";
import ClassIcon from "@components/icons/ClassIcon";
import AppIcon from "@components/icons/AppIcon";
import { colors } from "@theme/colors";

interface CardCoverProps {
	type: string;
	size?: number;
}

// Helper to get category colors from theme
const getCategoryStyle = (type: string) => {
	const styles = {
		book: { bg: colors.categoryBook, icon: colors.categoryBookIcon },
		audio: { bg: colors.categoryAudio, icon: colors.categoryAudioIcon },
		video: { bg: colors.categoryVideo, icon: colors.categoryVideoIcon },
		class: { bg: colors.categoryClass, icon: colors.categoryClassIcon },
		app: { bg: colors.categoryApp, icon: colors.categoryAppIcon },
	};
	return styles[type] || styles.book;
};

export default function CardCover({ type, size }: CardCoverProps) {
	const categoryStyle = getCategoryStyle(type);
	const containerSize = size ?? 70;
	const iconSize = Math.round(containerSize * (65 / 70));

	// Render the appropriate icon based on material type
	const renderIcon = () => {
		const iconProps = {
			width: iconSize,
			height: iconSize,
			fill: categoryStyle.icon,
			backgroundColor: categoryStyle.bg,
		};

		switch (type) {
			case "book":
				return <BookIcon {...iconProps} />;
			case "audio":
				return <AudioIcon {...iconProps} />;
			case "video":
				return <VideoIcon {...iconProps} />;
			case "class":
				return <ClassIcon {...iconProps} />;
			case "app":
				return <AppIcon {...iconProps} />;
			default:
				return <BookIcon {...iconProps} />;
		}
	};

	const sizeOverride =
		size !== undefined
			? { width: containerSize, height: containerSize, borderRadius: Math.round(containerSize / 6) }
			: undefined;

	return <View style={[styles.container, sizeOverride, { backgroundColor: categoryStyle.bg }]}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
	container: {
		width: 70,
		height: 70,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
});
