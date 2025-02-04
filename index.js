const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

function isPerfect(n) {
    if (n < 1) return false;
    let sum = 1;
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
            sum += i;
            if (i !== n / i) sum += n / i;
        }
    }
    return sum === n && n !== 1;
}

function isArmstrong(n) {
    if (n < 0) return false; // Armstrong numbers only apply to positive numbers
    let sum = 0, temp = n, digits = n.toString().length;
    while (temp > 0) {
        sum += Math.pow(temp % 10, digits);
        temp = Math.floor(temp / 10);
    }
    return sum === n;
}

const fetchFunFact = async (num) => {
    try {
        const source = axios.CancelToken.source();
        setTimeout(() => source.cancel(), 300); // Cancel if request takes >300ms
        const response = await axios.get(`http://numbersapi.com/${num}`, { cancelToken: source.token });
        return response.data;
    } catch {
        return "No fun fact available";
    }
};

app.get("/api/classify-number", async (req, res) => {
    const { number } = req.query;
    const num = parseInt(number);

    if (isNaN(num)) {
        return res.status(400).json({ number, error: true });
    }

    const properties = [];
    if (num % 2 === 0) properties.push("even");
    else properties.push("odd");

    if (isPrime(num)) properties.push("prime");
    if (isPerfect(num)) properties.push("perfect");
    if (num >= 0 && isArmstrong(num)) properties.push("armstrong"); // Avoid negatives

    const digitSum = Math.abs(num).toString().split("").reduce((sum, d) => sum + parseInt(d), 0);

    const funFact = await fetchFunFact(num);

    res.json({
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties,
        digit_sum: digitSum,
        fun_fact: funFact
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
