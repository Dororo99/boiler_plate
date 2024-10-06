import express from "express"
const app = express()
const port = 3000
import mongoose from "mongoose"

const url = 'mongodb+srv://99dororo:sg1301@sangsiru.tifxa.mongodb.net/?retryWrites=true&w=majority&appName=sangsiru'

mongoose.connect(url)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
