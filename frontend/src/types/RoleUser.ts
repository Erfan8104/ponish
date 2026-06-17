export type UserRole = 'freelancer' | 'employer'

export interface UserRegistrationPayload {
  username: string
  role: UserRole
}

export interface RegistrationState {
  username: string
  role: UserRole | null
  isValidUsername: boolean
}
