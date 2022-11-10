export interface FlatfileRow {
  id: number;
  status: string;
  valid: boolean;
  data: {
    [key: string]: string | boolean | null;
  };
  info: [];
}
