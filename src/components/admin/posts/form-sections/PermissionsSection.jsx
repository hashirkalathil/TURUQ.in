// src/components/admin/posts/form-sections/PermissionsSection.jsx
import ToggleSwitch from "@/components/ui/ToggleSwitch";

export default function PermissionsSection({
  permissions,
  commentsEnabled,
  onPermissionChange,
  onCommentsChange,
}) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <label className="block text-sm font-bold text-gray-700 mb-3">
        Permissions & Settings
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <ToggleSwitch
          name="is_featured"
          label="Is Featured"
          checked={permissions.is_featured}
          onChange={onPermissionChange}
        />

        <ToggleSwitch
          name="is_premium"
          label="Is Premium"
          checked={permissions.is_premium}
          onChange={onPermissionChange}
        />

        <ToggleSwitch
          name="is_slide_article"
          label="Is Slide Article"
          checked={permissions.is_slide_article}
          onChange={onPermissionChange}
        />

        <ToggleSwitch
          name="comments_enabled"
          label="Enable Comments"
          checked={commentsEnabled}
          onChange={onCommentsChange}
        />
      </div>
    </div>
  );
}