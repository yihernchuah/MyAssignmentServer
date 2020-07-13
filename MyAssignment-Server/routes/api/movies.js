const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const uuid = require('uuid');
const Movie = require('../../models/movie.js');

const router = express.Router();

const omdbApiKey = 'de75dbbf';
const tmdbApiKey = 'e9db68dfd8582eaecac57ec915ac1559';

mongoose
  .connect(
    'mongodb+srv://ChuahYiHern:doingdb@cluster0-nvgpo.mongodb.net/movies?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('Mongodb connected...');
  });

// Gets All Movies
router.get('/', (req, res) => {
  Movie.find({})
    .then(respond => {
      res.status(200).json(respond);
    })
    .catch(error => {
      res.status(400).json(error);
    });
});

// Create Movie
router.post('/', (req, res) => {
  const title = req.query.title;
  if (req.query.title === '') res.status(400).send('No title found.');

  axios
    .all([
      axios.get(`http://www.omdbapi.com/?t=${title}&apikey=${omdbApiKey}`),
      axios.get(
        `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${title}`
      ),
    ])
    .then(respond => {
      let hasMovie = false;
      for (let i = 0; i < Object.keys(respond[1].data.results).length; i++) {
        if (respond[0].data.Title === respond[1].data.results[i].title) {
          hasMovie = true;
          const movie = new Movie({
            id: uuid.v4(),
            title: respond[0].data.Title,
            year: respond[0].data.Year,
            runtime: respond[0].data.Runtime,
            released: respond[0].data.Released,
            poster: respond[0].data.Poster,
            vote_count: respond[1].data.results[i].vote_count,
            vote_average: respond[1].data.results[i].vote_average,
          });
          movie
            .save()
            .then(respondMovie => {
              res.status(200).json(respondMovie);
            })
            .catch(error => {
              res.status(400).json(error);
            });
          break;
        }
      }
      if (!hasMovie) res.status(400).send('No movie found.');
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

// Delete Movie
router.delete('/:id', (req, res) => {
  Movie.deleteOne({ id: req.params.id })
    .then(response => {
      res.status(200).json(response);
    })
    .catch(error => {
      res.status(400).json(error);
    });
});

module.exports = router;
