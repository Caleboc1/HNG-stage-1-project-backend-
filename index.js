const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

function isArmstrong(n) {
    let sum = 0, temp = Math.abs(n), digits = temp.toString().length;
    while (temp > 0) {
        sum += Math.pow(temp % 10, digits);
        temp = Math.floor(temp / 10);
    }
    return sum === Math.abs(n);
}

const fetchFunFact = async (num) => {
    try {
        const source = axios.CancelToken.source();
        setTimeout(() => source.cancel(), 300); // Cancel if request takes >300ms

        return await Promise.race([
            axios.get(`http://numbersapi.com/${num}/math`, { cancelToken: source.token }).then(res => res.data),
            new Promise((resolve) => setTimeout(() => resolve("No fun fact available"), 300))
        ]);
    } catch {
        return "No fun fact available";
    }
};

app.get("/api/classify-number", async (req, res) => {
    const { number } = req.query;
    const num = parseInt(number);

    if (isNaN(num)) {
        return res.status(400).json({ error: true, number });
    }

    const isEven = num % 2 === 0;
    const isArmstrongNum = isArmstrong(num);

    let properties = isArmstrongNum ? (isEven ? ["armstrong", "even"] : ["armstrong", "odd"]) : (isEven ? ["even"] : ["odd"]);

    const digitSum = Math.abs(num).toString().split("").reduce((sum, d) => sum + parseInt(d), 0);
    const funFact = await fetchFunFact(num);

    res.json({
        number: num,
        properties,
        digit_sum: digitSum,
        fun_fact: funFact
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
