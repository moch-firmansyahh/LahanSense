from app.api.v1.health import health


def test_health():
    r = health()
    assert r == {"status": "ok"}
