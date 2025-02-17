"use client";
import { clgs } from "@/lib/clgs";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

const LunchCalc = () => {
  const { register, handleSubmit, watch } = useForm();
  const [updatedData, setUpdatedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payerId, setPayerId] = useState("");
  const [paidAmnt, setAmount] = useState(0);

  const onSubmit = async (data) => {
    const { payer, amount, excludes } = data;
    setPayerId(payer);
    setAmount(amount);

    const response = await fetch("/api/calc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payer, amnt: amount, excludes }),
    });

    const result = await response.json();

    setUpdatedData(result?.data);
    setIsModalOpen(true);
  };

  const udpateDataHandler = async () => {
    const response = await fetch("/api/calc/update-bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updatedData, payerId, amount: paidAmnt }),
    });

    const result = await response.json();
    if (result) {
      setIsModalOpen(false);
    }
  };

  const excludesWatch = watch("excludes", []);

  return (
    <div className="container min-h-screen p-4 sm:p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="mb-5">
        {/* Payer Dropdown */}
        <div className="mb-4">
          <label htmlFor="payer" className="block text-sm font-medium mb-2">
            Payer:
          </label>
          <select
            id="payer"
            {...register("payer", { required: true })}
            className="w-full p-2 border border-gray-300 rounded bg-black text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              Select Payer
            </option>
            {clgs.map((payer) => (
              <option key={payer.payer} value={payer.payer}>
                {payer.payer}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount:
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            {...register("amount", { required: true })}
            placeholder="Enter amount"
            className="w-full p-2 border border-gray-300 rounded bg-black text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Excludes Checkboxes */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-3">Excludes:</label>
          <div className="flex flex-wrap gap-2">
            {clgs.map((payer) => (
              <label key={payer.payer} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={payer.payer}
                  {...register("excludes")}
                  className="form-checkbox h-4 w-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">{payer.payer}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Calculate
        </button>
      </form>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="modal-content bg-black p-5 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Date: {new Date().toLocaleDateString()}
            </h2>
            {/* <pre className="bg-black text-white p-3 rounded overflow-x-auto text-sm">
              {JSON.stringify(updatedData, null, 2)}
            </pre> */}
            {updatedData?.length
              ? updatedData?.map((upd, idx) => {
                  return (
                    <div key={idx} className="mb-3">
                      <div key={upd._id}>
                        <p className="font-semibold">{upd.payer} Gets To:</p>
                        <div>
                          {upd?.consmr?.map((c, idx) => (
                            <div key={idx}>
                              <span>
                                {c.n}: {c.amnt}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <hr />
                    </div>
                  );
                })
              : ""}
            {/* <pre className="bg-black text-white p-3 rounded overflow-x-auto text-sm">
                {JSON.stringify(updatedData, null, 2)}
              </pre> */}
            <div className="flex justify-between gap-x-8 items-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full sm:w-auto px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={udpateDataHandler}
                className="mt-4 w-full sm:w-auto px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LunchCalc;
