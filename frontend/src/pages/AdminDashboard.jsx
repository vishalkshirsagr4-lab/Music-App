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
      toast.error("Failed to load data", { style: { background: "#282828", color: "#fff" } });
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const approve = async (id) => {
    try {
      const res = await API.post("/admin/approve-artist/" + id);
      toast.success(res.data.message, { style: { background: "#282828", color: "#fff" } });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", { style: { background: "#282828", color: "#fff" } });
    }
  };

  const reject = async (id) => {
    try {
      const res = await API.post("/admin/reject-artist/" + id);
      toast.success(res.data.message, { style: { background: "#282828", color: "#fff" } });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed", { style: { background: "#282828", color: "#fff" } });
    }
  };

  const statusBadge = (s) => {
    const c = "px-2 py-1 text-xs rounded-full ";
    if (s === "pending") return <span className={c + "bg-yellow-500/10 text-yellow-400"}>pending</span>;
    if (s === "approved") return <span className={c + "bg-green-500/10 text-green-400"}>approved</span>;
    if (s === "rejected") return <span className={c + "bg-red-500/10 text-red-400"}>rejected</span>;
    return <span className={c + "bg-gray-500/10 text-gray-400"}>none</span>;
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab("requests")} className={"px-4 py-2 rounded-full text-sm font-medium transition " + (tab === "requests" ? "bg-[#1db954] text-black" : "bg-white/10 text-white hover:bg-white/20")}>
            Requests ({requests.length})
          </button>
          <button onClick={() => setTab("users")} className={"px-4 py-2 rounded-full text-sm font-medium transition " + (tab === "users" ? "bg-[#1db954] text-black" : "bg-white/10 text-white hover:bg-white/20")}>
            Users ({users.length})
          </button>
        </div>
        {loading && <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" /></div>}
        {!loading && tab === "requests" && (
          <div className="space-y-4">
            {requests.length === 0 ? <p className="text-gray-500 text-center py-10">No pending requests</p> : requests.map((request) => (
              <div key={request._id} className="bg-[#121212] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={request.avatar || "https://via.placeholder.com/48"} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div><p className="text-white font-medium">{request.username}</p><p className="text-gray-500 text-sm">{request.email}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approve(request._id)} className="px-4 py-2 bg-[#1db954] text-black rounded-full text-sm font-medium hover:bg-[#1ed760] transition">Approve</button>
                  <button onClick={() => reject(request._id)} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-sm font-medium hover:bg-red-500/20 transition">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && tab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/10"><th className="pb-3 text-gray-500 text-sm">User</th><th className="pb-3 text-gray-500 text-sm">Email</th><th className="pb-3 text-gray-500 text-sm">Role</th><th className="pb-3 text-gray-500 text-sm">Status</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="py-3 flex items-center gap-3"><img src={u.avatar || "https://via.placeholder.com/32"} alt="" className="w-8 h-8 rounded-full object-cover" /><span className="text-white text-sm">{u.username}</span></td>
                    <td className="py-3 text-gray-400 text-sm">{u.email}</td>
                    <td className="py-3"><span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full capitalize">{u.role}</span></td>
                    <td className="py-3">{statusBadge(u.artistRequestStatus)}</td>
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
