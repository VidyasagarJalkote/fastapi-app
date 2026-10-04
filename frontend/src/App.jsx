import { useEffect, useState } from "react";
import { api } from "./api.js";

const emptyForm = { name: "", description: "", price: "" };

export default function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setItems(await api.list());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: String(item.price),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
    };
    try {
      if (editingId === null) await api.create(payload);
      else await api.update(editingId, payload);
      reset();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.remove(item.id);
      if (editingId === item.id) reset();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const editing = editingId !== null;

  return (
    <main className="page">
      <header className="top">
        <h1>Items</h1>
        <p className="count">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </header>

      {error && (
        <div className="error" role="alert">
          <span>{error}</span>
          <button className="link" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      <form className="panel" onSubmit={submit}>
        <h2>{editing ? "Edit item" : "Add an item"}</h2>
        <div className="fields">
          <label>
            Name
            <input name="name" value={form.name} onChange={change} required maxLength={100} />
          </label>
          <label>
            Price
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={change}
              required
            />
          </label>
          <label className="wide">
            Description
            <input name="description" value={form.description} onChange={change} maxLength={500} />
          </label>
        </div>
        <div className="actions">
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add item"}
          </button>
          {editing && (
            <button type="button" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="panel list">
        {loading ? (
          <p className="empty">Loading items…</p>
        ) : items.length === 0 ? (
          <p className="empty">No items yet. Add your first one above.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} className={item.id === editingId ? "active" : ""}>
                <div className="info">
                  <strong>{item.name}</strong>
                  {item.description && <span>{item.description}</span>}
                </div>
                <span className="price">{item.price.toFixed(2)}</span>
                <div className="row-actions">
                  <button onClick={() => startEdit(item)}>Edit</button>
                  <button className="danger" onClick={() => remove(item)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
