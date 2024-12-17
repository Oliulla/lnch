import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!Array.isArray(body?.updatedData)) {
      return NextResponse.json({
        success: false,
        message: "updatedData must be an array.",
      });
    }

    const client = await clientPromise;
    const db = client.db("lunch");

    const bulkOps = body.updatedData.map((ud) => {
      return {
        updateOne: {
          filter: { id: ud.id },
          update: { $set: { consmr: ud?.consmr } },
        },
      };
    });

    const result = await db.collection("clgs").bulkWrite(bulkOps);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error, "Error in POST function");
    return NextResponse.json({ success: false, message: "An error occurred." });
  }
}
