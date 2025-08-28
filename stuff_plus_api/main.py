from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
from typing import Optional
from model_loader import load_model
from stuffPlusModel import aStuffPlusModel  # must import before loading

import pytesseract
from PIL import Image
import re
import io
from math import erf

# -------------------------------
# App and model setup
# -------------------------------
app = FastAPI(title="Stuff+ API")
model = load_model('stuff_plus_model.pkl')

# -------------------------------
# Input schema
# -------------------------------
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

# -------------------------------
# Helpers
# -------------------------------
def tilt_to_degrees(tilt: str) -> float:
    if not tilt or ":" not in tilt:
        return 180.0
    hour, minute = tilt.split(":")
    hour, minute = int(hour), int(minute)
    total_minutes = (hour % 12) * 60 + minute
    degrees = total_minutes * 0.5
    return (degrees + 180) % 360  # 12:00 = 180

def extract_trackman_metrics(image_bytes):
    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image)

    def get(pattern):
        m = re.search(pattern, text)
        return m.group(1) if m else None

    return {
        "velo": float(get(r"PITCH\s*SPEED\s+([\d.,]+)", flags=re.I).replace(",", "") or 0),
        "ivb": float(get(r"L\.?\s*VERT\.?\s*MOV\s+([-+]?\d+\.?\d*)", flags=re.I) or 0),
        "hb": float(get(r"HORZ\.?\s*MOV\s+([-+]?\d+\.?\d*)", flags=re.I) or 0),

        "release_height": get(r"RELEASE\s+HEIGHT\s+(\d+'\s*\d*\"?)", flags=re.I),
        "release_side": get(r"RELEASE\s+SIDE\s+([-+]?\d+\.?\d*)", flags=re.I),
        "extension": get(r"EXTENSION\s+(\d+'\s*\d*\"?)", flags=re.I),

        "spin": float(get(r"TOTAL\s+SPIN\s+([\d,]+)", flags=re.I).replace(",", "") or 0),
        "tilt": get(r"MEASURED\s*TILT\s+(\d+:\d+)", flags=re.I),
    }

def feet_inches_to_float(s: Optional[str], default=0.0) -> float:
    """
    Convert a string like 6'11" to decimal feet (e.g., 6.92).
    """
    if not s:
        return default
    try:
        # Handle formats like 6'11" or 6'11
        parts = s.replace('"', '').split("'")
        feet = int(parts[0]) if parts[0] else 0
        inches = int(parts[1]) if len(parts) > 1 and parts[1] else 0
        return feet + inches / 12.0
    except Exception:
        return default


# -------------------------------
# Predict endpoint (direct pitch input)
# -------------------------------
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
        p_throws=input.handedness,
        fb_velo=input.fb_velo,
        fb_ivb=input.fb_ivb / 12,
        fb_hmov=(input.fb_hmov * -1) / 12
    )

    percentile = 0.5 * (1 + erf((stuff_plus - 100) / (10 * 2**0.5))) * 100
    percentile = round(percentile, 1)

    return {"stuffPlus": float(stuff_plus), "percentile": float(percentile)}

# -------------------------------
# Upload screenshot endpoint
# -------------------------------
@app.post("/upload_screenshot")
async def upload_screenshot(
    file: UploadFile = File(...),
    pitchType: str = Form(...),
    handedness: str = Form(...),
    fb_velo: Optional[str] = Form(None),
    fb_ivb: Optional[str] = Form(None),
    fb_hmov: Optional[str] = Form(None),
):
    contents = await file.read()
    metrics = extract_trackman_metrics(contents)

    # Safely parse numeric values
    def parse_float(val, default=0):
        try:
            return float(val)
        except (TypeError, ValueError):
            return default

    fb_velo_num = parse_float(fb_velo, metrics["velo"])
    fb_ivb_num = parse_float(fb_ivb, metrics["ivb"])
    fb_hmov_num = parse_float(fb_hmov, metrics["hb"])

    pitch_input = PitchInput(
        pitchType=pitchType,
        release_speed=metrics["velo"],
        handedness=handedness,
        pfx_x=metrics["hb"],
        pfx_z=metrics["ivb"],
        release_extension=feet_inches_to_float(metrics["extension"], 5.5),
        release_spin_rate=metrics["spin"],
        spin_axis=tilt_to_degrees(metrics["tilt"]) if metrics["tilt"] else 180.0,
        release_pos_x=feet_inches_to_float(metrics["release_side"], -1.5),
        release_pos_z=feet_inches_to_float(metrics["release_height"], 5.5),
        fb_velo=fb_velo_num,
        fb_ivb=fb_ivb_num,
        fb_hmov=fb_hmov_num
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
        "pitchType": pitchType,
        "handedness": handedness,
        "fb_reference": {
            "velo": fb_velo_num,
            "ivb": fb_ivb_num,
            "hmov": fb_hmov_num
        },
        "stuffPlus": float(stuff_plus),
        "percentile": float(percentile)
    }
