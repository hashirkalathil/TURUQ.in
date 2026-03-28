// src/components/admin/posts/form-sections/ClassificationSection.jsx
import { Layers, GitBranch, GitMerge } from "lucide-react";
import Select from "@/components/ui/select/Select";

export default function ClassificationSection({
  mode,
  onModeChange,
  categoryOptions,
  subCategoryOptions,
  selectedCategoryIds,
  selectedSubCategoryIds,
  onCategoryChange,
  onSubCategoryChange,
}) {
  // Helper to filter selected values for the Select component
  const currentCatValues = categoryOptions.filter((opt) =>
    selectedCategoryIds.includes(opt.value)
  );
  const currentSubValues = subCategoryOptions.filter((opt) =>
    selectedSubCategoryIds.includes(opt.value)
  );

  return (
    <div className="bg-background p-4 rounded-lg border border-gray-200 space-y-4">
      <label className="block text-sm font-bold text-gray-800">
        Classification
      </label>

      {/* Strategy Switcher */}
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="classification"
            checked={mode === "category"}
            onChange={() => onModeChange("category")}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
          />
          <span className="ml-2 flex items-center gap-1">
            <Layers className="w-4 h-4 text-blue-600" /> Category Only
          </span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="classification"
            checked={mode === "subcategory"}
            onChange={() => onModeChange("subcategory")}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
          />
          <span className="ml-2 flex items-center gap-1">
            <GitBranch className="w-4 h-4 text-green-600" /> Subcategory Only
          </span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="classification"
            checked={mode === "both"}
            onChange={() => onModeChange("both")}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
          />
          <span className="ml-2 flex items-center gap-1">
            <GitMerge className="w-4 h-4 text-purple-600" /> Both
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Select */}
        <div
          className={
            mode === "subcategory" ? "opacity-50 pointer-events-none" : ""
          }
        >
          <label className="block text-sm font-medium mb-1">
            Category {mode !== "subcategory" && "*"}
          </label>
          <Select
            options={categoryOptions}
            value={currentCatValues}
            onChange={onCategoryChange}
            placeholder="Select Categories"
            isMulti={true}
            isSearchable={true}
            isDisabled={mode === "subcategory"}
          />
        </div>

        {/* Subcategory Select */}
        <div
          className={
            mode === "category" ? "opacity-50 pointer-events-none" : ""
          }
        >
          <label className="block text-sm font-medium mb-1">
            Sub Category {mode !== "category" && "*"}
          </label>
          <Select
            options={subCategoryOptions}
            value={currentSubValues}
            onChange={onSubCategoryChange}
            placeholder="Select Subcategories"
            isMulti={true}
            isSearchable={true}
            isDisabled={mode === "category"}
          />
        </div>
      </div>
    </div>
  );
}