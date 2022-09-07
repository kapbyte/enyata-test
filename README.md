
## The project is built mainly with the following tools:

- NodeJS
- ExpressJS
- TypeScript
- MongoDB
- OAuth 2.0
- JWT (JSON Web Token)

It makes use of the **MVC pattern** i.e. Model View Controller.

---

#### To start setting up the project

Step 1: Clone the repo

```bash
git clone https://github.com/kapbyte/enyata-test.git
```

Step 2: cd into the cloned repo and run:

```bash
npm install
```

:mega:  Every project config is already in config folder, so you can quickly run the project. So don't worry about setting up a .env file

Step 3: Start the API by

```bash
npm start
```

### API Usage

- OAuth 2.0 [API => GET(http://localhost:8080/auth/google/url)]

![Recordit GIF](http://g.recordit.co/Lkwa8jnhg3.gif)

---

- Revoke Auth [API => PATCH(http://localhost:8080/auth/revoke/:user_id)]  <br/>Note: Auth token granted when user singup/login is needed also with the user id.

![Recordit GIF](http://g.recordit.co/Hbg7ksqU5x.gif)

---

- Blog post based on tags [API => GET(http://localhost:8080/blog/tags)]  <br/>Note: Auth token granted when user singup/login is needed, and also pass token to request header

![Recordit GIF](http://g.recordit.co/abUk7281V1.gif)

---


## Author

- [**Kelechi Chinaka**](https://kapbyte.netlify.app/)



