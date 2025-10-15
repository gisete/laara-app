// components/icons/metadata/ClockIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface ClockIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function ClockIcon({ width = 16, height = 16, color = "#9CA3AF" }: ClockIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
			<Path
				d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
