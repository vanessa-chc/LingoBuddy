# LingoBuddy 🎙️

An AI-native slang learning assistant designed to bridge the gap between formal English education and real-world American conversations.

### 🚀 Overview
LingoBuddy leverages generative AI to help international students understand and practice contextual slang. This project showcases the transition from a **Figma high-fidelity prototype** to a functional, data-driven web application using modern AI-assisted development workflows.

### 🛠 Tech Stack & AI Toolkit
- **Design:** Figma (High-fidelity prototyping)
- **Development:** [Lovable](https://lovable.dev/) & [Cursor](https://cursor.sh/) (AI-native coding)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **AI:** Gemini API (client-side) for vibe check, word lab, and playbook replies
- **Backend (planned):** Supabase for analysis history (no login in current MVP)

### 🎓 Learning Design Principles
As a **CMU METALS** student, I integrated evidence-based learning science into the product logic:

- **Contextualized Scaffolding:** Using AI to decode social nuances and cultural context within user-provided screenshots or text, providing necessary support for comprehension.
- **Facilitating Knowledge Transfer:** Helping learners apply formal linguistic knowledge to informal, real-world conversational contexts through immediate AI-powered feedback.
- **Adaptive Personalization (Vision):** Future iterations focus on tailoring content based on the user's specific cultural background and professional goals.

### 📍 Current version (MVP scope)
- **No login.** Use the app immediately: upload a chat screenshot, pick context (Friend / Work / Dating / Formal), and get Leon's take.
- **Flow:** Home → Upload (photo library, camera, or files) → Analyze (context + Gemini) → Results (Vibe Check, Word Lab, Playbook).
- **Playbook:** Three reply types (Vibe Match, Stay Chill, Keep it Real). Customization accordion lets you switch tone (Witty, Sincere, Formal); only the replies refetch, not Vibe Check or Word Lab.
- **New chat +** on Results returns to home. Analysis history (e.g. via Supabase) is planned for a later release.

### 💻 Local Development
1. Clone the repository.
2. Add a `.env` file with:
   - `VITE_GEMINI_API_KEY` — required for analysis ([Google AI Studio](https://aistudio.google.com/apikey)).
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` — optional for now; used when we add analysis history.
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`

### 🚢 Deploy to Vercel (e.g. for mobile testing)
1. Push the repo to GitHub and [import the project in Vercel](https://vercel.com/new).
2. Set **Environment Variables** in the Vercel project:
   - `VITE_GEMINI_API_KEY` — your Gemini API key (required for analysis).
   - `VITE_SUPABASE_URL` — Supabase project URL.
   - `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase **anon/public** key (not the service_role key).
3. Deploy. The app uses client-side routing; `vercel.json` rewrites all routes to `index.html` so `/analyze` and `/results` work on refresh and when opening links on mobile.

### 🔒 Supabase security (before publishing)
- **RLS:** Row Level Security is enabled on `analysis_history` via the migration in `supabase/migrations/`. Run it in the Supabase SQL editor (Dashboard → SQL Editor) or with the Supabase CLI so anon can only **insert** and **select** (no update/delete from the client).
- **Keys:** Use only the **anon (publishable)** key in the frontend. Never put `service_role` in the client or in Vercel env vars that the browser can see.
- **Optional:** In Supabase Dashboard → Authentication → Settings, you can restrict auth if you're not using it yet.

### 🔌 Supabase (analysis history)
Supabase is used for **analysis history** (no login in this MVP). Each successful analysis is stored so users can reopen past "Leon's Take" from the History menu. Apply the RLS migration above before going live.

- **Anonymous user ID:** History is isolated per device via `anonymous_user_id` in localStorage. Run the `20260212000000_add_user_id_analysis_history.sql` migration (adds `user_id` column) so new rows store it. **If you see `user_id` as NULL in the dashboard,** you're likely viewing rows inserted by the **old deployed app** (before pushing the guest-ID code). Run the app **locally** (`npm run dev`), do one new analysis, then check the new row in Supabase and the browser console for `[LingoBuddy]` logs.
- **Times in Supabase:** `created_at` is stored in **UTC**. The dashboard shows UTC (e.g. 14:00+00). In Pittsburgh (EST, UTC−5) that is 9:00 AM local—so the time is correct.
- **Error logging:** When users hit "Leon is taking a nap" or other failures, the app reports to the `error_log` table (see migration `20260212100000_create_error_log.sql`). In Supabase Dashboard → Table Editor → `error_log` you can see `code`, `message`, `context` (route, anonymous_user_id, user_agent), and `raw_error` (stack trace or response body) to debug and fix issues. RLS allows anon to **insert** only; only you (Dashboard/service_role) can read logs.

---
**[Vanessa Chang](https://www.linkedin.com/in/vanessa-chc/)** | [View Case Study](https://www.vanessachangux.com/projects/lingo-buddy?utm_source=github&utm_medium=social&utm_campaign=lingobuddy-readme)
