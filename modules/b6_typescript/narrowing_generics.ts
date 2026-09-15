// B6: Type Narrowing & Generics Demonstration

import { UserProfile, ApiResponse } from './types';

/**
 * 1. Generic Function for Safe API Handling
 */
export function wrapResponse<T>(data: T, status = 200, message = 'Success'): ApiResponse<T> {
  return {
    data,
    status,
    message,
    timestamp: Date.now()
  };
}

/**
 * 2. Type Narrowing Guard for Unknown Data
 */
export function isUserProfile(obj: unknown): obj is UserProfile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj &&
    'role' in obj
  );
}

/**
 * 3. Safe Parser avoiding `any`
 */
export function parseRawUser(jsonString: string): UserProfile | null {
  try {
    const parsed: unknown = JSON.parse(jsonString);
    if (isUserProfile(parsed)) {
      console.log(`✅ Valid UserProfile parsed: ${parsed.name}`);
      return parsed;
    } else {
      console.warn('⚠️ JSON object does not match UserProfile schema.');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error);
    return null;
  }
}
