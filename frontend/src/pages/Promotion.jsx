import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { apiListActivePromos } from "../api/promotions";
import { Navbar,Footer } from "../components";

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const data = await apiListActivePromos();
        setPromos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse h-6 w-40 mb-6 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
            <Tag className="w-6 h-6" />
            <h1 className="text-2xl font-semibold">Promotions</h1>
        </div>

        {promos.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500 dark:text-gray-400">
            There are no active promotions.
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((p) => (
                <article
                key={p.promotion_id || p.id}
                className="rounded-2xl border p-4 hover:shadow-lg transition"
                >
                <h2 className="font-semibold line-clamp-1">{p.title || p.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                    {p.description || p.details || "—"}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium">
                    {p.discount_label || p.code ? `Code: ${p.code}` : "Discount"}
                    </span>
                    {p.ends_at && (
                    <time className="text-gray-500 dark:text-gray-400">
                        to {new Date(p.ends_at).toLocaleDateString()}
                    </time>
                    )}
                </div>
                </article>
            ))}
            </div>
        )}
        </div>
    <Footer />
    </div>
  );
}
