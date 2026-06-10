# CBT Portal —  Recruitment Assessment

A full-stack Computer-Based Test (CBT) portal built for company recruitment assessments. Candidates register, sit a timed examination across multiple sections, and receive automated results via email. Admins can view all results through a dedicated dashboard.

---

## Tech Stack

- **Next.js 15** — App Router, Server Components, Server Actions
- **Supabase** — PostgreSQL database, Row Level Security
- **Tailwind CSS** — Styling
- **Resend** — Transactional email (results notification)
- **Zod** — Server-side form validation
- **TypeScript** — Type safety throughout

---

## Features

- Candidate self-registration with category selection
- Category A (B.Sc / HND) and Category B (OND / NCE / SSCE)
- Timed CBT examination (20 minutes per sitting)
- Numerical and Verbal reasoning sections
- Auto-scoring on submission
- Server-side timer — crash-safe with resume support
- Result storage in PostgreSQL
- Email notification to candidate and admin on completion
- Admin dashboard for viewing all candidate results

---

## Database Schema

Seven tables covering the full exam lifecycle:

- **categories** — Category A and Category B tracks
- **exams** — exam blueprints per category
- **sections** — Numerical and Verbal sections per exam
- **questions** — individual questions per section
- **candidates** — registered candidate profiles
- **attempts** — exam sittings with timer and score
- **answers** — per-question responses with auto-marked correctness

---

## Project Structure
cbt-portal/
├── app/
│   ├── (auth)/register/        ← candidate registration
│   ├── (exam)/instructions/    ← pre-exam instructions
│   ├── (exam)/test/            ← live exam interface
│   ├── results/                ← candidate result page
│   ├── admin/                  ← admin dashboard
│   └── page.tsx                ← landing page
├── actions/                    ← Next.js Server Actions
├── components/                 ← reusable UI and exam components
├── lib/
│   ├── supabase/               ← browser, server, and admin clients
│   └── validations/            ← Zod schemas
└── types/                      ← shared TypeScript types
---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Resend account (for email notifications)

### Installation

```bash
git clone https://github.com/your-username/cbt-portal.git
cd cbt-portal
npm install
```

### Environment Variables

Create a `.env.local` file at the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_admin_email
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Development Roadmap

- [x] Database schema design
- [x] Project structure and Supabase setup
- [x] Candidate registration
- [ ] Instructions page
- [ ] Live exam interface with timer
- [ ] Auto-scoring on submission
- [ ] Result page
- [ ] Email notifications via Resend
- [ ] Admin dashboard

---

## License

MIT