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
      citations: {
        Row: {
          created_at: string
          doc_id: string | null
          id: string
          node_id: string | null
          page: number | null
          report_id: string
          source_num: number
          text: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_id?: string | null
          id?: string
          node_id?: string | null
          page?: number | null
          report_id: string
          source_num: number
          text: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          doc_id?: string | null
          id?: string
          node_id?: string | null
          page?: number | null
          report_id?: string
          source_num?: number
          text?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "citations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_citations: {
        Row: {
          created_at: string
          doc_id: string | null
          id: string
          node_id: string | null
          page: number | null
          report_id: string
          source_num: number
          text: string
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          doc_id?: string | null
          id?: string
          node_id?: string | null
          page?: number | null
          report_id: string
          source_num: number
          text: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          doc_id?: string | null
          id?: string
          node_id?: string | null
          page?: number | null
          report_id?: string
          source_num?: number
          text?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_citations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_reports: {
        Row: {
          company_ticker: string
          created_at: string
          html_content: string | null
          id: string
          json_content: Json | null
          recommendation: string | null
          status: string
          target_price: number | null
          title: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          company_ticker: string
          created_at?: string
          html_content?: string | null
          id?: string
          json_content?: Json | null
          recommendation?: string | null
          status: string
          target_price?: number | null
          title: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          company_ticker?: string
          created_at?: string
          html_content?: string | null
          id?: string
          json_content?: Json | null
          recommendation?: string | null
          status?: string
          target_price?: number | null
          title?: string
          type?: string
          updated_at?: string
          url?: string
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
          quarter: number | null
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
          quarter?: number | null
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
          quarter?: number | null
          updated_at?: string | null
          url?: string
          year?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          company_ticker: string
          created_at: string
          html: string | null
          id: string
          json: Json | null
          recommendation: string | null
          status: string
          targetprice: number | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_ticker: string
          created_at?: string
          html?: string | null
          id?: string
          json?: Json | null
          recommendation?: string | null
          status: string
          targetprice?: number | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_ticker?: string
          created_at?: string
          html?: string | null
          id?: string
          json?: Json | null
          recommendation?: string | null
          status?: string
          targetprice?: number | null
          title?: string
          type?: string
          updated_at?: string
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
