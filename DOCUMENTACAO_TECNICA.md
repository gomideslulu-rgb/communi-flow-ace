# Documentação Técnica - Sistema de Roadmap de Comunicação Acadêmica

## 1. VISÃO GERAL DO SISTEMA

O sistema é uma plataforma de gestão e planejamento de comunicações acadêmicas que permite:
- Visualizar um roadmap temporal de comunicações
- Cadastrar e gerenciar ações de comunicação
- Gerenciar marcos acadêmicos (calendário letivo)
- Detectar conflitos entre comunicações e marcos
- Filtrar visualizações por múltiplos critérios

## 2. ENTIDADES PRINCIPAIS

### 2.1 Pessoas (pessoas)
**Propósito**: Representa os responsáveis pelas comunicações
- `id` (UUID): Identificador único
- `nome` (TEXT): Nome da pessoa
- `created_at`, `updated_at`: Timestamps de auditoria

**Regra de Negócio**: Cada comunicação deve ter um responsável associado

### 2.2 Categorias (categorias)
**Propósito**: Classificação das comunicações (ex: Marketing, Captação, Retenção)
- `id` (UUID): Identificador único
- `nome` (TEXT): Nome da categoria
- `cor` (TEXT): Cor para identificação visual (padrão: #3b82f6)
- `created_at`, `updated_at`: Timestamps de auditoria

**Regra de Negócio**: Permite filtrar e organizar visualmente as comunicações

### 2.3 Instituições (instituicoes)
**Propósito**: Representa as instituições educacionais
- `id` (UUID): Identificador único
- `nome` (TEXT): Nome da instituição
- `cor` (TEXT): Cor para identificação visual (padrão: #1e40af)
- `created_at`, `updated_at`: Timestamps de auditoria

**Regra de Negócio**: Cada comunicação está vinculada a uma instituição específica

### 2.4 Personas (personas)
**Propósito**: Define os perfis de público-alvo das comunicações
- `id` (UUID): Identificador único
- `nome` (TEXT): Nome da persona
- `categoria` (ENUM): 'disponivel' ou 'restrita'
- `cor` (TEXT): Cor para identificação visual (padrão: #22c55e)
- `created_at`, `updated_at`: Timestamps de auditoria

**Regras de Negócio**:
- Personas "restritas" geram alertas no sistema quando selecionadas
- Uma comunicação pode ter múltiplas personas associadas
- A categoria determina restrições de uso

### 2.5 Canais (canais)
**Propósito**: Define os meios de comunicação (ex: E-mail, WhatsApp, SMS, Push)
- `id` (UUID): Identificador único
- `nome` (TEXT): Nome do canal
- `created_at`, `updated_at`: Timestamps de auditoria

**Regra de Negócio**: Uma comunicação pode utilizar múltiplos canais simultaneamente

### 2.6 Marcos Acadêmicos (marcos)
**Propósito**: Representa eventos importantes do calendário acadêmico
- `id` (UUID): Identificador único
- `nome` (TEXT): Nome do marco (ex: "Início das Aulas", "Período de Provas")
- `data_inicio` (DATE): Data de início
- `data_fim` (DATE): Data de término
- `safra` (TEXT): Período letivo (ex: "2024.1", "2024.2")
- `modalidade` (ENUM): 'Presencial', 'EAD' ou 'Híbrido'
- `maturidade` (ENUM): 'Calouros', 'Veteranos' ou 'Ambos'
- `cor` (TEXT): Cor para identificação visual
- `created_at`, `updated_at`: Timestamps de auditoria

**Regras de Negócio**:
- Marcos bloqueiam dias para comunicações
- Geram conflitos quando há comunicações agendadas nos mesmos períodos
- Servem como referência temporal para planejamento

### 2.7 Comunicações (comunicacoes)
**Propósito**: Representa as ações de comunicação planejadas/executadas
- `id` (UUID): Identificador único
- `pessoa_id` (UUID): FK para pessoas (responsável)
- `nome_acao` (TEXT): Nome/título da ação de comunicação
- `categoria_id` (UUID): FK para categorias
- `instituicao_id` (UUID): FK para instituicoes
- `tipo_disparo` (ENUM): 'Pontual', 'Régua Fechada' ou 'Régua Aberta'
- `data_inicio` (DATE): Data de início
- `data_fim` (DATE): Data de término (opcional)
- `repiques` (TEXT[]): Array de repiques/reenvios
- `ativo` (BOOLEAN): Status da comunicação
- `created_at`, `updated_at`: Timestamps de auditoria

**Relações N:N**:
- `comunicacao_personas`: Liga comunicações a múltiplas personas
- `comunicacao_canais`: Liga comunicações a múltiplos canais

## 3. LÓGICA DE TIPOS DE DISPARO

### 3.1 Pontual
**Definição**: Comunicação única enviada em uma data específica
**Lógica de Criação**: 
- Insere 1 registro na tabela `comunicacoes` com `data_inicio`
- `data_fim` não é utilizada
**Exemplo**: Envio de e-mail de boas-vindas no dia 15/03

### 3.2 Régua Fechada
**Definição**: Sequência de comunicações com datas específicas predefinidas
**Lógica de Criação**:
- Insere registro para `data_inicio`
- Insere registros para cada `repique` (calculado como dias após início)
- Insere registro para `data_fim` (se informado)
**Exemplo**: 
- Dia 0: Convite para evento
- Dia +3: Primeiro lembrete
- Dia +7: Segundo lembrete
- Dia +10: Última chamada

**Cálculo**: Se `data_inicio = 2024-03-01` e `repiques = ["3", "7"]`:
- 2024-03-01 (início)
- 2024-03-04 (início + 3 dias)
- 2024-03-08 (início + 7 dias)

### 3.3 Régua Aberta
**Definição**: Comunicações enviadas todos os dias em um período
**Lógica de Criação**:
- Gera registros para CADA dia entre `data_inicio` e `data_fim`
- Utilizado para campanhas contínuas
**Exemplo**: Campanha de captação diária de 01/03 a 31/03 (31 registros)

## 4. LÓGICA DE DETECÇÃO DE CONFLITOS

### 4.1 Tipos de Conflito

#### Conflito com Marco Acadêmico
**Condição**: Comunicação agendada durante período de marco acadêmico
**Filtros Aplicados**:
- Mesmo dia do marco
- Mesma safra
- Mesma modalidade (ou modalidade = 'Ambos')
- Mesma maturidade (ou maturidade = 'Ambos')

**Impacto**: Dia marcado como bloqueado (ícone de alerta)

#### Conflito com Outra Comunicação
**Condição**: Múltiplas comunicações da mesma pessoa no mesmo dia
**Impacto**: Alerta visual no calendário

**Recomendação do Sistema**: 
- Sugere redistribuição de comunicações
- Identifica dias disponíveis próximos

### 4.2 Algoritmo de Verificação

```typescript
function checkConflicts(dia: string, pessoaId: string) {
  // 1. Busca marcos que coincidem com o dia
  const marcosConflitantes = marcos.filter(marco => 
    diaEstaDentroDoMarco(dia, marco) &&
    filtrosCorrespondem(marco, filtros)
  );

  // 2. Busca comunicações existentes no dia/pessoa
  const comunicacoesNoDia = comunicacoes.filter(com =>
    com.data_inicio === dia &&
    com.pessoa_id === pessoaId &&
    filtrosCorrespondem(com, filtros)
  );

  // 3. Determina se há conflito
  const temConflito = marcosConflitantes.length > 0 || 
                      comunicacoesNoDia.length > 0;

  // 4. Gera recomendação se necessário
  return {
    temConflito,
    marcos: marcosConflitantes,
    comunicacoes: comunicacoesNoDia,
    recomendacao: gerarRecomendacao()
  };
}
```

## 5. LÓGICA DE DIAS DISPONÍVEIS

### 5.1 Critérios para Dia Disponível
Um dia é considerado disponível quando:
1. NÃO é fim de semana (sábado/domingo)
2. NÃO possui marcos acadêmicos ativos
3. NÃO possui comunicações já agendadas para a pessoa
4. Atende aos filtros ativos (safra, modalidade, maturidade)

### 5.2 Cálculo de Próximos Dias Disponíveis
**Lógica**:
1. Inicia busca a partir da data atual
2. Verifica cada dia sequencialmente
3. Retorna os primeiros X dias que atendem aos critérios
4. Exibe como badges verdes acima do calendário

**Propósito**: Auxiliar usuários a identificar rapidamente janelas disponíveis para agendamento

## 6. SISTEMA DE FILTROS

### 6.1 Filtros Disponíveis

#### Mês
- Determina período visualizado no calendário
- Gera timeline de dias do mês selecionado

#### Pessoa
- Filtra comunicações por responsável
- Exibe linha individual no roadmap
- Permite visão "Todos" (todas as pessoas)

#### Categoria
- Filtra comunicações por categoria
- Permite visão "Todas" (todas as categorias)

#### Safra
- Filtra marcos e comunicações por período letivo
- Formato: "YYYY.N" (ex: 2024.1, 2024.2)

#### Modalidade
- Filtra por tipo de ensino
- Valores: Presencial, EAD, Híbrido, Todos

#### Maturidade
- Filtra por público-alvo
- Valores: Calouros, Veteranos, Ambos, Todos

### 6.2 Lógica de Aplicação de Filtros
```typescript
// Filtros são aplicados em cascata:
1. Filtro de Mês → Define timeline
2. Filtro de Pessoa → Define linhas do roadmap
3. Filtro de Categoria → Filtra comunicações exibidas
4. Filtros de Safra/Modalidade/Maturidade → 
   Filtram marcos E comunicações simultaneamente
```

## 7. SEGURANÇA E PERMISSÕES (RLS)

### 7.1 Políticas de Leitura (SELECT)
**Todas as tabelas**: Acesso público para leitura
- Qualquer usuário pode visualizar dados
- Permite modo visitante funcionar

### 7.2 Políticas de Escrita (INSERT/UPDATE/DELETE)

#### Tabelas de Configuração (Somente Admin)
- `pessoas`
- `categorias`
- `instituicoes`
- `personas`
- `canais`
- `marcos`

**Regra**: Requer função `has_role(auth.uid(), 'admin')`

#### Tabelas de Comunicação (Usuários Autenticados)
- `comunicacoes`
- `comunicacao_personas`
- `comunicacao_canais`

**Regra**: Qualquer usuário autenticado pode criar/editar/deletar

### 7.3 Sistema de Roles
```sql
-- Enum de roles
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');

-- Tabela user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  role app_role NOT NULL
);

-- Função de verificação
CREATE FUNCTION has_role(_user_id UUID, _role app_role) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = _user_id AND role = _role
  );
$$;
```

## 8. FLUXOS PRINCIPAIS

### 8.1 Cadastro de Comunicação
1. Usuário acessa aba "Cadastro"
2. Preenche formulário:
   - Seleciona pessoa responsável
   - Seleciona categoria
   - Seleciona instituição
   - Define nome da ação
   - Escolhe tipo de disparo
   - Define datas (início e fim se aplicável)
   - Adiciona repiques (se Régua Fechada)
   - Seleciona personas
   - Seleciona canais
3. Sistema valida dados
4. Sistema detecta conflitos potenciais
5. Usuário confirma ou ajusta
6. Sistema cria registros:
   - Insere em `comunicacoes` (1 ou N registros conforme tipo)
   - Insere relações em `comunicacao_personas`
   - Insere relações em `comunicacao_canais`

### 8.2 Visualização do Roadmap
1. Usuário acessa aba "Roadmap"
2. Sistema carrega:
   - Marcos acadêmicos
   - Comunicações existentes
   - Pessoas, categorias, instituições, personas
3. Usuário aplica filtros
4. Sistema recalcula:
   - Timeline de dias
   - Conflitos por dia/pessoa
   - Dias disponíveis
5. Renderiza calendário visual:
   - Coluna de dias
   - Coluna de marcos (expandida conforme duração)
   - Colunas por pessoa (filtradas)
   - Indicadores de conflito
   - Badges de comunicações

### 8.3 Gestão de Marcos Acadêmicos
1. Usuário acessa aba "Calendário Acadêmico"
2. Pode:
   - Visualizar marcos existentes (com filtros)
   - Adicionar novo marco:
     - Nome (dropdown com sugestões ou customizado)
     - Datas de início e fim
     - Safra
     - Modalidade
     - Maturidade
     - Cor
3. Sistema valida datas (início < fim)
4. Insere na tabela `marcos`
5. Permite deletar marcos (requer permissão admin)

## 9. CÁLCULOS E ALGORITMOS IMPORTANTES

### 9.1 Geração de Timeline
```typescript
function generateTimelineDays(mes: string): Array<DiaDisponivel> {
  const [ano, mesNum] = mes.split('-').map(Number);
  const diasNoMes = new Date(ano, mesNum, 0).getDate();
  
  return Array.from({ length: diasNoMes }, (_, i) => {
    const dia = i + 1;
    const data = `${ano}-${String(mesNum).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return {
      dia,
      data,
      diaSemana: getDiaSemana(data)
    };
  });
}
```

### 9.2 Cálculo de Span de Marco
```typescript
function getMarcoSpan(marco: Marco, diaAtual: string): number {
  // Calcula quantos dias o marco deve se estender visualmente
  const dataInicioMarco = new Date(marco.data_inicio);
  const dataFimMarco = new Date(marco.data_fim);
  const dataAtualDate = new Date(diaAtual);
  
  if (dataAtualDate < dataInicioMarco) return 0;
  
  const diasRestantes = Math.ceil(
    (dataFimMarco.getTime() - dataAtualDate.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;
  
  return Math.max(1, diasRestantes);
}
```

### 9.3 Verificação de Final de Semana
```typescript
function isWeekend(data: string): boolean {
  const date = new Date(data + 'T00:00:00');
  const diaSemana = date.getDay();
  return diaSemana === 0 || diaSemana === 6; // Domingo ou Sábado
}
```

## 10. INTEGRAÇÕES E DEPENDÊNCIAS

### 10.1 Supabase
**Uso**: Backend completo (BaaS)
- Autenticação de usuários
- Banco de dados PostgreSQL
- Row Level Security (RLS)
- APIs REST automáticas
- Realtime (potencial para uso futuro)

**Cliente**: `@supabase/supabase-js`
**Inicialização**: 
```typescript
import { supabase } from "@/integrations/supabase/client";
```

### 10.2 React Router
**Uso**: Navegação entre páginas
**Rotas**:
- `/` - Roadmap principal (autenticado)
- `/auth` - Login/Registro
- `/visitor` - Modo visitante (somente leitura)

### 10.3 UI Components (shadcn/ui)
**Biblioteca**: Componentes React reutilizáveis baseados em Radix UI
**Principais componentes usados**:
- Card, Button, Input, Select
- Tabs (navegação entre Roadmap/Cadastro/Calendário)
- Dialog (confirmações)
- Badge (tags visuais)
- Tooltip (informações contextuais)
- Toast (notificações)

### 10.4 Lucide React
**Uso**: Biblioteca de ícones
**Ícones principais**:
- Calendar, Plus, GraduationCap (navegação)
- AlertTriangle (conflitos)
- Trash2 (deletar)
- X (fechar)

### 10.5 Date-fns
**Uso**: Manipulação de datas
**Funções utilizadas**:
- `format()` - Formatação de datas
- `parseISO()` - Parse de strings ISO
- Cálculos de diferença entre datas

## 11. REGRAS DE NEGÓCIO CRÍTICAS

### 11.1 Integridade Referencial
- Toda comunicação DEVE ter pessoa, categoria e instituição
- Comunicação pode ter 0 ou N personas
- Comunicação pode ter 0 ou N canais
- Marco não pode ter data_fim < data_inicio

### 11.2 Validações de Formulário
```typescript
// Comunicação
- nome_acao: obrigatório, mínimo 3 caracteres
- pessoa_id: obrigatório
- categoria_id: obrigatório
- instituicao_id: obrigatório
- tipo_disparo: obrigatório
- data_inicio: obrigatório, deve ser data válida
- data_fim: se Régua Aberta, obrigatório e > data_inicio
- repiques: se Régua Fechada, array de números positivos

// Marco
- nome: obrigatório
- data_inicio: obrigatório
- data_fim: obrigatório, > data_inicio
- safra: obrigatório
- modalidade: obrigatório
- maturidade: obrigatório
```

### 11.3 Comportamento de Réguas

**Régua Fechada - Cálculo de Repiques**:
```typescript
// Entrada: data_inicio = "2024-03-01", repiques = ["5", "10", "15"]
// Saída: Comunicações criadas em:
// - 2024-03-01 (início)
// - 2024-03-06 (início + 5)
// - 2024-03-11 (início + 10)
// - 2024-03-16 (início + 15)
```

**Régua Aberta - Geração de Dias**:
```typescript
// Entrada: data_inicio = "2024-03-01", data_fim = "2024-03-05"
// Saída: Comunicações criadas em:
// - 2024-03-01
// - 2024-03-02
// - 2024-03-03
// - 2024-03-04
// - 2024-03-05
// Total: 5 registros
```

### 11.4 Lógica de Conflitos e Recomendações

**Prioridade de Bloqueio**:
1. Marcos acadêmicos (prioridade máxima)
2. Comunicações existentes (alerta)
3. Finais de semana (informativo)

**Geração de Recomendações**:
```typescript
if (temMarco && temComunicacao) {
  recomendacao = "Dia bloqueado por marco acadêmico. Considere reagendar.";
} else if (temMarco) {
  recomendacao = "Dia reservado para marco acadêmico.";
} else if (temComunicacao) {
  recomendacao = "Já existe comunicação agendada para esta pessoa neste dia.";
}
```

## 12. ESTADOS E CICLO DE VIDA

### 12.1 Estados de Comunicação
- `ativo: true` - Comunicação planejada/ativa
- `ativo: false` - Comunicação cancelada/arquivada

**Observação**: Sistema não possui estados como "enviada", "em andamento", "concluída". É um sistema de planejamento, não de execução.

### 12.2 Sincronização de Dados
```typescript
// Hooks reativos
useMarcos() - Carrega e monitora marcos
useSupabaseData() - Carrega todas as entidades relacionadas
useComunicacoes() - Gerencia salvamento de comunicações

// Refetch após mutações
onAddMarco -> refetch marcos
onDeleteComunicacao -> refetch comunicacoes
onAddPessoa -> refetch pessoas
```

## 13. VISUALIZAÇÃO E UX

### 13.1 Layout do Roadmap
```
+----------+----------+----------+----------+----------+
| Dia      | Marcos   | Pessoa 1 | Pessoa 2 | Pessoa N |
+----------+----------+----------+----------+----------+
| 01/03    | [Marco1] | [Com A]  |          | [Com X]  |
| 02/03    | [......] | ⚠️       | [Com B]  |          |
| 03/03    |          | ✅       | ⚠️       | [Com Y]  |
+----------+----------+----------+----------+----------+

Legenda:
[Marco1] - Badge colorido com nome do marco
[Com A] - Badge com persona e canais
⚠️ - Indicador de conflito
✅ - Dia disponível (verde)
```

### 13.2 Código de Cores
- **Marcos**: Cor definida pelo usuário (padrão azul)
- **Categorias**: Cor definida pelo usuário (padrão azul)
- **Personas**: Cor definida pelo usuário (padrão verde)
- **Instituições**: Cor definida pelo usuário (padrão azul escuro)
- **Conflito**: Amarelo (AlertTriangle)
- **Disponível**: Verde (dot indicator)

### 13.3 Interações Principais
- **Hover em Badge**: Mostra tooltip com detalhes completos
- **Click em Comunicação**: Exibe informações detalhadas
- **Delete**: Confirmação via diálogo, depois remoção
- **Filtros**: Aplicação imediata ao alterar
- **Tabs**: Navegação entre Roadmap/Cadastro/Calendário

## 14. MODO VISITANTE

### 14.1 Características
- Acesso sem autenticação
- Somente visualização (read-only)
- Roadmap completo disponível
- Filtros funcionais
- Sem acesso a cadastro/edição/deleção

### 14.2 Rota
`/visitor` - Renderiza RoadmapContainer com prop `visitorMode={true}`

### 14.3 UI Diferenciada
- Botão "Voltar" para retornar à tela de auth
- Mensagem "Visualizando como visitante"
- UserMenu oculto
- Apenas tab Roadmap visível

## 15. MELHORIAS FUTURAS (BACKLOG TÉCNICO)

1. **Notificações em Tempo Real**
   - Usar Supabase Realtime para sync automático
   - Notificar quando outro usuário criar comunicação

2. **Histórico de Alterações**
   - Audit log de mudanças em comunicações
   - Trigger para registrar updated_by

3. **Templates de Comunicação**
   - Salvar configurações recorrentes
   - Clonar comunicações existentes

4. **Exportação de Relatórios**
   - PDF do roadmap visual
   - CSV de comunicações planejadas
   - Análise de ocupação por pessoa

5. **Dashboard Analítico**
   - Métricas de utilização
   - Taxa de conflitos
   - Comunicações por categoria/canal

6. **Integração com Ferramentas de Envio**
   - Conectar com plataformas de e-mail marketing
   - Webhooks para execução automática

7. **Aprovação de Comunicações**
   - Workflow de aprovação multi-nível
   - Estados: Rascunho → Em Aprovação → Aprovado → Enviado

8. **Gestão de Equipes**
   - Múltiplos níveis de permissão
   - Segregação por instituição
   - Roles customizados

---

## 16. GLOSSÁRIO

- **Marco**: Evento importante no calendário acadêmico que bloqueia dias para comunicações
- **Comunicação**: Ação de envio de mensagem para público-alvo específico
- **Persona**: Perfil de público-alvo (ex: Calouros 2024.1, Veteranos EAD)
- **Régua**: Sequência automatizada de comunicações
- **Repique**: Reenvio ou lembrete dentro de uma régua fechada
- **Safra**: Período letivo (semestre/ano)
- **Modalidade**: Formato do curso (Presencial/EAD/Híbrido)
- **Maturidade**: Estágio do aluno (Calouro/Veterano)
- **Conflito**: Sobreposição de marco ou comunicação no mesmo dia
- **Dia Disponível**: Dia sem marcos, comunicações ou restrições

---

## 17. COMANDOS E QUERIES ÚTEIS

### 17.1 Listar Comunicações de um Dia
```sql
SELECT c.*, p.nome as pessoa_nome, cat.nome as categoria_nome
FROM comunicacoes c
JOIN pessoas p ON c.pessoa_id = p.id
JOIN categorias cat ON c.categoria_id = cat.id
WHERE c.data_inicio = '2024-03-15'
ORDER BY p.nome;
```

### 17.2 Verificar Conflitos
```sql
SELECT 
  c.data_inicio,
  p.nome as pessoa,
  COUNT(*) as total_comunicacoes
FROM comunicacoes c
JOIN pessoas p ON c.pessoa_id = p.id
GROUP BY c.data_inicio, p.nome
HAVING COUNT(*) > 1;
```

### 17.3 Marcos Ativos em Período
```sql
SELECT *
FROM marcos
WHERE data_inicio <= '2024-03-31'
  AND data_fim >= '2024-03-01'
ORDER BY data_inicio;
```

### 17.4 Estatísticas por Pessoa
```sql
SELECT 
  p.nome,
  COUNT(c.id) as total_comunicacoes,
  COUNT(DISTINCT c.data_inicio) as dias_ocupados
FROM pessoas p
LEFT JOIN comunicacoes c ON p.id = c.pessoa_id
GROUP BY p.id, p.nome
ORDER BY total_comunicacoes DESC;
```

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Última Atualização**: Ajuste de RLS para usuários autenticados
