import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db("lunch");

    const histories = await db
      .collection("histories")
      .find({})
      .sort({ createdAt: -1 })
      .limit(16)
      .sort({ id: 1 })
      .toArray();

    return NextResponse.json({ success: true, data: histories });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
