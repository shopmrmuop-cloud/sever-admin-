# Mr.mướp Admin Server

Server quản trị gói cho app Mr.mướp VIP.

## API

### 1. Login Admin
```
POST /api/admin/login
Body: { "token": "ADMIN_TOKEN", "deviceId": "xxx" }
→ { "ok": true, "accessToken": "...", "expiresIn": 900 }
```

### 2. Lấy danh sách gói (công khai - chỉ gói đang bật)
```
GET /api/packages
```

### 3. Admin - Lấy tất cả gói
```
GET /api/admin/packages
Header: Authorization: Bearer <accessToken>
```

### 4. Admin - Tạo gói
```
POST /api/admin/packages
Header: Authorization: Bearer <accessToken>
Body: {
  "name": "Tên gói",
  "description": "Mô tả",
  "version": "1.0.0",
  "tag": "VIP",
  "downloadUrl": "https://...",
  "sha256": "...",
  "targetPath": "/data/local/tmp/",
  "imageUrl": "https://..."
}
```

### 5. Admin - Sửa gói
```
PUT /api/admin/packages/:id
Header: Authorization: Bearer <accessToken>
```

### 6. Admin - Xóa gói
```
DELETE /api/admin/packages/:id
Header: Authorization: Bearer <accessToken>
```

### 7. Admin - Bật/Tắt gói
```
PATCH /api/admin/packages/:id/toggle
Header: Authorization: Bearer <accessToken>
```

## Deploy Render

1. Đẩy code lên GitHub
2. Render → New Web Service → chọn repo
3. Build: `npm install`
4. Start: `npm start`
5. Environment Variables:
   - ADMIN_TOKEN = chuỗi dài của bạn
   - JWT_SECRET = chuỗi dài khác

## Local test

```bash
npm install
node server.js
```
