// components/icons/SearchIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface SearchIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function SearchIcon({ width = 19, height = 19, color = "#BEBBBA" }: SearchIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 19 19" fill="none">
			<Path
				d="M16.625 16.625L13.1812 13.1812M15.0417 8.70833C15.0417 12.2061 12.2061 15.0417 8.70833 15.0417C5.21053 15.0417 2.375 12.2061 2.375 8.70833C2.375 5.21053 5.21053 2.375 8.70833 2.375C12.2061 2.375 15.0417 5.21053 15.0417 8.70833Z"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
