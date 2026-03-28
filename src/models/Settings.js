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
