export interface FlatfileTokenExchangeResponse {
  accessToken: string
  user: {
    id: number
    name: string
    email: string
    type: string
  }
}
