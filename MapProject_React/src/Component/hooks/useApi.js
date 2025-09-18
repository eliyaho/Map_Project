import { useCallback } from "react";

export default function useApi(base = "") {
  const buildUrl = (path) => `${base.replace(/\/$/, "")}/${path}`;

  const list = useCallback(
    async (resource) => {
      try {
        const res = await fetch(buildUrl(resource));
        if (!res.ok) throw new Error("API list failed");
        return await res.json();
      } catch (error) {
        console.error("API error:", error);
        throw error;
      }
    },
    [base]
  );

  const create = useCallback(
    async (resource, body) => {
      try {
        console.log("📤 Sending to API:", buildUrl(resource), body);
        
        const res = await fetch(buildUrl(resource), {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        
        console.log("📥 Response status:", res.status);
        
        if (!res.ok) {
          const text = await res.text();
          console.error("❌ Server error:", text);
          throw new Error(`API error: ${res.status} - ${text}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("🔥 API error:", error);
        throw error;
      }
    },
    [base]
  );

  const remove = useCallback(
    async (resource, id) => {
      try {
        const res = await fetch(buildUrl(`${resource}/${id}`), {
          method: "DELETE",
        });
        
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API delete failed: ${res.status} - ${text}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("API error:", error);
        throw error;
      }
    },
    [base]
  );

  return { list, create, remove };
}