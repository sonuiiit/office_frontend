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
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Ticket {
  recordId: string;
  ticket_text: string;
  ticket_files: string[];
  department: string;
  status?: string;
}

const TicketsList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [stringText, setStringText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal for full ticket text
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  const handleAddKnowledge = async () => {
    if (!stringText.trim()) {
      toast("Please enter some text");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { recordId: uuidv4(), string_text: stringText };
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/admin/add_knowledge_to_chatbot`,
        payload
      );

      if (res.data?.status === "success") {
        toast("✅ Knowledge added successfully!");
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#a20e37] w-full fixed top-0 left-0 z-50 text-white flex items-center justify-between p-4 shadow-md">
        <div className="flex items-center gap-3">
          <img src="/pnb.png" alt="PNB" className="h-10 w-20" />
          <h1 className="text-lg font-semibold tracking-wide">
            PNB Tickets Dashboard
          </h1>
        </div>
        <Button
          variant="secondary"
          className="bg-white text-[#a20e37] hover:bg-gray-100"
          onClick={() => setOpenDialog(true)}
        >
          ➕ Add Knowledge
        </Button>
      </div>

      {/* Tickets Area */}
      <div className="flex-1 mt-24 max-w-5xl mx-auto p-4 space-y-4">
        {loading ? (
          <p className="text-gray-500 text-center">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-500 text-center">No tickets found.</p>
        ) : (
          tickets.map((ticket) => {
            const status = ticket.status || "Open";
            const statusColor =
              status === "Resolved"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700";

            return (
              <Card
                key={ticket.recordId}
                className="shadow-sm border border-gray-200 rounded-xl hover:shadow-md transition-all"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                      {ticket.department}
                    </Badge>
                    <Badge className={`${statusColor} px-3 py-1 rounded-full`}>
                      {status}
                    </Badge>
                  </div>

                  {/* Ticket Text (truncated) */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {ticket.ticket_text.length > 120
                      ? ticket.ticket_text.slice(0, 120) + "..."
                      : ticket.ticket_text}
                  </p>
                  {ticket.ticket_text.length > 120 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 text-xs p-0 hover:underline"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      🔍 Read More
                    </Button>
                  )}

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
                            className="relative group"
                          >
                            <img
                              src={file}
                              alt={`ticket-file-${i}`}
                              className="w-20 h-20 rounded-md border object-cover shadow-sm group-hover:scale-105 transition-transform"
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
            );
          })
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
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
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

      {/* Read More Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-sm">
              {selectedTicket?.ticket_text}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket?.ticket_files.length ? (
            <div className="flex flex-wrap gap-3 mt-3">
              {selectedTicket.ticket_files.map((file, i) =>
                file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    key={i}
                    src={file}
                    alt={`file-${i}`}
                    className="w-24 h-24 rounded-md border object-cover"
                  />
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
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsList;
