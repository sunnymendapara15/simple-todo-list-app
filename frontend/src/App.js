import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' }
];

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/todos`);
      if (!response.ok) {
        throw new Error('Unable to load todos.');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message.replace(/^Error:\s*/, '') || 'Unable to load todos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }, [todos, filter]);

  const showResponseError = async (response) => {
    let message;
    try {
      const body = await response.json();
      message = body.error || body.message;
    } catch {
      message = 'Server responded with an error.';
    }
    throw new Error(message || 'Server responded with an error.');
  };

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!newTitle.trim()) {
      setError('Please enter a todo title.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      if (!response.ok) {
        await showResponseError(response);
      }
      const created = await response.json();
      setTodos((current) => [created, ...current]);
      setNewTitle('');
      setStatus('Todo added.');
    } catch (err) {
      setError(err.message.replace(/^Error:\s*/, '') || 'Unable to add todo.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTodo = async (todo) => {
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (!response.ok) {
        await showResponseError(response);
      }
      const updated = await response.json();
      setTodos((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      setStatus('Todo updated.');
    } catch (err) {
      setError(err.message.replace(/^Error:\s*/, '') || 'Unable to update todo.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTodo = async (id) => {
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        await showResponseError(response);
      }
      setTodos((current) => current.filter((todo) => todo.id !== id));
      setStatus('Todo removed.');
    } catch (err) {
      setError(err.message.replace(/^Error:\s*/, '') || 'Unable to delete todo.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!status && !error) {
      return;
    }
    const timer = setTimeout(() => {
      setStatus('');
      setError('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [status, error]);

  return (
    <div className="app-shell">
      <div className="card">
        <header className="hero">
          <p className="eyebrow">Personal task tracker</p>
          <h1>Simple Todo List</h1>
          <p className="lead">Use the form below to keep track of what matters. Everything you add is stored in the backend JSON file.</p>
          {status && <p className="status success">{status}</p>}
          {error && <p className="status error">{error}</p>}
        </header>

        <form className="todo-form" onSubmit={handleAdd}>
          <input
            className="todo-input"
            type="text"
            placeholder="Add a new task..."
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            disabled={submitting}
          />
          <button type="submit" disabled={submitting}>Add</button>
        </form>

        <div className="filters">
          {FILTERS.map((filterOption) => (
            <button
              key={filterOption.id}
              type="button"
              className={filter === filterOption.id ? 'active' : ''}
              onClick={() => setFilter(filterOption.id)}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="empty">Loading todos...</div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty">No todos yet. Add one above!</div>
        ) : (
          <ul className="todo-list">
            {filteredTodos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo)}
                    disabled={submitting}
                  />
                  <span className={todo.completed ? 'completed' : ''}>{todo.title}</span>
                </label>
                <button
                  className="delete-btn"
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  disabled={submitting}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
