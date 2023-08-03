export interface PasswordStruct {
  /**
   *  @inject_tag: bson:"hashed,omitempty"
   */
  hashed: string;
}

export interface AuthServices {
  /**
   *  @inject_tag: bson:"password,omitempty"
   */
  password: PasswordStruct | undefined;
}

export interface EmailObject {
  /**
   *  @inject_tag: bson:"address,omitempty"
   */
  address: string;
  /**
   *  @inject_tag: bson:"verified,omitempty"
   */
  verified: boolean;
  /**
   *  @inject_tag: bson:"primary,omitempty"
   */
  primary: boolean;
  /**
   *  @inject_tag: bson:"verificationCode"
   */
  verificationCode: string;
}

export interface User {
  /**
   *  @inject_tag: bson:"_id,omitempty"
   */
  id: string;
  /**
   *  @inject_tag: bson:"username,omitempty"
   */
  username: string;
  /**
   *  @inject_tag: bson:"primaryEmail,omitempty"
   */
  primaryEmail: string;
  /**
   *  @inject_tag: bson:"firstname,omitempty"
   */
  firstname: string;
  /**
   *  @inject_tag: bson:"lastname,omitempty"
   */
  lastname: string;
  /**
   *  @inject_tag: bson:"createdAt,omitempty"
   */
  createdAt: string;
  /**
   *  @inject_tag: bson:"updatedAt,omitempty"
   */
  updatedAt: string;
  /**
   *  @inject_tag: bson:"emails,omitempty"
   */
  emails: EmailObject[];
  /**
   *  @inject_tag: bson:"services,omitempty"
   */
  services: AuthServices | undefined;
  /**
   *  @inject_tag: bson:"settings,omitempty"
   */
  settings: Settings | undefined;
}

export interface Settings {
  stripeId: string;
}

export interface Session {
  id: string;
  email: string;
  /**
   *  unix
   */
  created: number;
  /**
   *  unix
   */
  expires: number;
}

export const LoginServiceTypes = {
  Password: 0 as LoginServiceTypes,
  Facebook: 1 as LoginServiceTypes,
  Github: 2 as LoginServiceTypes,
  Google: 3 as LoginServiceTypes,
  fromJSON(object: any): LoginServiceTypes {
    switch (object) {
      case 0:
      case 'Password':
        return LoginServiceTypes.Password;
      case 1:
      case 'Facebook':
        return LoginServiceTypes.Facebook;
      case 2:
      case 'Github':
        return LoginServiceTypes.Github;
      case 3:
      case 'Google':
        return LoginServiceTypes.Google;
      default:
        throw new global.Error(`Invalid value ${object}`);
    }
  },
  toJSON(object: LoginServiceTypes): string {
    switch (object) {
      case LoginServiceTypes.Password:
        return 'Password';
      case LoginServiceTypes.Facebook:
        return 'Facebook';
      case LoginServiceTypes.Github:
        return 'Github';
      case LoginServiceTypes.Google:
        return 'Google';
      default:
        return 'UNKNOWN';
    }
  },
};

export type LoginServiceTypes = 0 | 1 | 2 | 3;

export interface LoginTypeParams {
  accessToken: string;
  userId: string;
  password: string;
  email: string;
}

export interface LoginRequest {
  service: LoginServiceTypes;
  params: LoginTypeParams | undefined;
}

export interface CreateRequest {
  username: string;
  password: string;
  email: string;
  firstname: string;
  lastname: string;
  service: LoginServiceTypes;
  tokens: { [key: string]: string };
}
