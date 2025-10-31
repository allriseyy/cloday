import { StyleSheet } from "react-native";

const RADIUS = 16;

export default StyleSheet.create({
  swipeContainer: {
    borderRadius: RADIUS,
    overflow: "hidden",
    alignSelf: "center",
    marginVertical: 12,
  },
  imageMeasureOnce: {
    width: 250,
    aspectRatio: 1,
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  imageBase: {
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  actionPanel: {
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBg: { backgroundColor: "red" },
  saveBg: { backgroundColor: "green" },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 40,
  },
});
