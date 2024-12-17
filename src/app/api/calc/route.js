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
  const { payer, amnt, excludes } = body;

  const query = {};
  const query2 = {};

  if (excludes?.length > 0) Object.assign(query, { payer: { $nin: excludes } });
  if (excludes?.length > 0) Object.assign(query2, { payer: { $in: excludes } });

  const client = await clientPromise;
  const db = client.db("lunch");
  let clgs = await db
    .collection("clgs")
    .find({
      ...query,
    })
    .toArray();

  let exclPrsns = await db
    .collection("clgs")
    .find({
      ...query2,
    })
    .toArray();

  if (excludes?.length > 0) exclPrsns = exclPrsns;
  else exclPrsns = [];

  // console.log(exclPrsns, "expr");

  const avg = Math.round(amnt / clgs?.length);
  const payerProf = clgs?.find((clg) => clg.payer === payer);

  try {
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

    // const finalData = [...clgs, ...exclPrsns]?.sort((a, b) => {
    //   return b.payer - a.payer;
    // });
    // console.log([...clgs, ...exclPrsns]);
    const data = [...clgs, ...exclPrsns];

    const sortedData = data.sort((a, b) => a.payer.localeCompare(b.payer));

    return NextResponse.json({ success: true, data: sortedData });
  } catch (error) {
    return NextResponse.json({ success: false, data: [] });
  }
}
