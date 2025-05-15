import {NextResponse} from "next/server";

export async function GET(request) {
  const {searchParams} = new URL(request.url);
  const path = searchParams.get("path") || "";

  // Your deployed API URL (set this in Vercel environment variables)
  const API_URL = process.env.API_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${API_URL}/${path}`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({error: "Failed to fetch data"}, {status: 500});
  }
}
