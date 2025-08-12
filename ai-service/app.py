import os, re, traceback, datetime
from flask import Flask, request, jsonify
import boto3
from botocore.exceptions import BotoCoreError, ClientError

app = Flask(__name__)

PORT = int(os.getenv("PORT", "5001"))
USE_MOCK = os.getenv("USE_MOCK_OCR", "true").lower() == "true"  
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

def _textract_client():
    return boto3.client("textract", region_name=AWS_REGION)

def _to_float(s):
    try:
        return float(re.sub(r"[^\d.]", "", str(s)))
    except Exception:
        return None

def _categorize(merchant: str, items):
    name = (merchant or "").lower()
    if any(k in name for k in ["starbucks", "coffee", "café"]): return "Coffee"
    if any(k in name for k in ["mcdonald", "burger", "kfc", "pizza"]): return "Fast Food"
    if any(k in name for k in ["amazon", "walmart", "target"]): return "Shopping"
    if any(k in name for k in ["uber", "lyft", "shell", "exxon", "gas"]): return "Transport"

    joined = " ".join((i.get("desc", "") or "").lower() for i in items)
    if "grocer" in joined or "produce" in joined: return "Groceries"
    return "Other"

def _tips(total, category):
    tips = []
    if total and total > 50 and category in ("Fast Food", "Coffee"):
        tips.append("High spend on eating out—try a weekly meal plan to cut costs.")
    if total and total > 100 and category == "Shopping":
        tips.append("Large shopping receipt—set a monthly discretionary cap.")
    if not tips:
        tips.append("Track category totals weekly and set small goals (e.g., 10% lower).")
    return tips

def _mock_parse(filename: str):
    base = (filename or "Mock Store").split(".")[0].replace("_", " ").title()
    total = 12.34
    items = [{"desc": "Item A", "amount": 5.00}, {"desc": "Item B", "amount": 7.34}]
    cat = _categorize(base, items)
    return {
        "merchant": base,
        "total": total,
        "date": datetime.date.today().isoformat(),
        "items": items,
        "category": cat,
        "tips": _tips(total, cat),
        "source": "mock",
    }

def _parse_analyze_expense(resp):
    merchant = None; total = None; date = None
    items = []

    for doc in resp.get("ExpenseDocuments", []):
      
        for field in doc.get("SummaryFields", []):
            t = (field.get("Type", {}).get("Text", "") or "").upper()
            val = field.get("ValueDetection", {}).get("Text", "")
            if "VENDOR" in t or "SUPPLIER" in t or "MERCHANT" in t:
                merchant = val or merchant
            if "TOTAL" in t and total is None:
                total = _to_float(val)
            if "INVOICE_RECEIPT_DATE" in t or "DATE" in t:
                date = val or date

        for li in doc.get("LineItemGroups", []):
            for line in li.get("LineItems", []):
                desc = ""; amt = None
                for kv in line.get("LineItemExpenseFields", []):
                    k = (kv.get("Type", {}).get("Text", "") or "").upper()
                    v = kv.get("ValueDetection", {}).get("Text", "")
                    if k in ("ITEM", "DESCRIPTION"): desc = v or desc
                    if k in ("PRICE", "AMOUNT"):
                        f = _to_float(v)
                        if f is not None: amt = f
                items.append({"desc": desc, "amount": amt})

    cat = _categorize(merchant, items)
    return {
        "merchant": merchant or "Unknown",
        "total": total,
        "date": date,
        "items": items,
        "category": cat,
        "tips": _tips(total, cat),
        "source": "textract",
    }

@app.get("/")
def health():
    return "OCR service OK"

@app.post("/ocr")
def ocr():
    try:
    
        if "file" in request.files:
            f = request.files["file"].read()
            filename = request.files["file"].filename
            if USE_MOCK:
                return jsonify(_mock_parse(filename))
            client = _textract_client()
            resp = client.analyze_expense(Document={"Bytes": f})
            return jsonify(_parse_analyze_expense(resp))

     
        data = request.get_json() or {}
        if data.get("s3_bucket") and data.get("s3_key"):
            if USE_MOCK:
                return jsonify(_mock_parse(os.path.basename(data["s3_key"])))
            client = _textract_client()
            resp = client.analyze_expense(
                Document={"S3Object": {"Bucket": data["s3_bucket"], "Name": data["s3_key"]}}
            )
            return jsonify(_parse_analyze_expense(resp))

    
        return jsonify({"error": "file or s3_bucket+s3_key required"}), 400

    except (BotoCoreError, ClientError) as e:
        
        return jsonify({"error": f"AWS error: {e}"}), 500
    except Exception as e:
        print("OCR ERROR:\n", traceback.format_exc())
        return jsonify({"error": f"OCR failed: {type(e).__name__}: {e}"}), 500

if __name__ == "__main__":

    app.run(host="0.0.0.0", port=PORT)
