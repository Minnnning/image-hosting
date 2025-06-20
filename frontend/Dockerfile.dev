# 개발용 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# 소스코드 복사
COPY . .

# 3000번 포트 노출
EXPOSE 3000

# 개발 서버 실행
CMD ["npm", "start"]