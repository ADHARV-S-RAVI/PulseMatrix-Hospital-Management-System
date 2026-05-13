def get_severity_category(score):
    """
    Categorizes a severity score into human-readable labels.
    - 80+ → Critical
    - 50–79 → High
    - 20–49 → Medium
    - Below 20 → Low
    """
    if score >= 80:
        return "Critical"
    elif score >= 50:
        return "High"
    elif score >= 20:
        return "Medium"
    else:
        return "Low"
