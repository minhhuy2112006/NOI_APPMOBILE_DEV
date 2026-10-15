import { StyleSheet } from "react-native";

export const NOI = {
  navy: "#102F67",
  navyDark: "#0D2A60",

  body: "#687A96",
  bodyDark: "#5E718F",
  muted: "#8996AA",

  pink: "#F2B3E3",
  blue: "#B7D1FF",

  backgroundTop: "#FFF7FC",
  backgroundMiddle: "#FAF8FF",
  backgroundBottom: "#F2F9FF",

  card: "#FFFFFF",
  border: "#E8E5ED",
};

export const aboutCommon = StyleSheet.create({
  safe: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },

  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
  },

  back: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },

  headerSpace: {
    width: 40,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",

    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",

    color: NOI.navyDark,
  },

  heroTitle: {
    fontSize: 29,
    lineHeight: 34,

    fontWeight: "900",
    letterSpacing: -0.65,

    color: NOI.navy,
  },

  heroDescription: {
    marginTop: 11,

    fontSize: 14,
    lineHeight: 21,

    fontWeight: "400",

    color: NOI.body,
  },

  card: {
    backgroundColor: NOI.card,

    borderWidth: 1,
    borderColor: NOI.border,

    borderRadius: 20,

    shadowColor: "#41577F",
    shadowOpacity: 0.025,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 1,
  },
});