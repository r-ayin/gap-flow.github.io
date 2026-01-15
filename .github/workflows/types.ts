export enum ActionCategory {
  NONE = 'NONE',
  SOP = 'SOP',
  ITERATION = 'ITERATION'
}

export interface GapLog {
  id: string;
  date: string; // ISO String
  author: string;
  role?: string; // Add role for better team context
  gain: string;
  actionCategory: ActionCategory;
  actionContent: string; // Empty if NONE
  plan: string;
  timestamp: number;
}

export interface Stats {
  totalLogs: number;
  sopCount: number;
  iterationCount: number;
}

export interface User {
  name: string;
  role: string;
}