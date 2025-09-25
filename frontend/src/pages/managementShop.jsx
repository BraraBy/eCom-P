import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, _ } from "gridjs-react";
import { h } from "gridjs";
import "gridjs/dist/theme/mermaid.css";
import { API_URL, apiFetch } from "../lib/api";

export default function ManagementShop() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  // guard เฉพาะ shop/admin
  useEffect(() => {
    if (!user) return navigate("/login", { replace: true });
    const role = user.rolename || user.role || user.role_name;
    const isShop = role === "shop" || role === "admin" || user.role_id === 2;
    if (!isShop) navigate("/", { replace: true });
  }, [user, navigate]);

  // states
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(1);
  const token = localStorage.getItem("accessToken");

  const emptyForm = {
    name: "",
    price: "",
    stock: "",
    image_url: "",
    category_id: "",
    image_file: null // New field for file upload
  };
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);

  // Add imagePreview state
  const [imagePreview, setImagePreview] = useState("");

  const serverUrl = useMemo(() => {
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    return `${API_URL}/api/products?${params.toString()}`;
  }, [search, page, limit]);

  // ---------- Columns ----------
  const columns = [
    {
      id: "product",  // Added explicit ID
      name: "Product",
      width: "28rem",
      formatter: (cell, row) => {
        const p = row.cells[0].data;
        return _(
          <div className="flex items-center gap-3">
            <img
              src={p.image_url || "https://via.placeholder.com/80"}
              className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-200"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/80")}
            />
            <div className="leading-tight">
              <div className="font-semibold text-gray-800">{p.name}</div>
              <div className="text-xs text-gray-500">ID: {p.product_id}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      name: "Category",
      width: "10rem",
      formatter: (cell, row) => {
        const p = row.cells[0].data;
        return _(<span className="text-gray-700">{p.category_name || "-"}</span>);
      }
    },
    {
      id: "price",
      name: "Price",
      width: "8rem",
      formatter: (cell, row) => {
        const p = row.cells[0].data;
        return _(<span className="text-right">฿{Number(p.price || 0).toLocaleString()}</span>);
      },
      attributes: { className: "text-right" }
    },
    {
      id: "stock",
      name: "Stock",
      width: "7rem",
      formatter: (cell, row) => {
        const p = row.cells[0].data;
        return _(
          <span className={`text-right ${Number(p.stock) <= 5 ? "text-red-600 font-semibold" : ""}`}>
            {Number(p.stock).toLocaleString()}
          </span>
        );
      },
      attributes: { className: "text-right" }
    },
    {
      id: "actions",
      name: "Actions",
      width: "8rem",
      formatter: (cell, row) => {
        const p = row.cells[0].data;
        return _(
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleEdit(p)}
              className="rounded-lg border border-gray-300 p-1 hover:bg-gray-100"
            >
              <i className="bx bx-edit text-lg text-gray-500" />
            </button>
            <button
              onClick={() => handleDelete(p)}
              className="rounded-lg border border-gray-300 p-1 hover:bg-gray-100"
            >
              <i className="bx bx-trash text-lg text-gray-500" />
            </button>
          </div>
        );
      }
    }
  ];

  // ---------- Server (สำคัญ: ส่งค่าเท่าจำนวนคอลัมน์) ----------
  const serverConfig = {
    url: serverUrl,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    then: (res) => {
      const rows = res?.result?.rows ?? res?.result ?? [];
      const t = res?.total ?? res?.result?.total ?? rows.length;
      setTotal(Number(t) || 0);
      // ต้องคืนข้อมูลเท่ากับจำนวนคอลัมน์ทั้งหมด (6 คอลัมน์: RAW, Product, Category, Price, Stock, Actions)
      return rows.map((p) => [p, p, p, p, null]);
    },
  };

  // ---------- CRUD ----------
async function handleSubmit(e) {
  e.preventDefault();
  if (!form.name?.trim()) return alert("Please enter product name");

  try {
    let waitForID = null;
    // First create the product
    const payload = {
      name: form.name.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    if (editing?.product_id) {
      const updated = await apiFetch(`/api/products/${editing.product_id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      waitForID = editing.product_id;
    } else {
      const created = await apiFetch('/api/products', {
        method: "POST",
        body: JSON.stringify(payload)
      });
      waitForID = created.result.product_id;
    }

    // Then upload image if selected
    if (form.image_file) {
      const firebaseForm = new FormData();
      firebaseForm.append('product_id', waitForID);
      firebaseForm.append('image', form.image_file);

      const uploadRes = await fetch(`${API_URL}/api/products/upload-firebase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: firebaseForm
      });

      if (!uploadRes.ok) {
        throw new Error('Image upload failed');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.downloadURL;

      // Update product with image URL
      await apiFetch(`/api/products/${waitForID}`, {
        method: "PUT",
        body: JSON.stringify({ image_url: imageUrl })
      });
    }

    setOpenForm(false);
    setEditing(null);
    setForm(emptyForm);
    setImagePreview("");
    setRefreshKey(k => k + 1);
  } catch (err) {
    console.error(err);
    alert(err.message || "Save failed");
  }
}


  async function confirmDelete() {
    if (!toDelete?.product_id) return;
    try {
      await apiFetch(`/api/products/${toDelete.product_id}`, { method: "DELETE" });
      setToDelete(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      alert("ลบไม่สำเร็จ");
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup object URLs when component unmounts
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Top bar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Management</h1>
          <span className="hidden sm:inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 ring-1 ring-gray-200">
            สินค้าทั้งหมด: <b>{total}</b>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-[260px] rounded-xl border border-gray-200 bg-white px-9 py-2 text-sm outline-none ring-0 focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
              placeholder="ค้นหาด้วยชื่อหรือหมวดหมู่…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">หน้า</span>
            <select value={page} onChange={(e) => setPage(Number(e.target.value))} className="rounded-lg border border-gray-200 px-2 py-1">
              {Array.from({ length: Math.max(1, Math.ceil(total / limit)) }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="text-gray-500">/ {Math.max(1, Math.ceil(total / limit))}</span>

            <span className="ml-3 text-gray-500">แถวต่อหน้า</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 px-2 py-1"
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setOpenForm(true);
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500"
          >
            + เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Card + Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        <Grid
          key={refreshKey}
          columns={columns}
          server={serverConfig}
          pagination={false}
          sort={false}
          search={false}
          resizable={false}          // ⛔️ ตัดเส้นตั้งของตัวปรับขนาดคอลัมน์
          className={{
            table: "min-w-full border-separate border-spacing-0",
            thead: "sticky top-0 z-10 bg-gray-50",
            th: "px-4 py-3 font-semibold text-gray-600 border-b border-gray-200",
            td: "px-4 py-3 border-t border-gray-100",
            footer: "hidden",
            container: "rounded-xl overflow-hidden",
          }}
          style={{
            table: { borderCollapse: 'separate' }
          }}
          language={{ noRecordsFound: "ไม่พบสินค้า", loading: "กำลังโหลด…" }}
        />
      </div>

      {/* Modal: ฟอร์ม */}
      {openForm && (
        <Modal title={editing ? "แก้ไขสินค้า" : "เพิ่มสินค้า"} onClose={() => setOpenForm(false)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextBox label="ชื่อสินค้า" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} required />
            <NumberBox label="ราคา" value={form.price} onChange={(v) => setForm((s) => ({ ...s, price: v }))} min={0} step="0.01" />
            <NumberBox label="สต๊อก" value={form.stock} onChange={(v) => setForm((s) => ({ ...s, stock: v }))} min={0} />
            <ImageUpload
              label="Product Image"
              value={form.image_file}
              preview={imagePreview || form.image_url}
              onChange={(file) => {
                setForm(prev => ({ ...prev, image_file: file }));
                setImagePreview(URL.createObjectURL(file));
              }}
            />
            <NumberBox label="หมวดหมู่ (category_id)" value={form.category_id} onChange={(v) => setForm((s) => ({ ...s, category_id: v }))} min={0} />
            <div className="col-span-full mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setOpenForm(false)} className="rounded-xl border border-gray-300 px-4 py-2">
                ยกเลิก
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
                บันทึก
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: ลบ */}
      {toDelete && (
        <Modal title="ลบสินค้า?" onClose={() => setToDelete(null)}>
          <p className="text-sm text-gray-600">ต้องการลบ <b>{toDelete.name}</b> ใช่ไหม</p>
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-xl border border-gray-300 px-4 py-2" onClick={() => setToDelete(null)}>
              ยกเลิก
            </button>
            <button className="rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-500" onClick={confirmDelete}>
              ลบ
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- UI helpers ---------- */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function TextBox({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
function NumberBox({ label, value, onChange, min, step }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        step={step}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
      />
    </div>
  );
}
function ImageUpload({ label, value, onChange, preview }) {
  const inputRef = useRef(null);

  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <div 
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 hover:bg-gray-100"
      >
        {preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="mb-2 h-32 w-32 rounded-lg object-cover"
          />
        ) : (
          <div className="text-center">
            <i className="bx bx-upload mb-1 text-2xl text-gray-400" />
            <div className="text-sm text-gray-500">Click to upload image</div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}
