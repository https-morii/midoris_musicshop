export type UserRole = 'comprador' | 'vendedor';
export interface AuthUser { id: number; email: string; role: UserRole; }
