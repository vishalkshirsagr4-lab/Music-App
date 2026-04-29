import { useEffect, useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import Layout from "../components/Layout";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("requests");

  const loadData = async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        API.get("/admin/artist-requests"),
        API.get("/admin/users")
      ]);
      setRequests(r1.data.requests || []);
      setUsers(r2.data.users || []);
    } catch {
      toast.error("Failed to load data", {
        style: { background: "#282828", color: "#fff" }
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id) => {
    try {
      const res = await API.post("/admin/approve-artist/" + id);
      toast.success(res.data.message, {
        style: { background: "#282828", color: "#fff" }
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", {
        style: { background: "#282828", color: "#fff" }
      });
    }
  };

  const reject = async (id) => {
    try {
      const res = await API.post("/admin/reject-artist/" + id);
      toast.success(res.data.message, {
        style: { background: "#282828", color: "#fff" }
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", {
        style: { background: "#282828", color: "#fff" }
      });
    }
  };

  const statusBadge = (s) => {
    const c = "px-2 py-1 text-xs rounded-full ";
    if (s === "pending")
      return <span className={c + "bg-yellow-500/10 text-yellow-400"}>pending</span>;
    if (s === "approved")
      return <span className={c + "bg-green-500/10 text-green-400"}>approved</span>;
    if (s === "rejected")
      return <span className={c + "bg-red-500/10 text-red-400"}>rejected</span>;
    return <span className={c + "bg-gray-500/10 text-gray-400"}>none</span>;
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          Admin Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setTab("requests")}
            className={
              "px-4 py-2 rounded-full text-sm font-medium transition " +
              (tab === "requests"
                ? "bg-[#1db954] text-black"
                : "bg-white/10 text-white hover:bg-white/20")
            }
          >
            Requests ({requests.length})
          </button>

          <button
            onClick={() => setTab("users")}
            className={
              "px-4 py-2 rounded-full text-sm font-medium transition " +
              (tab === "users"
                ? "bg-[#1db954] text-black"
                : "bg-white/10 text-white hover:bg-white/20")
            }
          >
            Users ({users.length})
          </button>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* REQUESTS */}
        {!loading && tab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-10">
                No pending requests
              </p>
            ) : (
              requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-[#121212] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={request.avatar || "https://via.placeholder.com/48"}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">
                        {request.username}
                      </p>
                      <p className="text-gray-500 text-sm truncate">
                        {request.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(request._id)}
                      className="px-4 py-2 bg-[#1db954] text-black rounded-full text-sm font-medium hover:bg-[#1ed760] transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(request._id)}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/20 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* USERS */}
        {!loading && tab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-gray-500">User</th>
                  <th className="pb-3 text-gray-500 hidden sm:table-cell">Email</th>
                  <th className="pb-3 text-gray-500 hidden sm:table-cell">Role</th>
                  <th className="pb-3 text-gray-500 hidden sm:table-cell">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-3">
                      <div className="flex items-start gap-3">
                        <img
                          src={u.avatar || "https://via.placeholder.com/32"}
                          alt=""
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />

                        <div className="w-full">
                          <p className="text-white text-sm font-medium">
                            {u.username}
                          </p>

                          {/* mobile email */}
                          <p className="text-gray-500 text-xs break-all sm:hidden">
                            {u.email}
                          </p>

                          {/* mobile role + status */}
                          <div className="flex gap-3 mt-2 sm:hidden">
                            <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full capitalize">
                              {u.role}
                            </span>
                            {statusBadge(u.artistRequestStatus)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* desktop */}
                    <td className="py-3 text-gray-400 hidden sm:table-cell break-all">
                      {u.email}
                    </td>

                    <td className="py-3 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full capitalize">
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 hidden sm:table-cell">
                      {statusBadge(u.artistRequestStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}