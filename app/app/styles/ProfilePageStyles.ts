import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
  page: {
    flex: 1,
  },

  // HERO
  heroCard: {
    backgroundColor: "#fff",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.12 : 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarWrap: { position: "relative" },
  avatar: {
    borderWidth: 3,
    borderColor: "#efefef",
  },
  avatarBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    backgroundColor: "#111",
    borderRadius: 999,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  nameText: {
    fontWeight: "800",
  },
  iconBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconBtnPrimary: {
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editRow: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "85%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111",
    marginBottom: 12,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  titleIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  titleText: {
    color: "#444",
    fontWeight: "700",
  },
  changeTitleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f2f2f2",
  },
  changeTitleBtnDisabled: {
    opacity: 0.6,
  },
  changeTitleTxt: { fontSize: 14, color: "#111", fontWeight: "600" },

  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    backgroundColor: "#f7f7f7",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  inputInline: {
    marginBottom: 0,
    height: 44,
    textAlignVertical: "center",
    flexGrow: 1,
  },
  statValue: {
    fontWeight: "800",
    textAlign: "center",
  },
  statLabel: {
    color: "#666",
    marginTop: 2,
    fontSize: 12,
  },
  divider: {
    width: 1,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 6,
  },

  // GENERIC CARD
  card: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: Platform.OS === "ios" ? 0.08 : 0.14,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "800",
  },
  cardMeta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
  },

  // Progress
  progressTrack: {
    backgroundColor: "#eee",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#111",
  },
  helperTextLarge: {
    fontSize: 13,
    color: "#666",
  },

  // Quick actions
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickBtn: {
    width: "48%",
    backgroundColor: "#f7f7f7",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickBtnDisabled: {
    width: "48%",
    backgroundColor: "#f0f0f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    opacity: 0.6,
  },
  quickTxt: { fontSize: 14, fontWeight: "700", color: "#111" },
  quickTxtDisabled: { fontSize: 14, fontWeight: "700", color: "#999" },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  titleOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f7f7f7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleOptionActive: {
    backgroundColor: "#eaeaea",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
  },
  titleOptionLocked: {
    opacity: 0.6,
  },
  titleOptionText: { fontSize: 15, color: "#111", fontWeight: "700" },
  lockedSub: { fontSize: 12, color: "#777", marginTop: 2 },
  unlockedSub: { fontSize: 12, color: "#4a4a4a", marginTop: 2 },

  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 16,
    alignSelf: "stretch",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  modalHint: { fontSize: 13, color: "#666", marginBottom: 10 },
});
