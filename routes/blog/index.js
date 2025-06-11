const express = require('express')
const router = express.Router()

//models import
const Article = require('../../models/article')

router.route('/')
    .get(async (req,res) => {
        res.send('Blog Home Page')
    })

router.route('/:slug')
    .get(async (req, res) => {
        const { slug } = req.params
        try {
            const article = await Article.findOne({ slug })
            if (!article) {
                return res.status(404).send('Article not found')
            }
            res.render('blog/article', { article })
        } catch (error) {
            console.error(error)
            res.status(500).send('Server error')
        }
    })

module.exports = router