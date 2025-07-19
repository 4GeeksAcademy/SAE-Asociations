import React, { useEffect, useState } from 'react';
import authService from '../services/authService';

function EventComments({ eventId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [canComment, setCanComment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);


  const token = authService.getToken();
  const API_URL = import.meta.env.VITE_BACKEND_URL;


  const fetchWithAuth = (url, options = {}) => {
    const separator = API_URL.endsWith('/') ? '' : '/';
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    const fullUrl = `${API_URL}${separator}${cleanUrl}`;

    const headers = {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    };

    return fetch(fullUrl, {
      ...options,
      headers,
    });
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('No estás autenticado. Por favor inicia sesión.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetchWithAuth(`/api/events/${eventId}`);
        if (!res.ok) throw new Error(`Error al obtener los datos del evento (${res.status})`);
        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Respuesta inesperada del servidor');
        }
        const data = await res.json();
        setComments(data.comments || []);
        setCanComment(data.user_can_comment || false);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, token]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!token) {
      setError('No estás autenticado. Por favor inicia sesión.');
      return;
    }

    setError(null);
    try {
      const res = await fetchWithAuth(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.msg || 'Error al enviar comentario');
      }
      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setContent('');
    } catch (e) {
      setError(e.message);
    }
  };

  function startEditing(comment) {
    setEditingCommentId(comment.id);
    setEditedContent(comment.content);
  }

  async function handleUpdate(commentId) {
    try {
      const response = await fetch(`${API_URL}/api/events/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({ content: editedContent })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev =>
          prev.map(c => (c.id === commentId ? updatedComment : c))
        );
        setEditingCommentId(null);
      } else {
        console.error("Error al actualizar el comentario.");
      }
    } catch (err) {
      console.error("Fallo al actualizar comentario:", err);
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("¿Estás seguro de eliminar este comentario?")) return;

    try {
      const response = await fetch(`${API_URL}/api/events/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authService.getToken()}`
        }
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
      } else {
        console.error("Error al eliminar el comentario.");
      }
    } catch (err) {
      console.error("Fallo al eliminar comentario:", err);
    }
  }

if (loading) return <p className="text-muted">Cargando comentarios...</p>;

  // useEffect(() => {
  //   const fetchEvent = async () => {
  //     const res = await fetchWithAuth(`${API_URL}/api/events/${eventId}`);
  //     const data = await res.json();
  //     setComments(data.comments);
  //     setCurrentUserId(data.current_user_id);
  //   };

  //   fetchEvent();
  // }, [eventId]);

  
  return (
    <div className="event-comments mt-4">
      <h4>Comentarios</h4>

      {error && <div className="alert alert-danger">{error}</div>}

      {canComment ? (
        <form onSubmit={postComment} className="mb-4">
          <textarea
            className="form-control mb-2"
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu comentario..."
            required
          />
          <button className="btn btn-primary" type="submit">
            Enviar comentario
          </button>
        </form>
      ) : (
        <p className="text-muted">No puedes comentar en este evento.</p>
      )}

      <ul className="list-group">
        {comments.length === 0 ? (
          <li className="list-group-item">No hay comentarios aún.</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="list-group-item">
              <strong>
                {c.user ? `${c.user.name} ${c.user.lastname}` : `Usuario ${c.user_id}`}
              </strong>{' '}
              <span className="text-muted">
                ({new Date(c.created_at).toLocaleString('es-ES')})
              </span>

              {editingCommentId === c.id ? (
                <>
                  <textarea
                    className="form-control comment-edit-area"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                  <div className="comment-actions">
                    <button className="btn btn-sm btn-success" onClick={() => handleUpdate(c.id)} title="Guardar">
                      💾
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingCommentId(null)} title="Cancelar">
                      🔙
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-1">{c.content}</p>
                  {c.user_id === currentUserId && (
                    <div className="comment-actions">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => startEditing(c)} title="Editar">
                        🖊️
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)} title="Eliminar">
                        ✖️
                      </button>
                    </div>
                  )}
                </>
              )}

            </li>
          ))
        )}
      </ul>
    </div >
  );
}

export default EventComments;
