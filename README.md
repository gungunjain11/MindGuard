# MindGuard AI 🧠✨

MindGuard AI is a sophisticated, AI-powered mental wellness and burnout prevention platform designed specifically for students and high-stress individuals. It goes beyond simple habit tracking by utilizing advanced Natural Language Processing (NLP) and a custom Retrieval-Augmented Generation (RAG) architecture to provide real-time, context-aware psychological interventions.

## 🚀 Key Features

* **Context-Aware Journaling (RAG):** MindGuard doesn't just read your current journal entry; it remembers how you felt weeks ago. It uses advanced embedding models (`text-embedding-004`) to convert journal text into high-dimensional vectors, performing semantic cosine similarity searches across historical data to identify recurring stress triggers.
* **Intelligent NLP Pipeline:** Leverages Google's Gemini LLMs (`gemini-1.5-flash`) to parse unstructured journal text into actionable, structured datasets. The AI extracts dominant emotions, specific stressors, and calculates urgency risk levels without manual user input.
* **Data-Driven Burnout Tracking:** Aggregates daily health metrics (sleep duration, study hours, mood, social interaction) to calculate rolling burnout risk scores and visualize wellness trends over time.
* **Automated Weekly Reviews:** A background analytics engine synthesizes a week's worth of behavioral data to generate personalized, empathetic recommendations for the upcoming week.
* **Modern Monorepo Architecture:** A seamless integration of a lightning-fast frontend with a highly scalable, serverless AI backend.

## 🛠 Tech Stack

* **Frontend:** Next.js (React), TypeScript, CSS Modules
* **Backend:** Node.js, Firebase Cloud Functions
* **Database & Auth:** Firebase Firestore (NoSQL), Firebase Authentication
* **AI & Machine Learning:** Google Generative AI SDK, Vector Embeddings, Custom RAG Pipeline

## 🏗 System Architecture

1. **User Input:** The Next.js frontend securely passes journal entries to the serverless backend via Firebase `httpsCallable` functions, ensuring automated authentication context.
2. **Vectorization:** The text is embedded into a mathematical vector representation.
3. **Semantic Retrieval:** The backend performs mathematical similarity comparisons against the user's secure Firestore database to pull relevant historical entries.
4. **Prompt Engineering & Generation:** The historical context and current entry are injected into a highly constrained LLM prompt, forcing the AI to output a structured JSON response containing targeted interventions.
5. **Delivery:** The structured data is saved to Firestore and instantly synced to the user's dashboard for review.

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
   Navigate to both the frontend and backend directories to install packages:
   ```bash
   # Install frontend dependencies
   cd mindguard-ai
   npm install

   # Install backend dependencies
   cd ../functions
   npm install
   ```

3. **Environment Configuration**
   - In `mindguard-ai/`, create a `.env.local` file with your Firebase Client configuration.
   - In `functions/`, create a `.env` file and add your Gemini API Key: `GEMINI_API_KEY=your_key_here`

4. **Run the Application**
   Run the Next.js frontend:
   ```bash
   cd mindguard-ai
   npm run dev
   ```
   Run the Firebase backend emulators (in a separate terminal):
   ```bash
   firebase emulators:start
   ```

## 🛡 Privacy & Security
User data, especially journal entries, is highly sensitive. MindGuard utilizes Firebase Authentication for strict access control and Firestore Security Rules to ensure users can only access their own vectorized data.
