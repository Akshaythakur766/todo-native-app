import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
export default function Index() {
  const router = useRouter()
  const {signOut}= useAuth()
  const handleAuth = ()=>{
    router.push("/auth")
    
  }

  return (
    <View style={styles.view}>
      <Text>hELLO VISHAL </Text>
      <Button   onPress={signOut} icon={"logout"}  >Log Out</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
