// src/pages/managementShop.jsx
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, _ } from "gridjs-react";
import { API_URL, apiFetch } from "../lib/api";
import { Navbar, Footer } from "../components";
import Swal from "sweetalert2";

// SVG fallback (ไม่พึ่งเน็ต)
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>
      <rect width='100%' height='100%' fill='#f3f4f6'/>
      <path d='M16 56l12-14 9 11 14-18 13 21H16z' fill='#d1d5db'/>
      <circle cx='30' cy='25' r='6' fill='#d1d5db'/>
    </svg>`
  );

export default function ManagementShop() {
  const navigate = useNavigate();

  const [rowsData, setRowsData] = useState([]);

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/category`);
        const data = await res.json();
        // รองรับทั้ง {result: [...] } หรือ [...]
        const list = data?.result ?? data ?? [];
        setCategories(list);
      } catch (e) {
        console.error("load categories", e);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return null; }
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
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(1);
  const [nameError, setNameError] = useState("");
  const lastRawRef = useRef([]);          // เก็บ rows ล่าสุด (array)
  const lastDataHashRef = useRef(null);   // เก็บ hash/string ของ rows ล่าสุด
  const [isFetching, setIsFetching] = useState(false);

  // debounce search input to avoid rapid server prop changes (reduces Grid re-init)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200); // ให้ไวขึ้น
    return () => clearTimeout(t);
  }, [search]);
 
  // immediate local filter for snappy UI while user is typing
  useEffect(() => {
    try {
      const raw = lastRawRef.current || [];
      if (!search) {
        // restore full rows from last fetch
        setRowsData(raw);
        return;
      }
      const q = String(search).toLowerCase().trim();
      if (!q) {
        setRowsData(raw);
        return;
      }
      const filtered = raw.filter((p) => String(p?.name || "").toLowerCase().includes(q));
      setRowsData(filtered);
    } catch {
      // ignore
    }
  }, [search]);

  const emptyForm = { name: "", price: "", stock: "", category_id: "", image_url: "", image_file: null };
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const serverUrl = useMemo(() => {
    const params = new URLSearchParams({
      search: debouncedSearch,
      page: String(page),
      limit: String(limit),
      _r: String(refreshKey),
    });
    return `${API_URL}/api/products?${params.toString()}`;
  }, [debouncedSearch, page, limit, refreshKey]);

  const thenFn = useCallback((res) => {
    const rows = res?.result?.rows ?? res?.result ?? [];
    const t = res?.total ?? res?.result?.total ?? rows.length;

    setTotal(Number(t) || 0);

    try {
      const str = JSON.stringify(rows || []);
      if (lastDataHashRef.current !== str) {
        lastDataHashRef.current = str;
        lastRawRef.current = rows;
        setRowsData(rows);
      }
    } catch {
      lastRawRef.current = rows;
      setRowsData(rows);
    } finally {
      setIsFetching(false);
    }

    // คืนข้อมูลตามจำนวนคอลัมน์ใน Grid (5 คอลัมน์ + 1 ช่อง dummy)
    return rows.map((p, i) => [{ ...p, _rowIndex: rows.length - i - 1 }, p, p, p, p, null]);
  }, []);

  // 2) ตัวช่วย refetch สำหรับ mobile และไว้เรียกหลังบันทึก/ลบ
  const refetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const res = await fetch(serverUrl, { headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      thenFn(data);            // อัปเดต rowsData/total ให้ฝั่ง mobile
    } catch (e) {
      console.error("refetch failed", e);
    } finally {
      setIsFetching(false);
    }
  }, [serverUrl, thenFn]);

    useEffect(() => {
    const isOpen = Boolean(openForm || toDelete);
    // blur any active element first to avoid "aria-hidden on an element because its descendant retained focus" error
    try {
      const active = document.activeElement;
      if (isOpen && active instanceof HTMLElement && document.body.contains(active)) {
        active.blur();
      }
    } catch (e) {
      /* ignore */
    }

    window.dispatchEvent(new CustomEvent('app:modal', { detail: isOpen }));

    // lock body scroll when modal open
    document.body.classList.toggle('overflow-hidden', isOpen);

    return () => {
      window.dispatchEvent(new CustomEvent('app:modal', { detail: false }));
      document.body.classList.remove('overflow-hidden');
    };
  }, [openForm, toDelete]);

  // ---------- actions ----------
  const handleEdit = useCallback((p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      price: p.price || "",
      stock: p.stock || "",
      category_id: p.category_id || "",
      image_url: p.image_url || "",
      image_file: null,
    });
    setImagePreview(p.image_url || "");
    setNameError("");
    setOpenForm(true);
  }, []);

  const handleDelete = useCallback((p) => setToDelete(p), []);

  async function confirmDelete() {
    if (!toDelete?.product_id) return;
    try {
      await apiFetch(`/api/products/${toDelete.product_id}`, { method: "DELETE" });
      setToDelete(null);
      setRefreshKey((k) => k + 1);
      await refetch();
      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "ลบเรียบร้อย",
        showConfirmButton: false,
        timer: 1400,
      });
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "ลบไม่สำเร็จ",
        text: err?.message || "เกิดข้อผิดพลาดในการลบ",
        confirmButtonColor: "#d33",
      });
    }
  }

  // ---------- submit (upload -> save) ----------
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name?.trim()) {
      await Swal.fire({ icon: "warning", title: "กรุณากรอกชื่อสินค้า", confirmButtonColor: "#3085d6" });
      return;
    }

    // 1) upload image ถ้าเลือกไฟล์
    let uploadedUrl = editing?.image_url || form.image_url || "";
    if (form.image_file instanceof File) {
      const fd = new FormData();
      fd.append("image", form.image_file); // field ต้องชื่อ image
      const upRes = await fetch(`${API_URL}/api/products/upload-firebase`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}` },
        body: fd, // ห้ามตั้ง Content-Type เอง
      });
      if (!upRes.ok) {
        const txt = await upRes.text().catch(() => "");
        await Swal.fire({
          icon: "error",
          title: "อัปโหลดรูปไม่สำเร็จ",
          text: `Upload failed ${upRes.status} ${txt}`,
          confirmButtonColor: "#d33",
        });
        return;
      }
      const { downloadURL } = await upRes.json();
      uploadedUrl = downloadURL || "";
    }

    // 2) save JSON
    const payload = {
      name: form.name.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      image_url: uploadedUrl || null,
      category_id: form.category_id ? Number(form.category_id) : null,
    };

    try {
      if (editing?.product_id) {
        await apiFetch(`/api/products/${editing.product_id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch(`/api/products`, { method: "POST", body: JSON.stringify(payload) });
      }
      // reset
      setOpenForm(false);
      setEditing(null);
      setForm(emptyForm);
      setImagePreview("");
      setRefreshKey((k) => k + 1);
      await refetch();

      await Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: editing ? "แก้ไขเรียบร้อย" : "สร้างสินค้าเรียบร้อย",
        showConfirmButton: false,
        timer: 1400,
      });
    } catch (err) {
      const msg = String(err?.message || "");
      if (msg.includes("409") || msg.includes("already exists") || msg.includes("ชื่อนี้")) {
        setNameError("ชื่อนี้มีอยู่แล้ว กรุณาเปลี่ยนชื่อสินค้า");
        return;
      }
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "บันทึกไม่สำเร็จ",
        text: err?.message || "เกิดข้อผิดพลาดในการบันทึก",
        confirmButtonColor: "#d33",
      });
    }
  }

  // ---------- columns ----------

const columns = useMemo(() => [
  { id: "raw",name: "RAW", hidden: true },

  // Product
  {
    id: "product",
    name: "Product",
    width: "32rem",
    formatter: (_c, row) => {
      const p = row.cells[0].data;
      return _(
        <div className="flex items-center gap-3">
          <img
            src={p.image_url || FALLBACK_IMG}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 flex-none rounded-xl object-cover ring-1 ring-gray-200"
            onError={(e) => {
              if (e.currentTarget.dataset.fallback) return;
              e.currentTarget.dataset.fallback = "1";
              e.currentTarget.src = FALLBACK_IMG;
            }}
          />
          <div className="min-w-0 leading-tight">
            <div className="truncate font-medium text-gray-900">{p.name}</div>
            <div className="text-xs text-gray-500"> No: {p._rowIndex + 1} (ID: {p.product_id})</div>
          </div>
        </div>
      );
    },
  },

  // Category
  {
    id: "category",
    name: "Category",
    width: "12rem",
    formatter: (_c, row) =>
      _(
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 ring-1 ring-gray-200">
          {row.cells[0].data.category_name || "-"}
        </span>
      ),
  },

  // Price — ชิดขวาภายในเซลล์
  {
    id: "price",
    name: _(<div className="text-right">Price</div>),
    width: "8rem",
    formatter: (_c, row) =>
      _(
        <div className="text-right pr-4 font-semibold tabular-nums">
          ฿{Number(row.cells[0].data.price || 0).toLocaleString("th-TH")}
        </div>
      ),
  },

  // Stock — ชิดขวาภายในเซลล์
  {
    id: "stock",
    name: _(<div className="text-right">Stock</div>),
    width: "7rem",
    formatter: (_c, row) => {
      const n = Number(row.cells[0].data.stock || 0);
      return _(
        <div className={`text-right pr-4 tabular-nums ${n <= 5 ? "text-rose-600 font-semibold" : "text-gray-900"}`}>
          {n}
        </div>
      );
    },
  },

  // Actions — ไม่ชิดขอบขวา
  {
    id: "actions",
    name: _(<div className="text-right">Actions</div>),
    width: "9rem",
    formatter: (_c, row) => {
      const p = row.cells[0].data;
      return _(
        <div className="flex justify-end pr-6 gap-2">
          <button
            title="Edit"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => handleEdit(p)}
          >
            <i class='bx bx-edit'></i>
          </button>
          <button
            title="Delete"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
            onClick={() => handleDelete(p)}
          >
            <i class='bx bx-trash'></i>
          </button>
        </div>
      );
    },
  },
], [handleEdit, handleDelete]);

  const serverConfig = useMemo(() => ({
    url: serverUrl,
    headers: { "Content-Type": "application/json" },
    then: thenFn,
  }), [serverUrl, thenFn]);

  // เมื่อ serverUrl เปลี่ยน ให้ตั้ง isFetching = true เพื่อแสดง spinner
  useEffect(() => {
    setIsFetching(true);
  }, [serverUrl]);
 
   const rowAttr = useCallback(() => ({ className: "hover:bg-gray-50" }), []);


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Topbar */}
        <div className="mb-5 grid gap-2 md:flex md:items-center md:justify-between">
          {/* ซ้าย: ชื่อหน้า + จำนวนทั้งหมด */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold items-center justify-center">Management</h1>
            <span className="hidden md:inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 ring-1 ring-gray-200">
              Total: <b>{total}</b>
            </span>
          </div>

          {/* ขวา: คอนโทรล (responsive) */}
          <div className="grid grid-cols-2 gap-2 md:flex md:items-center">
            {/* Search เต็มแถวบนมือถือ */}
            <div className="relative col-span-2 md:col-auto w-full md:w-[280px] lg:w-[340px]">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <div className="relative">
                <input
                 className="w-full rounded-xl border border-gray-200 bg-white px-9 py-2 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                 placeholder="Search by name …"
                 value={search}
                 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
               />
                {/* spinner ขวาเมื่อกำลัง fetch จริง หรือเมื่อ debounced ยังไม่ทันอัพเดต */}
                {(isFetching || search !== debouncedSearch) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="h-4 w-4 animate-spin text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* page -> ให้มาอยู่ซ้ายสุดบนมือถือ */}
            <div className="flex items-center gap-1 text-sm order-2 md:order-none">
              <span className="text-gray-500">page</span>
              <select
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-2 py-1"
              >
                {Array.from({ length: Math.max(1, Math.ceil(total / limit)) }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <span className="text-gray-500">
                / {Math.max(1, Math.ceil(total / limit))}
              </span>
            </div>

            {/* per page -> ให้ไปอยู่ขวาสุดบนมือถือ */}
            <div className="flex items-center gap-1 text-sm order-3 justify-end md:order-none">
              <span className="text-gray-500">per page</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-gray-200 px-2 py-1"
              >
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* + Add: มือถือ = เต็มแถว, เดสก์ท็อป = ขนาดปกติ */}
            <button
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setImagePreview("");
                setNameError("");
                setOpenForm(true);
              }}
              className="col-span-2 order-4 md:order-none w-full md:w-auto rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Mobile list (md:hidden) */}
        <div className="md:hidden space-y-3">
          {rowsData.map((p) => {
            const stockLow = Number(p.stock || 0) <= 5;
            return (
              <div key={p.product_id}
                  className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                <img
                  src={p.image_url || FALLBACK_IMG}
                  loading="lazy"
                  className="h-14 w-14 flex-none rounded-xl object-cover ring-1 ring-gray-200"
                  onError={(e) => {
                    if (e.currentTarget.dataset.fallback) return;
                    e.currentTarget.dataset.fallback = "1";
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">No: {rowsData.indexOf(p) + 1} (ID: {p.product_id})</div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 ring-1 ring-gray-200">
                      {p.category_name || "-"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                      ฿{Number(p.price||0).toLocaleString("th-TH")}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1
                                      ${stockLow ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-gray-50 text-gray-700 ring-gray-200"}`}>
                      {p.stock}
                    </span>
                  </div>
                </div>

                <div className="flex flex-none items-center gap-2 pl-1">
                  <button
                    title="แก้ไข"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => handleEdit(p)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M3 17.25V21h3.75l11-11.03-3.75-3.75L3 17.25zm14.71-9.04a1 1 0 000-1.41l-1.51-1.5a1 1 0 00-1.41 0l-1.13 1.13 3.75 3.75 1.3-1.47z"/>
                    </svg>
                  </button>
                  <button
                    title="ลบ"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                    onClick={() => handleDelete(p)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Card + Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hidden md:block overflow-x-auto">
          {/* memoize static prop objects to avoid Grid re-init */}
          {(() => {
            const gridClass = useMemo(() => ({
              container: "rounded-2xl border border-gray-200 bg-white shadow-sm",
              table: "min-w-full table-fixed text-sm",
              thead: "bg-gray-50",
              th: "px-6 py-3 text-xs font-semibold text-gray-600 border-b border-gray-200",
              td: "px-6 py-4 align-middle border-b border-gray-100",
              footer: "hidden",
            }), []);

            const gridStyle = useMemo(() => ({ table: { borderSpacing: 0 } }), []);
            const gridLang = useMemo(() => ({ noRecordsFound: "ไม่พบสินค้า", loading: "กำลังโหลด…" }), []);

            // memoize Grid node so it only re-creates when columns / serverConfig / rowAttr change
            const gridNode = useMemo(() => (
              <Grid
                columns={columns}
                server={serverConfig}
                pagination={false}
                sort={false}
                search={false}
                className={gridClass}
                rowAttributes={rowAttr}
                style={gridStyle}
                language={gridLang}
              />
            ), [columns, serverConfig, rowAttr, gridClass, gridStyle, gridLang]);

            return gridNode;
          })()}
        </div>

        {/* Modal: form */}
        {openForm && (
          <Modal title={editing ? "Edit" : "Add"} onClose={() => setOpenForm(false)}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextBox label="Product name" value={form.name}
                onChange={(v) => { setNameError(""); setForm((s) => ({ ...s, name: v })); }}
                required error={nameError} />
              <NumberBox label="Price" value={form.price} onChange={(v) => setForm((s) => ({ ...s, price: v }))} min={0} />
              <NumberBox label="Stock" value={form.stock} onChange={(v) => setForm((s) => ({ ...s, stock: v }))} min={0} />
              <CategorySelect
                label="Category"
                value={form.category_id}
                loading={catLoading}
                options={categories.map(c => ({ label: c.name, value: c.category_id }))}
                onChange={(val) => setForm((s) => ({ ...s, category_id: val }))}
              />
              <FileBox label="Image" preview={imagePreview}
                onChange={(f) => { setForm((s) => ({ ...s, image_file: f })); setImagePreview(f ? URL.createObjectURL(f) : (editing?.image_url || "")); }} />
              <div className="col-span-full mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setOpenForm(false)} className="rounded-xl border border-gray-300 px-4 py-2">Cancel</button>
                <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">Save</button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: delete */}
        {toDelete && (
          <Modal title="Do you want to delete it?" onClose={() => setToDelete(null)}>
            <p className="text-sm text-gray-600">Do you want to delete "<b>{toDelete.name}</b> " right ?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-xl border border-gray-300 px-4 py-2" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-500" onClick={confirmDelete}>Delete</button>
            </div>
          </Modal>
        )}
      </div>
      <Footer />
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
function TextBox({ label, value, onChange, placeholder, required, error }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-xl border px-3 py-2 outline-none focus:ring-2
          ${error ? "border-rose-400 focus:ring-rose-200" : "border-gray-200 focus:ring-blue-200"}`}
      />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
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
function FileBox({ label, preview, onChange }) {
  return (
    <div className="col-span-full">
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <div className="flex items-center gap-4">
        <img
          src={preview || FALLBACK_IMG}
          className="h-16 w-16 rounded-xl object-cover ring-1 ring-gray-200"
          onError={(e) => {
            if (e.currentTarget.dataset.fallback) return;
            e.currentTarget.dataset.fallback = "1";
            e.currentTarget.src = FALLBACK_IMG;
          }}
        />
        <input type="file" accept="image/*"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
      </div>
    </div>
  );
}

function CategorySelect({ label, value, onChange, options = [], loading }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-600">{label}</label>
      <div className="flex gap-2">
        <select
          value={value ?? ""}                 // "" = ยังไม่เลือก
          onChange={(e) => {
            const v = e.target.value;
            onChange(v ? Number(v) : "");     // เก็บเป็น number หรือว่าง
          }}
          disabled={loading || options.length === 0}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-50"
        >
          <option value="">{loading ? "Loading..." : "Select the category"}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {value === "" && !loading ? (
        <p className="mt-1 text-xs text-gray-500">Please Select the Category</p>
      ) : null}
    </div>
  );
}

