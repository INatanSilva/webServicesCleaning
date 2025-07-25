import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "requests"));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRequests(data);
    } catch (error) {
      alert("Erro ao buscar serviços: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar este serviço?")) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "requests", id));
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (error) {
      alert("Erro ao apagar serviço: " + error.message);
    } finally {
      setDeleting("");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f6f8fa', padding: 32, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #0001', padding: 32 }}>
        <h1 style={{ textAlign: 'center', color: '#2d3748', marginBottom: 32 }}>Serviços de Limpeza</h1>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Carregando...</p>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Nenhum serviço encontrado.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {requests.map((req) => (
              <li key={req.id} style={{
                marginBottom: 24,
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: 20,
                boxShadow: '0 2px 8px #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                background: '#fafbfc',
              }}>
                <div><strong>Nome:</strong> {req.nome}</div>
                <div><strong>Contato:</strong> {req.numeroContato}</div>
                <div><strong>Localização:</strong> {req.localizacao}</div>
                <div><strong>Tipo de Limpeza:</strong> {req.tipoLimpeza}</div>
                <button
                  onClick={() => handleDelete(req.id)}
                  disabled={deleting === req.id}
                  style={{
                    marginTop: 12,
                    alignSelf: 'flex-end',
                    background: deleting === req.id ? '#e53e3e99' : '#e53e3e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 18px',
                    fontWeight: 600,
                    cursor: deleting === req.id ? 'not-allowed' : 'pointer',
                    boxShadow: '0 1px 4px #e53e3e22',
                    transition: 'background 0.2s',
                  }}
                >
                  {deleting === req.id ? 'Apagando...' : 'Apagar'}
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
