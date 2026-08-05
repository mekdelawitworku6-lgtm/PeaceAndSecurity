import { useEffect } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store, useAppDispatch, useAppSelector } from "./src/store";
import {
  hydrate,
  selectAuthStatus,
  selectToken,
  selectUser,
} from "./src/store/authSlice";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { connectSockets, disconnectSockets } from "./src/socket";
import { colors } from "./src/theme";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
  },
};

function AppContent() {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);

  useEffect(() => {
    dispatch(hydrate());
  }, [dispatch]);

  useEffect(() => {
    if (status === "signedIn" && token && user) {
      connectSockets(token, user);
    } else {
      disconnectSockets();
    }
  }, [status, token, user]);

  const signedIn = status === "signedIn";

  return (
    <View style={styles.root}>
      <StatusBar style={signedIn ? "dark" : "light"} />
      {status === "idle" ? (
        <View style={styles.splash}>
          <View style={styles.splashLogoWrap}>
            <Image
              source={require("./assets/logo.png")}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.splashTitle}>Peace &amp; Security</Text>
          <Text style={styles.splashSub}>Patrol App</Text>
          <ActivityIndicator color={colors.white} style={styles.splashSpinner} />
        </View>
      ) : (
        <NavigationContainer theme={navTheme}>
          <RootNavigator signedIn={signedIn} />
        </NavigationContainer>
      )}
    </View>
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
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  splash: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  splashLogoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  splashLogo: {
    width: 72,
    height: 72,
  },
  splashTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "800",
  },
  splashSub: {
    color: colors.primarySoft,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 2,
  },
  splashSpinner: {
    marginTop: 24,
  },
});
