const express = require("express");
const redis = require("redis");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

const app = express();
const port = process.env.PORT || 3000;

// Redis client setup
const client = redis.createClient();
client.on("error", (err) => console.error("Redis error:", err));

// Prime number check (Optimized)
function isPrime(n) {
    if (n < 2) return false;
    if (n % 2 === 0 && n !== 2) return false;
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

// Precomputed perfect numbers
const perfectNumbers = new Set([6, 28, 496, 8128]);
function isPerfectNumber(n) {
    return perfectNumbers.has(n);
}

// Compute properties in a worker thread
function computeProperties(number) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, { workerData: number });
        worker.on("message", resolve);
        worker.on("error", reject);
    });
}

if (!isMainThread) {
    const num = workerData;
    parentPort.postMessage({
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfectNumber(num),
        properties: [num % 2 === 0 ? "even" : "odd"],
        digit_sum: Math.abs(num).toString().split("").reduce((acc, digit) => acc + parseInt(digit), 0),
    });
} else {
    // API Endpoint
    app.get("/api/classify-number", async (req, res) => {
        const { number } = req.query;
        if (!number || isNaN(number)) {
            return res.status(400).json({ error: true, number });
        }
        const num = parseInt(number);

        // Check cache first
        client.get(number, async (err, cachedData) => {
            if (cachedData) {
                return res.json(JSON.parse(cachedData));
            }
            
            try {
                const result = await computeProperties(num);
                client.setex(number, 3600, JSON.stringify(result)); // Cache for 1 hour
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    });

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
