import { MaterialIcons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { syncManager } from "../firebase/SyncManager";

/**
 * SyncStatusBar - แถบแสดงสถานะ sync / offline
 * วางไว้ด้านบนของแอป เพื่อให้ผู้ใช้รู้ว่าตอนนี้ online/offline
 */
export function SyncStatusBar() {
  const [isConnected, setIsConnected] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const isSyncingRef = useRef(false);

  const handleSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const result = await syncManager.processQueue();
      setPendingCount(result.remaining);
    } catch {
      // ignore
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []); // ไม่มี dependency → ไม่สร้าง function ใหม่

  // ตรวจสถานะเครือข่าย (ลงทะเบียนครั้งเดียว)
  useEffect(() => {
    let wasOffline = false;

    const unsubscribe = NetInfo.addEventListener(async (state) => {
      const online = Boolean(state.isConnected);
      setIsConnected(online);

      if (online && wasOffline) {
        // กลับมาออนไลน์จาก offline → sync ครั้งเดียว
        await handleSync();
      }
      wasOffline = !online;
    });

    // ตรวจนับ pending items ทุก 30 วินาที
    const interval = setInterval(async () => {
      try {
        const count = await syncManager.getQueueCount();
        setPendingCount(count);
      } catch {
        // ignore
      }
    }, 30000);

    // ตรวจครั้งแรก
    void (async () => {
      try {
        const count = await syncManager.getQueueCount();
        setPendingCount(count);
      } catch {
        // ignore
      }
    })();

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [handleSync]);

  // แสดง/ซ่อน bar
  useEffect(() => {
    const shouldShow = !isConnected || pendingCount > 0;
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -50,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected, pendingCount, slideAnim]);

  if (isConnected && pendingCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          backgroundColor: isConnected ? "#FF9800" : "#F44336",
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialIcons
          name={isConnected ? "sync" : "cloud-off"}
          size={16}
          color="#fff"
        />
        <Text style={styles.text}>
          {!isConnected
            ? "Offline - ข้อมูลจะ sync เมื่อกลับมาออนไลน์"
            : `${pendingCount} รายการรอ sync`}
        </Text>

        {isConnected && pendingCount > 0 && (
          <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
            <MaterialIcons
              name={isSyncing ? "hourglass-empty" : "sync"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: 40,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    flex: 1,
  },
});
