import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

/**
 * Hook สำหรับตรวจสอบสถานะเครือข่าย (online/offline)
 * ใช้สำหรับ offline-first architecture
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(Boolean(state.isConnected));
      setIsInternetReachable(state.isInternetReachable ?? null);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, isInternetReachable };
}

/**
 * ตรวจสถานะเครือข่ายแบบ one-shot (ไม่ใช่ hook)
 */
export async function checkNetworkStatus(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return Boolean(state.isConnected);
  } catch {
    return false;
  }
}
