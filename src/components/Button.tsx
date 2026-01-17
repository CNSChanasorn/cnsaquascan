import { Text, TouchableOpacity } from "react-native";

export default function Button({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#FD8342",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  );
}