// src/types/auth.ts

export interface User {
  id: number;
  phone: string;
  isVerified: boolean;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}