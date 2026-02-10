export interface User {
    id: number;
    email: string;
    password_hash: string;
    first_name: string;
    last_name: string;
    pseudo: string;
    created_at: Date;
    updated_at: Date;
  }