def prepare_chart_data(labels, values):
    """
    Standard format for Chart.js
    """
    return {
        "labels": labels,
        "values": values
    }

def get_severity_distribution_data(patients):
    """
    Groups patients by severity category.
    """
    dist = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for p in patients:
        cat = p.get('category')
        if cat in dist:
            dist[cat] += 1
    return prepare_chart_data(list(dist.keys()), list(dist.values()))

def get_dept_distribution_data(dept_data):
    """
    dept_data: List of dicts with 'name' and 'count'
    """
    labels = [d['name'] for d in dept_data]
    values = [d['count'] for d in dept_data]
    return prepare_chart_data(labels, values)
