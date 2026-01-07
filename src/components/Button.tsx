import { TouchableOpacity, Text } from "react-native";
import { colors } from "../theme/colors";

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
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 16 }}>{title}</Text>
    </TouchableOpacity>
  );
}