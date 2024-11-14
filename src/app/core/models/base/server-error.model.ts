export interface ServerError {
  status: number;
  error: {
    error: string;
    error_description: string;
  };
}
