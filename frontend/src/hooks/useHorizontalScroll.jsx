// src/hooks/useHorizontalScroll.jsx
import { useEffect, useRef, useState, useCallback } from "react";

export default function useHorizontalScroll(deps = []) {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const TH = 2; // threshold กันเลขปัดเศษ/iOS bounce

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const atStart = scrollLeft <= TH;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - TH;
    setCanLeft(!atStart);
    setCanRight(!atEnd);
  }, []);

  const scrollBy = useCallback((dir, ratio = 0.9) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * ratio;
    el.scrollTo({
      left: el.scrollLeft + (dir === "left" ? -amount : amount),
      behavior: "smooth",
    });
    // เรียกเช็คอีกครั้งหลังเลื่อน (smooth)
    setTimeout(updateArrows, 350);
  }, [updateArrows]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // เรียกตอน mount + frame ถัดไปให้ layout เสถียร
    updateArrows();
    const raf = requestAnimationFrame(updateArrows);

    // ฟัง scroll/resize แบบ DOM
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);

    // อัปเดตเมื่อรูปโหลดทำให้ขนาดเปลี่ยน
    const imgs = Array.from(el.querySelectorAll("img"));
    const onImg = () => updateArrows();
    imgs.forEach(img => {
      if (img.complete) return;
      img.addEventListener("load", onImg);
      img.addEventListener("error", onImg);
    });

    // เฝ้าขนาดภายในเปลี่ยน
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      imgs.forEach(img => {
        img.removeEventListener("load", onImg);
        img.removeEventListener("error", onImg);
      });
      ro.disconnect();
    };
  }, [updateArrows]);

  // เช็คใหม่เมื่อ deps (เช่น items) เปลี่ยน
  useEffect(() => { updateArrows(); }, deps);

  // ให้ JSX ใช้ onScroll ของ React ได้ด้วย
  const onScroll = updateArrows;

  return { scrollerRef, canLeft, canRight, scrollBy, updateArrows, onScroll };
}
