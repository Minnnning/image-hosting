import os
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

# [수정] security.py에서 필요한 함수들을 가져옵니다.
from security import create_access_token, get_current_user, verify_password

# ... (기존 import 문들) ...
import io
import uuid
from fastapi.middleware.cors import CORSMiddleware
from minio import Minio
from PIL import Image

# ... (기존 app, CORS, MinIO 설정은 동일) ...
app = FastAPI()
origins = [os.getenv("CORS_ORIGIN")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
minio_client = Minio(os.getenv("MINIO_ENDPOINT"), access_key=os.getenv("MINIO_ACCESS_KEY"), secret_key=os.getenv("MINIO_SECRET_KEY"), secure=False)
bucket_name = os.getenv("MINIO_BUCKET")


# --- [추가] 로그인 API 엔드포인트 ---
@app.post("/api/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # 관리자 계정 정보 확인
    admin_user = os.getenv("ADMIN_USERNAME")
    admin_pass = os.getenv("ADMIN_PASSWORD")

    # ID가 다르거나, PW가 다르면 에러 반환
    if not (form_data.username == admin_user and form_data.password == admin_pass):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # JWT 토큰 생성
    access_token_expires = timedelta(minutes=60*24)
    access_token = create_access_token(
        data={"sub": admin_user}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# --- [수정] 이미지 업로드 API 보호 ---
# Depends(get_current_user)를 추가하여 이 API가 보호됨을 명시합니다.
@app.post("/api/images/upload")
async def upload_image(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
    # 이 함수가 실행된다는 것은 get_current_user가 성공적으로 통과(인증 성공)했다는 의미
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")
    
    # ... (기존 파일 저장 로직은 동일) ...
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        webp_buffer = io.BytesIO()
        image.save(webp_buffer, "webp")
        webp_buffer.seek(0)
        file_name = f"{uuid.uuid4()}.webp"
        minio_client.put_object(bucket_name, file_name, data=webp_buffer, length=webp_buffer.getbuffer().nbytes, content_type="image/webp")
        return {"message": "Image uploaded successfully", "filename": file_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 이미지 목록 API (보호되지 않음, 누구나 접근 가능) ---
@app.get("/api/images")
async def get_image_list():
    # ... (기존 로직과 동일) ...
    try:
        public_endpoint = os.getenv("MINIO_PUBLIC_ENDPOINT")
        objects = minio_client.list_objects(bucket_name, recursive=True)
        sorted_objects = sorted(list(objects), key=lambda obj: obj.last_modified, reverse=True)
        latest_10_objects = sorted_objects[:10]
        image_urls = [f"{public_endpoint}/{bucket_name}/{obj.object_name}" for obj in latest_10_objects]
        return {"images": image_urls}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))