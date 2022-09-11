const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {

    const blogs = await Blog.find({})
    response.json(blogs)

})

blogsRouter.get('/:id', async (request, response) => {

    const blog = await Blog.findById(request.params.id)
    response.json(blog)

})

blogsRouter.post('/', async (request, response) => {
    const blog = new Blog(request.body)

    const saveBlog = await blog.save()
    response.status(201).json(saveBlog)

})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })
    response.status(200).json(updatedBlog)

})

blogsRouter.delete('/:id', async (request, response) => {

    console.log(request.params.id)

    const deletedBlog = await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()

})


module.exports = blogsRouter