from fastapi import FastAPI, Request
import model
app = FastAPI()

@app.post("/video")
async def video(req_body : Request):
    filename = await req_body.json()
    print(filename)

    return {
        "status" : "SUCCESS",
        "data" : filename
    }