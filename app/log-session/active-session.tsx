// app/log-session/active-session.tsx
import React, { useEffect, useRef, useState } from "react";
import {
	Alert,
	Animated,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { globalStyles } from "@theme/styles";
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography, fonts } from "@theme/typography";
import { MaterialIcon } from "@components/shared/MaterialIcon";

const getMaterialTypeLabel = (type: string): string => {
	switch (type) {
		case "book":
			return "CURRENT READING";
		case "audio":
			return "CURRENT LISTENING";
		case "video":
			return "CURRENT WATCHING";
		case "class":
			return "CURRENT CLASS";
		case "app":
			return "CURRENT APP";
		default:
			return "CURRENT MATERIAL";
	}
};

export default function ActiveSessionScreen() {
	const { materialId, materialName, materialType, materialSubtype, date } =
		useLocalSearchParams<{
			materialId: string;
			materialName: string;
			materialType: string;
			materialSubtype: string;
			date: string;
		}>();

	// --- Timer refs ---
	// startTimeRef is the effective start: adjusted on resume so Date.now() - startTimeRef
	// always equals total elapsed (excluding paused time).
	const startTimeRef = useRef(Date.now());
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const isPausedRef = useRef(false);
	const elapsedAtPauseRef = useRef(0); // seconds elapsed when last paused

	// --- UI state (causes re-renders) ---
	const [elapsed, setElapsed] = useState(0); // seconds, display only
	const [isPaused, setIsPaused] = useState(false);

	// --- Glow animation ---
	const glowAnim = useRef(new Animated.Value(0)).current;
	const glowLoopRef = useRef<Animated.CompositeAnimation | null>(null);

	const startGlow = () => {
		glowLoopRef.current = Animated.loop(
			Animated.sequence([
				Animated.timing(glowAnim, {
					toValue: 1,
					duration: 2000,
					useNativeDriver: true,
				}),
				Animated.timing(glowAnim, {
					toValue: 0,
					duration: 2000,
					useNativeDriver: true,
				}),
			]),
		);
		glowLoopRef.current.start();
	};

	const stopGlow = () => {
		if (glowLoopRef.current) {
			glowLoopRef.current.stop();
		}
		glowAnim.setValue(0);
	};

	useEffect(() => {
		startGlow();
		return () => stopGlow();
	}, []);

	// --- Interval helpers ---
	const startInterval = () => {
		intervalRef.current = setInterval(() => {
			setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
		}, 1000);
	};

	const stopInterval = () => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	// --- Start timer on mount ---
	useEffect(() => {
		startTimeRef.current = Date.now();
		startInterval();
		return () => stopInterval();
	}, []);

	const formatElapsed = (seconds: number): string => {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		if (h > 0)
			return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
		return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	};

	const handlePauseResume = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		if (!isPausedRef.current) {
			// Pausing — snapshot elapsed, stop the interval
			elapsedAtPauseRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
			stopInterval();
			isPausedRef.current = true;
			setIsPaused(true);
			stopGlow();
		} else {
			// Resuming — shift startTime so the delta stays correct, restart interval
			startTimeRef.current = Date.now() - elapsedAtPauseRef.current * 1000;
			startInterval();
			isPausedRef.current = false;
			setIsPaused(false);
			startGlow();
		}
	};

	const handleEnd = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		const elapsedSeconds = Math.max(
			1,
			Math.floor((Date.now() - startTimeRef.current) / 1000),
		);
		router.replace({
			pathname: "/log-session/session-summary",
			params: {
				materialId,
				materialName,
				materialType,
				materialSubtype,
				date,
				elapsedSeconds: String(elapsedSeconds),
			},
		});
	};

	const handleDiscard = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		Alert.alert(
			"Discard this session?",
			"Are you sure you want to discard this session? Your time won't be saved.",
			[
				{ text: "Keep Going", style: "cancel" },
				{
					text: "Discard",
					style: "destructive",
					onPress: () => router.replace("/(tabs)"),
				},
			],
		);
	};

	const glowScale = glowAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [1.0, 1.15],
	});

	const glowOpacity = glowAnim.interpolate({
		inputRange: [0, 1],
		outputRange: [0.08, 0.15],
	});

	return (
		<SafeAreaView style={[globalStyles.container, styles.safeArea]}>
			<StatusBar barStyle="dark-content" backgroundColor={colors.gray50} />

			<View style={styles.content}>
				{/* Top left — circular discard button */}
				<View style={styles.header}>
					<TouchableOpacity
						onPress={handleDiscard}
						style={styles.discardButton}
						activeOpacity={0.7}
					>
						<Text style={styles.discardText}>×</Text>
					</TouchableOpacity>
				</View>

				{/* Material identity — centered */}
				<View style={styles.materialSection}>
					<View style={styles.cardCoverWrapper}>
						<MaterialIcon type={materialType} />
					</View>
					<Text style={styles.materialName} numberOfLines={2}>
						{materialName}
					</Text>
					<Text style={styles.materialTypeLabel}>
						{getMaterialTypeLabel(materialType)}
					</Text>
				</View>

				{/* Timer — center hero */}
				<View style={styles.timerSection}>
					<View style={styles.timerContainer}>
						<Animated.View
							style={[
								styles.glow,
								{
									transform: [{ scale: glowScale }],
									opacity: glowOpacity,
								},
							]}
						/>
						<Text style={styles.timerDisplay}>{formatElapsed(elapsed)}</Text>
					</View>
					<Text style={styles.timerLabel}>SESSION ELAPSED</Text>
				</View>

				{/* Fixed bottom buttons */}
				<View style={styles.controls}>
					<TouchableOpacity
						style={styles.pauseButton}
						onPress={handlePauseResume}
						activeOpacity={0.7}
					>
						<Text style={styles.pauseButtonText}>
							{isPaused ? "Resume Session" : "Pause Session"}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.endButton}
						onPress={handleEnd}
						activeOpacity={0.7}
					>
						<Text style={styles.endButtonText}>End Session</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: colors.gray50,
	},
	content: {
		flex: 1,
		paddingHorizontal: spacing.lg,
	},
	header: {
		paddingTop: spacing.md,
		alignItems: "flex-start",
	},
	discardButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: colors.gray300,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colors.white,
	},
	discardText: {
		fontSize: 20,
		color: colors.grayDarkest,
		lineHeight: 22,
	},
	materialSection: {
		alignItems: "center",
		marginTop: spacing.xl,
	},
	cardCoverWrapper: {
		marginBottom: spacing.sm,
	},
	materialName: {
		fontFamily: fonts.heading.medium,
		fontSize: 22,
		color: colors.grayDarkest,
		textAlign: "center",
		marginTop: spacing.xs,
		marginHorizontal: spacing.lg,
	},
	materialTypeLabel: {
		...typography.label,
		color: colors.grayMedium,
		marginTop: spacing.xs,
		letterSpacing: 1,
	},
	timerSection: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	timerContainer: {
		alignItems: "center",
		justifyContent: "center",
	},
	glow: {
		position: "absolute",
		width: 280,
		height: 280,
		borderRadius: 999,
		backgroundColor: colors.primaryAccent,
	},
	timerDisplay: {
		fontFamily: fonts.heading.medium,
		fontSize: 80,
		color: colors.grayDarkest,
		fontVariant: ["tabular-nums"],
	},
	timerLabel: {
		...typography.label,
		color: colors.grayMedium,
		marginTop: spacing.sm,
		letterSpacing: 1,
	},
	controls: {
		paddingBottom: spacing.lg,
		gap: spacing.md,
	},
	pauseButton: {
		...globalStyles.buttonOutline,
		borderRadius: borderRadius.pill,
	},
	pauseButtonText: {
		...globalStyles.buttonOutlineText,
	},
	endButton: {
		...globalStyles.buttonPrimary,
		borderRadius: borderRadius.pill,
	},
	endButtonText: {
		...globalStyles.buttonPrimaryText,
	},
});
