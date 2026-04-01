import json
from openai import OpenAI
from src.core.config import settings

class LlmClient:
    """
    Isolated AI orchestrator interacting precisely with OpenAIs REST endpoints.
    """
    def __init__(self):
        # Configure the OpenAI client to hit the Gemini OpenAI-compatible endpoint
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

    def analyze_document_text(self, text: str) -> dict:
        prompt = (
            "You are an expert document analysis system. "
            "Analyze the following text and return a strict JSON object with exactly these keys:\n"
            '- "summary": A concise summary string of the document.\n'
            '- "extracted_keywords": A list of relevant keyword strings.\n'
            '- "confidence_score": A float between 0.0 and 1.0 representing your statistical confidence in this extraction.\n\n'
            f"--- DOCUMENT TEXT ---\n{text}\n--- END DOCUMENT TEXT ---"
        )

        response = self.client.chat.completions.create(
            model="gemini-2.5-flash",  # More cost-efficient model for summarization tasks
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system", 
                    "content": "You are a specialized background analytical engine. Always resolve strict parsed JSON formats exclusively."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ]
        )

        content = response.choices[0].message.content
        if not content:
            raise ValueError("OpenAI returned an empty response.")
            
        parsed_json = json.loads(content)
        total_tokens = response.usage.total_tokens if response.usage else 0

        return {
            "analysis": parsed_json,
            "total_tokens": total_tokens
        }
