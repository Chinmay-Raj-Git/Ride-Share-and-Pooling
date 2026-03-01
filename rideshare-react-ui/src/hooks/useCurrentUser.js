import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

/**
 * Fetches the current user's profile on mount.
 * If the request fails (unauthenticated), optionally redirects to /login.
 *
 * @param {boolean} redirectOnFail - redirect to /login on auth failure (default: false)
 * @returns {{ user, loading }}
 */
export function useCurrentUser(redirectOnFail = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiRequest("/api/profile");
        if (res.ok) {
          setUser(await res.json());
        } else {
          console.error("Profile load failed:", res.status);
          if (redirectOnFail) navigate("/login");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (redirectOnFail) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { user, loading };
}
