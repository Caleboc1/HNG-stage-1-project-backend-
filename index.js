const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

const cache = {};

app.get('/api/classify-number', async (req, res) => {
  const numberParam = req.query.number;

  if (numberParam === undefined) {
    return res.status(400).json({ number: "", error: true });
  }

  const number = parseInt(numberParam);

  if (isNaN(number) || number < 0) {  // Reject negative or non-numeric input
    return res.status(400).json({ number: numberParam, error: true });
  }

  if (cache[number]) {
    const cachedData = cache[number];
    console.log("Cache Hit");
    return res.json(cachedData);
  }

  try {
    const funFactResponse = await axios.get(`http://numbersapi.com/${number}/math`);
    const funFact = funFactResponse.data;

    const isPrime = await isNumberPrime(number);
    const isPerfect = await isNumberPerfect(number);
    const properties = [];

    if (isArmstrong(number)) {
      properties.push("armstrong");
    }

    if (number % 2 === 0) {
      properties.push("even");
    } else {
      properties.push("odd");
    }

    const digitSum = calculateDigitSum(number);

    const responseData = {
      number: number,
      is_prime: isPrime,
      is_perfect: isPerfect,
      properties: properties,
      digit_sum: digitSum,
      fun_fact: funFact,
    };

    cache[number] = responseData;
    console.log("Cache Miss");
    res.json(responseData);

  } catch (error) {
    console.error("Error fetching fun fact:", error);
    res.status(500).json({ number: number, error: true, message: "Error fetching fun fact" });
  }
});

// ... (isPrime, isPerfect, isArmstrong functions - no changes needed)

function calculateDigitSum(number) {
  const numStr = String(Math.abs(number)); // Crucial: Use Math.abs() here
  let sum = 0;
  for (let digit of numStr) {
    sum += parseInt(digit);
  }
  return sum;
}

// ... (app.listen - no changes needed)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});