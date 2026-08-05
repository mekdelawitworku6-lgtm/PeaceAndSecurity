import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { assetUrl } from "../config";
import { colors, radius } from "../theme";

export interface MediaThumbProps {
  uri?: string | null;
  type?: "image" | "video" | "audio";
  size?: number;
  onPress?: () => void;
  showOverlay?: boolean;
}

export default function MediaThumb({
  uri,
  type = "image",
  size = 88,
  onPress,
  showOverlay = true,
}: MediaThumbProps) {
  const src = assetUrl(uri);
  const overlay =
    type === "video" ? (
      <View style={styles.play}>
        <Text style={styles.playText}>▶</Text>
      </View>
    ) : null;

  const content =
    type === "image" && src ? (
      <Image
        source={{ uri: src }}
        style={{ width: size, height: size, borderRadius: radius.card }}
        resizeMode="cover"
      />
    ) : (
      <View style={[styles.placeholder, { width: size, height: size }]}>
        <Text style={styles.emoji}>{type === "video" ? "🎬" : "🎙️"}</Text>
        <Text style={styles.caption}>{type === "video" ? "Video" : "Audio"}</Text>
      </View>
    );

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      {content}
      {overlay && showOverlay ? overlay : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.card,
    overflow: "hidden",
  },
  placeholder: {
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 22,
  },
  caption: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  play: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,45,130,0.35)",
  },
  playText: {
    color: colors.white,
    fontSize: 22,
  },
  pressed: {
    opacity: 0.8,
  },
});
