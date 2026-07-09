export interface Chat {
  id: number;
  name: string | null;
  is_private: boolean;
  created_at: string;
  displayName?: string;
  unreadCount?: number;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}