// components/icons/StudyIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface StudyIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function StudyIcon({ width = 25, height = 24, color = "#4C4949" }: StudyIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
			<Path
				d="M9.375 22V12H15.625V22M3.125 9L12.5 2L21.875 9V20C21.875 20.5304 21.6555 21.0391 21.2648 21.4142C20.8741 21.7893 20.3442 22 19.7917 22H5.20833C4.6558 22 4.12589 21.7893 3.73519 21.4142C3.34449 21.0391 3.125 20.5304 3.125 20V9Z"
				stroke={color}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
