import { Marco, Persona, Instituicao, Comunicacao } from '@/types/roadmap';

export const mockData = {
  pessoas: [
    'Ana Silva',
    'Bruno Santos',
    'Carla Oliveira',
    'Diego Ferreira',
    'Elena Costa',
    'Felipe Rocha'
  ],

  categorias: [
    { nome: 'Matrícula', cor: '#3b82f6' },
    { nome: 'Acadêmica', cor: '#10b981' },
    { nome: 'Financeira', cor: '#f59e0b' },
    { nome: 'Marketing', cor: '#ef4444' },
    { nome: 'Vestibular', cor: '#8b5cf6' },
    { nome: 'Eventos', cor: '#06b6d4' }
  ],

  instituicoes: [
    { nome: 'UNINASSAU', cor: '#1e40af', id: '1' },
    { nome: 'UNIFACS', cor: '#dc2626', id: '2' },
    { nome: 'UNAMA', cor: '#059669', id: '3' },
    { nome: 'FAMETRO', cor: '#7c3aed', id: '4' }
  ] as Instituicao[],

  personas: [
    { nome: 'Interessado', cor: '#22c55e', categoria: 'disponivel', id: '1' },
    { nome: 'Engajado', cor: '#3b82f6', categoria: 'disponivel', id: '2' },
    { nome: 'Ativo', cor: '#8b5cf6', categoria: 'disponivel', id: '3' },
    { nome: 'Focado', cor: '#06b6d4', categoria: 'disponivel', id: '4' },
    { nome: 'Dedicado', cor: '#10b981', categoria: 'disponivel', id: '5' },
    { nome: 'Ausente', cor: '#ef4444', categoria: 'restrita', id: '6' },
    { nome: 'Sem Foco', cor: '#f59e0b', categoria: 'restrita', id: '7' },
    { nome: 'Parado', cor: '#6b7280', categoria: 'restrita', id: '8' },
    { nome: 'Evolução', cor: '#ec4899', categoria: 'restrita', id: '9' },
    { nome: 'Base Externa', cor: '#14b8a6', categoria: 'disponivel', id: '10' }
  ] as Persona[],

  marcos: [
    {
      id: '1',
      nome: 'Início das Aulas',
      dataInicio: '2025-09-01',
      dataFim: '2025-09-07',
      safra: '25.2',
      modalidade: 'Presencial',
      maturidade: 'Ambos',
      cor: '#3b82f6'
    },
    {
      id: '2',
      nome: 'PROVA AV',
      dataInicio: '2025-09-15',
      dataFim: '2025-09-20',
      safra: '25.2',
      modalidade: 'Presencial',
      maturidade: 'Ambos',
      cor: '#ef4444'
    },
    {
      id: '3',
      nome: 'PROVA AVS',
      dataInicio: '2025-09-25',
      dataFim: '2025-09-30',
      safra: '25.2',
      modalidade: 'Presencial',
      maturidade: 'Ambos',
      cor: '#dc2626'
    },
    {
      id: '4',
      nome: 'Matrícula',
      dataInicio: '2025-10-01',
      dataFim: '2025-10-15',
      safra: '25.2',
      modalidade: 'Presencial',
      maturidade: 'Calouros',
      cor: '#10b981'
    }
  ] as Marco[],

  comunicacoes: [
    {
      id: '1',
      pessoa: 'Ana Silva',
      nomeAcao: 'Lembrete de Matrícula',
      categoria: 'Matrícula',
      instituicao: 'UNINASSAU',
      persona: 'Interessado',
      tipoDisparo: 'Pontual',
      dataInicio: '2025-09-10',
      canais: ['E-mail', 'WhatsApp'],
      repiques: [],
      ativo: true
    },
    {
      id: '2',
      pessoa: 'Bruno Santos',
      nomeAcao: 'Campanha Vestibular',
      categoria: 'Vestibular',
      instituicao: 'UNIFACS',
      persona: 'Engajado',
      tipoDisparo: 'Régua Fechada',
      dataInicio: '2025-09-12',
      canais: ['E-mail', 'SMS', 'Push'],
      repiques: ['d+3', 'd+7', 'd+15'],
      ativo: true
    }
  ] as Comunicacao[],

  canais: [
    'E-mail',
    'WhatsApp',
    'SMS',
    'Push Notification',
    'Redes Sociais',
    'Portal do Aluno',
    'Telefone',
    'Aplicativo'
  ]
};