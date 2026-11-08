"""
Seed CLI script for LahanSense.
Run:
    python -m app.seed
Populates the database with 10 rich agricultural demo plots across Indonesia.
"""

from app.db.session import SessionLocal
from app.api.v1.demo import load_demo


def main():
    print("🌱 Memulai seeding 10 data petak lahan demo LahanSense...")
    db = SessionLocal()
    try:
        plots = load_demo(db=db)
        print(f"✅ Sukses memasukkan {len(plots)} petak lahan demo:")
        for p in plots:
            print(f"  - [{p.id}] {p.name} ({p.crop}, {p.irrigation_method}, {p.area_ha:.2f} ha)")
        print("🌱 Seeding selesai dengan sempurna!")
    except Exception as e:
        print(f"❌ Gagal seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

