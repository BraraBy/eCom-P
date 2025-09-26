import express from "express";
import Controller from "../controller/promotionController.js";

const rt = express.Router();

// ----- public endpoints -----
rt.get("/active", async (req, res) => {
  try {
    const result = await Controller.getActivePromotions();
    res.json({ status: "200", result });
  } catch (err) {
    res.status(500).json({ status: "500", message: err.message });
  }
});

rt.get("/active/count", async (req, res) => {
  try {
    const result = await Controller.countActivePromotions();
    res.json({ status: "200", result });
  } catch (err) {
    res.status(500).json({ status: "500", message: err.message });
  }
});

rt.get("/by-code/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const result = await Controller.getActivePromotionByCode(code);
    res.json({ status: "200", result });
  } catch (err) {
    res.status(404).json({ status: "404", message: err.message });
  }
});

// ----- CRUD -----
rt.get("/", async (req, res) => {
  try {
    const result = await Controller.getPromotions();
    res.json({ status: "200", result });
  } catch (err) {
    res.status(500).json({ status: "500", message: err.message });
  }
});

rt.get("/:promotion_id", async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const result = await Controller.getPromotionById(promotion_id);
    res.json({ status: "200", result });
  } catch (err) {
    res.status(404).json({ status: "404", message: err.message });
  }
});

rt.post("/", async (req, res) => {
  try {
    const result = await Controller.createPromotion(req.body);
    res.status(201).json({ status: "201", result });
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({ status: String(code), message: err.message || "Server Error" });
  }
});

rt.put("/:promotion_id", async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const result = await Controller.updatePromotion(promotion_id, req.body);
    res.json({ status: "200", result });
  } catch (err) {
    const code = err.statusCode || 500;
    res.status(code).json({ status: String(code), message: err.message || "Server Error" });
  }
});

rt.delete("/:promotion_id", async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const result = await Controller.deletePromotion(promotion_id);
    res.json({ status: "200", result });
  } catch (err) {
    res.status(404).json({ status: "404", message: err.message });
  }
});

// ----- scope & redeem -----
rt.put("/:promotion_id/scope", async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const { product_ids, category_ids } = req.body;
    const result = await Controller.setPromotionScope(promotion_id, {
      product_ids,
      category_ids,
    });
    res.json({ status: "200", result });
  } catch (err) {
    res.status(400).json({ status: "400", message: err.message });
  }
});

rt.post("/:promotion_id/redeem", async (req, res) => {
  try {
    const { promotion_id } = req.params;
    const { customers_id, order_id } = req.body;
    const result = await Controller.redeemPromotion(promotion_id, {
      customers_id,
      order_id,
    });
    res.json({ status: "200", result });
  } catch (err) {
    res.status(400).json({ status: "400", message: err.message });
  }
});

rt.post("/validate", async (req, res) => {
  try {
    const { code, items = [], customers_id = null } = req.body || {};
    const result = await Controller.validatePromotionByCode({ code, items, customers_id });
    res.json({ status: "200", result });
  } catch (err) {
    const code = err.statusCode || 400;
    res.status(code).json({ status: String(code), message: err.message || "Validation failed" });
  }
});

export default rt;
