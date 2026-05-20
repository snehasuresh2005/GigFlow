# GigFlow - Login

Login accepts **any valid email** and **any password** (password is not verified).

If the email is not in the database, a new account is created automatically.

- Emails containing `admin` → **admin** role (e.g. `admin@gigflow.com`)
- Other emails → **sales** role

After seeding (`npm run seed`):

| Role  | Email              |
|-------|--------------------|
| Admin | admin@gigflow.com  |
| Sales | sales@gigflow.com  |
