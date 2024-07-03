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
      ai_jobs: {
        Row: {
          block_data: string | null
          block_id: string
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          input_tokens: number | null
          output_tokens: number | null
          status: string
          updated_at: string
        }
        Insert: {
          block_data?: string | null
          block_id: string
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          status: string
          updated_at?: string
        }
        Update: {
          block_data?: string | null
          block_id?: string
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          input_tokens?: number | null
          output_tokens?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          cik: string
          company_name: string
          country: string | null
          currency: string | null
          exchange: string | null
          id: string
          isin: string | null
          label: string
          market_cap: string | null
          stock_name: string
          ticker: string
          website: string | null
        }
        Insert: {
          cik: string
          company_name: string
          country?: string | null
          currency?: string | null
          exchange?: string | null
          id?: string
          isin?: string | null
          label?: string
          market_cap?: string | null
          stock_name: string
          ticker: string
          website?: string | null
        }
        Update: {
          cik?: string
          company_name?: string
          country?: string | null
          currency?: string | null
          exchange?: string | null
          id?: string
          isin?: string | null
          label?: string
          market_cap?: string | null
          stock_name?: string
          ticker?: string
          website?: string | null
        }
        Relationships: []
      }
      metrics_cache: {
        Row: {
          created_at: string
          data: Json
          id: string
          ticker: string
          timescale: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          ticker: string
          timescale: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          ticker?: string
          timescale?: string
        }
        Relationships: []
      }
      news_cache: {
        Row: {
          content: string
          created_at: string
          id: string
          url: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      report_template: {
        Row: {
          author_company_logo: string | null
          author_company_name: string
          author_name: string
          business_description: string | null
          color_scheme: string[]
          id: string
          metrics: Json | null
          report_id: string
          summary: string[] | null
          template_type: string
          user_id: string
        }
        Insert: {
          author_company_logo?: string | null
          author_company_name: string
          author_name: string
          business_description?: string | null
          color_scheme: string[]
          id?: string
          metrics?: Json | null
          report_id: string
          summary?: string[] | null
          template_type: string
          user_id: string
        }
        Update: {
          author_company_logo?: string | null
          author_company_name?: string
          author_name?: string
          business_description?: string | null
          color_scheme?: string[]
          id?: string
          metrics?: Json | null
          report_id?: string
          summary?: string[] | null
          template_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_template_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_template_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          company_logo: string | null
          company_name: string | null
          company_ticker: string
          created_at: string
          financial_strength: string | null
          html_content: string | null
          id: string
          json_content: Json | null
          recommendation: string | null
          section_ids: string[]
          status: string
          targetprice: number | null
          title: string
          type: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          company_logo?: string | null
          company_name?: string | null
          company_ticker: string
          created_at?: string
          financial_strength?: string | null
          html_content?: string | null
          id?: string
          json_content?: Json | null
          recommendation?: string | null
          section_ids: string[]
          status: string
          targetprice?: number | null
          title: string
          type: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          company_logo?: string | null
          company_name?: string | null
          company_ticker?: string
          created_at?: string
          financial_strength?: string | null
          html_content?: string | null
          id?: string
          json_content?: Json | null
          recommendation?: string | null
          section_ids?: string[]
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
            foreignKeyName: "reports_ticker_fkey"
            columns: ["company_ticker"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["ticker"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sec_filings: {
        Row: {
          accession_number: string | null
          cik: string | null
          created_at: string | null
          date_as_of_change: string
          filed_as_of_date: string
          form: string
          id: string
          pdf_path: string
          period_of_report_date: string
          quarter: string | null
          ticker: string
          updated_at: string | null
          xml_path: string
          year: number
        }
        Insert: {
          accession_number?: string | null
          cik?: string | null
          created_at?: string | null
          date_as_of_change: string
          filed_as_of_date: string
          form: string
          id?: string
          pdf_path: string
          period_of_report_date: string
          quarter?: string | null
          ticker: string
          updated_at?: string | null
          xml_path: string
          year: number
        }
        Update: {
          accession_number?: string | null
          cik?: string | null
          created_at?: string | null
          date_as_of_change?: string
          filed_as_of_date?: string
          form?: string
          id?: string
          pdf_path?: string
          period_of_report_date?: string
          quarter?: string | null
          ticker?: string
          updated_at?: string | null
          xml_path?: string
          year?: number
        }
        Relationships: []
      }
      sec_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          form: string
          id: string
          progress: number | null
          status: string
          ticker: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          form: string
          id?: string
          progress?: number | null
          status: string
          ticker: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          form?: string
          id?: string
          progress?: number | null
          status?: string
          ticker?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          author_name: string
          company_name: string
          id: string
          user_id: string
        }
        Insert: {
          author_name: string
          company_name: string
          id?: string
          user_id: string
        }
        Update: {
          author_name?: string
          company_name?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          plan: string
          user_id: string
        }
        Insert: {
          id?: string
          plan: string
          user_id: string
        }
        Update: {
          id?: string
          plan?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          business_description: string | null
          component_id: string
          id: string
          name: string
          report_type: string
          sample_text: Json
          section_ids: string[]
          summary: string[] | null
        }
        Insert: {
          business_description?: string | null
          component_id: string
          id?: string
          name: string
          report_type: string
          sample_text: Json
          section_ids: string[]
          summary?: string[] | null
        }
        Update: {
          business_description?: string | null
          component_id?: string
          id?: string
          name?: string
          report_type?: string
          sample_text?: Json
          section_ids?: string[]
          summary?: string[] | null
        }
        Relationships: []
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

