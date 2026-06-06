# MindGuard

MindGuard is a robust, highly-scalable software system designed to track and prevent burnout through complex behavioral analysis and state-of-the-art semantic search. While the application leverages modern language models for NLP, the core value lies in its sophisticated software architecture, custom data pipelines, and intelligent retrieval systems engineered from the ground up to ensure privacy, performance, and context-awareness.

## 🚀 Technical Highlights

* **Custom Retrieval-Augmented Generation (RAG) Engine:** Implements a proprietary vector-based semantic search architecture. Journal entries are dynamically embedded into high-dimensional space (`gemini-embedding-2`), enabling cosine similarity algorithms to scan historical datasets in real-time. This allows the system to detect long-term emotional patterns and recurrences that simple keyword tracking misses.
* **Complex Data Aggregation & Scoring Models:** A robust background analytics engine that calculates rolling burnout risk scores across multiple wellness dimensions (sleep, study hours, social isolation). The data pipeline aggregates high-frequency health metrics and normalizes them into precise risk coefficients.
* **Advanced NLP Pipeline:** Unstructured text is piped through highly constrained execution environments (`gemini-2.5-flash`), strictly enforcing JSON schema adherence for deterministic extraction of stressors, emotional states, and risk categorization.
* **Serverless Monorepo Architecture:** Built for maximum scalability and developer velocity. Features a highly optimized frontend paired with edge-ready serverless API routes, ensuring zero cold-start latency and seamless CI/CD integration.

## 🛠 Tech Stack

* **Frontend & Framework:** Next.js 15 (App Router), React 19, TypeScript
* **Styling & Design System:** Custom Vanilla CSS Modules (Zero-dependency, high-performance UI)
* **Backend Infrastructure:** Vercel Serverless API Routes, Node.js
* **Database & Auth:** Firebase Firestore (NoSQL), Firebase Authentication
* **Vector & NLP Models:** Google Gemini (`gemini-2.5-flash`, `gemini-embedding-2`)

## 🏗 System Architecture

1. **Client-Side Event Streaming:** The React frontend securely streams user telemetry and journal text to the serverless backend.
2. **Asynchronous Vectorization:** Unstructured text is asynchronously converted into a mathematical vector representation.
3. **High-Performance Semantic Retrieval:** The backend performs cosine similarity computations against the user's secure, isolated vector space in Firestore to retrieve relevant historical context.
4. **Deterministic Generation:** The retrieved vectors and current state are injected into an isolated NLP execution environment. Strict schema typing ensures the model's output is predictable, structured, and ready for database insertion.
5. **Real-time Syncing:** Extracted data and calculated intervention nodes are committed to the NoSQL database and instantly propagated back to the client UI.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindguard.git
   cd mindguard
   ```

2. **Install Dependencies**
   ```bash
   cd mindguard-ai
   npm install
   ```

3. **Environment Configuration**
   - In `mindguard-ai/`, create a `.env.local` file with your Firebase configuration, `GOOGLE_APPLICATION_CREDENTIALS`, and `GEMINI_API_KEY`.

4. **Run the Application**
   ```bash
   cd mindguard-ai
   npm run dev
   ```

## 🛡 Security & Compliance
Data isolation is paramount. MindGuard enforces strict multi-tenant data boundaries at the database layer via advanced Firestore Security Rules. Mathematical embeddings and textual data are strictly bound to the authenticated user's session context, preventing unauthorized horizontal access.
