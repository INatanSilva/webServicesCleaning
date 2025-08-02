import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState("");
  const [completing, setCompleting] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
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

  const handleComplete = async (id) => {
    if (!window.confirm("Confirmar que a limpeza foi concluída?")) return;
    setCompleting(id);
    try {
      await updateDoc(doc(db, "requests", id), {
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      setRequests((prev) => 
        prev.map((req) => 
          req.id === id 
            ? { ...req, status: "completed", completedAt: new Date().toISOString() }
            : req
        )
      );
    } catch (error) {
      alert("Erro ao marcar como concluído: " + error.message);
    } finally {
      setCompleting("");
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.tipoLimpeza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.numeroContato?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === "all" || 
      (filterStatus === "pending" && (!req.status || req.status === "pending")) ||
      (filterStatus === "completed" && req.status === "completed");
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => !r.status || r.status === "pending").length,
    completed: requests.filter(r => r.status === "completed").length,
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
        gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
        gap: isMobile ? 12 : isTablet ? 16 : 20,
      }}>
        <StatsCard title="Total de Serviços" value={stats.total} icon="📋" color="#667eea" />
        <StatsCard title="Pendentes" value={stats.pending} icon="⏳" color="#f59e0b" />
        <StatsCard title="Concluídos" value={stats.completed} icon="✅" color="#10b981" />
        <StatsCard title="Residencial" value={stats.residential} icon="🏠" color="#f093fb" />
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
        }}>Status dos Serviços</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <div style={{ 
            height: 6, 
            background: '#f59e0b', 
            width: `${stats.total > 0 ? (stats.pending / stats.total) * 100 : 0}%`, 
            borderRadius: 3,
            minWidth: 16,
            maxWidth: '70%',
            flex: stats.pending > 0 ? (stats.pending / stats.total) : 0,
          }} />
          <span style={{ fontSize: isMobile ? 11 : 12, color: '#64748b', fontWeight: 500 }}>
            {stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : 0}% Pendentes
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ 
            height: 6, 
            background: '#10b981', 
            width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`, 
            borderRadius: 3,
            minWidth: 16,
            maxWidth: '70%',
            flex: stats.completed > 0 ? (stats.completed / stats.total) : 0,
          }} />
          <span style={{ fontSize: isMobile ? 11 : 12, color: '#64748b', fontWeight: 500 }}>
            {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}% Concluídos
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
        gap: isMobile ? 12 : 16,
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#1e293b', 
          fontSize: isMobile ? 16 : isTablet ? 17 : 18, 
          fontWeight: 600 
        }}>Lista de Serviços</h3>
        
        <div style={{ 
          display: 'flex', 
          gap: 12, 
          alignItems: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto',
        }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: isMobile ? '10px 14px' : '11px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: isMobile ? 13 : 14,
              background: '#fafbfc',
              outline: 'none',
              cursor: 'pointer',
              width: isMobile ? '100%' : '140px',
            }}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="completed">Concluídos</option>
          </select>
          
          <input
            type="text"
            placeholder="🔍 Buscar por nome, local..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            style={{
              padding: isMobile ? '10px 14px' : '11px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: isMobile ? 13 : 14,
              width: isMobile ? '100%' : isTablet ? '200px' : '240px',
              outline: 'none',
              background: '#fff',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
          />
        </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
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
                {req.status === 'completed' && (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 500,
                    background: '#10b98120',
                    color: '#10b981',
                  }}>
                    ✅ Concluído
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {(!req.status || req.status === 'pending') && (
                  <button
                    onClick={() => handleComplete(req.id)}
                    disabled={completing === req.id}
                    style={{
                      background: completing === req.id ? '#10b98180' : '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 5,
                      padding: '6px 12px',
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: completing === req.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {completing === req.id ? 'Concluindo...' : '✅ Concluir'}
                  </button>
                )}
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
        // Desktop Card Layout Responsivo
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredRequests.map((req, index) => (
            <div key={req.id} style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: isTablet ? 14 : 16,
              background: index % 2 === 0 ? '#fafbfc' : '#fff',
              display: 'flex',
              flexDirection: isTablet ? 'column' : 'row',
              alignItems: isTablet ? 'stretch' : 'center',
              gap: isTablet ? 12 : 16,
            }}>
              {/* Informações principais */}
              <div style={{ 
                flex: 1, 
                display: 'grid', 
                gridTemplateColumns: isTablet ? '1fr 1fr' : '2fr 1.5fr 2fr 1fr',
                gap: isTablet ? 12 : 16,
                alignItems: 'center',
                minWidth: 0,
              }}>
                <div>
                  <div style={{ fontSize: isTablet ? 11 : 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>
                    NOME
                  </div>
                  <div style={{ fontSize: isTablet ? 13 : 14, color: '#1e293b', fontWeight: 600 }}>
                    {req.nome}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: isTablet ? 11 : 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>
                    CONTATO
                  </div>
                  <div style={{ fontSize: isTablet ? 13 : 14, color: '#64748b' }}>
                    {req.numeroContato}
                  </div>
                </div>
                
                <div style={{ gridColumn: isTablet ? '1 / -1' : 'auto' }}>
                  <div style={{ fontSize: isTablet ? 11 : 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>
                    LOCALIZAÇÃO
                  </div>
                  <div style={{ fontSize: isTablet ? 13 : 14, color: '#64748b' }}>
                    {req.localizacao}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: isTablet ? 11 : 12, color: '#64748b', fontWeight: 500, marginBottom: 2 }}>
                    TIPO
                  </div>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 12,
                    fontSize: isTablet ? 10 : 11,
                    fontWeight: 500,
                    background: req.tipoLimpeza?.includes('Residencial') ? '#667eea20' : '#4facfe20',
                    color: req.tipoLimpeza?.includes('Residencial') ? '#667eea' : '#4facfe',
                    display: 'inline-block',
                  }}>
                    {req.tipoLimpeza}
                  </span>
                </div>
              </div>
              
              {/* Status e Ações */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isTablet ? 'row' : 'column',
                alignItems: 'center',
                gap: isTablet ? 12 : 8,
                minWidth: isTablet ? 'auto' : 180,
                justifyContent: isTablet ? 'space-between' : 'center',
              }}>
                {/* Status */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: isTablet ? 11 : 12, color: '#64748b', fontWeight: 500, marginBottom: 4 }}>
                    STATUS
                  </div>
                  {req.status === 'completed' ? (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: isTablet ? 10 : 11,
                      fontWeight: 500,
                      background: '#10b98120',
                      color: '#10b981',
                      whiteSpace: 'nowrap',
                    }}>
                      ✅ Concluído
                    </span>
                  ) : (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: isTablet ? 10 : 11,
                      fontWeight: 500,
                      background: '#f59e0b20',
                      color: '#f59e0b',
                      whiteSpace: 'nowrap',
                    }}>
                      ⏳ Pendente
                    </span>
                  )}
                </div>
                
                {/* Ações */}
                <div style={{ 
                  display: 'flex', 
                  gap: 6, 
                  flexDirection: isTablet ? 'row' : 'column',
                  alignItems: 'center',
                }}>
                  {(!req.status || req.status === 'pending') && (
                    <button
                      onClick={() => handleComplete(req.id)}
                      disabled={completing === req.id}
                      style={{
                        background: completing === req.id ? '#10b98180' : '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 5,
                        padding: isTablet ? '5px 8px' : '6px 10px',
                        fontSize: isTablet ? 9 : 10,
                        fontWeight: 500,
                        cursor: completing === req.id ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap',
                        minWidth: isTablet ? 60 : 70,
                      }}
                    >
                      {completing === req.id ? 'Concluindo...' : '✅ Concluir'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(req.id)}
                    disabled={deleting === req.id}
                    style={{
                      background: deleting === req.id ? '#ef444480' : '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 5,
                      padding: isTablet ? '5px 8px' : '6px 10px',
                      fontSize: isTablet ? 9 : 10,
                      fontWeight: 500,
                      cursor: deleting === req.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      minWidth: isTablet ? 60 : 70,
                    }}
                  >
                    {deleting === req.id ? 'Apagando...' : '🗑️ Apagar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
