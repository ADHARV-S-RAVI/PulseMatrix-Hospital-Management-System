def get_dashboard_summary(patients, doctors, beds_total=100):
    """
    Logic for dashboard statistics cards.
    """
    total_patients = len(patients)
    critical_count = len([p for p in patients if p.get('category') == 'Critical'])
    busy_doctors = len([d for d in doctors if d.get('status') == 'Busy'])
    active_patients = len([p for p in patients if p.get('status') != 'Discharged'])
    
    return {
        "total_patients": total_patients,
        "critical_patients": critical_count,
        "available_beds": max(0, beds_total - active_patients),
        "busy_doctors": busy_doctors,
        "available_doctors": len(doctors) - busy_doctors
    }
