import { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { assetUrl } from "../config";
import { colors, radius, spacing, typography } from "../theme";

function formatSec(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export interface AudioPlayerProps {
  url?: string | null;
  title?: string;
}

export default function AudioPlayer({ url, title }: AudioPlayerProps) {
  const src = assetUrl(url);
  const player = useAudioPlayer(src || null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    return () => {
      player.remove();
    };
  }, [player]);

  const toggle = useCallback(() => {
    if (!src) return;
    if (status.playing) {
      player.pause();
    } else {
      if (player.currentTime >= player.duration) {
        player.seekTo(0);
      }
      player.play();
    }
  }, [src, status.playing, player]);

  const playing = status.playing;
  const current = status.currentTime;
  const duration = status.duration;

  return (
    <View style={styles.card}>
      <Pressable
        onPress={toggle}
        style={styles.playBtn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={playing ? "Pause audio" : "Play audio"}
      >
        <Text style={styles.playText}>{playing ? "❚❚" : "▶"}</Text>
      </Pressable>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title || "Audio evidence"}
        </Text>
        <Text style={styles.time}>
          {formatSec(current)} / {formatSec(duration)}
        </Text>
        <View style={styles.bar}>
          <View
            style={[
              styles.progress,
              { width: duration > 0 ? `${Math.min(100, (current / duration) * 100)}%` : "0%" },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.button,
    padding: spacing.md,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  playText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  title: {
    ...typography.bodyMedium,
  },
  time: {
    ...typography.caption,
    marginTop: 2,
  },
  bar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primarySoft,
    marginTop: 6,
    overflow: "hidden",
  },
  progress: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
