import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import multer from "multer";
import FormData from "form-data";

import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

dotenv.config();

const s3 = new S3Client({ region: process.env.AWS_REGION });
const S3_BUCKET = process.env.S3_BUCKET;

if (!process.env.AWS_REGION) console.warn("AWS_REGION not set");
if (!S3_BUCKET) console.warn("S3_BUCKET not set");

const app = express();

const DEFAULT_ALLOWED = [
    "https://hexpense-tracker.netlify.app",
    "http://localhost:5173",
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED.join(","))
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

app.use(express.json());

const {
    PORT = 5000,
    HOST = "0.0.0.0",
    AI_SERVICE_URL = "http://127.0.0.1:5001",
    MONGO_URI,
} = process.env;


if (MONGO_URI) {
    mongoose
        .connect(MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.error("Mongo connect error:", err));
} else {
    console.warn("No MONGO_URI set — API will run but won't persist data.");
}

const ExpenseSchema = new mongoose.Schema(
    {
        userId: String,
        merchant: String,
        total: Number,
        currency: { type: String, default: "USD" },
        date: Date,
        category: String,
        items: [{ desc: String, amount: Number, category: String }],
        s3Key: String,
        mime: String,
        size: Number,
        status: { type: String, default: "processed" },
        tips: [String],
    },
    { timestamps: true }
);

const Expense =
    mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

app.get("/api/health", (_req, res) =>
    res.json({ ok: true, time: new Date().toISOString() })
);

app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
        return res.status(400).json({ error: "username, email, password required" });
    }
    res.json({ token: "dev-token", user: { username, email } });
});

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ error: "email, password required" });
    }
    res.json({
        token: "dev-token",
        user: { username: email.split("@")[0], email },
    });
});

app.get("/api/auth/me", (_req, res) =>
    res.json({ user: { username: "student", email: "student@example.com" } })
);


app.get("/", (_req, res) => res.send("Expense API OK"));

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

app.post("/api/receipt", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res
                .status(400)
                .json({ error: "file required (multipart/form-data, field 'file')" });
        }

        const form = new FormData();
        form.append("file", req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const ocr = await axios.post(`${AI_SERVICE_URL}/ocr`, form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: 60_000,
        });

        const data = ocr.data || {};
        const doc = {
            merchant: data.merchant || "Unknown",
            total: Number(data.total || 0),
            date: data.date ? new Date(data.date) : new Date(),
            category: data.category || "Other",
            items: (data.items || []).map((x) => ({
                desc: x.desc,
                amount: Number(x.amount || 0),
                category: x.category,
            })),
            currency: data.currency || "USD",
            tips: data.tips || [],
            mime: req.file.mimetype,
            size: req.file.size,
            status: "processed",
        };

       
        const saved = MONGO_URI ? await Expense.create(doc) : doc;
        res.json(saved.toObject?.() ?? saved);
    } catch (e) {
        const status = e.response?.status || 500;
        const data = e.response?.data || e.message;
        console.error("receipt error:", status, data);
        res
            .status(500)
            .json({ error: typeof data === "string" ? data : data?.error || data });
    }
});

app.post("/api/receipt/presign", async (req, res) => {
    try {
        if (!S3_BUCKET) return res.status(500).json({ error: "S3_BUCKET not set" });

        const { fileName, mime } = req.body || {};
        if (!fileName || !mime) {
            return res.status(400).json({ error: "fileName and mime required" });
        }

        const safe = String(fileName).replace(/[^\w.\-]/g, "_");
        const key = `uploads/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}-${safe}`;

        const presigned = await createPresignedPost(s3, {
            Bucket: S3_BUCKET,
            Key: key,
            Conditions: [
                ["eq", "$Content-Type", mime],
                ["content-length-range", 0, 10 * 1024 * 1024],
            ],
            Expires: 60,
            Fields: { "Content-Type": mime },
        });

        res.json({ ...presigned, key });
    } catch (e) {
        console.error("presign error:", e);
        res.status(500).json({ error: e.message || "presign failed" });
    }
});


app.post("/api/receipt/confirm", async (req, res) => {
    try {
        const { key, mime, size } = req.body || {};
        if (!key) return res.status(400).json({ error: "key required" });

        const doc = {
            merchant: "Unknown",
            total: 0,
            currency: "USD",
            date: new Date(),
            category: "Other",
            items: [],
            s3Key: key,
            mime,
            size: Number(size || 0),
            status: "processed",
            tips: [],
        };

        const saved = MONGO_URI ? await Expense.create(doc) : doc;
        res.json(saved.toObject?.() ?? saved);
    } catch (e) {
        console.error("confirm error:", e);
        res.status(500).json({ error: e.message || "confirm failed" });
    }
});

app.get("/api/expenses", async (_req, res) => {
    const list = MONGO_URI
        ? await Expense.find().sort({ createdAt: -1 }).limit(200)
        : [];
    res.json(list);
});

app.get("/api/summary", async (_req, res) => {
    if (!MONGO_URI) return res.json([]);
    const agg = await Expense.aggregate([
        { $group: { _id: "$category", total: { $sum: "$total" }, count: { $sum: 1 } } },
        { $project: { _id: 0, category: "$_id", total: 1, count: 1 } },
        { $sort: { total: -1 } },
    ]);
    res.json(agg);
});

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// --- Start server ---
app.listen(PORT, HOST, () => {
    console.log(
        `Server running at http://localhost:${PORT}/ (S3 bucket: ${S3_BUCKET || "unset"})`
    );
});
