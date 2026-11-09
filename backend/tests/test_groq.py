import asyncio
import os
import sys
import platform
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend root is on python path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Load backend/.env
env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)

try:
    import importlib.metadata
    GROQ_SDK_VERSION = importlib.metadata.version("groq")
except Exception:
    GROQ_SDK_VERSION = "unknown"

from app.services.llm_service import llm_service
from groq import (
    AuthenticationError,
    RateLimitError,
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
)

def print_environment_info():
    print("-" * 65)
    print(f"[*] Python Runtime   : {platform.python_version()} ({platform.system()} {platform.release()})")
    print(f"[*] Groq SDK Version : {GROQ_SDK_VERSION}")
    print("-" * 65)

async def run_groq_test():
    print("\n" + "=" * 65)
    print(" Groq LLM Inference & Memory-Grounded Support Test")
    print("=" * 65)

    print_environment_info()

    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    if not api_key:
        print("\n[ERROR] GROQ_API_KEY is not set.")
        print(f"Please configure GROQ_API_KEY in: {env_path}")
        print("Expected format: GROQ_API_KEY=gsk_...")
        sys.exit(1)

    masked_key = f"{api_key[:3]}...{api_key[-3:]}" if len(api_key) > 6 else "***"
    print(f"[*] Target Model    : {model}")
    print(f"[*] API Key Status  : Loaded successfully ({masked_key})")
    print(f"[*] Client Timeout  : 60.0s")

    # Define synthetic customer support query and synthetic Hindsight memory facts
    synthetic_customer_message = (
        "Hello, I am following up on the damaged monitor that arrived earlier today. "
        "Can you confirm whether I am getting a replacement or a refund, and how you will update me?"
    )

    synthetic_recalled_memories = [
        "Customer contacted support regarding monitor arriving with cracked exterior bezel.",
        "Customer explicitly stated preference for an expedited replacement rather than a refund.",
        "Customer stated strict communication preference: Email updates only, no phone calls.",
        "Hardware fulfillment team has been notified to inspect warehouse serial numbers for replacement.",
    ]

    print("\n" + "-" * 65)
    print(" [INPUT CONTEXT TO GROQ]")
    print("-" * 65)
    print("Customer Message:")
    print(f"  \"{synthetic_customer_message}\"")
    print("\nRecalled Hindsight Long-Term Memories:")
    for mem in synthetic_recalled_memories:
        print(f"  • {mem}")

    print("\n[INFO] Calling Groq API via AsyncGroq with grounding instructions...")

    try:
        result = await asyncio.wait_for(
            llm_service.generate_support_response(
                customer_message=synthetic_customer_message,
                recalled_memories=synthetic_recalled_memories,
                temperature=0.2,
                max_tokens=600,
            ),
            timeout=60.0,
        )

        response_text = result["response"]
        tokens = result.get("tokens_used", {})
        escalation = result.get("escalation_recommended", False)

        print("\n" + "=" * 65)
        print(" ACTUAL GENERATED GROQ MODEL RESPONSE")
        print("=" * 65)
        print(response_text)
        print("\n" + "-" * 65)
        print(" [INFERENCE METRICS & METADATA]")
        print("-" * 65)
        print(f"[*] Model Used          : {result['model_used']}")
        print(f"[*] Escalation Flagged  : {escalation}")
        if tokens:
            print(f"[*] Prompt Tokens       : {tokens.get('prompt_tokens', 'N/A')}")
            print(f"[*] Completion Tokens   : {tokens.get('completion_tokens', 'N/A')}")
            print(f"[*] Total Tokens        : {tokens.get('total_tokens', 'N/A')}")

        print("\n[SUCCESS] Groq LLM integration verified with real API call!")
        return True

    except AuthenticationError as e:
        print("\n[FAILURE: HTTP 401 UNAUTHORIZED]")
        print("Invalid GROQ_API_KEY. Please verify the key in backend/.env.")
        print(f"Details: {e}")
        return False

    except RateLimitError as e:
        print("\n[FAILURE: HTTP 429 RATE LIMIT EXCEEDED]")
        print("Groq API rate limit reached. Please wait a moment or check quota.")
        print(f"Details: {e}")
        return False

    except APITimeoutError as e:
        print("\n[FAILURE: REQUEST TIMEOUT]")
        print("Groq request timed out.")
        print(f"Details: {e}")
        return False

    except APIConnectionError as e:
        print("\n[FAILURE: NETWORK / CONNECTION ERROR]")
        print("Could not establish connection to Groq API servers.")
        print(f"Details: {e}")
        return False

    except APIStatusError as e:
        print(f"\n[FAILURE: HTTP {e.status_code} API STATUS ERROR]")
        print(f"Details: {e.message}")
        return False

    except Exception as e:
        print(f"\n[FAILURE: UNEXPECTED ERROR: {type(e).__name__}]")
        print(f"Details: {e}")
        return False

    finally:
        await llm_service.close()

if __name__ == "__main__":
    success = asyncio.run(run_groq_test())
    if not success:
        sys.exit(1)
