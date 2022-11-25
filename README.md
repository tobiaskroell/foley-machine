# Python Server Starten 
uvicorn main:app --reload

# POST /video
Body:<br>
{<br>
	"video_name" : "funnycats.mp4"<br>
}<br>
<br>
http://localhost:8000/video
