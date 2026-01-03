#================
# state 1: Build
#================
FROM node:20-alpine As builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성(dependancy) 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

#================
# state 2: 실행
#================
FROM nginx:alpine

# 빌드된 정적 파일을 nginx의 기본 웹 루트(서비스 될 디렉토리)로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 우리 프론트엔드 app의 nginx 기본 설정 파일을 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# nginx 서버를 도커 컨테이너에서는 포그라운드로 실행해야 한다
CMD [ "nginx", "-g", "daemon off;"  ]