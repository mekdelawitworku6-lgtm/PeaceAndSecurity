import React from "react";
import { View, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";

export interface IconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

// ─── Clean Vector-Style Line Icons (matching Figma) ───────────────────

export function HomeIcon({ size = 20, color = "#0b2360" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.homeRoof, { borderColor: color }]} />
      <View style={[styles.homeBase, { borderColor: color }]} />
    </View>
  );
}

export function MapIcon({ size = 20, color = "#64748b" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.mapFold1, { borderColor: color }]} />
      <View style={[styles.mapFold2, { borderColor: color }]} />
      <View style={[styles.mapFold3, { borderColor: color }]} />
    </View>
  );
}

export function ReportsIcon({ size = 20, color = "#64748b" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.docPage, { borderColor: color }]}>
        <View style={[styles.docLine, { backgroundColor: color }]} />
        <View style={[styles.docLine, styles.docLineShort, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function ProfileIcon({ size = 20, color = "#64748b" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.userHead, { borderColor: color }]} />
      <View style={[styles.userBody, { borderColor: color }]} />
    </View>
  );
}

export function BellIcon({ size = 18, color = "#ffffff" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.bellDome, { borderColor: color }]} />
      <View style={[styles.bellClapper, { backgroundColor: color }]} />
    </View>
  );
}

export function ShieldIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.shieldOutline, { borderColor: color }]} />
    </View>
  );
}

export function AlertIcon({ size = 18, color = "#ffffff" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.triangleAlert, { borderColor: color }]} />
    </View>
  );
}

export function SearchIcon({ size = 16, color = "#64748b" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.searchLens, { borderColor: color }]} />
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

export function CheckIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.checkStem1, { backgroundColor: color }]} />
      <View style={[styles.checkStem2, { backgroundColor: color }]} />
    </View>
  );
}

export function CameraIcon({ size = 20, color = "#ffffff" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.camBody, { borderColor: color }]} />
      <View style={[styles.camLens, { borderColor: color }]} />
    </View>
  );
}

export function CloseIcon({ size = 16, color = "#64748b" }: IconProps) {
  return (
    <View style={[styles.iconBox, { width: size, height: size }]}>
      <View style={[styles.crossLine1, { backgroundColor: color }]} />
      <View style={[styles.crossLine2, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  /* ── Home Icon ── */
  homeRoof: {
    width: 14,
    height: 9,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    top: 1,
  },
  homeBase: {
    width: 12,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    position: "absolute",
    bottom: 1,
  },

  /* ── Map Icon ── */
  mapFold1: {
    width: 5,
    height: 14,
    borderWidth: 1.5,
    position: "absolute",
    left: 1,
  },
  mapFold2: {
    width: 5,
    height: 14,
    borderWidth: 1.5,
    position: "absolute",
  },
  mapFold3: {
    width: 5,
    height: 14,
    borderWidth: 1.5,
    position: "absolute",
    right: 1,
  },

  /* ── Reports Icon ── */
  docPage: {
    width: 13,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  docLine: {
    width: 7,
    height: 1.5,
    borderRadius: 1,
  },
  docLineShort: {
    width: 4,
    alignSelf: "flex-start",
    marginLeft: 1.5,
  },

  /* ── Profile Icon ── */
  userHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    position: "absolute",
    top: 1,
  },
  userBody: {
    width: 14,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderWidth: 1.5,
    position: "absolute",
    bottom: 1,
  },

  /* ── Bell Icon ── */
  bellDome: {
    width: 12,
    height: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1.5,
    position: "absolute",
    top: 1,
  },
  bellClapper: {
    width: 4,
    height: 3,
    borderRadius: 2,
    position: "absolute",
    bottom: 1,
  },

  /* ── Shield Icon ── */
  shieldOutline: {
    width: 14,
    height: 16,
    borderWidth: 1.5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },

  /* ── Alert Icon ── */
  triangleAlert: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    transform: [{ rotate: "45deg" }],
    borderRadius: 2,
  },

  /* ── Search Icon ── */
  searchLens: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    position: "absolute",
    top: 1,
    left: 1,
  },
  searchHandle: {
    width: 6,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    bottom: 2,
    right: 1,
  },

  /* ── Check Icon ── */
  checkStem1: {
    width: 6,
    height: 2,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    left: 3,
    bottom: 7,
  },
  checkStem2: {
    width: 11,
    height: 2,
    transform: [{ rotate: "-45deg" }],
    position: "absolute",
    right: 2,
    bottom: 8,
  },

  /* ── Camera Icon ── */
  camBody: {
    width: 15,
    height: 11,
    borderWidth: 1.5,
    borderRadius: 2,
    position: "absolute",
    bottom: 1,
  },
  camLens: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    position: "absolute",
    bottom: 4,
  },

  /* ── Close Icon ── */
  crossLine1: {
    width: 14,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
  },
  crossLine2: {
    width: 14,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: "-45deg" }],
    position: "absolute",
  },
});
