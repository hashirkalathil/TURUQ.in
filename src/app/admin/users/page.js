"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { PlusCircle, Trash2, Edit, User, LoaderCircle, Eye, EyeOff } from "lucide-react";
import Table from "@/components/admin/ui/Table";
import Modal from "@/components/admin/ui/modal/Modal";
import { useNotification } from "@/components/ui/notification/NotificationProvider";
import { AddUserForm } from "@/components/admin/users/AddUserForm";
import { EditUserForm } from "@/components/admin/users/EditUserForm";

// --- API FETCHERS ---
const fetchCurrentUser = async () => {
    try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
            return await res.json();
        }
        return null;
    } catch (e) {
        console.error("Failed to check session", e);
        return null;
    }
};

const fetchUsers = async (addNotification) => {
  const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

  if (!API_KEY_TO_SEND) {
    console.error("API Key missing");
    return [];
  }

  try {
    const res = await fetch("/api/admin/users", {
      method: "GET",
      headers: {
        "x-api-key": API_KEY_TO_SEND,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error(`Failed to fetch users`);

    const jsonData = await res.json();
    
    // Handle data structure variations
    if (jsonData.data && Array.isArray(jsonData.data)) return jsonData.data;
    if (Array.isArray(jsonData)) return jsonData;
    
    return [];
  } catch (error) {
    if (addNotification) addNotification("error", "Error loading users.");
    return [];
  }
};

export default function UsersPage() {
  const { addNotification } = useNotification();
  
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState(null); // Stores logged-in admin info
  const [visiblePasswordIds, setVisiblePasswordIds] = useState(new Set()); // Tracks which rows have password revealed

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  // Modal States
  const [isAddUsersModalOpen, setIsAddUsersModalOpen] = useState(false);
  const [isEditUsersModalOpen, setIsEditUsersModalOpen] = useState(false);
  const [usersToEditId, setUsersToEditId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [usersToDelete, setUsersToDelete] = useState({ id: null, name: "" });

  // --- LOAD DATA ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get Current Admin Role
      const me = await fetchCurrentUser();
      setCurrentUser(me);

      // 2. Get Settings
      const settingsRes = await fetch("/api/admin/settings");
      const settingsJson = await settingsRes.json();
      setSettings(settingsJson.data);

      // 3. Get Users List
      const data = await fetchUsers(addNotification);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- PASSWORD TOGGLE HANDLER ---
  const togglePasswordVisibility = (id) => {
    setVisiblePasswordIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  // --- COLUMNS DEFINITION ---
  // We use useMemo so columns update when currentUser or visibility state changes
  const columns = useMemo(() => {
    const baseCols = [
      {
        key: "name",
        header: "Name",
        sortable: true,
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-black/50">
              {row.avatar ? (
                <Image src={row.avatar} alt={row.name} width={40} height={40} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 grid place-items-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
            </div>
            <span className="font-bold">{row.name}</span>
          </div>
        ),
      },
      { key: "username", header: "Username", sortable: true, className: "font-mono text-gray-600" },
      { key: "email", header: "Email", sortable: true },
      { key: "role", header: "Role", sortable: true }, // Added Role column for visibility
    ];

    // --- SUPER ADMIN EXCLUSIVE COLUMN ---
    if (currentUser?.role === "super-admin") {
        baseCols.push({
            key: "password",
            header: "Password Hash",
            sortable: false,
            render: (row) => {
                const isVisible = visiblePasswordIds.has(row._id);
                return (
                    <div className="flex items-center gap-2 max-w-[150px]">
                        <div className="truncate font-mono text-xs text-gray-500 bg-gray-100 p-1 rounded">
                            {isVisible ? row.password : "••••••••••••••"}
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                togglePasswordVisibility(row._id);
                            }}
                            className="text-gray-500 hover:text-black"
                            title={isVisible ? "Hide Hash" : "Show Hash"}
                        >
                            {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                );
            }
        });
    }

    // Filter users based on super-admin settings
    const filteredUsers = users.filter(u => {
        // If it's a super-admin, only show if show_super_admin_role is true
        // OR if the current user is a super-admin themselves
        if (u.role === "super-admin") {
            if (currentUser?.role === "super-admin") return true;
            return settings?.super_admin_settings?.show_super_admin_role;
        }
        return true;
    });

    // Add remaining columns
    baseCols.push(
      {
        key: "created_at",
        header: "Joined At",
        sortable: true,
        render: (row) => new Date(row.created_at).toLocaleDateString(),
      },
      {
        key: "actions",
        header: "Actions",
        sortable: false,
        render: (row, { handleEdit, openDeleteModal }) => {
          const isSuperAdminUser = row.role === "super-admin";
          const canEditSuperAdmin = !settings?.super_admin_settings?.disable_edit_super_admin;
          
          const showEdit = settings?.permissions?.disable_edit_user === false || currentUser?.role === "super-admin";
          const showDelete = settings?.permissions?.disable_delete_user === false || currentUser?.role === "super-admin";

          // Special check for super-admin accounts
          const isEditDisabled = isSuperAdminUser && !canEditSuperAdmin && currentUser?.role !== "super-admin";
          const isDeleteDisabled = isSuperAdminUser && !canEditSuperAdmin && currentUser?.role !== "super-admin";

          return (
            <div className="flex gap-2">
              {showEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(row._id); }}
                  disabled={isEditDisabled}
                  className={`p-1 bg-green-600 text-white border border-black rounded text-xs hover:bg-green-700 transition-colors ${isEditDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isEditDisabled ? "Super-Admin protection enabled" : "Edit User"}
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {showDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); openDeleteModal(row._id, row.name); }}
                  disabled={isDeleteDisabled}
                  className={`p-1 bg-red-600 text-white border border-black rounded text-xs hover:bg-red-700 transition-colors ${isDeleteDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isDeleteDisabled ? "Super-Admin protection enabled" : "Delete User"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
      }
    );

    return { baseCols, filteredUsers };
  }, [currentUser, visiblePasswordIds, users, settings]); // Re-calculate when user, visibility, users list, or settings change

  const { baseCols: memoizedColumns, filteredUsers } = columns;

  // --- CRUD HANDLERS ---
  const handleUserAdded = (newUser) => setUsers((prev) => [newUser, ...prev]);
  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) => prev.map((user) => (user._id === updatedUser._id ? updatedUser : user)));
    setIsEditUsersModalOpen(false);
    addNotification("success", `User "${updatedUser.name}" updated successfully!`);
  };
  const handleEdit = (id) => { setUsersToEditId(id); setIsEditUsersModalOpen(true); };
  const openDeleteModal = (id, name) => { setUsersToDelete({ id, name }); setIsDeleteModalOpen(true); };
  
  const handleDelete = async () => {
    const id = usersToDelete.id;
    if (!id) return;
    setIsDeleteModalOpen(false);
    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY_TO_SEND },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to delete");
      
      setUsers((prev) => prev.filter((a) => a._id !== id));
      addNotification("success", "User deleted successfully.");
    } catch (error) {
      addNotification("error", error.message);
    } finally {
      setUsersToDelete({ id: null, name: "" });
    }
  };

  // --- RENDER ---
  if (loading && users.length === 0) {
    return <div className="flex justify-center items-center h-[500px]"><LoaderCircle className="w-10 h-10 animate-spin text-red-600" /></div>;
  }

  return (
    <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 uppercase">Users Management</h1>
          {currentUser && (
              <span className="text-sm px-3 py-1 bg-gray-100 rounded-full text-gray-600 border border-gray-300">
                  Logged in as: <span className="font-bold text-black">{currentUser.role}</span>
              </span>
          )}
      </div>

      <div className="flex gap-10">
        <main className="flex-1">
          <div className="flex items-center justify-end mb-4">
            {(settings?.permissions?.disable_new_users === false || currentUser?.role === "super-admin") && (
              <button
                onClick={() => setIsAddUsersModalOpen(true)}
                className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add User
              </button>
            )}
          </div>

          <Table
            data={filteredUsers}
            columns={memoizedColumns}
            loading={loading}
            onReload={loadData}
            handlers={{ handleEdit, openDeleteModal }}
            searchKeys={["name", "email", "username"]}
            searchPlaceholder="Search by name, email, or username..."
          />
        </main>
      </div>

      {/* MODALS */}
      <Modal isOpen={isAddUsersModalOpen} onClose={() => setIsAddUsersModalOpen(false)} title="Add New User">
        <AddUserForm 
            onUserAdded={(newUser) => { handleUserAdded(newUser); setIsAddUsersModalOpen(false); addNotification("success", "User added!"); }} 
            onCancel={() => setIsAddUsersModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isEditUsersModalOpen} onClose={() => setIsEditUsersModalOpen(false)} title="Edit User">
        {isEditUsersModalOpen && usersToEditId && (
          <EditUserForm 
            key={usersToEditId} 
            userId={usersToEditId} 
            onUserUpdated={handleUserUpdated} 
            onCancel={() => setIsEditUsersModalOpen(false)} 
        />
        )}
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="p-4">
          <p className="text-gray-700 mb-4">Are you sure you want to delete user <span className="font-bold text-red-600">&quot;{usersToDelete.name}&quot;</span>?</p>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">Cancel</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}