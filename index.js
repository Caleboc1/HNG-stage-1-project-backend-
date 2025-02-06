const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const factCache = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Function to check if a number is prime
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

// Function to check if a number is perfect
function isPerfect(n) {
    if (n <= 1) return false;
    let sum = 1;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
            sum += i;
            if (i * i !== n) sum += n / i;
        }
    }
    return sum === n;
}

// Function to check if a number is an Armstrong number
function isArmstrong(n) {
    let num = Math.abs(n);
    let sum = 0, temp = num, digits = num.toString().length;
    while (temp > 0) {
        sum += Math.pow(temp % 10, digits);
        temp = Math.floor(temp / 10);
    }
    return sum === num;
}

app.get("/api/classify-number", async (req, res) => {
    const { number } = req.query;

    if (!number) {
        return res.status(400).json({ number: "", error: true });
    }

    const num = parseInt(number);

    if (isNaN(num) || !Number.isInteger(num)) {
        return res.status(400).json({ number: number, error: true });
    }

    console.time(`Processing ${num}`);

    // Compute properties
    let properties = [];
    if (isArmstrong(num)) properties.push("armstrong");
    properties.push(num % 2 === 0 ? "even" : "odd");
    const digitSum = Math.abs(num).toString().split("").reduce((sum, d) => sum + parseInt(d), 0);

    // Check cache for fun fact
    let funFact = "Fetching...";
    if (factCache[num] && Date.now() - factCache[num].timestamp < CACHE_DURATION) {
        funFact = factCache[num].data;
    } else {
        fetchFunFact(num);
    }

    const responseData = {
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties,
        digit_sum: digitSum,
        fun_fact: funFact
    };

    console.timeEnd(`Processing ${num}`);
    res.json(responseData);
});

// Asynchronous function to fetch and cache fun facts
async function fetchFunFact(num) {
    try {
        console.time(`Fetching fun fact for ${num}`);
        const { data } = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 200 });
        factCache[num] = { data, timestamp: Date.now() };
        console.timeEnd(`Fetching fun fact for ${num}`);
    } catch (error) {
        console.error(`Error fetching fun fact for ${num}: ${error.message}`);
        factCache[num] = { data: "No fun fact available", timestamp: Date.now() };
    }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
