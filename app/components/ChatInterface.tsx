import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import ChatMessage from "./ChatMessage";
interface Message {
  sender: "user" | "bot";
  text: string;
  image: string | null;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (text: string, imageFile?: File | null) => Promise<void>;
  loading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSend, loading }) => {
  const [text, setText] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [openDialog,setOpenDialog]=useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text && !image) return;
    if (loading) return; // Prevent sending while loading
    await onSend(text, image);
    setText("");
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const el = messagesEndRef.current?.parentNode as HTMLElement | null;
    if (!el) return;

    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            sender={msg.sender}
            text={msg.text}
            image={msg.image}
            
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          className="text-black"
          placeholder={
            loading ? "Waiting for response..." : "Type your message..."
          }
          onChange={(e: ChangeEvent<HTMLInputElement>) => setText(e.target.value)}
          disabled={loading}
        />
        <label htmlFor="file-upload" className="file-upload-label">
          📎
        </label>
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setImage(e.target.files ? e.target.files[0] : null)
          }
          style={{ display: "none" }}
          disabled={loading}
        />
        <button type="submit" disabled={loading || (!text && !image)}>
          {loading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
