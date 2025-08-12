import { useEffect, useRef, useState } from "react";
import { api } from "../utils/api";

function Dashboard() {

  // UI state
  const [file, setFile] = useState(null);
  const [upErr, setUpErr] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // data lists
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);

  // hidden file input
  const inputRef = useRef(null);

  // fetch expenses , summary
  const load = async () => {
    try {
      const [e, s] = await Promise.all([api.expenses(), api.summary()]);
      setExpenses(e);
      setSummary(s);
    } catch (err) {
      console.error("load error:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePickOrUpload = async () => {
    setUpErr("");
    setMessage("");

    if (!file) {
      inputRef.current?.click();
      return;
    }

    try {
      setUploading(true);

      const presigned = await api.presign(file);

      await api.uploadToS3(presigned, file);

      const saved = await api.confirm({ key: presigned.key, file });

      setMessage(
        `Saved: ${saved.merchant} - $${Number(saved.total || 0).toFixed(2)}`
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = ""; 
      await load();
    } catch (e) {
      setUpErr(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setUpErr("File too large (max 10MB).");
      e.target.value = "";
      return;
    }
    setUpErr("");
    setFile(f);
  };

  const grand = summary.reduce((a, s) => a + (s.total || 0), 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Expense Dashboard</h1>

      {/* Upload card */}
      <div className="rounded-2xl border border-gray-700 p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Upload Receipt</h2>

        {/* Hidden input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 rounded-xl border border-gray-700 hover:bg-gray-800"
          >
            Choose File
          </button>
          <span className="opacity-80 text-sm">
            {file ? file.name : "No file chosen"}
          </span>
        </div>

        <button
          onClick={handlePickOrUpload}
          disabled={uploading}
          className={`px-4 py-2 rounded-xl ${
            uploading
              ? "opacity-50 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {file
            ? uploading
              ? "Uploading..."
              : "Upload & Analyze"
            : "Select a File"}
        </button>

        {/* Messages */}
        {upErr && <div className="mt-2 text-red-400">{upErr}</div>}
        {message && <div className="mt-2 text-emerald-400">{message}</div>}

        <p className="text-sm opacity-70 mt-2">
          Local dev can use mock OCR. For real OCR, set AWS creds and{" "}
          <code>USE_MOCK_OCR=false</code>.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
      
        <div className="rounded-2xl border border-gray-700 p-4">
          <h3 className="font-semibold mb-2">By Category</h3>
          <ul className="space-y-2">
            {summary.map((s) => (
              <li key={s.category} className="flex justify-between">
                <span>{s.category}</span>
                <span>
                  ${(s.total || 0).toFixed(2)} ({s.count})
                </span>
              </li>
            ))}
            <li className="flex justify-between border-t border-gray-700 pt-2 mt-2">
              <strong>Total</strong>
              <strong>${grand.toFixed(2)}</strong>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-700 p-4">
          <h3 className="font-semibold mb-2">Recent Expenses</h3>
          <ul className="space-y-3 max-h-80 overflow-auto">
            {expenses.map((e) => (
              <li
                key={e._id || e.createdAt}
                className="border border-gray-700 rounded-xl p-3"
              >
                <div className="flex justify-between">
                  <span className="font-medium">{e.merchant}</span>
                  <span>${(e.total || 0).toFixed(2)}</span>
                </div>
                <div className="text-sm opacity-80">
                  {e.category} • {new Date(e.date).toLocaleDateString()}
                </div>
                {e.tips?.length ? (
                  <ul className="mt-1 text-sm text-amber-300 list-disc pl-5">
                    {e.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
