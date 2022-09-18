const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)

const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { response } = require('../app')



beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.blogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
    const result = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)


})

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.blogs.length)
})

test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)
    expect(titles).toContain(
        'React patterns'
    )
})

test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
})

describe('making POST requests', () => {

    let token2

    beforeAll(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()

        const response = await api
                            .post('/api/login')
                            .send({ username: 'root', password: 'sekret' })



        token2 = response.body.token
        
        return token2
    })

    test('making an HTTP POST request to the /api/blogs url creates a new blog post', async () => {

        newBlog = {
            title: 'test blog',
            author: 'Juan',
            url: 'www.testblog.com',
            likes: 0
        }
        
        await api
            .post('/api/blogs')
            .set('authorization', `bearer ${token2}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')

        const titles = response.body.map(r => r.title)

        expect(response.body).toHaveLength(helper.blogs.length + 1)
        expect(titles).toContain(
            'test blog'
        )
    })

    test('making an HTTP POST request without token is unauthorized', async () => {
        newBlog = {
            title: 'test blog',
            author: 'Juan',
            url: 'www.testblog.com',
            likes: 0
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)



    })

    test('making an POST request without likes properties', async () => {
        newBlog = {
            title: 'test blog 2 ',
            author: 'Juan',
            url: 'www.testblog.com'
        }

        await api
            .post('/api/blogs')
            .set('authorization', `bearer ${token2}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)


    },)

    test('making an POST request without title and url', async () => {
        newBlog = {

            author: 'Juan'

        }

        await api
            .post('/api/blogs')
            .set('authorization', `bearer ${token2}`)
            .send(newBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)


    },)

})


describe('deletion of a note', () => {

    let token2
    let newPostedBlog

    beforeAll(async () => {
        await User.deleteMany({})

        
    })

    test('succeeds with status code 204 if id is valid', async () => {

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()

        const response = await api
                            .post('/api/login')
                            .send({ username: 'root', password: 'sekret' })

        token2 = response.body.token

        newBlog = {
            title: 'test blog',
            author: 'Juan',
            url: 'www.testblog.com',
            likes: 0
        }
        
        newPostedBlog = await api
                                .post('/api/blogs')
                                .set('authorization', `bearer ${token2}`)
                                .send(newBlog)

        
        

        const blogsAtStart = await api.get('/api/blogs')
        
        
        await api
            .delete(`/api/blogs/${newPostedBlog.body.id}`)
            .set('authorization', `bearer ${token2}`)
            .expect(204)

        const blogsAtEnd = await api.get('/api/blogs')

        expect(blogsAtEnd.body).toHaveLength(blogsAtStart.body.length - 1)

        const titles = blogsAtEnd.body.map(r => r.title)

        expect(titles).not.toContain(newPostedBlog.body.title)
    })
})

describe('updating notes', () => {
    test('updating the amount of likes from a blog', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        updatedBlog = {
            title: blogToUpdate.title,
            author: blogToUpdate.author,
            url: blogToUpdate.url,
            likes: blogToUpdate.likes + 1
        }


        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(updatedBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        laterUpdatedBlogs = await helper.blogsInDb()
        newUpdatedBlog = laterUpdatedBlogs[0]

        expect(newUpdatedBlog.likes).toBe(blogToUpdate.likes + 1)


    })
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('username must be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toEqual(usersAtStart)
    })
})




afterAll(() => {
    mongoose.connection.close()
})