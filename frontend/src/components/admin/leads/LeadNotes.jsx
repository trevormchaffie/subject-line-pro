// src/components/admin/leads/LeadNotes.jsx
import { useState } from "react";
import { format } from "date-fns";
import leadService from "../../../services/leadService";

const LeadNotes = ({ leadId, initialNotes = [] }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle new note submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newNote.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await leadService.addNote(leadId, newNote);
      console.log("Note added, server response:", result);
      
      // If result.data is an array, use it; otherwise, check if it's in result
      if (Array.isArray(result.data)) {
        setNotes(result.data);
      } else if (Array.isArray(result)) {
        setNotes(result);
      } else {
        console.error("Unexpected response format:", result);
        // Try to handle format issues gracefully - keep existing notes if we can't parse the response
      }
      
      setNewNote("");
    } catch (err) {
      setError("Failed to add note. Please try again.");
      console.error("Error adding note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // To fix the issue with button disappearing when typing
  const buttonVisible = newNote.trim().length > 0;

  return (
    <div>
      <h4 className="text-md font-medium text-gray-700 mb-2">Notes</h4>

      {/* Add new note form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this lead..."
            rows="3"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={isSubmitting}
          ></textarea>
        </div>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white ${
              isSubmitting || !buttonVisible
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Note"
            )}
          </button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No notes yet</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-900">{note.content}</p>
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>
                  {note.createdBy
                    ? `Added by ${note.createdBy}`
                    : "System note"}
                </span>
                <span>
                  {format(new Date(note.createdAt), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeadNotes;
