import { NextRequest, NextResponse } from "next/server";
import { parseImage } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "이미지 데이터가 없습니다." }, { status: 400 });
    }
    // data URL ("data:image/jpeg;base64,...") 에서 mime 과 base64 분리
    const match = image.match(/^data:(.+?);base64,(.*)$/);
    const mimeType = match ? match[1] : "image/jpeg";
    const base64 = match ? match[2] : image;

    const fallbackYear = new Date().getFullYear();
    const result = await parseImage(base64, mimeType, fallbackYear);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
