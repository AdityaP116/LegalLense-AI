import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { updateProfile, deleteUser } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

type SettingsSection = "profile" | "privacy" | "about"

export function Settings() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [activeSection, setActiveSection] = useState<SettingsSection>("profile")

  // Profile edit state
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleSaveProfile = async () => {
    if (!user) return
    setSavingProfile(true)
    setProfileError(null)
    setProfileSuccess(false)
    try {
      await updateProfile(user, { displayName: displayName.trim() || user.displayName })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmText !== "DELETE") return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteUser(user)
      navigate("/login")
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        setDeleteError(
          "For security, please sign out and sign back in before deleting your account."
        )
      } else {
        setDeleteError(err.message || "Failed to delete account.")
      }
      setDeleting(false)
    }
  }

  const navItems: { id: SettingsSection; icon: string; label: string }[] = [
    { id: "profile", icon: "manage_accounts", label: "Profile" },
    { id: "privacy", icon: "shield_lock", label: "Data & Privacy" },
    { id: "about", icon: "info", label: "About" },
  ]

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto py-space-xl gap-space-xl">
      {/* Page header */}
      <div className="flex items-center gap-space-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 px-0 hover:bg-transparent">
          <span className="material-symbols-outlined">arrow_back</span>
          Dashboard
        </Button>
      </div>

      <div className="flex flex-col gap-space-xs">
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Settings</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Manage your profile and data preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
        {/* Sidebar nav */}
        <nav className="lg:col-span-3 flex flex-col gap-1 glass-panel p-space-sm rounded-xl border border-border shadow-sm">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-space-sm px-space-sm py-2.5 rounded-lg text-left transition-all duration-200 font-body-sm text-body-sm border ${
                activeSection === item.id
                  ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container border-transparent hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="lg:col-span-9 flex flex-col gap-space-lg">

          {/* ── Profile ─────────────────────────────────────────────────── */}
          {activeSection === "profile" && (
            <>
              <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Profile</h2>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-space-md p-space-md bg-surface-container-low rounded-xl">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-16 h-16 rounded-full ring-2 ring-primary/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                      {(user?.displayName || user?.email || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-semibold text-on-surface">{user?.displayName || "No name set"}</span>
                    <span className="text-sm text-on-surface-variant">{user?.email}</span>
                    <span className="text-xs text-outline mt-0.5 font-mono">UID: {user?.uid?.slice(0, 16)}…</span>
                  </div>
                </div>

                {/* Display name edit */}
                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface font-semibold" htmlFor="display-name">
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="p-3 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                    placeholder="Your name"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-md text-on-surface font-semibold">Email Address</label>
                  <div className="p-3 bg-surface-container-low rounded-lg text-on-surface-variant text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    {user?.email}
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">Read-only</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">Email is managed by your Google account and cannot be changed here.</p>
                </div>

                {profileError && (
                  <div className="p-3 bg-error-container text-error rounded-lg text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="p-3 bg-secondary-container text-on-secondary-container rounded-lg text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Profile updated successfully.
                  </div>
                )}

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="gap-2">
                    {savingProfile
                      ? <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Saving…</>
                      : <><span className="material-symbols-outlined text-[16px]">save</span> Save Changes</>
                    }
                  </Button>
                </div>
              </section>

              {/* Sign out */}
              <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-on-surface">Sign Out</h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">Sign out of your LegalLens account on this device.</p>
                </div>
                <Button variant="secondary" onClick={logout} className="gap-2">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Sign Out
                </Button>
              </section>
            </>
          )}

          {/* ── Data & Privacy ───────────────────────────────────────────── */}
          {activeSection === "privacy" && (
            <>
              <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined text-secondary text-[20px]">shield_lock</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface">Data &amp; Privacy</h2>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-border flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">cloud</span>
                    <h3 className="font-semibold text-on-surface">Your Data Storage</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Your documents and case data are stored securely in Google Cloud Storage and Firestore,
                    tied to your account. Data is not shared with third parties. Uploaded documents are used
                    exclusively for AI analysis within your case workspace.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-border flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-on-surface">Export Data</span>
                    <span className="text-sm text-on-surface-variant">Download a copy of all your case data (coming soon).</span>
                  </div>
                  <Button variant="secondary" disabled className="gap-2 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export
                  </Button>
                </div>
              </section>

              {/* Danger zone */}
              <section className="glass-panel border border-error/40 bg-error/5 rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
                <div className="flex items-center gap-3 mb-1">
                  <span className="material-symbols-outlined text-error text-[20px]">dangerous</span>
                  <h2 className="font-headline-md text-headline-md text-error">Danger Zone</h2>
                </div>

                {!showDeleteConfirm ? (
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-error/5 border border-error/20">
                    <div>
                      <p className="font-semibold text-on-surface">Delete Account &amp; All Data</p>
                      <p className="text-sm text-on-surface-variant mt-0.5">
                        Permanently deletes your Firebase account. All case data, documents, and evidence will
                        be removed. <strong className="text-error">This cannot be undone.</strong>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-semibold hover:bg-error/90 transition-colors shrink-0"
                    >
                      Delete Account
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-4 rounded-xl bg-error/10 border border-error/30">
                    <p className="text-sm text-on-surface leading-relaxed">
                      <strong className="text-error">Are you absolutely sure?</strong> This will permanently
                      delete your account and all associated data. To confirm, type{" "}
                      <code className="font-mono bg-surface-container px-1 py-0.5 rounded text-error">DELETE</code>{" "}
                      below.
                    </p>
                    <input
                      value={deleteConfirmText}
                      onChange={e => setDeleteConfirmText(e.target.value)}
                      placeholder='Type "DELETE" to confirm'
                      className="p-3 bg-surface-container-low rounded-lg focus:outline-none focus:ring-2 focus:ring-error/50 text-on-surface font-mono"
                    />
                    {deleteError && (
                      <div className="p-3 bg-error-container text-error rounded-lg text-sm">{deleteError}</div>
                    )}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); setDeleteError(null) }}
                        className="px-4 py-2 rounded-lg border border-border text-on-surface-variant hover:text-on-surface transition-colors text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmText !== "DELETE" || deleting}
                        className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-semibold hover:bg-error/90 transition-colors disabled:opacity-40 flex items-center gap-2"
                      >
                        {deleting
                          ? <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Deleting…</>
                          : "Permanently Delete Account"
                        }
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ── About ────────────────────────────────────────────────────── */}
          {activeSection === "about" && (
            <section className="glass-panel border border-border rounded-xl shadow-lg p-space-lg flex flex-col gap-space-md">
              <div className="flex items-center gap-3 mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">About LegalLens AI</h2>
              </div>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "App Version", value: "1.0.0" },
                    { label: "AI Model", value: "Gemini 2.0 Flash" },
                    { label: "Embeddings", value: "text-embedding-004" },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-surface-container-low border border-border flex flex-col gap-1">
                      <span className="text-xs text-on-surface-variant uppercase tracking-wide font-semibold">{item.label}</span>
                      <span className="font-mono text-on-surface text-sm font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-400 text-[20px] shrink-0 mt-0.5">gavel</span>
                  <div className="text-sm text-on-surface-variant leading-relaxed">
                    <strong className="text-on-surface block mb-1">Legal Disclaimer</strong>
                    LegalLens AI is a document preparation and analysis tool intended to help users organise
                    information for consultation with qualified legal professionals. It does <strong>not</strong>{" "}
                    provide legal advice, and nothing produced by this application constitutes legal advice.
                    Always seek the counsel of a qualified lawyer for legal matters.
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
