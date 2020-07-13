const express = require('express');

const app = express();

// Movie API Routes
app.use('/api/movies', require('./routes/api/movies'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
