// components/icons/LibraryIcon.tsx
import React from "react";
import Svg, { Path } from "react-native-svg";

interface LibraryIconProps {
	width?: number;
	height?: number;
	color?: string;
}

export default function LibraryIcon({ width = 25, height = 24, color = "#4C4949" }: LibraryIconProps) {
	return (
		<Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
			<Path
				d="M12.5 7C12.5 5.93913 12.0611 4.92172 11.2797 4.17157C10.4983 3.42143 9.43844 3 8.33337 3H2.08337V18H9.37504C10.2038 18 10.9987 18.3161 11.5847 18.8787C12.1708 19.4413 12.5 20.2044 12.5 21M12.5 7V21M12.5 7C12.5 5.93913 12.939 4.92172 13.7204 4.17157C14.5018 3.42143 15.5616 3 16.6667 3H22.9167V18H15.625C14.7962 18 14.0014 18.3161 13.4153 18.8787C12.8293 19.4413 12.5 20.2044 12.5 21"
				stroke={color}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	);
}
