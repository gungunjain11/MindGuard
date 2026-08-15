# MindGuard

MindGuard is a student wellness and burnout-prevention platform built with Next.js, Firebase, and a Retrieval-Augmented Generation (RAG) architecture. When students record journal entries and daily check-ins, the system retrieves historically relevant entries to contextualize emotional trends, detect recurring stressors, and generate structured interventions.

---

## 🚀 Key Technical Components

* **RAG-Driven Contextual Analysis:** Past journal entries are embedded into dense vector space (`gemini-embedding-2`), enabling cosine similarity retrieval over historical entries. Retrieved context is injected into structured LLM prompts (`gemini-2.5-flash`) to detect recurring patterns across time.
* **Multimodal Wellness Scoring:** Combines quantitative self-report metrics (sleep duration, study hours, social rating) with NLP-extracted urgency signals into a unified burnout risk index.
* **Constrained Structured Output:** Uses strict JSON schema enforcement with Gemini 2.5 Flash to deterministically extract emotions, stressors, and actionable wellness recommendations.
* **Full-Stack Serverless Architecture:** Built with Next.js 15 App Router, React 19, TypeScript, and Firebase Firestore with user-scoped security rules.

---

## 📊 Retrieval Evaluation (Controlled Benchmark)

To empirically evaluate the core retrieval mechanism, we implemented an offline controlled benchmark comparing sparse lexical retrieval (**TF-IDF**) against dense semantic retrieval (**`all-MiniLM-L6-v2`**) across 48 synthetic journal entries spanning 8 semantic themes under a leave-one-out protocol.

### Headline Results

| Evaluation Stratum | TF-IDF Baseline | Dense Semantic | Absolute Gain |
|---|---|---|---|
| **Overall Benchmark (N=48)** | P@3 = 0.2778 | **P@3 = 0.6528** | **+0.3750** |
| **Low Lexical Overlap / Paraphrase (N=16)** | P@3 = 0.1458 | **P@3 = 0.6042** | **+0.4583** |
| **High Lexical Overlap (N=16)** | P@3 = 0.4792 | **P@3 = 0.7500** | **+0.2708** |

* **Key Takeaway:** When semantically related entries use distinct vocabulary (e.g., describing exhaustion without canonical keywords like *"exam"* or *"studying"*), dense semantic retrieval maintains substantially higher retrieval precision (+0.4583 absolute P@3 gain over TF-IDF).
* **Benchmark Disclaimer:** This benchmark uses controlled synthetic data designed to test retrieval robustness under vocabulary variation. The results demonstrate retrieval mechanics under benchmark conditions and should not be interpreted as clinical validation or proof of universal superiority across arbitrary real-world distributions.

👉 **Full benchmark methodology, dataset, and error analysis:** [experiment/benchmark/README.md](experiment/benchmark/README.md)

---

## 🛠 Tech Stack

* **Frontend & Framework:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Custom Vanilla CSS Modules
* **Backend Infrastructure:** Next.js Serverless API Routes / Firebase Cloud Functions
* **Database & Auth:** Firebase Firestore (NoSQL), Firebase Authentication
* **Vector & NLP Models:** Google Gemini (`gemini-2.5-flash`, `gemini-embedding-2`), Sentence-Transformers (`all-MiniLM-L6-v2` for offline benchmark)

---

## 🏗 System Architecture

1. **Telemetry & Text Input:** The frontend streams daily check-in metrics and journal text to serverless API routes.
2. **Vector Embedding:** Unstructured journal text is embedded into dense representation vectors.
3. **Historical Retrieval (RAG):** Cosine similarity search scans the authenticated user's isolated Firestore vector store for top-$K$ relevant past entries.
4. **Structured Inference:** Retrieved historical context and current text are processed via Gemini 2.5 Flash with strict JSON schema constraints.
5. **Score Merging & Persistence:** Extracted emotional signals and quantitative check-in metrics are merged into rolling burnout risk scores and stored in Firestore.

---

## 💻 Local Development

### Prerequisites
* Node.js (v18+)
* Python 3.10+ (for evaluation benchmark)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/gungunjain11/MindGuard.git
   cd mindguard
   ```

2. **Web Application Setup**
   ```bash
   cd mindguard-ai
   npm install
   # Configure .env.local with FIREBASE_* and GEMINI_API_KEY
   npm run dev
   ```

3. **Running the Retrieval Benchmark**
   ```bash
   cd experiment/benchmark
   pip install -r ../requirements.txt
   python scripts/run_benchmark.py
   python scripts/visualize_benchmark.py
   ```

---

## 🛡 Security & Privacy

User data isolation is enforced at the database layer via Firestore Security Rules, ensuring associated embeddings and journal text are bound strictly to the authenticated user's session. Service account keys, local secrets, and raw evaluation corpora are strictly excluded from version control.
