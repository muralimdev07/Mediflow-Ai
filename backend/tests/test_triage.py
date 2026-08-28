from app.ml.triage_model import TriageModel

def test_triage_model_prediction():
    model = TriageModel()
    
    # Severe chest pain -> should be high priority (P1 or P2)
    res_cardiac = model.predict("Severe crushing chest pain", "Radiating to left arm, sweating")
    assert res_cardiac["predicted_level"] in ["P1", "P2"]
    
    # Minor throat ache -> should be low priority (P4 or P5)
    res_minor = model.predict("Sore throat", "Mild discomfort for 2 days")
    assert res_minor["predicted_level"] in ["P4", "P5"]
