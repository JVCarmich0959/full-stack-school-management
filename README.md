# SchoolLinq: Full Stack School Management System




## 🚀 Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Coolify](https://img.shields.io/badge/Coolify-4A90E2?style=for-the-badge&logo=coolify&logoColor=white)


## 🌟 Features

- Multi-role dashboard (Admin, Teacher, Student, Parent)
- Responsive design
- Authentication with Clerk
- Dynamic forms
- Animated charts
- Comprehensive school management tools

## 🛠 Todo List

### Development Tasks
- [x] Complete all form implementations
- [x] Add comprehensive form validations
- [x] Implement role-based access control
- [x] Create detailed documentation for each component

### Testing Checklist
- [x] Unit tests for React components
- [x] Integration tests for forms
- [x] End-to-end tests for critical user flows
- [x] Performance testing
- [ ] Accessibility testing

### Features to Implement
- [ ] Real-time notifications
- [x] Advanced search and filter functionality
- [ ] Export/Import data features
- [ ] Advanced reporting system

### Performance **Optimisation**
- [ ] Implement code splitting
- [ ] Optimise database queries
- [ ] Add caching mechanisms
- [x] Improve server-side rendering performance

### Security Enhancements
- [x] Implement advanced authentication checks
- [x] Add rate limiting
- [x] Enhance input sanitisation
- [x] Implement comprehensive error handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- Docker
- PostgreSQL

### Installation

1. Clone the repository

```bash
git clone https://github.com/pakagronglb/full-stack-school-management.git
cd full-stack-school-management
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables (PostgreSQL is the canonical database)

```bash
cp .env.example .env
# Update DATABASE_URL if needed, e.g. postgresql://postgres:postgres@localhost:5432/school_db?schema=public
```

4. Run Prisma migrations and seed data

```bash
npx prisma migrate dev --name init_postgres
npx prisma db seed
```

5. Run the development server

```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before getting started.

## 📄 License

This project is open-source and available under the MIT License.




**Created by**: Pakagrong Lebel
**GitHub**: [@pakagronglb](https://github.com/pakagronglb)
**Contact**: pakagronglebel@gmail.com 
