import { COMPLETION_COLLECTION_ID, DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/authContext";
import { HabitCompletions, Habits } from "@/types/database.type";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Query } from "react-native-appwrite";

export const StreaksScreen = () => {
  const { signOut, user } = useAuth();
  const [habits, setHabits] = useState<Habits[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletions[]>([]);
  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchCompletions()
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
  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETION_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? "")
        ]
      );
      const completions = response.documents as unknown as HabitCompletions[];
      setCompletedHabits(completions);
    } catch (error) {
      console.log(error);
    }
  };
  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }
  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completedHabits?.filter((c) => c.habit_id == habitId).sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())

    if (habitCompletions?.length == 0) {
      return { streak: 0, bestStreak: 0, total: 0 }
    }

    // build Streak Data 
    let streak = 0
    let bestStreak = 0
    let total = habitCompletions?.length
    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions?.forEach((c) => {
      const date = new Date(c.completed_at)
      if (lastDate) {
        const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 1.5) {
          currentStreak += 1
        }
        else {
          currentStreak = 1
        }
      } else {
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        streak = currentStreak
        lastDate = date
      }
    })

    return { streak, bestStreak, total }
  }
  return (
    <View>
      <Text> Login Screen</Text>
    </View>
  );
};


export default StreaksScreen;
