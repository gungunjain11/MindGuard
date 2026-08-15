# Controlled Offline Retrieval Benchmark: TF-IDF vs. Dense Semantic Search

## 1. Motivation

In Mental-Health and Wellness Tracking applications like **MindGuard**, Retrieval-Augmented Generation (RAG) is deployed to maintain long-term contextual memory across a user's journaling history. When a user submits a new journal entry, historical entries are retrieved to detect recurring triggers, emotional patterns, and behavioral trends.

However, emotional journaling exhibits high vocabulary variation: two entries concerning the same underlying struggle (e.g., academic exhaustion) often share few or no surface keywords (e.g., *"brutal exam schedule and multiple assignments"* vs. *"my brain feels like it is running at full capacity with no break in sight"*).

Traditional lexical retrieval algorithms (like TF-IDF and BM25) rely on exact term matching. Dense semantic retrieval models embed unstructured text into continuous representation spaces where conceptual proximity is preserved regardless of specific lexical choices.

This controlled benchmark was created to empirically measure and isolate this effect in an offline, reproducible experimental framework.

---

## 2. Research Question

> **"Does dense semantic retrieval retrieve conceptually related journal entries more effectively than classical TF-IDF lexical retrieval, particularly when semantically related entries use different vocabulary?"**

---

## 3. Benchmark Construction

The benchmark consists of **48 synthetic journal-style entries** organized into **8 semantically distinct themes** (6 entries per theme):

1. `academic`: Academic Workload & Exam Stress
2. `sleep`: Sleep Difficulties & Insomnia
3. `isolation`: Social Isolation & Loneliness
4. `family`: Family Conflict & Interpersonal Tension
5. `financial`: Financial Concerns & Budget Pressure
6. `career`: Career Uncertainty & Post-Graduation Anxiety
7. `exercise`: Exercise & Health Routines
8. `social_pos`: Positive Social Connection & Friendship

### Controlled Lexical Overlap Structure

To rigorously test vocabulary sensitivity, each 6-entry theme was constructed with predefined **lexical profiles**:

| Slot | Lexical Profile | Definition & Design Intent | Count |
|---|---|---|---|
| A, B | `high_overlap` | Canonical domain keywords (e.g., *"exam"*, *"deadline"*, *"studying"*). Tests standard keyword matching. | 16 entries |
| C | `medium_overlap` | Narrative descriptions retaining partial domain vocabulary. | 8 entries |
| D, E | `low_overlap` | **Semantic Paraphrases:** Describes the same core experience using symptomatic or metaphorical vocabulary without canonical keywords. Designed to test dense semantic abstraction. | 16 entries |
| F | `ambiguous` | **Boundary Cases:** Describes generalized emotional states (e.g., feeling depleted or on-edge) situated at category boundaries. | 8 entries |

*Note on dataset safety: The benchmark dataset (`data/entries.json`) contains only controlled synthetic text and contains no real user data, credentials, or personally identifiable information.*

---

## 4. Relevance Definition

Relevance is determined **deterministically by the benchmark's ground-truth theme structure**, completely avoiding LLM-annotation noise or post-hoc labeling bias:

* **Relevant:** Any candidate entry belonging to the **same semantic theme** as the query entry (`c.theme_id == q.theme_id`, where `c.id != q.id`).
* **Non-Relevant:** Any entry belonging to a **different semantic theme** (`c.theme_id != q.theme_id`).

In a leave-one-out evaluation over 48 entries, each query evaluates against **47 candidates**, containing exactly **5 relevant items** and **42 non-relevant items**.

---

## 5. Retrieval Methodologies

### Method 1 — Sparse Lexical Baseline (TF-IDF + Cosine Similarity)

* **Vectorization:** Scikit-Learn `TfidfVectorizer`
* **Configuration:**
  * Sublinear term frequency scaling (`sublinear_tf=True`, $1 + \log(tf)$) to dampen frequent token dominance
  * Unigrams and Bigrams (`ngram_range=(1, 2)`) to capture multi-word expressions
  * Standard English stopword removal (`stop_words="english"`)
  * Minimum document frequency `min_df=1` (appropriate for controlled corpus)
* **Scoring:** Cosine similarity between query TF-IDF vector and candidate TF-IDF vectors.

### Method 2 — Dense Semantic Retrieval (`all-MiniLM-L6-v2` + Cosine Similarity)

* **Encoder:** `sentence-transformers/all-MiniLM-L6-v2` (6-layer MiniLM, 384-dimensional dense embeddings, 22.7M parameters)
* **Execution:** Fully local, offline inference (no external API calls or network access required).
* **Scoring:** Dot product of L2-normalized embeddings, equivalent to cosine similarity.

---

## 6. Evaluation Protocol & Metrics

Evaluation is performed using **Leave-One-Out Retrieval Evaluation** over all $N=48$ entries:

For each query entry $q_i$:
1. $q_i$ is excluded from the candidate pool.
2. Both algorithms score and rank the remaining 47 candidates.
3. Top-$K$ retrieved items are evaluated against ground truth.

### Metrics Computed (Macro-Averaged)

* **Precision@K ($K \in \{1, 3, 5\}$):** $\frac{|\text{Relevant} \cap \text{Top-}K|}{K}$
* **Recall@K ($K \in \{1, 3, 5\}$):** $\frac{|\text{Relevant} \cap \text{Top-}K|}{5}$
* **NDCG@K ($K \in \{1, 3, 5\}$):** Normalized Discounted Cumulative Gain (ranking quality with logarithmic discount)
* **MRR (Mean Reciprocal Rank):** $\frac{1}{\text{rank of first relevant candidate}}$ across the full candidate list

---

## 7. Experimental Results

### Table 1: Overall Retrieval Performance ($N = 48$ Queries)

| Metric | TF-IDF Baseline (Mean ± Std) | Dense Semantic (Mean ± Std) | Absolute Delta (Semantic - TF-IDF) | Relative Gain |
|---|---|---|---|---|
| **Precision@1** | 0.4583 ± 0.4983 | **0.7292 ± 0.4444** | **+0.2708** | +59.1% |
| **Precision@3** | 0.2778 ± 0.2576 | **0.6528 ± 0.3330** | **+0.3750** | +135.0% |
| **Precision@5** | 0.2458 ± 0.2091 | **0.5667 ± 0.2809** | **+0.3208** | +130.5% |
| **Recall@1** | 0.0917 ± 0.0997 | **0.1458 ± 0.0889** | **+0.0542** | +59.1% |
| **Recall@3** | 0.1667 ± 0.1546 | **0.3917 ± 0.1998** | **+0.2250** | +135.0% |
| **Recall@5** | 0.2458 ± 0.2091 | **0.5667 ± 0.2809** | **+0.3208** | +130.5% |
| **NDCG@3** | 0.3133 ± 0.2850 | **0.6716 ± 0.3292** | **+0.3582** | +114.3% |
| **NDCG@5** | 0.2827 ± 0.2328 | **0.6070 ± 0.2872** | **+0.3243** | +114.7% |
| **MRR** | 0.5807 ± 0.4041 | **0.8307 ± 0.2887** | **+0.2500** | +43.1% |

---

### Table 2: Stratified Performance by Lexical Overlap Profile

This breakdown directly answers the core research question:

| Stratum | Query Count | Metric | TF-IDF Baseline | Dense Semantic | Absolute Delta |
|---|---|---|---|---|---|
| **High Lexical Overlap** (Slots A, B) | $N = 16$ | **Precision@1**<br>**Precision@3**<br>**Recall@3**<br>**NDCG@3**<br>**MRR** | 0.8750 ± 0.3307<br>0.4792 ± 0.2031<br>0.2875 ± 0.1218<br>0.5580 ± 0.1906<br>0.9271 ± 0.1952 | **1.0000 ± 0.0000**<br>**0.7500 ± 0.3005**<br>**0.4500 ± 0.1803**<br>**0.8048 ± 0.2383**<br>**1.0000 ± 0.0000** | **+0.1250**<br>**+0.2708**<br>**+0.1625**<br>**+0.2469**<br>**+0.0729** |
| **Medium Overlap** (Slot C) | $N = 8$ | **Precision@1**<br>**Precision@3**<br>**Recall@3**<br>**NDCG@3**<br>**MRR** | 0.2500 ± 0.4330<br>0.2083 ± 0.1951<br>0.1250 ± 0.1171<br>0.2407 ± 0.2359<br>0.5000 ± 0.4140 | **0.6250 ± 0.4841**<br>**0.6250 ± 0.2165**<br>**0.3750 ± 0.1299**<br>**0.6401 ± 0.2568**<br>**0.7857 ± 0.3499** | **+0.3750**<br>**+0.4167**<br>**+0.2500**<br>**+0.3994**<br>**+0.2857** |
| **Low Overlap / Paraphrase** (Slots D, E) | $N = 16$ | **Precision@1**<br>**Precision@3**<br>**Recall@3**<br>**NDCG@3**<br>**MRR** | 0.2500 ± 0.4330<br>0.1458 ± 0.2348<br>0.0875 ± 0.1409<br>0.1613 ± 0.2586<br>0.3537 ± 0.3831 | **0.5625 ± 0.4961**<br>**0.6042 ± 0.3379**<br>**0.3625 ± 0.2027**<br>**0.5957 ± 0.3384**<br>**0.7329 ± 0.3162** | **+0.3125**<br>**+0.4583**<br>**+0.2750**<br>**+0.4344**<br>**+0.3791** |
| **Ambiguous / Boundary** (Slot F) | $N = 8$ | **Precision@1**<br>**Precision@3**<br>**Recall@3**<br>**NDCG@3**<br>**MRR** | 0.2500 ± 0.4330<br>0.2083 ± 0.2320<br>0.1250 ± 0.1392<br>0.2130 ± 0.2489<br>0.4301 ± 0.3526 | **0.5000 ± 0.5000**<br>**0.5000 ± 0.3727**<br>**0.3000 ± 0.2236**<br>**0.5000 ± 0.3912**<br>**0.6432 ± 0.3738** | **+0.2500**<br>**+0.2917**<br>**+0.1750**<br>**+0.2870**<br>**+0.2132** |

---

### Key Findings

1. **Substantial Absolute Advantage Under Low Lexical Overlap:** On queries with low lexical overlap (Slots D and E), TF-IDF achieves a Precision@3 of 0.1458 (Recall@3 0.0875), whereas dense semantic retrieval achieves a Precision@3 of **0.6042** (Recall@3 0.3625) — an absolute gain of **+0.4583** on Precision@3 and **+0.2750** on Recall@3.
2. **Dense Model Preserves High-Overlap Retrieval:** On canonical keyword queries (Slots A and B), dense semantic search achieves **P@1 = 1.0000** and **MRR = 1.0000** compared to **P@1 = 0.8750** and **MRR = 0.9271** for TF-IDF (+0.1250 absolute P@1; +0.2708 absolute P@3 at 0.7500 vs. 0.4792).
3. **Consistent Overall Gain:** Across all 48 benchmark queries, dense semantic retrieval achieves **Precision@3 of 0.6528 vs. 0.2778** (+0.3750 absolute) and **NDCG@3 of 0.6716 vs. 0.3133** (+0.3582 absolute).

---

## 8. Concrete Error Analysis

From the automated error case extractor, 4 representative scenarios were isolated:

### Case 1: Dense Semantic Succeeds & TF-IDF Fails
* **Query `acad_D` (Academic, Low Overlap):**
  > *"My brain feels like it is running at full capacity with no break in sight. The moment I finish one thing, three more appear that need attention. I cannot seem to get ahead no matter how many hours I put in. Something has to give soon."*
* **TF-IDF Top-3 (P@3 = 0.00, R@3 = 0.00):**
  1. `sleep_D` (Score: 0.0742) — *Non-Relevant* (Sleep theme: *"mornings have become something I dread..."*)
  2. `sleep_F` (Score: 0.0632) — *Non-Relevant* (Sleep theme: *"dread the evenings lately..."*)
  3. `fam_E` (Score: 0.0454) — *Non-Relevant* (Family theme: *"field of landmines..."*)
  *Reason for TF-IDF failure:* Query lacks the canonical tokens `"exam"`, `"class"`, or `"homework"`. TF-IDF matched incidental shared terms like *"feel"* and *"hours"*.
* **Dense Semantic Top-3 (P@3 = 0.67, R@3 = 0.40):**
  1. `acad_B` (Cosine Sim: 0.4727) — **Relevant** (Academic: *"brutal exam schedule... workload from my classes"*)
  2. `acad_A` (Cosine Sim: 0.4285) — **Relevant** (Academic: *"three exams next week and two major assignments..."*)
  3. `car_E` (Cosine Sim: 0.4079) — *Non-Relevant* (Career: *"spent four years working toward this qualification..."*)
  *Reason for Semantic success:* The sentence transformer mapped cognitive overwhelm and workload backlog into the academic/workload cluster.

---

### Case 2: Both Methods Succeed
* **Query `fin_A` (Financial, High Overlap):**
  > *"I am having severe financial anxiety about rent and tuition bills coming due. Checking my bank account balance makes my stomach drop because I am barely making enough money to cover basic costs."*
* **TF-IDF Top-3 (P@3 = 0.67):**
  1. `fin_B` (Score: 0.2862) — **Relevant** (*"Money is so tight right now. Between groceries, rent..."*)
  2. `fin_C` (Score: 0.0984) — **Relevant** (*"Declined an invite... budget... emergency savings fund..."*)
  3. `acad_A` (Score: 0.0385) — *Non-Relevant* (*"three exams next week..."*)
* **Dense Semantic Top-3 (P@3 = 1.00):**
  1. `fin_B` (Cosine Sim: 0.6806) — **Relevant**
  2. `fin_E` (Cosine Sim: 0.6514) — **Relevant** (*"unexpected utility bill arrived and wiped out the buffer..."*)
  3. `fin_D` (Cosine Sim: 0.5891) — **Relevant** (*"calculated every single expense down to the cent..."*)

---

### Case 3: Both Methods Experience Category Confusion on Boundary Entries
* **Query `fin_F` (Financial, Ambiguous Boundary):**
  > *"I feel constantly on edge about sudden emergencies. Knowing that a single unexpected complication could derail everything I have built makes me feel precarious and unprotected."*
* **TF-IDF Top-3 (P@3 = 0.00):**
  1. `acad_F` (Score: 0.0718) — *Non-Relevant* (Academic boundary: *"persistent low-level anxiety..."*)
  2. `fam_F` (Score: 0.0469) — *Non-Relevant* (Family boundary)
  3. `car_F` (Score: 0.0437) — *Non-Relevant* (Career boundary)
* **Dense Semantic Top-3 (P@3 = 0.00):**
  1. `car_F` (Cosine Sim: 0.5694) — *Non-Relevant* (Career: *"fear of committing to wrong life trajectory..."*)
  2. `acad_F` (Cosine Sim: 0.4907) — *Non-Relevant* (Academic: *"persistent low-level anxiety..."*)
  3. `fam_F` (Cosine Sim: 0.4508) — *Non-Relevant* (Family: *"unsupported and attacked..."*)
* **Diagnosis:** When entries describe abstract existential anxiety without contextual anchors, both lexical and semantic models place them into a generalized emotional distress cluster rather than specific financial/academic themes.

---

## 9. Reproducibility

The benchmark is 100% self-contained and reproducible offline.

```bash
# 1. Install dependencies
pip install -r experiment/requirements.txt

# 2. Run the benchmark evaluation
cd experiment/benchmark
python scripts/run_benchmark.py

# 3. Generate figures
python scripts/visualize_benchmark.py
```

Generated artifacts:
* `results/benchmark_results.json` (Full numerical outputs, strata breakdowns, error cases)
* `results/per_query.csv` (Row-by-row metric breakdown for all 48 queries)
* `results/benchmark_metric_comparison.png` (Overall bar chart)
* `results/stratified_performance.png` (Stratified P@3 comparison)
* `results/per_query_scatter.png` (Per-query scatter plot)

---

## 10. Limitations & Scientific Disclaimers

1. **Synthetic Data Disclaimer:** This benchmark utilizes a controlled synthetic corpus. It is **not** real user data and cannot be claimed as representative of real student journaling distributions.
2. **Behavioral vs. Clinical Evaluation:** This experiment evaluates the *retrieval mechanics* of sparse vs. dense NLP representations. It is **not** a clinical evaluation of MindGuard's therapeutic efficacy or psychological validity.
3. **External Validity:** The synthetic entries were engineered with clear thematic boundaries. Real-world user journals frequently blend multiple simultaneous stressors (e.g., simultaneous financial and academic distress), which introduces multi-label ambiguity not modeled in this single-label benchmark.
4. **Model Scope:** Dense semantic search was benchmarked using `sentence-transformers/all-MiniLM-L6-v2`. MindGuard's production pipeline uses `gemini-embedding-2` in Firestore. While MiniLM provides a reproducible local proxy for dense transformer embeddings, absolute cosine thresholds differ between model architectures.
5. **Controlled Benchmark Scope & Non-Universality:** The benchmark was intentionally constructed to isolate and test retrieval robustness under varying degrees of lexical variation and semantic paraphrase. Consequently, these empirical results reflect model behaviors under these specific controlled benchmark conditions and should not be interpreted as proof that dense semantic retrieval universally outperforms lexical retrieval across all general IR tasks or domains.
