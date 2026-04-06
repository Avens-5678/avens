import { NativeBiometric } from "capacitor-native-biometric";
import { Capacitor } from "@capacitor/core";

const CREDENTIALS_SERVER = "com.evnting.app";

export const isBiometricAvailable = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
};

export const saveBiometricCredentials = async (email: string, password: string) => {
  await NativeBiometric.setCredentials({
    username: email,
    password: password,
    server: CREDENTIALS_SERVER,
  });
};

export const getBiometricCredentials = async () => {
  try {
    await NativeBiometric.verifyIdentity({
      reason: "Log in to Evnting",
      title: "Biometric Login",
      subtitle: "Use fingerprint or Face ID",
    });
    const credentials = await NativeBiometric.getCredentials({
      server: CREDENTIALS_SERVER,
    });
    return { email: credentials.username, password: credentials.password };
  } catch {
    return null;
  }
};

export const deleteBiometricCredentials = async () => {
  try {
    await NativeBiometric.deleteCredentials({ server: CREDENTIALS_SERVER });
  } catch {}
};
