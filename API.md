# Smart Leads Dashboard - API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require authentication via HttpOnly cookie (`token`) or `Authorization: Bearer <token>` header.

## Response Format

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

### Paginated List

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error

```json
{
  "success": false,
  "message": "Error description",
  "errors": [{ "msg": "Validation message" }]
}
```

---

## Authentication

### Register

`POST /auth/register`

**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

- New users are assigned the `sales` role by default.

**Response:** `201` with user and JWT token (also set as HttpOnly cookie).

### Login

`POST /auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200` with user and token.

### Logout

`POST /auth/logout`

Clears the auth cookie.

### Current User

`GET /auth/me` (Protected)

Returns the authenticated user's profile including `role`.

---

## Leads

All lead routes require authentication.

### List Leads (with filters & pagination)

`GET /leads`

**Query Parameters:**

| Parameter | Type   | Description                                      |
|-----------|--------|--------------------------------------------------|
| status    | string | `New`, `Contacted`, `Qualified`, or `Lost`       |
| source    | string | `Website`, `Instagram`, or `Referral`            |
| search    | string | Search by name or email (case-insensitive)       |
| sort      | string | `latest` (default) or `oldest`                   |
| page      | number | Page number (default: 1, **10 records per page**) |

**Example:**

```
GET /leads?status=Qualified&source=Instagram&search=Rahul&sort=latest&page=1
```

### Get Single Lead

`GET /leads/:id`

### Create Lead

`POST /leads`

**Body:**

```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram"
}
```

### Update Lead

`PUT /leads/:id`

Same body fields as create.

### Delete Lead

`DELETE /leads/:id`

**RBAC:** Admin only (`403` for sales users).

### Export CSV

`GET /leads/export/csv`

Accepts the same query parameters as list endpoint. Returns a CSV file with filtered results.

---

## Health Check

`GET /health`

```json
{
  "success": true,
  "message": "Smart Leads API is running"
}
```

---

## Role-Based Access Control

| Action        | Admin | Sales |
|---------------|-------|-------|
| View leads    | ✅    | ✅    |
| Create lead   | ✅    | ✅    |
| Update lead   | ✅    | ✅    |
| Delete lead   | ✅    | ❌    |
| Export CSV    | ✅    | ✅    |

---

## Status Codes

| Code | Usage                    |
|------|--------------------------|
| 200  | Success                  |
| 201  | Created                  |
| 400  | Validation error         |
| 401  | Unauthorized             |
| 403  | Forbidden (RBAC)         |
| 404  | Not found                |
| 500  | Server error             |
