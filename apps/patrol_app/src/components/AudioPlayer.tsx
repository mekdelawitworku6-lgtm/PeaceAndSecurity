import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { colors, radius, typography } from "../theme";
import { formatDuration } from "../utils/format";

interface AudioPlayerProps {
  uri: string;
  title?: string;
}

export function AudioPlayer({ uri, title }: AudioPlayerProps) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  if (!uri) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title ?? "Audio"}</Text>
        <Text style={styles.muted}>No audio available</Text>
      </View>
    );
  }

  const playing = status.playing;
  const duration = status.duration || 0;
  const position = status.currentTime || 0;

  const toggle = () => {
    if (playing) player.pause();
    else player.play();
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.button} onPress={toggle} hitSlop={8}>
        <Text style={styles.playIcon}>{playing ? "❚❚" : "▶"}</Text>
      </Pressable>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title ?? "Audio recording"}
        </Text>
        <Text style={styles.muted}>
          {formatDuration(position)} / {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 10,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playIcon: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.label,
    fontSize: 14,
  },
  muted: {
    ...typography.small,
    marginTop: 2,
  },
});
