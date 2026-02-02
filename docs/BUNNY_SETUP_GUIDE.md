# Bunny.net Video Setup & Paid Access Guide

## Overview
This guide explains how to upload your 10 trading course videos to Bunny.net (Bunny Stream) and configure them for paid-only access on FourXclub.

---

## Step 1: Bunny Stream Setup

1. **Log in to Bunny.net**: [https://dash.bunny.net/](https://dash.bunny.net/)
2. **Go to Stream**: Click on "Stream" in the sidebar.
3. **Create Video Library**: 
   - You already have a library with ID: `589918`. 
   - Ensure the name is something like `FourXclub Course`.
4. **Configure Security (Token Authentication)**:
   - Go to your Video Library settings.
   - Look for **Security** or **Token Authentication**.
   - Enable it if you want to prevent direct link sharing.
   - For now, the implementation uses domain-restricted embedding.

---

## Step 2: Upload Your 10 Videos

1. **Go to your Library**: Click on Library `589918`.
2. **Upload Videos**: Use the Bunny dashboard to upload your 10 mp4 files.
3. **Get Video IDs**: Once uploaded, each video will have a unique ID (a UUID).
4. **Update Configuration**: Open `src/lib/bunny.ts` and replace the placeholder IDs:

```typescript
export const courseVideos: CourseVideo[] = [
  {
    id: 1,
    title: 'Introduction to Forex Trading',
    bunnyId: 'REAL_BUNNY_VIDEO_ID_1', // ← Replace this
    // ...
  },
  // ...
]
```

---

## Step 3: Domain Restriction (Crucial)

To ensure only your website can play these videos:

1. In your Bunny Stream library settings, go to **Security**.
2. Find **Allowed Domains** (Referer restriction).
3. Add:
   - `fourxclub.in`
   - `www.fourxclub.in`
   - `localhost` (for development)
4. Save settings.

---

## How Paid-Only Access Works

The system controls access as follows:

1. **Database Check**: When a user selects a video, the request goes to `/api/videos/[videoNumber]`.
2. **Access Verification**: The backend checks the `courseAccess` table to see if the user has an `active` status.
3. **Secure Delivery**: If the user has access, the backend returns the Bunny.net embed URL.
4. **Embed Protection**: Bunny.net's domain restriction ensures that even if someone finds the embed URL, it will only play on `fourxclub.in`.

---

## Environment Variables

Ensure these are correct in your `.env.local`:

```bash
BUNNY_API_KEY=a9991ca0-83a4-41a0-8a7e6ae8649a-e599-4257
BUNNY_LIBRARY_ID=589918
BUNNY_CDN_URL=vz-36a9a6d8-d84.b-cdn.net
BUNNY_PULL_ZONE=vz-36a9a6d8-d84
NEXT_PUBLIC_BUNNY_LIBRARY_ID=589918
```

---

## Troubleshooting

### Video not playing
- Double check the `bunnyId` in `src/lib/bunny.ts`.
- Ensure the video status is "Done" or "Transcoding" (it won't play if it's still uploading).
- Check that your domain is added to the "Allowed Domains" in Bunny Stream settings.

### "Access Denied" error
- This means the database doesn't show you as a paid user.
- Check the `payments` and `course_accesses` tables in your Supabase database.
