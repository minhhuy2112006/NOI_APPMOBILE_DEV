import { withAssistant } from '../../../features/assistant/Assistant';
import { Stack } from "expo-router";

import DonationFlowScreen from "../../../features/contributions/DonationFlowScreen";

function Screen() {
  return (
    <>
      {/* Ẩn header mặc định của Expo Router */}
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <DonationFlowScreen />
    </>
  );
}
export default withAssistant(Screen);

