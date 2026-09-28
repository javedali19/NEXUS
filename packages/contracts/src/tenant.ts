export interface TenantContextContract {
  tenant_id: string;
  user_id: string;
  user_email: string;
  role: 'admin' | 'manager' | 'agent' | 'auditor';
}
