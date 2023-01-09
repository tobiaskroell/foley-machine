from fastapi import FastAPI, Request
import pdb
import os, sys
from pathlib import Path

app = FastAPI()

from yolov5 import detect

@app.post("/video")
async def video(req_body: Request):
    data = await req_body.json()
    filepath = data['filepath']
    # total_frames = data['total_frames']
    
    # Change directory to yolov5
    if not os.getcwd().endswith("yolov5"):
        os.chdir(os.getcwd() + "/yolov5/")

    detections_dict = detect.detect_objects(filepath, conf_thres=0.5, vid_stride=60)

    return {
        "status": "SUCCESS",
        "data": detections_dict
    }

# if __name__ == "__main__":
#     detect.detect_objects('animals.mp4', 6572)