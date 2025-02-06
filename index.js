const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const factCache = {};

// ... (isPrime, isPerfect, isArmstrong functions - no changes)

app.get("/api/classify-number", async (req, res) => {
    const { number } = req.query;
    const num = parseInt(number);

    if (isNaN(num)) {
        return res.status(400).json({ number, error: true });
    }

    let properties = [];
    if (isArmstrong(num)) properties.push("armstrong");
    properties.push(num % 2 === 0 ? "even" : "odd");

    const digitSum = Math.abs(num).toString().split("").reduce((sum, d) => sum + parseInt(d), 0);

    // Check cache *before* sending initial response
    if (factCache[num]) {
      console.log(`Cache hit for ${num}:`, factCache[num]);  // More informative log
      return res.json({ // Return cached data immediately
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties,
        digit_sum: digitSum,
        fun_fact: factCache[num]
      });
    } else {
      console.log(`Cache miss for ${num}. Sending initial response.`);
      res.json({ // Return initial response with "Fetching..."
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties,
        digit_sum: digitSum,
        fun_fact: "Fetching..."
      });
    }


    // Fetch fun fact asynchronously (only if not cached)
    if (!factCache[num]) { // Correct placement of the if condition
        try {
            const { data } = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 300 });
            factCache[num] = data;
            console.log(`Fun fact fetched and cached for ${num}:`, data); // Log successful fetch
        } catch (error) {
            console.error(`Error fetching fun fact for ${num}:`, error.message); // More specific error message
            factCache[num] = "No fun fact available";
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));