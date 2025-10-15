import { Models } from "react-native-appwrite";

export interface Habits extends Models.Document {
  user_id: string;
  title: string;
  description: string;
  frequency: string;
  streak_count: number;
  last_completed: string;
  $createdAt: string;
}


export interface HabitCompletions extends Models.Document {
  habit_id:string
  user_id:string
  completed_at:string
}