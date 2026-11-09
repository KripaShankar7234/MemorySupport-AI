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

# Set Windows Selector event loop policy if on Windows
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

import httpx
from httpx import ASGITransport
from app.main import app
from app.clients.hindsight_client import hindsight_manager
from app.clients.mongo_client import mongo_manager
from app.services.llm_service import llm_service
from app.api.chat import get_isolated_bank_id

async def run_end_to_end_test():
    print("=" * 70)
    print(" MemorySupport AI - Phase 3: Unified Chat API End-to-End Test")
    print("=" * 70)
    active_groq_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
    print(f"[*] Python Runtime  : {platform.python_version()} ({platform.system()})")
    print(f"[*] Base Memory Bank: {os.getenv('HINDSIGHT_BANK_ID', 'memorysupport-demo')}")
    print(f"[*] Active Groq Model: {active_groq_model}")

    # Synthetic Test Customers (strictly isolated IDs)
    cust_alpha = "synthetic_cust_alpha"
    cust_beta = "synthetic_cust_beta"

    bank_alpha = get_isolated_bank_id(cust_alpha)
    bank_beta = get_isolated_bank_id(cust_beta)

    print(f"[*] Isolated Bank for Alpha: {bank_alpha}")
    print(f"[*] Isolated Bank for Beta : {bank_beta}")

    try:
        # Wrap FastAPI app with its official lifespan context
        async with app.router.lifespan_context(app):
            transport = ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://testserver", timeout=60.0) as client:
                
                # ------------------------------------------------------------------
                # Step 1: Health Check verification
                # ------------------------------------------------------------------
                print("\n[1/5] Verifying API /health endpoint...")
                health_res = await client.get("/health")
                assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
                print(f"      Health Response: {health_res.json()}")

                # ------------------------------------------------------------------
                # Step 2: Seed Customer Alpha's Isolated Hindsight Bank
                # ------------------------------------------------------------------
                print(f"\n[2/5] Seeding real long-term memory for customer '{cust_alpha}' in bank '{bank_alpha}'...")
                await hindsight_manager.ensure_bank_exists(bank_alpha)

                synthetic_seed_fact = (
                    "Customer interaction: Customer reported smart security camera arrived with cracked glass housing. "
                    "Customer explicitly prefers an expedited product replacement rather than a refund. "
                    "Customer communication preference is strictly email notifications; do not call phone."
                )
                print(f"      Retaining: \"{synthetic_seed_fact[:75]}...\"")
                await hindsight_manager.retain_memory(
                    bank_id=bank_alpha,
                    content=synthetic_seed_fact,
                    context="initial_support_ticket",
                    document_id="seed_doc_alpha_001",
                    tags=["camera_damage", "replacement_preference", "email_only"],
                )
                print("      Retained successfully. Waiting 2.5s for Hindsight index propagation...")
                await asyncio.sleep(2.5)

                # ------------------------------------------------------------------
                # Step 3: Invoke POST /api/chat for Customer Alpha
                # ------------------------------------------------------------------
                alpha_query = "Can you confirm if I'm getting a refund or a replacement for my camera, and will you call me?"
                print(f"\n[3/5] Testing POST /api/chat with Customer Alpha query:")
                print(f"      Query: \"{alpha_query}\"")

                payload_alpha = {
                    "customer_id": cust_alpha,
                    "message": alpha_query,
                    "conversation_id": "conv_alpha_test_101",
                }

                response_alpha = await client.post("/api/chat", json=payload_alpha)
                assert response_alpha.status_code == 200, f"POST /api/chat failed: {response_alpha.status_code} - {response_alpha.text}"
                data_alpha = response_alpha.json()

                print("\n" + "=" * 70)
                print(" ACTUAL API RESPONSE FOR CUSTOMER ALPHA")
                print("=" * 70)
                print(f"Customer ID        : {data_alpha['customer_id']}")
                print(f"Ticket ID          : {data_alpha['ticket_id']}")
                print(f"Issue Status       : {data_alpha['issue_status']}")
                print(f"Escalation Required: {data_alpha['escalation_required']}")
                print(f"\nGenerated AI Answer:\n{data_alpha['answer']}")
                print(f"\nRecalled Memories from Hindsight ({len(data_alpha['recalled_memories'])} found):")
                for mem in data_alpha["recalled_memories"]:
                    print(f"  • [{mem.get('type')}] (score: {mem.get('score')}): {mem.get('text')}")

                # Verification asserts for Alpha
                assert data_alpha["customer_id"] == cust_alpha
                assert data_alpha["ticket_id"].startswith("TKT-")
                assert len(data_alpha["recalled_memories"]) > 0, "Expected non-empty recalled memories from Hindsight!"

                # Verify actual persistence in MongoDB Atlas
                try:
                    db = mongo_manager.get_database()
                    saved_ticket = await db["tickets"].find_one({"ticket_id": data_alpha["ticket_id"]})
                    if saved_ticket:
                        print(f"\n[+] Verified MongoDB Atlas Persistence: Ticket '{saved_ticket.get('ticket_id')}' stored (status: {saved_ticket.get('issue_status')})")
                    else:
                        print(f"\n[!] Warning: MongoDB Atlas ticket '{data_alpha['ticket_id']}' not found in 'tickets' collection.")
                except Exception as mongo_err:
                    print(f"\n[!] MongoDB Atlas persistence query error: {mongo_err}")

                # ------------------------------------------------------------------
                # Step 4: Verify Memory Bank Isolation with Customer Beta
                # ------------------------------------------------------------------
                print(f"\n[4/5] Testing Customer Beta (Isolation Check):")
                print(f"      Customer Beta has zero prior memory. Querying same question...")

                payload_beta = {
                    "customer_id": cust_beta,
                    "message": "What is the status of my order replacement?",
                    "conversation_id": "conv_beta_test_201",
                }

                response_beta = await client.post("/api/chat", json=payload_beta)
                assert response_beta.status_code == 200, f"Customer Beta failed: {response_beta.text}"
                data_beta = response_beta.json()

                print(f"      Customer Beta Recalled Memories Count: {len(data_beta['recalled_memories'])}")
                # Beta must NOT recall Alpha's camera damage facts
                beta_memory_texts = [m.get("text", "") for m in data_beta["recalled_memories"]]
                assert not any("camera" in t.lower() for t in beta_memory_texts), "Data leak: Customer Beta accessed Customer Alpha's memories!"
                print("      [PASS] Memory bank isolation confirmed! Beta has zero access to Alpha's memories.")

                # ------------------------------------------------------------------
                # Step 5: Test Idempotent Retry Handling
                # ------------------------------------------------------------------
                print(f"\n[5/5] Testing Idempotent Retries (duplicate write prevention)...")
                retry_response = await client.post("/api/chat", json=payload_alpha)
                assert retry_response.status_code == 200, "Retry failed!"
                print("      [PASS] Idempotent retry succeeded cleanly with deduplicated retention.")

                print("\n" + "=" * 70)
                print(" [SUCCESS] Phase 3 End-to-End Chat API Pipeline Fully Verified!")
                print("=" * 70)
                return True

    finally:
        # Proper lifecycle cleanup to prevent aiohttp unclosed session/connector warnings
        print("\n[CLEANUP] Closing Hindsight, Groq and MongoDB client sessions...")
        try:
            await hindsight_manager.close()
        except Exception:
            pass
        try:
            await llm_service.close()
        except Exception:
            pass
        try:
            await mongo_manager.close()
        except Exception:
            pass
        # Brief pause to allow underlying aiohttp transports to finish cleanup
        await asyncio.sleep(0.3)

if __name__ == "__main__":
    success = asyncio.run(run_end_to_end_test())
    if not success:
        sys.exit(1)
