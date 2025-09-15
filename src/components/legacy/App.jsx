import React, { useState, useEffect } from 'react'; 
import './App.css'; 

// Importações do Firebase 
import { db, auth } from './firebaseConfig'; 
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"; 

// Importações de ícones e UI 
import * as Tooltip from '@radix-ui/react-tooltip'; 
import { Trash2, Undo2 } from 'lucide-react'; 

// --- COMPONENTES AUXILIARES --- 
function LoadingScreen({ message }) { 
  return <div className="loading-screen">{message}</div>; 
} 

function LoginScreen() { 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  const handleLogin = () => { 
    if (!email || !password) { alert("Por favor, preencha o e-mail e a senha."); return; } 
    signInWithEmailAndPassword(auth, email, password) 
      .catch((error) => alert("Erro ao fazer login: " + error.message)); 
  }; 

  return ( 
    <div className="login-container"> 
      <div className="login-box"> 
        <h1>🔒 Acesso Restrito</h1> 
        <p>Use o e-mail e senha cadastrados no Firebase.</p> 
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /> 
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} /> 
        <button onClick={handleLogin}>Entrar</button> 
      </div> 
    </div> 
  ); 
} 

// --- COMPONENTE CONTROLADOR PRINCIPAL --- 
function App() { 
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [data, setData] = useState(null); 

  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => { 
      setUser(currentUser); 
      setLoading(false); 
    }); 
    return () => unsubscribe(); 
  }, []); 

  useEffect(() => { 
    if (user) { 
      const docRef = doc(db, "roadmapData", "mainConfig"); 
      const unsubscribe = onSnapshot(docRef, (docSnap) => { 
        if (docSnap.exists()) { 
          setData(docSnap.data()); 
        } else { 
          console.error("ERRO: Documento 'mainConfig' não encontrado no Firestore!"); 
          alert("Erro de configuração: Documento 'mainConfig' não foi encontrado no seu banco de dados. Verifique o Firestore."); 
        } 
      }); 
      return () => unsubscribe(); 
    } else { 
      setData(null); 
    } 
  }, [user]); 

  if (loading) { 
    return <LoadingScreen message="Verificando autenticação..." />; 
  } 

  if (!user) { 
    return <LoginScreen />; 
  } 

  if (!data) { 
    return <LoadingScreen message="Carregando dados do roadmap..." />; 
  } 

  return <RoadmapApplication initialData={data} user={user} />; 
} 

// --- COMPONENTE DA APLICAÇÃO VISUAL (VERSÃO FINAL) --- 
function RoadmapApplication({ initialData, user }) { 
    
  // FUNÇÃO CORRETORA DE DATAS (AJUSTADA) 
  function safeDate(value) { 
    const d = new Date(value + 'T00:00:00'); // Adiciona T00:00:00 para evitar fuso horário
    return isNaN(d.getTime()) ? null : d; 
  } 
    
  // FUNÇÃO AUXILIAR PARA FORMATAR DATAS DE COMPARAÇÃO
  function formatDateForComparison(dateObj) {
      if (!dateObj) return null;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }

  const [data, setData] = useState(initialData); 
    
  useEffect(() => { setData(initialData); }, [initialData]); 

  const [activeTab, setActiveTab] = useState('roadmap'); 
  const [selectedMonth, setSelectedMonth] = useState('Setembro 2025'); 
  const [lastDeleted, setLastDeleted] = useState(null); 
  const [formData, setFormData] = useState({ 
    pessoa: "", categoria: "", instituicao: "", persona: "", nomeAcao: "", 
    tipoDisparo: 'Pontual', dataInicio: "", dataFim: "", dataInicioEntrada: "", 
    dataFimEntrada: "", dataInicioComunicacao: "", dataFimComunicacao: "", 
    repiques: [], canais: [] 
  }); 
  const [customRepique, setCustomRepique] = useState(""); 
  const [repiquesTemp, setRepiquesTemp] = useState([]); 
  const [eventData, setEventData] = useState({ 
    marcoAcademico: 'Início das Aulas', dataInicio: '', dataFim: '', 
    safra: '25.2', modalidade: 'Presencial', maturidade: 'Ambos', cor: '#3b82f6' 
  }); 
  const [blockData, setBlockData] = useState({ dataInicio: '', dataFim: '', pessoas: [] }); 
  const [calendarioFilters, setCalendarioFilters] = useState({ 
    safra: '25.2', modalidade: 'Presencial', maturidade: 'Todos', parImpar: 'Todos' 
  }); 
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState(false); 
  const [newPersonName, setNewPersonName] = useState(""); 

  const handleLogout = () => { signOut(auth); }; 
    
  const updateFirebaseData = async (newDataObject) => { 
    const docRef = doc(db, "roadmapData", "mainConfig"); 
    try { await updateDoc(docRef, newDataObject); } 
    catch (error) { console.error("Erro ao salvar dados:", error); } 
  }; 

  const handleAddCommunication = () => { 
    if (!formData.pessoa || !formData.categoria) { 
      alert('Preencha campos obrigatórios.'); 
      return; 
    } 
    const newComm = {  
      id: Date.now(),  
      ...formData,  
      repiques: formData.tipoDisparo === 'Régua Fechada' ? repiquesTemp : [],  
      ativo: true  
    }; 
    const newComms = [...(data.comunicacoes || []), newComm]; 
    updateFirebaseData({ comunicacoes: newComms }); 
    
    // CÓDIGO CORRIGIDO AQUI PARA GARANTIR QUE REPIQUES SEJA SEMPRE UM ARRAY NO RESET 
    setFormData({  
      pessoa: '',  
      categoria: '',  
      instituicao: '',  
      persona: '',  
      tipoDisparo: 'Pontual',  
      dataInicio: '',  
      dataFim: '',  
      dataInicioEntrada: '',  
      dataFimEntrada: '',  
      dataInicioComunicacao: '',  
      dataFimComunicacao: '',  
      repiques: [], // GARANTIA DE QUE REPIQUES SEMPRE É UM ARRAY 
      canais: []  
    }); 
    setRepiquesTemp([]); 
  }; 

  const deleteCommunication = (id) => { 
    const commToDelete = (data.comunicacoes || []).find(c => c.id === id); 
    if(commToDelete){ 
      setLastDeleted(commToDelete); 
      const newComms = (data.comunicacoes || []).filter(c => c.id !== id); 
      updateFirebaseData({ comunicacoes: newComms }); 
    } 
  }; 
    
  const handleUndoDelete = () => { 
    if(lastDeleted){ 
      const newComms = [...(data.comunicacoes || []), lastDeleted]; 
      updateFirebaseData({ comunicacoes: newComms }); 
      setLastDeleted(null); 
    } 
  }; 
    
  const handleAddPerson = () => { 
    if (newPersonName && !(data.pessoas || []).includes(newPersonName)) { 
        const newPessoas = [...(data.pessoas || []), newPersonName]; 
        updateFirebaseData({ pessoas: newPessoas }); 
        setNewPersonName(""); 
        setIsAddPersonModalOpen(false); 
    } else { alert("O nome não pode estar vazio ou já existir."); } 
  }; 
    
  const handleDeletePerson = (personNameToDelete) => { 
    if (window.confirm(`Tem certeza que deseja excluir "${personNameToDelete}"?`)) { 
      const newPessoas = (data.pessoas || []).filter(p => p !== personNameToDelete); 
      const newComunicacoes = (data.comunicacoes || []).filter(c => c.pessoa !== personNameToDelete); 
      updateFirebaseData({ pessoas: newPessoas, comunicacoes: newComunicacoes }); 
    } 
  }; 

  const handlePessoaChange = (value) => { 
    if (value === 'outro') { setIsAddPersonModalOpen(true); setFormData(prev => ({ ...prev, pessoa: '' })); } 
    else { handleInputChange('pessoa', value); } 
  }; 
    
  const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); }; 
  const handleChannelChange = (channel, checked) => { setFormData(prev => ({ ...prev, canais: checked ? [...(prev.canais || []), channel] : (prev.canais || []).filter(c => c !== channel) })); }; 
  const addCustomRepique = () => { if (customRepique && !repiquesTemp.includes(customRepique)) { setRepiquesTemp(prev => [...prev, customRepique]); setCustomRepique(''); } }; 
  const removeRepique = (repique) => { setRepiquesTemp(prev => prev.filter(r => r !== repique)); }; 
  const handleBlockPeriod = () => { /* Sua lógica original */ }; 
  const handleAddEvent = () => { if (!eventData.marcoAcademico || !eventData.dataInicio) { alert('Preencha os campos.'); return; } const newEvent = { id: Date.now(), ...eventData }; updateFirebaseData({ eventosAcademicos: [...(data.eventosAcademicos || []), newEvent] }); }; 
  const deleteEvent = (id) => { const newEventos = (data.eventosAcademicos || []).filter(e => e.id !== id); updateFirebaseData({ eventosAcademicos: newEventos }); }; 
    
  const monthMap = { 
    'Agosto 2025': { year: 2025, month: 7 }, 
    'Setembro 2025': { year: 2025, month: 8 }, 
    'Outubro 2025': { year: 2025, month: 9 }, 
    'Novembro 2025': { year: 2025, month: 10 }, 
    'Dezembro 2025': { year: 2025, month: 11 } 
  };
    
  const generateCalendar = () => {  
    const { year, month } = monthMap[selectedMonth];  
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);  
  }; 
    
  const getCommunicationsForDayByPerson = (pessoa, day) => { 
      const { year, month } = monthMap[selectedMonth];  
      const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
      return (data.comunicacoes || []).filter(comm => { 
          if (comm.pessoa !== pessoa || !comm.ativo) return false; 
            
          if (comm.tipoDisparo === 'Pontual') { 
            return comm.dataInicio === targetDateStr; 
          } 
            
          if (comm.tipoDisparo === 'Régua Fechada') { 
            if (!comm.dataInicio) return false; 
              
            const startDate = safeDate(comm.dataInicio); 
            if (!startDate) return false; 

            // Comunicação no dia de início
            if (comm.dataInicio === targetDateStr) return true;
              
            // Comunicações de repique
            return (comm.repiques || []).some(repique => { 
                const daysToAdd = parseInt(String(repique).replace('d+', ''));  
                if (isNaN(daysToAdd)) return false;

                const repiqueDate = new Date(startDate);
                repiqueDate.setDate(startDate.getDate() + daysToAdd);
                const repiqueDateStr = formatDateForComparison(repiqueDate);
                return repiqueDateStr === targetDateStr;
            });
          } 

          if (comm.tipoDisparo === 'Régua Aberta') { 
            if (!comm.dataInicioComunicacao || !comm.dataFimComunicacao) return false;
            return targetDateStr >= comm.dataInicioComunicacao && targetDateStr <= comm.dataFimComunicacao;
          } 
          return false; 
      }); 
  }; 
    
  const getAllCommunicationsForDay = (day) => (data.pessoas || []).flatMap(pessoa => getCommunicationsForDayByPerson(pessoa, day)); 
    
  const getEventsForDay = (day) => {  
    const { year, month } = monthMap[selectedMonth];  
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
    return (data.eventosAcademicos || []).filter(event => { 
      if (!event.dataInicio) return false; 
        
      const startDateStr = event.dataInicio; 
      const endDateStr = event.dataFim || startDateStr;
        
      return targetDateStr >= startDateStr && targetDateStr <= endDateStr;  
    }).map(event => ({ ...event, cor: event.cor || '#3b82f6' }));  
  }; 
    
  const getFeriadoForDay = (day) => {  
    const { year, month } = monthMap[selectedMonth];  
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return (data.feriadosNacionais || []).find(feriado => feriado.data === targetDateStr);  
  }; 

  const isWeekend = (day) => {  
    const { year, month } = monthMap[selectedMonth];  
    const dayDate = safeDate(`${year}-${month + 1}-${day}`);  
    if (!dayDate) return false;  
    const dayOfWeek = dayDate.getDay();  
    return dayOfWeek === 0 || dayOfWeek === 6;  
  }; 
    
  const getAvailableDays = () => { 
    const { year, month } = monthMap[selectedMonth];  
    const daysInMonthDate = safeDate(`${year}-${month + 1}-01`);  
    if (!daysInMonthDate) return [];  
    const daysInMonth = new Date(year, month + 1, 0).getDate(); 
    const availableDays = []; 

    for (let day = 1; day <= daysInMonth; day++) { 
      const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const targetDateObj = safeDate(targetDateStr);
      if (!targetDateObj) continue; 

      if (isWeekend(day) || getFeriadoForDay(day)) continue; 
        
      const hasCommunications = (data.pessoas || []).some(pessoa => getCommunicationsForDayByPerson(pessoa, day).length > 0); 
        
      if (!hasCommunications) { 
        availableDays.push({ day, date: targetDateStr, dayOfWeek: targetDateObj.toLocaleDateString('pt-BR', { weekday: 'long' }) }); 
      } 
    } 
    return availableDays.slice(0, 10); 
  }; 
    
  const getFilteredEvents = () => { 
    return (data.eventosAcademicos || []).filter(event => { 
      if (calendarioFilters.safra !== 'Todos' && event.safra !== calendarioFilters.safra) return false; 
      if (calendarioFilters.modalidade !== 'Todos' && event.modalidade !== calendarioFilters.modalidade) return false; 
      if (calendarioFilters.maturidade !== 'Todos' && event.maturidade !== calendarioFilters.maturidade) return false; 
      if (calendarioFilters.parImpar !== 'Todos') { const isPar = String(event.safra).includes('.2'); if (calendarioFilters.parImpar === 'Par' && !isPar) return false; if (calendarioFilters.parImpar === 'Ímpar' && isPar) return false; } 
      return true; 
    }); 
  }; 

  return ( 
    <Tooltip.Provider> 
      <div className="App"> 
        {isAddPersonModalOpen && ( 
          <div className="modal-overlay"> 
            <div className="modal-content"> 
              <h3>Adicionar Nova Pessoa</h3> 
              <input 
                type="text" 
                placeholder="Digite o nome" 
                value={newPersonName} 
                onChange={(e) => setNewPersonName(e.target.value)} 
                autoFocus 
              /> 
              <div className="modal-actions"> 
                <button onClick={() => setIsAddPersonModalOpen(false)} className="button-cancel">Cancelar</button> 
                <button onClick={handleAddPerson} className="add-button">Adicionar</button> 
              </div> 
            </div> 
          </div> 
        )} 
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}><span>Olá, {user.email}</span><button onClick={handleLogout} style={{marginLeft: '10px'}}>Sair</button></div> 
        <header className="app-header"><h1>📊 Roadmap de Comunicação Interativo v8.0</h1><p>Gerencie jornadas de comunicação com réguas, personas, categorias, marcos acadêmicos e feriados nacionais</p></header> 
        <nav className="tab-navigation"><button className={activeTab === 'roadmap' ? 'active' : ''} onClick={() => setActiveTab('roadmap')}>Roadmap</button><button className={activeTab === 'calendario' ? 'active' : ''} onClick={() => setActiveTab('calendario')}>Calendário Acadêmico</button></nav> 

        {activeTab === 'roadmap' && ( 
          <> 
            <section className="form-section"> 
              <h3>➕ Adicionar Nova Comunicação</h3> 
              <div className="form-grid"> 
                <div className="form-group"><label>Pessoa</label><select value={formData.pessoa} onChange={(e) => handlePessoaChange(e.target.value)}><option value="">Selecione uma pessoa</option>{(data.pessoas || []).map(pessoa => (<option key={pessoa} value={pessoa}>{pessoa}</option>))}<option value="outro" style={{ fontStyle: 'italic', color: '#007bff' }}>Outro...</option></select></div> 
                <div className="form-group"><label>Nome da Ação</label><input type="text" placeholder="Nome da Ação" value={formData.nomeAcao} onChange={(e) => handleInputChange("nomeAcao", e.target.value)}/></div> 
                <div className="form-group"><label>Categoria</label><select value={formData.categoria} onChange={(e) => handleInputChange("categoria", e.target.value)}><option value="">Selecione</option>{(data.categorias || []).map(cat => (<option key={cat.nome} value={cat.nome}>{cat.nome}</option>))}</select></div> 
                <div className="form-group"><label>Instituição</label><select value={formData.instituicao} onChange={(e) => handleInputChange("instituicao", e.target.value)}><option value="">Selecione</option>{(data.instituicoes || []).map(i => (<option key={i.nome} value={i.nome}>{i.nome}</option>))}</select></div> 
                <div className="form-group"><label>Persona</label><select value={formData.persona} onChange={(e) => handleInputChange('persona', e.target.value)}><option value="">Selecione</option>{(data.personas || []).map(p => (<option key={p.nome} value={p.nome}>{p.nome}</option>))}</select></div> 
                <div className="form-group"><label>Tipo de Disparo</label><select value={formData.tipoDisparo} onChange={(e) => handleInputChange('tipoDisparo', e.target.value)}>{(data.tiposDisparo || []).map(t => (<option key={t} value={t}>{t}</option>))}</select></div> 
                {formData.tipoDisparo === 'Pontual' && (<div className="form-group"><label>Data da Comunicação</label><input type="date" value={formData.dataInicio} onChange={(e) => handleInputChange('dataInicio', e.target.value)}/></div>)} 
                {formData.tipoDisparo === 'Régua Fechada' && (<><div className="form-group"><label>Data de Início da Comunicação</label><input type="date" value={formData.dataInicio} onChange={(e) => handleInputChange('dataInicio', e.target.value)}/></div><div className="form-group"><label>Data Fim (Limite para Repiques)</label><input type="date" value={formData.dataFim} onChange={(e) => handleInputChange('dataFim', e.target.value)}/></div><div className="form-group full-width"><label>Repiques Customizáveis</label><div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}><input type="text" placeholder="Ex: d+3, d+7, d+14" value={customRepique} onChange={(e) => setCustomRepique(e.target.value)} style={{ flex: 1 }}/><button type="button" onClick={addCustomRepique} className="add-repique-btn">Adicionar</button></div><div className="repiques-list">{repiquesTemp.map(repique => (<span key={repique} className="repique-tag">{repique}<button type="button" onClick={() => removeRepique(repique)}>×</button></span>))}</div></div></>)} 
                {formData.tipoDisparo === 'Régua Aberta' && (<><div className="form-group"><label>Data Início Entrada</label><input type="date" value={formData.dataInicioEntrada} onChange={(e) => handleInputChange('dataInicioEntrada', e.target.value)}/></div><div className="form-group"><label>Data Fim Entrada</label><input type="date" value={formData.dataFimEntrada} onChange={(e) => handleInputChange('dataFimEntrada', e.target.value)}/></div><div className="form-group"><label>Data Início Comunicação</label><input type="date" value={formData.dataInicioComunicacao} onChange={(e) => handleInputChange('dataInicioComunicacao', e.target.value)}/></div><div className="form-group"><label>Data Fim Comunicação</label><input type="date" value={formData.dataFimComunicacao} onChange={(e) => handleInputChange('dataFimComunicacao', e.target.value)}/></div></>)} 
                <div className="form-group full-width"><label>Canais de Comunicação</label><div className="checkbox-group">{(data.canais || []).map(canal => (<label key={canal.nome} className="checkbox-label"><input type="checkbox" checked={(formData.canais || []).includes(canal.nome)} onChange={(e) => handleChannelChange(canal.nome, e.target.checked)}/>{canal.icone} {canal.nome}</label>))}</div></div> 
              </div> 
              <button onClick={handleAddCommunication} className="add-button">Adicionar</button> 
            </section> 
            <section className="form-section"> 
              <h3>🚫 Bloquear Período para Pessoas</h3> 
              <div className="form-grid"><div className="form-group"><label>Data Início</label><input type="date" value={blockData.dataInicio} onChange={(e) => setBlockData(prev => ({ ...prev, dataInicio: e.target.value }))}/></div><div className="form-group"><label>Data Fim</label><input type="date" value={blockData.dataFim} onChange={(e) => setBlockData(prev => ({ ...prev, dataFim: e.target.value }))}/></div><div className="form-group full-width"><label>Pessoas para Bloquear</label><div className="checkbox-group">{(data.pessoas || []).map(pessoa => (<label key={pessoa} className="checkbox-label"><input type="checkbox" checked={blockData.pessoas.includes(pessoa)} onChange={(e) => { if (e.target.checked) { setBlockData(prev => ({ ...prev, pessoas: [...prev.pessoas, pessoa] })); } else { setBlockData(prev => ({ ...prev, pessoas: prev.pessoas.filter(p => p !== pessoa) })); } }}/>{pessoa}</label>))}</div></div></div> 
              <button onClick={handleBlockPeriod} className="block-button">Bloquear Período</button> 
            </section> 
            <section className="roadmap-container"> 
              <div className="roadmap-header"><h3>🗓️ Roadmap de Comunicações</h3><div className="filter-group"><label>Filtrar por Mês:</label><select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}><option>Agosto 2025</option><option>Setembro 2025</option><option>Outubro 2025</option><option>Novembro 2025</option><option>Dezembro 2025</option></select><button onClick={handleUndoDelete} disabled={!lastDeleted} className="undo-button" title="Desfazer a última exclusão"><Undo2 size={16}/> Desfazer Exclusão</button></div></div> 
              <div className="roadmap-table"> 
                <table> 
                  <thead><tr><th className="pessoa-cell">Pessoa / Dia</th>{generateCalendar().map(day => (<th key={day} className={isWeekend(day) ? 'weekend' : ''}>{day}{getFeriadoForDay(day) && (<div className="feriado-indicator">🎉</div>)}</th>))}</tr></thead> 
                  <tbody> 
                    {(data.pessoas || []).map(pessoa => (<tr key={pessoa}><td className="pessoa-cell"><div className="pessoa-cell-content"><span>{pessoa}</span><button className="delete-pessoa-btn" onClick={() => handleDeletePerson(pessoa)} title={`Excluir ${pessoa}`}><Trash2 size={14}/></button></div></td>{generateCalendar().map(day => { const allCommsToday = getAllCommunicationsForDay(day); const hasConflictToday = allCommsToday.length > 1; const communicationsForPerson = allCommsToday.filter(c => c.pessoa === pessoa); const events = getEventsForDay(day); const feriado = getFeriadoForDay(day); return (<td key={`${pessoa}-${day}`} className={`day-cell ${isWeekend(day) ? 'weekend' : ''} ${feriado ? 'feriado' : ''}`}>{feriado && (<div className="feriado-name">{feriado.nome}</div>)}{events.map(event => (<Tooltip.Root key={event.id} delayDuration={100}><Tooltip.Trigger asChild><div className="evento-indicator" style={{ backgroundColor: event.cor }} /></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="communication-tooltip" sideOffset={5}><div className="tooltip-header"><strong>{event.marcoAcademico}</strong></div><div className="tooltip-content"><small>📅 {event.dataInicio} {event.dataFim && event.dataFim !== event.dataInicio ? `- ${event.dataFim}` : ''}</small></div></Tooltip.Content></Tooltip.Portal></Tooltip.Root>))}{communicationsForPerson.map(comm => { const categoria = (data.categorias || []).find(c => c.nome === comm.categoria); return (<Tooltip.Root key={comm.id} delayDuration={100}><Tooltip.Trigger asChild><div className="comunicacao-block" style={{ backgroundColor: categoria?.cor || '#6b7280' }}>{comm.categoria ? comm.categoria.charAt(0) : '?'}{hasConflictToday && <span className="conflict-indicator">!</span>}</div></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="communication-tooltip" sideOffset={5}><div className="tooltip-header"><strong>{comm.categoria}</strong> - {comm.persona}</div><div className="tooltip-content"><div className="tooltip-communication"><div className="tooltip-info"><small>{comm.nomeAcao || 'Sem nome'}</small>{comm.tipoDisparo === 'Régua Aberta' && (<small>Entrada: {comm.dataInicioEntrada} - {comm.dataFimEntrada}</small>)}<div className="tooltip-channels">{(comm.canais || []).join(', ')}</div></div><button className="tooltip-delete" onClick={() => deleteCommunication(comm.id)}><Trash2 size={14}/></button></div></div></Tooltip.Content></Tooltip.Portal></Tooltip.Root>);})}</td>);})}</tr>))} 
                  </tbody> 
                </table> 
              </div> 
            </section> 
            <section className="available-days"><h3>✅ Dias Disponíveis para Disparo</h3><p className="available-days-info">Exibindo dias úteis sem comunicações cadastradas</p><div className="days-grid">{getAvailableDays().map(({ day, date, dayOfWeek }) => (<div key={day} className="available-day"><div className="day-number">{day}</div><div className="day-date">{date}</div><div className="day-week">{dayOfWeek}</div></div>))}</div></section> 
          </> 
        )} 
        {activeTab === 'calendario' && ( 
          <> 
            <section className="form-section"> 
              <h3>🎓 Adicionar Marco Acadêmico</h3> 
              <div className="form-grid"> 
                <div className="form-group"><label>Marco Acadêmico</label><select value={eventData.marcoAcademico} onChange={(e) => setEventData(prev => ({ ...prev, marcoAcademico: e.target.value }))}>{(data.marcosAcademicos || []).map(marco => (<option key={marco} value={marco}>{marco}</option>))}</select></div> 
                <div className="form-group"><label>Data Início</label><input type="date" value={eventData.dataInicio} onChange={(e) => setEventData(prev => ({ ...prev, dataInicio: e.target.value }))}/></div> 
                <div className="form-group"><label>Data Fim</label><input type="date" value={eventData.dataFim} onChange={(e) => setEventData(prev => ({ ...prev, dataFim: e.target.value }))}/></div> 
                <div className="form-group"><label>Safra</label><select value={eventData.safra} onChange={(e) => setEventData(prev => ({ ...prev, safra: e.target.value }))}>{(data.safras || []).map(safra => (<option key={safra} value={safra}>{safra}</option>))}</select></div> 
                <div className="form-group"><label>Modalidade</label><select value={eventData.modalidade} onChange={(e) => setEventData(prev => ({ ...prev, modalidade: e.target.value }))}>{(data.modalidades || []).map(mod => (<option key={mod} value={mod}>{mod}</option>))}</select></div> 
                <div className="form-group"><label>Maturidade</label><select value={eventData.maturidade} onChange={(e) => setEventData(prev => ({ ...prev, maturidade: e.target.value }))}>{(data.maturidades || []).map(mat => (<option key={mat} value={mat}>{mat}</option>))}</select></div> 
                <div className="form-group"><label>Cor</label><input type="color" value={eventData.cor} onChange={(e) => setEventData(prev => ({ ...prev, cor: e.target.value }))}/></div> 
              </div> 
              <button onClick={handleAddEvent} className="add-button">Adicionar Marco</button> 
            </section> 
            <section className="timeline-filters"> 
              <h3>🔍 Filtros do Calendário Acadêmico</h3> 
              <div className="filter-grid"> 
                <div className="form-group"><label>Safra:</label><select value={calendarioFilters.safra} onChange={(e) => setCalendarioFilters(prev => ({ ...prev, safra: e.target.value }))}>{(data.safras || []).map(safra => (<option key={safra} value={safra}>{safra}</option>))}<option value="Todos">Todos</option></select></div> 
                <div className="form-group"><label>Modalidade:</label><select value={calendarioFilters.modalidade} onChange={(e) => setCalendarioFilters(prev => ({ ...prev, modalidade: e.target.value }))}>{(data.modalidades || []).map(modalidade => (<option key={modalidade} value={modalidade}>{modalidade}</option>))}<option value="Todos">Todos</option></select></div> 
                <div className="form-group"><label>Maturidade:</label><select value={calendarioFilters.maturidade} onChange={(e) => setCalendarioFilters(prev => ({ ...prev, maturidade: e.target.value }))}><option value="Todos">Todas</option>{(data.maturidades || []).map(mat => (<option key={mat} value={mat}>{mat}</option>))}</select></div> 
                <div className="filter-group"><label>Par/Ímpar:</label><select value={calendarioFilters.parImpar} onChange={(e) => setCalendarioFilters(prev => ({ ...prev, parImpar: e.target.value }))}><option value="Todos">Todos</option><option value="Par">Par</option><option value="Ímpar">Ímpar</option></select></div> 
              </div> 
            </section> 
            <section className="timeline-container"> 
              <h3>📅 Marcos Acadêmicos</h3> 
              <div className="eventos-list">{getFilteredEvents().map(event => (<div key={event.id} className="evento-card" style={{ borderLeft: `4px solid ${event.cor}` }}><div className="evento-header"><h4>{event.marcoAcademico} - {event.modalidade}</h4><button onClick={() => deleteEvent(event.id)} className="delete-button">🗑️</button></div><div className="evento-details"><span>📅 {event.dataInicio} {event.dataFim && event.dataFim !== event.dataInicio ? `- ${event.dataFim}` : ''}</span><span>🎓 Safra {event.safra} - {event.modalidade}</span><span>📋 {event.marcoAcademico}</span><span>👥 {event.maturidade}</span></div></div>))}</div> 
            </section> 
          </> 
        )} 
        <footer className="app-footer"> 
          <div className="legend"> 
            <h4>📖 Legenda e Instruções</h4> 
            <div className="legend-grid"> 
              <div className="legend-section"><h5>Personas:</h5>{(data.personas || []).map(persona => (<span key={persona.nome} className="legend-item" style={{ backgroundColor: persona.cor }}>{persona.nome}</span>))}</div> 
              <div className="legend-section"><h5>Canais:</h5>{(data.canais || []).map(canal => (<span key={canal.nome} className="legend-item" style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>{canal.icone} {canal.nome}</span>))}</div> 
              <div className="legend-section"><h5>Marcos Acadêmicos:</h5><span className="legend-item" style={{ backgroundColor: '#3b82f6' }}>Início das Aulas</span><span className="legend-item" style={{ backgroundColor: '#f59e0b' }}>Provas AV</span><span className="legend-item" style={{ backgroundColor: '#ef4444' }}>Provas AVS</span><span className="legend-item" style={{ backgroundColor: '#8b5cf6' }}>Lançamento de Notas</span><span className="legend-item" style={{ backgroundColor: '#6b7280' }}>Fim/Encerramento</span></div> 
              <div className="legend-section"><h5>Dias Especiais:</h5><span className="legend-item" style={{ backgroundColor: '#fbbf24' }}>🎉 Feriados Nacionais</span><span className="legend-item" style={{ backgroundColor: '#e5e7eb' }}>Fins de Semana</span></div> 
            </div> 
            <div className="legend-notes"> 
              <p>💡 Dicas:</p><p>• Passe o mouse sobre comunicações para ver tooltip interativo</p><p>• Use o tooltip para excluir comunicações específicas do dia</p><p>• ! indica conflito de datas</p><p>• Pontual: disparo único em data específica</p><p>• Régua fechada: disparo inicial + repiques customizáveis</p><p>• Régua aberta: período de entrada + período de comunicação</p><p>• Feriados e fins de semana não aparecem nos dias disponíveis</p><p>• Marcos acadêmicos se refletem automaticamente no roadmap</p> 
            </div> 
          </div> 
        </footer> 
      </div> 
    </Tooltip.Provider> 
  ); 
} 

export default App;
