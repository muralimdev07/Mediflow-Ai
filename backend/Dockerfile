# ── Build Stage ──────────────────────────────────────────────
FROM python:3.11-slim as builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Runtime Stage ────────────────────────────────────────────
FROM python:3.11-slim

RUN groupadd -r mediflow && useradd -r -g mediflow mediflow

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

RUN chown -R mediflow:mediflow /app

USER mediflow

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
