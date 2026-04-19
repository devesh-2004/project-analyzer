import { NextRequest, NextResponse } from "next/server";
import { analyzeResumePDF } from "@/modules/resume-analyzer/services/resume-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfBase64 } = body;

    if (!pdfBase64) {
      return NextResponse.json({ error: "PDF base64 data is required" }, { status: 400 });
    }
    
    // Some basic validation
    // The client sends `pdfBase64` which might have a standard Data URI prefix.
    // e.g. "data:application/pdf;base64,JVBERi0xLjQK..." 
    let base64Data = pdfBase64;
    const prefix = "data:application/pdf;base64,";
    if (base64Data.startsWith(prefix)) {
        base64Data = base64Data.slice(prefix.length);
    }

    const analysis = await analyzeResumePDF(base64Data);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Resume Analysis API Error:", error);
    return NextResponse.json({
        error: "Internal Server Error",
        details: error.message
    }, { status: 500 });
  }
}
