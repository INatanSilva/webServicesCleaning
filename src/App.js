import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const filteredRequests = requests.filter(req =>
    req.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.tipoLimpeza?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: requests.length,
    residential: requests.filter(r => r.tipoLimpeza?.includes("Residencial")).length,
    commercial: requests.filter(r => r.tipoLimpeza?.includes("Comercial")).length,
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMobile = windowWidth <= 768;
  const isTablet = windowWidth <= 1024 && windowWidth > 768;
  const sidebarWidth = isMobile ? 0 : isTablet ? 200 : 240;

  const Sidebar = () => (
    <>
      {/* Mobile Header */}
      <div style={{
        display: isMobile ? 'flex' : 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        height: '56px',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>🧹 CleanDash</h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div style={{
        width: isMobile ? '260px' : sidebarWidth,
        height: '100vh',
        background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: isMobile ? '14px' : isTablet ? '16px' : '18px',
        boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.3)' : '4px 0 20px rgba(0,0,0,0.1)',
        position: 'fixed',
        left: isMobile ? (isMobileMenuOpen ? 0 : -260) : 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 999,
        transition: 'left 0.3s ease',
        overflowY: 'auto',
      }}>
        <div style={{ 
          marginBottom: isMobile ? 16 : isTablet ? 24 : 28, 
          display: isMobile ? 'none' : 'block',
          paddingTop: isMobile ? 0 : 6,
        }}>
          <h2 style={{ margin: 0, fontSize: isTablet ? 18 : 22, fontWeight: 700 }}>🧹 CleanDash</h2>
          <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: isTablet ? 11 : 12 }}>Sistema de Gestão</p>
        </div>
        
        <nav style={{ flex: 1, paddingTop: isMobile ? 16 : 0 }}>
          {[
            { id: 'overview', label: '📊 Dashboard', icon: '📊' },
            { id: 'services', label: '🏠 Serviços', icon: '🏠' },
            { id: 'analytics', label: '📈 Análise', icon: '📈' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              style={{
                width: '100%',
                padding: isMobile ? '12px 14px' : isTablet ? '11px 14px' : '12px 16px',
                background: selectedTab === item.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                color: '#fff',
                textAlign: 'left',
                borderRadius: 8,
                marginBottom: 4,
                cursor: 'pointer',
                fontSize: isMobile ? 14 : isTablet ? 13 : 14,
                fontWeight: selectedTab === item.id ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && isMobile && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998,
          }}
        />
      )}
    </>
  );

  const StatsCard = ({ title, value, icon, color }) => (
    <div style={{
      background: '#fff',
      padding: isMobile ? 14 : isTablet ? 18 : 20,
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9',
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? 10 : 14,
      minHeight: isMobile ? 70 : 80,
    }}>
      <div style={{
        width: isMobile ? 40 : isTablet ? 48 : 56,
        height: isMobile ? 40 : isTablet ? 48 : 56,
        borderRadius: 12,
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isMobile ? 18 : isTablet ? 20 : 22,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ 
          margin: 0, 
          color: '#64748b', 
          fontSize: isMobile ? 11 : isTablet ? 12 : 13, 
          fontWeight: 500,
          lineHeight: 1.2,
        }}>{title}</p>
        <h3 style={{ 
          margin: '2px 0 0', 
          color: '#1e293b', 
          fontSize: isMobile ? 20 : isTablet ? 24 : 28, 
          fontWeight: 700,
          lineHeight: 1,
        }}>{value}</h3>
      </div>
    </div>
  );

  const Overview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : isTablet ? 20 : 24 }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
        gap: isMobile ? 12 : isTablet ? 16 : 20,
      }}>
        <StatsCard title="Total de Serviços" value={stats.total} icon="📋" color="#667eea" />
        <StatsCard title="Residencial" value={stats.residential} icon="🏠" color="#f093fb" />
        <StatsCard title="Comercial" value={stats.commercial} icon="🏢" color="#4facfe" />
      </div>
      
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: isMobile ? 16 : isTablet ? 20 : 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid #f1f5f9',
      }}>
        <h3 style={{ 
          margin: '0 0 20px', 
          color: '#1e293b', 
          fontSize: isMobile ? 16 : isTablet ? 17 : 18, 
          fontWeight: 600 
        }}>Distribuição por Tipo</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ 
            height: 6, 
            background: '#667eea', 
            width: `${(stats.residential / stats.total) * 100}%`, 
            borderRadius: 3,
            minWidth: 16,
            maxWidth: '70%',
            flex: stats.residential > 0 ? (stats.residential / stats.total) : 0,
          }} />
          <span style={{ fontSize: isMobile ? 11 : 12, color: '#64748b', fontWeight: 500 }}>
            {((stats.residential / stats.total) * 100).toFixed(1)}% Residencial
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            height: 6, 
            background: '#4facfe', 
            width: `${(stats.commercial / stats.total) * 100}%`, 
            borderRadius: 3,
            minWidth: 16,
            maxWidth: '70%',
            flex: stats.commercial > 0 ? (stats.commercial / stats.total) : 0,
          }} />
          <span style={{ fontSize: isMobile ? 11 : 12, color: '#64748b', fontWeight: 500 }}>
            {((stats.commercial / stats.total) * 100).toFixed(1)}% Comercial
          </span>
        </div>
      </div>
    </div>
  );

  const ServicesTable = () => (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: isMobile ? 14 : isTablet ? 18 : 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #f1f5f9',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        marginBottom: isMobile ? 16 : 20,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 12 : 0,
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#1e293b', 
          fontSize: isMobile ? 16 : isTablet ? 17 : 18, 
          fontWeight: 600 
        }}>Lista de Serviços</h3>
        <input
          type="text"
          placeholder="🔍 Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: isMobile ? '10px 14px' : '11px 15px',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: isMobile ? 13 : 14,
            width: isMobile ? '100%' : isTablet ? '220px' : '260px',
            outline: 'none',
            background: '#fafbfc',
          }}
        />
      </div>
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: isMobile ? 24 : 32, color: '#64748b' }}>Carregando...</div>
      ) : filteredRequests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: isMobile ? 24 : 32, color: '#64748b' }}>
          {searchTerm ? 'Nenhum serviço encontrado.' : 'Nenhum serviço cadastrado.'}
        </div>
      ) : isMobile ? (
        // Mobile Card Layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRequests.map((req) => (
            <div key={req.id} style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 14,
              background: '#fafbfc',
            }}>
              <div style={{ marginBottom: 10 }}>
                <strong style={{ color: '#1e293b', fontSize: 15 }}>{req.nome}</strong>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                📞 {req.numeroContato}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                📍 {req.localizacao}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 500,
                  background: req.tipoLimpeza?.includes('Residencial') ? '#667eea20' : '#4facfe20',
                  color: req.tipoLimpeza?.includes('Residencial') ? '#667eea' : '#4facfe',
                }}>
                  {req.tipoLimpeza}
                </span>
                <button
                  onClick={() => handleDelete(req.id)}
                  disabled={deleting === req.id}
                  style={{
                    background: deleting === req.id ? '#ef444480' : '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 5,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 500,
                    cursor: deleting === req.id ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleting === req.id ? 'Apagando...' : '🗑️ Apagar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table Layout
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ 
                  padding: isTablet ? '12px 10px' : '14px 12px', 
                  textAlign: 'left', 
                  color: '#64748b', 
                  fontWeight: 600, 
                  fontSize: isTablet ? 12 : 13 
                }}>NOME</th>
                <th style={{ 
                  padding: isTablet ? '12px 10px' : '14px 12px', 
                  textAlign: 'left', 
                  color: '#64748b', 
                  fontWeight: 600, 
                  fontSize: isTablet ? 12 : 13 
                }}>CONTATO</th>
                <th style={{ 
                  padding: isTablet ? '12px 10px' : '14px 12px', 
                  textAlign: 'left', 
                  color: '#64748b', 
                  fontWeight: 600, 
                  fontSize: isTablet ? 12 : 13 
                }}>LOCALIZAÇÃO</th>
                <th style={{ 
                  padding: isTablet ? '12px 10px' : '14px 12px', 
                  textAlign: 'left', 
                  color: '#64748b', 
                  fontWeight: 600, 
                  fontSize: isTablet ? 12 : 13 
                }}>TIPO</th>
                <th style={{ 
                  padding: isTablet ? '12px 10px' : '14px 12px', 
                  textAlign: 'center', 
                  color: '#64748b', 
                  fontWeight: 600, 
                  fontSize: isTablet ? 12 : 13 
                }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req, index) => (
                <tr key={req.id} style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  background: index % 2 === 0 ? '#fafbfc' : '#fff',
                }}>
                  <td style={{ 
                    padding: isTablet ? '12px 10px' : '14px 12px', 
                    color: '#1e293b', 
                    fontWeight: 500,
                    fontSize: isTablet ? 13 : 14,
                  }}>{req.nome}</td>
                  <td style={{ 
                    padding: isTablet ? '12px 10px' : '14px 12px', 
                    color: '#64748b',
                    fontSize: isTablet ? 13 : 14,
                  }}>{req.numeroContato}</td>
                  <td style={{ 
                    padding: isTablet ? '12px 10px' : '14px 12px', 
                    color: '#64748b',
                    fontSize: isTablet ? 13 : 14,
                  }}>{req.localizacao}</td>
                  <td style={{ padding: isTablet ? '12px 10px' : '14px 12px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 16,
                      fontSize: isTablet ? 11 : 12,
                      fontWeight: 500,
                      background: req.tipoLimpeza?.includes('Residencial') ? '#667eea20' : '#4facfe20',
                      color: req.tipoLimpeza?.includes('Residencial') ? '#667eea' : '#4facfe',
                    }}>
                      {req.tipoLimpeza}
                    </span>
                  </td>
                  <td style={{ padding: isTablet ? '12px 10px' : '14px 12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(req.id)}
                      disabled={deleting === req.id}
                      style={{
                        background: deleting === req.id ? '#ef444480' : '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: isTablet ? '6px 12px' : '7px 14px',
                        fontSize: isTablet ? 11 : 12,
                        fontWeight: 500,
                        cursor: deleting === req.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {deleting === req.id ? 'Apagando...' : '🗑️ Apagar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Sidebar />
      
      <div style={{ 
        marginLeft: isMobile ? 0 : sidebarWidth + 20, 
        padding: isMobile ? '68px 12px 12px' : isTablet ? '20px' : '24px',
        minHeight: '100vh',
        maxWidth: `calc(100% - ${isMobile ? 0 : sidebarWidth + 20}px)`,
        overflowX: 'hidden',
        width: `calc(100% - ${isMobile ? 0 : sidebarWidth + 20}px)`,
      }}>
        <div style={{ 
          marginBottom: isMobile ? 16 : isTablet ? 20 : 24,
          maxWidth: '100%',
        }}>
          <h1 style={{ 
            margin: 0, 
            color: '#1e293b', 
            fontSize: isMobile ? 20 : isTablet ? 24 : 28, 
            fontWeight: 700,
            lineHeight: 1.2,
          }}>
            {selectedTab === 'overview' && 'Dashboard'}
            {selectedTab === 'services' && 'Gerenciar Serviços'}
            {selectedTab === 'analytics' && 'Análise de Dados'}
          </h1>
          <p style={{ 
            margin: '4px 0 0', 
            color: '#64748b', 
            fontSize: isMobile ? 13 : isTablet ? 14 : 15,
            lineHeight: 1.4,
          }}>
            {selectedTab === 'overview' && 'Visão geral dos seus serviços de limpeza'}
            {selectedTab === 'services' && 'Gerencie todos os serviços cadastrados'}
            {selectedTab === 'analytics' && 'Análise detalhada dos dados'}
          </p>
        </div>

        <div style={{ maxWidth: '100%' }}>
          {selectedTab === 'overview' && <Overview />}
          {selectedTab === 'services' && <ServicesTable />}
          {selectedTab === 'analytics' && <Overview />}
        </div>
      </div>
    </div>
  );
}

export default App;
