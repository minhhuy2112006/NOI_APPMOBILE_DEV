import { Stack, useLocalSearchParams } from "expo-router";

import AboutDetailScreen from "../../features/about/AboutDetailScreen";
import MissionScreen from "../../features/about/MissionScreen";
import { withAssistant } from "../../features/assistant/Assistant";

function AboutSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();

  return (
    <>
      {/* Tắt header mặc định của Expo Router */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Riêng trang Sứ mệnh dùng MissionScreen */}
      {section === "mission" ? (
        <MissionScreen />
      ) : (
        <AboutDetailScreen />
      )}
    </>
  );
}

export default withAssistant(AboutSectionScreen);