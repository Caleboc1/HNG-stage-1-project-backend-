 Number Classifier API

Introduction
The Number Classifier API is a simple RESTful API that classifies numbers based on their mathematical properties. It determines whether a number is prime, perfect, or an Armstrong number and provides additional attributes such as its parity (odd/even), digit sum, and a fun fact from the Numbers API.

Features
- Classifies numbers as prime, perfect, or Armstrong
- Determines whether a number is odd or even
- Computes the digit sum
- Fetches a fun fact about the number from the Numbers API
- Handles errors gracefully

API Endpoint
`GET /api/classify-number`
Query Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| number    | integer | Yes      | The number to classify |

Example Request
```bash
GET https://hng-stage-1-project-backend.onrender.com/api/classify-number?number=371
```

Example Response (200 OK)
```json
{
    "number": 371,
    "is_prime": false,
    "is_perfect": false,
    "properties": ["armstrong", "odd"],
    "digit_sum": 11,
    "fun_fact": "371 is an Armstrong number because 3^3 + 7^3 + 1^3 = 371"
}
```

Error Response (400 Bad Request)
```json
{
    "number": "abc",
    "error": true
}
```

Setup and Installation
Prerequisites
- Node.js installed (>= v14)
- npm installed

Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Caleboc1/HNG-stage-1-project-backend-.git
   cd number-classifier-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the server:
   ```bash
   npm start
   ```
4. The API will be available at `http://localhost:10000`

Deployment
This API is deployed on **Render**. To deploy your own instance:
1. Push the project to a GitHub repository.
2. Go to [Render](https://render.com/) and create a new web service.
3. Connect it to your GitHub repository.
4. Set the `PORT` environment variable.
5. Deploy and access the API from your Render-generated URL.

Testing
Run test cases to ensure API functionality:
```bash
npm test
```

Technologies Used
- Node.js - Backend runtime
- Express.js - Web framework
- Axios - For fetching fun facts from the Numbers API
- Cors - To allow cross-origin requests


