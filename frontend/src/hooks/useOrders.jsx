import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "../lib/api";

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState("");

  const [itemsByOrder, setItemsByOrder] = useState({}); // { [order_id]: items[] }
  const [loadingItems, setLoadingItems] = useState({}); // { [order_id]: boolean }
  const [errorItems, setErrorItems] = useState({});     // { [order_id]: string }

  useEffect(() => {
    (async () => {
      setLoadingOrders(true);
      setErrorOrders("");
      try {
        const data = await apiFetch('/api/orders'); // ต้องมี token
        setOrders(Array.isArray(data.result) ? data.result : []);
      } catch (e) {
        setErrorOrders(e.message || "Load orders failed");
      } finally {
        setLoadingOrders(false);
      }
    })();
  }, []);

  const loadItems = useCallback(async (order_id) => {
    setLoadingItems(prev => ({ ...prev, [order_id]: true }));
    setErrorItems(prev => ({ ...prev, [order_id]: "" }));
    try {
      const data = await apiFetch(`/api/orders/${order_id}/items`);
      setItemsByOrder(prev => ({ ...prev, [order_id]: data.result || [] }));
    } catch (e) {
      setErrorItems(prev => ({ ...prev, [order_id]: e.message || "Load items failed" }));
    } finally {
      setLoadingItems(prev => ({ ...prev, [order_id]: false }));
    }
  }, []);

  return { orders, loadingOrders, errorOrders, itemsByOrder, loadingItems, errorItems, loadItems };
}
