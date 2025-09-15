export interface Marco {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  safra: string;
  modalidade: 'Presencial' | 'EAD' | 'Híbrido';
  maturidade: 'Calouros' | 'Veteranos' | 'Ambos';
  cor: string;
}

export interface Persona {
  id: string;
  nome: string;
  cor: string;
  categoria: 'disponivel' | 'restrita';
}

export interface Instituicao {
  id: string;
  nome: string;
  cor: string;
}

export interface Comunicacao {
  id: string;
  pessoa: string;
  nomeAcao: string;
  categoria: string;
  instituicao: string;
  persona: string;
  tipoDisparo: 'Pontual' | 'Régua Fechada' | 'Régua Aberta';
  dataInicio: string;
  dataFim?: string;
  repiques?: string[];
  canais: string[];
  ativo: boolean;
}

export interface DiaDisponivel {
  dia: number;
  data: string;
  diaSemana: string;
}

export interface ConflictoInfo {
  temConflito: boolean;
  marcos: Marco[];
  comunicacoes: Comunicacao[];
  recomendacao?: string;
}

export interface FiltrosCalendario {
  safra: string;
  modalidade: string;
  maturidade: string;
  mes: string;
}