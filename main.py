from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from g4f.client import Client

app = FastAPI()

# Add CORS middleware
app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/dist", StaticFiles(directory="dist"), name="dist")

# Initialize G4F client
client = Client()

class ImagePrompt(BaseModel):
	prompt: str

@app.get("/")
def read_root():
	return FileResponse("static/index.html")

@app.post("/generate-image")
def generate_image(prompt_data: ImagePrompt):
	try:
		response = client.images.generate(
			model="flux",
			prompt=prompt_data.prompt,
			response_format="url"
		)
		return {"success": True, "image_url": response.data[0].url}
	except Exception as e:
		return {"success": False, "error": str(e)}

if __name__ == "__main__":
	import uvicorn
	uvicorn.run(app, host="127.0.0.1", port=8000)
