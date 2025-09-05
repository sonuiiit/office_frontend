"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import RaiseTicketDialog from "@/app/components/RaiseTicketDialog";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "bot";
  text: string;
  image: string | null;
}

interface Ticket {
  recordId: string;
  ticket_text: string;
  ticket_files: string[];
  department: string;
  status: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(false);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [recordId, setRecordId] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    setRecordId(uuidv4());
  }, []);

  const startNewChat = () => {
    setMessages([]);
    setRecordId(uuidv4());
  };

  const sendMessage = async () => {
    if (loading || (!inputText.trim() && !file)) return;
    setLoading(true);
 setInputText("");
     setFile(null);
    const userMessage: Message = {
      sender: "user",
      text: inputText,
      image: file ? URL.createObjectURL(file) : null,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/chat/answer_chat`,
        {
          recordId,
          user_message: inputText,
        }
      );
  
      const botReply: string = response.data.response || "No response received";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, image: null },
      ]);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Error: Unable to get response from server.",
          image: null,
        },
      ]);
    } finally {
   
    
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/chat/get_all_tickets`
      );
      setTickets(response.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-3 bg-[#a20e37] border-b shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/pnb.png" alt="PNB Logo" className="w-20 h-10" />
          <span className="text-lg font-semibold text-white">
            PNB CHD AI Chatbot
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            onClick={startNewChat}
          >
            🔄 New Chat
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => {
              fetchTickets();
              setIsTicketsOpen(true);
            }}
          >
            🎟️ Tickets
          </Button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.text}</p>

              {msg.image && (
                <img
                  src={msg.image}
                  alt="uploaded"
                  className="mt-2 w-40 h-40 object-cover rounded"
                />
              )}

              {msg.sender === "bot" && i === messages.length - 1 && (
                <button
                  onClick={() => setOpenDialog(true)}
                  className="mt-3 w-full bg-red-600 text-white text-sm font-medium px-3 py-2 rounded-md hover:bg-red-700"
                >
                  🚨 Issue not resolved? Raise a problem
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Improved Skeleton Loader */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3 w-48 space-y-2 animate-pulse">
              <div className="h-3 w-5/6 bg-gray-300 rounded-md" />
              <div className="h-3 w-4/6 bg-gray-300 rounded-md" />
              <div className="h-3 w-3/6 bg-gray-300 rounded-md" />
            </div>
          </div>
        )}
      </main>

      {openDialog && (
        <RaiseTicketDialog
          recordId={recordId}
          open={openDialog}
          onClose={() => setOpenDialog(false)}
        />
      )}

      {/* Input */}
      <footer className="flex items-center gap-2 border-t bg-white px-4 py-3">
        <Textarea
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="flex-1 resize-none min-h-[50px]"
        />

        <Button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4"
        >
          Send
        </Button>
      </footer>

      {/* Tickets Sidebar */}
      <Sheet open={isTicketsOpen} onOpenChange={setIsTicketsOpen}>
        <SheetContent side="right" className="p-6 w-[420px] bg-gray-50">
          <SheetHeader>
            <SheetTitle className="text-xl font-bold text-gray-800">
              🎟️ Support Tickets
            </SheetTitle>
            <p className="text-sm text-gray-500">
              Here’s a list of all raised tickets.
            </p>
          </SheetHeader>

          {loadingTickets ? (
            <p className="mt-6 text-gray-600">⏳ Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="mt-6 text-gray-500 text-center">No tickets found.</p>
          ) : (
            <div className="mt-6 space-y-3 max-h-[80vh] overflow-y-auto pr-2">
              {tickets.map((ticket) => {
                const isOpen = expandedTicket === ticket.recordId;
                return (
                  <motion.div
                    key={ticket.recordId}
                    layout
                    className="bg-white rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    {/* Card Header */}
                    <div
                      className="flex items-center justify-between p-4"
                      onClick={() =>
                        setExpandedTicket(isOpen ? null : ticket.recordId)
                      }
                    >
                      <span className="text-xs font-mono text-gray-500">
                        #{ticket.recordId.slice(0, 8)}...
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {ticket.department}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            ticket.status === "Open"
                              ? "bg-yellow-100 text-yellow-700"
                              : ticket.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : ticket.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {ticket.status || "Open"}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Content */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 space-y-3 text-sm"
                        >
                          <p className="text-gray-800 leading-relaxed">
                            {ticket.ticket_text}
                          </p>

                          {ticket.ticket_files.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {ticket.ticket_files.map((file, i) =>
                                file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                  <a
                                    key={i}
                                    href={file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={file}
                                      alt={`file-${i}`}
                                      className="w-full h-20 rounded-md border object-cover cursor-pointer hover:opacity-80 transition"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    key={i}
                                    href={file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="col-span-3 flex items-center gap-2 text-xs text-blue-600 hover:underline"
                                  >
                                    📄 File {i + 1}
                                  </a>
                                )
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default App;
