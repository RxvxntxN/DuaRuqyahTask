import {NextResponse} from "next/server";

// This is a server-side proxy to avoid CORS issues and handle API requests
export async function GET(request) {
  const {searchParams} = new URL(request.url);
  const path = searchParams.get("path") || "";

  // Your actual API URL (this should be set in Vercel environment variables)
  const API_URL = process.env.API_URL || "http://localhost:3001";

  try {
    const response = await fetch(`${API_URL}/${path}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      {error: "Failed to fetch data from API"},
      {status: 500}
    );
  }
}
