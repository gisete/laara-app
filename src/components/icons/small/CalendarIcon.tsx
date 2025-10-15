import React from "react";
import Svg, { Path } from "react-native-svg";

interface CalendarIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function CalendarIcon({ width = 16, height = 16, color = "#9CA3AF" }: CalendarIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
			<Path
				d="M16 2V6M8 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
