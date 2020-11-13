# Node.js server-side Firebase API authentication and user roles

This repo contains Firebase authentication mechanism suitable for any client-side proejct requiring server side login.

This API is built using ES6 and compiled with Babel.

# How to install and run

### Add required ENV runtime variables

Please see `.env.sample`.
Add a new `.env` file in the root directory and add the following secret private key (replace value with the real key from Firebase admin console):

```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n1234567890\n-----END PRIVATE KEY-----\n"
```

This key is required to interact with Firebase admin (e.g set user roles and look up users by email).

### Install dependencies and start

```
npm i
npm start
```

Running the `start` command will build to project with Babel to `/build` and start the Express web server on localhost port `3001`.

Or start with a different port:

```
PORT=1234 npm start
```

## Build

This command compiles the native ES6 code to ES5.
Reason being, that I use features like `async/await` and `import` which is not fully supported in latest Node LTS.

```
npm run build
```

# Available routes

## Login

There are currently two users in the system:

Admin user (full access)

```
admin@test.com
123456
```

Read only user, will _not_ be able to login and returns `401 Unauthorized`

```
user@test.com
123456
```

```
POST /api/admin_only
```

Example

```sh
curl --location --request POST 'http://localhost:3001/api/admin_only' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@test.com",
    "password": "123456"
}'
```

Success response

```json
{
  "uid": "x96ynDC0QHUscRUx19LB0ZeQt853",
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjJmOGI1NTdjMWNkMWUxZWM2ODBjZTkyYWFmY2U0NTIxMWUxZTRiNDEiLCJ0eXAiOiJKV1QifQ.eyJhZG1pbiI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2VjbGlweC00ZmIwZiIsImF1ZCI6ImVjbGlweC00ZmIwZiIsImF1dGhfdGltZSI6MTYwNTE3NDY3MSwidXNlcl9pZCI6Ing5NnluREMwUUhVc2NSVXgxOUxCMFplUXQ4NTMiLCJzdWIiOiJ4OTZ5bkRDMFFIVXNjUlV4MTlMQjBaZVF0ODUzIiwiaWF0IjoxNjA1MTc0NjcyLCJleHAiOjE2MDUxNzgyNzIsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsiYWRtaW5AdGVzdC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.np7g2TFP4SRfPmyn60aRc2nSbpFzEZvwyc6Wc-OHLRqPa5t2zVy2vweBSI1IaWo1dL93N_A5idQIKFyJzS2YRdFTavMXEEh_plxx87IB8qzkr-OQW7y7rpQreXhH1z8AoKY9bqgwweXEH3iGarr0Vu5A4jqemYzV9LSdLzlC9_GU8PNAGDGZ1219g_zlm9gFRr5p3M4naHVB7fjBT6m0ugFr_Qte-RmvWdZY4M2tlnZKp-DoTy47fGx0O9gCWhqiI6iKnxW-agAglURpoZ6_VWgZFhjtnbSObU9F64SqtKv4BFIW0PQAtsXHRmV7wFpVcdzk6u73xAkqhM3tusIFvQ",
  "email": "admin@test.com",
  "userRole": {
    "admin": true
  }
}
```

Error response (not admin user)

```json
{
  "message": "Unauthorized",
  "status": 401
}
```

```json (user not found)
{
  "message": "There is no user record corresponding to this identifier. The user may have been deleted.",
  "status": 401,
  "code": "auth/user-not-found"
}
```

## Update user role

This end-point is used to assign roles to users. Currently two roles exist: "admin" and "read only". In a real world app, this would be protected by an admin API key, JWT or only exposed internally (e.g via IP range).

The end-point is utilising Firebase's custom claims API https://firebase.google.com/docs/auth/admin/custom-claims

```
PATCH /api/user/role
```

Example

```sh
curl --location --request PATCH 'http://localhost:3001/api/user/role' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "admin@test.com",
    "isAdmin": true
}'
```

Success response
`200 OK`

Error response

```json
{
  "code": "auth/user-not-found",
  "message": "There is no user record corresponding to the provided identifier."
}
```

# Notes

- The route to update the user's role should not be publicy open or should have some mechanisms of protection (e.g admin API key, JWT, IP range)

- Live API docs like Swagger or similar would be nice to have
- Apollo GraphQL implementation rather than REST?
