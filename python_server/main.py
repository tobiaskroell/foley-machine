from fastapi import FastAPI, Request
import pdb
import os
from yolov5 import detect

app = FastAPI()


@app.post("/video")
async def video(req_body: Request):
    data = await req_body.json()
    filename = data['filename']
    total_frames = data['total_frames']

    # Change directory to yolov5
    if not os.getcwd().endswith("yolov5"):
        os.chdir(os.getcwd() + "/yolov5/")

    detections_dict = detect.detect_objects(filename, 100)

    return {
        "status": "SUCCESS",
        "data": detections_dict
    }
