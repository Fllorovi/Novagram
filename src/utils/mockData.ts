export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  avatar: string;
}

export interface Message {
  id: number;
  chatId: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

export const mockChats: Chat[] = [
  {
    id: 1,
    name: 'Анна',
    lastMessage: 'Привет! Как дела?',
    time: '12:30',
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 2,
    name: 'Команда',
    lastMessage: 'Встреча в 15:00',
    time: '11:15',
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: 3,
    name: 'Павел',
    lastMessage: 'Скинь макет',
    time: 'вчера',
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
];

export const mockMessages: Message[] = [
  { id: 1, chatId: 1, sender: 'other', text: 'Привет! Как дела?', time: '12:30' },
  { id: 2, chatId: 1, sender: 'me', text: 'Привет! Отлично, а ты?', time: '12:32' },
  { id: 3, chatId: 1, sender: 'other', text: 'Тоже хорошо. Есть идея по проекту', time: '12:33' },
  { id: 4, chatId: 2, sender: 'other', text: 'Встреча в 15:00', time: '11:15' },
  { id: 5, chatId: 2, sender: 'me', text: 'Хорошо, буду', time: '11:20' },
];