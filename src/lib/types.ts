export interface BusinessProfile {
  id: string;
  user_id: string;
  owner_name: string | null;
  business_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  slogan: string | null;
  default_currency: string;
  default_header_color: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetails {
  id: string;
  user_id: string;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  additional_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileSnapshot {
  owner_name?: string | null;
  business_name?: string | null;
  logo_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  slogan?: string | null;
}

export interface LineItem {
  id: string;
  invoice_id: string;
  sort_order: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  currency: string;
  client_name: string;
  client_address: string | null;
  client_email: string | null;
  client_phone: string | null;
  vat_enabled: boolean;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  grand_total: number;
  header_color: string;
  profile_snapshot: ProfileSnapshot;
  payment_details: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  line_items?: LineItem[];
}
