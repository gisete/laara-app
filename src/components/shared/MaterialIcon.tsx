import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { colors } from "@theme/colors";
import { borderRadius } from "@theme/spacing";

const ICON_BACKGROUNDS: Record<string, string> = {
	book: colors.materialBookAccent,
	audio: colors.materialAudioAccent,
	video: colors.materialVideoAccent,
	class: colors.materialClassAccent,
	app: colors.materialAppAccent,
};

const ICON_SOURCES: Record<string, ReturnType<typeof require>> = {
	book: require("@assets/images/icons/study-read.png"),
	audio: require("@assets/images/icons/study-audio.png"),
	video: require("@assets/images/icons/study-video.png"),
	class: require("@assets/images/icons/study-class.png"),
	app: require("@assets/images/icons/study-app.png"),
};

interface MaterialIconProps {
	type: string;
	size?: number; // container size, default 48
}

export function MaterialIcon({ type, size = 48 }: MaterialIconProps) {
	const imageSize = Math.round(size * 0.65);
	const source = ICON_SOURCES[type] ?? ICON_SOURCES["book"];

	return (
		<View
			style={[
				styles.container,
				{
					width: size,
					height: size,
					borderRadius: borderRadius.md,
					backgroundColor: ICON_BACKGROUNDS[type] ?? colors.materialBookAccent,
				},
			]}
		>
			<Image source={source} style={{ width: imageSize, height: imageSize }} resizeMode="contain" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
	},
});
