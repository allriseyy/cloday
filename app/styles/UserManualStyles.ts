import { StyleSheet } from "react-native";

export default StyleSheet.create({
  headerBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#000000ff",
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
  pageWrap: {
    flexGrow: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 16,
    gap: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
  },
  pageText: {
    fontSize: 14.5,
    color: "#444",
    lineHeight: 21,
  },
  bold: {
    fontWeight: "700",
  },
});
