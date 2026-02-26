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
        self.model_candidates: list[str] = []
        self.current_model_index = 0
        if api_key:
            genai.configure(api_key=api_key)
            self.model_candidates = self._build_candidates(model_name)
            self.client = self._new_client_from_candidates()

    @staticmethod
    def _supports_generate_content(model: object) -> bool:
        methods = getattr(model, "supported_generation_methods", []) or []
        return "generateContent" in methods

    def _build_candidates(self, preferred_model: str) -> list[str]:
        candidates: list[str] = [preferred_model]

        try:
            for model in genai.list_models():
                model_name = getattr(model, "name", "")
                if model_name and self._supports_generate_content(model):
                    candidates.append(model_name)
        except Exception:
            pass

        fallback_candidates = [
            "models/gemini-2.0-flash",
            "models/gemini-1.5-flash-latest",
            "models/gemini-1.5-flash",
            "models/gemini-1.5-pro",
        ]
        candidates.extend(fallback_candidates)

        seen = set()
        ordered = []
        for candidate in candidates:
            name = (candidate or "").strip()
            if not name or name in seen:
                continue
            seen.add(name)
            ordered.append(name)
        return ordered

    def _new_client_from_candidates(self):
        while self.current_model_index < len(self.model_candidates):
            name = self.model_candidates[self.current_model_index]
            try:
                return genai.GenerativeModel(name)
            except Exception:
                self.current_model_index += 1
        return None

    def is_available(self) -> bool:
        return self.client is not None

    def _generate(self, prompt: str) -> str:
        if not self.client:
            return ""

        while self.client is not None:
            try:
                response = self.client.generate_content(prompt)
                return (response.text or "").strip()
            except Exception:
                self.current_model_index += 1
                self.client = self._new_client_from_candidates()

        return ""

    def translate_text(self, text: str, language: str) -> str:
        if not text or language == "English":
            return text
        if not self.is_available():
            return text
        prompt = (
            f"{SYSTEM_PROMPT}\n"
            f"Translate the following agricultural advisory text into {language}. "
            "Keep it simple and practical for farmers.\n\n"
            f"Text:\n{text}"
        )
        output = self._generate(prompt)
        return output if output else text

    @staticmethod
    def _fallback_chat(context: Any, user_question: str) -> str:
        if not isinstance(context, dict):
            return (
                "AI chat is running in offline fallback mode. "
                "Please share crop name, symptoms, and watering pattern for better guidance."
            )

        disease = context.get("disease", "Unknown disease")
        severity = context.get("severity", {}).get("category", "Unknown")
        risk_level = context.get("weather", {}).get("risk_level", "Unknown")
        actions = context.get("advisory", {}).get("actions", "Monitor crop and follow hygiene practices.")

        return (
            "AI chat is in offline fallback mode (no GEMINI_API_KEY configured). "
            f"Current case: {disease}, severity: {severity}, environmental risk: {risk_level}. "
            f"Recommended action: {actions} "
            f"Follow-up question received: '{user_question}'. "
            "For multilingual conversational responses, add GEMINI_API_KEY in .env and restart the app."
        )

    def chat_with_context(self, context: Any, user_question: str) -> str:
        if not self.is_available():
            return self._fallback_chat(context, user_question)
        prompt = (
            f"{SYSTEM_PROMPT}\n"
            "Use the context and answer the farmer question with practical steps."
            "If a language is requested in context, answer in that language.\n\n"
            f"Context:\n{context}\n\n"
            f"Farmer Question:\n{user_question}"
        )
        return self._generate(prompt)
