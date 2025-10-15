// components/icons/ReportsIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface ReportsIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function ReportsIcon({ width = 25, height = 24, color = "#4C4949" }: ReportsIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
			<Path
				d="M14.5833 2H6.24996C5.69743 2 5.16752 2.21071 4.77682 2.58579C4.38612 2.96086 4.16663 3.46957 4.16663 4V20C4.16663 20.5304 4.38612 21.0391 4.77682 21.4142C5.16752 21.7893 5.69743 22 6.24996 22H18.75C19.3025 22 19.8324 21.7893 20.2231 21.4142C20.6138 21.0391 20.8333 20.5304 20.8333 20V8M14.5833 2L20.8333 8M14.5833 2V8H20.8333M16.6666 13H8.33329M16.6666 17H8.33329M10.4166 9H8.33329"
				stroke={color}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
