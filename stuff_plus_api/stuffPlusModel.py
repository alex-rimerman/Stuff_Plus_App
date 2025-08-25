# website_info/modeling/aStuffPlusModel.py

import xgboost as xgb
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

class aStuffPlusModel:
    def __init__(self):
        self.model = xgb.XGBRegressor()
        self.scaler = StandardScaler()

    def predict_stuff_plus(self, X):
        preds = self.model.predict(X)
        scaled_preds = (preds - self.scaler.mean_[0]) / self.scaler.scale_[0]
        stuff_plus = 100 + (scaled_preds * 10)
        return stuff_plus

    def predict_single_pitch(self,
                             pitch_type,
                             release_speed,
                             pfx_x,
                             pfx_z,
                             release_extension,
                             release_spin_rate,
                             spin_axis,
                             release_pos_x,
                             release_pos_z,
                             p_throws,
                             fb_velo,
                             fb_ivb,
                             fb_hmov):
        velo_diff = release_speed - fb_velo
        ivb_diff = pfx_z - fb_ivb
        hmov_diff = pfx_x - fb_hmov
        adj_hmov = -pfx_x if p_throws == 'L' else pfx_x
        adj_release_x = -release_pos_x if p_throws == 'L' else release_pos_x
        adj_spin_axis = 360 - spin_axis if p_throws == 'L' else spin_axis

        df_single = pd.DataFrame([{
            'release_speed': release_speed,
            'pfx_z': pfx_z,
            'adj_hmov': adj_hmov,
            'release_spin_rate': release_spin_rate,
            'adj_spin_axis': adj_spin_axis,
            'release_extension': release_extension,
            'release_pos_z': release_pos_z,
            'adj_release_x': adj_release_x,
            'velo_diff': velo_diff,
            'ivb_diff': ivb_diff,
            'hmov_diff': hmov_diff,
            'pitch_type': pitch_type
        }])
        df_single['pitch_type'] = df_single['pitch_type'].astype('category')
        return self.predict_stuff_plus(df_single)[0]
