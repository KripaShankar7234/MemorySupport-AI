import os
import sys
import re
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)

from groq import Groq, AuthenticationError, APIConnectionError

def update_env_file(selected_model: str):
    """Updates GROQ_MODEL in backend/.env without altering other keys or exposing secrets."""
    if not env_path.exists():
        print(f"[!] {env_path} not found; skipping .env update.")
        return

    content = env_path.read_text(encoding="utf-8")
    if re.search(r"^GROQ_MODEL=.*$", content, flags=re.MULTILINE):
        new_content = re.sub(
            r"^GROQ_MODEL=.*$",
            f"GROQ_MODEL={selected_model}",
            content,
            flags=re.MULTILINE,
        )
    else:
        new_content = content + f"\nGROQ_MODEL={selected_model}\n"

    env_path.write_text(new_content, encoding="utf-8")
    print(f"[+] Updated backend/.env with: GROQ_MODEL={selected_model}")

def list_and_select_model():
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        print("[ERROR] GROQ_API_KEY is not set in backend/.env")
        sys.exit(1)

    masked_key = f"{api_key[:3]}...{api_key[-3:]}" if len(api_key) > 6 else "***"
    print("=" * 60)
    print(" Active Groq Model Discovery & Selection")
    print(f" API Key: {masked_key}")
    print("=" * 60)

    try:
        client = Groq(api_key=api_key, timeout=30.0)
        models_data = client.models.list()
        
        # Extract active model IDs
        model_ids = sorted([
            m.id for m in models_data.data 
            if hasattr(m, "id") and getattr(m, "active", True)
        ])
        
        print(f"\n[+] Discovered {len(model_ids)} Active Groq Models:\n")
        for mid in model_ids:
            print(f"    • {mid}")

        # Selection Priority per instructions:
        # 1. openai/gpt-oss-120b
        # 2. openai/gpt-oss-20b
        # 3. llama-3.1-8b-instant
        # 4. First available text-generation model
        selected_model = None
        if "openai/gpt-oss-120b" in model_ids:
            selected_model = "openai/gpt-oss-120b"
            reason = "Priority 1: openai/gpt-oss-120b found"
        elif "openai/gpt-oss-20b" in model_ids:
            selected_model = "openai/gpt-oss-20b"
            reason = "Priority 2: openai/gpt-oss-20b found"
        elif "llama-3.1-8b-instant" in model_ids:
            selected_model = "llama-3.1-8b-instant"
            reason = "Priority 3: llama-3.1-8b-instant found"
        elif "llama3-8b-8192" in model_ids:
            selected_model = "llama3-8b-8192"
            reason = "Fallback: llama3-8b-8192 found"
        elif model_ids:
            selected_model = model_ids[0]
            reason = f"Fallback: first active model ({selected_model})"
        else:
            print("\n[ERROR] No active models returned from Groq account.")
            sys.exit(1)

        print("\n" + "=" * 60)
        print(f"[*] SELECTED MODEL : {selected_model}")
        print(f"[*] SELECTION RULE : {reason}")
        print("=" * 60)

        # Update backend/.env automatically
        update_env_file(selected_model)
        return selected_model, model_ids

    except AuthenticationError:
        print("\n[ERROR] Authentication failed: Invalid GROQ_API_KEY in backend/.env")
        sys.exit(1)
    except APIConnectionError as e:
        print(f"\n[ERROR] Connection to Groq failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error listing models: {e}")
        sys.exit(1)

if __name__ == "__main__":
    list_and_select_model()
