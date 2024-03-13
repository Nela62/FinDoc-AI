'use client';

import { useChat } from 'ai/react';

export function AiChat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div className="flex flex-col justify-end w-72 px-4 py-4 border-l border-gray-300">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="focus:outline-none focus:border-gray-400 w-full p-2 border border-gray-300 rounded text-sm"
          value={input}
          placeholder="Ask Fin a question..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
