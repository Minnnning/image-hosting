FROM python:3.9-slim

WORKDIR /app

# 의존성 설치 (소스코드 복사 전 실행하여 Docker 캐시 활용)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스코드 복사
COPY ./app /app

# 8000번 포트 노출
EXPOSE 8000

# 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]