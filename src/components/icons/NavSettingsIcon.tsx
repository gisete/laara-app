// components/icons/SettingsIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface SettingsIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function SettingsIcon({ width = 25, height = 24, color = "#4C4949" }: SettingsIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
			<Path
				d="M20.8333 21V19C20.8333 17.9391 20.3943 16.9217 19.6129 16.1716C18.8315 15.4214 17.7717 15 16.6666 15H8.33329C7.22822 15 6.16842 15.4214 5.38701 16.1716C4.60561 16.9217 4.16663 17.9391 4.16663 19V21M16.6666 7C16.6666 9.20914 14.8011 11 12.5 11C10.1988 11 8.33329 9.20914 8.33329 7C8.33329 4.79086 10.1988 3 12.5 3C14.8011 3 16.6666 4.79086 16.6666 7Z"
				stroke={color}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
