const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
const {dealerships} = require('./data/dealerships.json');
const {reviews} = require('./data/reviews.json');
const Review = require('./review');
const mongo = process.env.MONGO_URL;
const route = fn => async (req,res,next) => {
  try { res.json(await fn(req)); } catch (error) { next(error); }
};
app.get('/fetchDealers', route(() => dealerships));
app.get('/fetchDealers/:state', route(req => dealerships.filter(d =>
  [d.state.toLowerCase(), d.st.toLowerCase()].includes(req.params.state.toLowerCase()))));
app.get('/fetchDealer/:id', route(req => dealerships.filter(d => d.id === Number(req.params.id))));
app.get('/fetchReviews/dealer/:id', route(async req => {
  const dealership = Number(req.params.id);
  const seeded = reviews.filter(r => r.dealership === dealership);
  return mongo ? [...seeded, ...await Review.find({dealership}).lean()] : seeded;
}));
app.post('/insert_review', route(async req => {
  const review = {...req.body, dealership: Number(req.body.dealership), id: Date.now()};
  if (mongo) return Review.create(review);
  reviews.push(review);
  return review;
}));
async function start() {
  if (mongo) await mongoose.connect(mongo);
  app.listen(process.env.PORT || 3030, () => console.log('Dealership API ready'));
}
start().catch(error => { console.error(error); process.exitCode = 1; });
