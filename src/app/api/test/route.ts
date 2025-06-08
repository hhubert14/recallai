import { NextResponse } from "next/server";
import { getYoutubeTranscript } from "@/data-access/external-apis/get-youtube-transcript";

export async function GET() {
  try {
    const transcript = await getYoutubeTranscript('f2Y_GB2MTmM');
    return NextResponse.json({ transcript });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}