"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ChatHeader: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 via-white to-yellow-100">
      {/* Top Header */}
      <div className="chat-header justify-center flex items-center gap-2 bg-[#a20e37] py-4 shadow-md">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          src="/pnb.png"
          alt="PNB Logo"
          className="w-12 h-12 object-contain drop-shadow-md"
        />
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-2xl font-bold text-white px-3 py-1 rounded-lg"
        >
          PNB CHD AI Chatbot
        </motion.div>
      </div>

      {/* Centered Section */}
      <div className="flex flex-1 justify-center items-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white shadow-xl rounded-2xl p-10 flex flex-col items-center gap-8 max-w-lg w-full"
        >
          {/* Tagline */}
          <p className="text-gray-600 text-center text-lg font-medium">
            🚀 Choose your role and explore 
          </p>

          {/* Buttons */}
          <div className="flex gap-6">
            <Button
              onClick={() => router.push("/user")}
              className="px-6 py-3 text-lg rounded-xl shadow-md transition transform hover:scale-105 hover:shadow-lg"
            >
              User
            </Button>
            <Button
              onClick={() => router.push("/department")}
              className="px-6 py-3 text-lg rounded-xl shadow-md transition transform hover:scale-105 hover:shadow-lg"
            >
              Department
            </Button>
            <Button
              onClick={() => router.push("/admin")}
              className="px-6 py-3 text-lg rounded-xl shadow-md transition transform hover:scale-105 hover:shadow-lg"
            >
              Admin
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChatHeader;
