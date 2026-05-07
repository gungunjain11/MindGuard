import { NextResponse } from "next/server";
import { analyzeJournal } from "../../../../src/lib/server/routes/analyzeJournal";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { uid, journalId, journalText } = data;
    
    if (!uid || !journalId || !journalText) {
      return NextResponse.json({ error: "Missing required fields: uid, journalId, or journalText" }, { status: 400 });
    }

    const result = await analyzeJournal({ uid, journalId, journalText });
    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("API /journal/analyze Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
