const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const factCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour (adjust as needed)

// ... (isPrime, isPerfect, isArmstrong functions - no changes needed)

app.get("/api/classify-number", async (req, res) => {
    const { number } = req.query;

    if (number === undefined || number === "") {
        return res.status(400).json({ number: "", error: true });
    }

    const num = parseInt(number);

    if (isNaN(num)) {
        return res.status(400).json({ number: number, error: true });
    }

    if (!Number.isInteger(num)) {
        return res.status(400).json({ number: number, error: true });
    }

    let properties = [];
    if (isArmstrong(num)) properties.push("armstrong");
    properties.push(num % 2 === 0 ? "even" : "odd");

    const digitSum = Math.abs(num).toString().split("").reduce((sum, d) => sum + parseInt(d), 0);

    console.time(`Request for ${num}`);

    // Check cache with timestamp
    if (factCache[num] && (Date.now() - factCache[num].timestamp < CACHE_DURATION)) {
        console.log(`Cache hit for ${num}:`, factCache[num].data);
        console.timeEnd(`Request for ${num}`);
        return res.json({
            number: num,
            is_prime: isPrime(num),
            is_perfect: isPerfect(num),
            properties,
            digit_sum: digitSum,
            fun_fact: factCache[num].data // Access the cached data
        });
    } else if (factCache[num] && factCache[num].data === "Fetching...") { // Check if currently fetching
        console.log(`Currently fetching for ${num}. Returning cached "Fetching..."`);
        console.timeEnd(`Request for ${num}`);
        return res.json({
          number: num,
          is_prime: isPrime(num),
          is_perfect: isPerfect(num),
          properties,
          digit_sum: digitSum,
          fun_fact: "Fetching..."
        });
    } else {
        console.log(`Cache miss or expired cache for ${num}. Sending initial response.`);
        console.timeEnd(`Request for ${num}`);
        res.json({
            number: num,
            is_prime: isPrime(num),
            is_perfect: isPerfect(num),
            properties,
            digit_sum: digitSum,
            fun_fact: "Fetching..."
        });

        // Fetch asynchronously (only if not cached or expired)
        try {
          console.time(`Fetching from numbersapi.com for ${num}`);
          const { data } = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 300 });
          factCache[num] = { data: data, timestamp: Date.now() }; // Store with timestamp
          console.log(`Fun fact fetched and cached for ${num}:`, data);
          console.timeEnd(`Fetching from numbersapi.com for ${num}`);
        } catch (error) {
          console.error(`Error fetching fun fact for ${num}:`, error.message);
          factCache[num] = {data: "No fun fact available", timestamp: Date.now()}; // Cache the error
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));