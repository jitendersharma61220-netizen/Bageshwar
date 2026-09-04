/**
 * Database types.
 *
 * Row shapes are type aliases rather than interfaces on purpose: postgrest-js
 * constrains each table to `Record<string, unknown>`, and an interface carries
 * no implicit index signature, so declaring these as interfaces makes the whole
 * schema resolve to `never` and every insert silently untyped.
 *
 * Hand-maintained against supabase/migrations. Regenerate with
 * `supabase gen types typescript` once the project exists; until then these
 * are the contract the application codes against, and `pnpm db:validate`
 * checks the SQL side of it.
 */

export type EnquiryKind = 'general' | 'quote' | 'boq';

export type LeadStatus =
  | 'new'
  | 'reviewing'
  | 'qualified'
  | 'converted'
  | 'archived'
  | 'spam';

export type WebsiteLeadRow = {
  id: string;
  kind: EnquiryKind;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: string | null;
  service_slug: string | null;
  industry_slug: string | null;
  project_name: string | null;
  location: string | null;
  timeline: string | null;
  quantity: string | null;
  message: string;
  source_path: string | null;
  referrer: string | null;
  user_agent: string | null;
  status: LeadStatus;
  owner_id: string | null;
  internal_note: string | null;
  notified_at: string | null;
  notify_error: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteLeadInsert = Omit<
  WebsiteLeadRow,
  'id' | 'status' | 'owner_id' | 'internal_note' | 'notified_at' | 'notify_error' | 'created_at' | 'updated_at'
> &
  Partial<Pick<WebsiteLeadRow, 'id' | 'status' | 'notified_at' | 'notify_error'>>;

export type LeadDocumentRow = {
  id: string;
  lead_id: string;
  storage_key: string;
  original_name: string;
  content_type: string;
  byte_size: number;
  checksum: string;
  created_at: string;
};

export type LeadDocumentInsert = Omit<LeadDocumentRow, 'id' | 'created_at'>;

export type Database = {
  public: {
    Tables: {
      website_leads: {
        Row: WebsiteLeadRow;
        Insert: WebsiteLeadInsert;
        Update: Partial<WebsiteLeadRow>;
        Relationships: [];
      };
      lead_documents: {
        Row: LeadDocumentRow;
        Insert: LeadDocumentInsert;
        Update: Partial<LeadDocumentRow>;
        Relationships: [];
      };
    };
    /*
     * Empty-key mapped types, not Record<string, never>.
     *
     * postgrest-js computes `Tables & Views`, so a Views type with a string
     * index signature intersects every table property with `never` and every
     * insert collapses to `never`. This is the shape Supabase's own generated
     * types use.
     */
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      enquiry_kind: EnquiryKind;
      lead_status: LeadStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
