#!/bin/sh
# 이 스크립트는 MinIO 컨테이너가 '처음' 시작될 때 한번만 실행됩니다.
# 스크립트 실행 중 오류가 발생하면 즉시 중단합니다.
set -e

# mc(MinIO Client)가 컨테이너 자기 자신에게 연결할 수 있도록 'local'이라는 별칭을 설정합니다.
# 컨테이너 내부에서는 'localhost'로 자신을 가리킵니다.
# ID와 비밀번호는 docker-compose.yml의 env_file을 통해 자동으로 전달됩니다.
mc alias set local http://localhost:9000 ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
# mc alias set local http://localhost:9000 minioadmin minioadmin

# '${MINIO_BUCKET}'이라는 이름의 버킷을 생성합니다. (.env 파일에 정의된 'images')
# '|| true'는 버킷이 이미 존재하여 발생하는 오류를 무시하고 스크립트를 계속 진행시킵니다.
# (컨테이너가 재생성될 때를 대비한 안전 장치입니다.)
mc mb local/${MINIO_BUCKET} || true

# 생성된 버킷의 접근 정책을 'download' (공개 읽기 전용)로 설정합니다.
# 최신 mc에서 권장하는 'mc anonymous' 명령어를 사용합니다.
mc anonymous set download local/${MINIO_BUCKET}
#mc anonymous set download local/images

echo "MinIO setup script finished. Bucket '${MINIO_BUCKET}' is now public."

exit 0