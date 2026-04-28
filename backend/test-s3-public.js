/**
 * S3 Public Access Diagnostic Script
 * Run this to verify your S3 bucket is configured for public access.
 *
 * Usage:
 *   node test-s3-public.js
 *
 * This will:
 *   1. Upload a small test image to your S3 bucket
 *   2. Try to fetch it via public HTTP (no authentication)
 *   3. Report whether public access is working
 */

require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const https = require("https");

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const REGION = process.env.AWS_REGION;

const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// A tiny 1x1 red transparent PNG (base64)
const TEST_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const TEST_KEY = "Spotify/test/diagnostic_image.png";
const PUBLIC_URL = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${TEST_KEY}`;

async function uploadTestFile() {
  console.log("\n🚀 Step 1: Uploading test image to S3...");
  console.log(`   Bucket: ${BUCKET_NAME}`);
  console.log(`   Region: ${REGION}`);
  console.log(`   Key: ${TEST_KEY}\n`);

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: TEST_KEY,
    Body: Buffer.from(TEST_IMAGE_BASE64, "base64"),
    ContentType: "image/png",
  });

  try {
    await s3Client.send(command);
    console.log("✅ Upload successful!\n");
  } catch (err) {
    console.error("❌ Upload FAILED:", err.message);
    console.error("\n💡 Possible causes:");
    console.error("   - Wrong AWS credentials");
    console.error("   - Bucket does not exist");
    console.error("   - IAM user does not have s3:PutObject permission");
    process.exit(1);
  }
}

function fetchPublicUrl() {
  return new Promise((resolve, reject) => {
    console.log("🌐 Step 2: Fetching public URL (no auth)...");
    console.log(`   URL: ${PUBLIC_URL}\n`);

    const req = https.get(PUBLIC_URL, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on("error", (err) => reject(err));
    req.setTimeout(10000, () => reject(new Error("Request timeout")));
  });
}

async function runDiagnostics() {
  console.log("========================================");
  console.log("  S3 Public Access Diagnostic Tool");
  console.log("========================================");

  await uploadTestFile();

  // Wait a moment for propagation
  console.log("⏳ Waiting 3 seconds for policy propagation...\n");
  await new Promise((r) => setTimeout(r, 3000));

  try {
    const result = await fetchPublicUrl();

    if (result.statusCode === 200) {
      console.log("✅ PUBLIC ACCESS IS WORKING!");
      console.log("   The test image was fetched successfully.\n");
      console.log("📋 Next steps:");
      console.log("   1. Open this URL in your browser to confirm:");
      console.log(`      ${PUBLIC_URL}`);
      console.log("   2. If you see a tiny red dot, everything is perfect!");
      console.log("   3. Your app should now work correctly.\n");
    } else if (result.statusCode === 403) {
      console.log("❌ ACCESS DENIED (HTTP 403)");
      console.log("   The file uploaded but is NOT publicly accessible.\n");
      console.log("🔧 FIX REQUIRED — follow these steps in AWS Console:\n");
      console.log("   1. S3 → Your Bucket → Permissions → Block public access");
      console.log("      → Edit → UNCHECK ALL 4 BOXES → Save\n");
      console.log("   2. S3 → Your Bucket → Permissions → Object Ownership");
      console.log("      → Edit → Select 'Bucket owner preferred' → Save\n");
      console.log("   3. S3 → Your Bucket → Permissions → Bucket policy");
      console.log("      → Edit → Paste this JSON (replace YOUR_BUCKET_NAME):\n");
      console.log(JSON.stringify(
        {
          Version: "2012-10-17",
          Statement: [
            {
              Sid: "PublicReadGetObject",
              Effect: "Allow",
              Principal: "*",
              Action: "s3:GetObject",
              Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
            },
          ],
        },
        null,
        2
      ));
      console.log("\n   4. Save the policy and wait 30 seconds.");
      console.log("   5. Run this script again.\n");
    } else if (result.statusCode === 404) {
      console.log("❌ NOT FOUND (HTTP 404)");
      console.log("   The file was not found at the expected URL.\n");
      console.log("💡 Possible causes:");
      console.log("   - Wrong bucket name or region in .env");
      console.log("   - File was not actually uploaded (check S3 console)");
      console.log(`   - Expected URL: ${PUBLIC_URL}\n`);
    } else {
      console.log(`⚠️ Unexpected status code: ${result.statusCode}`);
      console.log("   Response body:", result.body.slice(0, 500));
    }
  } catch (err) {
    console.error("❌ HTTP request failed:", err.message);
    console.error("💡 Check your internet connection and bucket name.");
  }

  console.log("========================================");
  console.log("  Diagnostic complete");
  console.log("========================================\n");
}

runDiagnostics().catch(console.error);

