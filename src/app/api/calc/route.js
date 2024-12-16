import clientPromise from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("lunch");
    const clgs = await db.collection("clgs").find({}).toArray();

    return NextResponse.json({ success: true, clgs });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const body = await req.json();
  const { payer, amnt } = body;
  const client = await clientPromise;
  const db = client.db("lunch");
  let clgs = await db.collection("clgs").find({}).toArray();

  const avg = amnt / 4;
  const payerProf = clgs?.find((clg) => clg.payer === payer);

  for (let cl of clgs) {
    const debtTo = cl?.consmr?.find((c) => c?.n === payer && c.amnt > 0);

    if (debtTo) {
      if (debtTo.amnt - avg >= 0) {
        debtTo.amnt -= avg;
      } else {
        const updConsmr = payerProf?.consmr?.find((c) => c.n === cl.payer);

        if (updConsmr) {
          updConsmr.amnt = Math.abs(debtTo.amnt - avg);
          debtTo.amnt = 0;
        }
      }
    } else {
      const updConsmr = payerProf?.consmr?.find((c) => c.n === cl.payer);
      if (updConsmr) {
        updConsmr.amnt += avg;
      }
    }
  }

  return NextResponse.json({ success: true, data: clgs });
}
