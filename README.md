# Aimhyr — AI Interview Simulator

An AI-powered mock interview platform that lets users practice real-time voice interviews with an AI interviewer and receive detailed, structured feedback. Built with **Next.js 16**, **Firebase**, **Groq AI**, and **ElevenLabs Conversational AI**.

> **Live Demo:** [ai-interview-simulator-beige.vercel.app](https://ai-interview-simulator-beige.vercel.app/)

---

## ✨ Features

- **AI-Powered Voice Interviews** — Conduct real-time voice conversations with an AI interviewer using ElevenLabs Conversational AI
- **Dynamic Question Generation** — AI generates tailored interview questions based on the target role, experience level, interview type, and tech stack
- **Structured Feedback** — After each interview, the AI evaluates performance across 5 categories with scores, strengths, and improvement areas
- **Multiple Interview Types** — Supports Technical, Behavioural, and Mixed interview formats
- **Experience Levels** — Tailored questions for Junior, Mid, Senior, and Lead levels
- **Community Interviews** — Browse and take interviews created by other users
- **Authentication** — Secure sign-up/sign-in with Firebase Authentication and server-side session cookies
- **Interview Management** — View, retake, and delete your past interviews
- **Responsive Design** — Dark-themed UI with Mona Sans typography, optimized for all screen sizes

---

## 🛠 Tech Stack

| Layer              | Technology                                                  |
| ------------------ | ----------------------------------------------------------- |
| **Framework**      | [Next.js 16](https://nextjs.org/) (App Router, RSC)         |
| **Language**       | TypeScript 5                                                |
| **Styling**        | Tailwind CSS 4 + custom CSS                                 |
| **UI Components**  | Radix UI + shadcn/ui + Lucide icons                         |
| **AI / LLM**       | [Groq](https://groq.com/) (Llama 3.3 70B via Vercel AI SDK)|
| **Voice AI**       | [ElevenLabs](https://elevenlabs.io/) Conversational AI      |
| **Database**       | Firebase Firestore                                          |
| **Authentication** | Firebase Auth (email/password) + server-side sessions       |
| **Forms**          | React Hook Form + Zod validation                            |
| **Deployment**     | Vercel (with Vercel Analytics)                               |

---

## 📁 Project Structure

```
ai-interview-simulator/
├── app/
│   ├── (auth)/                    # Auth route group (sign-in, sign-up)
│   │   ├── layout.tsx             # Auth-specific layout
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (root)/                    # Authenticated route group
│   │   ├── layout.tsx             # Main layout with navbar + auth guard
│   │   ├── page.tsx               # Dashboard (your interviews + community)
│   │   └── interview/
│   │       ├── page.tsx           # Create new interview form
│   │       └── [id]/
│   │           ├── page.tsx       # Voice interview session (Agent)
│   │           └── feedback/
│   │               └── page.tsx   # Interview feedback/results
│   ├── api/
│   │   ├── elevenlabs/
│   │   │   └── signed-url/route.ts  # Signed URL endpoint for secure ElevenLabs sessions
│   │   └── interview/
│   │       ├── generate/route.ts    # Interview question generation API
│   │       └── session/route.ts     # Interview session management API
│   ├── globals.css                # Global styles and design tokens
│   └── layout.tsx                 # Root layout (Mona Sans font, dark theme)
│
├── components/
│   ├── Agent.tsx                  # Real-time voice interview component (ElevenLabs)
│   ├── AuthForm.tsx               # Reusable sign-in/sign-up form
│   ├── DeleteInterviewButton.tsx  # Delete interview with confirmation
│   ├── DisplayTechIcons.tsx       # Tech stack icon renderer
│   ├── FormField.tsx              # Generic form field wrapper
│   ├── InterviewCard.tsx          # Interview preview card
│   ├── InterviewForm.tsx          # Create interview form (role, level, type, stack)
│   ├── LogoutButton.tsx           # Sign-out button
│   └── ui/                       # shadcn/ui primitives (Button, Input, Form, etc.)
│
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts         # Server actions: signIn, signUp, signOut, getCurrentUser
│   │   └── general.action.ts      # Server actions: CRUD for interviews & feedback
│   ├── ai/
│   │   ├── feedback-generator.ts  # Orchestrates transcript → feedback pipeline
│   │   ├── interviewer-config.ts  # ElevenLabs agent dynamic variable builder
│   │   ├── llm-client.ts          # Groq LLM client with retry logic & JSON extraction
│   │   └── prompt-builder.ts      # System/user prompts for questions & feedback
│   ├── config/
│   │   └── env.ts                 # Zod-validated environment variable loader
│   ├── errors/
│   │   └── index.ts               # Custom error classes (AIError, ValidationError, etc.)
│   ├── services/
│   │   ├── auth.service.ts        # Firebase Auth service layer
│   │   ├── feedback.service.ts    # Feedback Firestore operations
│   │   └── interview.service.ts   # Interview generation + Firestore operations
│   └── utils.ts                   # Utility functions (cn, getRandomInterviewCover, etc.)
│
├── constants/
│   ├── index.ts                   # Barrel exports + dummy data
│   ├── interview-covers.ts        # Interview card cover image paths
│   ├── mappings.ts                # Tech icon & display name mappings
│   └── schemas.ts                 # Zod schemas (feedbackSchema)
│
├── firebase/
│   ├── admin.ts                   # Firebase Admin SDK initialization (server-side)
│   └── client.ts                  # Firebase Client SDK initialization (client-side)
│
├── types/
│   └── index.d.ts                 # Global TypeScript interfaces (Interview, Feedback, User, etc.)
│
└── public/                        # Static assets (logos, avatars, covers, icons)
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn/pnpm/bun)
- A **Firebase** project with Firestore and Authentication enabled
- A **Groq** API key ([console.groq.com](https://console.groq.com/))
- An **ElevenLabs** account with a Conversational AI agent configured ([elevenlabs.io](https://elevenlabs.io/))

### 1. Clone the Repository

```bash
git clone https://github.com/Shanksch/ai-interview-simulator.git
cd ai-interview-simulator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ─── ElevenLabs ───────────────────────────────────
ELEVENLABS_AGENT_ID_INTERVIEWER="your_elevenlabs_agent_id"
ELEVENLABS_API_KEY="your_elevenlabs_api_key"

# ─── Groq AI ──────────────────────────────────────
GROQ_API_KEY="your_groq_api_key"

# ─── App ──────────────────────────────────────────
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# ─── Firebase Client (public) ────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

# ─── Firebase Admin (server-only) ────────────────
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable                                    | Required | Side   | Description                                     |
| ------------------------------------------- | -------- | ------ | ----------------------------------------------- |
| `GROQ_API_KEY`                              | ✅       | Server | Groq API key for LLM inference                  |
| `ELEVENLABS_API_KEY`                        | Optional | Server | ElevenLabs API key for signed URL generation     |
| `ELEVENLABS_AGENT_ID_INTERVIEWER`           | Optional | Server | ElevenLabs agent ID for the voice interviewer    |
| `FIREBASE_PROJECT_ID`                       | ✅       | Server | Firebase project ID (Admin SDK)                  |
| `FIREBASE_CLIENT_EMAIL`                     | ✅       | Server | Firebase service account email                   |
| `FIREBASE_PRIVATE_KEY`                      | ✅       | Server | Firebase service account private key             |
| `NEXT_PUBLIC_FIREBASE_API_KEY`              | ✅       | Client | Firebase client API key                          |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`          | ✅       | Client | Firebase auth domain                             |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`           | ✅       | Client | Firebase project ID (Client SDK)                 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`       | ✅       | Client | Firebase storage bucket                          |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`  | ✅       | Client | Firebase messaging sender ID                     |
| `NEXT_PUBLIC_FIREBASE_APP_ID`               | ✅       | Client | Firebase app ID                                  |
| `NEXT_PUBLIC_BASE_URL`                      | Optional | Client | Base URL of the deployed application             |

---

## ⚙️ How It Works

### Interview Flow

```
User creates interview → AI generates questions (Groq) → User starts voice session
→ ElevenLabs conducts real-time voice interview → Transcript captured
→ AI generates structured feedback (Groq) → Results displayed with scores
```

1. **Create Interview** — The user fills out a form specifying the job role, experience level, interview type (technical/behavioural/mixed), tech stack, and number of questions.
2. **Question Generation** — The Groq LLM (Llama 3.3 70B) generates tailored interview questions based on the input parameters.
3. **Voice Interview** — The ElevenLabs Conversational AI agent conducts a real-time voice interview, asking the generated questions, following up as needed, and maintaining a natural conversational flow.
4. **Transcript Capture** — The conversation transcript is captured client-side in real time.
5. **Feedback Generation** — After the call ends, the transcript is sent to Groq for evaluation. The LLM scores the candidate across 5 categories (Communication, Technical Knowledge, Problem Solving, Cultural Fit, Confidence) and provides actionable feedback.
6. **Results** — The user sees a detailed feedback page with scores, strengths, areas for improvement, and a final assessment.

### AI Pipeline

- **LLM Client** (`lib/ai/llm-client.ts`) — Robust Groq wrapper with exponential backoff retry, timeout handling, JSON extraction from markdown-wrapped responses, and Zod schema validation.
- **Prompt Builder** (`lib/ai/prompt-builder.ts`) — Specialized prompt templates for question generation and feedback evaluation.
- **Feedback Generator** (`lib/ai/feedback-generator.ts`) — Orchestration layer: transcript → prompt → LLM → validated feedback object.

### Authentication

- Firebase Auth handles email/password authentication on the client.
- Server-side session cookies (1-week expiry) are created via Firebase Admin SDK.
- Protected routes redirect unauthenticated users to `/sign-in`.

---

## 📡 API Routes

| Route                          | Method | Description                                  |
| ------------------------------ | ------ | -------------------------------------------- |
| `/api/elevenlabs/signed-url`   | GET    | Generates a signed URL for secure ElevenLabs agent sessions |
| `/api/interview/generate`      | POST   | Generates interview questions via AI         |
| `/api/interview/session`       | POST   | Manages interview session state              |

---

## 🧩 Key Components

| Component              | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `Agent`                | Core voice interview UI — manages ElevenLabs session lifecycle, transcript capture, and post-call feedback generation |
| `InterviewForm`        | Create-interview form with React Hook Form + Zod validation          |
| `InterviewCard`        | Card component displaying interview metadata with tech stack icons    |
| `AuthForm`             | Shared sign-in/sign-up form with Firebase client-side auth           |
| `DeleteInterviewButton`| Deletes an interview and its associated feedback from Firestore      |

---

## 🧪 Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the development server   |
| `npm run build` | Build for production           |
| `npm run start` | Start the production server    |
| `npm run lint`  | Run ESLint                     |

---

## 🚢 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

1. Push your code to a GitHub repository.
2. Import the repository on [vercel.com](https://vercel.com/new).
3. Add all the environment variables from `.env.local` to the Vercel project settings.
4. Deploy — Vercel will automatically detect the Next.js framework.

> **Note:** Vercel Analytics is pre-integrated via `@vercel/analytics`.

---

## 📝 License

This project is private. All rights reserved.
