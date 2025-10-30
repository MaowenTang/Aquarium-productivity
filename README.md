#  Aquarium Productivity App

**A cross-platform productivity and mindfulness app that combines task management, focus enhancement, and guided meditation in one calming environment.**

Developed as part of *CINS 5318 – Software Engineering* under Dr. Mary Kim, this project focuses on building a **real-time, Supabase-powered Progressive Web App (PWA)** that integrates intuitive task visualization, Pomodoro-style focus sessions, and relaxation modules.

---

##  Overview

In today’s digital era, constant **context switching**, **information overload**, and **stress** reduce productivity.
Most productivity tools focus on task lists but ignore mental balance.

The **Aquarium Productivity App** merges:

* 🧠 **Task Management** — represented as floating bubbles sized by priority.
* ⏳ **Focus Mode** — Pomodoro sessions with timers, notifications, and progress tracking.
* 🧘 **Meditation Module** — guided breathing with wave animations and calming audio.
* ☁️ **Real-time Cloud Sync** — cross-device synchronization via Supabase Realtime.

---

##  System Architecture

The application uses a **serverless, real-time architecture** built around **Supabase**.

**Architecture Highlights:**

* **Frontend:** React + TypeScript PWA for desktop & mobile with offline support.
* **Backend:** Supabase (PostgreSQL + PostgREST + Auth + Realtime + Storage).
* **Security:** Row-Level Security (RLS) + JWT-based session validation.
* **External APIs:** OpenWeatherMap, Geolocation API, Web Audio API for enhanced interactivity.

---

## ⚙️ Core Components

| Module                | Description                                                   |
| --------------------- | ------------------------------------------------------------- |
| **Task Manager**      | CRUD operations for tasks with dynamic bubble visualization.  |
| **Focus Mode**        | Pomodoro-style sessions with timer control and logging.       |
| **Meditation Module** | Guided breathing and ambient soundscapes using Web Audio API. |
| **Analytics**         | Daily/weekly statistics of completed tasks and focus time.    |
| **Auth & Security**   | Supabase Auth for secure login and per-user isolation (RLS).  |
| **Realtime Sync**     | Multi-device data synchronization through Supabase channels.  |

---

##  Technology Stack

| Category           | Key Technologies                                          |
| ------------------ | --------------------------------------------------------- |
| **Frontend Core**  | React, TypeScript, Tailwind CSS                           |
| **Backend / BaaS** | Supabase (PostgreSQL, PostgREST, Auth, Storage, Realtime) |
| **UI & Animation** | shadcn/ui, Lucide Icons, Framer Motion                    |
| **APIs**           | OpenWeatherMap, Web Audio API, Geolocation API            |

---

##  Sequence Flow – Start Focus Session

When the user starts a focus session:

1. **User** clicks “Start Focus” → frontend validates JSON Web Token via **Supabase Auth**.
2. Upon success, frontend sends `POST /focus_sessions` to **Supabase REST API**.
3. A new session record is created in **PostgreSQL**.
4. The frontend subscribes to the user’s **Realtime channel** for live timer updates.
5. Progress visualization updates dynamically across all logged-in devices.

If authorization fails, a 401 error prompts “Sign in required.”


---

##  Getting Started

### Prerequisites

* Node.js & npm
* Supabase account
* OpenWeatherMap API key

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/aquarium-productivity-app.git
cd aquarium-productivity-app

# Install dependencies
npm install

# Add your environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_WEATHER_API_KEY=<openweathermap-key>
```

---

##  Future Improvements

* AI-powered task prioritization
* Collaborative workspaces
* Custom meditation soundscapes
* Offline-first caching for all modules

---


## 📄 License

This project is developed for educational purposes under **Prairie View A&M University (PVAMU)**.
All rights reserved © 2025.
