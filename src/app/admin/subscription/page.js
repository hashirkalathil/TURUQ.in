"use client";

import { useEffect, useState } from "react";
import { Trash2, Mail, Users, UserPlus, UserMinus } from "lucide-react";
import Table from "@/components/admin/ui/Table";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

export default function SubscriptionPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers");
      const data = await res.json();
      if (res.ok) {
        setSubscribers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      addNotification("error", "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this subscriber?")) return;
    try {
      const res = await fetch("/api/admin/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        addNotification("success", "Subscriber removed");
        loadSubscribers();
      }
    } catch (error) {
      addNotification("error", "Failed to remove subscriber");
    }
  };

  const activeCount = subscribers.filter(s => s.status === 'active').length;

  const COLUMNS = [
    {
      key: "email",
      header: "Email Address",
      className: "font-medium",
      render: (s) => s.email,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
          s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {s.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Subscribed On",
      render: (s) => new Date(s.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (s) => (
        <button
          onClick={() => handleDelete(s._id)}
          className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
          title="Remove Subscriber"
        >
          <Trash2 size={18} />
        </button>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-6 pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 uppercase flex items-center gap-2">
            <Mail className="w-6 h-6 text-red-600" />
            Newsletter Subscribers
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your mailing list and audience growth.</p>
        </div>
        
        <div className="flex gap-4">
           <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Total</p>
                <p className="text-xl font-bold">{subscribers.length}</p>
              </div>
           </div>
           <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <UserPlus size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">Active</p>
                <p className="text-xl font-bold">{activeCount}</p>
              </div>
           </div>
        </div>
      </div>

      <Table
        data={subscribers}
        columns={COLUMNS}
        loading={loading}
        searchable
        searchKeys={["email"]}
        onReload={loadSubscribers}
      />
    </div>
  );
}
