"""
ai_routes.py
Backend AI service using Google Gemini (via google-generativeai).
API key is read from environment variables — never exposed to the frontend.
"""
from flask import Blueprint, request, jsonify
from utils.db import query_db, execute_db
import json
import os

ai_bp = Blueprint('ai', __name__)

# ── Gemini Configuration ───────────────────────────────────────────────────────
def _get_gemini_model():
    """Initialize and return the Gemini model. Returns None if not configured."""
    api_key = os.environ.get('AI_API_KEY') or os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model_name = os.environ.get('AI_MODEL', 'gemini-1.5-flash')
        return genai.GenerativeModel(model_name)
    except ImportError:
        return None
    except Exception:
        return None


def _call_gemini(prompt, fallback_message="AI service unavailable. Please configure AI_API_KEY in backend/.env"):
    """Helper to call Gemini API with error handling."""
    model = _get_gemini_model()
    if not model:
        return None, fallback_message

    try:
        response = model.generate_content(prompt)
        return response.text, None
    except Exception as e:
        return None, f"AI service error: {str(e)}"


def _get_patient_context(patient_id):
    """Fetch comprehensive patient context from DB for AI prompts."""
    patient = query_db(
        """SELECT p.*, d.doctor_name AS assigned_doctor_name, b.bed_type AS assigned_bed_type
           FROM patients p
           LEFT JOIN doctors d ON p.assigned_doctor_id = d.doctor_id
           LEFT JOIN beds b ON p.assigned_bed_id = b.bed_id
           WHERE p.patient_id = ?""",
        (patient_id,), one=True
    )
    if not patient:
        return None, None, None, None

    meds = query_db(
        """SELECT m.name, pr.dosage, pr.frequency
           FROM prescriptions pr
           JOIN medicines m ON pr.medicine_id = m.medicine_id
           WHERE pr.patient_id = ? ORDER BY pr.prescribed_date DESC LIMIT 10""",
        (patient_id,)
    )
    notes = query_db(
        "SELECT note_type, content, timestamp FROM clinical_notes WHERE patient_id = ? ORDER BY timestamp DESC LIMIT 5",
        (patient_id,)
    )
    labs = query_db(
        "SELECT test_name, status, results FROM lab_requests WHERE patient_id = ? ORDER BY request_date DESC LIMIT 5",
        (patient_id,)
    )
    return patient, meds, notes, labs


# ── POST /ai/patient-summary ───────────────────────────────────────────────────
@ai_bp.route('/ai/patient-summary', methods=['POST'])
def ai_patient_summary():
    """
    POST /ai/patient-summary
    Generates a concise clinical AI summary for a patient.
    """
    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')

    if not patient_id:
        return jsonify({"error": "patient_id required"}), 400

    patient, meds, notes, labs = _get_patient_context(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    med_list = ", ".join([f"{m['name']} {m['dosage']} {m['frequency']}" for m in meds]) if meds else "None recorded"
    note_list = "\n".join([f"- [{n['note_type']}] {n['content'][:200]}" for n in notes]) if notes else "None recorded"
    lab_list = "\n".join([f"- {l['test_name']}: {l['status']}" + (f" - {l['results'][:100]}" if l['results'] else "") for l in labs]) if labs else "None recorded"

    prompt = f"""You are a clinical AI assistant in a hospital emergency management system.
Generate a concise clinical summary (3-5 sentences) for the attending doctor. Be factual, use only the data provided.

PATIENT: {patient['name']}, {patient['age']} years old, {patient['gender']}
DEPARTMENT: {patient['department']}
BED: {patient.get('assigned_bed_type', 'Awaiting assignment')}
SEVERITY SCORE: {patient['severity_score']}/100 (higher = more severe)
SYMPTOMS: {patient.get('symptoms', 'Not recorded')}

CURRENT MEDICATIONS: {med_list}

RECENT CLINICAL NOTES:
{note_list}

RECENT DIAGNOSTICS:
{lab_list}

Provide only the clinical summary paragraph. Do not include disclaimers or headers. Focus on actionable clinical picture."""

    summary, error = _call_gemini(prompt)

    if error:
        # Return a structured fallback based on available data
        summary = (
            f"{patient['name']}, {patient['age']}yo {patient['gender']}, admitted to {patient['department']}. "
            f"Severity score: {patient['severity_score']}/100. "
            f"Symptoms: {patient.get('symptoms', 'Not documented')}. "
            f"Current medications: {med_list}. "
            f"AI narrative unavailable: {error}"
        )

    # Log recommendation
    if doctor_id:
        try:
            execute_db(
                "INSERT INTO ai_recommendations (patient_id, doctor_id, rec_type, response) VALUES (?, ?, ?, ?)",
                (patient_id, doctor_id, 'patient_summary', summary[:2000])
            )
        except Exception:
            pass

    return jsonify({
        "summary": summary,
        "ai_generated": True,
        "requires_clinical_review": True,
        "disclaimer": "AI Generated — Requires Clinical Review. Not a substitute for clinical judgment.",
        "ai_available": error is None
    }), 200


# ── POST /ai/handover ──────────────────────────────────────────────────────────
@ai_bp.route('/ai/handover', methods=['POST'])
def ai_handover():
    """
    POST /ai/handover
    Generates a structured shift handover for a patient.
    Doctor must review and edit before submission.
    """
    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')

    if not patient_id:
        return jsonify({"error": "patient_id required"}), 400

    patient, meds, notes, labs = _get_patient_context(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    pending_ops = query_db(
        "SELECT operation_type, priority, status FROM operations WHERE patient_id = ? AND status NOT IN ('Completed','Cancelled') ORDER BY created_at DESC LIMIT 10",
        (patient_id,)
    )

    med_list = "\n".join([f"- {m['name']} {m['dosage']} {m['frequency']}" for m in meds]) if meds else "- None recorded"
    note_list = "\n".join([f"- [{n['note_type']}] {n['content'][:300]}" for n in notes]) if notes else "- None recorded"
    lab_list = "\n".join([f"- {l['test_name']}: {l['status']}" for l in labs]) if labs else "- None"
    ops_list = "\n".join([f"- {op['operation_type'].replace('_',' ').title()} ({op['priority']}) - {op['status']}" for op in pending_ops]) if pending_ops else "- None"

    prompt = f"""You are a clinical AI assistant generating a structured shift handover document.
Use ONLY the data provided. If information is missing, state "Not documented."

PATIENT: {patient['name']}, {patient['age']}yo {patient['gender']}
DEPARTMENT: {patient['department']} | SEVERITY: {patient['severity_score']}/100
SYMPTOMS: {patient.get('symptoms', 'Not recorded')}

MEDICATIONS:
{med_list}

RECENT CLINICAL NOTES:
{note_list}

RECENT DIAGNOSTICS:
{lab_list}

PENDING OPERATIONS:
{ops_list}

Generate a handover in this exact JSON structure (return only valid JSON, no markdown):
{{
  "patient_condition": "...",
  "latest_vitals_summary": "...",
  "important_medications": "...",
  "recent_diagnostics": "...",
  "pending_tests": "...",
  "pending_operations": "...",
  "risk_flags": "...",
  "recommended_followup": "..."
}}"""

    ai_response, error = _call_gemini(prompt)

    if not error and ai_response:
        try:
            # Strip markdown code fences if present
            clean = ai_response.strip()
            if clean.startswith("```"):
                clean = clean[clean.find('{'):clean.rfind('}')+1]
            handover_data = json.loads(clean)
        except (json.JSONDecodeError, ValueError):
            handover_data = {"patient_condition": ai_response}
    else:
        # Structured fallback
        handover_data = {
            "patient_condition": f"{patient['name']}, {patient['age']}yo {patient['gender']}. Severity: {patient['severity_score']}/100. Symptoms: {patient.get('symptoms', 'Not documented')}.",
            "latest_vitals_summary": "Vitals not available in current data. Please check bedside monitor.",
            "important_medications": med_list,
            "recent_diagnostics": lab_list,
            "pending_tests": "Review lab orders in Diagnostics tab.",
            "pending_operations": ops_list,
            "risk_flags": f"Severity score {patient['severity_score']}/100. " + ("High acuity — monitor closely." if patient['severity_score'] >= 70 else "Moderate acuity."),
            "recommended_followup": "Review by incoming doctor within 30 minutes of handover.",
            "_ai_error": error
        }

    if doctor_id:
        try:
            execute_db(
                "INSERT INTO ai_recommendations (patient_id, doctor_id, rec_type, response) VALUES (?, ?, ?, ?)",
                (patient_id, doctor_id, 'handover', json.dumps(handover_data)[:2000])
            )
        except Exception:
            pass

    return jsonify({
        "handover": handover_data,
        "ai_generated": True,
        "requires_doctor_review": True,
        "disclaimer": "AI Generated — Doctor must review and edit before submitting.",
        "ai_available": error is None
    }), 200


# ── POST /ai/clinical-note ─────────────────────────────────────────────────────
@ai_bp.route('/ai/clinical-note', methods=['POST'])
def ai_clinical_note():
    """
    POST /ai/clinical-note
    Helps structure a rough clinical note into SOAP format.
    Doctor's original text is preserved — AI only suggests structure.
    """
    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')
    raw_note = data.get('raw_note', '').strip()

    if not raw_note:
        return jsonify({"error": "raw_note required"}), 400

    patient = None
    if patient_id:
        patient = query_db("SELECT name, age, gender, department FROM patients WHERE patient_id = ?", (patient_id,), one=True)

    patient_context = ""
    if patient:
        patient_context = f"Patient: {patient['name']}, {patient['age']}yo {patient['gender']}, {patient['department']}."

    prompt = f"""You are a clinical AI assistant helping a doctor structure their notes.
{patient_context}

The doctor wrote:
\"{raw_note}\"

Structure this into SOAP format. Return only valid JSON (no markdown):
{{
  "Subjective": "...",
  "Objective": "...",
  "Assessment": "...",
  "Plan": "..."
}}

If information for a section is not in the note, write "Not specified in note." Do not invent clinical information."""

    ai_response, error = _call_gemini(prompt)

    if not error and ai_response:
        try:
            clean = ai_response.strip()
            if clean.startswith("```"):
                clean = clean[clean.find('{'):clean.rfind('}')+1]
            soap = json.loads(clean)
        except (json.JSONDecodeError, ValueError):
            soap = {"Subjective": ai_response, "Objective": "Not specified", "Assessment": "Not specified", "Plan": "Not specified"}
    else:
        soap = {
            "Subjective": raw_note,
            "Objective": "Not specified in note.",
            "Assessment": "Not specified in note.",
            "Plan": "Not specified in note.",
            "_ai_error": error
        }

    return jsonify({
        "soap": soap,
        "original_note": raw_note,
        "ai_generated": True,
        "disclaimer": "AI suggestion only — do not replace original clinical text without review.",
        "ai_available": error is None
    }), 200


# ── POST /ai/operations-recommendation ────────────────────────────────────────
@ai_bp.route('/ai/operations-recommendation', methods=['POST'])
def ai_operations_recommendation():
    """
    POST /ai/operations-recommendation
    Suggests operational actions based on patient data.
    AI suggestions NEVER automatically execute operations.
    """
    data = request.get_json() or {}
    patient_id = data.get('patient_id')
    doctor_id = data.get('doctor_id')

    if not patient_id:
        return jsonify({"error": "patient_id required"}), 400

    patient, meds, notes, labs = _get_patient_context(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    pending_ops = query_db(
        "SELECT operation_type, status FROM operations WHERE patient_id = ? AND status NOT IN ('Completed','Cancelled') ORDER BY created_at DESC LIMIT 5",
        (patient_id,)
    )

    ops_list = ", ".join([op['operation_type'] for op in pending_ops]) if pending_ops else "None"
    med_list = ", ".join([m['name'] for m in meds]) if meds else "None"

    prompt = f"""You are a clinical AI operations advisor for an emergency hospital system.
Based on the patient data, suggest up to 3 operational actions the doctor should CONSIDER.
You CANNOT and MUST NOT execute any actions — only suggest.

PATIENT: {patient['name']}, {patient['age']}yo {patient['gender']}
DEPARTMENT: {patient['department']} | SEVERITY: {patient['severity_score']}/100
SYMPTOMS: {patient.get('symptoms', 'Not recorded')}
CURRENT MEDS: {med_list}
PENDING OPS: {ops_list}

Return only valid JSON (no markdown):
{{
  "recommendations": [
    {{
      "action": "action_type_from_list",
      "reason": "clinical reasoning in 1-2 sentences",
      "urgency": "Routine|Urgent|Emergency"
    }}
  ],
  "overall_assessment": "1-2 sentence patient status summary"
}}

Available action types: specialist_consult, icu_team, lab_escalation, imaging_priority, oxygen, blood_request, ventilator, deterioration, isolation

Do not recommend actions already pending. Do not invent vitals or lab values."""

    ai_response, error = _call_gemini(prompt)

    if not error and ai_response:
        try:
            clean = ai_response.strip()
            if clean.startswith("```"):
                clean = clean[clean.find('{'):clean.rfind('}')+1]
            result = json.loads(clean)
        except (json.JSONDecodeError, ValueError):
            result = {"recommendations": [], "overall_assessment": ai_response, "_parse_error": True}
    else:
        # Score-based fallback recommendations (no fabricated clinical values)
        recs = []
        score = patient['severity_score']
        if score >= 80:
            recs.append({"action": "icu_team", "reason": "High severity score warrants ICU team review.", "urgency": "Urgent"})
        if score >= 70 and not any(op['operation_type'] == 'imaging_priority' for op in pending_ops):
            recs.append({"action": "imaging_priority", "reason": "Elevated severity may benefit from priority imaging.", "urgency": "Urgent"})
        if score >= 60 and not any(op['operation_type'] == 'specialist_consult' for op in pending_ops):
            recs.append({"action": "specialist_consult", "reason": "Consider specialist review given clinical picture.", "urgency": "Routine"})
        result = {
            "recommendations": recs[:3],
            "overall_assessment": f"Severity score {score}/100. AI narrative unavailable: {error}",
            "_ai_error": error
        }

    if doctor_id:
        try:
            execute_db(
                "INSERT INTO ai_recommendations (patient_id, doctor_id, rec_type, response) VALUES (?, ?, ?, ?)",
                (patient_id, doctor_id, 'operations_recommendation', json.dumps(result)[:2000])
            )
        except Exception:
            pass

    return jsonify({
        **result,
        "ai_generated": True,
        "requires_doctor_authorization": True,
        "disclaimer": "AI suggestions only. Doctor must review and manually initiate any operation.",
        "ai_available": error is None
    }), 200


# ── GET /ai/risk/<patient_id> ──────────────────────────────────────────────────
@ai_bp.route('/ai/risk/<int:patient_id>', methods=['GET'])
def ai_risk(patient_id):
    """
    GET /ai/risk/<patient_id>
    Returns deterioration/sepsis risk estimates based on available data.
    Clearly marked as PROTOTYPE/DEMO estimates, not validated predictions.
    """
    patient = query_db("SELECT * FROM patients WHERE patient_id = ?", (patient_id,), one=True)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404

    score = patient['severity_score']
    
    # Rule-based estimates (no ML model, clearly labelled as estimates)
    deterioration_risk = min(95, int(score * 0.85))
    sepsis_probability = min(80, max(2, int((score - 30) * 0.4))) if score > 30 else 2
    recovery_probability = max(5, min(95, int(100 - (score * 0.7))))

    risk_level = "Critical" if score >= 80 else "High" if score >= 60 else "Moderate" if score >= 40 else "Low"

    return jsonify({
        "patient_id": patient_id,
        "deterioration_risk": deterioration_risk,
        "sepsis_probability": sepsis_probability,
        "recovery_probability": recovery_probability,
        "risk_level": risk_level,
        "severity_score": score,
        "prototype": True,
        "disclaimer": "PROTOTYPE ESTIMATES — Not validated ML model predictions. Based on severity score heuristics only. Do not use for clinical decisions without validated data.",
        "ai_available": _get_gemini_model() is not None
    }), 200
