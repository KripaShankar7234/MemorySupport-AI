import asyncio
import os
import sys
import re
import platform
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))

env_path = BACKEND_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# Set Windows Selector event loop policy if on Windows
if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception:
        pass

try:
    import certifi
    TLS_CA_FILE = certifi.where()
except Exception:
    TLS_CA_FILE = None

try:
    import importlib.metadata
    PYMONGO_VERSION = importlib.metadata.version("pymongo")
    MOTOR_VERSION = importlib.metadata.version("motor")
except Exception:
    PYMONGO_VERSION = "unknown"
    MOTOR_VERSION = "unknown"

from motor.motor_asyncio import AsyncIOMotorClient

def mask_connection_uri(uri: str) -> str:
    """Masks credentials in MongoDB connection URI completely."""
    if not uri:
        return "<NOT CONFIGURED>"
    # Matches ://user:password@host
    return re.sub(r"://([^:]+):([^@]+)@", r"://***:***@", uri)

async def run_mongo_test():
    print("=" * 70)
    print(" MongoDB Atlas CRUD & Live Connectivity Verification Test")
    print("=" * 70)
    print(f"[*] Python Runtime      : {platform.python_version()} ({platform.system()})")
    print(f"[*] PyMongo Version     : {PYMONGO_VERSION}")
    print(f"[*] Motor Version       : {MOTOR_VERSION}")
    print(f"[*] Certifi CA Bundle   : {TLS_CA_FILE or 'Default System CA'}")

    raw_uri = os.getenv("MONGODB_URI", "").strip()
    db_name = os.getenv("MONGODB_DB_NAME", "memorysupport_ai").strip()

    if not raw_uri:
        print("\n[ERROR] MONGODB_URI is not set in backend/.env")
        sys.exit(1)

    # Detect if user left angle brackets around password
    has_angle_brackets = ":<" in raw_uri and ">@" in raw_uri
    if has_angle_brackets:
        print("[!] Detected literal '<' and '>' in password. Auto-sanitizing for test...")
        target_uri = re.sub(r":<([^>]+)>@", r":\1@", raw_uri)
    else:
        target_uri = raw_uri

    print(f"[*] Masked URI          : {mask_connection_uri(target_uri)}")
    print(f"[*] Database Name       : {db_name}")

    kwargs = {
        "serverSelectionTimeoutMS": 10000,
        "connectTimeoutMS": 10000,
        "socketTimeoutMS": 10000,
    }
    if TLS_CA_FILE:
        kwargs["tlsCAFile"] = TLS_CA_FILE

    client = AsyncIOMotorClient(target_uri, **kwargs)

    try:
        # Step 1: Ping cluster
        print("\n[1/4] Pinging MongoDB Atlas cluster via admin command...")
        ping_result = await client.admin.command("ping")
        assert ping_result.get("ok") == 1.0, f"Ping returned unexpected payload: {ping_result}"
        print(f"      [PASS] Ping OK: {ping_result}")

        # Step 2: Insert synthetic test record
        db = client[db_name]
        collection = db["connection_probe_test"]
        synthetic_record = {
            "probe_id": "test_e2e_verification",
            "service": "MemorySupport-AI",
            "environment": "diagnostic_test",
            "created_at": datetime.now(timezone.utc),
        }
        print(f"\n[2/4] Executing insert_one on database '{db_name}'...")
        insert_res = await collection.insert_one(synthetic_record)
        inserted_id = insert_res.inserted_id
        print(f"      [PASS] Successfully inserted document. _id: {inserted_id}")

        # Step 3: Find the inserted record
        print("\n[3/4] Executing find_one to verify data persistence...")
        retrieved_doc = await collection.find_one({"_id": inserted_id})
        assert retrieved_doc is not None, "Failed to retrieve the inserted document!"
        assert retrieved_doc.get("service") == "MemorySupport-AI"
        print(f"      [PASS] Successfully retrieved document: probe_id='{retrieved_doc.get('probe_id')}'")

        # Step 4: Delete the test record
        print("\n[4/4] Executing delete_one to clean up diagnostic record...")
        delete_res = await collection.delete_one({"_id": inserted_id})
        assert delete_res.deleted_count == 1, "Failed to delete test document!"
        print(f"      [PASS] Successfully deleted document (deleted_count={delete_res.deleted_count}).")

        print("\n" + "=" * 70)
        print(" [SUCCESS] MongoDB Atlas live connectivity and full CRUD verified!")
        print("=" * 70)
        return True

    except Exception as exc:
        err_msg = str(exc)
        print("\n" + "!" * 70)
        print(" [FAILURE] MongoDB Atlas Connection Error")
        print("!" * 70)
        print(f"Error Type: {type(exc).__name__}")
        print(f"Message   : {err_msg}")

        if "TLSV1_ALERT_INTERNAL_ERROR" in err_msg or "ReplicaSetNoPrimary" in err_msg:
            print("\n" + "-" * 70)
            print(" DIAGNOSTIC GUIDE FOR: TLSV1_ALERT_INTERNAL_ERROR / ReplicaSetNoPrimary")
            print("-" * 70)
            print("1. MongoDB Atlas Network Access (IP Whitelist):")
            print("   -> Log in to https://cloud.mongodb.com -> Security -> Network Access.")
            print("   -> Ensure your current public IP is added, OR add '0.0.0.0/0' (allow from anywhere)")
            print("      for hackathon/development testing.")
            print("   -> MongoDB Atlas drops connections at the TLS layer if the client IP is not whitelisted.")
            print("\n2. Password Credentials & Angle Brackets:")
            print("   -> Check if your password was copied with '<' and '>'. Atlas templates write <password>,")
            print("      which means replace the brackets and word with your actual password.")
            print("\n3. Verify Database User Permissions:")
            print("   -> Database Access -> User 'kripayadav2021_db_user' -> Built-in Role: 'Read and write to any database'.")

        return False

    finally:
        client.close()

if __name__ == "__main__":
    success = asyncio.run(run_mongo_test())
    if not success:
        sys.exit(1)
