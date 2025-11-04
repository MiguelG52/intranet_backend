export interface UserSignInInfo {
  userId: string;
  email: string;
  name: string;
  lastname: string;
  role: {
    roleId: string;
    roleName: string;
  };
}

export interface SignInReponse {
  accessToken: string;
  user: UserSignInInfo;
  refreshToken:string;
}