import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Freqeuncy = (typeof FREQUENCIES)[number];
export const AddHabitScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Freqeuncy>(FREQUENCIES[0]);
  const [error, setError] = useState<string>("");
  const handleSubmit = async () => {
    try {
      if (!title && !description) {
        setError("All Fields Required");
        return;
      }
      if (!user) return;
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          $createdAt: new Date().toISOString(),
        }
      );
      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }
      setError("There was an error cresting the habit");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput label={"Title"} value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
      <TextInput label={"Description"} value={description} onChangeText={setDescription} mode="outlined" style={styles.input} />
      <View style={styles.frequencyContainer}>
        <SegmentedButtons
          value={frequency}
          onValueChange={setFrequency}
          buttons={FREQUENCIES?.map((item) => ({
            value: item,
            label: item.charAt(0).toUpperCase() + item.slice(1),
          }))}
          style={styles.segmentedButtons}
        />
      </View>
      <Button
        mode="contained"
        style={styles.button}
        onPress={handleSubmit}
        // disabled={!title || !description}
      >
        Add Habit
      </Button>
      {error && <Text style={{ color: theme.colors.error }}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
  },
  frequencyContainer: {
    marginBottom: 24,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default AddHabitScreen;
