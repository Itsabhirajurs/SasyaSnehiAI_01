"""LLM-powered translation and follow-up chat service."""

from typing import Any

import google.generativeai as genai


SYSTEM_PROMPT = "You are an agricultural advisor. Explain clearly for a farmer."


class LLMService:
    """Handles multilingual explanation and contextual chat."""

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.client = None
        if api_key:
            genai.configure(api_key=api_key)
            self.client = genai.GenerativeModel(model_name)

    def _generate(self, prompt: str) -> str:
        if not self.client:
            return "LLM service unavailable. Configure GEMINI_API_KEY for multilingual and chat support."
        response = self.client.generate_content(prompt)
        return (response.text or "").strip()

    def translate_text(self, text: str, language: str) -> str:
        if not text or language == "English":
            return text
        prompt = (
            f"{SYSTEM_PROMPT}\n"
            f"Translate the following agricultural advisory text into {language}. "
            "Keep it simple and practical for farmers.\n\n"
            f"Text:\n{text}"
        )
        output = self._generate(prompt)
        return output if output else text

    def chat_with_context(self, context: Any, user_question: str) -> str:
        prompt = (
            f"{SYSTEM_PROMPT}\n"
            "Use the context and answer the farmer question with practical steps."
            "If a language is requested in context, answer in that language.\n\n"
            f"Context:\n{context}\n\n"
            f"Farmer Question:\n{user_question}"
        )
        return self._generate(prompt)
