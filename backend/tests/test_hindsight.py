import asyncio
import os
import sys
import platform
import socket
from pathlib import Path
from dotenv import load_dotenv

# Set Windows Selector event loop policy if on Windows to mitigate Proactor WinError 64
if sys.platform == "win32":
    try:
        # SelectorEventLoop is often significantly more resilient against IOCP WinError 64 socket drops
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

# Ensure backend root is on python path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

# Load backend/.env
env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)

from hindsight_client import Hindsight

# Try importing low-level exception classes for targeted error classification
try:
    from hindsight_client_api.exceptions import ApiException
except ImportError:
    ApiException = None

try:
    import aiohttp
except ImportError:
    aiohttp = None

try:
    import importlib.metadata
    HINDSIGHT_SDK_VERSION = importlib.metadata.version("hindsight-client")
except Exception:
    HINDSIGHT_SDK_VERSION = "unknown"

def check_environment_compatibility():
    """Checks Python version and SDK version compatibility."""
    py_ver = sys.version_info
    print("-" * 60)
    print(f"[*] Python Runtime      : {platform.python_version()} ({platform.system()} {platform.release()})")
    print(f"[*] Hindsight SDK Ver   : {HINDSIGHT_SDK_VERSION}")
    print(f"[*] Event Loop Policy   : {asyncio.get_event_loop_policy().__class__.__name__}")
    
    if py_ver >= (3, 14):
        print("\n" + "!" * 60)
        print("[WARNING] Python 3.14 (Pre-release) Detected!")
        print("Python 3.14 is experimental. Many underlying C-extensions and")
        print("async socket libraries (e.g. aiohttp IOCP / Proactor on Windows)")
        print("experience socket resets (ClientOSError: WinError 64).")
        print("For stable production & hackathon development, Python 3.12 is")
        print("the strongly recommended standard.")
        print("!" * 60 + "\n")
    print("-" * 60)

async def run_hindsight_test():
    """
    Main asynchronous test routine for Hindsight Cloud connectivity.
    Strictly uses single asyncio.run() entry point and official async methods:
      - await client.aget_version()
      - await client.acreate_bank()
      - await client.aretain()
      - await client.arecall()
      - await client.aclose()
    """
    print("\n" + "=" * 60)
    print(" Hindsight Cloud Async Connection & Memory Test")
    print("=" * 60)

    check_environment_compatibility()

    base_url = os.getenv("HINDSIGHT_BASE_URL", "https://api.hindsight.vectorize.io").strip()
    api_key = os.getenv("HINDSIGHT_API_KEY", "").strip()
    bank_id = os.getenv("HINDSIGHT_BANK_ID", "memorysupport-demo").strip()

    if not api_key:
        print("\n[ERROR] HINDSIGHT_API_KEY is not set.")
        print(f"Please configure HINDSIGHT_API_KEY in: {env_path}")
        print("Expected format: HINDSIGHT_API_KEY=hs_...")
        sys.exit(1)

    # Mask key safely for display (never expose raw key)
    masked_key = f"{api_key[:3]}...{api_key[-3:]}" if len(api_key) > 6 else "***"
    print(f"[*] Target Endpoint : {base_url}")
    print(f"[*] Target Bank ID  : {bank_id}")
    print(f"[*] API Key Status  : Loaded successfully ({masked_key})")
    print(f"[*] Client Timeout  : 60.0s")

    # Initialize client with explicit 60-second timeout
    client = Hindsight(base_url=base_url, api_key=api_key, timeout=60.0)

    try:
        # ------------------------------------------------------------------
        # Step 1: Test Authenticated Connectivity (aget_version)
        # ------------------------------------------------------------------
        print("\n[1/4] Testing authenticated connectivity via aget_version()...")
        try:
            version_info = await asyncio.wait_for(client.aget_version(), timeout=60.0)
            api_version = getattr(version_info, "api_version", "ok")
            features = getattr(version_info, "features", {})
            print(f"      Server Connected! API Version: {api_version}")
            if features:
                print(f"      Enabled Features: {list(features.keys()) if isinstance(features, dict) else features}")
        except Exception as e:
            print(f"      Failed during aget_version() check.")
            handle_error("aget_version", e)
            return False

        # ------------------------------------------------------------------
        # Step 2: Ensure Memory Bank Exists (Async acreate_bank)
        # ------------------------------------------------------------------
        print(f"\n[2/4] Ensuring memory bank '{bank_id}' exists via acreate_bank()...")
        try:
            bank_res = await asyncio.wait_for(
                client.acreate_bank(bank_id=bank_id),
                timeout=60.0
            )
            print(f"      Bank '{bank_id}' confirmed/created successfully.")
        except Exception as e:
            # If bank already exists (409 Conflict), it is safe to proceed
            if ApiException and isinstance(e, ApiException) and e.status == 409:
                print(f"      Bank '{bank_id}' already exists (409 Conflict - OK).")
            else:
                print(f"      Note during acreate_bank: {e}")

        # ------------------------------------------------------------------
        # Step 3: Retain Synthetic Customer Interaction (aretain)
        # (NO customer account numbers or PII; purely synthetic data)
        # ------------------------------------------------------------------
        synthetic_content = (
            "Customer interaction transcript: Customer contacted support regarding an electronics item "
            "received with exterior packaging damage. Customer explicitly requested an expedited replacement "
            "rather than a refund, and stated a strict preference for email updates instead of phone calls."
        )
        print(f"\n[3/4] Retaining synthetic interaction into bank '{bank_id}' via aretain()...")
        print(f"      Synthetic content: \"{synthetic_content[:65]}...\"")

        try:
            retain_res = await asyncio.wait_for(
                client.aretain(
                    bank_id=bank_id,
                    content=synthetic_content,
                    context="synthetic_support_ticket",
                    tags=["synthetic_test", "customer_preference"]
                ),
                timeout=60.0
            )
            print("      Retain operation completed successfully.")
        except Exception as e:
            print("      Failed during aretain() operation.")
            print("      [NOTE] Retain is non-idempotent; will not retry blindly.")
            handle_error("aretain", e)
            return False

        # Brief pause to allow ingestion and index propagation
        print("      Waiting 2 seconds for memory indexing...")
        await asyncio.sleep(2.0)

        # ------------------------------------------------------------------
        # Step 4: Recall Memory via Natural Language Query (arecall)
        # ------------------------------------------------------------------
        query = "Does the customer prefer an expedited replacement or a refund?"
        print(f"\n[4/4] Recalling memory via arecall()...")
        print(f"      Query: '{query}'")

        try:
            recall_response = await asyncio.wait_for(
                client.arecall(
                    bank_id=bank_id,
                    query=query
                ),
                timeout=60.0
            )
        except Exception as e:
            print("      Failed during arecall() operation.")
            handle_error("arecall", e)
            return False

        # ------------------------------------------------------------------
        # Verification & Result Printing
        # ------------------------------------------------------------------
        results = getattr(recall_response, "results", None)
        if results is None and isinstance(recall_response, list):
            results = recall_response

        print("\n" + "=" * 60)
        print(" ACTUAL RETRIEVED MEMORY RESULTS")
        print("=" * 60)

        if not results:
            print("[!] Recall returned 0 results. Indexing may still be in progress.")
            print("    Hindsight server did not return matching memory items.")
            return False

        for idx, item in enumerate(results, start=1):
            item_text = getattr(item, "text", str(item))
            item_score = getattr(item, "score", "N/A")
            item_type = getattr(item, "type", "N/A")
            print(f"\nResult #{idx}:")
            print(f"  - Relevance Score : {item_score}")
            print(f"  - Memory Type     : {item_type}")
            print(f"  - Retrieved Fact  : {item_text}")

        print("\n" + "=" * 60)
        print(" [SUCCESS] Both retain and recall operations succeeded!")
        print("=" * 60)
        return True

    finally:
        # Strictly close client asynchronously
        try:
            await client.aclose()
        except Exception:
            pass
        await asyncio.sleep(0.25)

def handle_error(step_name: str, exc: Exception):
    """
    Categorizes and reports specific errors:
    DNS/network, HTTP 401, 402, 404, 429, timeouts, and Windows socket errors.
    """
    print("\n" + "!" * 60)
    print(f" ERROR REPORT FOR STEP: {step_name}")
    print("!" * 60)

    # 1. Timeout
    if isinstance(exc, asyncio.TimeoutError):
        print("[CATEGORY: TIMEOUT]")
        print("Details: The request timed out after 60 seconds.")
        print("Remedy : The Hindsight Cloud endpoint is experiencing high latency or is unreachable.")
        return

    # 2. ApiException (from OpenAPI client)
    if ApiException and isinstance(exc, ApiException):
        status = getattr(exc, "status", None)
        reason = getattr(exc, "reason", str(exc))
        body = getattr(exc, "body", "")

        if status == 401:
            print(f"[CATEGORY: HTTP 401 UNAUTHORIZED]")
            print("Details: Authentication failed. The provided HINDSIGHT_API_KEY is invalid or expired.")
            print("Remedy : Check your API key in Hindsight Cloud dashboard and update backend/.env.")
        elif status == 402:
            print(f"[CATEGORY: HTTP 402 PAYMENT / QUOTA REQUIRED]")
            print("Details: Payment required. Hindsight Cloud credits or usage quota exceeded.")
            print("Remedy : Verify account billing/credits at https://app.hindsight.vectorize.io.")
        elif status == 404:
            print(f"[CATEGORY: HTTP 404 NOT FOUND]")
            print(f"Details: The requested resource or memory bank does not exist: {reason}")
        elif status == 429:
            print(f"[CATEGORY: HTTP 429 RATE LIMIT EXCEEDED]")
            print("Details: Too many requests sent to Hindsight API.")
        else:
            print(f"[CATEGORY: HTTP {status} API EXCEPTION]")
            print(f"Details: {reason} | Body: {body}")
        return

    # 3. aiohttp ClientResponseError
    if aiohttp and isinstance(exc, aiohttp.ClientResponseError):
        status = exc.status
        if status == 401:
            print("[CATEGORY: HTTP 401 UNAUTHORIZED]")
            print("Details: Invalid or unauthorized Hindsight API key.")
        elif status == 402:
            print("[CATEGORY: HTTP 402 PAYMENT / QUOTA REQUIRED]")
            print("Details: Account quota or credits exhausted.")
        elif status == 404:
            print("[CATEGORY: HTTP 404 NOT FOUND]")
            print(f"Details: Resource not found: {exc.message}")
        else:
            print(f"[CATEGORY: HTTP {status} RESPONSE ERROR]")
            print(f"Details: {exc.message}")
        return

    # 4. Windows Socket / OS Error ([WinError 64])
    if (aiohttp and isinstance(exc, aiohttp.ClientOSError)) or isinstance(exc, OSError):
        win_error = getattr(exc, "winerror", None)
        err_str = str(exc)
        if win_error == 64 or "WinError 64" in err_str or "network name is no longer available" in err_str:
            print("[CATEGORY: WINDOWS SOCKET ERROR [WinError 64]]")
            print("Details: 'The specified network name is no longer available'.")
            print("Root Cause Analysis:")
            print("  1. Python 3.14 on Windows has known socket and ProactorEventLoop instabilities with aiohttp.")
            print("  2. Local Windows Firewall, Defender network inspection, or VPN forcefully reset the TCP socket.")
            print("  3. Remote SSL connection closed prematurely.")
            print("Remedy:")
            print("  -> Use Python 3.12 (venv-py312) which has fully stable, validated aiohttp C-wheels on Windows.")
            return

    # 5. DNS / Connection Failure
    if (aiohttp and isinstance(exc, aiohttp.ClientConnectorError)) or isinstance(exc, socket.gaierror):
        print("[CATEGORY: DNS / NETWORK CONNECTION FAILURE]")
        print("Details: Unable to establish TCP/SSL connection to Hindsight Cloud endpoint.")
        print("Remedy : Verify internet connection, DNS resolution, and firewall rules.")
        return

    # Generic fallback
    print(f"[CATEGORY: UNHANDLED EXCEPTION: {type(exc).__name__}]")
    print(f"Details: {exc}")

if __name__ == "__main__":
    # Single asyncio.run() entry point
    success = asyncio.run(run_hindsight_test())
    if not success:
        sys.exit(1)
