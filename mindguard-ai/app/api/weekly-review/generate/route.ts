import { NextResponse } from "next/server";
import { generateWeeklyReviewOnDemand } from "../../../../src/lib/server/routes/generateWeeklyReviewOnDemand";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { uid } = data;
    
    if (!uid) {
      return NextResponse.json({ error: "Missing required field: uid" }, { status: 400 });
    }

    const result = await generateWeeklyReviewOnDemand(uid);
    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error("API /weekly-review/generate Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
