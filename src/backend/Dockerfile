FROM python:3.13-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV DATABASE_PATH=/data/characters.db

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /data

EXPOSE 5000

CMD ["gunicorn", "-w", "1", "--timeout", "120", "--keep-alive", "2", "-b", "[::]:5000", "main:app"]
