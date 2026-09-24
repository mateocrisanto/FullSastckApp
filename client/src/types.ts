export type QuestType = 'habit' | 'task' | 'challenge';
export type QuestColor = 'green' | 'purple' | 'orange' | 'blue';

export interface Quest {
  id: string;
  title: string;
  description?: string;
  type: QuestType;
  xp: number;
  streak: number;
  completed: boolean;
  color: QuestColor;
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  gems: number;
  streak: number;
}
