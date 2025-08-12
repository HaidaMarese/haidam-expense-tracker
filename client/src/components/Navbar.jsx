import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const BRAND = "HaidaMint"; 

  const canGoBack =
    typeof window !== "undefined" && window.history && window.history.length > 1;

  const goBack = () => (canGoBack ? navigate(-1) : navigate("/"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full py-4 border-b border-gray-800 bg-black/40 backdrop-blur sticky top-0 z-50">
      <div className="w-full px-6 flex items-center justify-between">
       
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className={`px-3 py-1 rounded-lg border border-gray-700 hover:border-gray-500
                        ${canGoBack ? "text-white hover:bg-gray-800" : "opacity-40 cursor-not-allowed"}`}
            aria-label="Go back"
            title="Go back"
          >
            ← Back
          </button>
          <Link to="/" className="font-semibold text-lg">{BRAND}</Link>
        </div>


        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-blue-400">Home</Link>
          <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
          {!token ? (
            <>
              <Link to="/login" className="hover:text-blue-400">Login</Link>
              <Link to="/register" className="hover:text-blue-400">Register</Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
