export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  lifecycle_stage: 'lead' | 'prospect' | 'customer' | 'churned';
  lead_score: number;
  total_lifetime_value: number;
  tags: string[];
}

export interface TimelineEntry {
  id: string;
  source_module: 'crm' | 'erp' | 'ai_comms' | 'workflow' | 'system';
  entry_type: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface ErpInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  due_date: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  value: number;
  stage: 'lead' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
}

export interface AiCommunication {
  id: string;
  channel: 'phone' | 'email' | 'sms' | 'whatsapp';
  direction: 'inbound' | 'outbound';
  ai_summary: string;
  sentiment_score: number;
}

export interface Workflow {
  id: string;
  name: string;
  trigger_event: string;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  actor_email: string;
  created_at: string;
}
