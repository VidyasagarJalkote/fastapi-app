async function request(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail)) detail = body.detail.map((d) => d.msg).join(", ");
    } catch {}
    throw new Error(detail);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  list: () => request("/api/items"),
  create: (item) => request("/api/items", { method: "POST", body: JSON.stringify(item) }),
  update: (id, item) => request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(item) }),
  remove: (id) => request(`/api/items/${id}`, { method: "DELETE" }),
};
