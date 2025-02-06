const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const factCache = {}; // Cache for fun facts

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function isPerfect(n) {
    if (n === 1) return false; // 1 is NOT a perfect number
    if (n < 1) return false; // Negative numbers can't be perfect
    let sum = 1;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
            sum += i;
            if (i !== n / i) sum += n / i;
        }
    }
    return sum === n;
}

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
    const num = parseInt(number);

    if (isNaN(num)) {
        return res.status(400).json({ number, error: true });
    }

    let properties = [];
    if (isArmstrong(num)) properties.push("armstrong");
    properties.push(num % 2 === 0 ? "even" : "odd");

    // Compute digit sum using absolute value
    const digitSum = Math.abs(num).toString().split("").reduce((sum, d) => sum + parseInt(d), 0);

    // Send response immediately
    res.json({
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties,
        digit_sum: digitSum,
        fun_fact: factCache[num] || "Fetching..."
    });

    // Fetch fun fact asynchronously (only if not cached)
    if (!factCache[num]) {
        try {
            const funFactResponse = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 500 });
            factCache[num] = funFactResponse.data;
        } catch (error) {
            console.error("Numbers API error:", error.message);
            factCache[num] = "No fun fact available";
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

