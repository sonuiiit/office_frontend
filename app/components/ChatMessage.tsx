import React from "react";

import RaiseTicketDialog from "./RaiseTicketDialog";

interface ChatMessageProps {
  sender: "user" | "bot";
  text: string;
  image: string | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text, image }) => {
  const isUser = sender === "user";

  return (
    <div
      className={`chat-message mb-2 flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-2xl rounded-xl px-4 py-2 shadow-md ${
          isUser
            ? "bg-green-200 text-black"
            : "bg-gray-100 text-black"
        }`}
      >
        {text && <div className="chat-text">{text}</div>}
        {image && (
          <div className="chat-image mt-2">
            <img
              src={image}
              alt="Uploaded content"
              className="rounded-lg max-h-40"
            />
          </div>
        )}

        {/* ✅ Only show for bot messages */}
        {!isUser && <RaiseTicketDialog recordId="12345" open={false} onClose={function (): void {
          throw new Error("Function not implemented.");
        } }  />}
      </div>
    </div>
  );
};

export default ChatMessage;
