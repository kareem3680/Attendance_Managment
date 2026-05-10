# Attendance System - API Documentation

## Overview

This API is designed for the **Attendance Management System**.  
It is a comprehensive backend solution for employee attendance tracking, managing employees, attendance records, reports, and user authentication.

---

# Common Features

All list endpoints support the following features:

| Feature         | Description                   | Example                            |
| --------------- | ----------------------------- | ---------------------------------- |
| Pagination      | Split results into pages      | `?page=2&limit=20`                 |
| Sorting         | Sort results by a field       | `?sort=-createdAt` or `?sort=name` |
| Field Selection | Return only specific fields   | `?fields=name,email,phone`         |
| Filtering       | Filter results by exact match | `?status=active&role=admin`        |
| Range Filtering | Filter by numeric ranges      | `?jobId[lte]=200&jobId[gte]=100`   |
| Date Range      | Filter by date interval       | `?from=2025-01-01&to=2025-12-31`   |
| Search          | Text search in string fields  | `?search=101`                      |

---

# Identity Module

| Endpoint                         | Method | Description                               |
| -------------------------------- | ------ | ----------------------------------------- |
| `/api/v1/auth/signUp`            | POST   | Register a new user                      |
| `/api/v1/auth/logIn`             | POST   | Login                                    |
| `/api/v1/updatePassword`         | PUT    | Change current user password             |

---

# User Dashboard Module

## Attendance Actions

| Endpoint                            | Method | Description                           |
| ----------------------------------- | ------ | ------------------------------------- |
| `/api/v1/attendance/checkin`        | POST   | Record check-in time                  |
| `/api/v1/attendance/toggle-break`   | POST   | Start or end break                    |
| `/api/v1/attendance/checkout`       | POST   | Record check-out time                 |

## User Profile Endpoints

| Endpoint                               | Method | Description                           |
| -------------------------------------- | ------ | ------------------------------------- |
| `/api/v1/userDashboard/getMyData`      | GET    | Get current user data                |
| `/api/v1/userDashboard/updateMyData`   | PUT    | Update current user data             |
| `/api/v1/save-fcm-token`               | POST   | Save FCM token for push notifications |

---

# Admin Dashboard Module

## Attendance Management Endpoints

| Endpoint                                      | Method | Description                           |
| --------------------------------------------- | ------ | ------------------------------------- |
| `/api/v1/attendance`                          | GET    | Get all attendance records (paginated, filtered) |
| `/api/v1/attendance/{attendanceId}`           | GET    | Get specific attendance record        |
| `/api/v1/attendance/summary/{userId}`         | GET    | Get attendance summary for user       |

## User Management Endpoints

| Endpoint                                     | Method | Description                          |
| -------------------------------------------- | ------ | ------------------------------------ |
| `/api/v1/adminDashboard`                     | POST   | Create a new user                    |
| `/api/v1/adminDashboard`                     | GET    | Get all users (paginated, filtered)  |
| `/api/v1/adminDashboard/{userId}`            | GET    | Get specific user                    |
| `/api/v1/adminDashboard/{userId}`            | PUT    | Update user role                     |
| `/api/v1/adminDashboard/deactivate/{userId}` | PUT    | Deactivate user                      |
| `/api/v1/adminDashboard/activate/{userId}`   | PUT    | Activate user                        |

---

# Notifications Module

| Endpoint                                      | Method | Description                          |
| --------------------------------------------- | ------ | ------------------------------------ |
| `/api/v1/notifications`                       | POST   | Create notification in database only |
| `/api/v1/notifications/send`                  | POST   | Create and send notification         |
| `/api/v1/notifications`                       | GET    | Get all notifications                |
| `/api/v1/notifications/mark-all`              | PATCH  | Mark all notifications as read       |
| `/api/v1/notifications/mark/{notificationId}` | PATCH  | Mark specific notification as read   |

---

# Chat Module

| Endpoint                                      | Method | Description                           |
| --------------------------------------------- | ------ | ------------------------------------- |
| `/api/v1/chat/conversations/start`            | POST   | Create or get conversation with user  |
| `/api/v1/chat/conversations`                  | GET    | Get user conversations                |
| `/api/v1/chat/messages/{conversationId}`      | POST   | Add message to conversation           |
| `/api/v1/chat/messages/{conversationId}`      | GET    | Get conversation messages             |
| `/api/v1/chat/messages/seen/{conversationId}` | PUT    | Mark messages as seen                 |

---

# Authentication

JWT is used for authentication. Most endpoints require a Bearer token in the Authorization header:
Authorization: Bearer {{JWT}}

text

---

# Attendance Status Flow

checkin -> on_break -> back_from_break -> checkout

| Status             | Description                          |
| ------------------ | ------------------------------------ |
| `checked_in`       | Employee has checked in              |
| `on_break`         | Employee is on break                 |
| `back_from_break`  | Employee returned from break         |
| `checked_out`      | Employee has checked out             |

---

# Notes

- All list endpoints support pagination, sorting, filtering, and search.
- Date fields should be sent in ISO 8601 format (e.g., `2025-09-26`).
- Check-in must be performed before check-out.
- Break can only be toggled after check-in and before check-out.
- FCM tokens are used for push notifications.
- The `{{MainHost}}` variable should be replaced with your API base URL.
