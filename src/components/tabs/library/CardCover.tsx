// components/tabs/library/CardCover.tsx
import React from "react";
import { MaterialIcon } from "@components/shared/MaterialIcon";

interface CardCoverProps {
	type: string;
	size?: number;
}

export default function CardCover({ type, size }: CardCoverProps) {
	return <MaterialIcon type={type} size={size} />;
}
