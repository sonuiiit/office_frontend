"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Ticket {
  recordId: string;
  ticket_text: string;
  ticket_files: string[];
  department: string;
}

const TicketsList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [stringText, setStringText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/admin/get_all_tickets`
        );
        setTickets(res.data || []);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // Handle Add Knowledge Submit
  const handleAddKnowledge = async () => {
    if (!stringText.trim()) {
      alert("Please enter some text");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        recordId: uuidv4(),
        string_text: stringText,
      };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/admin/add_knowledge_to_chatbot`,
        payload
      );

      if (res.data?.status === "success") {
        alert("✅ Knowledge added successfully!");
        setOpenDialog(false);
        setStringText("");
      } else {
        alert("❌ Failed to add knowledge");
      }
    } catch (error) {
      console.error("Error adding knowledge:", error);
      alert("⚠️ Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-[#a20e37] text-white flex items-center justify-between p-4 shadow">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <img src="/pnb.png" alt="PNB" className="h-10 w-20" />
          <h1 className="text-lg font-semibold">PNB Tickets Dashboard</h1>
        </div>

        {/* Right Section - Button */}
        <Button
          variant="secondary"
          className="bg-white text-[#a20e37] hover:bg-gray-100"
          onClick={() => setOpenDialog(true)}
        >
          ➕ Add Knowledge
        </Button>
      </div>

      {/* Tickets Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <p className="text-gray-500">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-500">No tickets found.</p>
        ) : (
          tickets.map((ticket) => (
            <Card key={ticket.recordId} className="shadow">
              <CardContent className="p-4 space-y-2">
                {/* Ticket text */}
                <h2 className="text-base font-semibold text-gray-800">
                  {ticket.ticket_text}
                </h2>

                {/* Department */}
                <p className="text-sm text-gray-600">
                  Department:{" "}
                  <span className="font-medium">{ticket.department}</span>
                </p>

                {/* Files */}
                {ticket.ticket_files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
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
                            alt={`ticket-file-${i}`}
                            className="w-16 h-16 rounded border object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          key={i}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-xs underline"
                        >
                          📄 File {i + 1}
                        </a>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add Knowledge Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Knowledge to Chatbot</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter knowledge text..."
              value={stringText}
              onChange={(e) => setStringText(e.target.value)}
              rows={5}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddKnowledge}
                disabled={submitting}
                className="bg-green-600 text-white"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsList;
