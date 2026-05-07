"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeRiskScores = void 0;
const mergeRiskScores = (structuredScore, aiRiskLevel) => {
    // Weights: 55% structured, 45% AI
    const structuredWeight = 0.55;
    const aiWeight = 0.45;
    // Convert AI risk level to numeric score (0-100)
    const aiScore = aiRiskLevel === "high" ? 80 : aiRiskLevel === "medium" ? 50 : 20;
    // Calculate weighted average
    const mergedScore = Math.round((structuredScore * structuredWeight) + (aiScore * aiWeight));
    // Determine label based on merged score
    let label;
    if (mergedScore >= 70) {
        label = "critical";
    }
    else if (mergedScore >= 50) {
        label = "high";
    }
    else if (mergedScore >= 30) {
        label = "medium";
    }
    else {
        label = "low";
    }
    // Determine dominant signal
    const structuredContribution = structuredScore * structuredWeight;
    const aiContribution = aiScore * aiWeight;
    const dominantSignal = structuredContribution > aiContribution ? "structured" : aiContribution > structuredContribution ? "ai" : "both";
    // Generate explanation
    const explanations = {
        structured: `Your structured check-in score (${structuredScore}) is the primary driver of this assessment.`,
        ai: `Your journal analysis indicates ${aiRiskLevel} risk, which is the primary driver of this assessment.`,
        both: `Both your structured check-in (${structuredScore}) and journal analysis (${aiRiskLevel} risk) contribute significantly to this assessment.`
    };
    const explanation = explanations[dominantSignal];
    return {
        score: mergedScore,
        label,
        structuredScore,
        aiRiskLevel,
        dominantSignal,
        explanation
    };
};
exports.mergeRiskScores = mergeRiskScores;
//# sourceMappingURL=burnoutScoreMerger.js.map