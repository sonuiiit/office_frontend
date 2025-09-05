"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Ticket {
  ticket_files: string[];
  department: string;
  ticket_text: string;
  recordId: string;
  status?: string;
}

const departments = ["FI", "Network", "ATM Switch", "Mail Messaging"];
const statusOptions = ["Open", "Resolved"];

const DepartmentTickets: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);

  // Ticket update dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("");

  // AI explanation dialog
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);

  // Track which ticket is expanded
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDept) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/department/get_all_tickets_for_department?department=${encodeURIComponent(
            selectedDept
          )}`
        );
        const data = await res.json();
        setTickets(data);
      } catch (err) {
        console.error("Error fetching tickets:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [selectedDept]);

  const handleUpdate = async () => {
    if (!selectedTicket || !status) {
      toast("Please select a status and add remarks");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/department/update_ticket_status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordId: selectedTicket.recordId,
            remarks,
            status,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast("✅ Ticket updated successfully");
        setOpenDialog(false);
        setRemarks("");
        setStatus("");
        setTickets((prev) =>
          prev.map((t) =>
            t.recordId === selectedTicket.recordId
              ? {
                  ...t,
                  status,
                  ticket_text: t.ticket_text + `\n\n[Updated: ${remarks}]`,
                }
              : t
          )
        );
      } else {
        alert(`❌ Failed: ${data.message || "Something went wrong"}`);
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error updating ticket");
    }
  };

  const handleGetAIExplanation = async (ticket: Ticket) => {
    setAiLoadingId(ticket.recordId);
    setAiExplanation("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/department/get_ai_explanation_for_ticket?recordId=${ticket.recordId}`
      );
      const data = await res.json();
      setAiExplanation(data || "No explanation available.");
      setAiDialogOpen(true);
    } catch (err) {
      console.error("Error fetching AI explanation:", err);
      setAiExplanation("⚠️ Error while fetching explanation.");
      setAiDialogOpen(true);
    } finally {
      setAiLoadingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="flex justify-between items-center px-6 py-3 bg-[#a20e37] border-b shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="flex items-center gap-2">
          <img src="/pnb.png" alt="PNB Logo" className="w-20 h-10" />
          <span className="text-lg font-semibold text-white">
            PNB CHD AI Chatbot
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24 px-4 max-w-4xl mx-auto space-y-6">
        <Select onValueChange={(val) => setSelectedDept(val)}>
          <SelectTrigger className="w-full bg-white shadow">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {loading && <p className="text-gray-500">Loading tickets...</p>}
        {!loading && selectedDept && tickets.length === 0 && (
          <p className="text-gray-500">No tickets found for {selectedDept}</p>
        )}

        <div className="grid gap-3 ">
          {tickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket.recordId;
            return (
              <Card
                key={ticket.recordId}
                className="rounded-lg  shadow-sm hover:shadow-md transition"
              >
                <CardContent className="p-3 space-y-2">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h2 className="font-medium text-sm text-blue-800">
                      {ticket.department} - #{ticket.recordId}
                    </h2>
                    <Badge
                      className={`${getStatusStyle(
                        ticket.status || "Open"
                      )} px-2 py-0.5 rounded-full text-xs`}
                    >
                      {ticket.status || "Open"}
                    </Badge>
                  </div>

                  {/* Ticket Text with Animation */}
                  <AnimatePresence initial={false}>
                    <motion.p
                      key={isExpanded ? "expanded" : "collapsed"}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-700 whitespace-pre-line text-sm overflow-hidden"
                    >
                      {isExpanded
                        ? ticket.ticket_text
                        : ticket.ticket_text.length > 80
                        ? ticket.ticket_text.slice(0, 80) + "..."
                        : ticket.ticket_text}
                    </motion.p>
                  </AnimatePresence>

                  {/* Expand toggle with icon */}
                  {ticket.ticket_text.length > 80 && (
                    <button
                      onClick={() =>
                        setExpandedTicket(
                          isExpanded ? null : ticket.recordId
                        )
                      }
                      className="flex items-center justify-end gap-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full px-3 py-1 w-fit ml-auto transition"
                    >
                      {isExpanded ? "Show Less" : "Read More"}
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  )}

                  {/* Files (only when expanded) */}
                  {isExpanded && ticket.ticket_files.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {ticket.ticket_files.map((file, i) => (
                        <a
                          key={i}
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                        >
                          📎 File {i + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setOpenDialog(true);
                      }}
                    >
                      ✏️ Update
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => handleGetAIExplanation(ticket)}
                      disabled={aiLoadingId === ticket.recordId}
                    >
                      🤖{" "}
                      {aiLoadingId === ticket.recordId
                        ? "Loading..."
                        : "AI Explanation"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Ticket Update Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <p className="text-gray-700 whitespace-pre-line text-sm">
                <strong>Ticket:</strong> {selectedTicket.ticket_text}
              </p>
              <Select onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="w-full bg-white shadow">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Add remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white"
                >
                  Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Explanation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Explanation</DialogTitle>
            <DialogDescription className="whitespace-pre-line text-sm">
              {aiExplanation}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentTickets;
