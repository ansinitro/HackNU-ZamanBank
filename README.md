# 🏦 HackNU-ZamanBank: AI Financial Assistant

Welcome to the **Zaman Bank AI Assistant** project, developed for HackNU. This project features a comprehensive financial assistant powered by AI, designed to help users set financial goals, track their savings, and receive personalized banking product recommendations (including Islamic finance options like Murabaha and Ijara).

## 🌟 Key Features

- **🧠 Multi-Stage AI Chat Assistant**: An intelligent advisor that guides users through:
  - *Discovery*: Understanding the user's financial desires (e.g., buying a car, saving for Hajj).
  - *Clarification*: Calculating costs, current savings, and timelines.
  - *Recommendation*: Suggesting relevant bank products (deposits, financing, halal programs).
  - *Confirmation & Action*: Finalizing goals and providing actionable links.
- **🎙️ Speech-to-Text Integration**: Support for voice messages using the Whisper API.
- **🎯 Financial Goal Management**: Track progress towards goals like apartments, education, or travel, including automated monthly saving calculations.
- **💳 Banking Product Integration**: Recommends real Zaman Bank products to help users achieve their goals faster.
- **📊 Transaction Tracking**: Keep a record of deposits, withdrawals, and transfers to monitor financial health.

## 🏗️ Architecture

The project is structured into two main parts:

### 1. Backend (FastAPI + PostgreSQL)
A robust and asynchronous Python backend built with FastAPI.
- **API Framework**: FastAPI
- **Database**: PostgreSQL (managed via docker-compose) with SQLAlchemy & Alembic for ORM and migrations.
- **AI Integration**: LiteLLM and OpenAI (`gpt-4o-mini`) for the conversational assistant, Whisper for audio transcription.
- **Authentication**: JWT-based authentication using `python-jose` and `passlib`.
- **Data Processing**: Pandas, NumPy, Scikit-learn for potential analytical features.

### 2. Frontend (Next.js + React)
A modern, responsive, and interactive user interface.
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 for utility-first styling.
- **Animations**: Framer Motion for smooth, engaging UI transitions.
- **Data Visualization**: Recharts for rendering beautiful financial charts and goal progress.
- **Icons & Typography**: Lucide React and Geist font family.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Python 3.9+
- Docker & Docker Compose
- API Keys for OpenAI/LiteLLM

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the PostgreSQL database using Docker:
   ```bash
   docker-compose up -d
   ```
5. Set up your environment variables (e.g., `X_LITELLM_API_KEY`) in `backend/app_config.py` or an `.env` file.
6. Run the FastAPI server:
   ```bash
   python main.py
   # Or using uvicorn: uvicorn main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or yarn / pnpm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

## 📁 Repository Structure

```text
HackNU-ZamanBank/
├── backend/
│   ├── main.py            # FastAPI application entry point & AI logic
│   ├── models.py          # SQLAlchemy database models
│   ├── database.py        # Database connection setup
│   ├── docker-compose.yml # PostgreSQL database container configuration
│   ├── requirements.txt   # Python dependencies
│   ├── routes/            # API endpoints (auth, users, chats, routing)
│   ├── schemas/           # Pydantic validation schemas
│   └── services/          # Business logic and external service integrations
├── frontend/
│   ├── src/               # Next.js application source code
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies and scripts
│   ├── tailwind.config.ts # Tailwind CSS configuration
│   └── next.config.ts     # Next.js configuration
└── README.md              # Project documentation
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---
*Built with ❤️ for HackNU.*
