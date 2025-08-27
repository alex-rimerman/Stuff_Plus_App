from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from model_loader import load_model
from stuffPlusModel import aStuffPlusModel  # must import before loading


import pytesseract
from PIL import Image
import re
import io
from math import erf

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

# ===== OCR helper for TrackMan screenshots =====
def extract_trackman_metrics(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image)

    def get(pattern):
        m = re.search(pattern, text)
        return m.group(1) if m else None

    return {
        "velo": float(get(r"PITCH SPEED\s+([\d.]+)") or 0),
        "ivb": float(get(r"L\. VERT\. MOV\s+([\d.]+)") or 0),
        "hb": float(get(r"HORZ\. MOV\s+([-+]?\d+\.?\d*)") or 0),
        "release_height": get(r"RELEASE HEIGHT\s+([\d']+)"),
        "release_side": get(r"RELEASE SIDE\s+([-+]?\d+)"),
        "extension": get(r"EXTENSION\s+([\d']+)"),
        "spin": float(get(r"TOTAL SPIN\s+([\d.]+)") or 0),
        "active_spin": float(get(r"ACTIVE SPIN\s+([\d.]+)") or 0),
        "efficiency": float(get(r"EFFICIENCY\s+([\d.]+)") or 0),
    }


# ===== New endpoint for screenshot upload =====
@app.post("/upload_screenshot/")
async def upload_screenshot(file: UploadFile = File(...)):
    contents = await file.read()
    metrics = extract_trackman_metrics(contents)

    # ⚠️ Example mapping from TrackMan → your PitchInput schema
    pitch_input = PitchInput(
        pitchType="FF",  # Could add detection later
        release_speed=metrics["velo"],
        handedness="R",  # Assume R for now, could be selectable
        pfx_x=metrics["hb"],  # in inches
        pfx_z=metrics["ivb"],  # in inches
        release_extension=float(metrics["extension"].replace("'", "")) if metrics["extension"] else 5.5,
        release_spin_rate=metrics["spin"],
        spin_axis=180.0,  # TrackMan tilt not OCR’d reliably → placeholder
        release_pos_x=float(metrics["release_side"].replace('"', "")) / 12 if metrics["release_side"] else -1.5,
        release_pos_z=float(metrics["release_height"].replace("'", "")) if metrics["release_height"] else 5.5,
        fb_velo=metrics["velo"],  # use this pitch as fb for now
        fb_ivb=metrics["ivb"],
        fb_hmov=metrics["hb"]
    )

    stuff_plus = model.predict_single_pitch(
        pitch_type=pitch_input.pitchType,
        release_speed=pitch_input.release_speed,
        pfx_x=(pitch_input.pfx_x * -1) / 12,
        pfx_z=pitch_input.pfx_z / 12,
        release_extension=pitch_input.release_extension,
        release_spin_rate=pitch_input.release_spin_rate,
        spin_axis=pitch_input.spin_axis,
        release_pos_x=pitch_input.release_pos_x * -1,
        release_pos_z=pitch_input.release_pos_z,
        p_throws=pitch_input.handedness,
        fb_velo=pitch_input.fb_velo,
        fb_ivb=pitch_input.fb_ivb / 12,
        fb_hmov=(pitch_input.fb_hmov * -1) / 12
    )

    percentile = 0.5 * (1 + erf((stuff_plus - 100) / (10 * 2**0.5))) * 100
    percentile = round(percentile, 1)

    return {
        "parsed_metrics": metrics,
        "stuffPlus": float(stuff_plus),
        "percentile": float(percentile)
    }
