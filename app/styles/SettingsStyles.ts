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
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 16,
    gap: 12,
  },
  pageSubtitle: { fontSize: 16, fontWeight: "600", marginTop: 8 },
  pageHint: { fontSize: 12, color: "#777", marginTop: 8 },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },
  privacyBtn: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#111",
    borderRadius: 10,
  },
  privacyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
