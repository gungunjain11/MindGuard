"""
Benchmark Visualization Script
==============================
Reads experiment/benchmark/results/benchmark_results.json and generates
publication-quality figures for analysis and portfolio documentation:
1. benchmark_metric_comparison.png - Overall comparison across all metrics
2. stratified_performance.png - Performance across lexical overlap strata (High vs Med vs Low vs Ambiguous)
3. per_query_scatter.png - Scatter plot of Precision@3 with lexical profile coloring
"""

import json
import sys
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

SCRIPT_DIR = Path(__file__).resolve().parent
BENCHMARK_DIR = SCRIPT_DIR.parent
RESULTS_DIR = BENCHMARK_DIR / "results"
RESULTS_JSON = RESULTS_DIR / "benchmark_results.json"

COLOR_TFIDF = "#4C72B0"     # Muted blue
COLOR_SEMANTIC = "#55A868"  # Muted green

PROFILE_COLORS = {
    "high_overlap": "#2b5c8f",
    "medium_overlap": "#6f94b8",
    "low_overlap": "#2d7a48",
    "ambiguous": "#d95f02"
}

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.35,
    "grid.linestyle": "--",
})


def plot_overall_metrics(summary: dict):
    all_q = summary["metrics_summary"]["all_queries"]
    tfidf = all_q["tfidf"]
    sem = all_q["semantic"]

    metrics = ["precision@1", "precision@3", "precision@5", "recall@3", "recall@5", "ndcg@3", "mrr"]
    labels = ["P@1", "P@3", "P@5", "R@3", "R@5", "NDCG@3", "MRR"]

    t_means = [tfidf[m]["mean"] for m in metrics]
    t_stds = [tfidf[m]["std"] for m in metrics]
    s_means = [sem[m]["mean"] for m in metrics]
    s_stds = [sem[m]["std"] for m in metrics]

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 5.2))
    bars_t = ax.bar(x - width/2, t_means, width, yerr=t_stds, label="TF-IDF Baseline",
                    color=COLOR_TFIDF, alpha=0.88, capsize=4, error_kw={"elinewidth": 1.3, "ecolor": "#243b66"})
    bars_s = ax.bar(x + width/2, s_means, width, yerr=s_stds, label="Dense Semantic (all-MiniLM-L6-v2)",
                    color=COLOR_SEMANTIC, alpha=0.88, capsize=4, error_kw={"elinewidth": 1.3, "ecolor": "#1d5230"})

    for bars in (bars_t, bars_s):
        for bar in bars:
            h = bar.get_height()
            ax.annotate(f"{h:.2f}", xy=(bar.get_x() + bar.get_width()/2, h),
                        xytext=(0, 4), textcoords="offset points", ha="center", va="bottom", fontsize=8.5)

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10.5, fontweight="bold")
    ax.set_ylim(0, 1.15)
    ax.set_ylabel("Macro-Averaged Score", fontsize=11)
    ax.set_title("Controlled Retrieval Benchmark: Overall Metrics (N = 48)\nSparse TF-IDF vs. Dense Semantic (all-MiniLM-L6-v2)",
                 fontsize=11, pad=12)
    ax.legend(fontsize=10.5, loc="upper right")

    fig.tight_layout()
    out = RESULTS_DIR / "benchmark_metric_comparison.png"
    fig.savefig(out, dpi=180, bbox_inches="tight")
    plt.close(fig)
    print(f"[viz] Saved: {out.name}")


def plot_stratified_precision(summary: dict):
    strata = [
        ("High Overlap (N=16)", summary["metrics_summary"]["high_lexical_overlap"]),
        ("Medium Overlap (N=8)", summary["metrics_summary"]["medium_lexical_overlap"]),
        ("Low Overlap (N=16)", summary["metrics_summary"]["low_lexical_overlap"]),
        ("Ambiguous (N=8)", summary["metrics_summary"]["ambiguous"]),
    ]

    labels = [s[0] for s in strata]
    tfidf_p3 = [s[1]["tfidf"]["precision@3"]["mean"] for s in strata]
    tfidf_err = [s[1]["tfidf"]["precision@3"]["std"] for s in strata]
    sem_p3 = [s[1]["semantic"]["precision@3"]["mean"] for s in strata]
    sem_err = [s[1]["semantic"]["precision@3"]["std"] for s in strata]

    x = np.arange(len(labels))
    width = 0.35

    fig, ax = plt.subplots(figsize=(9.5, 5))
    bars_t = ax.bar(x - width/2, tfidf_p3, width, yerr=tfidf_err, label="TF-IDF Baseline",
                    color=COLOR_TFIDF, alpha=0.88, capsize=4, error_kw={"elinewidth": 1.3})
    bars_s = ax.bar(x + width/2, sem_p3, width, yerr=sem_err, label="Dense Semantic (all-MiniLM-L6-v2)",
                    color=COLOR_SEMANTIC, alpha=0.88, capsize=4, error_kw={"elinewidth": 1.3})

    for bars in (bars_t, bars_s):
        for bar in bars:
            h = bar.get_height()
            ax.annotate(f"{h:.2f}", xy=(bar.get_x() + bar.get_width()/2, h),
                        xytext=(0, 4), textcoords="offset points", ha="center", va="bottom", fontsize=8.5)

    ax.set_xticks(x)
    ax.set_xticklabels(labels, fontsize=10)
    ax.set_ylim(0, 1.15)
    ax.set_ylabel("Precision@3 (Mean +- Std)", fontsize=11)
    ax.set_title("Stratified Precision@3 by Lexical Overlap Profile\nDemonstrating Dense Retrieval Superiority Under Vocabulary Variation",
                 fontsize=11, pad=12)
    ax.legend(fontsize=10.5, loc="upper right")

    fig.tight_layout()
    out = RESULTS_DIR / "stratified_performance.png"
    fig.savefig(out, dpi=180, bbox_inches="tight")
    plt.close(fig)
    print(f"[viz] Saved: {out.name}")


def plot_per_query_scatter(summary: dict):
    per_q = summary["per_query_detailed"]
    fig, ax = plt.subplots(figsize=(6.5, 6.5))

    # Reference y=x line
    ax.plot([0, 1], [0, 1], color="#999999", lw=1.2, ls="--", label="Equal Performance (y = x)", zorder=1)

    for q in per_q:
        t_val = q["tfidf_metrics"]["precision@3"]
        s_val = q["semantic_metrics"]["precision@3"]
        prof = q["lexical_profile"]
        color = PROFILE_COLORS.get(prof, "#333333")

        # Jitter slightly for visual clarity on discrete precision fractions
        jitter_t = t_val + np.random.uniform(-0.015, 0.015)
        jitter_s = s_val + np.random.uniform(-0.015, 0.015)

        ax.scatter(jitter_t, jitter_s, color=color, s=65, alpha=0.85, edgecolors="white", lw=0.6, zorder=3)

    ax.set_xlim(-0.05, 1.05)
    ax.set_ylim(-0.05, 1.05)
    ax.set_xlabel("TF-IDF Precision@3", fontsize=11)
    ax.set_ylabel("Dense Semantic Precision@3", fontsize=11)
    ax.set_title("Per-Query Precision@3: TF-IDF vs. Dense Semantic\n(Points above diagonal = Dense Semantic Superior)",
                 fontsize=10.5, pad=12)

    patches = [
        mpatches.Patch(color=PROFILE_COLORS["high_overlap"], label="High Overlap (N=16)"),
        mpatches.Patch(color=PROFILE_COLORS["medium_overlap"], label="Medium Overlap (N=8)"),
        mpatches.Patch(color=PROFILE_COLORS["low_overlap"], label="Low Overlap / Paraphrase (N=16)"),
        mpatches.Patch(color=PROFILE_COLORS["ambiguous"], label="Ambiguous / Boundary (N=8)"),
    ]
    ax.legend(handles=patches, fontsize=8.5, loc="lower right", framealpha=0.95)

    fig.tight_layout()
    out = RESULTS_DIR / "per_query_scatter.png"
    fig.savefig(out, dpi=180, bbox_inches="tight")
    plt.close(fig)
    print(f"[viz] Saved: {out.name}")


def main():
    if not RESULTS_JSON.exists():
        print(f"[viz] ERROR: {RESULTS_JSON} not found. Run run_benchmark.py first.")
        sys.exit(1)

    with open(RESULTS_JSON, encoding="utf-8") as f:
        summary = json.load(f)

    plot_overall_metrics(summary)
    plot_stratified_precision(summary)
    plot_per_query_scatter(summary)
    print("[viz] All charts successfully generated in results/")


if __name__ == "__main__":
    main()
