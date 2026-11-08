.PHONY: be-run be-test be-lint migrate fe-run

be-run:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload --port 8000

be-test:
	cd backend && . .venv/bin/activate && pytest -q

be-lint:
	cd backend && . .venv/bin/activate && ruff check . && ruff format --check .

migrate:
	cd backend && . .venv/bin/activate && alembic upgrade head

fe-run:
	cd frontend && npm run dev

