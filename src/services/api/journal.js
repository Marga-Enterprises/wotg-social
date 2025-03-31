import { GET, POST, PUT, DELETE } from "../request";
import * as methods from "../../utils/methods";

// 📘 Get paginated journals (with optional user filter)
export async function getJournals(payload) {
  const params = methods.convertQueryString(payload); // { pageIndex, pageSize, userId? }
  return GET(`/journals?${params}`);
}

// 📝 Get a single journal by ID
export async function getJournalById(payload) {
  return GET(`/journals/${payload.id}`);
}

// ✏️ Create a journal
export async function createJournal(payload) {
  return POST("/journals", payload); // { book, chapter, verse, content, private? }
}

// 🔁 Update a journal (only owner can update)
export async function updateJournal(payload) {
  return PUT(`/journals/${payload.id}`, payload); // <-- Pass the full payload here
}


// ❌ Delete a journal (only owner can delete)
export async function deleteJournal(payload) {
  return DELETE(`/journals/${payload.id}`);
}
