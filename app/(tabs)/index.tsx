import {
  client,
  COMPLETION_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { HabitCompletions, Habits } from "@/types/database.type";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Button, Surface, Text } from "react-native-paper";

export default function Index() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habits[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  useEffect(() => {
    if (user) {
      const channel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const habistSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );
      fetchHabits();
      fetchTodayCompletions()
      return () => {
        habistSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as unknown as Habits[]);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETION_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      const completions = response.documents as unknown as HabitCompletions[];
      setCompletedHabits(completions.map((c) => c.habit_id));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, id);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try {
      const current_Date = new Date().toISOString();
      await databases.createDocument(
        DATABASE_ID,
        COMPLETION_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user?.$id,
          completed_at: current_Date,
        }
      );

      const habit = habits.find((h) => h.$id === id);
      if (!habit) return;
      await databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: current_Date,
      });
    } catch (error) {
      console.log(error);
    }
  };
  const renderLeftActions = () => {
    return (
      <View style={styles.swipeShiftLeft}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={32}
          color={"#fff"}
        />
      </View>
    );
  };

  const renderRightActions = () => {
    return (
      <View style={styles.swipeShiftRight}>
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={32}
          color={"#fff"}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
          Today's Habits
        </Text>
        <Button onPress={signOut} icon={"logout"}>
          Log Out
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No Habits yet. Add your first Habit!
            </Text>
          </View>
        ) : (
          habits?.map((habit, key) => {
            return (
              <Swipeable
                key={key}
                ref={(ref) => {
                  swipeableRefs.current[habit.$id] = ref;
                }}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={renderRightActions}
                onSwipeableOpen={(direction) => {
                  if (direction == "left") {
                    handleDeleteHabit(habit?.$id);
                  } else if (direction == "right") {
                    handleCompleteHabit(habit?.$id);
                  }
                  swipeableRefs.current[habit.$id]?.close();
                }}
              >
                <Surface key={key} style={styles.card} elevation={1}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{habit.title}</Text>
                    <Text style={styles.cardDescription}>
                      {habit.description}
                    </Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.streakBadge}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={18}
                          color={"#ff9800"}
                        />
                        <Text style={styles.streakText}>
                          {habit.streak_count} day streak
                        </Text>
                      </View>
                      <View style={styles.frequencyBadge}>
                        <Text style={styles.frequencyText}>
                          {habit.frequency.charAt(0).toUpperCase() +
                            habit.frequency.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Surface>
              </Swipeable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f8f3fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyStateText: {
    color: "#666666",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  cardContent: {
    padding: 15,
  },
  streakText: {
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#22223b",
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 12,
    color: "#6c6c80",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  frequencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText: {
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "capitalize",
  },
  swipeShiftLeft: {
    justifyContent: "center",
    flex: 1,
    alignItems: "flex-start",
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeShiftRight: {
    backgroundColor: "#4c8f",
    justifyContent: "center",
    flex: 1,
    alignItems: "flex-end",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  },
});

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: "#FAFAFA",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   title: {
//     fontWeight: "700",
//     fontSize: 22,
//     color: "#212121",
//   },
//   emptyState: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   emptyStateText: {
//     color: "#9E9E9E",
//     fontSize: 16,
//   },
//   card: {
//     marginBottom: 16,
//     borderRadius: 16,
//     backgroundColor: "#FFFFFF",
//     elevation: 2,
//   },
//   cardContent: {
//     padding: 18,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 4,
//     color: "#212121",
//   },
//   cardDescription: {
//     fontSize: 14,
//     marginBottom: 12,
//     color: "#616161",
//   },
//   cardFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   streakBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFF3E0",
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//   },
//   streakText: {
//     marginLeft: 4,
//     color: "#FF9800",
//     fontWeight: "bold",
//     fontSize: 13,
//   },
//   frequencyBadge: {
//     backgroundColor: "#EDE7F6",
//     borderRadius: 12,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//   },
//   frequencyText: {
//     color: "#7C4DFF",
//     fontWeight: "600",
//     fontSize: 13,
//   },
// });
