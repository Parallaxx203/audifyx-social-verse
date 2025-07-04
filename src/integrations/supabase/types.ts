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
      call_logs: {
        Row: {
          caller_id: string | null
          duration: number | null
          id: string
          receiver_id: string | null
          started_at: string | null
          type: string | null
        }
        Insert: {
          caller_id?: string | null
          duration?: number | null
          id?: string
          receiver_id?: string | null
          started_at?: string | null
          type?: string | null
        }
        Update: {
          caller_id?: string | null
          duration?: number | null
          id?: string
          receiver_id?: string | null
          started_at?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_caller_id_fkey"
            columns: ["caller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      call_sessions: {
        Row: {
          call_type: string
          duration: number | null
          ended_at: string | null
          id: string
          initiator_id: string
          recipient_id: string
          started_at: string | null
          status: string
        }
        Insert: {
          call_type: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          initiator_id: string
          recipient_id: string
          started_at?: string | null
          status: string
        }
        Update: {
          call_type?: string
          duration?: number | null
          ended_at?: string | null
          id?: string
          initiator_id?: string
          recipient_id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_sessions_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_sessions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_creators: {
        Row: {
          campaign_id: string
          creator_id: string
          id: string
          joined_at: string
        }
        Insert: {
          campaign_id: string
          creator_id: string
          id?: string
          joined_at?: string
        }
        Update: {
          campaign_id?: string
          creator_id?: string
          id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_creators_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_creators_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_participants: {
        Row: {
          campaign_id: string | null
          creator_id: string | null
          id: string
          joined_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          creator_id?: string | null
          id?: string
          joined_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          creator_id?: string | null
          id?: string
          joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_participants_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          brand_id: string
          budget: number
          created_at: string
          description: string | null
          id: string
          status: string
          target_audience: string | null
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_audience?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          target_audience?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_stats: {
        Row: {
          comments_count: number | null
          id: string
          likes_count: number | null
          shares_count: number | null
          total_play_time: number | null
          updated_at: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          id?: string
          likes_count?: number | null
          shares_count?: number | null
          total_play_time?: number | null
          updated_at?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          id?: string
          likes_count?: number | null
          shares_count?: number | null
          total_play_time?: number | null
          updated_at?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      "group members": {
        Row: {
          id: string
          "is admin": boolean | null
          "user id": string
        }
        Insert: {
          id?: string
          "is admin"?: boolean | null
          "user id"?: string
        }
        Update: {
          id?: string
          "is admin"?: boolean | null
          "user id"?: string
        }
        Relationships: []
      }
      group_chat_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          "created at": string | null
          creator_id: string | null
          id: string
          name: string
          theme: string | null
        }
        Insert: {
          "created at"?: string | null
          creator_id?: string | null
          id?: string
          name: string
          theme?: string | null
        }
        Update: {
          "created at"?: string | null
          creator_id?: string | null
          id?: string
          name?: string
          theme?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      music_uploads: {
        Row: {
          cover_art_url: string | null
          file_url: string | null
          genre: string | null
          id: string
          title: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          cover_art_url?: string | null
          file_url?: string | null
          genre?: string | null
          id?: string
          title?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          cover_art_url?: string | null
          file_url?: string | null
          genre?: string | null
          id?: string
          title?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "music_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points: {
        Row: {
          id: string
          last_updated: string
          points: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string
          points?: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string
          points?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          action: string | null
          id: string
          points_earned: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          id?: string
          points_earned?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          id?: string
          points_earned?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          handle: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          points: number | null
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          account_type: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          handle?: string | null
          id: string
          is_online?: boolean | null
          last_seen?: string | null
          points?: number | null
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          handle?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          points?: number | null
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      stream_logs: {
        Row: {
          id: string
          music_id: string | null
          streamed_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          music_id?: string | null
          streamed_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          music_id?: string | null
          streamed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_logs_music_id_fkey"
            columns: ["music_id"]
            isOneToOne: false
            referencedRelation: "music_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          play_count: number
          title: string
          track_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          play_count?: number
          title: string
          track_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          play_count?: number
          title?: string
          track_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      twitch_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          refresh_token: string | null
          twitch_id: string | null
          twitch_username: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          refresh_token?: string | null
          twitch_id?: string | null
          twitch_username: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          refresh_token?: string | null
          twitch_id?: string | null
          twitch_username?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "twitch_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      view_logs: {
        Row: {
          id: string
          post_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "view_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "view_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount: number | null
          id: string
          requested_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          id?: string
          requested_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          id?: string
          requested_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      discovery_feed: {
        Row: {
          created_at: string | null
          id: string | null
          media_url: string | null
          title: string | null
          type: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_user_points: {
        Args: { user_id: string; amount: number; reason: string }
        Returns: undefined
      }
      create_group_chat: {
        Args: { p_name: string; p_creator_id: string; p_member_ids: string[] }
        Returns: string
      }
      get_user_direct_messages: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          content: string
          created_at: string
          sender_id: string
          receiver_id: string
          read: boolean
          sender: Json
          receiver: Json
        }[]
      }
      get_user_group_chats: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          name: string
          creator_id: string
          last_message: string
          last_message_time: string
          unread_count: number
        }[]
      }
      increment_creator_stat: {
        Args: {
          creator_id: string
          stat_type: string
          increment_amount?: number
        }
        Returns: undefined
      }
      increment_creator_stat_with_points: {
        Args: {
          creator_id: string
          stat_type: string
          increment_amount?: number
        }
        Returns: undefined
      }
      increment_track_play_count: {
        Args: { track_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
