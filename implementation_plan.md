# Production Rewrite — AI Interview Simulator

Rewrite the existing PrepWise codebase into a clean, layered, production-ready system. **Includes full migration from Vapi to ElevenLabs Conversational AI.**

> [!IMPORTANT]
> This plan keeps the existing frontend UI/CSS intact and focuses on **backend architecture, AI pipeline, ElevenLabs migration, and missing infrastructure**.

---

## User Review Required

> [!WARNING]
> **Vapi → ElevenLabs Migration**: This replaces the entire voice AI layer. You will need to:
> 1. Create **two ElevenLabs Agents** on the [ElevenLabs dashboard](https://elevenlabs.io/app/agents):
>    - **Interview Generator Agent** — collects interview params (role, level, techstack, type, question count) via voice conversation, then calls a server tool webhook to `/api/elevenlabs/generate`
>    - **Interviewer Agent** — conducts the actual interview using questions injected via dynamic variables
> 2. Get your **ElevenLabs API key** and **Agent IDs** from the dashboard
> 3. Enable **overrides** for system prompt and first message in the Interviewer Agent's security settings

> [!IMPORTANT]
> **Missing npm packages** to install: `dayjs`, `ai`, `@ai-sdk/google`, `firebase-admin`, `@elevenlabs/react`, `@elevenlabs/client`
>
> **Packages to remove**: `@vapi-ai/web`

---

## New Architecture

```
ai-interview-simulator/
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # ✅ Unchanged
│   ├── globals.css                     # ✅ Unchanged
│   ├── (auth)/                         # ✅ Unchanged
│   ├── (root)/
│   │   ├── layout.tsx                  # ✅ Unchanged
│   │   ├── page.tsx                    # ✅ Unchanged
│   │   └── interview/
│   │       └── [id]/
│   │           ├── page.tsx            # 🔧 Fix stale profileImage prop
│   │           └── feedback/
│   │               └── page.tsx        # 🆕 Feedback display page
│   └── api/
│       └── elevenlabs/                 # 🔧 Renamed from /api/vapi/
│           └── generate/route.ts       # 🔧 Rewrite with service layer
│
├── components/
│   ├── Agent.tsx                       # 🔧 REWRITE: Vapi → ElevenLabs useConversation
│   └── ...                             # ✅ Rest unchanged
│
├── lib/
│   ├── utils.ts                        # 🔧 Moved from lib/actions/
│   ├── elevenlabs.sdk.ts              # 🆕 Replaces lib/vapi.sdk.tsx
│   │
│   ├── config/
│   │   └── env.ts                      # 🆕 Zod-validated environment config
│   │
│   ├── errors/
│   │   └── index.ts                    # 🆕 Custom error classes
│   │
│   ├── ai/                             # 🆕 MODULAR AI PIPELINE
│   │   ├── prompt-builder.ts           # 🆕 Centralized prompt templates
│   │   ├── llm-client.ts              # 🆕 LLM wrapper with retry/fallback
│   │   ├── feedback-generator.ts       # 🆕 Transcript → structured feedback
│   │   └── interviewer-config.ts       # 🆕 ElevenLabs agent configuration
│   │
│   ├── services/                       # 🆕 SERVICE LAYER
│   │   ├── auth.service.ts
│   │   ├── interview.service.ts
│   │   └── feedback.service.ts
│   │
│   └── actions/                        # SERVER ACTIONS
│       ├── auth.action.ts              # 🆕 Critical missing file
│       └── general.action.ts           # 🆕 Critical missing file
│
├── firebase/                           # ✅ Unchanged
├── constants/                          # 🔧 Split + remove Vapi config
├── types/                              # 🔧 Replace Vapi types with ElevenLabs
└── .env.local                          # 🔧 Updated env vars
```

---

## Vapi → ElevenLabs Migration (CRITICAL)

### What changes and why

| Aspect | Vapi (Current) | ElevenLabs (New) |
|--------|---------------|------------------|
| **SDK** | `@vapi-ai/web` | `@elevenlabs/react` + `@elevenlabs/client` |
| **React API** | `vapi.start()`, `vapi.stop()`, manual event listeners | `useConversation()` hook with `startSession()`, `endSession()` |
| **Voice** | ElevenLabs "sarah" via Vapi proxy | ElevenLabs directly (same quality, lower latency) |
| **Transcription** | Deepgram Nova-2 via Vapi | ElevenLabs proprietary ASR (built-in) |
| **LLM** | OpenAI GPT-4 via Vapi | Configurable per-agent (GPT-4o, Gemini, Claude, etc.) |
| **Turn-taking** | Vapi managed | ElevenLabs proprietary turn-taking model |
| **Agent config** | Inline `CreateAssistantDTO` in constants | Dashboard-configured agents with `agentId` |
| **Dynamic data** | `variableValues` in `vapi.start()` | `dynamicVariables` + `overrides` in `startSession()` |
| **Webhooks** | Vapi Workflow → POST to `/api/vapi/generate` | Server Tool → POST to `/api/elevenlabs/generate` |
| **Pricing** | Vapi per-minute + Deepgram + ElevenLabs + OpenAI | ElevenLabs credits only (simpler billing) |

### Environment Variables Update

```diff
- NEXT_PUBLIC_VAPI_WEB_TOKEN=
- NEXT_PUBLIC_VAPI_WORKFLOW_ID=
+ NEXT_PUBLIC_ELEVENLABS_AGENT_ID_GENERATOR=    # Agent that collects interview params
+ NEXT_PUBLIC_ELEVENLABS_AGENT_ID_INTERVIEWER=   # Agent that conducts interviews
+ ELEVENLABS_API_KEY=                            # Server-side API key for signed URLs

  GOOGLE_GENERATIVE_AI_API_KEY=
  NEXT_PUBLIC_BASE_URL=
  # Firebase vars unchanged...
```

### ElevenLabs Agent Setup (Dashboard Steps)

**Agent 1: Interview Generator** (replaces Vapi Workflow)
- **First message**: `"Hi {{user_name}}! I'll help you set up a practice interview. What role are you preparing for?"`
- **System prompt**: Collects role, level, techstack, interview type, and question count through natural conversation
- **Server Tool**: Webhook `POST /api/elevenlabs/generate` — sends collected params to your backend
- **Dynamic variables**: `user_name`, `user_id`

**Agent 2: Interviewer** (replaces Vapi Assistant)
- **First message**: `"Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience."`
- **System prompt**: Same interviewer persona as current [constants/index.ts](file:///c:/developer%20projects/ai-interview-simulator/constants/index.ts), with `{{questions}}` template
- **Dynamic variables**: `questions` (injected at session start)
- **Enable overrides**: System prompt + First message (in Security settings)

---

## Proposed Changes

### Agent.tsx Rewrite

#### [MODIFY] [Agent.tsx](file:///c:/developer%20projects/ai-interview-simulator/components/Agent.tsx)

Complete rewrite from Vapi SDK to ElevenLabs React hook:

```diff
- import { vapi } from "@/lib/vapi.sdk";
- import { interviewer } from "@/constants";
+ import { useConversation } from "@elevenlabs/react";

  const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
-   // Manual event listener setup in useEffect
-   vapi.on("call-start", onCallStart);
-   vapi.on("call-end", onCallEnd);
-   vapi.on("message", onMessage);
-   vapi.on("speech-start", onSpeechStart);
-   vapi.on("speech-end", onSpeechEnd);
+   // Declarative hook with callbacks
+   const conversation = useConversation({
+     onConnect: () => setCallStatus(CallStatus.ACTIVE),
+     onDisconnect: () => setCallStatus(CallStatus.FINISHED),
+     onMessage: (message) => { /* capture transcript */ },
+     onModeChange: ({ mode }) => setIsSpeaking(mode === "speaking"),
+     onError: (error) => console.error("ElevenLabs error:", error),
+   });

    const handleCall = async () => {
-     if (type === "generate") {
-       await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
-         variableValues: { username: userName, userid: userId },
-       });
-     } else {
-       await vapi.start(interviewer, {
-         variableValues: { questions: formattedQuestions },
-       });
-     }
+     const agentId = type === "generate"
+       ? process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_GENERATOR!
+       : process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID_INTERVIEWER!;
+
+     await conversation.startSession({
+       agentId,
+       dynamicVariables: type === "generate"
+         ? { user_name: userName, user_id: userId }
+         : { questions: formattedQuestions },
+     });
    };

    const handleDisconnect = () => {
-     vapi.stop();
+     await conversation.endSession();
    };
  };
```

**Key behavioral mapping:**

| Vapi Event | ElevenLabs Callback | Notes |
|-----------|-------------------|-------|
| `call-start` | `onConnect` | Session established |
| `call-end` | `onDisconnect` | Session ended |
| `message` (transcript) | [onMessage](file:///c:/developer%20projects/ai-interview-simulator/components/Agent.tsx#47-53) | Transcript data |
| `speech-start` | `onModeChange({ mode: "speaking" })` | Agent is speaking |
| `speech-end` | `onModeChange({ mode: "listening" })` | Agent finished speaking |
| `error` | [onError](file:///c:/developer%20projects/ai-interview-simulator/components/Agent.tsx#64-67) | Error handling |

---

### New ElevenLabs SDK File

#### [NEW] [elevenlabs.sdk.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/elevenlabs.sdk.ts)

```typescript
// Server-side ElevenLabs client for signed URL generation
import { ElevenLabsClient } from "@elevenlabs/client";

export const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});
```

#### [DELETE] [vapi.sdk.tsx](file:///c:/developer%20projects/ai-interview-simulator/lib/actions/vapi.sdk.tsx)

No longer needed — Vapi entirely removed.

---

### Config & Error Handling

#### [NEW] [env.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/config/env.ts)

Zod-validated environment config — validates all env vars at import time. Replaces scattered `process.env.*!` calls.

#### [NEW] [index.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/errors/index.ts)

Custom error hierarchy: `AppError` → `AuthError`, `NotFoundError`, `ValidationError`, `AIError`.

---

### AI Pipeline Modules

#### [NEW] [prompt-builder.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/ai/prompt-builder.ts)

- `buildQuestionGenerationPrompt(params)` → Gemini prompt for generating interview questions
- `buildFeedbackPrompt({ transcript, role, techstack })` → feedback evaluation prompt

#### [NEW] [llm-client.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/ai/llm-client.ts)

- `generateWithRetry(config)` — wraps Vercel AI SDK with exponential backoff (3 attempts), timeout, token logging

#### [NEW] [feedback-generator.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/ai/feedback-generator.ts)

- Takes interview transcript → builds prompt → calls LLM → returns Zod-validated [Feedback](file:///c:/developer%20projects/ai-interview-simulator/types/index.d.ts#1-15)

#### [NEW] [interviewer-config.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/ai/interviewer-config.ts)

- ElevenLabs agent IDs and default config (replaces Vapi `CreateAssistantDTO` from constants)

---

### Service Layer

#### [NEW] [auth.service.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/services/auth.service.ts)

`createSession()`, `verifySession()`, `createUser()`, `getUserById()`, `destroySession()`

#### [NEW] [interview.service.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/services/interview.service.ts)

`generateQuestions()`, `getInterviewById()`, `getInterviewsByUserId()`, `getLatestInterviews()`

#### [NEW] [feedback.service.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/services/feedback.service.ts)

`generateFeedback()`, `getFeedbackByInterviewId()`

---

### Server Actions (Missing Files)

#### [NEW] [auth.action.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/actions/auth.action.ts)

`signUp()`, `signIn()`, `isAuthenticated()`, `getCurrentUser()` — thin `"use server"` wrappers calling auth service

#### [NEW] [general.action.ts](file:///c:/developer%20projects/ai-interview-simulator/lib/actions/general.action.ts)

`getInterviewsByUserId()`, `getLatestInterviews()`, `getFeedbackByInterviewId()`, `createFeedback()`, `getInterviewById()` — thin wrappers calling services

---

### API Route Rewrite

#### [MODIFY] [route.ts](file:///c:/developer%20projects/ai-interview-simulator/app/api/elevenlabs/generate/route.ts)

Moved from `/api/vapi/generate` → `/api/elevenlabs/generate`. Uses service layer + Zod input validation.

---

### Missing Pages & Fixes

#### [NEW] [page.tsx](file:///c:/developer%20projects/ai-interview-simulator/app/(root)/interview/[id]/feedback/page.tsx)

Feedback display page showing scores, category breakdown, strengths, and improvements.

#### [MODIFY] [page.tsx](file:///c:/developer%20projects/ai-interview-simulator/app/(root)/interview/[id]/page.tsx)

Remove stale `profileImage` prop.

#### [MODIFY] [index.d.ts](file:///c:/developer%20projects/ai-interview-simulator/types/index.d.ts)

Remove Vapi types, update [AgentProps](file:///c:/developer%20projects/ai-interview-simulator/types/index.d.ts#50-58).

#### [DELETE] [vapi.d.ts](file:///c:/developer%20projects/ai-interview-simulator/types/vapi.d.ts)

No longer needed — Vapi entirely removed.

---

### Constants Cleanup

Split [constants/index.ts](file:///c:/developer%20projects/ai-interview-simulator/constants/index.ts) into:
- `constants/mappings.ts` — tech name → icon slug
- `constants/schemas.ts` — Zod feedback schema
- `constants/interview-covers.ts` — cover image paths
- [constants/index.ts](file:///c:/developer%20projects/ai-interview-simulator/constants/index.ts) — re-exports barrel

**Remove**: `interviewer` (Vapi `CreateAssistantDTO`) — replaced by ElevenLabs dashboard agent

---

## Verification Plan

### Automated: Build Check

```powershell
cd "c:\developer projects\ai-interview-simulator"
npm run build
```

### Manual: ElevenLabs Integration

1. Create two agents on ElevenLabs dashboard
2. Fill [.env.local](file:///c:/developer%20projects/ai-interview-simulator/.env.local) with agent IDs and API key
3. Run `npm run dev` and test voice conversation flow
