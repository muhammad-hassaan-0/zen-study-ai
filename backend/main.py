import json
import os
from typing import Any, Dict, List

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from pydantic import BaseModel, Field

load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",") if origin.strip()] or ["*"]
MAX_TOTAL_SIZE_BYTES = 100 * 1024 * 1024

app = FastAPI(title="Smart Study Scanner", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_api_key_present() -> None:
    if not API_KEY:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY is not configured.")


def parse_model_response(raw_text: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse model response.")

    expected_defaults: Dict[str, Any] = {
        "original_text": "",
        "summary": [],
    }

    for key, default_value in expected_defaults.items():
        parsed.setdefault(key, default_value)

    if not isinstance(parsed["summary"], list):
        parsed["summary"] = [str(parsed["summary"])] if parsed["summary"] else []

    return parsed


def parse_mcq_response(raw_text: str) -> Dict[str, Any]:
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse MCQ response.")

    expected_defaults: Dict[str, Any] = {
        "mcqs": [],
        "answer_key": [],
    }
    for key, default_value in expected_defaults.items():
        parsed.setdefault(key, default_value)

    if not isinstance(parsed["mcqs"], list):
        parsed["mcqs"] = []
    if not isinstance(parsed["answer_key"], list):
        parsed["answer_key"] = []

    return parsed


class McqRequest(BaseModel):
    original_text: str = Field(default="")
    summary: List[str] = Field(default_factory=list)
    count: int = Field(ge=1, le=20)


@app.get("/")
async def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/process")
async def process_images(files: List[UploadFile] = File(...)) -> JSONResponse:
    ensure_api_key_present()

    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    parts: List[Any] = []
    total_size = 0
    for upload in files:
        if not upload.content_type or not upload.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Please upload only image files.")

        try:
            image_bytes = await upload.read()
        except Exception as exc:  # pragma: no cover - defensive
            raise HTTPException(status_code=400, detail="Unable to read one of the uploaded files.") from exc

        if not image_bytes:
            raise HTTPException(status_code=400, detail="One of the uploaded files is empty.")

        total_size += len(image_bytes)
        if total_size > MAX_TOTAL_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Total upload size exceeds 100 MB.")

        parts.append({"mime_type": upload.content_type, "data": image_bytes})

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = (
        "You are an expert OCR and study summarizer. Read all uploaded images and treat them as one study input. "
        "Perform OCR accurately. Respond strictly with JSON only, using this schema: "
        "{\"original_text\": string, \"summary\": array of 3-8 concise bullet strings}."
    )

    try:
        response = model.generate_content(
            [prompt, *parts],
            generation_config={"response_mime_type": "application/json"},
        )
    except Exception as exc:  # pragma: no cover - external service call
        raise HTTPException(status_code=502, detail=f"Model error: {exc}") from exc

    if not response or not getattr(response, "text", None):
        raise HTTPException(status_code=502, detail="Empty response from the model.")

    parsed = parse_model_response(response.text)
    return JSONResponse(content=parsed)


@app.post("/generate-mcq")
async def generate_mcq(payload: McqRequest) -> JSONResponse:
    ensure_api_key_present()

    source_text = payload.original_text.strip()
    summary_text = "\n".join([f"- {item}" for item in payload.summary if str(item).strip()])
    if not source_text and not summary_text:
        raise HTTPException(status_code=400, detail="Provide original_text or summary to generate MCQs.")

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = (
        "Create high-quality multiple-choice questions from the provided study content. "
        f"Generate exactly {payload.count} questions. Return strict JSON only with this schema: "
        "{\"mcqs\": [{\"question\": string, \"options\": [string, string, string, string], \"answer\": string}], "
        "\"answer_key\": [{\"number\": integer, \"answer\": string}]}. "
        "The answer in each mcqs item must exactly match one option. Keep language clear and concise."
    )

    try:
        response = model.generate_content(
            [
                prompt,
                "Original text:\n" + source_text,
                "Summary bullets:\n" + summary_text,
            ],
            generation_config={"response_mime_type": "application/json"},
        )
    except Exception as exc:  # pragma: no cover - external service call
        raise HTTPException(status_code=502, detail=f"Model error: {exc}") from exc

    if not response or not getattr(response, "text", None):
        raise HTTPException(status_code=502, detail="Empty response from the model.")

    parsed = parse_mcq_response(response.text)
    return JSONResponse(content=parsed)
