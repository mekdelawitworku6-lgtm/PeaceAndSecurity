import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";

export type MediaKind = "image" | "video" | "audio";

interface MediaThumbProps {
  uri: string;
  kind?: MediaKind;
  size?: number;
  onPress?: () => void;
}

export function MediaThumb({ uri, kind = "image", size = 96, onPress }: MediaThumbProps) {
  const frame = { width: size, height: size };
  const content =
    kind === "image" ? (
      <Image source={{ uri }} style={[styles.image, frame]} resizeMode="cover" />
    ) : (
      <View style={[styles.placeholder, frame]}>
        <Text style={styles.icon}>{kind === "video" ? "▶" : "♪"}</Text>
        <Text style={styles.kindLabel}>{kind === "video" ? "Video" : "Audio"}</Text>
      </View>
    );

  if (!onPress) {
    return <View style={[styles.wrap, frame]}>{content}</View>;
  }
  return (
    <Pressable style={({ pressed }) => [styles.wrap, frame, pressed && styles.pressed]} onPress={onPress}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.primarySoft,
  },
  image: {
    borderRadius: radius.md,
  },
  pressed: {
    opacity: 0.7,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  icon: {
    fontSize: 24,
    color: colors.primary,
  },
  kindLabel: {
    marginTop: 4,
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
  },
});
