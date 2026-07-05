import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChats } from '../hooks/useChats';
import { useRealtimeMessages } from '../hooks/useRealtime';
import { usePresence } from '../hooks/usePresence'; // 👈 НОВОЕ: импортируем хук для Presence
import { chatsApi } from '../api/chatsApi';
import type { Chat, Message } from '../types/chat.types';

export const ChatPage = () => {
  const { user, signOut } = useAuthStore();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { chats, loading: chatsLoading } = useChats(user?.id || null);
  const { messages, loading: messagesLoading } = useRealtimeMessages(selectedChat?.id || null);
  const [newMessage, setNewMessage] = useState('');

  // 👇 НОВОЕ: подключаем хук Presence для выбранного чата
  const { onlineUsers, isTyping, sendTyping } = usePresence(
    selectedChat?.id || null,
    user?.id || null
  );

  // Реф для контейнера сообщений
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Прокрутка вниз при обновлении сообщений (загрузка, отправка, приём)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    try {
      await chatsApi.sendMessage(selectedChat.id, user.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Ошибка отправки:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  if (chatsLoading) {
    return <div className="flex items-center justify-center h-screen">Загрузка чатов...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Сайдбар */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Чаты</h2>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedChat?.id === chat.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className="w-12 h-12 rounded-full bg-blue-300 flex items-center justify-center text-white mr-4">
                {chat.name?.[0] || 'Ч'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium">{chat.name || 'Без названия'}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
          <span>{user?.email || 'Пользователь'}</span>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-xs font-medium"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Окно чата */}
      <main className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* 👇 НОВОЕ: Шапка чата с динамическим статусом */}
            <header className="p-4 bg-white border-b border-gray-200 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-300 flex items-center justify-center text-white mr-4">
                {selectedChat.name?.[0] || 'Ч'}
              </div>
              <div>
                <h3 className="font-semibold">{selectedChat.name || 'Чат'}</h3>
                <span className="text-xs">
                  {onlineUsers.length > 0 ? (
                    <span className="text-green-500">онлайн</span>
                  ) : (
                    <span className="text-gray-400">офлайн</span>
                  )}
                  {isTyping && (
                    <span className="text-blue-500 ml-2">печатает...</span>
                  )}
                </span>
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
              {messagesLoading && <p className="text-center text-gray-400">Загрузка сообщений...</p>}
              {messages.map((msg: Message) => (
                <div
                  key={msg.id}
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender_id === user?.id
                      ? 'bg-blue-500 text-white self-end ml-auto'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-xs opacity-70 block mt-1">
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {/* Пустой div для прокрутки вниз */}
              <div ref={messagesEndRef} />
            </div>

            {/* 👇 НОВОЕ: поле ввода с отправкой события "печатает" */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  sendTyping(); // 👈 НОВОЕ: отправляем событие "печатает"
                }}
                placeholder="Напишите сообщение..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Выберите чат для начала общения
          </div>
        )}
      </main>
    </div>
  );
};