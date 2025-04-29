# Hospital Appointment & Ambulance Booking System

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Environment Variables](#environment-variables)
4. [Database Models](#database-models)
5. [API Reference](#api-reference)
   - [Authentication](#authentication)
   - [Users](#users)
   - [Doctors](#doctors)
   - [Appointments](#appointments)
   - [Ambulance](#ambulance)
   - [Reviews](#reviews)
6. [Middleware](#middleware)
7. [Error Handling](#error-handling)
8. [Deployment](#deployment)
9. [Contributing](#contributing)

## Introduction

The Hospital Appointment & Ambulance Booking System is a comprehensive backend solution designed to facilitate medical appointments and ambulance services. This system allows patients to book appointments with doctors across various specializations, schedule ambulance pickups, and manage their healthcare needs efficiently.

**Key Features:**

- User authentication and authorization
- Doctor profiles and scheduling
- Appointment booking and management
- Ambulance booking service
- Review and rating system for doctors

## System Architecture

The system is built using a modern tech stack:

- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Vercel

The application follows an MVC (Model-View-Controller) pattern with the following structure:

```
appointment_backend/
├── config/           # Configuration files (DB connection)
├── controllers/      # Route controllers
├── middleware/       # Custom middleware functions
├── models/           # Database models (Mongoose schemas)
├── routes/           # API routes
├── utils/            # Utility functions
├── server.js         # Entry point
└── package.json      # Project dependencies
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd appointment_backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables (see next section)

4. Start the development server:
   ```
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_app
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FILE_UPLOAD_PATH=./public/uploads
MAX_FILE_UPLOAD=1000000
```

## Database Models

### User Model

Represents patients and administrators in the system.

**Fields:**

- `name` - User's full name
- `email` - Unique email address
- `phone` - Contact phone number
- `address` - Physical address
- `gender` - User's gender (Male, Female, Other)
- `birthDate` - Date of birth
- `password` - Hashed password
- `photo` - Profile photo
- `role` - User role (user, admin)
- `resetPasswordToken` - For password recovery
- `isEmailConfirmed` - Email verification status
- `lastLogin` - Timestamp of last login
- `active` - Account status

### Doctor Model

Represents healthcare professionals available for appointments.

**Fields:**

- `name` - Doctor's name
- `specialization` - Medical specialization
- `qualifications` - Array of education credentials
- `experience` - Years of practice and details
- `hospital` - Hospital name and address
- `contactInfo` - Professional contact information
- `workingHours` - Schedule and availability
- `rating` - Average patient rating
- `fee` - Consultation and follow-up fees
- `languages` - Languages spoken
- `image` - Profile photo
- `available` - Availability status

### Appointment Model

Represents a booking between a patient and doctor.

**Fields:**

- `name` - Patient name
- `phone` - Contact number
- `doctor` - Reference to Doctor model
- `chamber` - Location information
- `consultationType` - Type of consultation
- `appointmentType` - Category of appointment
- `date` - Scheduled date and time
- `status` - Booking status

### Ambulance Model

Represents ambulance booking services.

**Fields:**

- `fromLocation` - Pickup location
- `destination` - Drop-off location
- `ambulanceType` - Type of ambulance service
- `date` - Scheduled date
- `name` - Patient/requester name
- `phone` - Contact number
- `status` - Booking status

### Review Model

Represents patient feedback for doctors.

**Fields:**

- `text` - Review content
- `rating` - Numerical rating (1-10)
- `doctor` - Reference to Doctor model
- `user` - Reference to User model

### DoctorSchedule Model

Contains detailed scheduling information for doctors.

**Fields:**

- `doctorId` - Reference to Doctor model
- `schedule` - Array of day and time slot objects

## API Reference

### Authentication

#### Register User

- **URL**: `/api/v1/auth/register`
- **Method**: `POST`
- **Body**:
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
- **Response**: JWT token

#### Login

- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: JWT token

#### Get Current User

- **URL**: `/api/v1/auth/me`
- **Method**: `GET`
- **Auth**: Required
- **Response**: User profile

### Users

#### Get All Users

- **URL**: `/api/v1/users`
- **Method**: `GET`
- **Auth**: Admin only
- **Query Parameters**:
  - `select` - Fields to return
  - `sort` - Sorting criteria
  - `page` - Page number
  - `limit` - Results per page

#### Get Single User

- **URL**: `/api/v1/users/:id`
- **Method**: `GET`
- **Auth**: Admin only
- **Response**: User profile

#### Create User

- **URL**: `/api/v1/users`
- **Method**: `POST`
- **Auth**: Admin only
- **Body**: User data
- **Response**: Created user

#### Update User

- **URL**: `/api/v1/users/:id`
- **Method**: `PUT`
- **Auth**: Admin only
- **Body**: Updated user data
- **Response**: Updated user

#### Delete User

- **URL**: `/api/v1/users/:id`
- **Method**: `DELETE`
- **Auth**: Admin only
- **Response**: Success message

### Doctors

#### Get All Doctors

- **URL**: `/api/v1/doctors`
- **Method**: `GET`
- **Query Parameters**:
  - `specialization` - Filter by specialization
  - `select` - Fields to return
  - `sort` - Sorting criteria
  - `page` - Page number
  - `limit` - Results per page
- **Response**: List of doctors

#### Get Doctor by ID

- **URL**: `/api/v1/doctors/:id`
- **Method**: `GET`
- **Response**: Doctor details with upcoming appointments

#### Create Doctor

- **URL**: `/api/v1/doctors`
- **Method**: `POST`
- **Auth**: Required
- **Body**: Doctor details
- **Response**: Created doctor

#### Update Doctor

- **URL**: `/api/v1/doctors/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Body**: Updated doctor data
- **Response**: Updated doctor

#### Delete Doctor

- **URL**: `/api/v1/doctors/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Response**: Success message

#### Get Available Slots

- **URL**: `/api/v1/doctors/:id/available-slots`
- **Method**: `GET`
- **Query Parameters**:
  - `date` - Date to check availability
- **Response**: List of available time slots

### Appointments

#### Get All Appointments

- **URL**: `/api/v1/appointments`
- **Method**: `GET`
- **Auth**: Admin only
- **Response**: List of appointments

#### Get Appointment by ID

- **URL**: `/api/v1/appointments/:id`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Appointment details

#### Create Appointment

- **URL**: `/api/v1/appointments`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "Patient Name",
    "phone": "1234567890",
    "doctor": "doctor_id_here",
    "chamber": "Hospital Name",
    "consultationType": "Face to Face",
    "appointmentType": "New Patient",
    "date": "2023-08-15T10:30:00Z"
  }
  ```
- **Response**: Created appointment

#### Update Appointment

- **URL**: `/api/v1/appointments/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Body**: Updated appointment data
- **Response**: Updated appointment

#### Delete Appointment

- **URL**: `/api/v1/appointments/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Response**: Success message

### Ambulance

#### Get All Ambulance Bookings

- **URL**: `/api/v1/ambulances`
- **Method**: `GET`
- **Auth**: Admin only
- **Response**: List of ambulance bookings

#### Get Ambulance Booking by ID

- **URL**: `/api/v1/ambulances/:id`
- **Method**: `GET`
- **Response**: Booking details

#### Create Ambulance Booking

- **URL**: `/api/v1/ambulances`
- **Method**: `POST`
- **Body**:
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
- **Response**: Created booking

#### Update Ambulance Booking

- **URL**: `/api/v1/ambulances/:id`
- **Method**: `PUT`
- **Auth**: Admin only
- **Body**: Updated booking data
- **Response**: Updated booking

#### Update Ambulance Status

- **URL**: `/api/v1/ambulances/:id/status`
- **Method**: `PATCH`
- **Auth**: Admin only
- **Body**:
  ```json
  {
    "status": "Confirmed"
  }
  ```
- **Response**: Updated booking

### Reviews

#### Get All Reviews

- **URL**: `/api/v1/reviews`
- **Method**: `GET`
- **Response**: List of reviews

#### Get Reviews for Doctor

- **URL**: `/api/v1/doctors/:doctorId/reviews`
- **Method**: `GET`
- **Response**: List of doctor's reviews

#### Add Review

- **URL**: `/api/v1/doctors/:doctorId/reviews`
- **Method**: `POST`
- **Auth**: Required
- **Body**:
  ```json
  {
    "rating": 5,
    "text": "Excellent doctor, very attentive and knowledgeable."
  }
  ```
- **Response**: Created review

#### Update Review

- **URL**: `/api/v1/reviews/:id`
- **Method**: `PUT`
- **Auth**: Required
- **Body**: Updated review data
- **Response**: Updated review

#### Delete Review

- **URL**: `/api/v1/reviews/:id`
- **Method**: `DELETE`
- **Auth**: Required
- **Response**: Success message

## Middleware

### Authentication Middleware

Protects routes and verifies JWT tokens:

- `protect` - Verifies user authentication
- `authorize` - Verifies user role permissions

### Advanced Results

Adds pagination, filtering and sorting to API responses.

### Error Handler

Custom error handling middleware for consistent API responses.

## Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Deployment

The application is configured for deployment on Vercel.

1. Install Vercel CLI:

   ```
   npm install -g vercel
   ```

2. Deploy:

   ```
   vercel
   ```

3. Set environment variables in the Vercel dashboard.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
