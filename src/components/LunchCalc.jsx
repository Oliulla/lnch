"use client";
import { clgs } from "@/lib/clgs";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

function calc(payer, amnt, db = clgs, exclds = []) {
  const avg = amnt / 4;
  const payerRecord = db.find((c) => c.payer === payer);
  if (!payerRecord) return;

  const loanRecord = db.find((c) => c.payer === "0");

  payerRecord.consmr.forEach((consumer) => {
    if (!exclds.includes(consumer.n)) {
      if (loanRecord) {
        const loanConsumer = loanRecord.consmr.find((l) => l.n === payer);
        if (loanConsumer && loanConsumer.amnt > 0) {
          const deduction = Math.min(avg, loanConsumer.amnt);
          loanConsumer.amnt -= deduction;
          consumer.amnt += deduction;
        } else {
          consumer.amnt += avg;
        }
      } else {
        consumer.amnt += avg;
      }
    }
  });

  return db;
}

const LunchCalc = () => {
  const { register, handleSubmit, watch } = useForm();
  const [updatedData, setUpdatedData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = (data) => {
    const { payer, amount, excludes } = data;
    const excludesArray = excludes ? excludes : [];
    const result = calc(payer, parseFloat(amount), [...clgs], excludesArray);
    setUpdatedData(result);
    setIsModalOpen(true);
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
            <h2 className="text-lg font-semibold mb-4">Updated Data Preview</h2>
            <pre className="bg-black text-white p-3 rounded overflow-x-auto text-sm">
              {JSON.stringify(updatedData, null, 2)}
            </pre>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 w-full sm:w-auto px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LunchCalc;
