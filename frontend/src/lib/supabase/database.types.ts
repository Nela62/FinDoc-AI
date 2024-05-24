export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_cache: {
        Row: {
          accessed_at: string
          api_provider: string
          endpoint: string
          id: string
          json_data: Json
          report_id: string
          user_id: string
        }
        Insert: {
          accessed_at?: string
          api_provider: string
          endpoint: string
          id?: string
          json_data: Json
          report_id: string
          user_id: string
        }
        Update: {
          accessed_at?: string
          api_provider?: string
          endpoint?: string
          id?: string
          json_data?: Json
          report_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_cache_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_cache_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      api_citations: {
        Row: {
          cache_id: string
          citation_snippet_id: string
          id: string
          report_id: string
          used_json_data: Json
          user_id: string
        }
        Insert: {
          cache_id: string
          citation_snippet_id: string
          id?: string
          report_id: string
          used_json_data: Json
          user_id: string
        }
        Update: {
          cache_id?: string
          citation_snippet_id?: string
          id?: string
          report_id?: string
          used_json_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_citations_cache_id_fkey"
            columns: ["cache_id"]
            isOneToOne: false
            referencedRelation: "api_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_citations_citation_snippet_id_fkey"
            columns: ["citation_snippet_id"]
            isOneToOne: false
            referencedRelation: "citation_snippets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_citations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_citations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      citation_snippets: {
        Row: {
          cited_document_id: string
          created_at: string
          id: string
          last_refreshed: string
          report_id: string
          source_num: number
          text_snippet: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cited_document_id: string
          created_at?: string
          id?: string
          last_refreshed?: string
          report_id: string
          source_num: number
          text_snippet: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cited_document_id?: string
          created_at?: string
          id?: string
          last_refreshed?: string
          report_id?: string
          source_num?: number
          text_snippet?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "citation_snippets_cited_document_id_fkey"
            columns: ["cited_document_id"]
            isOneToOne: false
            referencedRelation: "cited_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_snippets_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citation_snippets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cited_documents: {
        Row: {
          bottom_title: string | null
          cache_id: string | null
          citation_type: string
          created_at: string
          doc_id: string | null
          id: string
          last_refreshed: string
          report_id: string
          source_num: number
          top_title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bottom_title?: string | null
          cache_id?: string | null
          citation_type: string
          created_at?: string
          doc_id?: string | null
          id?: string
          last_refreshed?: string
          report_id: string
          source_num: number
          top_title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bottom_title?: string | null
          cache_id?: string | null
          citation_type?: string
          created_at?: string
          doc_id?: string | null
          id?: string
          last_refreshed?: string
          report_id?: string
          source_num?: number
          top_title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cited_documents_cache_id_fkey"
            columns: ["cache_id"]
            isOneToOne: false
            referencedRelation: "api_cache"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cited_documents_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cited_documents_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cited_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          country: string | null
          exchange: string | null
          id: string
          industry_group: string | null
          isin: string | null
          label: string
          logo_link: string | null
          market: string | null
          market_cap: string | null
          name: string
          sector: string | null
          symbol: string
          website: string | null
        }
        Insert: {
          country?: string | null
          exchange?: string | null
          id?: string
          industry_group?: string | null
          isin?: string | null
          label?: string
          logo_link?: string | null
          market?: string | null
          market_cap?: string | null
          name: string
          sector?: string | null
          symbol: string
          website?: string | null
        }
        Update: {
          country?: string | null
          exchange?: string | null
          id?: string
          industry_group?: string | null
          isin?: string | null
          label?: string
          logo_link?: string | null
          market?: string | null
          market_cap?: string | null
          name?: string
          sector?: string | null
          symbol?: string
          website?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          accession_number: string | null
          cik: string
          company_name: string
          company_ticker: string
          created_at: string | null
          date_as_of_change: string
          doc_type: string
          filed_as_of_date: string
          id: string
          period_of_report_date: string
          quarter: string | null
          updated_at: string | null
          url: string
          year: number
        }
        Insert: {
          accession_number?: string | null
          cik: string
          company_name: string
          company_ticker: string
          created_at?: string | null
          date_as_of_change: string
          doc_type: string
          filed_as_of_date: string
          id?: string
          period_of_report_date: string
          quarter?: string | null
          updated_at?: string | null
          url: string
          year: number
        }
        Update: {
          accession_number?: string | null
          cik?: string
          company_name?: string
          company_ticker?: string
          created_at?: string | null
          date_as_of_change?: string
          doc_type?: string
          filed_as_of_date?: string
          id?: string
          period_of_report_date?: string
          quarter?: string | null
          updated_at?: string | null
          url?: string
          year?: number
        }
        Relationships: []
      }
      documents_reports: {
        Row: {
          document_id: string
          id: number
          report_id: string
        }
        Insert: {
          document_id: string
          id?: number
          report_id: string
        }
        Update: {
          document_id?: string
          id?: number
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_reports_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_reports_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_citations: {
        Row: {
          citation_snippet_id: string
          doc_id: string
          id: string
          node_id: string
          page: number
          report_id: string
          text: string
          user_id: string
        }
        Insert: {
          citation_snippet_id: string
          doc_id: string
          id?: string
          node_id: string
          page: number
          report_id: string
          text: string
          user_id: string
        }
        Update: {
          citation_snippet_id?: string
          doc_id?: string
          id?: string
          node_id?: string
          page?: number
          report_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_citations_citation_snippet_id_fkey"
            columns: ["citation_snippet_id"]
            isOneToOne: false
            referencedRelation: "citation_snippets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_citations_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_citations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_citations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_ticker: string
          created_at: string
          html_content: string | null
          id: string
          json_content: Json | null
          recommendation: string | null
          status: string
          targetprice: number | null
          title: string
          type: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          company_ticker: string
          created_at?: string
          html_content?: string | null
          id?: string
          json_content?: Json | null
          recommendation?: string | null
          status: string
          targetprice?: number | null
          title: string
          type: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          company_ticker?: string
          created_at?: string
          html_content?: string | null
          id?: string
          json_content?: Json | null
          recommendation?: string | null
          status?: string
          targetprice?: number | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          author_name: string | null
          company_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          author_name?: string | null
          company_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          author_name?: string | null
          company_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

