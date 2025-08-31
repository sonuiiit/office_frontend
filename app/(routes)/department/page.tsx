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

interface Ticket {
  ticket_files: string[];
  department: string;
  ticket_text: string;
  recordId: string;
}

const departments = ["Finance", "Network", "ATM switch", "Mail Messaging"];
const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

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

  // Fetch tickets when department changes
  useEffect(() => {
    if (!selectedDept) return;

    const fetchTickets = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://office-project-i75v.onrender.com/department/get_all_tickets_for_department?department=${encodeURIComponent(
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

  // Submit ticket update
  const handleUpdate = async () => {
    if (!selectedTicket || !status) {
      alert("Please select a status and add remarks");
      return;
    }

    try {
      const res = await fetch(
        "https://office-project-i75v.onrender.com/department/update_ticket_status",
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
        alert("✅ Ticket updated successfully");
        setOpenDialog(false);
        setRemarks("");
        setStatus("");
        // Refresh tickets after update
        setTickets((prev) =>
          prev.map((t) =>
            t.recordId === selectedTicket.recordId
              ? {
                  ...t,
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

  // Get AI explanation
  const handleGetAIExplanation = async (ticket: Ticket) => {
    setAiLoadingId(ticket.recordId);
    setAiExplanation("");
    try {
      const res = await fetch(
        `https://office-project-i75v.onrender.com/department/get_ai_explanation_for_ticket?recordId=${ticket.recordId}`
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
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
        {/* Department Dropdown */}
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

        {/* Tickets */}
        {loading && <p className="text-gray-500">Loading tickets...</p>}

        {!loading && selectedDept && tickets.length === 0 && (
          <p className="text-gray-500">No tickets found for {selectedDept}</p>
        )}

        <div className="grid gap-4">
          {tickets.map((ticket, idx) => (
            <Card key={idx} className="rounded-xl shadow hover:bg-gray-50">
              <CardContent className="p-4 space-y-2">
                <h2 className="font-semibold text-lg text-blue-800">
                  {ticket.department} - #{ticket.recordId}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {ticket.ticket_text}
                </p>

                {/* Show files if available */}
                {ticket.ticket_files.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {ticket.ticket_files.map((file, i) => (
                      <a
                        key={i}
                        href={file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                      >
                        📎 {file}
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setOpenDialog(true);
                    }}
                  >
                    ✏️ Update
                  </Button>
                  <Button
                    size="sm"
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
          ))}
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
              <p className="text-gray-700 whitespace-pre-line">
                <strong>Ticket:</strong> {selectedTicket.ticket_text}
              </p>

              {/* Status Dropdown */}
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

              {/* Remarks */}
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
            <DialogDescription className="whitespace-pre-line">
              {aiExplanation}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentTickets;
