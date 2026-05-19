"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  ShieldAlert,
  FileText,
  Users,
  UserCircle,
  MonitorPlay,
  FolderOpen,
  BookOpen,
  MessageSquare,
  Save,
  Loader2,
  Eye,
  TrendingUp,
  BarChart2,
  WrenchIcon,
  UserX,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

// ─── Toggle Component ──────────────────────────────────────────────────────
function PermissionToggle({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-black/5 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-poppins text-sm font-semibold text-black">{label}</p>
        {description && (
          <p className="font-poppins text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d64545]/40 border ${
          value
            ? "bg-[#d64545] border-[#b53a3a]"
            : "bg-gray-200 border-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
            value ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── Permission Group Card ─────────────────────────────────────────────────
function PermissionGroup({ icon: Icon, title, color, children }) {
  return (
    <div className="bg-background border border-black rounded-2xl overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-black ${color}`}>
        <div className="p-1.5 bg-black/10 rounded-lg">
          <Icon className="w-4 h-4 text-black" />
        </div>
        <h3 className="font-poppins text-sm font-bold uppercase tracking-wide text-black">
          {title}
        </h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

// ─── SVG Analytics Chart ───────────────────────────────────────────────────
function ViewsChart({ data }) {
  const W = 600;
  const H = 200;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const maxViews = Math.max(...data.map((d) => d.totalViews), 1);
  const xStep = innerW / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + innerH - (d.totalViews / maxViews) * innerH,
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    `M ${points[0]?.x},${pad.top + innerH} ` +
    points.map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1]?.x},${pad.top + innerH} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    val: Math.round(r * maxViews),
    y: pad.top + innerH - r * innerH,
  }));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: "320px" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d64545" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d64545" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              y1={t.y}
              x2={W - pad.right}
              y2={t.y}
              stroke="#00000010"
              strokeWidth="1"
            />
            <text
              x={pad.left - 8}
              y={t.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#666"
              fontFamily="Poppins, sans-serif"
            >
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(1)}k` : t.val}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {points.length > 1 && (
          <path d={areaPath} fill="url(#areaGrad)" />
        )}

        {/* Line */}
        {points.length > 1 && (
          <polyline
            points={polyline}
            fill="none"
            stroke="#d64545"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data points + X labels */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#d64545" stroke="white" strokeWidth="2" />
            <text
              x={p.x}
              y={pad.top + innerH + 18}
              textAnchor="middle"
              fontSize="10"
              fill="#666"
              fontFamily="Poppins, sans-serif"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle, accent = false }) {
  return (
    <div className={`flex items-center gap-4 pb-4 border-b ${accent ? "border-[#d64545]/20" : "border-black/10"}`}>
      <div className={`p-2.5 rounded-xl ${accent ? "bg-[#d64545]" : "bg-black"}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="font-oswald text-xl font-bold uppercase tracking-tight text-black">
          {title}
        </h2>
        {subtitle && (
          <p className="font-poppins text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ─── Save Button ───────────────────────────────────────────────────────────
function SaveButton({ saving, onClick, label = "Save Changes" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2 bg-black text-white text-sm rounded-full font-bold hover:bg-[#d64545] transition-all duration-200 disabled:opacity-50 border border-black"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [loading, setLoading]           = useState(true);
  const [currentUser, setCurrentUser]   = useState(null);
  const [permissions, setPermissions]   = useState({});
  const [superSettings, setSuperSettings] = useState({});
  const [analytics, setAnalytics]       = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [savingPerms, setSavingPerms]   = useState(false);
  const [savingSuper, setSavingSuper]   = useState(false);

  const { addNotification } = useNotification();

  // Fetch current user + settings
  useEffect(() => {
    const init = async () => {
      try {
        const [meRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/admin/settings", { cache: "no-store" }),
        ]);

        if (meRes.ok) {
          const me = await meRes.json();
          setCurrentUser(me);

          if (me.role === "super-admin") {
            setAnalyticsLoading(true);
            fetch("/api/admin/analytics")
              .then((r) => r.json())
              .then((j) => setAnalytics(j.data))
              .catch(() => {})
              .finally(() => setAnalyticsLoading(false));
          }
        }

        if (settingsRes.ok) {
          const json = await settingsRes.json();
          setPermissions(json.data?.permissions ?? {});
          setSuperSettings(json.data?.super_admin_settings ?? {});
        }
      } catch (err) {
        console.error(err);
        addNotification("error", "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [addNotification]);

  const handleSavePermissions = useCallback(async () => {
    setSavingPerms(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "permissions", data: permissions }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.data?.permissions) {
          setPermissions(j.data.permissions);
        }
        addNotification("success", "Permissions saved successfully");
      } else {
        const j = await res.json();
        addNotification("error", j.error || "Failed to save permissions");
      }
    } catch {
      addNotification("error", "Network error");
    } finally {
      setSavingPerms(false);
    }
  }, [permissions, addNotification]);

  const handleSaveSuperSettings = useCallback(async () => {
    setSavingSuper(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "super_admin_settings", data: superSettings }),
      });
      if (res.ok) {
        const j = await res.json();
        if (j.data?.super_admin_settings) {
          setSuperSettings(j.data.super_admin_settings);
        }
        addNotification("success", "Super-admin settings saved");
      } else {
        const j = await res.json();
        addNotification("error", j.error || "Failed to save super-admin settings");
      }
    } catch {
      addNotification("error", "Network error");
    } finally {
      setSavingSuper(false);
    }
  }, [superSettings, addNotification]);

  const setPerm   = (key) => (val) => setPermissions((p)    => ({ ...p, [key]: val }));
  const setSuper  = (key) => (val) => setSuperSettings((p)  => ({ ...p, [key]: val }));

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  const role = currentUser?.role;
  const isAdmin      = role === "admin" || role === "super-admin";
  const isSuperAdmin = role === "super-admin";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Lock className="w-12 h-12 text-gray-300" />
        <p className="font-poppins font-bold text-gray-500 uppercase text-sm">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-oswald text-4xl font-bold uppercase tracking-tight text-black">
          Settings
        </h1>
        <p className="font-poppins text-sm text-gray-500 mt-1">
          Manage site-wide controls and permissions.
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ADMIN SECTION — Permission Management
      ══════════════════════════════════════════════════════════════ */}
      <section className="space-y-6">
        <SectionHeader
          icon={Shield}
          title="Permission Management"
          subtitle="Enable or disable actions site-wide for all admin users."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Posts */}
          <PermissionGroup icon={FileText} title="Posts" color="bg-orange-50">
            <PermissionToggle
              label="Disable New Posts"
              description="Prevent creating new posts"
              value={!!permissions.disable_new_posts}
              onChange={setPerm("disable_new_posts")}
            />
            <PermissionToggle
              label="Disable Deleting Posts"
              description="Prevent permanent post deletion"
              value={!!permissions.disable_delete_post}
              onChange={setPerm("disable_delete_post")}
            />
          </PermissionGroup>

          {/* Users */}
          <PermissionGroup icon={Users} title="Users" color="bg-blue-50">
            <PermissionToggle
              label="Disable New Users"
              description="Block manual user creation by admins"
              value={!!permissions.disable_new_users}
              onChange={setPerm("disable_new_users")}
            />
            <PermissionToggle
              label="Disable Editing Users"
              description="Prevent modifying user profiles"
              value={!!permissions.disable_edit_user}
              onChange={setPerm("disable_edit_user")}
            />
            <PermissionToggle
              label="Disable Deleting Users"
              description="Prevent removing user accounts"
              value={!!permissions.disable_delete_user}
              onChange={setPerm("disable_delete_user")}
            />
          </PermissionGroup>

          {/* Authors */}
          <PermissionGroup icon={UserCircle} title="Authors" color="bg-purple-50">
            <PermissionToggle
              label="Disable New Authors"
              description="Prevent adding new author profiles"
              value={!!permissions.disable_new_authors}
              onChange={setPerm("disable_new_authors")}
            />
            <PermissionToggle
              label="Disable Editing Authors"
              description="Prevent editing author details"
              value={!!permissions.disable_edit_author}
              onChange={setPerm("disable_edit_author")}
            />
            <PermissionToggle
              label="Disable Deleting Authors"
              description="Prevent author profile removal"
              value={!!permissions.disable_delete_author}
              onChange={setPerm("disable_delete_author")}
            />
          </PermissionGroup>

          {/* Slides */}
          <PermissionGroup icon={MonitorPlay} title="Slides" color="bg-yellow-50">
            <PermissionToggle
              label="Disable Adding to Slides"
              description="Prevent adding posts to the homepage slider"
              value={!!permissions.disable_add_to_slides}
              onChange={setPerm("disable_add_to_slides")}
            />
            <PermissionToggle
              label="Disable Removing from Slides"
              description="Prevent removing posts from the slider"
              value={!!permissions.disable_remove_from_slides}
              onChange={setPerm("disable_remove_from_slides")}
            />
          </PermissionGroup>

          {/* Categories */}
          <PermissionGroup icon={FolderOpen} title="Categories" color="bg-green-50">
            <PermissionToggle
              label="Disable Creating Categories"
              description="Prevent new category creation"
              value={!!permissions.disable_create_categories}
              onChange={setPerm("disable_create_categories")}
            />
            <PermissionToggle
              label="Disable Editing Categories"
              description="Prevent modifying existing categories"
              value={!!permissions.disable_edit_category}
              onChange={setPerm("disable_edit_category")}
            />
            <PermissionToggle
              label="Disable Deleting Categories"
              description="Prevent category removal"
              value={!!permissions.disable_delete_categories}
              onChange={setPerm("disable_delete_categories")}
            />
          </PermissionGroup>

          {/* Webzines */}
          <PermissionGroup icon={BookOpen} title="Webzines" color="bg-rose-50">
            <PermissionToggle
              label="Disable Creating Webzines"
              description="Prevent new webzine creation"
              value={!!permissions.disable_create_webzines}
              onChange={setPerm("disable_create_webzines")}
            />
            <PermissionToggle
              label="Disable Editing Webzines"
              description="Prevent modifying webzine details"
              value={!!permissions.disable_edit_webzines}
              onChange={setPerm("disable_edit_webzines")}
            />
            <PermissionToggle
              label="Disable Deleting Webzines"
              description="Prevent webzine removal"
              value={!!permissions.disable_delete_webzines}
              onChange={setPerm("disable_delete_webzines")}
            />
          </PermissionGroup>

          {/* Comments */}
          <PermissionGroup icon={MessageSquare} title="Comments" color="bg-cyan-50">
            <PermissionToggle
              label="Disable New Comments"
              description="Close comments on all posts site-wide"
              value={!!permissions.disable_new_comments}
              onChange={setPerm("disable_new_comments")}
            />
            <PermissionToggle
              label="Disable Deleting Comments"
              description="Prevent comment moderation/removal"
              value={!!permissions.disable_delete_comments}
              onChange={setPerm("disable_delete_comments")}
            />
          </PermissionGroup>
        </div>

        <div className="flex justify-end">
          <SaveButton saving={savingPerms} onClick={handleSavePermissions} label="Save Permissions" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SUPER-ADMIN SECTIONS
      ══════════════════════════════════════════════════════════════ */}
      {isSuperAdmin && (
        <>
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-[#d64545]/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-4 text-xs font-bold uppercase tracking-widest text-[#d64545] font-poppins">
                Super-Admin Only
              </span>
            </div>
          </div>

          {/* ── Super-Admin Permissions ── */}
          <section className="space-y-6">
            <SectionHeader
              icon={ShieldAlert}
              title="Super-Admin Controls"
              subtitle="Elevated settings restricted to super-admins only."
              accent
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visibility & Access */}
              <PermissionGroup icon={Eye} title="Visibility &amp; Access" color="bg-red-50">
                <PermissionToggle
                  label="Show Super-Admin Role"
                  description="Display super-admins in the users list"
                  value={!!superSettings.show_super_admin_role}
                  onChange={setSuper("show_super_admin_role")}
                />
                <PermissionToggle
                  label="Disable Editing Super-Admins"
                  description="Prevent editing or deleting super-admin accounts"
                  value={!!superSettings.disable_edit_super_admin}
                  onChange={setSuper("disable_edit_super_admin")}
                />
                <PermissionToggle
                  label="Disable Public Registration"
                  description="Prevent new users from self-registering"
                  value={!!superSettings.disable_public_registration}
                  onChange={setSuper("disable_public_registration")}
                />
              </PermissionGroup>

              {/* Maintenance */}
              <PermissionGroup icon={WrenchIcon} title="Maintenance Mode" color="bg-amber-50">
                <PermissionToggle
                  label="Enable Maintenance Mode"
                  description="Take the site offline for visitors"
                  value={!!superSettings.site_under_maintenance}
                  onChange={setSuper("site_under_maintenance")}
                />
                {superSettings.site_under_maintenance && (
                  <div className="py-3">
                    <label className="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                      Maintenance Message
                    </label>
                    <textarea
                      rows={3}
                      value={superSettings.maintenance_message ?? ""}
                      onChange={(e) =>
                        setSuperSettings((p) => ({ ...p, maintenance_message: e.target.value }))
                      }
                      className="w-full border border-black/20 rounded-xl p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-[#d64545]/20 font-poppins"
                      placeholder="We are under maintenance. Check back soon."
                    />
                  </div>
                )}
              </PermissionGroup>
            </div>

            {/* Active warnings */}
            {(superSettings.site_under_maintenance || superSettings.disable_edit_super_admin) && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs font-poppins text-amber-800 space-y-1">
                  {superSettings.site_under_maintenance && (
                    <p>⚠️ <strong>Maintenance mode is ON.</strong> The public site is currently offline.</p>
                  )}
                  {superSettings.disable_edit_super_admin && (
                    <p>⚠️ <strong>Super-admin protection is ON.</strong> Super-admin accounts cannot be edited or deleted.</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <SaveButton saving={savingSuper} onClick={handleSaveSuperSettings} label="Save Super-Admin Settings" />
            </div>
          </section>

          {/* ── Visitor Analytics ── */}
          <section className="space-y-6">
            <SectionHeader
              icon={BarChart2}
              title="Visitor Analytics"
              subtitle="Post view data aggregated over the last 6 months."
              accent
            />

            {analyticsLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-6 h-6 animate-spin text-[#d64545]" />
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-background border border-black rounded-2xl p-5">
                    <p className="font-poppins text-xs font-bold uppercase text-gray-500 mb-2">Total Views</p>
                    <p className="font-oswald text-3xl font-bold text-black">
                      {analytics.totalViews?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div className="bg-background border border-black rounded-2xl p-5">
                    <p className="font-poppins text-xs font-bold uppercase text-gray-500 mb-2">This Month</p>
                    <p className="font-oswald text-3xl font-bold text-black">
                      {analytics.viewsByMonth?.at(-1)?.totalViews?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div className="bg-background border border-black rounded-2xl p-5">
                    <p className="font-poppins text-xs font-bold uppercase text-gray-500 mb-2">Posts Published</p>
                    <p className="font-oswald text-3xl font-bold text-black">
                      {analytics.viewsByMonth?.reduce((s, m) => s + m.postCount, 0) ?? 0}
                    </p>
                    <p className="font-poppins text-xs text-gray-400 mt-1">in last 6 months</p>
                  </div>
                </div>

                {/* Line chart */}
                <div className="bg-background border border-black rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-[#d64545]" />
                    <h3 className="font-poppins text-sm font-bold uppercase text-black">
                      Monthly Views Trend
                    </h3>
                  </div>
                  {analytics.viewsByMonth?.length > 0 ? (
                    <ViewsChart data={analytics.viewsByMonth} />
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-8">No view data yet</p>
                  )}
                </div>

                {/* Top posts */}
                {analytics.topPosts?.length > 0 && (
                  <div className="bg-background border border-black rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-black/10 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#d64545]" />
                      <h3 className="font-poppins text-sm font-bold uppercase text-black">
                        Top Posts by Views
                      </h3>
                    </div>
                    <div className="divide-y divide-black/5">
                      {analytics.topPosts.map((post, i) => {
                        const maxV = analytics.topPosts[0]?.views || 1;
                        const pct  = (post.views / maxV) * 100;
                        return (
                          <div key={post._id} className="px-5 py-3 flex items-center gap-4">
                            <span className="font-oswald text-lg font-bold text-gray-300 w-6 text-center">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-poppins text-sm font-semibold text-black truncate">
                                {post.title}
                              </p>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-[#d64545] rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="font-poppins text-sm font-bold text-black tabular-nums">
                              {post.views?.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[200px] text-gray-400 text-sm font-poppins">
                Failed to load analytics
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
