import { getSettings, updateSettings } from "@/use-cases/settings";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const newSettings = await request.json();
  await updateSettings(newSettings);
  return NextResponse.json(newSettings);
}
