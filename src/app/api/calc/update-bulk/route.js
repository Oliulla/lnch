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

    // await db.collection("payers").insertOne(payerHistory);

    const bulkOpsForUpdatingDoc = body.updatedData.map((ud) => {
      return {
        updateOne: {
          filter: { id: ud.id },
          update: { $set: { consmr: ud?.consmr, updatedAt: new Date() } },
        },
      };
    });

    // console.log(body.payerId);

    const bulkOpsForCreateHistory = body.updatedData.map(
      ({ _id, updatedAt, ...rest }) => {
        // console.log({ ...rest }, "rest");
        const payerHistory = {
          payer: body?.payerId,
          amount: Number(body?.amount),
          // createdAt: new Date(),
        };

        return {
          insertOne: {
            userId: _id,
            ...rest,
            paidBy: payerHistory,
            createdAt: new Date(),
          },
        };
      }
    );

    await db.collection("histories").bulkWrite(bulkOpsForCreateHistory);

    const updateRes = await db
      .collection("clgs")
      .bulkWrite(bulkOpsForUpdatingDoc);

    return NextResponse.json({ success: true, data: updateRes });
  } catch (error) {
    console.error(error, "Error in POST function");
    return NextResponse.json({ success: false, message: "An error occurred." });
  }
}
