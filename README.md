# Hospital Appointment & Ambulance System API Documentation

## Base URL

```
https://your-api-domain.com/api/v1
```

## Authentication

API uses JWT tokens for authentication.

**How to authenticate:**

1. Get a token from login or register endpoint
2. Add to request header: `Authorization: Bearer YOUR_TOKEN`

## API Endpoints

### Authentication

| Method | Endpoint                          | Description            | Authentication |
| ------ | --------------------------------- | ---------------------- | -------------- |
| POST   | `/auth/register`                  | Register a new user    | No             |
| POST   | `/auth/login`                     | Login user             | No             |
| GET    | `/auth/me`                        | Get current user       | Yes            |
| POST   | `/auth/forgotpassword`            | Request password reset | No             |
| PUT    | `/auth/resetpassword/:resettoken` | Reset password         | No             |
| PUT    | `/auth/updatedetails`             | Update user details    | Yes            |
| PUT    | `/auth/updatepassword`            | Update password        | Yes            |
| GET    | `/auth/logout`                    | Logout user            | Yes            |

### Users (Admin Only)

| Method | Endpoint     | Description     | Authentication |
| ------ | ------------ | --------------- | -------------- |
| GET    | `/users`     | Get all users   | Admin          |
| GET    | `/users/:id` | Get single user | Admin          |
| POST   | `/users`     | Create user     | Admin          |
| PUT    | `/users/:id` | Update user     | Admin          |
| DELETE | `/users/:id` | Delete user     | Admin          |

### Doctors

| Method | Endpoint                                  | Description                   | Authentication |
| ------ | ----------------------------------------- | ----------------------------- | -------------- |
| GET    | `/doctors`                                | Get all doctors               | No             |
| GET    | `/doctors/:id`                            | Get single doctor             | No             |
| POST   | `/doctors`                                | Create doctor                 | Admin          |
| PUT    | `/doctors/:id`                            | Update doctor                 | Admin          |
| DELETE | `/doctors/:id`                            | Delete doctor                 | Admin          |
| GET    | `/doctors/specialization/:specialization` | Get doctors by specialization | No             |
| PATCH  | `/doctors/:id/availability`               | Update doctor availability    | Admin          |
| PUT    | `/doctors/:id/photo`                      | Upload doctor photo           | Admin          |
| GET    | `/doctors/:id/available-slots`            | Get available time slots      | No             |

### Appointments

| Method | Endpoint            | Description            | Authentication |
| ------ | ------------------- | ---------------------- | -------------- |
| GET    | `/appointments`     | Get all appointments   | Admin          |
| GET    | `/appointments/:id` | Get single appointment | User/Admin     |
| POST   | `/appointments`     | Create appointment     | User           |
| PUT    | `/appointments/:id` | Update appointment     | User/Admin     |
| DELETE | `/appointments/:id` | Delete appointment     | User/Admin     |

### Ambulance

| Method | Endpoint                 | Description                | Authentication |
| ------ | ------------------------ | -------------------------- | -------------- |
| GET    | `/ambulances`            | Get all ambulance bookings | Admin          |
| GET    | `/ambulances/:id`        | Get single booking         | Public         |
| POST   | `/ambulances`            | Create ambulance booking   | Public         |
| PUT    | `/ambulances/:id`        | Update ambulance booking   | Admin          |
| DELETE | `/ambulances/:id`        | Delete ambulance booking   | Admin          |
| PATCH  | `/ambulances/:id/status` | Update status              | Admin          |

### Reviews

| Method | Endpoint                     | Description        | Authentication |
| ------ | ---------------------------- | ------------------ | -------------- |
| GET    | `/reviews`                   | Get all reviews    | Public         |
| GET    | `/doctors/:doctorId/reviews` | Get doctor reviews | Public         |
| POST   | `/doctors/:doctorId/reviews` | Add review         | User           |
| PUT    | `/reviews/:id`               | Update review      | User           |
| DELETE | `/reviews/:id`               | Delete review      | User           |

## Request & Response Examples

### Authentication

#### Register User

```
POST /auth/register
```

Request body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St",
  "gender": "Male",
  "birthDate": "1990-01-01"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```
POST /auth/login
```

Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Doctors

#### Get All Doctors

```
GET /doctors
```

Query parameters:

- `specialization` - Filter by specialization
- `select` - Fields to include
- `sort` - Sort by field(s)
- `page` - Page number
- `limit` - Results per page

Response:

```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": {
      "page": 2,
      "limit": 25
    }
  },
  "data": [
    {
      "_id": "60a1b2c3d4e5f67890abcdef",
      "name": "Dr. Jane Smith",
      "specialization": "Cardiology",
      "hospital": {
        "name": "City General Hospital"
      },
      "rating": 4.8,
      "fee": {
        "consultation": 2000
      }
    },
    {
      "_id": "60a1b2c3d4e5f67890abcdff",
      "name": "Dr. Michael Johnson",
      "specialization": "Neurology",
      "hospital": {
        "name": "Regional Medical Center"
      },
      "rating": 4.6,
      "fee": {
        "consultation": 2500
      }
    }
  ]
}
```

#### Create Doctor

```
POST /doctors
```

Request body:

```json
{
  "name": "Dr. Robert Williams",
  "specialization": "Dermatology",
  "education": "MBBS, MD Dermatology",
  "experienceYears": 10,
  "experience": "10+ years in clinical dermatology",
  "hospital": "Skin Care Center",
  "hospitalAddress": "123 Medical Blvd",
  "from": "10:00",
  "to": "18:00",
  "workingDays": "Monday,Tuesday,Thursday,Friday",
  "slotDuration": 30,
  "fee": 2000
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "60a1b2c3d4e5f67890abcdef",
    "name": "Dr. Robert Williams",
    "specialization": "Dermatology",
    "education": "MBBS, MD Dermatology",
    "experience": {
      "years": 10,
      "details": "10+ years in clinical dermatology"
    },
    "hospital": {
      "name": "Skin Care Center",
      "address": "123 Medical Blvd"
    },
    "workingHours": {
      "from": "10:00",
      "to": "18:00",
      "workingDays": ["Monday", "Tuesday", "Thursday", "Friday"],
      "slotDuration": 30
    },
    "fee": {
      "consultation": 2000
    }
  }
}
```

### Appointments

#### Create Appointment

```
POST /appointments
```

Request body:

```json
{
  "name": "Patient Name",
  "phone": "1234567890",
  "doctor": "60a1b2c3d4e5f67890abcdef",
  "chamber": "City General Hospital",
  "consultationType": "Face to Face",
  "appointmentType": "New Patient",
  "date": "2023-08-15T10:30:00Z"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "60a1b2c3d4e5f67890abcd00",
    "name": "Patient Name",
    "phone": "1234567890",
    "doctor": {
      "_id": "60a1b2c3d4e5f67890abcdef",
      "name": "Dr. Jane Smith",
      "specialization": "Cardiology"
    },
    "chamber": "City General Hospital",
    "consultationType": "Face to Face",
    "appointmentType": "New Patient",
    "date": "2023-08-15T10:30:00Z",
    "status": "Pending"
  }
}
```

### Ambulance

#### Book Ambulance

```
POST /ambulances
```

Request body:

```json
{
  "fromLocation": "Zindabazar",
  "destination": "Sylhet Medical",
  "ambulanceType": "ICU",
  "date": "2023-08-15",
  "name": "Rahim Uddin",
  "phone": "01700000000"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "60a1b2c3d4e5f67890abcd03",
    "fromLocation": "Zindabazar",
    "destination": "Sylhet Medical",
    "ambulanceType": "ICU",
    "date": "2023-08-15T00:00:00.000Z",
    "name": "Rahim Uddin",
    "phone": "01700000000",
    "status": "Pending",
    "createdAt": "2023-08-10T15:30:00.000Z"
  }
}
```

#### Update Ambulance Status

```
PATCH /ambulances/60a1b2c3d4e5f67890abcd03/status
```

Request body:

```json
{
  "status": "Confirmed"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "60a1b2c3d4e5f67890abcd03",
    "fromLocation": "Zindabazar",
    "destination": "Sylhet Medical",
    "ambulanceType": "ICU",
    "date": "2023-08-15T00:00:00.000Z",
    "name": "Rahim Uddin",
    "phone": "01700000000",
    "status": "Confirmed",
    "updatedAt": "2023-08-11T09:15:00.000Z"
  }
}
```

### Reviews

#### Add Review

```
POST /doctors/60a1b2c3d4e5f67890abcdef/reviews
```

Request body:

```json
{
  "rating": 5,
  "text": "Excellent doctor, very professional and knowledgeable."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "60a1b2c3d4e5f67890abcd04",
    "rating": 5,
    "text": "Excellent doctor, very professional and knowledgeable.",
    "doctor": "60a1b2c3d4e5f67890abcdef",
    "user": "60a1b2c3d4e5f67890abcde0",
    "createdAt": "2023-08-12T10:45:00.000Z"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

Common error status codes:

- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Server Error
