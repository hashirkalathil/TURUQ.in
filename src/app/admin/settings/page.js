"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Globe, Share2, Mail, Image as ImageIcon } from "lucide-react";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: "",
    site_description: "",
    site_logo: "",
    contact_email: "",
    social_links: {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
    },
    footer_text: "",
  });

  const { addNotification } = useNotification();
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const json = await res.json();
          setSettings(json.data);
        } else {
          addNotification("error", "Failed to load settings");
        }
      } catch (error) {
        console.error("Fetch settings error:", error);
        addNotification("error", "Network error while loading settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [addNotification]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const platform = name.split("_")[1];
      setSettings((prev) => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [platform]: value,
        },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        addNotification("success", "Settings updated successfully");
      } else {
        const json = await res.json();
        addNotification("error", json.error || "Failed to update settings");
      }
    } catch (error) {
      console.error("Update settings error:", error);
      addNotification("error", "Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-oswald text-4xl font-bold uppercase tracking-tight text-black">
          Site Settings
        </h1>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-[#d64545] text-white rounded-full border border-black font-bold hover:bg-[#b53a3a] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-10">
        {/* General Settings */}
        <section className="bg-background border border-black rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-black rounded-lg">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-poppins text-xl font-bold text-black uppercase">General Information</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Site Name</label>
              <input
                type="text"
                name="site_name"
                value={settings.site_name}
                onChange={handleChange}
                className="w-full border border-black rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="Enter site name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase mb-2">Site Description</label>
              <textarea
                name="site_description"
                value={settings.site_description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-black rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="Enter site description for SEO"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email}
                    onChange={handleChange}
                    className="w-full border border-black rounded-xl p-3 pl-10 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="contact@turuq.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Logo URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="site_logo"
                    value={settings.site_logo}
                    onChange={handleChange}
                    className="w-full border border-black rounded-xl p-3 pl-10 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className="bg-background border border-black rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-black rounded-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-poppins text-xl font-bold text-black uppercase">Social Media</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["facebook", "instagram", "twitter", "youtube"].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-bold uppercase mb-2">{platform}</label>
                <input
                  type="text"
                  name={`social_${platform}`}
                  value={settings.social_links[platform]}
                  onChange={handleChange}
                  className="w-full border border-black rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder={`https://${platform}.com/turuq`}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Footer Settings */}
        <section className="bg-background border border-black rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-bold uppercase mb-2">Footer Copyright Text</label>
          <input
            type="text"
            name="footer_text"
            value={settings.footer_text}
            onChange={handleChange}
            className="w-full border border-black rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            placeholder="© 2024 TURUQ. All rights reserved."
          />
        </section>
      </form>
    </div>
  );
}
