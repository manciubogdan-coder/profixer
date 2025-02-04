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
      craftsman_statistics: {
        Row: {
          craftsman_id: string | null
          created_at: string | null
          event_type: string
          id: string
        }
        Insert: {
          craftsman_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
        }
        Update: {
          craftsman_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "craftsman_statistics_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "craftsman_statistics_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          budget: number | null
          city: string
          client_id: string | null
          county: string
          created_at: string
          description: string
          estimated_time: string
          id: string
          images: Json | null
          start_date: string | null
          status: string | null
          title: string
          trade_id: string | null
        }
        Insert: {
          budget?: number | null
          city: string
          client_id?: string | null
          county: string
          created_at?: string
          description: string
          estimated_time?: string
          id?: string
          images?: Json | null
          start_date?: string | null
          status?: string | null
          title: string
          trade_id?: string | null
        }
        Update: {
          budget?: number | null
          city?: string
          client_id?: string | null
          county?: string
          created_at?: string
          description?: string
          estimated_time?: string
          id?: string
          images?: Json | null
          start_date?: string | null
          status?: string | null
          title?: string
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "job_listings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          receiver_id: string | null
          sender_id: string | null
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          portfolio_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          portfolio_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          portfolio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_images_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          craftsman_id: string | null
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          craftsman_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          craftsman_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "portfolios_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_interactions: {
        Row: {
          craftsman_id: string | null
          created_at: string | null
          id: string
          interaction_type: string
          metadata: Json | null
          visitor_id: string | null
        }
        Insert: {
          craftsman_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          metadata?: Json | null
          visitor_id?: string | null
        }
        Update: {
          craftsman_id?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          metadata?: Json | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_interactions_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "profile_interactions_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_interactions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "profile_interactions_visitor_id_fkey"
            columns: ["visitor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string
          avatar_url: string | null
          city: string
          country: string
          county: string
          craftsman_type: string | null
          created_at: string
          first_name: string
          id: string
          last_location_update: string | null
          last_name: string
          latitude: number | null
          longitude: number | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address: string
          avatar_url?: string | null
          city: string
          country: string
          county: string
          craftsman_type?: string | null
          created_at?: string
          first_name: string
          id: string
          last_location_update?: string | null
          last_name: string
          latitude?: number | null
          longitude?: number | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string
          avatar_url?: string | null
          city?: string
          country?: string
          county?: string
          craftsman_type?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_location_update?: string | null
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_craftsman_type_fkey"
            columns: ["craftsman_type"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          },
        ]
      }
      qualifications: {
        Row: {
          craftsman_id: string | null
          created_at: string
          document_url: string
          id: string
          issue_date: string | null
          title: string
        }
        Insert: {
          craftsman_id?: string | null
          created_at?: string
          document_url: string
          id?: string
          issue_date?: string | null
          title: string
        }
        Update: {
          craftsman_id?: string | null
          created_at?: string
          document_url?: string
          id?: string
          issue_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "qualifications_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "qualifications_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          client_id: string | null
          comment: string
          craftsman_id: string | null
          craftsman_response: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          comment: string
          craftsman_id?: string | null
          craftsman_response?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          comment?: string
          craftsman_id?: string | null
          craftsman_response?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "reviews_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      specializations: {
        Row: {
          craftsman_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          craftsman_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          craftsman_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "specializations_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "craftsman_profile_statistics"
            referencedColumns: ["craftsman_id"]
          },
          {
            foreignKeyName: "specializations_craftsman_id_fkey"
            columns: ["craftsman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      craftsman_profile_statistics: {
        Row: {
          average_rating: number | null
          craftsman_id: string | null
          positive_reviews: number | null
          total_clients: number | null
          total_messages: number | null
          total_projects: number | null
        }
        Relationships: []
      }
      platform_statistics: {
        Row: {
          avg_rating: number | null
          total_clients: number | null
          total_craftsmen: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      get_craftsman_statistics: {
        Args: {
          craftsman_id_param: string
          start_date?: string
          end_date?: string
        }
        Returns: {
          craftsman_id: string
          total_clients: number
          average_rating: number
          total_projects: number
          total_messages: number
          positive_reviews: number
          profile_views: number
          map_clicks: number
          phone_clicks: number
          unique_visitors: number
        }[]
      }
    }
    Enums: {
      craftsman_type:
        | "carpenter"
        | "plumber"
        | "electrician"
        | "painter"
        | "mason"
        | "welder"
        | "locksmith"
        | "roofer"
        | "hvac_technician"
        | "general_contractor"
      user_role: "client" | "professional"
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
