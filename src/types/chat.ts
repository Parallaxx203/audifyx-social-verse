
export interface GroupChat {
  id: string;
  name: string;
  creator_id: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  read: boolean;
  sender?: any;
  receiver?: any;
}
