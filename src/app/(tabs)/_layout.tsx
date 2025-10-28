import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{

                    title: "Bill Manager",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="addItem"
                options={{
                    title: "Add Bill",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle-outline" color={color} size={size} />
                    ),
                }}
            />

            <Tabs.Screen
                name="analysis"
                options={{
                    title: "Analysis",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bar-chart-outline" color={color} size={size} />
                    ),
                }}

            />



        </Tabs>

    );
}