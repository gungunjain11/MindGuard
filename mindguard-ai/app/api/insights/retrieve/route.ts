import { NextResponse } from "next/server";
import { retrieveSimilarEntries } from "../../../../src/lib/server/routes/retrieveSimilarEntries";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { uid, currentVector, currentJournalId } = data;
    
    if (!uid || !currentVector || !currentJournalId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await retrieveSimilarEntries(uid, currentVector, currentJournalId);
    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("API /insights/retrieve Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
