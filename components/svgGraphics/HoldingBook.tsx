import React from "react";
import { View } from "react-native";
import Svg, { Path, G, Ellipse } from "react-native-svg";

interface HoldingBookProps {
	width?: number;
	height?: number;
}

const HoldingBook: React.FC<HoldingBookProps> = ({ width = 200, height = 255 }) => {
	return (
		<View style={{ width, height }}>
			<Svg width={width} height={height} viewBox="0 0 400 500">
				{/* Hair - black */}
				<Path
					d="M 120,80 C 100,85 90,100 85,120 C 80,140 82,160 90,175 C 95,185 105,195 115,200 L 130,210 C 135,215 140,225 145,240 L 150,200 C 150,170 155,140 170,120 C 180,105 195,95 215,92 C 240,88 265,95 280,110 C 290,120 295,135 298,150 C 300,165 298,180 295,195 L 300,250 L 305,210 C 310,185 320,165 330,155 C 335,145 335,130 332,115 C 328,95 318,78 302,66 C 280,48 252,40 225,42 C 195,44 168,58 148,78 C 135,92 125,108 120,125 Z"
					fill="black"
				/>

				{/* Face and body - white with black stroke */}
				<Path
					d="M 200,90 C 230,90 255,115 255,145 C 255,175 230,200 200,200 C 170,200 145,175 145,145 C 145,115 170,90 200,90 Z"
					fill="white"
					stroke="black"
					strokeWidth="3"
				/>

				{/* Body/torso */}
				<Path
					d="M 120,210 L 120,380 C 120,420 150,450 200,450 C 250,450 280,420 280,380 L 280,210 C 280,210 240,200 200,200 C 160,200 120,210 120,210 Z"
					fill="white"
					stroke="black"
					strokeWidth="3"
				/>

				{/* Arms */}
				<Path
					d="M 120,230 C 100,240 85,260 85,285 L 85,330 C 85,335 88,340 93,342"
					fill="none"
					stroke="black"
					strokeWidth="3"
				/>
				<Path
					d="M 280,230 C 300,240 315,260 315,285 L 315,330 C 315,335 312,340 307,342"
					fill="none"
					stroke="black"
					strokeWidth="3"
				/>

				{/* Book - orange */}
				<G transform="translate(140, 280) rotate(-20 80 60)">
					<Path
						d="M 10,20 L 150,20 L 155,25 L 155,120 L 150,125 L 10,125 L 5,120 L 5,25 Z"
						fill="#DA5711"
						stroke="black"
						strokeWidth="3"
					/>
					{/* Book spine */}
					<Path d="M 80,20 L 82,23 L 82,122 L 80,125" stroke="black" strokeWidth="2" fill="none" />
					{/* Book pages effect */}
					<Path d="M 75,25 L 75,120" stroke="white" strokeWidth="1" opacity="0.3" />
				</G>

				{/* Hands on book */}
				<Ellipse cx="160" cy="340" rx="18" ry="25" fill="white" stroke="black" strokeWidth="2" />
				<Ellipse cx="240" cy="360" rx="18" ry="25" fill="white" stroke="black" strokeWidth="2" />

				{/* Left eye */}
				<Path
					d="M 175,140 C 175,135 180,132 185,132 C 190,132 195,135 195,140"
					fill="none"
					stroke="black"
					strokeWidth="3"
					strokeLinecap="round"
				/>

				{/* Right eye */}
				<Path
					d="M 205,140 C 205,135 210,132 215,132 C 220,132 225,135 225,140"
					fill="none"
					stroke="black"
					strokeWidth="3"
					strokeLinecap="round"
				/>

				{/* Nose */}
				<Path
					d="M 200,150 C 202,160 201,170 200,175"
					fill="none"
					stroke="black"
					strokeWidth="3"
					strokeLinecap="round"
				/>

				{/* Smile */}
				<Path
					d="M 180,165 C 190,172 210,172 220,165"
					fill="none"
					stroke="black"
					strokeWidth="3"
					strokeLinecap="round"
				/>
			</Svg>
		</View>
	);
};

export default HoldingBook;
