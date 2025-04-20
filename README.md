# LearnAlytix - Your Personal Learning Companion

![LearnAlytix Logo](public/logo.png)

LearnAlytix is a modern web application designed to enhance your learning experience through interactive flashcards and spaced repetition. Built with Next.js 14, Supabase, and Tailwind CSS, it provides a seamless and efficient way to create, manage, and review your study materials.

## 🌟 Features

- **User Authentication**
  - Secure login and signup with Supabase Auth
  - Protected routes and session management
  - Persistent user sessions

- **Flashcard Management**
  - Create, edit, and delete flashcards
  - Organize cards by categories
  - Set difficulty levels (easy, medium, hard)
  - Track review history

- **Spaced Repetition System**
  - Intelligent scheduling of card reviews
  - Adaptive learning based on performance
  - Progress tracking and statistics

- **Modern UI/UX**
  - Responsive design for all devices
  - Intuitive navigation
  - Beautiful animations and transitions
  - Dark mode support (coming soon)

## 🚀 Tech Stack

- **Frontend**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Heroicons
  - React Hook Form

- **Backend & Database**
  - Supabase
    - Authentication
    - PostgreSQL Database
    - Real-time Subscriptions
    - Row Level Security

- **Development Tools**
  - ESLint
  - Prettier
  - TypeScript
  - Git

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or later)
- npm or yarn
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/learnalytix.git
   cd learnalytix
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the following SQL in your Supabase SQL editor:
   ```sql
   -- Create flashcards table
   CREATE TABLE flashcards (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       front TEXT NOT NULL,
       back TEXT NOT NULL,
       category TEXT,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
       last_reviewed TIMESTAMP WITH TIME ZONE,
       next_review TIMESTAMP WITH TIME ZONE
   );

   -- Enable Row Level Security
   ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view their own flashcards"
   ON flashcards FOR SELECT
   USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own flashcards"
   ON flashcards FOR INSERT
   WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own flashcards"
   ON flashcards FOR UPDATE
   USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own flashcards"
   ON flashcards FOR DELETE
   USING (auth.uid() = user_id);
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📁 Project Structure

```
learnalytix/
├── app/
│   ├── components/         # Reusable components
│   ├── services/          # API and service functions
│   ├── types/             # TypeScript type definitions
│   ├── (auth)/            # Authentication related pages
│   ├── flashcards/        # Flashcard related pages
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── public/                # Static assets
├── styles/                # Global styles
└── package.json           # Project dependencies
```

## 🔐 Authentication Flow

1. User visits the login page
2. Enters credentials or signs up
3. Supabase Auth handles authentication
4. Session is stored and managed
5. Protected routes are accessible
6. User can logout, ending the session

## 📝 Flashcard System

### Creating Flashcards
- Users can create new flashcards with:
  - Front (question)
  - Back (answer)
  - Category
  - Difficulty level

### Review System
- Cards are scheduled based on:
  - User's performance
  - Difficulty level
  - Last review date
- Spaced repetition algorithm determines next review date

## 🎨 UI Components

### Navigation
- Responsive navbar
- Dynamic menu based on auth state
- Active route highlighting

### Cards
- Flip animation
- Difficulty indicators
- Review status display

## 🧪 Testing

```bash
# Run tests
npm run test
# or
yarn test
```

## 📈 Performance Optimization

- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

## 🔄 Deployment

1. Build the application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the utility-first CSS framework
- All contributors and users of LearnAlytix

## 📞 Support

For support, email support@learnalytix.com or join our Slack channel.

## 📱 Social Media

- Twitter: [@LearnAlytix](https://twitter.com/learnalytix)
- LinkedIn: [LearnAlytix](https://linkedin.com/company/learnalytix)
- GitHub: [LearnAlytix](https://github.com/yourusername/learnalytix)
