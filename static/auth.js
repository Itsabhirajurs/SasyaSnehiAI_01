/**
 * Sashyasnehi AI – Supabase Auth (client-side)
 * Loaded as ES-module on community pages.
 * Uses the @supabase/supabase-js CDN bundle.
 */

/* ── Supabase client ─────────────────────────────────────────────────────── */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = window.SUPABASE_URL || "";
const SUPABASE_ANON = window.SUPABASE_ANON_KEY || "";

let _supabase = null;
function sb() {
  if (!_supabase && SUPABASE_URL && SUPABASE_ANON) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  }
  return _supabase;
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function $(id) { return document.getElementById(id); }
function show(el) { if (el) el.style.display = "flex"; }
function hide(el) { if (el) el.style.display = "none"; }

/** Get current access token (JWT). Returns "" when signed-out. */
async function getToken() {
  const client = sb();
  if (!client) return "";
  const { data } = await client.auth.getSession();
  return data?.session?.access_token || "";
}

/** Current Supabase user or null. */
async function getUser() {
  const client = sb();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data?.user || null;
}

/* ── UI state ─────────────────────────────────────────────────────────────── */
async function refreshUI() {
  const user = await getUser();
  const statusEl   = $("authStatus");
  const signedOut  = $("authSignedOut");
  const signedIn   = $("authSignedIn");
  const emailEl    = $("authUserEmail");
  const profileEd  = $("profileEditor");

  if (user) {
    if (statusEl) statusEl.textContent = "Signed in \u2713";
    hide(signedOut);
    show(signedIn);
    if (emailEl) emailEl.textContent = user.email || user.phone || user.id;
    // Auto-fill hidden token fields on the page
    document.querySelectorAll("input[name='supabase_token']").forEach(el => {
      getToken().then(t => el.value = t);
    });
  } else {
    if (statusEl) statusEl.textContent = "Sign in to post, reply & vote";
    show(signedOut);
    hide(signedIn);
    if (profileEd) profileEd.style.display = "none";
  }
}

/* ── Auth actions ─────────────────────────────────────────────────────────── */
async function authSignup() {
  const email = ($("authEmail") || {}).value?.trim();
  const password = ($("authPassword") || {}).value?.trim();
  if (!email || !password) { alert("Enter email & password (min 6 chars)."); return; }
  if (password.length < 6) { alert("Password must be at least 6 characters."); return; }

  const client = sb();
  if (!client) { alert("Auth not configured."); return; }

  const { data, error } = await client.auth.signUp({ email, password });
  if (error) { alert("Sign-up error: " + error.message); return; }

  if (data?.user?.identities?.length === 0) {
    alert("An account with this email already exists. Try signing in.");
  } else if (data?.user && !data.session) {
    alert("Check your email for a confirmation link, then sign in.");
  } else {
    await refreshUI();
  }
}

async function authLogin() {
  const email = ($("authEmail") || {}).value?.trim();
  const password = ($("authPassword") || {}).value?.trim();
  if (!email || !password) { alert("Enter email & password."); return; }

  const client = sb();
  if (!client) { alert("Auth not configured."); return; }

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) { alert("Sign-in error: " + error.message); return; }
  await refreshUI();
}

async function authLogout() {
  const client = sb();
  if (client) await client.auth.signOut();
  await refreshUI();
}

/** Guard – returns false (blocks navigation) if not signed in. */
async function guardAsk() {
  const user = await getUser();
  if (!user) {
    alert("Please sign in first to ask a question.");
    return false;
  }
  return true;        // allow navigation
}

/* ── Profile ──────────────────────────────────────────────────────────────── */
async function openProfileEditor() {
  const editor = $("profileEditor");
  if (!editor) return;
  const isHidden = editor.style.display === "none" || !editor.style.display;
  if (!isHidden) { editor.style.display = "none"; return; }

  // Fetch current profile from backend
  const token = await getToken();
  try {
    const res = await fetch("/api/profile/me", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (res.ok) {
      const d = await res.json();
      const p = d.profile || {};
      if ($("profName"))     $("profName").value     = p.full_name  || "";
      if ($("profCrop"))     $("profCrop").value     = p.major_crop || "";
      if ($("profState"))    $("profState").value    = p.state      || "";
      if ($("profDistrict")) $("profDistrict").value = p.district   || "";
      if ($("profTaluk"))    $("profTaluk").value    = p.taluk      || "";
      if ($("profPhone"))    $("profPhone").value    = p.phone      || "";
      if ($("profLang"))     $("profLang").value     = p.language   || "";
    }
  } catch (e) { /* ignore – fields stay empty */ }
  editor.style.display = "block";
}

async function saveProfile() {
  const token = await getToken();
  const statusEl = $("profileSaveStatus");
  const payload = {
    full_name:  ($("profName")     || {}).value || "",
    major_crop: ($("profCrop")     || {}).value || "",
    state:      ($("profState")    || {}).value || "",
    district:   ($("profDistrict") || {}).value || "",
    taluk:      ($("profTaluk")    || {}).value || "",
    phone:      ($("profPhone")    || {}).value || "",
    language:   ($("profLang")     || {}).value || "",
  };
  try {
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      if (statusEl) { statusEl.textContent = "Saved \u2713"; setTimeout(() => statusEl.textContent = "", 3000); }
    } else {
      const d = await res.json().catch(() => ({}));
      alert("Save failed: " + (d.error || res.statusText));
    }
  } catch (e) { alert("Network error saving profile."); }
}

/* ── Auth-aware community helpers ─────────────────────────────────────────── */

/** POST JSON with auth token. Returns { ok, data }. */
async function authFetch(url, payload = {}) {
  const token = await getToken();
  payload.supabase_token = token;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function authVotePost(postId, btn) {
  const user = await getUser();
  if (!user) { alert("Please sign in to vote."); return; }
  const { ok, data } = await authFetch("/community/vote_post", { post_id: postId });
  if (ok && data.success) {
    const span = btn.querySelector("span") || btn;
    if (span.tagName === "SPAN") span.textContent = data.upvotes;
    else btn.textContent = "\u25B2 " + data.upvotes;
    btn.classList.toggle("voted", data.voted);
  } else if (data.error) {
    alert(data.error);
  }
}

async function authVoteReply(replyId, btn) {
  const user = await getUser();
  if (!user) { alert("Please sign in to vote."); return; }
  const { ok, data } = await authFetch("/community/vote_reply", { reply_id: replyId });
  if (ok && data.success) {
    btn.querySelector("span").textContent = data.upvotes;
    btn.classList.toggle("voted", data.voted);
  } else if (data.error) {
    alert(data.error);
  }
}

async function authMarkSolution(replyId, postId) {
  const user = await getUser();
  if (!user) { alert("Please sign in to mark a solution."); return; }
  if (!confirm("Mark this reply as the accepted solution?")) return;
  const { ok, data } = await authFetch("/community/solve", { reply_id: replyId, post_id: postId });
  if (ok && data.success) location.reload();
  else if (data.error) alert(data.error);
}

async function authSubmitReply(postId) {
  const user = await getUser();
  if (!user) { alert("Please sign in to reply."); return; }
  const body = ($("replyBody") || {}).value?.trim();
  if (!body) { alert("Please write a reply first."); return; }
  const author = ($("replyAuthor") || {}).value?.trim() || "Anonymous Farmer";

  const { ok, data } = await authFetch("/community/reply", { post_id: postId, body, author });
  if (ok && data.success) {
    if ($("replyBody")) $("replyBody").value = "";
    location.reload();
  } else {
    alert("Error posting reply: " + (data.error || "Unknown error"));
  }
}

/* ── Expose to global scope (called from onclick in templates) ───────────── */
window.authSignup        = authSignup;
window.authLogin         = authLogin;
window.authLogout        = authLogout;
window.guardAsk          = guardAsk;
window.openProfileEditor = openProfileEditor;
window.saveProfile       = saveProfile;
window.getToken          = getToken;
window.getUser           = getUser;
window.authFetch         = authFetch;
window.authVotePost      = authVotePost;
window.authVoteReply     = authVoteReply;
window.authMarkSolution  = authMarkSolution;
window.authSubmitReply   = authSubmitReply;

/* ── Init on load ─────────────────────────────────────────────────────────── */
sb();  // eagerly create client
refreshUI();

// Listen for auth changes (e.g. email confirmation redirect)
if (sb()) {
  sb().auth.onAuthStateChange((_event, _session) => {
    refreshUI();
  });
}
