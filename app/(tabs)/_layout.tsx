// app/(tabs)/_layout.tsx - Tab navigation layout
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import TabIcon from "../../components/navigation/TabIcon";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: styles.tabBar,
				tabBarLabelStyle: styles.tabLabel,
				tabBarActiveTintColor: colors.primaryAccent,
				tabBarInactiveTintColor: "#6B7280",
				tabBarItemStyle: styles.tabItem,
				tabBarIconStyle: styles.tabIconStyle,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Study",
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="study" />,
				}}
			/>
			<Tabs.Screen
				name="library"
				options={{
					title: "Library",
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="library" />,
				}}
			/>
			<Tabs.Screen
				name="reports"
				options={{
					title: "Reports",
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="reports" />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} iconName="settings" />,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	tabBar: {
		backgroundColor: "#FFFFFF",
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		paddingTop: 2,
		paddingBottom: 28, // Extra padding for safe area
		height: 88,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 8,
	},
	tabItem: {
		paddingTop: 4,
	},
	tabLabel: {
		fontSize: 12,
		fontWeight: "400",
		marginTop: 4,
	},
	tabIconStyle: {
		marginBottom: 0,
	},
});
