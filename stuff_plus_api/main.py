from fastapi import FastAPI
from pydantic import BaseModel
from model_loader import load_model
from stuffPlusModel import aStuffPlusModel  # must import before loading

app = FastAPI(title="Stuff+ API")


model = load_model('stuff_plus_model.pkl')

# Input schema
class PitchInput(BaseModel):
    pitchType: str
    release_speed: float
    handedness: str
    pfx_x: float
    pfx_z: float
    release_extension: float
    release_spin_rate: float
    spin_axis: float
    release_pos_x: float
    release_pos_z: float
    fb_velo: float
    fb_ivb: float
    fb_hmov: float

@app.post("/predict")
def predict(input: PitchInput):
    stuff_plus = model.predict_single_pitch(
        pitch_type=input.pitchType,
        release_speed=input.release_speed,
        pfx_x=(input.pfx_x * -1) / 12,
        pfx_z=input.pfx_z / 12,
        release_extension=input.release_extension,
        release_spin_rate=input.release_spin_rate,
        spin_axis=input.spin_axis,
        release_pos_x=input.release_pos_x * -1,
        release_pos_z=input.release_pos_z,
        p_throws=input.handedness,             # default or add to schema
        fb_velo=input.fb_velo,
        fb_ivb=input.fb_ivb / 12,
        fb_hmov=(input.fb_hmov * -1) / 12
    )

    from math import erf

    percentile = 0.5 * (1 + erf((stuff_plus - 100) / (10 * 2**0.5))) * 100
    percentile = round(percentile, 1)

    return {"stuffPlus": float(stuff_plus), "percentile": float(percentile)}
