export interface ILoginFormState {
  email: string;
  password: string;
}

export interface ISignupFormState extends ILoginFormState {
  fullName: string;
  username: string;
  phoneNumber: string;
}
