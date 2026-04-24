// src/models/Settings.js
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  site_name: {
    type: String,
    default: "TURUQ",
  },
  site_description: {
    type: String,
    default: "",
  },
  site_logo: {
    type: String,
    default: "",
  },
  contact_email: {
    type: String,
    default: "",
  },
  social_links: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  footer_text: {
    type: String,
    default: "",
  },

  // ─── Admin-level permission controls ────────────────────────────────────
  permissions: {
    // Posts
    disable_new_posts:      { type: Boolean, default: false },
    disable_delete_post:    { type: Boolean, default: false },

    // Users
    disable_new_users:      { type: Boolean, default: false },
    disable_edit_user:      { type: Boolean, default: false },
    disable_delete_user:    { type: Boolean, default: false },

    // Authors
    disable_new_authors:    { type: Boolean, default: false },
    disable_delete_author:  { type: Boolean, default: false },
    disable_edit_author:    { type: Boolean, default: false },

    // Slides
    disable_add_to_slides:      { type: Boolean, default: false },
    disable_remove_from_slides: { type: Boolean, default: false },

    // Categories
    disable_create_categories: { type: Boolean, default: false },
    disable_delete_categories: { type: Boolean, default: false },
    disable_edit_category:     { type: Boolean, default: false },

    // Webzines
    disable_create_webzines: { type: Boolean, default: false },
    disable_edit_webzines:   { type: Boolean, default: false },
    disable_delete_webzines: { type: Boolean, default: false },

    // Comments
    disable_new_comments:    { type: Boolean, default: false },
    disable_delete_comments: { type: Boolean, default: false },
  },

  // ─── Super-admin-only controls ───────────────────────────────────────────
  super_admin_settings: {
    show_super_admin_role:     { type: Boolean, default: false },
    disable_edit_super_admin:  { type: Boolean, default: false },
    site_under_maintenance:    { type: Boolean, default: false },
    maintenance_message:       { type: String,  default: "We are currently under maintenance. Please check back soon." },
    disable_public_registration: { type: Boolean, default: false },
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

SettingsSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.models.Settings || mongoose.model("Settings", SettingsSchema);
