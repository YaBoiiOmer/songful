import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

export async function middleware(request: NextRequest) {
  try {
    const baseUrl = request.nextUrl.origin;
    const { data: settings } = await axios.get(`${baseUrl}/api/settings`);

    if (!settings.spotifyPlaylistUrl) {
      return NextResponse.redirect(new URL("/settings", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/settings|settings).*)"],
};
