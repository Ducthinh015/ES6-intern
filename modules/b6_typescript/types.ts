// B6: TypeScript Integration - Type Definitions

export type UserRole = 'ADMIN' | 'DEVELOPER' | 'MENTOR' | 'INTERN';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // Optional property
}

// Generics API Response
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: number;
}

// React Props Typing Example
export interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Utility type usages
export type UserCreateInput = Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type UserUpdateInput = Partial<UserCreateInput>;
export type UserMap = Record<string, UserProfile>;
