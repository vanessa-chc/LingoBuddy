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
- **No login.** Use the app immediately: upload a chat screenshot, pick context (Friend / Work / Dating / Formal), and get Leon’s take.
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

### 🔌 Supabase (future)
Supabase is wired in the repo for **analysis history** (no auth in this MVP). When we add it: store each analysis (context, vibe check, word lab, playbook) so users can revisit past “Leon’s Take” sessions.

---
**[Vanessa Chang](https://www.linkedin.com/in/vanessa-chc/)** | [View Case Study](https://www.vanessachangux.com/projects/lingo-buddy?utm_source=github&utm_medium=social&utm_campaign=lingobuddy-readme)
