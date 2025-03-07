import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({
  isOpen,
  onClose,
}: BugReportModalProps) {
  const { user, session } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !severity) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send bug report to the API
      await axios.post(
        "/api/feedback/bug-report",
        {
          title,
          description,
          steps,
          severity,
        },
        {
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : undefined,
        }
      );

      toast.success("Bug report submitted successfully!");
      onClose();

      // Reset form
      setTitle("");
      setDescription("");
      setSteps("");
      setSeverity("medium");
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast.error("Failed to submit bug report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-xl p-6 max-w-md w-full border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Report a Bug</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Bug Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF63]/50 text-white"
              placeholder="Brief description of the issue"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF63]/50 text-white min-h-[100px]"
              placeholder="Detailed description of the bug"
              required
            />
          </div>

          <div>
            <label
              htmlFor="steps"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Steps to Reproduce
            </label>
            <textarea
              id="steps"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF63]/50 text-white min-h-[80px]"
              placeholder="1. Go to...\n2. Click on...\n3. Observe..."
            />
          </div>

          <div>
            <label
              htmlFor="severity"
              className="block text-sm font-medium text-white/80 mb-1"
            >
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CDFF63]/50 text-white"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 bg-[#CDFF63] hover:bg-[#CDFF63]/90 text-black font-medium rounded-lg transition duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
