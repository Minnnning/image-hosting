import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';

// --- 로그인 폼 컴포넌트 ---
function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      const response = await axios.post(`${apiUrl}/api/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      onLoginSuccess(response.data.access_token);
    } catch (err) {
      setError('로그인에 실패했습니다. 아이디 또는 비밀번호를 확인하세요.');
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>유저 로그인</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="username">아이디</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

// --- 이미지 업로더 컴포넌트 ---
function ImageUploader({ token, onLogout }) {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  const [imageHtml, setImageHtml] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/images`);
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setMessage('업로드 중...');
    setImageHtml('');
    try {
      await axios.post(`${apiUrl}/api/images/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      setMessage('업로드 성공!');
      fetchImages();
    } catch (error) {
      setMessage('업로드 실패. (권한이 없거나 서버 오류)');
      console.error('Upload failed:', error);
    }
  }, [apiUrl, fetchImages, token]);

  const onDrop = useCallback((acceptedFiles) => handleUpload(acceptedFiles[0]), [handleUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*', multiple: false });

  const handlePaste = useCallback((event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        handleUpload(items[i].getAsFile());
        break;
      }
    }
  }, [handleUpload]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleImageClick = (imageUrl) => {
    const htmlTag = `<center><img src="${imageUrl}" style="zoom:50%;"></center>`;
    setImageHtml(htmlTag);
    setCopyButtonText('Copy');
  };
  
  const tablehtml = `<table><td><center><img alt="" src="" style="zoom:30%;" /></center></td><td><center><img alt="" src="" style="zoom:30%;" /></center></td></table>`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(imageHtml).then(() => setCopyButtonText('Copied!'));
  };

  const handleCopyToClipboard2 = () => {
    navigator.clipboard.writeText(tablehtml).then(() => setCopyButtonText('Copied!'));
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>📷 민미지 업로드</h1>
        <button onClick={onLogout} className="logout-button">로그아웃</button>
      </header>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <p>이미지 파일을 드래그 앤 드롭하거나, 클릭하거나, 페이지에 붙여넣기 하세요.</p>
      </div>
      {message && <p className="message">{message}</p>}
      {imageHtml && (
        <div className="html-display-area">
          <h3>HTML 태그</h3>
          <textarea readOnly value={imageHtml} rows="4" />
          <button onClick={handleCopyToClipboard}>{copyButtonText}</button>
        </div>
      )}
      <h2>🖼️ 저장된 이미지 목록 (최근 10개)</h2>
      <div className="image-grid">
        {images.length > 0 ? images.map((imgUrl) => (
          <div key={imgUrl} className="image-item" onClick={() => handleImageClick(imgUrl)}>
            <img src={imgUrl} alt="uploaded" />
          </div>
        )) : <p>저장된 이미지가 없습니다.</p>}
      </div>
      <div className="html-display-area">
          <h3>이미지 테이블 HTML 태그</h3>
          <textarea readOnly value={tablehtml} rows="4" />
          <button onClick={handleCopyToClipboard2}>{copyButtonText}</button>
        </div>
    </div>
  );
}


// --- 메인 App 컴포넌트 (라우터 역할) ---
function App() {
  const [token, setToken] = useState(localStorage.getItem('admin-token'));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('admin-token', newToken);
    setToken(newToken);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('admin-token');
    setToken(null);
  };

  if (!token) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return <ImageUploader token={token} onLogout={handleLogout} />;
}

export default App;