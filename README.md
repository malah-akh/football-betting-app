# ⚽ Football Betting App

A modern, mobile-first football betting matches application featuring Champions League picks, premium predictions, and interactive betting controls. Built with React, TypeScript, and Tailwind CSS.

![Football Betting App](https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop)

## ✨ Features

### Core Functionality
- 🎯 **Single Picks** - Individual match predictions with detailed analysis
- 🔄 **Combined Picks** - Multiple matches bundled together
- 📊 **System Picks (Multiples)** - Advanced betting combinations
- ⭐ **Favorites** - Save and track your favorite matches
- 📈 **Results Tracking** - View historical match results
- 👤 **User Profile** - Manage your betting profile and settings

### Match Features
- 🏟️ **Detailed Match Cards** - Team info, location, time, and odds
- 💰 **Potential Return Calculator** - Calculate potential winnings
- 📅 **Date Filtering** - Browse matches by date
- 🔒 **Premium Locked Picks** - Exclusive predictions for premium users
- ⚡ **Interactive Betting Controls** - Adjust stake amounts and odds
- 📱 **Match Detail Views** - Deep dive into match statistics

### Premium Features
- 👑 **Premium Subscription Modal** - Two pricing tiers (Monthly/Annual)
- 🎁 **7-Day Free Trial** - Try premium before committing
- 🔓 **Premium Picks** - Access exclusive high-accuracy predictions
- 💼 **Bankroll Management** - Track and manage your betting balance (€1250.00)
- 📊 **Advanced Analytics** - In-depth match analysis and insights

### User Experience
- 📱 **Mobile-First Design** - Optimized for mobile devices (max-width: 440px)
- 🎨 **Beautiful UI** - Clean design matching Figma specifications
- 🚀 **Smooth Animations** - Polished transitions and interactions
- 🧭 **Bottom Navigation** - Easy access to Home, Favorites, Matches, Results, Profile
- 🔄 **Tab Navigation** - Switch between Single, Combined, and Multiples
- ✏️ **Pick Management** - Edit and delete picks with modals

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7 (Data Mode)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## 📁 Project Structure

```
/src
  /app
    /components          # Reusable UI components
      - Header.tsx
      - TabBar.tsx
      - DateSelector.tsx
      - MatchCard.tsx
      - PremiumCard.tsx
      - UnlockPremiumCard.tsx
      - PremiumModal.tsx
      - BottomNav.tsx
      - EditPickModal.tsx
      - DeletePickModal.tsx
    /screens            # Page components
      - HomeScreen.tsx
      - PicksListScreen.tsx
      - MatchDetailScreen.tsx
      - MultipleDetailsScreen.tsx
      - CombinedListScreen.tsx
      - CombinedDetailsScreen.tsx
      - FavoritesScreen.tsx
      - ResultsScreen.tsx
      - ProfileScreen.tsx
    - App.tsx           # Main app component
    - routes.ts         # React Router configuration
  /imports              # Figma imported assets
  /styles               # Global styles and themes
    - fonts.css
    - theme.css
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/football-betting-app.git
cd football-betting-app
```

2. **Install dependencies**
```bash
pnpm install
# or
npm install
```

3. **Start development server**
```bash
pnpm dev
# or
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Build for Production

```bash
pnpm build
# or
npm run build
```

The built files will be in the `/dist` directory.

## 🎨 Design System

### Color Palette
- **Primary**: `#3e4855` (Dark Blue Gray)
- **Background**: `#dae1e9` (Light Blue Gray)
- **Secondary**: `#a5b1bf` (Medium Gray)
- **Text Muted**: `#8b99ac`
- **Accent**: `#bcc2c9`

### Typography
- **Font Family**: Inter (Bold, Semi Bold, Regular, Medium)
- **Headings**: 26px, 24px, 18px
- **Body**: 14px, 12px, 11px, 10px

### Components
- **Border Radius**: 20px (cards), 12px (buttons), 8px (inputs)
- **Shadows**: `0px 13px 36px 0px rgba(80,82,113,0.2)`
- **Max Width**: 440px (mobile-optimized)

## 📱 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomeScreen | Main landing page with single picks |
| `/picks` | PicksListScreen | List of all picks |
| `/match/:id` | MatchDetailScreen | Detailed match view with betting controls |
| `/multiples` | MultipleDetailsScreen | System picks overview |
| `/combined` | CombinedListScreen | Combined picks list |
| `/combined-details` | CombinedDetailsScreen | Combined picks details |
| `/favorites` | FavoritesScreen | Saved favorite matches |
| `/results` | ResultsScreen | Historical match results |
| `/profile` | ProfileScreen | User profile and settings |

## 🔑 Key Components

### Header
- Displays user balance (€1250.00)
- Menu icon for navigation
- Money icon indicator

### TabBar
- Interactive tabs for Single, Combined, Multiples
- Active tab indicator
- Smooth navigation between views

### MatchCard
- Team logos and names
- Match location and time
- Potential return display
- Lock icon for premium picks
- Favorite toggle

### PremiumModal
- Subscription plans (Monthly €9.99, Annual €7.99)
- 7-day free trial offer
- Benefits list with 6 key features
- 97% user satisfaction statistic

### BottomNav
- 5 navigation items: Home, Favorites, Matches, Results, Profile
- Active state indicators
- Fixed positioning

## ⚠️ Disclaimer

This application is for **demonstration and personal tracking purposes only**. It does not:
- Place real bets
- Handle real money transactions
- Operate with any betting operators
- Collect personal or sensitive information

All betting decisions are made by users at their own risk.

## 📄 License

MIT License - feel free to use this project for learning and development purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or feedback, please open an issue in this repository.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
