export type Profile = {
  id: string;
  timezone: string;
  created_at: string;
};

export type Group = {
  id: string;
  user_id: string;
  name: string;
  due_time: string;
  days_of_week: number[];
  bonus_points: number;
  color: string;
  sort_order: number;
  archived: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  group_id: string | null;
  title: string;
  points: number;
  reminder_minutes_before: number | null;
  due_time: string | null;
  days_of_week: number[];
  sort_order: number;
  active: boolean;
  created_at: string;
};

export type Completion = {
  id: string;
  user_id: string;
  task_id: string;
  completed_on: string;
  completed_at: string;
};

export type GroupBonus = {
  id: string;
  user_id: string;
  group_id: string;
  earned_on: string;
  points: number;
};

export type GroupInsert = {
  name: string;
  due_time: string;
  days_of_week: number[];
  bonus_points: number;
  color: string;
  sort_order?: number;
};

export type TaskInsert = {
  group_id?: string | null;
  title: string;
  points: number;
  reminder_minutes_before?: number | null;
  due_time?: string | null;
  days_of_week?: number[];
  sort_order?: number;
};
