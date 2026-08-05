import { Alert, StyleSheet, Text } from "react-native";
import { useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import { KeyboardSafeScreen } from "../../components/KeyboardSafeScreen";
import { AppHeader } from "../../components/AppHeader";
import { AppButton } from "../../components/AppButton";
import { AppInput } from "../../components/AppInput";
import { Card } from "../../components/Card";
import { colors, radius, typography } from "../../theme";
import { useAppDispatch, useAppSelector } from "../../store";
import { escalateReport, selectReportsError, selectSubmitting } from "../../store/reportsSlice";
import type { RootStackParamList } from "../../navigation/types";

type EscalateRoute = RouteProp<RootStackParamList, "Escalate">;

export function EscalateScreen() {
  const navigation = useNavigation();
  const route = useRoute<EscalateRoute>();
  const { reportId, caseId } = route.params;
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectSubmitting);
  const error = useAppSelector(selectReportsError);
  const [notes, setNotes] = useState("");

  const submit = async () => {
    if (notes.trim().length === 0) return;
    const res = await dispatch(escalateReport({ id: reportId, notes: notes.trim() }));
    const r = res as { meta?: { requestStatus?: string } };
    if (r.meta?.requestStatus === "fulfilled") {
      Alert.alert("Escalated", `Case ${caseId ?? reportId} escalated to a supervisor.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <KeyboardSafeScreen>
      <AppHeader title="Escalate" />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Card>
        <Text style={styles.title}>Escalate case {caseId ?? reportId}</Text>
        <Text style={styles.body}>
          Provide a reason why this report needs to be escalated to a supervisor.
        </Text>
        <AppInput
          label="Notes *"
          value={notes}
          onChangeText={setNotes}
          placeholder="Why are you escalating this report?"
          multiline
          maxLength={1000}
        />
        <AppButton
          title="Escalate Report"
          variant="danger"
          onPress={submit}
          loading={submitting}
          disabled={notes.trim().length === 0}
        />
      </Card>
    </KeyboardSafeScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: colors.danger + "1a",
    color: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    ...typography.heading,
    marginBottom: 6,
  },
  body: {
    ...typography.body,
    marginBottom: 12,
  },
});
