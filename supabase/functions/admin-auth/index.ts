import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createSessionToken, sha256Hex, verifyPassword } from "../_shared/crypto.ts";
import { hasPermission } from "../_shared/permissions.ts";

const SESSION_DAYS = 7;

const getServiceClient = () => {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error("Missing Supabase service configuration");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
};

const publicAdmin = (row) => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  status: row.status,
  lastLoginAt: row.last_login_at,
});

const readAdminToken = (req) => {
  const headerToken = req.headers.get("x-admin-token");
  if (headerToken) return headerToken.trim();
  const auth = req.headers.get("authorization") || "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return "";
};

const resolveSession = async (supabase, token) => {
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const nowIso = new Date().toISOString();
  const { data: session, error } = await supabase
    .from("admin_sessions")
    .select("id, admin_user_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (error || !session) return null;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("id, email, name, role, status, last_login_at, deleted_at")
    .eq("id", session.admin_user_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (adminError || !admin || admin.status !== "active") return null;
  return { session, admin };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";
    const supabase = getServiceClient();

    if (req.method === "POST" && action === "login") {
      const body = await req.json();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!email || !password) {
        return jsonResponse({ error: "Введите email и пароль" }, 400);
      }

      const { data: admin, error } = await supabase
        .from("admin_users")
        .select("id, email, name, role, status, password_hash, deleted_at")
        .eq("email", email)
        .is("deleted_at", null)
        .maybeSingle();

      if (error || !admin || admin.status !== "active") {
        return jsonResponse({ error: "Неверный email или пароль" }, 401);
      }

      const valid = await verifyPassword(password, admin.password_hash);
      if (!valid) {
        return jsonResponse({ error: "Неверный email или пароль" }, 401);
      }

      const token = createSessionToken();
      const tokenHash = await sha256Hex(token);
      const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const { error: sessionError } = await supabase.from("admin_sessions").insert({
        admin_user_id: admin.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        user_agent: req.headers.get("user-agent") || null,
      });

      if (sessionError) {
        return jsonResponse({ error: "Не удалось создать сессию" }, 500);
      }

      await supabase
        .from("admin_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", admin.id);

      return jsonResponse({
        token,
        expiresAt,
        admin: publicAdmin(admin),
      });
    }

    if (req.method === "POST" && action === "logout") {
      const token = readAdminToken(req);
      if (token) {
        const tokenHash = await sha256Hex(token);
        await supabase
          .from("admin_sessions")
          .update({ revoked_at: new Date().toISOString() })
          .eq("token_hash", tokenHash)
          .is("revoked_at", null);
      }
      return jsonResponse({ ok: true });
    }

    if (req.method === "GET" && action === "session") {
      const resolved = await resolveSession(supabase, readAdminToken(req));
      if (!resolved) {
        return jsonResponse({ error: "Сессия недействительна" }, 401);
      }
      return jsonResponse({
        admin: publicAdmin(resolved.admin),
        expiresAt: resolved.session.expires_at,
      });
    }

    if (req.method === "POST" && action === "authorize") {
      const body = await req.json();
      const permission = body.permission ? String(body.permission) : null;
      const resolved = await resolveSession(supabase, readAdminToken(req));
      if (!resolved) {
        return jsonResponse({ error: "Сессия недействительна" }, 401);
      }
      if (!hasPermission(resolved.admin.role, permission)) {
        return jsonResponse({ error: "Недостаточно прав" }, 403);
      }
      return jsonResponse({
        ok: true,
        admin: publicAdmin(resolved.admin),
      });
    }

    return jsonResponse({ error: "Unknown action" }, 404);
  } catch {
    return jsonResponse({ error: "Ошибка сервера" }, 500);
  }
});
