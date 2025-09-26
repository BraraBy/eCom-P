// backend/controller/promotionController.js
import postgres from "../utils/db.js";

let result = "";

const getPromotions = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query(`
      SELECT *
      FROM promotions
      ORDER BY created_at DESC, promotion_id DESC
    `);
    return result.rows;
  } catch (err) {
    console.error("getPromotions:", err);
    throw err;
  } finally {
    client.release();
  }
};

const getPromotionById = async (promotion_id) => {
  const client = await postgres.connect();
  try {
    result = await client.query(
      `SELECT * FROM promotions WHERE promotion_id = $1;`,
      [promotion_id]
    );
    if (!result.rows.length) {
      const e = new Error("Promotion not found");
      e.statusCode = 404;
      throw e;
    }
    return result.rows[0];
  } catch (err) {
    console.error("getPromotionById:", err);
    throw err;
  } finally {
    client.release();
  }
};

const getActivePromotions = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query(`
      SELECT promotion_id, title, description, code, kind,
             discount_percent, discount_amount,
             min_order_amount, starts_at, ends_at
      FROM v_promotions_active_available
      ORDER BY COALESCE(ends_at, 'infinity') ASC
    `);
    return result.rows;
  } catch (err) {
    console.error("getActivePromotions:", err);
    throw err;
  } finally {
    client.release();
  }
};

const countActivePromotions = async () => {
  const client = await postgres.connect();
  try {
    result = await client.query(
      `SELECT COUNT(*)::int AS count FROM v_promotions_active_available;`
    );
    return result.rows[0];
  } catch (err) {
    console.error("countActivePromotions:", err);
    throw err;
  } finally {
    client.release();
  }
};

const getActivePromotionByCode = async (code) => {
  const client = await postgres.connect();
  try {
    result = await client.query(
      `SELECT * FROM v_promotions_active_available WHERE LOWER(code) = LOWER($1) LIMIT 1;`,
      [code]
    );
    if (!result.rows.length) {
      const e = new Error("Promotion not found or inactive/expired");
      e.statusCode = 404;
      throw e;
    }
    return result.rows[0];
  } catch (err) {
    console.error("getActivePromotionByCode:", err);
    throw err;
  } finally {
    client.release();
  }
};

const createPromotion = async (data) => {
  const {
    title,
    description,
    code,
    kind, // 'percent' | 'amount'
    discount_percent,
    discount_amount,
    min_order_amount = 0,
    starts_at = null,
    ends_at = null,
    active = true,
    max_total_uses = null,
    max_uses_per_user = null,
    created_by_user_id = null,
  } = data || {};

  if (!title || !code || !kind) {
    const e = new Error("title, code, kind are required");
    e.statusCode = 400;
    throw e;
  }
  if (kind === "percent" && !(Number(discount_percent) > 0 && Number(discount_percent) <= 100)) {
    const e = new Error("discount_percent must be 0 < x <= 100 for kind=percent");
    e.statusCode = 400;
    throw e;
  }
  if (kind === "amount" && !(Number(discount_amount) >= 0)) {
    const e = new Error("discount_amount must be >= 0 for kind=amount");
    e.statusCode = 400;
    throw e;
  }

  const client = await postgres.connect();
  try {
    await client.query("BEGIN");
    const q = `
      INSERT INTO promotions
        (title, description, code, kind,
         discount_percent, discount_amount,
         min_order_amount, starts_at, ends_at, active,
         max_total_uses, max_uses_per_user, created_by_user_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *;
    `;
    const params = [
      title,
      description ?? null,
      code,
      kind,
      kind === "percent" ? Number(discount_percent) : null,
      kind === "amount" ? Number(discount_amount) : null,
      Number(min_order_amount) || 0,
      starts_at ?? null,
      ends_at ?? null,
      !!active,
      max_total_uses ?? null,
      max_uses_per_user ?? null,
      created_by_user_id ?? null,
    ];
    const created = await client.query(q, params);
    await client.query("COMMIT");
    return created.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    if (err?.code === "23505") {
      const e = new Error("Promotion code already exists");
      e.statusCode = 409;
      throw e;
    }
    console.error("createPromotion:", err);
    throw err;
  } finally {
    client.release();
  }
};

const updatePromotion = async (promotion_id, data) => {
  const {
    title,
    description,
    code,
    kind,
    discount_percent,
    discount_amount,
    min_order_amount,
    starts_at,
    ends_at,
    active,
    max_total_uses,
    max_uses_per_user,
  } = data || {};

  // validate เฉพาะฟิลด์ที่ส่งมา
  if (kind === "percent" && discount_percent != null && !(Number(discount_percent) > 0 && Number(discount_percent) <= 100)) {
    const e = new Error("discount_percent must be 0 < x <= 100 for kind=percent");
    e.statusCode = 400;
    throw e;
  }
  if (kind === "amount" && discount_amount != null && !(Number(discount_amount) >= 0)) {
    const e = new Error("discount_amount must be >= 0 for kind=amount");
    e.statusCode = 400;
    throw e;
  }

  const client = await postgres.connect();
  try {
    const q = `
      UPDATE promotions SET
        title             = COALESCE($2, title),
        description       = COALESCE($3, description),
        code              = COALESCE($4, code),
        kind              = COALESCE($5, kind),
        discount_percent  = COALESCE($6, discount_percent),
        discount_amount   = COALESCE($7, discount_amount),
        min_order_amount  = COALESCE($8, min_order_amount),
        starts_at         = COALESCE($9, starts_at),
        ends_at           = COALESCE($10, ends_at),
        active            = COALESCE($11, active),
        max_total_uses    = COALESCE($12, max_total_uses),
        max_uses_per_user = COALESCE($13, max_uses_per_user)
      WHERE promotion_id = $1
      RETURNING *;
    `;
    const params = [
      promotion_id,
      title ?? null,
      description ?? null,
      code ?? null,
      kind ?? null,
      discount_percent ?? null, // ไม่เขียนทับถ้าไม่ส่งมา
      discount_amount ?? null,
      min_order_amount ?? null,
      starts_at ?? null,
      ends_at ?? null,
      typeof active === "boolean" ? active : null,
      max_total_uses ?? null,
      max_uses_per_user ?? null,
    ];
    const updated = await client.query(q, params);
    if (!updated.rows.length) {
      const e = new Error("Promotion not found");
      e.statusCode = 404;
      throw e;
    }
    return updated.rows[0];
  } catch (err) {
    if (err?.code === "23505") {
      const e = new Error("Promotion code already exists");
      e.statusCode = 409;
      throw e;
    }
    console.error("updatePromotion:", err);
    throw err;
  } finally {
    client.release();
  }
};

const deletePromotion = async (promotion_id) => {
  const client = await postgres.connect();
  try {
    const del = await client.query(
      `DELETE FROM promotions WHERE promotion_id = $1 RETURNING *;`,
      [promotion_id]
    );
    if (!del.rows.length) {
      const e = new Error("Promotion not found");
      e.statusCode = 404;
      throw e;
    }
    return { success: true, deleted: del.rows[0] };
  } catch (err) {
    console.error("deletePromotion:", err);
    throw err;
  } finally {
    client.release();
  }
};

const setPromotionScope = async (promotion_id, data) => {
  const { product_ids = [], category_ids = [] } = data || {};
  const client = await postgres.connect();
  try {
    await client.query("BEGIN");

    const exists = await client.query(
      `SELECT 1 FROM promotions WHERE promotion_id = $1;`,
      [promotion_id]
    );
    if (!exists.rowCount) {
      await client.query("ROLLBACK");
      const e = new Error("Promotion not found");
      e.statusCode = 404;
      throw e;
    }

    await client.query(
      `DELETE FROM promotion_products WHERE promotion_id = $1;`,
      [promotion_id]
    );
    await client.query(
      `DELETE FROM promotion_categories WHERE promotion_id = $1;`,
      [promotion_id]
    );

    if (Array.isArray(product_ids) && product_ids.length) {
      const values = product_ids.map((_, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `INSERT INTO promotion_products (promotion_id, product_id) VALUES ${values};`,
        [promotion_id, ...product_ids.map(Number)]
      );
    }

    if (Array.isArray(category_ids) && category_ids.length) {
      const values = category_ids.map((_, i) => `($1, $${i + 2})`).join(",");
      await client.query(
        `INSERT INTO promotion_categories (promotion_id, category_id) VALUES ${values};`,
        [promotion_id, ...category_ids.map(Number)]
      );
    }

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("setPromotionScope:", err);
    throw err;
  } finally {
    client.release();
  }
};

const redeemPromotion = async (promotion_id, data) => {
  const { customers_id = null, order_id = null } = data || {};
  if (!order_id) {
    const e = new Error("order_id is required");
    e.statusCode = 400;
    throw e;
  }

  const client = await postgres.connect();
  try {
    await client.query("BEGIN");

    const active = await client.query(
      `SELECT * FROM v_promotions_active_available WHERE promotion_id = $1;`,
      [promotion_id]
    );
    if (!active.rowCount) {
      await client.query("ROLLBACK");
      const e = new Error("Promotion is not active or quota exceeded");
      e.statusCode = 409;
      throw e;
    }
    const promo = active.rows[0];

    if (customers_id && promo.max_uses_per_user != null) {
      const used = await client.query(
        `SELECT COUNT(*)::int AS used_by_user
         FROM promotion_redemptions
         WHERE promotion_id = $1 AND customers_id = $2;`,
        [promotion_id, customers_id]
      );
      if ((used.rows[0]?.used_by_user ?? 0) >= promo.max_uses_per_user) {
        await client.query("ROLLBACK");
        const e = new Error("User quota exceeded for this promotion");
        e.statusCode = 409;
        throw e;
      }
    }

    await client.query(
      `INSERT INTO promotion_redemptions (promotion_id, customers_id, order_id)
       VALUES ($1,$2,$3);`,
      [promotion_id, customers_id ?? null, order_id]
    );

    await client.query("COMMIT");
    return { success: true };
  } catch (err) {
    await client.query("ROLLBACK");
    if (err?.code === "23505") {
      const e = new Error("This order already used this promotion");
      e.statusCode = 409;
      throw e;
    }
    console.error("redeemPromotion:", err);
    throw err;
  } finally {
    client.release();
  }
};

const validatePromotionByCode = async ({ code, items = [], customers_id = null }) => {
  // items: [{ product_id:Number, quantity:Number, price:Number }]
  const client = await postgres.connect();
  try {
    await client.query('BEGIN');

    // 1) หาโปรฯ ที่ active (เวลา/active/โควต้าเบื้องต้น)
    const rPromo = await client.query(
      `SELECT * FROM v_promotions_active_available WHERE LOWER(code)=LOWER($1) LIMIT 1`,
      [code]
    );
    if (!rPromo.rowCount) {
      const e = new Error('Promotion not found or inactive/expired');
      e.statusCode = 404;
      throw e;
    }
    const promo = rPromo.rows[0];

    // 2) เช็คโควต้าใช้งานรวม (ถ้ามี)
    if (promo.max_total_uses != null) {
      const rTotal = await client.query(
        `SELECT COUNT(*)::int AS used FROM promotion_redemptions WHERE promotion_id=$1`,
        [promo.promotion_id]
      );
      if ((rTotal.rows[0]?.used ?? 0) >= promo.max_total_uses) {
        const e = new Error('Total quota exceeded for this promotion');
        e.statusCode = 409;
        throw e;
      }
    }

    // 3) เช็คโควต้าต่อผู้ใช้ (ถ้ามี และมี customers_id)
    if (customers_id && promo.max_uses_per_user != null) {
      const rUser = await client.query(
        `SELECT COUNT(*)::int AS used FROM promotion_redemptions WHERE promotion_id=$1 AND customers_id=$2`,
        [promo.promotion_id, customers_id]
      );
      if ((rUser.rows[0]?.used ?? 0) >= promo.max_uses_per_user) {
        const e = new Error('User quota exceeded for this promotion');
        e.statusCode = 409;
        throw e;
      }
    }

    // 4) ดึง scope
    const rPP = await client.query(
      `SELECT product_id FROM promotion_products WHERE promotion_id=$1`,
      [promo.promotion_id]
    );
    const rPC = await client.query(
      `SELECT category_id FROM promotion_categories WHERE promotion_id=$1`,
      [promo.promotion_id]
    );
    const scopedProducts = new Set(rPP.rows.map(x => Number(x.product_id)));
    const scopedCategories = new Set(rPC.rows.map(x => Number(x.category_id)));

    // 5) หา category ของสินค้าที่อยู่ในตะกร้า (เพื่อเช็คตามหมวด)
    //    ถ้า scope ว่างทั้งคู่ = ใช้ได้กับทุกสินค้า
    let eligibleSubtotal = 0;
    if (scopedProducts.size === 0 && scopedCategories.size === 0) {
      eligibleSubtotal = items.reduce((s, it) => s + Number(it.price||0)*Number(it.quantity||0), 0);
    } else {
      // ดึง category ของ product ทั้งหมดที่อยู่ในตะกร้า
      const productIds = [...new Set(items.map(it => Number(it.product_id)).filter(Boolean))];
      let catMap = new Map();
      if (productIds.length) {
        const placeholders = productIds.map((_,i)=>`$${i+2}`).join(',');
        const rCats = await client.query(
          `SELECT product_id, category_id FROM products WHERE product_id IN (${placeholders})`,
          [promo.promotion_id, ...productIds] // พารามิเตอร์แรกไม่ใช้จริง แต่ทำให้ index ง่ายก็ได้ หรือเปลี่ยนเป็น query แยกก็ได้
        ).catch(async () => {
          // fallback query แบบไม่พึ่งพา $1
          const rCats2 = await client.query(
            `SELECT product_id, category_id FROM products WHERE product_id = ANY($1::int[])`,
            [productIds]
          );
          return rCats2;
        });
        rCats.rows.forEach(row => catMap.set(Number(row.product_id), Number(row.category_id)));
      }

      // รวมยอดเฉพาะสินค้าเข้า scope (product ตรง หรือ category ตรง)
      for (const it of items) {
        const pid = Number(it.product_id);
        const inProduct = scopedProducts.has(pid);
        const inCategory = scopedCategories.size ? scopedCategories.has(catMap.get(pid)) : false;
        if (inProduct || inCategory) {
          eligibleSubtotal += Number(it.price||0)*Number(it.quantity||0);
        }
      }
    }

    if (eligibleSubtotal <= 0) {
      const e = new Error('No eligible items in cart for this promotion');
      e.statusCode = 409;
      throw e;
    }

    // 6) เช็คขั้นต่ำ
    const minOrder = Number(promo.min_order_amount || 0);
    if (minOrder > 0 && eligibleSubtotal < minOrder) {
      const e = new Error(`Minimum order ฿${minOrder} for this promotion`);
      e.statusCode = 409;
      throw e;
    }

    // 7) คำนวณส่วนลดจากยอดที่เข้า scope เท่านั้น
    let discount = 0;
    if (promo.kind === 'percent') {
      discount = Math.max(0, (eligibleSubtotal * Number(promo.discount_percent || 0)) / 100);
    } else if (promo.kind === 'amount') {
      discount = Math.min(eligibleSubtotal, Number(promo.discount_amount || 0));
    }

    await client.query('COMMIT');
    return {
      promotion: promo,
      eligibleSubtotal,
      discount,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export default {
  getPromotions,
  getPromotionById,
  getActivePromotions,
  countActivePromotions,
  getActivePromotionByCode,
  createPromotion,
  updatePromotion,
  deletePromotion,
  setPromotionScope,
  redeemPromotion,
  validatePromotionByCode,
};
