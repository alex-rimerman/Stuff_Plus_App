import joblib
from stuffPlusModel import aStuffPlusModel
import sys

class ModelWrapper(aStuffPlusModel):
    """Wrapper class to maintain compatibility"""
    pass

def load_model(path):
    try:
        # Temporarily add current class to __main__
        import __main__
        setattr(__main__, 'aStuffPlusModel', aStuffPlusModel)
        
        # Load the model
        model = joblib.load(path)
        
        # Clean up
        delattr(__main__, 'aStuffPlusModel')
        
        return model
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        raise