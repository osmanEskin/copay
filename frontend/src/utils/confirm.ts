import { Alert, Platform } from "react-native";

// Alert.alert's buttons never fire on web (react-native-web's Alert.alert is a no-op),
// so route through window.confirm there instead.
export function confirmAsync(
  title: string,
  message: string,
  confirmLabel: string = "Onayla"
): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "İptal", style: "cancel", onPress: () => resolve(false) },
      { text: confirmLabel, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
