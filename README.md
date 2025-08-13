## HaidaMint Expense Tracker

Upload a receipt → OCR (mock or AWS Textract) → auto-categorize → budget tips → dashboard.

## Overview
- **Client:** React (Vite + Tailwind)
- **Server:** Node/Express + MongoDB Atlas, S3 presigned uploads
- **AI:** Flask microservice (mock OCR by default, Textract when enabled)
- - **Storage:** MongoDB Atlas (+ optional S3 for file storage)
- **Auth:** simple mock (token in localStorage) for demo

## Run Locally
### AI service
```bash
cd ai-service
python -m venv .venv && . .venv/Scripts/activate    # mac/linux: source .venv/bin/activate
pip install -r requirements.txt
# ai-service/.env
# PORT=5001
# AWS_REGION=us-east-1
# USE_MOCK_OCR=true   # set false + AWS keys to use Textract
python app.py    # -> http://127.0.0.1:5001
```

### Server API
cd server
npm i

## server/.env
- PORT=5000
-  AI_SERVICE_URL=http://127.0.0.1:5001
- MONGO_URI=<your MongoDB Atlas URI>
- AWS_REGION=us-east-1
-  S3_BUCKET=<your-s3-bucket>
-  AWS_ACCESS_KEY_ID=<never commit>
-  AWS_SECRET_ACCESS_KEY=<never commit>
- npm run dev
 -> http://127.0.0.1:5000

### Client 
cd client
npm i
echo VITE_API_URL=http://127.0.0.1:5000 > .env
npm run dev     # -> http://127.0.0.1:5173

## How to Use 

- Register/Login (mock auth).
- Go to Dashboard.
- Click Select a File → pick a small JPG/PNG/PDF.
- Click Upload & Analyze: 
      You should see “Saved: … $12.34”, the item in Recent Expenses, and By Category totals update.

## Notes (AWS/S3)

- Works without AWS using USE_MOCK_OCR=true.
- For real S3 uploads + Textract:
        . Create a bucket and allow CORS for http://localhost:5173.
        . Give your IAM user S3 perms to put to uploads/* and get objects.
        . Set USE_MOCK_OCR=false and AWS creds in server/.env (do not commit them).

## Endpoints (server)

. POST /api/receipt/presign → presigned POST to S3
. POST /api/receipt/confirm → trigger OCR + save
. GET /api/expenses → list latest
. GET /api/summary → totals by category

## Scripts

. client: npm run dev, npm run build
. server: npm run dev, npm start
. ai-service: python app.py

## Security

. Never commit .env or secrets. Rotate keys if they were exposed.

## Author 

**Haida Makouangou** — UNC-Charlotte- CS -Senior Student-Per Scholas- Full Stack (MERN)

