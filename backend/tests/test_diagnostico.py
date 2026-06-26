"""Backend tests for Clarisa diagnostico submission flow.

Validates POST /api/diagnostico saves to MongoDB and GET /api/diagnosticos
returns the persisted record, plus that the model no longer requires p20.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://recursos-sandbox.preview.emergentagent.com').rstrip('/')


def _build_payload(email: str) -> dict:
    return {
        "nombre_completo": "TEST QA Tester",
        "email": email,
        "telefono": "1234-5678",
        "organizacion": "TEST Empresa Demo",
        "puesto": "Director Financiero",
        "pais": "Costa Rica",
        "departamento": "Finanzas/Contabilidad",
        "anios_experiencia": "De 5 a 7 años",
        "p1_sector": "Servicios financieros (bancos, aseguradoras, cooperativas)",
        "p2_tamano": "200-500 empleados",
        "p3_motivacion": "Requerimiento regulatorio actual o próximo",
        "p4_plazo": "Próximos 3-6 meses",
        "p5_publica_info": "Sí, informe anual",
        "p6_materialidad": "No",
        "p7_familiaridad": "Conocemos los conceptos",
        "p8_riesgos_clima": "Parcialmente",
        "p9_huella_carbono": "Alcance 1 y 2",
        "p10_liderazgo": "Dirección General o Gerencia General directamente",
        "p11_junta": "Sí, hay comité específico y reportes regulares",
        "p12_personas_dedicadas": "1-2 personas con dedicación completa",
        "p13_presupuesto": "Sí, presupuesto aprobado para año calendario",
        "p14_recopilacion": "Manual",
        "p15_control_interno": "Sí",
        "p16_datos_auditables": "Parcialmente",
        "p17_rastreo_impacto": "No",
        "p18_obstaculo": "No sabemos por dónde empezar o cómo priorizar",
        "p19_apoyo_valioso": [
            "Diagnóstico de brechas y hoja de ruta clara",
            "Capacitación práctica del equipo interno",
        ],
        "scoring": {
            "urgencia": {"puntos": 15, "nivel": "Alta", "categoria": "urgencia"},
            "madurez": {"puntos": 10, "nivel": "Media", "categoria": "madurez"},
            "capacidad": {"puntos": 12, "nivel": "Media", "categoria": "capacidad"},
            "arquetipo": {
                "codigo": "AT-1",
                "nombre": "Pionero estratégico",
                "descripcion": "Lidera con visión clara.",
                "recomendacion": "Acelerar implementación NIIF S1/S2.",
            },
        },
    }


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_api_root(session):
    r = session.get(f"{BASE_URL}/api/")
    assert r.status_code == 200, r.text
    assert "Clarisa" in r.json().get("message", "")


def test_submit_diagnostico_persists_and_listed(session):
    email = f"TEST_{uuid.uuid4().hex[:8]}@empresademo.com"
    payload = _build_payload(email)

    # POST
    r = session.post(f"{BASE_URL}/api/diagnostico", json=payload)
    assert r.status_code == 200, f"POST failed: {r.status_code} {r.text}"
    body = r.json()
    assert "id" in body and isinstance(body["id"], str)
    assert body["scoring"]["arquetipo"]["codigo"] == "AT-1"
    diag_id = body["id"]

    # GET single
    r2 = session.get(f"{BASE_URL}/api/diagnostico/{diag_id}")
    assert r2.status_code == 200
    fetched = r2.json()
    assert fetched["email"] == email
    assert fetched["organizacion"] == "TEST Empresa Demo"
    assert "p20_inversion" not in fetched  # confirm P20 removed
    assert "_id" not in fetched  # ObjectId excluded

    # GET list - must contain new record
    r3 = session.get(f"{BASE_URL}/api/diagnosticos")
    assert r3.status_code == 200
    all_diags = r3.json()
    assert isinstance(all_diags, list)
    emails = [d.get("email") for d in all_diags]
    assert email in emails


def test_submit_rejects_missing_required(session):
    # Missing required p2_tamano
    payload = _build_payload(f"TEST_{uuid.uuid4().hex[:6]}@empresademo.com")
    payload.pop("p2_tamano")
    r = session.post(f"{BASE_URL}/api/diagnostico", json=payload)
    assert r.status_code == 422


def test_submit_ignores_extra_p20_field(session):
    # Backend should ignore extra p20_inversion field (model doesn't include it)
    payload = _build_payload(f"TEST_{uuid.uuid4().hex[:6]}@empresademo.com")
    payload["p20_inversion"] = "$50,000"  # extra field
    r = session.post(f"{BASE_URL}/api/diagnostico", json=payload)
    # Pydantic by default ignores extras -> should still succeed
    assert r.status_code == 200, r.text
