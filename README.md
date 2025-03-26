# News Aggregator API

The project involves creating a RESTful API for aggregating and managing news articles based on user preferences using Node.js and Express.js. It includes user authentication, news filtering, and various article management functionalities.

The project utilizes the **GNews API** for fetching news articles. You can read the docs for an API key at [GNews](https://gnews.io/docs/v4#introduction).

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/airtribe-projects/news-aggregator-api-ks6201
   ```

2. Navigate to the project directory:
   ```bash
   cd news-aggregator-api-ks6201
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Import the PostgreSQL database schema:
   - Ensure you have PostgreSQL installed and running.
   - Log in to PostgreSQL:
     ```bash
     psql -U your_username
     ```
   - Create a new database if you haven't already:
     ```sql
     CREATE DATABASE db_news_aggregator;
     ```
   - Exit PostgreSQL:
     ```sql
     \q
     ```
   - Import the schema (without data) from the `db_news_aggregator.sql` file:
     ```bash
     psql -U your_username -d db_news_aggregator -f path/to/db_news_aggregator.sql
     ```
     - `your_username`: PostgreSQL username.
     - `db_news_aggregator`: The name of the database you're creating.
     - `path/to/db_news_aggregator.sql`: The path to your `db_news_aggregator.sql` file.

5. Configure environment variables:
   - Create a `.env` file in the root of your project.
   - Add the following environment variables to the `.env` file:
     ```bash
     NEWS_AGG_API_KEY=your_gnews_api_key_here
     PORT=3000
     NODE_ENV=development
     DB_HOST=your_database_host_here
     DB_USER=your_database_user_here
     DB_PASS=your_database_password_here
     DATABASE=db_news_aggregator
     REDIS_URL=redis://localhost:6379
     JWT_SEC=your_jwt_secret_here
     ```

6. Start the application:
   - For local development:
     ```bash
     npm start
     ```
   - For deployment (using pm2):
     ```bash
     pm2 start app.js --name news-aggregator-api
     ```

---

## Environment Variables

The project requires the following environment variables to be set up:

- `NEWS_AGG_API_KEY`: API key for the GNews aggregator service. You can obtain it from [GNews](https://gnews.io).
- `PORT`: Port on which the server will run (default is `3000`).
- `NODE_ENV`: Environment mode (set to `development` for local development).
- `DB_HOST`: The host of the PostgreSQL database.
- `DB_USER`: The username to access the PostgreSQL database.
- `DB_PASS`: The password for the PostgreSQL database.
- `DATABASE`: The name of the PostgreSQL database (e.g., `db_news_aggregator`).
- `REDIS_URL`: URL of the Redis instance (e.g., `redis://localhost:6379`).
- `JWT_SEC`: Secret key for generating JWT tokens.

Be sure to replace `your_gnews_api_key_here`, `your_database_host_here`, `your_database_user_here`, `your_database_password_here`, and `your_jwt_secret_here` with actual values.

Once the `.env` file is set up with the necessary values, you can run the project locally or deploy it as instructed.

---

## Optional: Run Tests

1. To run tests, use:
   ```bash
   npm run test
   ```

---

## API Documentation

### POST `/users/signup`

**Description:**  
Handles user signup by creating a new user account.

**Route:**
```js
userRouter.post(
    "/signup", 
    bodyValidate(createUserVSchema),
    asyncHandler(UserControllers.signup)
);
```

**Request Body Parameters:**

- **username** (required): The username of the user.
  - **Type**: `string`
  - **Validation**: Must be provided and non-empty.

- **email** (required): The email address of the user.
  - **Type**: `string`
  - **Validation**: Must be a valid email format and non-empty.

- **password** (required): The password for the user account.
  - **Type**: `string`
  - **Validation**: Must be provided and meet a specified password strength requirement (e.g., at least 8 characters).

- **preferences** (required): User news preferences.
  - **Type**: `string[]`
  - **Validation**: Must have length atleast 1.

**Response:**
- **201 Created**: Returns a success message indicating the user has been created successfully.

- **400 Bad Request**: Returns an error if the provided data is invalid (e.g., missing required fields or invalid email format).

**Middleware:**
- `bodyValidate`: Validates the request body using the `createUserVSchema` validation schema.

**Controller:**
- `UserControllers.signup`: Handles the request and creates a new user.

---

### POST `/users/login`

**Description:**  
Handles user login by verifying user credentials.

**Route:**
```js
userRouter.post(
    "/login", 
    bodyValidate(loginUserVSchema),
    asyncHandler(UserControllers.login)
);
```

**Request Body Parameters:**

- **email** (required): The email address of the user.
  - **Type**: `string`
  - **Validation**: Must be a valid email format and non-empty.

- **password** (required): The password for the user account.
  - **Type**: `string`
  - **Validation**: Must be provided and match the password associated with the email.

**Response:**
- **200 OK**: Returns a success message and a token if the user credentials are correct.

- **401 UnAuthorized**: Returns an error if the login data is invalid or the email/password combination is incorrect.

**Middleware:**
- `bodyValidate`: Validates the request body using the `loginUserVSchema` validation schema.

**Controller:**
- `UserControllers.login`: Handles the request and verifies the user credentials, returning a login token on success.

---

### GET `/users/preferences`

**Description:**  
Retrieves the preferences of the authenticated user.

**Route:**
```js
userRouter.get(
    "/preferences", 
    authMiddleware,
    asyncHandler(UserControllers.getUserPreferences)
);
```

**Response:**
- **200 OK**: Returns the user's preferences.
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).

**Middleware:**
- `authMiddleware`: Validates the JWT token in the `Authorization` header. If the token is missing or invalid, an error is thrown. It verifies the JWT token and attaches the user claims to the `req.claims` object for access in the controller.

**Controller:**
- `UserControllers.getUserPreferences`: Handles the request and returns the user's preferences after authenticating with the provided token.

---

### PUT `/users/preferences`

**Description:**  
Updates the preferences of the authenticated user.

**Route:**
```js
userRouter.put(
    "/preferences", 
    bodyValidate(userPreferencesSchema), 
    authMiddleware,
    asyncHandler(UserControllers.updateUserPreferences)
);
```

**Response:**
- **200 OK**: Confirms the user's preferences were successfully updated.
- **400 Bad Request**: Returns an error if the request body is invalid (e.g., missing required fields or invalid data).
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).

**Middleware:**
- `bodyValidate(userPreferencesSchema)`: Validates the request body against the `userPreferencesSchema` to ensure the preferences are correctly structured.
- `authMiddleware`: Validates the JWT token in the `Authorization` header. If the token is missing or invalid, an error is thrown. It verifies the JWT token and attaches the user claims to the `req.claims` object for access in the controller.

**Controller:**
- `UserControllers.updateUserPreferences`: Handles the request to update the user's preferences after authenticating with the provided token.

---

### GET `/news`

**Description:**  
Retrieves news articles based on the authenticated user's preferences.

**Route:**
```js
newsRouter.get(
    "/", 
    asyncHandler(NewsController.getNewsByPreferences)
);
```

**Response:**
- **200 OK**: Returns a list of news articles tailored to the user's preferences.
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).

**Middleware:**
- `authMiddleware`: Validates the JWT token in the `Authorization` header. If the token is missing or invalid, an error is thrown. It verifies the JWT token and attaches the user claims to the `req.claims` object for access in the controller.

**Controller:**
- `NewsController.getNewsByPreferences`: Handles the request and returns news articles based on the authenticated user's preferences.

---

### GET `/news/read`

**Description:**  
Retrieves a list of news articles that the authenticated user has already read.

**Route:**
```js
newsRouter.get(
    "/read", 
    asyncHandler(NewsController.getReadNewsArticles)
);
```

**Response:**
- **200 OK**: Returns a list of news articles marked as read by the authenticated user.
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).

**Middleware:**
- `authMiddleware`: Validates the JWT token in the `Authorization` header. If the token is missing or invalid, an error is thrown. It verifies the JWT token and attaches the user claims to the `req.claims` object for access in the controller.

**Controller:**
- `NewsController.getReadNewsArticles`: Handles the request and returns the list of news articles that the authenticated user has marked as read.

---

### POST `/news/:id/read`

**Description:**  
Marks a specific news article as read based on the article ID provided in the request path.

**Route:**
```js
newsRouter.post(
    "/:id/read", 
    paramsValidate(newsIdValidator), 
    asyncHandler(NewsController.markNewsArticleRead)
);
```

**Request Path Parameters:**
- **id** (required): The unique identifier of the news article to be marked as read.
  - **Type**: `string`
  - **Validation**: 
    - Must be a string.
    - The length of the string must match the specified `newsIdLength` constant.

**Response:**
- **200 OK**: Confirms that the news article has been marked as read.
- **400 Bad Request**: Returns an error if the `id` parameter does not meet the required validation criteria (incorrect length, invalid format, etc.).
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).
- **404 Not Found**: Returns an error if no article is found with the provided ID.

**Middleware:**
- `paramsValidate`: Validates the `id` parameter in the request path based on the `newsIdValidator` schema.

**Controller:**
- `NewsController.markNewsArticleRead`: Handles the request to mark the specific news article as read.

---

### POST `/news/:id/favorite`

**Description:**  
Marks a specific news article as a favorite based on the article ID provided in the request path.

**Route:**
```js
newsRouter.post(
    "/:id/favorite", 
    paramsValidate(newsIdValidator), 
    asyncHandler(NewsController.markNewsArticleFavorite)
);
```

**Request Path Parameters:**
- **id** (required): The unique identifier of the news article to be marked as a favorite.
  - **Type**: `string`
  - **Validation**: 
    - Must be a string.
    - The length of the string must match the specified `newsIdLength` constant.

**Response:**
- **200 OK**: Confirms that the news article has been marked as a favorite.
- **400 Bad Request**: Returns an error if the `id` parameter does not meet the required validation criteria (incorrect length, invalid format, etc.).
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).
- **404 Not Found**: Returns an error if no article is found with the provided ID.

**Middleware:**
- `paramsValidate`: Validates the `id` parameter in the request path based on the `newsIdValidator` schema.

**Controller:**
- `NewsController.markNewsArticleFavorite`: Handles the request to mark the specific news article as a favorite.

---

### GET `/news/favorite`

**Description:**  
Retrieves a list of news articles that are marked as favorites.

**Route:**
```js
newsRouter.get(
    "/favorite", 
    asyncHandler(NewsController.getFavoriteNewsArticles)
);
```

**Response:**
- **200 OK**: Returns a list of favorite news articles.
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).
- **404 Not Found**: Returns an error if no favorite news articles are found.

**Controller:**
- `NewsController.getFavoriteNewsArticles`: Handles the request to retrieve a list of favorite news articles.

---

### GET `/news/search/:keyword`

**Description:**  
Retrieves news articles that match a specific keyword.

**Route:**
```js
newsRouter.get(
    "/search/:keyword", 
    paramsValidate(newsKeywordValidator), 
    asyncHandler(NewsController.getNewsArticlesByKeyword)
);
```

**Request Path Parameters:**

- **keyword** (required): The keyword to search for in the news articles.
  - **Type**: `string`
  - **Validation**:
    - Must be a string.
    - The string must have a minimum length of 1 character.

**Response:**
- **200 OK**: Returns a list of news articles that match the provided keyword.
- **400 Bad Request**: Returns an error if the `keyword` parameter does not meet the validation criteria (e.g., empty keyword).
- **401 Unauthorized**: Returns an error if the user is not authenticated (invalid or missing token).
- **404 Not Found**: Returns an error if no articles are found that match the provided keyword.

**Middleware:**
- `paramsValidate`: Validates the `keyword` parameter in the request path based on the `newsKeywordValidator` schema.

**Controller:**
- `NewsController.getNewsArticlesByKeyword`: Handles the request to retrieve news articles based on the provided keyword.