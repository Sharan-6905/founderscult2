# Supabase Setup Guide for FoundersCult

To make FoundersCult fully functional with real data, you need to connect it to your own Supabase project. This project heavily relies on Supabase Auth, Postgres Database, Row Level Security, and Realtime Subscriptions.

## Step 1: Create a Supabase Project
1. Go to [database.new](https://database.new) and create a new project.
2. Once provisioned, get your Project URL and Anon Key from **Settings > API**.
3. Create a `.env.local` file in the root of the project with these values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Step 2: Apply the Schema
1. Go to the **SQL Editor** in your Supabase dashboard.
2. Open the file `supabase/schema.sql` from this repository.
3. Paste the contents into the SQL Editor and click **Run**. This will create all the tables, set up Foreign Keys, apply Row Level Security policies, and enable Realtime for the necessary tables.

## Step 3: Seed Dummy Data
1. Open the file `supabase/seed.sql` from this repository.
2. Paste the contents into the SQL Editor and click **Run**. This will populate the database with realistic founders, streams, posts, and comments so the app feels alive immediately.

## Step 4: Configure Authentication
1. Go to **Authentication > Providers**.
2. **Email**: Ensure Email authentication is enabled. You may want to disable "Confirm email" for testing purposes.
3. **Google & GitHub** (Optional but recommended): Enable these providers and add your OAuth Client IDs/Secrets from Google Cloud Console and GitHub Developer Settings.

## Step 5: Configure Storage
1. Go to **Storage**.
2. Create a new public bucket called `media`.
3. Create another public bucket called `avatars`.
4. Ensure the storage buckets are set to **Public** so images load properly in the app.

## Step 6: Test Locally
Restart your development server:
```bash
npm run dev
```
The app will now be connected to your live Supabase project!
