const Note = require('../models/note')
const notesRouter = require('express').Router()

notesRouter.get('/', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

notesRouter.get('/:id', (request, response, next) => {
  const id = request.params.id
  Note.findById(id)
    .then(note => {
      if (note)
        response.json(note)
      else
        response.status(404).end()
    })
    .catch(error => next(error))
})

notesRouter.post('/', (request, response, next) => {
  const { content, important } = request.body

  const newNote = new Note({
    content: content,
    important: important || false
  })
  newNote.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => next(error))
})

notesRouter.delete('/:id', (request, response, next) => {
  const id = request.params.id
  Note.findByIdAndDelete(id)
    .then((note) => {
      console.log('note to delete',note)
      response.status(204).end()
    })
    .catch(error => next(error))

})

notesRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important || false
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true, runValidators: true })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

module.exports = notesRouter