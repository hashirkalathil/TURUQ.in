// app/admin/categories/page.js
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Edit, LoaderCircle, Trash2, PlusCircle } from "lucide-react";
import Table from "@/components/admin/ui/Table";
import { useNotification } from "@/components/ui/notification/NotificationProvider";
import Modal from "@/components/admin/ui/modal/Modal";

import AddCategoryForm from "@/components/admin/categories/AddCategoryForm";
import AddSubCategoryForm from "@/components/admin/categories/AddSubCategoryForm";
import EditCategoryForm from "@/components/admin/categories/EditCategoryForm"; 
import EditSubCategoryForm from "@/components/admin/categories/EditSubCategoryForm"; 

const fetchCategories = async () => {
  const res = await fetch("/api/admin/categories", {
    method: "GET",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data;
};

const fetchSubCategories = async () => {
  const res = await fetch("/api/admin/subcategories", {
    method: "GET",
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch subcategories");
  const data = await res.json();
  return data;
};

export default function Categories() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  
  const [categoryData, setCategoryData] = useState([]); 
  const [subCategoryData, setSubCategoryData] = useState([]); 
  const [mainTab, setMainTab] = useState(true); // true = Categories, false = SubCategories

  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddSubCategoryModalOpen, setIsAddSubCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isEditSubCategoryModalOpen, setIsEditSubCategoryModalOpen] = useState(false);

  // Editing State
  const [editingItem, setEditingItem] = useState(null);

  /* ------------- Handlers ------------- */
  
  const handleEdit = useCallback(
    (id) => {
      if (mainTab) {
        const itemToEdit = categoryData.find((item) => item._id === id);
        if (itemToEdit) {
          setEditingItem(itemToEdit);
          setIsEditCategoryModalOpen(true);
        }
      } else {
        const itemToEdit = subCategoryData.find((item) => item._id === id);
        if (itemToEdit) {
          setEditingItem(itemToEdit);
          setIsEditSubCategoryModalOpen(true);
        }
      }
    },
    [mainTab, categoryData, subCategoryData]
  );

  // Called when EditCategoryForm successfully updates the DB
  const handleCategoryUpdated = (updatedCategory) => {
    setCategoryData((prev) => 
      prev.map((cat) => (cat._id === updatedCategory._id ? updatedCategory : cat))
    );
    setIsEditCategoryModalOpen(false);
    setEditingItem(null);
  };

  // Called when EditSubCategoryForm successfully updates the DB
  const handleSubCategoryUpdated = (updatedSubCategory) => {
    setSubCategoryData((prev) => 
      prev.map((sub) => (sub._id === updatedSubCategory._id ? updatedSubCategory : sub))
    );
    setIsEditSubCategoryModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = useCallback(
    async (id) => {
      const itemType = mainTab ? "Category" : "Subcategory";
      const endpoint = mainTab ? "/api/admin/categories" : "/api/admin/subcategories";

      // Confirm before deleting
      if(!confirm(`Are you sure you want to delete this ${itemType}?`)) return;

      try {
        const res = await fetch(endpoint, {
          method: "DELETE",
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }), 
        });

        const result = await res.json();

        if (!res.ok) {
          const message = result.message || `Failed to delete ${itemType}.`;
          addNotification("error", message);
          return;
        }

        // Success: Update the state
        if (mainTab) {
          setCategoryData((prev) => prev.filter((item) => item._id !== id));
        } else {
          setSubCategoryData((prev) => prev.filter((item) => item._id !== id));
        }

        addNotification("success", `${itemType} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error);
        addNotification(
          "error",
          `An unexpected error occurred while deleting the ${itemType}.`
        );
      }
    },
    [mainTab, addNotification]
  );

  /* ------------- Columns Definition ------------- */

  const baseColumns = useMemo(
    () => [
      { key: "name", header: "Name", sortable: true },
      { key: "slug", header: "Slug", sortable: true },
      {
        key: "description",
        header: "Description",
        sortable: false,
        className: "text-gray-600 font-light text-sm truncate max-w-xs",
      },
      {
        key: "created_at_display",
        header: "Created At",
        sortable: true,
        render: (row) => {
          if (row?.created_at) return new Date(row.created_at).toLocaleDateString();
          if (row?._id) return new Date(parseInt(row._id.substring(0, 8), 16) * 1000).toLocaleDateString();
          return "N/A";
        },
      },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <div className="flex items-center space-x-2">
            {!settings?.permissions?.disable_edit_category && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row._id);
                }}
                className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
                aria-label="Edit"
              >
                <Edit className="w-4 h-4 text-yellow-600" />
              </button>
            )}
            {!settings?.permissions?.disable_delete_categories && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row._id);
                }}
                className="p-1 rounded-full hover:bg-red-100 transition-colors"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete, settings]
  ); 
  
  const categoryColumns = baseColumns;

  // Map parent IDs to names for the Subcategory table
  const parentNameMap = useMemo(() => {
    return categoryData.reduce((map, category) => {
      map[category._id] = category.name;
      return map;
    }, {});
  }, [categoryData]);

  const subCategoryColumns = useMemo(() => {
    return [
      baseColumns[0], // Name
      baseColumns[1], // Slug
      baseColumns[2], // Description
      {
        key: "parent_name",
        header: "Parent Category",
        sortable: true,
        render: (row) => parentNameMap[row.parent_id] || "N/A",
      },
      baseColumns[3], // Created At
      baseColumns[4], // Actions
    ];
  }, [parentNameMap, baseColumns]);

  /* ------------- Data Fetching ------------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [categories, subcategories] = await Promise.all([
        fetchCategories(),
        fetchSubCategories(),
      ]);
      setCategoryData(categories);
      setSubCategoryData(subcategories);
    } catch (error) {
      console.error("Error loading data:", error);
      addNotification("error", error.message || "Error loading data.");
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadData();
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => setSettings(j.data))
      .catch(() => {});
  }, [loadData]);

  /* ------------- Render ------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 uppercase">
        Category Page
      </h1>

      {/* Tab Navigation */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        <button
          className={`flex-1 py-2 px-4 text-sm cursor-pointer uppercase font-bold ${
            mainTab
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setMainTab(true)}
        >
          Categories
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm cursor-pointer uppercase font-bold ${
            !mainTab
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setMainTab(false)}
        >
          Subcategories
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mb-4">
        {!settings?.permissions?.disable_create_categories && (
          <button
            onClick={() => mainTab ? setIsAddCategoryModalOpen(true) : setIsAddSubCategoryModalOpen(true)}
            className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            {mainTab ? "Add Category" : "Add Subcategory"}
          </button>
        )}
      </div>

      {/* Table Display */}
      <Table
        data={mainTab ? categoryData : subCategoryData}
        columns={mainTab ? categoryColumns : subCategoryColumns}
        onRowClick={(row) => console.log("Row clicked:", row)}
        onBulkAction={(action, ids) => console.log(action, ids)}
        searchableKeys={mainTab ? ["name", "slug"] : ["name", "slug", "parent_name"]}
      />

      {/* --- MODALS --- */}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add New Category"
      >
        <AddCategoryForm
          onCategoryAdded={(newCategory) => {
            setCategoryData((prev) => [newCategory, ...prev]); 
            setIsAddCategoryModalOpen(false);
            addNotification("success", "Category added successfully!");
          }}
          onClose={() => setIsAddCategoryModalOpen(false)}
        />
      </Modal>

      {/* Add SubCategory Modal */}
      <Modal
        isOpen={isAddSubCategoryModalOpen}
        onClose={() => setIsAddSubCategoryModalOpen(false)}
        title="Add New Subcategory"
      >
        <AddSubCategoryForm
          onSubCategoryAdded={(newSubCategory) => {
            setSubCategoryData((prev) => [newSubCategory, ...prev]);
            setIsAddSubCategoryModalOpen(false);
            addNotification("success", "Subcategory added successfully!");
          }}
          onClose={() => setIsAddSubCategoryModalOpen(false)}
          categories={categoryData} // Pass parent categories
        />
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        title="Edit Category"
      >
        {editingItem && (
          <EditCategoryForm
            category={editingItem}
            onCategoryUpdated={handleCategoryUpdated}
            onCancel={() => setIsEditCategoryModalOpen(false)}
          />
        )}
      </Modal>

      {/* Edit SubCategory Modal */}
      <Modal
        isOpen={isEditSubCategoryModalOpen}
        onClose={() => setIsEditSubCategoryModalOpen(false)}
        title="Edit Subcategory"
      >
        {editingItem && (
          <EditSubCategoryForm
            subCategory={editingItem}
            categories={categoryData} // Needed to select parent
            onSubCategoryUpdated={handleSubCategoryUpdated}
            onCancel={() => setIsEditSubCategoryModalOpen(false)}
          />
        )}
      </Modal>
      
    </div>
  );
}