import { colors } from "@theme/colors";

export const MATERIAL_ACCENT: Record<string, string> = {
	book: colors.materialBookAccent,
	audio: colors.materialAudioAccent,
	video: colors.materialVideoAccent,
	class: colors.materialClassAccent,
	app: colors.materialAppAccent,
};

export function getMaterialAccent(type: string): string {
	return MATERIAL_ACCENT[type] ?? colors.primaryAccentLight;
}
