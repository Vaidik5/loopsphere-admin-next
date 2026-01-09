export default interface AuthModel {
  data: any;
  access_token: string;
  refreshToken?: string;
  api_token: string;
}