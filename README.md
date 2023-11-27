# NodeJs, Express,Mongodb and Typescript

This is the boilerplate for NodeJs, Express,Mongodb and Typescript.Cloudinary is used for image upload.

## Installation

<!-- yarn or npm install -->

```bash
yarn
```

or

```bash
npm install
```

Also create a cloudinary account and add the cloudinary informations in config.env file.

## Usage

copy the example.config.env file and rename it to config.env and add the required informations.

### Development

```bash
yarn dev
```

or

```bash
npm run dev
```

### Production

```bash
yarn prod
```

or

```bash
npm run prod
```

## Routes

### Authentication

| Route                                    | Method | Description     |
| ---------------------------------------- | ------ | --------------- |
| /api/v1/users/login                      | POST   | Login           |
| /api/v1/users/register                   | POST   | Register        |
| /api/v1/users/forgot-password            | POST   | Forgot Password |
| /api/v1/users/reset-password/:resetToken | PATCH  | Reset Password  |
| /api/v1/users/verify-email/:token        | GET    | Verify Email    |
| /api/v1/users/update-password            | PATCH  | Update Password |

### User


| Route                    | Method | Description       |
| ------------------------ | ------ | ----------------- |
| /api/v1/users/my-profile | GET    | Get My Profile    |
| /api/v1/users/update-me  | PATCH  | Update My Profile |
| /api/v1/users            | GET    | Get All Users     |
| /api/v1/users            | POST   | Create New User   |
| /api/v1/users/:id        | GET    | Get One User      |
| /api/v1/users/:id        | PATCH  | Update One User   |
| /api/v1/users/:id        | DELETE | Delete One User   |
