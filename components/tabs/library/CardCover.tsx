// components/tabs/library/CardCover.tsx - NEW COMPONENT
import React from "react";
import { StyleSheet, View } from "react-native";
import BookIcon from "../../icons/BookIcon";
import AudioIcon from "../../icons/AudioIcon";
import VideoIcon from "../../icons/VideoIcon";
import ClassIcon from "../../icons/ClassIcon";
import AppIcon from "../../icons/AppIcon";
import { colors } from "../../../theme/colors";

interface CardCoverProps {
	type: string;
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

export default function CardCover({ type }: CardCoverProps) {
	const categoryStyle = getCategoryStyle(type);

	// Render the appropriate icon based on material type
	const renderIcon = () => {
		const iconProps = {
			width: 65,
			height: 65,
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

	return <View style={[styles.container, { backgroundColor: categoryStyle.bg }]}>{renderIcon()}</View>;
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
