import { useCallback } from "react";

export default function useApi(base = "") {
  const buildUrl = (path) => `${base.replace(/\/$/, "")}/${path}`;

  const list = useCallback(
    async (resource) => {
      const res = await fetch(buildUrl(resource));
      if (!res.ok) throw new Error("API list failed");
      return await res.json();
    },
    [base]
  );

  const create = useCallback(
    async (resource, body) => {
      const res = await fetch(buildUrl(resource), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API create failed: ${text}`);
      }
      return await res.json();
    },
    [base]
  );

  const remove = useCallback(
    async (resource, id) => {
      const res = await fetch(buildUrl(`${resource}/${id}`), {
        method: "DELETE",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API delete failed: ${text}`);
      }
      return await res.json();
    },
    [base]
  );

  return { list, create, remove };
}