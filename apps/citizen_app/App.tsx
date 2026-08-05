import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider, useDispatch, useSelector } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./src/store";
import { hydrate, selectAuthStatus, selectToken, selectUser } from "./src/store/authSlice";
import { connectSockets, disconnectSockets } from "./src/socket";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors, typography } from "./src/theme";

const logo = require("./assets/logo.png");

function Splash() {
  return (
    <View style={styles.splash}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.splashText}>Peace &amp; Security</Text>
      <Text style={styles.splashSub}>Citizen App</Text>
    </View>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(hydrate() as never);
  }, [dispatch]);

  useEffect(() => {
    if (status === "signedIn" && token && user) {
      connectSockets(token, user);
    } else {
      disconnectSockets();
    }
    return () => {
      disconnectSockets();
    };
  }, [status, token, user]);

  return (
    <>
      <StatusBar style={status === "idle" ? "light" : "dark"} />
      {status === "idle" ? <Splash /> : <RootNavigator />}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  splashText: {
    ...typography.h1,
    color: colors.white,
  },
  splashSub: {
    ...typography.body,
    color: colors.primarySoft,
    marginTop: 4,
  },
});
