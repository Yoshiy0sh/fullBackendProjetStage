const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  readingTime: { type: Number, required: true },
  excerpt: { type: String, required: true },
  icon: { type: String },
  content: { type: String, required: true },
  tags: [{ type: String }],
  author: {
    name: { type: String, required: true },
    role: { type: String }
  },
  slug : { type: String, required: true, unique: true },
})

module.exports = mongoose.model('Article', articleSchema)
