const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Helper Functions
const isPrime = (n) => {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
};

const isPerfect = (n) => {
    if (n < 2) return false;
    let sum = 0;
    for (let i = 1; i < n; i++) {
        if (n % i === 0) sum += i;
    }
    return sum === n;
};

const isArmstrong = (n) => {
    const digits = String(n).split('');
    const numDigits = digits.length;
    const sum = digits.reduce((acc, digit) => acc + Math.pow(Number(digit), numDigits), 0);
    return sum === n;
};

const getDigitSum = (n) => {
    return String(Math.abs(n)).split('').reduce((acc, digit) => acc + Number(digit), 0);
};

const getFunFact = async (n) => {
    try {
        const response = await axios.get(`http://numbersapi.com/${n}/math`);
        return response.data;
    } catch (error) {
        return null;
    }
};

// API Endpoint
app.get('/api/classify-number', async (req, res) => {
    const { number } = req.query;

    // Input Validation
    if (!number || isNaN(number)) {
        return res.status(400).json({ number: number || 'null', error: true });
    }

    const num = parseInt(number, 10);
    const properties = [];

    if (isArmstrong(num)) properties.push('armstrong');
    if (num % 2 === 0) properties.push('even');
    else properties.push('odd');

    const funFact = await getFunFact(num);

    const response = {
        number: num,
        is_prime: isPrime(num),
        is_perfect: isPerfect(num),
        properties: properties,
        digit_sum: getDigitSum(num),
        fun_fact: funFact || 'No fun fact available',
    };

    res.status(200).json(response);
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});