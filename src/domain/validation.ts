export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  ok: boolean;
  errors?: ValidationError[];
}
