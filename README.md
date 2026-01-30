<div align="center">

# Retenio

[![Live Demo](https://img.shields.io/badge/Live%20Demo-retenio.ai-36BCF7?style=for-the-badge&logo=vercel&logoColor=white)](https://retenio.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**An AI-powered learning platform that transforms passive YouTube watching into active learning through intelligent summaries, auto-generated quizzes, and scientifically-proven spaced repetition.**

[Live Demo](https://retenio.ai) | [Tech Stack](#tech-stack) | [Features](#features) | [Architecture](#architecture)

</div>

---

## Tech Stack

<div align="center">

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend & Database

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Upstash](https://img.shields.io/badge/Upstash%20Redis-00E9A3?style=for-the-badge&logo=redis&logoColor=white)
![REST API](https://img.shields.io/badge/REST%20API-009688?style=for-the-badge&logoColor=white)

### AI & ML

![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white)
![RAG](https://img.shields.io/badge/RAG-FF6F00?style=for-the-badge&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logoColor=white)
![Vector Embeddings](https://img.shields.io/badge/Vector%20Embeddings-00ADD8?style=for-the-badge&logoColor=white)

### Chrome Extension

![WXT](https://img.shields.io/badge/WXT-FF4154?style=for-the-badge&logo=google-chrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest%20V3-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)

### DevOps

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## Features

- **Chrome Extension** - Seamlessly captures YouTube videos as you browse
- **AI Summaries** - LangChain-powered comprehensive video summaries
- **Smart Quizzes** - Auto-generated multiple choice questions with source timestamps
- **Spaced Repetition** - 5-box Leitner system schedules reviews for optimal retention
- **Semantic Search** - Vector embeddings link quiz questions to exact video moments
- **Progress Tracking** - Dashboard shows mastery levels across all topics

---

## Architecture

This project implements **Clean Architecture** with clear separation between domain logic, use cases, and infrastructure:

```mermaid
graph TB
    subgraph "Chrome Extension"
        EXT[WXT Extension] --> |Process Video| API
    end

    subgraph "Next.js API Layer"
        API[API Routes] --> UC[Use Cases]
    end

    subgraph "Clean Architecture"
        UC --> |Orchestrates| DOMAIN[Domain Entities]
        UC --> |Uses| REPO[Repository Interfaces]
        UC --> |Uses| SVC[Service Interfaces]
    end

    subgraph "Infrastructure"
        REPO --> DRIZZLE[Drizzle ORM]
        SVC --> LANGCHAIN[LangChain Services]
        SVC --> EMBED[Embedding Service]
        DRIZZLE --> PG[(PostgreSQL + Vectors)]
        LANGCHAIN --> OPENAI[OpenAI API]
        EMBED --> SUPABASE[Supabase Edge Functions]
    end
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Clean Architecture** | Decouples business logic from frameworks, making code testable and maintainable |
| **Dependency Injection** | All dependencies are injected, enabling easy testing and flexibility |
| **Interface-Based Design** | Program to abstractions - infrastructure can be swapped without changing business logic |
| **Hybrid RESTful/RPC API** | Action-based endpoints for operations, resource-based for CRUD - pragmatic over dogmatic |
| **Use Case Pattern** | Each operation is a single-purpose class with explicit dependencies |
| **JSend Response Format** | Standardized API responses (success/fail/error) for consistent client handling |
| **Cookie-Based Sessions** | Secure session management via Supabase Auth - automatic CSRF protection, no token storage |

---

<div align="center">

**Built with passion for learning**

[![GitHub](https://img.shields.io/badge/GitHub-hhubert14-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hhubert14)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-huberthuang1-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/huberthuang1/)
[![Portfolio](https://img.shields.io/badge/Portfolio-huberthuang.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://huberthuang.vercel.app/)

</div>
