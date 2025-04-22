# Next.js Dashboard with Authentication

This is a Next.js dashboard application with Supabase authentication.

## Features

- Next.js 13+ with App Router
- Supabase Authentication
- Tailwind CSS for styling
- TypeScript support

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nextjs-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Authentication

The application uses Supabase for authentication. Features include:

- Email/Password login
- Protected routes
- Session management
- User profile management

## Project Structure

```
nextjs-dashboard/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── auth/
│       └── AuthButton.tsx
├── lib/
│   └── supabase/
│       └── client.ts
└── types/
    └── database.types.ts
```

## Dependencies

- next: ^14.0.0
- react: ^18.2.0
- react-dom: ^18.2.0
- @supabase/auth-helpers-nextjs: ^0.8.7
- @supabase/supabase-js: ^2.39.0
- tailwindcss: ^3.3.0
- typescript: ^5.0.0

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
