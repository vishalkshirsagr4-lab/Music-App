# S3 Public Access Fix — Step-by-Step Guide

## Problem
Upload succeeds but URL shows `AccessDenied` or blank page.
This happens because uploaded S3 objects are **private by default**.

## Root Cause
AWS S3 now uses **Bucket Policies** (not ACLs) to control public access.
Even if you set `ACL: 'public-read'` in code, it is **ignored** if:
1. "Block Public Access" is ON, OR
2. "Object Ownership" is set to "Bucket owner enforced" (which disables ACLs)

## Solution: Bucket Policy Approach (Recommended)

---

## Step 1: Disable "Block Public Access"

1. Go to AWS Console → S3 → Your Bucket → **Permissions** tab
2. Scroll to **"Block public access (bucket settings)"**
3. Click **Edit**
4. **UNCHECK ALL 4 BOXES**:
   - [ ] Block *all* public access
   - [ ] Block public access to buckets and objects granted through *new* access control lists (ACLs)
   - [ ] Block public access to buckets and objects granted through *any* access control lists (ACLs)
   - [ ] Block public access to buckets and objects granted through *new* public bucket or access point policies
   - [ ] Block public and cross-account access to buckets and objects through *any* public bucket or access point policies
5. Click **Save changes**
6. Type `confirm` when prompted

> ⚠️ This is safe for a media streaming app. Your bucket only stores music/images that users intentionally upload to share publicly.

---

## Step 2: Set Object Ownership to "Bucket owner preferred"

1. In the same **Permissions** tab, scroll to **"Object Ownership"**
2. Click **Edit**
3. Select **"Bucket owner preferred"**
4. Click **Save changes**

This allows ACLs to work if you ever need them, but we will use Bucket Policy instead.

---

## Step 3: Add Bucket Policy for Public Read

1. In the **Permissions** tab, scroll to **"Bucket policy"**
2. Click **Edit**
3. Paste this exact JSON (replace `YOUR_BUCKET_NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. Click **Save changes**

> 🔴 **Important**: Replace `YOUR_BUCKET_NAME` with your actual bucket name (e.g., `my-music-app-bucket`).
> The `/*` at the end of the ARN means "all objects in this bucket".

---

## Step 4: Verify the Fix

### Test 1: Upload a file via your app
1. Start your backend: `npm run dev`
2. Upload a song or image through your React frontend
3. Copy the returned URL

### Test 2: Open URL directly in browser
Paste the URL in a new browser tab. You should see:
- **Image**: The image displays directly
- **Audio**: The browser's audio player appears

If you still see `AccessDenied`, wait 30 seconds and try again (policy propagation delay).

### Test 3: Check in AWS Console
1. Go to S3 → Your Bucket → Objects
2. Click on the uploaded file
3. Check the **"Object URL"** — it should match what your app returns
4. Open the **"Permissions"** tab for that object
5. You should see:
   - "Access control list (ACL)": Not applicable (or public-read if using ACL approach)
   - Under "Bucket policy": The object is accessible because the bucket policy allows it

---

## Step 5: CORS Configuration (For Frontend Playback)

If your React frontend is on `http://localhost:5173` and S3 is blocking requests, add CORS:

1. Go to S3 → Your Bucket → **Permissions** tab
2. Scroll to **"Cross-origin resource sharing (CORS)"**
3. Click **Edit**
4. Paste this:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

5. For production, add your production domain too:
```json
    "AllowedOrigins": ["http://localhost:5173", "https://yourdomain.com"]
```

---

## Quick Checklist

| Setting | Required Value |
|---------|---------------|
| Block Public Access | ALL OFF (4 unchecked boxes) |
| Object Ownership | Bucket owner preferred |
| Bucket Policy | PublicReadGetObject on `arn:aws:s3:::bucket/*` |
| CORS | GET/HEAD allowed from your frontend origin |
| Code ACL | NOT set (we removed it) |

---

## If Nothing Works — Alternative: Presigned URLs

If you absolutely cannot make the bucket public, use **presigned URLs** instead. These are temporary authenticated URLs that work without public access.

However, for a music streaming app, **public bucket + bucket policy** is the standard approach (Spotify, SoundCloud, etc. all use CDN-backed public URLs for media).

---

## Common Mistakes

1. **Wrong ARN in bucket policy**: Must end with `/*` (e.g., `arn:aws:s3:::my-bucket/*`)
2. **Block Public Access still ON**: Even one checked box can deny all public access
3. **Wrong region in URL**: Must match your bucket region (e.g., `s3.ap-south-1.amazonaws.com`)
4. **Object Ownership = Bucket owner enforced**: This disables ACLs entirely; use "Bucket owner preferred" instead
5. **Policy propagation delay**: After saving, wait 30-60 seconds before testing

