import { useEffect, useMemo, useState } from "react";
import {
  apiListAllPromos,
  apiCreatePromo,
  apiDeletePromo,
  apiUpdatePromo,
  apiSetScope,
} from "../api/promotions";
import { Navbar, Footer } from "../components";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

/* ---------- SweetAlert helpers ---------- */
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
});

/* ---------- Small UI helpers ---------- */
function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <section className={`rounded-2xl border bg-white shadow-sm ${className}`}>
      {(title || right) && (
        <header className="px-5 py-4 border-b bg-gray-50/70 rounded-t-2xl flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </label>
  );
}

function InputShell({ prefix, suffix, children }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute inset-y-0 left-0 grid place-items-center pl-3 text-sm text-gray-500">
          {prefix}
        </span>
      )}
      {children}
      {suffix && (
        <span className="absolute inset-y-0 right-0 grid place-items-center pr-3 text-sm text-gray-500">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-800",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[color]}`}>
      {children}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse grid grid-cols-1 gap-3">
      <div className="h-4 w-44 bg-gray-200 rounded" />
      <div className="h-3 w-72 bg-gray-200 rounded" />
      <div className="h-3 w-56 bg-gray-200 rounded" />
    </div>
  );
}

export default function PromotionsManage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

    const [f, setF] = useState({
    title: "",
    description: "",
    code: "",
    kind: "percent",
    discount_percent: "10",
    discount_amount: "",
    min_order_amount: "0",
    starts_at: "",
    ends_at: "",
    active: true,
    max_total_uses: "",
    max_uses_per_user: "",
    });
  const [scopeDraft, setScopeDraft] = useState({}); 

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiListAllPromos();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Swal.fire({ icon: "error", title: "Data loading failed", text: e.message || "Server error" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

    const canSubmit = useMemo(() => {
    if (!f.title || !f.code || !f.kind) return false;
    if (f.kind === "percent") {
        if (f.discount_percent === "") return false;
        const n = Number(f.discount_percent);
        if (!(n > 0 && n <= 100)) return false;
    } else {
        if (f.discount_amount === "") return false;
        const n = Number(f.discount_amount);
        if (!(n >= 0)) return false;
    }
    return true;
    }, [f]);

  const onCreate = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      Toast.fire({ icon: "warning", title: "Please fill out the promotional information completely first." });
      return;
    }
    setCreating(true);
    try {
      const body = {
        ...f,
        discount_percent: f.kind === "percent" ? Number(f.discount_percent) : null,
        discount_amount:  f.kind === "amount"  ? Number(f.discount_amount)  : null,
        min_order_amount: Number(f.min_order_amount || 0),
        starts_at: f.starts_at || null,
        ends_at:   f.ends_at   || null,
        active: true,
      };
      await apiCreatePromo(body);
      await Swal.fire({ icon: "success", title: "Successfully created a promotion", showConfirmButton: false, timer: 1400 });
      setF({
        title: "", description: "", code: "",
        kind: "percent", discount_percent: 10, discount_amount: null,
        min_order_amount: 0, starts_at: "", ends_at: "", active: true,
        max_total_uses: null, max_uses_per_user: null,
      });
      load();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Failed to create promotion", text: e.message || "Create failed" });
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await apiUpdatePromo(p.promotion_id, { active: !p.active });
      Toast.fire({ icon: "success", title: `${!p.active ? "Enable" : "Disabled"}: ${p.title}` });
      load();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Status update failed", text: e.message || "Update failed" });
    }
  };

  const del = async (p) => {
    const ask = await Swal.fire({
      icon: "warning",
      title: `Delete promotion "${p.title}" ?`,
      text: "Confirm deletion",
      showCancelButton: true,
      confirmButtonText: "delete",
      cancelButtonText: "cancel",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });
    if (!ask.isConfirmed) return;

    try {
      await apiDeletePromo(p.promotion_id);
      Toast.fire({ icon: "success", title: "Delete successfully" });
      load();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Delete failed", text: e.message || "Delete failed" });
    }
  };

  const applyScope = async (p) => {
    const draft = scopeDraft[p.promotion_id] || {};
    const product_ids = (draft.products || "").split(",").map(s => s.trim()).filter(Boolean).map(Number);
    const category_ids = (draft.categories || "").split(",").map(s => s.trim()).filter(Boolean).map(Number);
    try {
      await apiSetScope(p.promotion_id, { product_ids, category_ids });
      Toast.fire({ icon: "success", title: "Scope update completed successfully" });
      setScopeDraft(prev => ({ ...prev, [p.promotion_id]: { products: "", categories: "" } }));
    } catch (e) {
      Swal.fire({ icon: "error", title: "Scope recording failed", text: e.message || "Set scope failed" });
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      Toast.fire({ icon: "success", title: "Copied the code" });
    } catch {
      Toast.fire({ icon: "error", title: "Copy failed" });
    }
  };

  const Segmented = (
    <div className="inline-flex rounded-lg border bg-white p-0.5">
      <button
        type="button"
        onClick={() => setF(v => ({ ...v, kind: "percent", discount_amount: "" }))}
        className={`px-3 py-1.5 text-sm rounded-md ${f.kind === "percent" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
      >
        Percent
      </button>
      <button
        type="button"
        onClick={() => setF(v => ({ ...v, kind: "amount", discount_percent: "" }))}
        className={`px-3 py-1.5 text-sm rounded-md ${f.kind === "amount" ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
      >
        Amount
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold">Promotions Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create / edit / manage promotions and define their scope of use.</p>
        </div>

        {/* Create */}
        <Card
          title="Create a new promotion"
          subtitle="Specify the details of the promotion in both percentage and amount."
          right={Segmented}
          className="mb-6"
        >
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* รายละเอียด */}
            <Field label="Title" hint="Promotion name, such as 10% off the entire store.">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Promotion name"
                value={f.title}
                onChange={(e) => setF({ ...f, title: e.target.value })}
                required
              />
            </Field>

            <Field label="Code" hint="Coupon code such as OCT10">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Coupon code"
                value={f.code}
                onChange={(e) => setF({ ...f, code: e.target.value })}
                required
              />
            </Field>

            {f.kind === "percent" ? (
              <Field label="Discount Percent" hint="For example, 10 = 10% discount (1–100)">
                <InputShell suffix="%">
                  <input
                    type="number" min={1} max={100}
                    className="w-full border rounded-lg px-3 py-2 pr-8"
                    placeholder="10"
                    value={f.discount_percent}
                    onChange={(e) => setF({ ...f, discount_percent: e.target.value, discount_amount: null })}
                  />
                </InputShell>
              </Field>
            ) : (
              <Field label="Discount Amount" hint="For example, 100 = discount 100 baht (≥ 0)">
                <InputShell prefix="฿">
                  <input
                    type="number" min={0}
                    className="w-full border rounded-lg px-3 py-2 pl-8"
                    placeholder="100"
                    value={f.discount_amount ?? ""}
                    onChange={(e) => setF({ ...f, discount_amount: e.target.value, discount_percent: null })}
                  />
                </InputShell>
              </Field>
            )}

            <Field label="Min Order Amount (optional)" hint="Minimum order amount to use the promotion (leave blank = 0)">
              <InputShell prefix="฿">
                <input
                  type="number" min={0}
                  className="w-full border rounded-lg px-3 py-2 pl-8"
                  placeholder="500"
                  value={f.min_order_amount}
                  onChange={(e) => setF({ ...f, min_order_amount: e.target.value })}
                />
              </InputShell>
            </Field>

            {/* เวลา */}
            <Field label="Starts At" hint="If it is blank = you can use it.">
              <input
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2"
                value={f.starts_at}
                onChange={(e) => setF({ ...f, starts_at: e.target.value })}
              />
            </Field>
            <Field label="Ends At" hint="If blank = no deadline">
              <input
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2"
                value={f.ends_at}
                onChange={(e) => setF({ ...f, ends_at: e.target.value })}
              />
            </Field>

            {/* ลิมิต */}
            <Field label="Max total uses (optional)" hint="Total number of times available (blank = unlimited)">
              <input
                type="number" min={0}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="1000"
                value={f.max_total_uses ?? ""}
                onChange={(e) => setF({ ...f, max_total_uses: e.target.value ? Number(e.target.value) : null })}
              />
            </Field>
            <Field label="Max uses per user (optional)" hint="Number of times per user (blank = unlimited)">
              <input
                type="number" min={0}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="0"
                value={f.max_uses_per_user ?? ""}
                onChange={(e) => setF({ ...f, max_uses_per_user: e.target.value ? Number(e.target.value) : null })}
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Description" hint="A brief description of the promotion (optional)">
                <textarea
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2"
                  value={f.description}
                  onChange={(e) => setF({ ...f, description: e.target.value })}
                />
              </Field>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="submit"
                disabled={!canSubmit || creating}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Promotion"}
              </button>
            </div>
          </form>
        </Card>

        {/* List */}
        <Card title="All promotions">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border p-4"><SkeletonRow /></div>
              <div className="rounded-xl border p-4"><SkeletonRow /></div>
            </div>
          ) : list.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              <div className="mx-auto mb-3 w-16 h-16 rounded-full grid place-items-center bg-gray-100">
                <i className="bx bx-purchase-tag-alt text-2xl text-gray-500" />
              </div>
              No promotions yet — Try creating your first one above.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {list.map((p) => {
                const ends = p.ends_at ? new Date(p.ends_at) : null;
                const expired = ends ? ends.getTime() < Date.now() : false;
                return (
                  <div key={p.promotion_id} className={`rounded-xl border p-4 hover:shadow-sm transition ${expired ? "opacity-70" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold leading-tight truncate">{p.title}</span>
                          <Badge>{p.kind}</Badge>
                          {p.code && (
                            <button
                              onClick={() => copyCode(p.code)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
                              title="Copy coupon code"
                            >
                              <i className="bx bx-copy-alt text-base" /> {p.code}
                            </button>
                          )}
                          {p.active ? <Badge color="green">active</Badge> : <Badge>inactive</Badge>}
                          {expired && <Badge color="red">expired</Badge>}
                        </div>

                        {p.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                        )}

                        <div className="text-xs text-gray-500 mt-1 space-x-2">
                          {p.discount_percent != null && <span>{Number(p.discount_percent)}% off</span>}
                          {p.discount_amount != null && <span>฿{Number(p.discount_amount).toFixed(0)} off</span>}
                          {p.min_order_amount > 0 && <span>• min ฿{Number(p.min_order_amount).toFixed(0)}</span>}
                          {(p.starts_at || p.ends_at) && (
                            <span>
                              • {p.starts_at ? new Date(p.starts_at).toLocaleString() : "now"} → {p.ends_at ? new Date(p.ends_at).toLocaleString() : "∞"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col gap-2 items-end">
                        <button
                          onClick={() => toggleActive(p)}
                          className={`px-3 py-1.5 rounded-md text-sm border ${
                            p.active
                              ? "border-blue-600 text-blue-600 hover:bg-blue-50"
                              : "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                          }`}
                          title={p.active ? "Disable" : "Enable"}
                        >
                          {p.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => del(p)}
                          className="px-3 py-1.5 rounded-md text-sm border border-red-600 text-red-600 hover:bg-red-50"
                          title="delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Scope */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        className="border rounded-lg px-3 py-2 text-sm"
                        placeholder="product_id"
                        value={scopeDraft[p.promotion_id]?.products ?? ""}
                        onChange={(e) =>
                          setScopeDraft((prev) => ({
                            ...prev,
                            [p.promotion_id]: { ...(prev[p.promotion_id] || {}), products: e.target.value },
                          }))
                        }
                      />
                      <input
                        className="border rounded-lg px-3 py-2 text-sm"
                        placeholder="category_id"
                        value={scopeDraft[p.promotion_id]?.categories ?? ""}
                        onChange={(e) =>
                          setScopeDraft((prev) => ({
                            ...prev,
                            [p.promotion_id]: { ...(prev[p.promotion_id] || {}), categories: e.target.value },
                          }))
                        }
                      />
                      <button
                        onClick={() => applyScope(p)}
                        className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                      >
                        Apply Scope
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
}
