const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const factCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Function to check if a number is prime
const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
};

// Function to check if a number is perfect
const isPerfect = (n) => {
    if (n <= 1) return false;
    let sum = 1;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
            sum += i;
            if (i * i !== n) sum += n / i;
        }
    }
    return sum === n;
};

// Function to check if a number is an Armstrong number
const isArmstrong = (n) => {
    const numStr = Math.abs(n).toString();
    const digits = numStr.length;
    const sum = numStr.split("").reduce((acc, digit) => acc + Math.pow(parseInt(digit), digits), 0);
    return sum === Math.abs(n);
};

// Route to classify a number
app.get("/api/classify-number", async (req, res) => {
    const { number } = req.query;

    if (!number) {
        return res.status(400).json({ number: "", error: true });
    }

    const num = parseInt(number, 10);
    if (isNaN(num)) {
        return res.status(400).json({ number, error: true });
    }

    // Determine properties
    let properties = [];
    if (isArmstrong(num)) properties.push("armstrong");
    properties.push(num % 2 === 0 ? "even" : "odd");

    // Calculate digit sum
    const digitSum = Math.abs(num)
        .toString()
        .split("")
        .reduce((sum, d) => sum + parseInt(d, 10), 0);

        console.time(`Request for ${num}`);

    // 1. Check Cache (but return "Fetching..." *immediately*)

    if (factCache[num] && Date.now() - factCache[num].timestamp < CACHE_DURATION) {
        console.log(`Cache hit for ${num}:`, factCache[num].data);
        console.timeEnd(`Request for ${num}`);
        return res.json({ // Return cached data *immediately*
            number: num,
            is_prime: isPrime(num),
            is_perfect: isPerfect(num),
            properties,
            digit_sum: digitSum,
            fun_fact: factCache[num].data,
        });
    } else if (factCache[num] && factCache[num].data === "Fetching...") {
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
    }

    console.log(`Cache miss or expired cache for ${num}. Sending initial response.`);
    console.timeEnd(`Request for ${num}`);


    // 2. Return "Fetching..." response *immediately*
    res.json({
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties,
        digit_sum: digitSum,
        fun_fact: "Fetching..."
    });

    // 3. *Asynchronously* fetch the fun fact (if not cached or expired)
    if (!factCache[num] || Date.now() - factCache[num].timestamp >= CACHE_DURATION) {
        try {
            console.time(`Fetching from numbersapi.com for ${num}`);
            const { data } = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 500 });
            factCache[num] = { data, timestamp: Date.now() }; // Store with timestamp
            console.log(`Fun fact fetched and cached for ${num}:`, data);
            console.timeEnd(`Request for ${num}`);
        } catch (error) {
            console.error(`Error fetching fun fact for ${num}:`, error.message);
            factCache[num] = { data: "No fun fact available", timestamp: Date.now() }; // Cache the error
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));