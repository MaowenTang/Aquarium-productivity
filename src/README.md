# 🌊 Aquarium Serenity

> A beautiful cross-platform productivity application that combines task management with mindfulness, featuring a serene ocean theme and innovative bubble-based task visualization.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ECF8E?logo=supabase)

---

## ✨ Overview

**Aquarium Serenity** is a next-generation productivity app that reimagines task management through the lens of mindfulness and beautiful design. Tasks float as bubbles in an underwater scene, with size representing priority and color indicating urgency. The app seamlessly blends productivity features with meditation tools, ambient sounds, and AI-powered planning assistance.

### 🎯 Key Features

#### 📋 **Advanced Task Management**
- **Bubble Visualization** - Tasks displayed as interactive floating bubbles
- **Smart Prioritization** - Visual priority system (High/Medium/Low)
- **Urgency Tracking** - Color-coded deadline awareness (Overdue/Urgent/Warning/Normal)
- **Recurring Tasks** - Full support for repeating tasks with flexible schedules
- **Task Details** - Rich task information with descriptions, deadlines, and priorities
- **Mobile-Optimized Layout** - Responsive 2-column grid on mobile, 5-column on desktop

#### 🧘 **Mindfulness Integration**
- **Meditation Module** - Guided breathing exercises and visualization sessions
- **7 Ambient Sounds** - Ocean waves, rain, forest, white noise, fireplace, stream, wind chimes
- **Focus Mode** - Pomodoro timer with break integration
- **Breathing Exercises** - Visual guided breathing patterns (4-4-6 rhythm)
- **Session Types** - Breathing, meditation, and visualization modes

#### 🤖 **AI Planning Assistant**
- Task analysis and optimization
- Priority recommendations
- Workload balancing
- Smart scheduling suggestions

#### 📅 **Enhanced Planner**
- Daily, weekly, and monthly views
- Timeline visualization
- Calendar integration
- Due date tracking
- Completion statistics

#### 🌤️ **Weather Integration**
- Location-based weather display
- OpenWeather API integration
- Real-time conditions

#### ⚙️ **Settings & Customization**
- **Theme System** - Light and dark ocean themes
- **Security Settings** - Privacy controls and data management
- **Location Management** - Weather location configuration
- **Cloud Sync** - Full Supabase cloud synchronization

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ or **Bun** runtime
- **Supabase Account** (free tier works)
- **OpenWeather API Key** (optional, for weather features)

### Installation

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd aquarium-serenity
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Configure Supabase**
   
   Create a Supabase project at [supabase.com](https://supabase.com) and note your:
   - Project URL
   - Anon/Public API Key
   - Service Role Key (for backend)

4. **Set up environment variables**
   
   The app will prompt you to configure these on first run:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `OPENWEATHER_API_KEY` - (Optional) Your OpenWeather API key

5. **Initialize the database**
   
   The app includes an automatic database setup wizard that will:
   - Check for required tables
   - Provide SQL migration scripts
   - Guide you through manual setup in Supabase dashboard

6. **Run the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

---

## 📖 Usage Guide

### First Time Setup

1. **Sign Up/Login** - Create an account or sign in with existing credentials
2. **Database Setup** - Follow the automatic setup wizard to initialize tables
3. **Location Permission** - (Optional) Grant location access for weather features
4. **Create Your First Task** - Tap the floating + button to add a task

### Creating Tasks

1. Click the **+ floating action button** (bottom-right on mobile, bottom-center on desktop)
2. Enter task details:
   - **Title** - Task name
   - **Description** - (Optional) Additional details
   - **Priority** - High (100px bubble), Medium (85px), or Low (70px)
   - **Deadline** - (Optional) Due date and time
   - **Recurring** - (Optional) Set recurrence pattern
3. Tap **Add Task** to create

### Interacting with Task Bubbles

- **Tap a bubble** - View full task details
- **In detail modal** - Mark complete, edit priority, view time remaining
- **Bubble size** - Larger = higher priority
- **Bubble color** - 
  - 🔴 Red: Overdue
  - 🟠 Orange: Urgent (< 24 hours)
  - 🟡 Yellow: Warning (< 3 days)
  - 🔵 Blue: Normal

### Using the Planner

1. Navigate to **Planner** tab
2. Switch between views:
   - **Timeline** - Chronological task view
   - **Priority** - Sorted by importance
   - **Statistics** - Completion analytics
3. Filter by date or status
4. View recurring tasks separately

### Focus Mode (Pomodoro)

1. Navigate to **Focus** tab
2. Set work duration (default: 25 minutes)
3. Start timer
4. Take breaks when prompted
5. Optional: Auto-start meditation during breaks

### Meditation & Mindfulness

1. Navigate to **Meditation** tab
2. Choose session type:
   - **Breathing Exercise** - Visual breathing guide
   - **Meditation** - Timed meditation session
   - **Visualization** - Guided underwater imagery
3. Select ambient sound (7 options)
4. Adjust volume
5. Start session

### AI Planning Assistant

1. On Dashboard, find the **AI Assistant** card
2. Click **Analyze Tasks**
3. Review AI suggestions:
   - Priority adjustments
   - Workload warnings
   - Optimization tips
4. Apply suggestions with one click

---

## 🏗️ Technical Architecture

### Tech Stack

**Frontend**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animations
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Recharts** - Data visualization

**Backend**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Edge Functions (Deno)
  - Real-time subscriptions
- **Hono** - Edge function web framework

**External APIs**
- **OpenWeather API** - Weather data

### Project Structure

```
aquarium-serenity/
├── components/           # React components
│   ├── ui/              # shadcn/ui components (40+)
│   ├── AIPlanningAssistant.tsx
│   ├── BubbleVisualization.tsx
│   ├── Dashboard.tsx
│   ├── EnhancedPlanner.tsx
│   ├── FocusMode.tsx
│   ├── MeditationModule.tsx
│   ├── Navigation.tsx
│   ├── TaskBubble.tsx
│   ├── TaskDetailModal.tsx
│   ├── WeatherDisplay.tsx
│   └── ... (25+ components)
├── contexts/            # React contexts
│   └── ThemeContext.tsx
├── types/               # TypeScript types
│   ├── Auth.ts
│   └── Task.ts
├── utils/               # Utility functions
│   ├── DataManager.ts   # Cloud data sync
│   ├── aiPlanning.ts    # AI logic
│   ├── ambientSounds.ts # Audio system
│   ├── bubbleLayout.ts  # Bubble positioning
│   ├── recurringTasks.ts
│   ├── urgencySystem.ts
│   ├── weatherService.ts
│   └── supabaseClient.ts
├── supabase/
│   └── functions/
│       └── server/       # Edge functions
│           ├── index.tsx # Hono server
│           └── kv_store.tsx
├── styles/
│   └── globals.css      # Global styles & design tokens
├── App.tsx              # Main app component
└── README.md
```

### Database Schema

**Tables:**
- `tasks` - User tasks with priorities, deadlines, recurrence
- `meditation_sessions` - Meditation history
- `user_settings` - User preferences
- `kv_store_238582d2` - Key-value storage for flexible data

### Key Features Implementation

**Bubble Layout Algorithm** (`utils/bubbleLayout.ts`)
- Responsive grid system
- Collision detection
- Mobile: 2-column layout
- Desktop: 5-column layout
- Priority-based sizing

**Urgency System** (`utils/urgencySystem.ts`)
- Real-time deadline calculation
- Visual urgency indicators
- Toast notifications
- 4-tier urgency levels

**Audio System** (`utils/ambientSounds.ts`)
- Web Audio API
- 7 procedurally generated soundscapes
- Seamless looping
- Volume control

**Recurring Tasks** (`utils/recurringTasks.ts`)
- Flexible recurrence patterns (daily, weekly, monthly)
- Next occurrence calculation
- Completion handling

---

## 🎨 Design System

### Color Palette

**Ocean Theme (Light Mode)**
- Primary: `#60A5FA` (Blue-400)
- Secondary: `#67E8F9` (Cyan-300)
- Background: Gradient from Blue-100 → Blue-200 → Blue-300
- Glassmorphism: `backdrop-blur-md` with white/20 borders

**Deep Ocean (Dark Mode)**
- Primary: `#1E3A8A` (Blue-900)
- Secondary: `#0E7490` (Cyan-700)
- Background: Dark gradient
- Enhanced contrast

### Typography

- **Headings:** Light to medium weight, generous spacing
- **Body:** System fonts for readability
- **Tokens:** Defined in `styles/globals.css`

### Components

- **Bubble UI:** Rounded, floating elements
- **Glass Cards:** Frosted glass effect (glassmorphism)
- **Smooth Animations:** Motion/React for fluid transitions
- **Responsive:** Mobile-first design

---

## 🔒 Security & Privacy

### Data Storage
- **Cloud-Only Mode** - All data stored in Supabase
- **User Authentication** - Secure email/password auth
- **Row-Level Security** - Database access controls
- **HTTPS Only** - Encrypted data transmission

### Privacy Controls
- Location data is optional
- Data deletion available in settings
- No third-party analytics
- Open source codebase

---

## 📱 Responsive Design

### Mobile (< 640px)
- 2-column bubble grid
- Bottom sheet modals
- Floating action button
- Touch-optimized interactions

### Tablet (640px - 1024px)
- Adaptive layouts
- Hybrid navigation

### Desktop (> 1024px)
- 5-column bubble grid
- Centered modals
- Full feature set
- Keyboard shortcuts ready

---

## 🐛 Troubleshooting

### "Database tables not found" Error
**Solution:** Run the database setup wizard from Settings or check Supabase dashboard for tables.

### Tasks not syncing
**Solution:** Check internet connection, verify Supabase credentials in console.

### Audio not playing
**Solution:** Check browser permissions, ensure volume is up, try different sound.

### Bubbles overlapping on mobile
**Solution:** Recent update fixed this - refresh app or clear cache.

### Weather not displaying
**Solution:** Grant location permission or manually set location in Settings.

---

## 🔄 Recent Updates

### Version 1.0.0 (November 2025)

**✅ Completed Features:**
- ✅ Task bubble mobile optimization (2-column grid)
- ✅ Fixed task detail modal z-index and responsiveness
- ✅ Minimalist icon-based bubble design
- ✅ Advanced audio system with 7 ambient sounds
- ✅ Complete urgency notification system
- ✅ AI Planning Assistant implementation
- ✅ Full Supabase cloud sync mode
- ✅ Comprehensive error handling
- ✅ Dark/light theme system
- ✅ Recurring tasks support

**🐛 Bug Fixes:**
- Fixed MeditationHub import error
- Fixed EnhancedPlanner missing React imports
- Fixed mobile bubble overlap issues
- Fixed modal positioning on small screens
- Fixed task bubble click-to-complete ambiguity

---

## 🤝 Contributing

While this is a personal project, suggestions and feedback are welcome! Please:
1. Check existing issues first
2. Provide clear reproduction steps for bugs
3. Suggest features with use cases

---

## 📄 License

This project is provided as-is for personal use. Please review the full license in the repository.

---

## 🙏 Acknowledgments

**Technologies:**
- [React](https://react.dev) - UI framework
- [Supabase](https://supabase.com) - Backend platform
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Motion](https://motion.dev) - Animations
- [Lucide](https://lucide.dev) - Icons
- [OpenWeather](https://openweathermap.org) - Weather data

**Design Inspiration:**
- Ocean ecosystems and marine life
- Mindfulness and zen philosophy
- Modern glassmorphism UI trends

---

## 📞 Support

For issues, questions, or feedback:
- 📧 Create an issue in the repository
- 📖 Check the troubleshooting section above
- 🔍 Review the code - it's well-commented!

---

## 🌟 Star History

If you find this project useful or interesting, please consider giving it a star! ⭐

---

<div align="center">

**Built with 🌊 and ❤️**

*Dive into productivity, emerge with peace*

</div>
