import { ISignupFormState } from '@/features/auth/types';

export interface IUserProfile extends Omit<ISignupFormState, 'password'> {
  avatar: string;
}
