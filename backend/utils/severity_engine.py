"""
Module 1: Severity Score Engine
Handles weighted symptom scoring and patient classification.
"""

# Scalable Symptom Dictionary with Weights (0-100)
SYMPTOM_WEIGHTS = {
    "Heart Attack": 95,
    "Unconscious": 90,
    "Severe Bleeding": 85,
    "Chest Pain": 75,
    "Difficulty Breathing": 80,
    "Fracture": 50,
    "High Fever": 40,
    "Minor Cut": 15,
    "Fever": 20,
    "Abdominal Pain": 45,
    "Headache": 10
}

def calculate_severity(symptoms):
    """
    Calculates a total severity score based on multiple symptoms.
    Uses a 'max-plus' weighted approach (highest symptom + fractional of others).
    """
    if not symptoms:
        return 0
    
    scores = [SYMPTOM_WEIGHTS.get(s, 10) for s in symptoms] # Default 10 if unknown
    scores.sort(reverse=True)
    
    # Algorithm: Base score is the highest symptom weight + 10% of others
    # This ensures a patient with 3 medium symptoms is higher than one with 1 medium symptom.
    primary_score = scores[0]
    secondary_influence = sum(scores[1:]) * 0.1
    
    final_score = min(100, primary_score + secondary_influence)
    return round(final_score, 2)

def classify_patient(score):
    """
    Classifies patients into priority levels based on score.
    """
    if score >= 85:
        return "Critical"
    elif score >= 60:
        return "High"
    elif score >= 35:
        return "Medium"
    else:
        return "Low"
