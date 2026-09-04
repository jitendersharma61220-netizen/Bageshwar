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
  /** Set when the lead is converted into a CRM account (migration 0003). */
  company_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsiteLeadInsert = Omit<
  WebsiteLeadRow,
  | 'id'
  | 'status'
  | 'owner_id'
  | 'internal_note'
  | 'notified_at'
  | 'notify_error'
  | 'company_id'
  | 'created_at'
  | 'updated_at'
> &
  Partial<Pick<WebsiteLeadRow, 'id' | 'status' | 'notified_at' | 'notify_error' | 'company_id'>>;

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

/* -------------------------------------------------------------------------- */
/* CRM (migration 0003)                                                        */
/*                                                                             */
/* Typed loosely as Record<string, unknown> rather than enumerated column by   */
/* column. The CRM repository maps every row explicitly and the SQL is checked */
/* by `pnpm db:validate`, so duplicating the column list here would add a      */
/* second place to keep in sync without adding a real guarantee.               */
/* -------------------------------------------------------------------------- */

type LooseTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

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
      companies: LooseTable;
      contacts: LooseTable;
      opportunities: LooseTable;
      account_activity: LooseTable;
      ai_tasks: LooseTable;
      ai_outputs: LooseTable;
      ai_audit_log: LooseTable;
      research_sources: LooseTable;
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
      pipeline_stage: string;
      account_priority: string;
      company_category: string;
      claim_status: string;
      activity_kind: string;
      ai_task_status: string;
      approval_state: string;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
