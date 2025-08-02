# GitHub Pages + Render.com Deployment Guide

## Overview
- **Frontend**: GitHub Pages (miễn phí)
- **Backend**: Render.com (miễn phí với giới hạn)

## Bước 1: Deploy Backend lên Render.com

### 1.1 Tạo tài khoản Render
1. Truy cập [render.com](https://render.com)
2. Đăng ký tài khoản (có thể dùng GitHub)

### 1.2 Deploy Backend
1. Trong Render Dashboard, click **"New +"** → **"Web Service"**
2. Chọn **"Build and deploy from a Git repository"**
3. Connect GitHub account và chọn repository: `InternalFinance`
4. Cấu hình như sau:
   - **Name**: `family-expense-backend`
   - **Region**: Singapore (gần VN nhất)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.3 Cấu hình Environment Variables
Trong Settings → Environment Variables, thêm:

```
JWT_SECRET=your-strong-secret-key-32-characters-minimum
NODE_ENV=production
```

**Quan trọng**: Không thêm `FIREBASE_SERVICE_ACCOUNT` qua web interface vì quá dài. Thay vào đó:

1. Vào **Shell** tab trong Render dashboard
2. Chạy lệnh:
```bash
echo 'FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...your-full-json...}' > .env
```

### 1.4 Lấy Backend URL
Sau khi deploy thành công, bạn sẽ có URL như:
`https://family-expense-backend.onrender.com`

## Bước 2: Cấu hình GitHub Pages

### 2.1 Enable GitHub Pages
1. Vào repository trên GitHub
2. Settings → Pages
3. Source: **GitHub Actions**

### 2.2 Cập nhật Backend URL
Sửa file `.github/workflows/deploy.yml`, dòng:
```yaml
REACT_APP_API_URL: https://your-backend-url.render.com
```
Thay `your-backend-url` bằng URL thực của backend.

### 2.3 Push để Deploy
```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push
```

GitHub Actions sẽ tự động:
1. Build React app
2. Deploy lên GitHub Pages
3. Website sẽ có địa chỉ: `https://yourusername.github.io/InternalFinance`

## Bước 3: Kiểm tra Deployment

### Backend Health Check
```bash
curl https://your-backend-url.onrender.com/api/auth/check-admin
```

### Frontend
Truy cập: `https://yourusername.github.io/InternalFinance`

## Troubleshooting

### Backend Issues (Render)
- **Lỗi start**: Kiểm tra logs trong Render dashboard
- **Environment variables**: Đảm bảo JWT_SECRET đã set
- **Firebase**: Kiểm tra service account JSON trong Shell

### Frontend Issues (GitHub Pages)
- **Build fails**: Kiểm tra Actions logs
- **API không kết nối**: Kiểm tra REACT_APP_API_URL
- **CORS errors**: Backend đã config cho all origins

### Common Problems

1. **Render Free Plan Limitations**:
   - App "ngủ" sau 15 phút không hoạt động
   - Khởi động lại mất ~30 giây
   - 750 giờ miễn phí/tháng

2. **GitHub Pages Caching**:
   - Có thể mất vài phút để update
   - Hard refresh browser (Ctrl+F5)

## Alternative Backend Options

### Option 1: Railway
- Dễ setup hơn
- $5/month sau trial
- Deploy command: `railway login && railway deploy`

### Option 2: Vercel
- Serverless functions
- Miễn phí với giới hạn
- Tốt cho traffic thấp

### Option 3: Self-host
- VPS từ $5/month
- Full control
- Cần setup nginx, SSL

## Production Checklist

- [ ] Backend deployed và accessible
- [ ] Frontend deployed trên GitHub Pages  
- [ ] Environment variables configured
- [ ] HTTPS working (tự động)
- [ ] Can register/login
- [ ] Can add expenses
- [ ] Rankings page works

## URLs After Deployment

- **Frontend**: `https://yourusername.github.io/InternalFinance`
- **Backend**: `https://family-expense-backend.onrender.com`
- **GitHub Actions**: Repository → Actions tab

## Cost Summary

- **GitHub Pages**: Miễn phí
- **Render.com**: Miễn phí (với giới hạn)
- **Total**: $0/month

Perfect cho family expense tracker!