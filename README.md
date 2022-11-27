# Start Python Server
uvicorn main:app --reload
<br><br>
# API Endpoints <br>
### POST /video
Body:<br>
{<br>
	"video_name" : "funnycats.mp4"<br>
}<br>
<br>
http://localhost:8000/video
