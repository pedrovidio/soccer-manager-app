# Frontend Instructions - Soccer Manager App (React Native)

Você é um desenvolvedor Frontend Sênior especializado em React Native, performance e arquitetura escalável. Seu objetivo é manter a consistência com o backend (Clean Architecture) e garantir uma experiência de usuário (UX) fluida.

## 🛠 Premissas Técnicas
- **Framework:** React Native (Expo).
- **Linguagem:** TypeScript (Strict).
- **Estilização:** Componentes isolados em pastas (Component-Folder Pattern).
- **Gerenciamento de Estado:** Zustand (Global) + React Query (Server State).
- **Validação:** React Hook Form + Zod (Reutilizar Schemas do Backend).

## 📂 Estrutura de Pastas (Feature-First)
Cada domínio de negócio deve ser autossuficiente, facilitando a manutenção e a reutilização:
```text
src/features/
  ├── matchmaking/          # Contexto de jogo e sorteio
  │   ├── components/       # Componentes exclusivos da feature
  │   ├── hooks/            # Hooks de lógica de negócio
  │   ├── services/         # Chamadas de API específicas
  │   └── types.ts          # Definições de contrato (DTOs)
  ├── athletes/             # Contexto de perfil e stats
  ├── groups/               # Contexto de mensalistas e admin
  └── common/               # Componentes compartilhados (UI Kit)

## 🎨 Design System e UI
Coerência: Siga o Design System (Cores: #00C853, #1A237E).

Performance: - Use FlashList (Shopify) para todas as listagens de atletas, partidas e grupos.

Evite re-renderizações desnecessárias com useMemo e useCallback em cálculos de Overall e Matchmaking.

Component-Folder Pattern:

Todo componente deve ter sua pasta própria contendo: index.ts, Component.tsx, Component.styles.ts.

## Regras de Negócio Específicas:
- **Regra de Avaliação:** Na primeira vez que o atleta acessar o app, ele deverá responder um questionário de autoavaliação técnica, responderá qual o seu nível de futebol (se foi profissional, se jogou em varzea, se participou de competições), também responderá os atributos técnicos (Pace, Shooting, Passing, Dribbling, Defense, Physical) para calcular seu 'Overall' inicial. A avaliação do nível de futebol (questionário) servirá como um peso para diferenciar o profissional do amador. O 'Overall' é atualizado após cada partida com base na performance avaliada pelos outros jogadores.
Um atleta só pode ser avaliado se o status da Partida for 'FINISHED' e se ele estiver na lista de 'CONFIRMED_PRESENCE'.

Weighted Overall: Implementar calculateWeightedOverall(). Profissionais recebem peso 1.2, Amadores 1.0, Casuais 0.8 sobre a média dos atributos.

- **Regra para confirmar presença:** O atleta mensalista tem prioridade sobre o avulso. O atleta mensalista pode confirmar a sua presença até 30 minutos antes do início da partida. Após esse período, o sistema deve liberar as vagas para os atletas avulsos, seguindo a ordem de chegada (first-come, first-served). Os atletas (mensalistas ou avulsos) não podem confirmar presença se tiverem pendências financeiras (status de pagamento = 'PENDING') ou se estiverem machucados (isInjured).
- **Regra de Sorteio:** O sorteio de times deve priorizar o equilíbrio do 'Overall' técnico antes da posição dos jogadores. 
- **Regra de Pagamento:** Atletas mensais pagam para o administrador do grupo todo mês em data pré-definida. Atletas avulsos pagam um valor determinado pelo administrador. O administrador deverá confirmar o pagamento, mundando o status do pagamento para 'PAID'. 
- **Regra de Stats:** O 'Overall' de um atleta é a média aritmética ponderada de seus atributos técnicos, onde 'Pace' e 'Defense' têm pesos diferentes conforme a posição.

- **Disponibilidade Multi-Agenda:** Atletas avulsos podem definir múltiplos períodos de disponibilidade para jogos, e o sistema deve considerar todos esses períodos ao filtrar atletas para partidas futuras.

- **Grupos:** Um atleta poderá criar um grupo, se tornando administrador, ou participar de grupos já existentes. O administrador do grupo tem controle total sobre as partidas do grupo, podendo criar, editar e excluir partidas, além de gerenciar os membros do grupo (aceitar ou remover atletas). Os membros do grupo podem visualizar as partidas criadas pelo administrador e confirmar presença, mas não têm permissão para editar ou excluir partidas. O sistema deve garantir que apenas o administrador do grupo possa realizar ações de gerenciamento, enquanto os membros têm acesso limitado às funcionalidades de visualização e confirmação de presença. O administrador do grupo é responsável por definir a quantidade de vagas, posições necessárias e critérios de seleção dos atletas. O sistema deve permitir que o administrador do grupo abra vagas para atletas avulsos caso os mensalistas não preencham todas as vagas disponíveis, seguindo a ordem de chegada (first-come, first-served).

- **Matchmaking e Balanceamento de Times:** O sistema deve implementar um algoritmo de matchmaking que priorize o equilíbrio técnico dos times com base no 'Overall' dos jogadores, seguido pela posição. O algoritmo deve considerar as preferências de posição dos jogadores e tentar alocar jogadores em suas posições preferidas, mas sem comprometer o equilíbrio geral dos times. O sistema deve permitir que o administrador do grupo configure regras específicas para o matchmaking, como a necessidade de um goleiro e o nível dos atletas avulsos 'Overall'.

- **Marketplace de Vagas e Geofencing:**

Administradores podem abrir vagas específicas definindo: quantidade, posições, faixa etária e nível técnico (Overall).

O sistema deve filtrar atletas num raio de distância (KM) definido pelo Admin em relação ao local do jogo.

Notificações de convite são enviadas em massa; o preenchimento é por ordem de aceite (First-come, first-served), com os excedentes indo para uma lista de espera.

- **Protocolo de Check-in e Vacância:**

O check-in é obrigatório até 30 minutos antes do início da partida.

Na ausência do check-in, o sistema deve notificar o administrador para disparar a abertura automática de vagas para atletas avulsos.

- **Fluxo Financeiro e Inadimplência:**

Gestão de Recebíveis: Administradores devem cadastrar chaves PIX para recebimento.

Mensalistas: O sistema deve automatizar lembretes de cobrança para mensalistas pendentes.

- **Avulsos: O status de pagamento é validado pelo Admin.**

Bloqueio de Inadimplentes: Atletas com pendências financeiras (avulsos ou mensalistas) ficam automaticamente bloqueados de utilizar a funcionalidade de "Disponibilidade para Jogos" e de ingressar em novas partidas.

- **Monetização (Goleiro de Aluguel):**

Atletas da posição 'Goleiro' podem atuar como prestadores de serviço remunerados.

O sistema deve calcular e reter um percentual de comissão sobre o valor pago ao goleiro antes do repasse final ou via taxa de intermediação.

- **Motor de Publicidade (Ads):**

O sistema deve suportar a exibição de anúncios (Banners/Links) que podem ser segmentados pela localização geográfica do atleta ou perfil técnico

- **Quadras Parceiras:** O sistema deve permitir que quadras de futebol se cadastrem como parceiros, oferecendo descontos ou benefícios para os atletas que utilizarem seus serviços, incentivando parcerias locais e promovendo o engajamento da comunidade. As quadras parceiras podem ser destacadas no aplicativo, e os atletas podem acessar informações sobre as quadras, como localização, avaliações e ofertas especiais. Caso uma quadra parceira esteja com quadras disponíveis para aluguel, o sistema pode sugerir aos atletas a opção de reservar diretamente pela plataforma, integrando o processo de reserva e pagamento.

## 🚨 Protocolo de Desenvolvimento
NUNCA crie arquivos únicos gigantes. Se um componente tiver mais de 200 linhas ou lógica complexa, extraia a lógica para um hook e os estilos para um arquivo separado.

DRY (Don't Repeat Yourself): Componentes genéricos (Botões, Inputs, Badges) devem residir em src/components/common/.

Tratamento de Erros: Exiba feedback visual (Toast/Alert) para o usuário quando o Use Case do backend retornar um erro de negócio.

Consistência: Utilize o mesmo schema Zod definido no backend para validações de formulário.