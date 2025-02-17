async function getData() {
    const res = await fetch(`https://lnch-rho.vercel.app/api/history`, { cache: "no-store" });
    const data = await res.json();
    return data?.data;
}

export default async function History() {
    const data = await getData();

    // Get last X days (or set a fixed number)
    const lastDays = Math.ceil(data?.length / 4); 

    return (
        <div className="container mx-auto p-4 mb-8">
            <h1 className="text-2xl font-bold mb-4">Last {lastDays} Days History</h1>
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left font-medium text-gray-600">ID</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Consumers</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Paid By</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Paid Date</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item) => (
                        <tr key={item._id} className="border-b border-gray-200">
                            <td className="px-4 py-2 text-gray-700">{item?.id}</td>
                            <td className="px-4 py-2 text-gray-700">{item?.payer}</td>
                            <td className="px-4 py-2 text-gray-700">
                                {/* Show consumers as comma-separated list */}
                                {item.consmr.map((cons, idx) => (
                                    <span key={idx}>
                                        {cons?.n} ({cons?.amnt}),{" "}
                                    </span>
                                ))}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                                {item?.paidBy?.payer} - {item?.paidBy?.amount}
                            </td>
                            <td className="px-4 py-2 text-gray-700">
                                {/* Only show the date without the time */}
                                {new Date(item?.createdAt)?.toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
