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

    def _build_system_ctx(self, context: Any) -> str:
        """Serialise the advisory context into a compact system preamble."""
        if not isinstance(context, dict):
            return str(context)
        disease = context.get('disease', 'Unknown')
        plant   = context.get('plant', 'Unknown plant')
        sev     = context.get('severity', {}).get('category', 'unknown')
        sev_pct = context.get('severity', {}).get('percentage', 0)
        risk    = context.get('weather', {}).get('risk_level', 'unknown')
        actions = context.get('advisory', {}).get('actions', '')
        summary = context.get('advisory', {}).get('summary', '')
        return (
            f"Crop situation\n"
            f"  Plant: {plant}\n"
            f"  Disease detected: {disease}\n"
            f"  Severity: {sev} ({sev_pct:.0f}% of leaf affected)\n"
            f"  Environmental risk: {risk}\n"
            f"  Summary: {summary}\n"
            f"  Recommended actions: {actions}\n"
        )

    def chat_with_history(
        self,
        context: Any,
        user_question: str,
        history: list[dict] | None = None,
    ) -> str:
        """Multi-turn conversational chat keeping the full session history."""
        if not self.is_available():
            return self._fallback_chat(context, user_question)

        system_ctx = self._build_system_ctx(context)
        system_instruction = (
            f"{SYSTEM_PROMPT}\n"
            "You are a specialist in plant diseases, soil health, and sustainable farming. "
            "You have already analysed this farmer's crop and will now answer follow-up questions. "
            "Keep answers practical, concise, and friendly. Use markdown-like formatting "
            "(**bold**, bullet points) where helpful.\n\n"
            f"— Current crop context —\n{system_ctx}"
        )

        # Convert frontend history [{role, content}, ...] to Gemini format
        gemini_history: list[dict] = []
        for msg in (history or []):
            role = "user" if msg.get("role") == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

        while self.client is not None:
            try:
                # Re-create model with system instruction for multi-turn
                model = genai.GenerativeModel(
                    self.model_candidates[self.current_model_index],
                    system_instruction=system_instruction,
                )
                chat_session = model.start_chat(history=gemini_history)
                response = chat_session.send_message(user_question)
                return (response.text or "").strip()
            except Exception:
                self.current_model_index += 1
                self.client = self._new_client_from_candidates()

        return self._fallback_chat(context, user_question)

    def chat_with_context(self, context: Any, user_question: str) -> str:
        """Single-turn convenience wrapper (kept for backward compat)."""
        return self.chat_with_history(context, user_question, history=[])
