import { Link } from "react-router-dom";

function Home() {
  const userJSON = localStorage.getItem("user");
  const user = userJSON ? JSON.parse(userJSON) : null;

  return (
    <div
    
      className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1920&q=80')",
      }}
    >
      <div className="bg-black/60 rounded-2xl p-8 max-w-2xl mx-4 text-center border border-white/10 text-white">
        <h1 className="text-4xl font-bold mb-3">
          Welcome {user?.username ? `, ${user.username}` : ""}
        </h1>

        <p className="text-lg opacity-90">
          Upload receipts to auto-extract totals, categorize spending, and get
          budget tips.
        </p>
        <p className="mt-2 opacity-80">
          Use the dashboard to upload receipts and see analytics.
        </p>

        <div className="mt-4">
          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
