# 🧠 Saesha — ADHD-Friendly Math Microlearning

**Saesha** is a vibrant, calming math learning platform designed specifically for **Class 9–10 students with ADHD and special learning needs**. It breaks down complex math topics into bite-sized, game-based sessions (3–10 minutes) that keep learners engaged without overwhelm.

---

## ✨ Key Features

### 🎮 Interactive Math Games
- **16+ unique games** across 5 chapters: Trigonometry, Algebra, Volume & Surface Area, Probability, and Fractions/Decimals/Percentages
- Each game features a **3D visual scene** built with Three.js for immersive learning
- **Step-by-step guided helpers** walk students through problem-solving
- Adaptive difficulty that adjusts to the learner's pace

### 🏆 Rewards & Badges
- **17 unlockable badges** across categories: games, stars, accuracy, chapters, streaks, and special achievements
- Real-time badge notifications with celebratory animations
- Achievement dashboard to track progress

### 🎨 ADHD-Optimized Design
- **Bright, warm color palette** (reds, yellows, oranges) proven to engage children with special needs
- **6 theme options**: Sunny Warm, Tropical Blue, Spring Green, Sunset Blaze, Berry Bright, Candy Pop
- Dark mode support
- Gentle animations with adjustable intensity
- Dyslexia-friendly font option
- Adjustable font sizes

### 📊 Adaptive Learning Engine
- Tracks accuracy, response time, and hint usage
- Automatically adjusts difficulty level per subject
- Streak tracking to encourage daily practice
- Detailed performance analytics per chapter

### ♿ Accessibility
- Reduced motion mode
- High-contrast warm colors
- Screen-reader friendly semantic HTML
- Keyboard navigation support

---

## 📚 Curriculum Coverage

| Chapter | Topics | Games |
|---------|--------|-------|
| **Trigonometry** | Sin, Cos, Tan, Angles, Shadows | Lighthouse Shadow, Angle Explorer |
| **Algebra** | Equations, Patterns, Balancing | Equation Factory, Balance Garden, Pattern Portal |
| **Volume & Surface Area** | 3D Shapes, Composites, Wrapping | Build City, Shape Fill, Wrap Gift, Liquid Lab |
| **Probability** | Chance, Spinners, Prediction | Chance Garden, Spinner Dice Lab, Prediction Park |
| **Fractions/Decimals/%** | Sharing, Money, Percentages | Share Slice, Money Garden, Wave Lab |

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling with semantic design tokens |
| **shadcn/ui** | Accessible UI components |
| **Three.js / R3F** | 3D game scenes |
| **Framer Motion** | Smooth animations |
| **Zustand** | State management |
| **Lovable Cloud** | Backend (auth, database, edge functions) |
| **React Router** | Navigation |
| **Recharts** | Data visualization |
| **KaTeX** | Math rendering |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd saesha

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── 3d/              # Three.js 3D visual scenes
│   ├── games/           # Game scene components & step helpers
│   ├── animations/      # Animated & interactive elements
│   └── ui/              # Reusable UI components (shadcn)
├── contexts/            # Theme context provider
├── data/                # Curriculum & quiz data
├── hooks/               # Custom hooks (auth, rewards, sound, stats)
├── pages/               # Route pages (games, dashboard, settings)
├── store/               # Zustand state management
└── integrations/        # Backend client configuration
```

---

## 🎯 How It Works

1. **Onboarding** — Student selects grade (9 or 10), favorite chapters, and accessibility preferences
2. **Dashboard** — Personalized hub showing progress, streaks, stars, and recommended games
3. **Chapter Select** — Browse games organized by math chapter
4. **Game Play** — Interactive 3D scene + guided quiz with instant feedback and hints
5. **Rewards** — Badges unlock automatically based on performance milestones
6. **Settings** — Customize theme, font size, animations, and accessibility options

---

## 👩‍💻 Built With ❤️

Designed with care for focused, joyful learning — because every child deserves a math experience that works with their brain, not against it.

---

## 📄 License

This project is proprietary. All rights reserved.
