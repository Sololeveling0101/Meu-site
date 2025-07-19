import React, { useState, useEffect } from 'react';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Replace with your own Firebase Realtime Database URL
  const DB_URL = 'https://hacker-forum-123-default-rtdb.firebaseio.com/messages.json ';

  // Load messages from Firebase
  useEffect(() => {
    fetch(DB_URL)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const messageArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setMessages(messageArray);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Using local cache if available.');
        setLoading(false);
      });
  }, []);

  // Send message to Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !message.trim()) return;
    
    const newMessage = {
      username: username.trim(),
      content: message.trim(),
      timestamp: new Date().toISOString()
    };
    
    try {
      const res = await fetch(DB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage)
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      // Get the new message ID from Firebase response
      const data = await res.json();
      setMessages([{
        id: data.name,
        ...newMessage
      }, ...messages]);
      
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Matrix background animation */}
      <div className="fixed inset-0 z-0 matrix-bg">
        <style jsx>{`
          .matrix-bg {
            background: black;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
          }
          .matrix-bg::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: repeating-linear-gradient(
              to bottom,
              rgba(0,255,0,0.1) 0px,
              rgba(0,255,0,0.1) 1px,
              transparent 1px,
              transparent 20px
            );
            background-size: 100% 20px;
            animation: matrixScroll 60s linear infinite;
            z-index: 0;
          }
          @keyframes matrixScroll {
            0% { background-position: 0 0; }
            100% { background-position: 0 100%; }
          }
        `}</style>
      </div>

      {/* Terminal Container */}
      <div className="relative z-10 min-h-screen flex flex-col bg-black bg-opacity-90 text-green-400 font-mono p-4">
        <header className="text-center py-4 border-b border-green-700">
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase">HACKER FORUM</h1>
          <p className="text-sm text-green-300 mt-1">Conectado ao servidor principal...</p>
        </header>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900 bg-opacity-50 p-3 m-4 rounded border border-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-4">
          {loading ? (
            <div className="text-center text-green-500">Carregando mensagens...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-green-500 italic text-sm">Nenhuma mensagem encontrada. Seja o primeiro a postar!</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="bg-black bg-opacity-50 p-3 rounded border border-green-800 animate-fadeIn">
                <div className="flex justify-between text-xs text-green-300">
                  <span>user@{msg.username}</span>
                  <span>{new Date(msg.timestamp).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm">{msg.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 p-4 border-t border-green-800">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="flex-1 bg-black bg-opacity-50 border border-green-700 text-green-400 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
              <button
                type="submit"
                className="bg-green-800 hover:bg-green-700 text-black px-4 py-2 transition-colors duration-200"
              >
                Send
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem... [ENTER] para enviar"
              className="bg-black bg-opacity-50 border border-green-700 text-green-400 p-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
              required
            />
          </form>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}