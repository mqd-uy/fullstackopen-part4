import { useState, useEffect } from 'react'
import noteService from './services/notes'

import Note from './components/Note'

const App = () => {

  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('a new note')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    console.log('effect');
    noteService.getAll()
      .then(notes => {
        console.log('promise fulfilled', notes);
        setNotes(notes)
      })
  }, [])
  console.log('render', notes.length, 'notes')

  const addNote = (event) => {
    console.log('new note', newNote)
    event.preventDefault()

    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }
    noteService.create(noteObject)
      .then(noteCreated => {
        setNotes([...notes, noteCreated])
        setNewNote('')
      })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value)
  }

  const toggleImportanceOf = noteId => {
    const note = notes.find(note => note.id === noteId)
    const changedNote = { ...note, important: !note.important }

    noteService.update(noteId, changedNote)
      .then(noteUpdated => {
        setNotes(notes.map(note => note.id !== noteId ? note : noteUpdated))
      })
      .catch(error => {
        setNotes(notes.filter(note => note.id !== noteId))
        setErrorMessage(error.message)
        setTimeout(() =>
          setErrorMessage(null), 5000)
        console.log('fail', error)
      })
  }

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important)


  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage} />
      <button onClick={() => setShowAll(!showAll)}>
        {showAll ? "hide" : "show"}
      </button>
      <ul>
        {notesToShow.map(note =>
          <Note key={note.id} note={note} toggleImportance={() => toggleImportanceOf(note.id)} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input name="note" value={newNote} onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
      <Footer />
    </div>
  )
}

const Notification = ({ message }) => {
  if (message === null)
    return null
  else
    return <div className='error'>
      {message}
    </div>
}

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  }
  return (
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science, University of Helsinki 2023</em>
    </div>
  )
}

export default App