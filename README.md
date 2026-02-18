# LingoBuddy 🎙️

**Bridging the gap between formal English education and real-world American conversations.**

LingoBuddy is an AI-native slang learning assistant that leverages generative AI to help international students decode social nuances. As a CMU METALS student project, it showcases the transition from a high-fidelity Figma prototype to a functional, data-driven web application using modern AI-assisted development workflows.

### 🚀 Product Roadmap & Iterations
I’ve documented the full design and development journey through GitHub Issues and Milestones:

- v1.0 Foundation: Established the multimodal core using Gemini 2.5 Flash for screenshot analysis and established the "Word Lab" architecture.
- v1.1 UX Polish: Introduced Leon (the mascot) to humanize AI feedback and implemented a consistent design system for slang tiers.
- v1.2 Strategic AI Logic: Refined Leon’s voice for Grounded & Natural Insights, focusing on trust calibration and reducing cognitive overload by weaving context directly into prose.

### 🎓 Learning Design Principles (The METALS Touch)
I integrated evidence-based learning science into the product logic:

- **Contextualized Scaffolding:** Leon decodes cultural nuances (e.g., US Tech, Gen-Z slang) to provide "just-in-time" support based on user-provided screenshots.
- **Scaffolding on Demand:** To prevent cognitive overload, deeper cultural insights are tucked behind Leon’s interactive tips, ensuring information is available but not overwhelming.
- **Trust Calibration:** Following Google PAIR guidelines, Leon discloses the "why" behind slang interpretations (e.g., "In a US college setting...") to build user confidence.

### 🛠 Tech Stack & AI Toolkit
- **Design:** Figma (High-fidelity prototyping)
- **Development:** React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **AI:** Gemini API (client-side) for vibe check, word lab, and playbook replies
- **Backend:** Supabase (PostgreSQL) for analysis history and anonymous error logging

### 📍 MVP Scope & Flow
1. **Home:** Fast-track entry; no login required.
2. **Upload:** Capture chat screenshots or files.
3. **Analyze:** Pick context (Friend/Work/Dating/Formal) to trigger Leon’s analysis.
4. **Results:**
   - **Vibe Check:** Overall sentiment analysis.
   - **Word Lab:** Deep dives into specific slang/nuances.
   - **Playbook:** Three smart reply types (Vibe Match, Stay Chill, Keep it Real) with adjustable tones (Witty, Sincere, Formal).

### 💻 Technical Setup & Security
**Local Development**
1. Clone the repository.
2. Create a `.env` file with `VITE_GEMINI_API_KEY`
3. `npm install` && `npm run dev`

**Supabase & Security (Data-driven Insights)**
- **Anonymous History**: Uses `anonymous_user_id` in `localStorage` to isolate history per device, enabling a seamless "no-login" experience while maintaining data persistence.
- **RLS (Row Level Security)**: Configured via SQL migrations to ensure strict data privacy—clients are restricted to `INSERT` and `SELECT` operations only on their own generated data.
- **Error Logging**: Implemented automated reporting to an `error_log` table to monitor "Leon's Nap" (API failures) or UI crashes in real-time, facilitating rapid debugging and UX improvements.

---
**[Vanessa Chang](https://www.linkedin.com/in/vanessa-chc/)** | [View Case Study](https://www.vanessachangux.com/projects/lingo-buddy?utm_source=github&utm_medium=social&utm_campaign=lingobuddy-readme)
