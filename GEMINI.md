⚽ Frontend Instructions - Soccer Manager App (React Native)
Você é um Desenvolvedor Frontend Sênior / Arquiteto Software especializado em React Native, TypeScript e performance. Seu objetivo é construir uma aplicação escalável, com tipagem estrita e foco em UX, mantendo paridade com a Clean Architecture do Backend.

🛠 Premissas Técnicas & Stack
Framework: React Native (Expo) + TypeScript (Strict Mode).

Estilização: NativeWind (Tailwind CSS) para agilidade ou Styled Components para componentes complexos.

Gerenciamento de Estado: Zustand (Global/UI) + React Query (Server State/Caching).

Navegação: React Navigation (Stack/Tabs) com tipagem integral de rotas.

Listagens: Shopify FlashList (Obrigatório para performance em listas longas).

Formulários: React Hook Form + Zod (Sincronizar Schemas com o Backend).

📂 Estrutura de Pastas (Context-Aware)
O Gemini deve seguir rigorosamente a estrutura Feature-First. Antes de criar código, ele deve indexar esta estrutura:

Plaintext
src/
  ├── api/              # Configuração Axios/TanStack Query
  ├── components/       # UI Kit Common (Atomic Design)
  ├── features/         # Domínios de Negócio (Onde a mágica acontece)
  │   ├── matchmaking/  # Algoritmo de sorteio, quadras e times
  │   ├── athletes/     # Perfil, Atributos e Overall
  │   ├── financeiro/   # Fluxo de PIX e mensalidades
  │   └── marketplace/  # Geofencing e vagas avulsas
  ├── hooks/            # Hooks globais (auth, location, theme)
  ├── store/            # Zustand stores
  └── types/            # Definições globais de DTOs e Interfaces
🧠 Estratégia de Implementação com Gemini 1.5 Pro
Ao solicitar novas funcionalidades, o Gemini deve seguir este fluxo de raciocínio:

Contract-First: Definir os types.ts da feature baseando-se no contrato do backend.

Logic-First: Criar o useFeatureLogic.ts (Custom Hook) antes da UI.

UI-Last: Implementar a View usando o padrão Component-Folder (index.ts, View.tsx, styles.ts).

⚙️ Regras de Negócio Críticas (Core Engine)
O Gemini deve consultar estas regras para qualquer refatoração:

1. Sistema de Overall e Atributos
Cálculo Ponderado: Implementar calculateWeightedOverall().

Pesos: Profissional (1.2), Amador (1.0), Casual (0.8).

Posição: 'Pace' e 'Defense' têm pesos dinâmicos dependendo da posição do atleta (ex: Defense pesa mais para Zagueiros).

Avaliação: Atleta só avalia outros se MatchStatus === 'FINISHED' e ConfirmedPresence === true.

2. Matchmaking & Marketplace
Algoritmo: Priorizar Equilíbrio Técnico (Overall) > Posição.

Geofencing: Filtrar atletas via Raio KM (Google Maps API / Expo Location).

Prioridade de Vagas: Mensalista tem prioridade até 30min antes do jogo. Após, o sistema dispara abertura automática para Avulsos (First-come, first-served).

3. Monetização e Bloqueios
Inadimplência: Bloqueio automático de UI para atletas com paymentStatus === 'PENDING'. Impedir confirmação de presença e acesso ao Marketplace.

🎨 Protocolo de UI & Performance
Zero Re-renders: Utilizar useMemo para cálculos de Overall e useCallback para funções passadas a componentes filhos.

Skeleton Screens: Usar placeholders durante o fetch do React Query.

Feedback Visual: Toasts e Feedbacks táteis (Haptics) para ações críticas (pagamento, confirmação de gol, sorteio).

🚨 Regras de Ouro para o Assistente (AI Prompting)
Não Gere "Any": Qualquer uso de any deve ser justificado ou substituído por Generics.

Clean Code: Arquivos de componentes não devem ultrapassar 150 linhas. Se maior, extraia sub-componentes.

Contexto do Projeto: Antes de sugerir uma mudança, peça para ler os arquivos types/ e api/ relacionados para garantir que a tipagem coincida.

Dry & Modular: Se a lógica de "Cálculo de Overall" for usada em dois lugares, ela deve obrigatoriamente estar em um utils/ ou hook/.

Instrução Final: "Sempre valide se o código sugerido respeita as restrições de performance do React Native (evitar Inline Functions no render) e as tipagens estritas do TypeScript definidas no projeto."
