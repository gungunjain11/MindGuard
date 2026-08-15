"""
Controlled Offline Benchmark: TF-IDF vs. Dense Semantic Retrieval
===================================================================
Evaluates sparse lexical retrieval (TF-IDF + cosine similarity) against
dense semantic retrieval (sentence-transformers/all-MiniLM-L6-v2 + cosine similarity)
on a controlled 48-entry synthetic benchmark across 8 themes.

Leaves-one-out evaluation protocol:
- Each entry is treated as a query against all 47 other candidates.
- Ground truth relevance: entries belonging to the SAME semantic theme (5 per query).
- Metrics: Precision@1/3/5, Recall@1/3/5, NDCG@3/5, MRR.
- Stratified analysis by lexical profile: All, High-overlap, Medium-overlap, Low-overlap, Ambiguous.
- Concrete error case extraction for interpretability.
"""

import json
import math
import csv
import argparse
import sys
from pathlib import Path
from typing import Optional, Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity as sklearn_cosine
from sentence_transformers import SentenceTransformer


# ─── Path Configuration ───────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
BENCHMARK_DIR = SCRIPT_DIR.parent
DATA_DIR = BENCHMARK_DIR / "data"
RESULTS_DIR = BENCHMARK_DIR / "results"
ENTRIES_PATH = DATA_DIR / "entries.json"
META_PATH = DATA_DIR / "benchmark_meta.json"


# ─── Metric Functions ─────────────────────────────────────────────────────────

def precision_at_k(ranked_rel: list[int], k: int) -> float:
    if k == 0:
        return 0.0
    return sum(ranked_rel[:k]) / k


def recall_at_k(ranked_rel: list[int], total_relevant: int, k: int) -> float:
    if total_relevant == 0:
        return 0.0
    return sum(ranked_rel[:k]) / total_relevant


def dcg_at_k(ranked_rel: list[int], k: int) -> float:
    return sum(rel / math.log2(i + 2) for i, rel in enumerate(ranked_rel[:k]))


def ndcg_at_k(ranked_rel: list[int], k: int) -> float:
    ideal = sorted(ranked_rel, reverse=True)
    ideal_dcg = dcg_at_k(ideal, k)
    if ideal_dcg == 0.0:
        return 0.0
    return dcg_at_k(ranked_rel, k) / ideal_dcg


def mrr(ranked_rel: list[int]) -> float:
    for i, rel in enumerate(ranked_rel):
        if rel == 1:
            return 1.0 / (i + 1)
    return 0.0


def compute_all_metrics(ranked_rel: list[int], total_relevant: int, k_values: list[int]) -> dict:
    metrics = {}
    for k in k_values:
        metrics[f"precision@{k}"] = precision_at_k(ranked_rel, k)
        metrics[f"recall@{k}"] = recall_at_k(ranked_rel, total_relevant, k)
        metrics[f"ndcg@{k}"] = ndcg_at_k(ranked_rel, k)
    metrics["mrr"] = mrr(ranked_rel)
    return metrics


# ─── Macro-Aggregation Helper ────────────────────────────────────────────────

def macro_average(results_list: list[dict], method: str, k_values: list[int]) -> dict:
    if not results_list:
        return {}
    metric_keys = (
        [f"precision@{k}" for k in k_values] +
        [f"recall@{k}" for k in k_values] +
        [f"ndcg@{k}" for k in k_values] +
        ["mrr"]
    )
    agg = {}
    for key in metric_keys:
        vals = [r[method][key] for r in results_list if key in r[method]]
        if vals:
            agg[key] = {
                "mean": float(np.mean(vals)),
                "std": float(np.std(vals)),
                "min": float(np.min(vals)),
                "max": float(np.max(vals)),
                "count": len(vals),
            }
    return agg


# ─── Retrieval Engines ───────────────────────────────────────────────────────

def run_tfidf_retrieval(entries: list[dict]) -> tuple[Any, np.ndarray]:
    texts = [e["text"] for e in entries]
    vec = TfidfVectorizer(
        strip_accents="unicode",
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True,
    )
    tfidf_matrix = vec.fit_transform(texts)
    # Cosine similarity between all entries (48 x 48)
    sim_matrix = sklearn_cosine(tfidf_matrix, tfidf_matrix)
    return vec, sim_matrix


def run_dense_semantic_retrieval(entries: list[dict], model_name: str) -> np.ndarray:
    texts = [e["text"] for e in entries]
    print(f"[benchmark] Loading dense sentence transformer model: {model_name}...")
    model = SentenceTransformer(model_name)
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    # Cosine similarity with normalized vectors is just the dot product
    sim_matrix = np.dot(embeddings, embeddings.T)
    return sim_matrix


# ─── Error Analysis Extraction ───────────────────────────────────────────────

def extract_error_cases(per_query: list[dict], entries: list[dict]) -> dict:
    """
    Extract concrete instances for error analysis:
    1. Semantic Wins & TF-IDF Fails (Semantic P@3 >= 0.66 and TF-IDF P@3 <= 0.33)
    2. TF-IDF Wins & Semantic Fails (TF-IDF P@3 >= 0.66 and Semantic P@3 <= 0.33)
    3. Both Succeed (Both P@3 >= 0.66)
    4. Both Fail (Both P@3 <= 0.33)
    """
    id_to_entry = {e["id"]: e for e in entries}

    cases = {
        "semantic_wins_tfidf_fails": [],
        "tfidf_wins_semantic_fails": [],
        "both_succeed": [],
        "both_fail": []
    }

    for q in per_query:
        sem_p3 = q["semantic"]["precision@3"]
        tfidf_p3 = q["tfidf"]["precision@3"]
        entry = id_to_entry[q["id"]]

        case_info = {
            "query_id": q["id"],
            "query_theme": q["theme_id"],
            "lexical_profile": q["lexical_profile"],
            "query_text": entry["text"],
            "tfidf_precision@3": tfidf_p3,
            "semantic_precision@3": sem_p3,
            "tfidf_top3": [
                {
                    "id": item["id"],
                    "theme": item["theme_id"],
                    "is_relevant": item["is_relevant"],
                    "score": round(item["score"], 4),
                    "text": id_to_entry[item["id"]]["text"]
                }
                for item in q["tfidf_ranked"][:3]
            ],
            "semantic_top3": [
                {
                    "id": item["id"],
                    "theme": item["theme_id"],
                    "is_relevant": item["is_relevant"],
                    "score": round(item["score"], 4),
                    "text": id_to_entry[item["id"]]["text"]
                }
                for item in q["semantic_ranked"][:3]
            ]
        }

        if sem_p3 >= 0.66 and tfidf_p3 <= 0.33:
            cases["semantic_wins_tfidf_fails"].append(case_info)
        elif tfidf_p3 >= 0.66 and sem_p3 <= 0.33:
            cases["tfidf_wins_semantic_fails"].append(case_info)
        elif sem_p3 >= 0.66 and tfidf_p3 >= 0.66:
            cases["both_succeed"].append(case_info)
        elif sem_p3 <= 0.33 and tfidf_p3 <= 0.33:
            cases["both_fail"].append(case_info)

    return cases


# ─── Pretty Printing ─────────────────────────────────────────────────────────

def print_metrics_table(tfidf_agg: dict, sem_agg: dict, k_values: list[int], title: str, n: int):
    labels = (
        [(f"precision@{k}", f"Precision@{k}") for k in k_values] +
        [(f"recall@{k}", f"Recall@{k}") for k in k_values] +
        [(f"ndcg@{k}", f"NDCG@{k}") for k in k_values] +
        [("mrr", "MRR")]
    )

    print()
    print("=" * 78)
    print(f"  {title} (N = {n} queries)")
    print("=" * 78)
    print(f"  {'Metric':<16}  {'TF-IDF (mean+-std)':<24}  {'Semantic (mean+-std)':<24}  {'Delta (Sem-TF)'}")
    print("-" * 78)

    for key, label in labels:
        if key not in tfidf_agg or key not in sem_agg:
            continue
        t_m = tfidf_agg[key]["mean"]
        t_s = tfidf_agg[key]["std"]
        s_m = sem_agg[key]["mean"]
        s_s = sem_agg[key]["std"]
        diff = s_m - t_m
        sign = "+" if diff >= 0 else ""
        winner = f"{sign}{diff:.4f}"
        print(f"  {label:<16}  {t_m:.4f} +- {t_s:.4f}     {s_m:.4f} +- {s_s:.4f}     {winner}")
    print("=" * 78)


# ─── Main Execution ──────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Run Controlled Synthetic Retrieval Benchmark.")
    parser.add_argument("--model", type=str, default="sentence-transformers/all-MiniLM-L6-v2",
                        help="HuggingFace model for dense semantic retrieval.")
    args = parser.parse_args()

    if not ENTRIES_PATH.exists() or not META_PATH.exists():
        print(f"[benchmark] ERROR: Data files not found in {DATA_DIR}")
        sys.exit(1)

    with open(ENTRIES_PATH, encoding="utf-8") as f:
        entries = json.load(f)

    with open(META_PATH, encoding="utf-8") as f:
        metadata = json.load(f)

    n_entries = len(entries)
    print(f"[benchmark] Loaded {n_entries} benchmark entries across {metadata['n_themes']} themes.")

    k_values = [1, 3, 5]

    # Compute Sim Matrices
    print("[benchmark] Fitting TF-IDF vectorizer...")
    _, tfidf_sims = run_tfidf_retrieval(entries)

    print(f"[benchmark] Generating dense embeddings using {args.model}...")
    semantic_sims = run_dense_semantic_retrieval(entries, args.model)

    # Leave-one-out evaluation loop
    per_query_results = []

    for i, query in enumerate(entries):
        q_id = query["id"]
        q_theme = query["theme_id"]
        q_profile = query["lexical_profile"]

        # Candidates are all other 47 entries
        tfidf_scores = [
            (j, float(tfidf_sims[i, j]))
            for j in range(n_entries) if j != i
        ]
        tfidf_scores.sort(key=lambda x: x[1], reverse=True)

        semantic_scores = [
            (j, float(semantic_sims[i, j]))
            for j in range(n_entries) if j != i
        ]
        semantic_scores.sort(key=lambda x: x[1], reverse=True)

        # Relevance vector (1 if candidate has same theme_id, else 0)
        tfidf_rel = [1 if entries[idx]["theme_id"] == q_theme else 0 for idx, _ in tfidf_scores]
        sem_rel = [1 if entries[idx]["theme_id"] == q_theme else 0 for idx, _ in semantic_scores]

        total_relevant = sum(tfidf_rel)  # exactly 5

        tfidf_metrics = compute_all_metrics(tfidf_rel, total_relevant, k_values)
        sem_metrics = compute_all_metrics(sem_rel, total_relevant, k_values)

        per_query_results.append({
            "id": q_id,
            "theme_id": q_theme,
            "lexical_profile": q_profile,
            "total_relevant": total_relevant,
            "tfidf": tfidf_metrics,
            "semantic": sem_metrics,
            "tfidf_ranked": [
                {
                    "id": entries[idx]["id"],
                    "theme_id": entries[idx]["theme_id"],
                    "score": score,
                    "is_relevant": bool(entries[idx]["theme_id"] == q_theme)
                }
                for idx, score in tfidf_scores
            ],
            "semantic_ranked": [
                {
                    "id": entries[idx]["id"],
                    "theme_id": entries[idx]["theme_id"],
                    "score": score,
                    "is_relevant": bool(entries[idx]["theme_id"] == q_theme)
                }
                for idx, score in semantic_scores
            ]
        })

    # Stratify by Lexical Profile
    all_tfidf = macro_average(per_query_results, "tfidf", k_values)
    all_sem = macro_average(per_query_results, "semantic", k_values)

    high_queries = [q for q in per_query_results if q["lexical_profile"] == "high_overlap"]
    high_tfidf = macro_average(high_queries, "tfidf", k_values)
    high_sem = macro_average(high_queries, "semantic", k_values)

    med_queries = [q for q in per_query_results if q["lexical_profile"] == "medium_overlap"]
    med_tfidf = macro_average(med_queries, "tfidf", k_values)
    med_sem = macro_average(med_queries, "semantic", k_values)

    low_queries = [q for q in per_query_results if q["lexical_profile"] == "low_overlap"]
    low_tfidf = macro_average(low_queries, "tfidf", k_values)
    low_sem = macro_average(low_queries, "semantic", k_values)

    amb_queries = [q for q in per_query_results if q["lexical_profile"] == "ambiguous"]
    amb_tfidf = macro_average(amb_queries, "tfidf", k_values)
    amb_sem = macro_average(amb_queries, "semantic", k_values)

    # Print Main Results
    print_metrics_table(all_tfidf, all_sem, k_values, "ALL QUERIES (Macro-Averaged)", len(per_query_results))
    print_metrics_table(high_tfidf, high_sem, k_values, "HIGH-LEXICAL-OVERLAP SUBSET", len(high_queries))
    print_metrics_table(low_tfidf, low_sem, k_values, "LOW-LEXICAL-OVERLAP SUBSET (Semantic Paraphrases)", len(low_queries))
    print_metrics_table(amb_tfidf, amb_sem, k_values, "AMBIGUOUS / BOUNDARY SUBSET", len(amb_queries))

    # Error Analysis Extraction
    error_cases = extract_error_cases(per_query_results, entries)
    print("\n[benchmark] Error Analysis Summary:")
    print(f"  - Semantic Wins & TF-IDF Fails: {len(error_cases['semantic_wins_tfidf_fails'])} queries")
    print(f"  - TF-IDF Wins & Semantic Fails: {len(error_cases['tfidf_wins_semantic_fails'])} queries")
    print(f"  - Both Succeed:                {len(error_cases['both_succeed'])} queries")
    print(f"  - Both Fail:                   {len(error_cases['both_fail'])} queries")

    # Save Results to JSON
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    summary_output = {
        "benchmark_meta": metadata,
        "evaluation_protocol": "Leave-one-out (each entry query against 47 other candidates)",
        "models": {
            "lexical_baseline": "TF-IDF (unigrams+bigrams, sublinear_tf=True, english stopwords)",
            "dense_semantic": args.model
        },
        "metrics_summary": {
            "all_queries": {
                "n": len(per_query_results),
                "tfidf": all_tfidf,
                "semantic": all_sem
            },
            "high_lexical_overlap": {
                "n": len(high_queries),
                "tfidf": high_tfidf,
                "semantic": high_sem
            },
            "medium_lexical_overlap": {
                "n": len(med_queries),
                "tfidf": med_tfidf,
                "semantic": med_sem
            },
            "low_lexical_overlap": {
                "n": len(low_queries),
                "tfidf": low_tfidf,
                "semantic": low_sem
            },
            "ambiguous": {
                "n": len(amb_queries),
                "tfidf": amb_tfidf,
                "semantic": amb_sem
            }
        },
        "error_analysis_cases": error_cases,
        "per_query_detailed": [
            {
                "id": q["id"],
                "theme_id": q["theme_id"],
                "lexical_profile": q["lexical_profile"],
                "tfidf_metrics": q["tfidf"],
                "semantic_metrics": q["semantic"],
                "tfidf_top5": [item["id"] for item in q["tfidf_ranked"][:5]],
                "semantic_top5": [item["id"] for item in q["semantic_ranked"][:5]]
            }
            for q in per_query_results
        ]
    }

    json_path = RESULTS_DIR / "benchmark_results.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary_output, f, indent=2, ensure_ascii=False)
    print(f"\n[benchmark] Saved JSON summary to {json_path}")

    # Save Per-Query CSV
    csv_path = RESULTS_DIR / "per_query.csv"
    fieldnames = [
        "id", "theme_id", "lexical_profile",
        "tfidf_p@1", "tfidf_p@3", "tfidf_p@5", "tfidf_r@1", "tfidf_r@3", "tfidf_r@5", "tfidf_ndcg@3", "tfidf_ndcg@5", "tfidf_mrr",
        "semantic_p@1", "semantic_p@3", "semantic_p@5", "semantic_r@1", "semantic_r@3", "semantic_r@5", "semantic_ndcg@3", "semantic_ndcg@5", "semantic_mrr"
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for q in per_query_results:
            writer.writerow({
                "id": q["id"],
                "theme_id": q["theme_id"],
                "lexical_profile": q["lexical_profile"],
                "tfidf_p@1": q["tfidf"]["precision@1"],
                "tfidf_p@3": q["tfidf"]["precision@3"],
                "tfidf_p@5": q["tfidf"]["precision@5"],
                "tfidf_r@1": q["tfidf"]["recall@1"],
                "tfidf_r@3": q["tfidf"]["recall@3"],
                "tfidf_r@5": q["tfidf"]["recall@5"],
                "tfidf_ndcg@3": q["tfidf"]["ndcg@3"],
                "tfidf_ndcg@5": q["tfidf"]["ndcg@5"],
                "tfidf_mrr": q["tfidf"]["mrr"],
                "semantic_p@1": q["semantic"]["precision@1"],
                "semantic_p@3": q["semantic"]["precision@3"],
                "semantic_p@5": q["semantic"]["precision@5"],
                "semantic_r@1": q["semantic"]["recall@1"],
                "semantic_r@3": q["semantic"]["recall@3"],
                "semantic_r@5": q["semantic"]["recall@5"],
                "semantic_ndcg@3": q["semantic"]["ndcg@3"],
                "semantic_ndcg@5": q["semantic"]["ndcg@5"],
                "semantic_mrr": q["semantic"]["mrr"],
            })
    print(f"[benchmark] Saved per-query metrics to {csv_path}")


if __name__ == "__main__":
    main()
