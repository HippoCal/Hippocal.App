export class TokenViewmodel {

  public UserKey: string;
  public EMail: string;
  public Token: string;
  public UserPin: string;
  public Expires: number;

  constructor(userKey: string, userPin: string, token: string, email: string, expires: number) {
    this.UserKey = userKey;
    this.EMail = email;
    this.UserPin = userPin;
    this.Token = token;
    this.Expires = expires;
  }
}
