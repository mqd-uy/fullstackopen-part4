require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Note = require('./models/notes')

const app = express()

app.use(express.static('dist'))

app.use(cors())

app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)

app.get('/', (request, response) => {
  response.send('<h1>Hello world!</h1>')
})

app.get('/api/notes', (request, response) => {
  console.log('notes all')
  Note.find({}).then(result => {
    console.log('mongo find all result', result)
    response.json(result)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id).then(result => {
    if (result)
      response.json(result)
    else
      response.status(404).end()
  }).catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {

  const { content, important } = request.body

  const newNote = new Note({
    content: content,
    important: important || false
  })
  console.log('New note', newNote)
  newNote.save()
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
  const id = request.params.id
  Note.findOneAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))

})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: Boolean(body.important) || false
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true, runValidators: true })
    .then(result => {
      response.json(result)
    })
    .catch(error => next(error))
})

app.get('/test', (req, res) => {
  res.send('Holaaaa')
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  // to the default express error handler
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})