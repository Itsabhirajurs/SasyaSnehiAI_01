/**
 * Sashyasnehi AI – Supabase Auth (client-side)
 * Loaded as ES-module on ALL pages.
 *
 * Behaviour:
 *  - On every page (except /login) → check session.
 *    If NOT signed in → redirect to /login?next=<current path>
 *  - On /login page → this script is NOT loaded (login.html has its own inline auth).
 *  - Navbar shows user email + Sign-out button when signed in.
 *  - Community helpers (vote, reply, etc.) are still exposed globally.
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

/* ── Auth gate — redirect to /login if not signed in ─────────────────────── */
async function authGate() {
  const client = sb();
  if (!client) return;  // no Supabase config — skip gating

  const { data } = await client.auth.getSession();
  if (!data?.session) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace("/login?next=" + next);
  }
}

/* ── Navbar user controls ─────────────────────────────────────────────────── */
async function refreshNavbar() {
  const user = await getUser();
  const navUserEl = $("navUserControls");
  if (!navUserEl) return;

  if (user) {
    const displayName = user.user_metadata?.full_name || user.email || user.phone || "User";
    navUserEl.innerHTML =
      `<span style="color:var(--muted);font-size:0.85rem;font-weight:600;margin-right:6px;">` +
      `${displayName}</span>` +
      `<button class="btn-nav" onclick="authLogout()" style="font-size:0.82rem;padding:6px 14px;">Sign out</button>`;
    navUserEl.style.display = "flex";
  } else {
    navUserEl.innerHTML =
      `<a href="/login" class="btn-nav" style="font-size:0.82rem;padding:6px 14px;">Sign in</a>`;
    navUserEl.style.display = "flex";
  }

  // Auto-fill hidden supabase_token inputs (community_new form)
  if (user) {
    document.querySelectorAll("input[name='supabase_token']").forEach(el => {
      getToken().then(t => el.value = t);
    });
  }
}

/* ── Auth actions ─────────────────────────────────────────────────────────── */
async function authLogout() {
  const client = sb();
  if (client) await client.auth.signOut();
  window.location.replace("/login");
}

/* ── Profile ──────────────────────────────────────────────────────────────── */
async function openProfileEditor() {
  const editor = $("profileEditor");
  if (!editor) return;
  const isHidden = editor.style.display === "none" || !editor.style.display;
  if (!isHidden) { editor.style.display = "none"; return; }

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
  } catch (e) { /* ignore */ }
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
  if (!user) { window.location.href = "/login"; return; }
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
  if (!user) { window.location.href = "/login"; return; }
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
  if (!user) { window.location.href = "/login"; return; }
  if (!confirm("Mark this reply as the accepted solution?")) return;
  const { ok, data } = await authFetch("/community/solve", { reply_id: replyId, post_id: postId });
  if (ok && data.success) location.reload();
  else if (data.error) alert(data.error);
}

async function authSubmitReply(postId) {
  const user = await getUser();
  if (!user) { window.location.href = "/login"; return; }
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
window.authLogout        = authLogout;
window.openProfileEditor = openProfileEditor;
window.saveProfile       = saveProfile;
window.getToken          = getToken;
window.getUser           = getUser;
window.authFetch         = authFetch;
window.authVotePost      = authVotePost;
window.authVoteReply     = authVoteReply;
window.authMarkSolution  = authMarkSolution;
window.authSubmitReply   = authSubmitReply;

/* ── Init ─────────────────────────────────────────────────────────────────── */
sb();  // eagerly create client

// Gate: if not on /login, require auth
const path = window.location.pathname;
if (path !== "/login") {
  authGate();
}

// Update navbar user controls
refreshNavbar();

// React to auth state changes (e.g. token refresh, tab sync)
if (sb()) {
  sb().auth.onAuthStateChange((_event, _session) => {
    refreshNavbar();
  });
}
