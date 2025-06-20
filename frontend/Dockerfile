# === 1단계: 빌드 환경 (Builder) ===
FROM node:18-alpine AS builder

# [추가] docker-compose.yml로부터 빌드 시점의 환경 변수를 받겠다고 선언합니다.
ARG REACT_APP_API_URL
# [추가] 받은 ARG 값을 빌드 과정(npm run build)에서 사용할 환경 변수로 설정합니다.
ENV REACT_APP_API_URL=$REACT_APP_API_URL

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

# 위에서 설정된 ENV 변수를 사용하여 코드를 빌드합니다.
RUN npm run build


# === 2단계: 프로덕션 환경 (Server) ===
FROM node:18-alpine

WORKDIR /app

# 1단계에서 생성된 빌드 결과물을 현재 작업 디렉토리로 복사합니다.
COPY --from=builder /app/build .

# serve 패키지를 포함한 의존성을 설치합니다.
COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev

# 3000번 포트를 노출합니다.
EXPOSE 3000

# serve 패키지를 사용하여 현재 디렉토리의 파일을 서빙합니다.
CMD ["npx", "serve", "-s", ".", "-l", "3000"]