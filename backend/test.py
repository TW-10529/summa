import asyncio
from prisma import Prisma

async def main():
    print("Testing Prisma + PostgreSQL connection...")

    db = Prisma()

    try:
        await db.connect()
        print("✅ Connected successfully!")
    except Exception as e:
        print("❌ Connection failed:")
        print(e)
    finally:
        await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
