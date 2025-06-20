## 📝 블로그용 간편 이미지 호스팅 서비스
블로그나 웹사이트에 사용할 이미지를 쉽고 빠르게 업로드하고, HTML 태그까지 한 번에 관리할 수 있는 나만의 이미지 호스팅 솔루션입니다.
<center><img src="https://image.minnnningnas.duckdns.org/images/e03d4e48-2042-4e29-bc81-a2a1072bce47.webp" style="zoom:50%;"></center>
<center><img src="https://image.minnnningnas.duckdns.org/images/3a19d3be-fc15-4652-9dfb-3feecf03cd05.webp" style="zoom:50%;"></center>

### 🎯 프로젝트 소개 및 목표
블로그에 글을 작성할 때마다 이미지를 첨부하기 위해 GitHub Issue를 생성하고, 그곳에 업로드된 이미지 주소를 가져와 사용하는 방식을 써왔습니다. 하지만 최근 GitHub 정책상 이슈를 최종적으로 저장(Save)해야만 이미지 주소가 유지되는 등 과정이 번거로워졌습니다.

또한, 그렇게 얻은 이미지 주소를 매번 `<center><img src="..."></center>` 와 같은 HTML 태그 안에 수동으로 넣는 과정 역시 불편함으로 다가왔습니다.

이러한 불편함들을 한 번에 해결하고, 오직 나만을 위한 안정적인 이미지 호스팅 환경을 구축하고자 이 프로젝트를 시작하게 되었습니다.

✨ 주요 기능
사용자 인증: 지정된 관리자만 이미지를 업로드할 수 있도록 로그인/로그아웃 기능을 제공합니다.

다양한 업로드 방식:
드래그 앤 드롭(Drag & Drop)으로 이미지 업로드
클립보드에 복사된 이미지를 붙여넣기(Ctrl+V)로 업로드
실시간 목록 확인: 업로드된 이미지 목록을 최신순으로 10개까지 바로 확인할 수 있습니다.

HTML 태그 자동 생성: 업로드된 이미지를 클릭하면, 바로 블로그에 붙여넣을 수 있는` <img> `HTML 태그가 자동으로 생성됩니다.
클립보드 복사: 생성된 HTML 태그를 버튼 클릭 한 번으로 간편하게 복사할 수 있습니다.
&nbsp;
🛠️ 기술 스택 및 아키텍처
이 프로젝트는 Docker Compose를 기반으로 각 기능이 독립적인 서비스 컨테이너로 동작하도록 설계되었습니다.
&nbsp;
Frontend: React
Backend: FastAPI (Python)
Storage: MinIO (S3 호환 오브젝트 스토리지)
Infrastructure: Docker, Docker Compose
왜 이런 구조를 선택했는가?
단순히 서버의 특정 폴더에 이미지를 저장할 수도 있지만, 아래와 같은 장점을 위해 각 요소를 분리했습니다.
&nbsp;
MinIO 저장소 사용 이유:
&nbsp;
서버의 실제 파일 시스템 구조를 외부에 노출시키지 않고, S3 호환 API를 통해 안전하게 파일을 관리할 수 있습니다.
향후 서비스가 커졌을 때, 스토리지 시스템만 독립적으로 확장하거나 클라우드 S3 서비스로 이전하기 용이합니다.
&nbsp;
FastAPI 백엔드 사용 이유:
&nbsp;
단순 파일 저장을 넘어, 업로드된 이미지를 WebP와 같은 효율적인 포맷으로 변환하거나, 추후 이미지 필터링/리사이징 등의 복잡한 로직을 손쉽게 추가하기 위함입니다.
인증 로직을 처리하고 비즈니스 로직을 중앙에서 관리하는 역할을 수행합니다.
📂 프로젝트 구조
``` sh
.
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   └── security.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── App.js
│   ├── Dockerfile.dev
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── minio-init/
│   └── setup.sh
├── .env
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```
### 🚀 시작하기
사전 준비
Docker
Docker Compose (최신 버전에서는 Docker에 포함됨)
설정
실행 전, 프로젝트 루트에 있는 .env 파일을 자신의 환경에 맞게 수정해야 합니다. 특히 도메인 주소, 비밀번호, JWT 시크릿 키 등을 반드시 변경해주세요.
&nbsp;
실행 방법
이 프로젝트는 개발 환경과 배포 환경이 분리되어 있습니다.
&nbsp;
개발 환경 실행
로컬 PC에서 소스 코드를 수정하며 실시간으로 변경사항을 확인하고 싶을 때 사용합니다.

Bash

### =개발용 설정을 사용하여 실행합니다.
`docker compose -f docker-compose.dev.yml up --build`
실행 후 http://localhost:3000으로 접속하여 확인할 수 있습니다.
&nbsp;
배포 환경 실행
실제 서버에 배포하여 서비스를 운영할 때 사용합니다. 최적화된 프로덕션 빌드 이미지를 사용하며, 외부 Nginx와 같은 리버스 프록시와 연동하는 것을 전제로 합니다.
&nbsp;
### 배포용 설정을 사용하여 백그라운드에서 실행합니다.
`docker compose -f docker-compose.yml up -d --build`
서비스 중지
&nbsp;
### 개발 환경 중지 예시
`docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v`
📈 개선 사항
업로드된 이미지 삭제 기능 추가
이미지 목록 페이지네이션(Pagination) 기능 구현