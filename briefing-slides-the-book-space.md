# Briefing para IA gerar os slides

Use este comando:

```text
Crie uma apresentação em português (pt-BR), em formato de slides, sobre análise técnica do software “The Book Space” relacionando o sistema com conteúdos de Organização e Arquitetura de Computadores (AOC).

Objetivo da apresentação:
Mostrar como decisões de software impactam requisitos não funcionais e como esses requisitos dependem de hardware, desempenho e arquitetura computacional.

Público:
Professor e turma de Engenharia de Software (nível graduação).

Tom:
Acadêmico, claro, direto, com linguagem técnica acessível.

Quantidade:
12 slides + 1 slide final de perguntas (total 13).

Estrutura obrigatória:

Slide 1 — Capa
- Título: “Análise Técnica do The Book Space sob a ótica de AOC”
- Subtítulo: “Projeto Integrador — Engenharia de Software”
- Campos para nomes dos integrantes e data

Slide 2 — Introdução e Contextualização do Problema
- Problema: dificuldade em trocar/doar livros com organização e confiança
- Contexto: incentivo à leitura, reaproveitamento de livros, impacto social (ODS 4)
- Necessidade atendida: conexão entre leitores, doadores e instituições

Slide 3 — Contexto do Sistema e Usuários
- Sistema: plataforma web de troca/doação com rede social
- Usuários: leitor comum, doador, instituição parceira, administrador
- Benefício central: acesso a livros + interação social + rastreabilidade

Slide 4 — Apresentação Geral da Solução
- Funcionamento geral do The Book Space
- Tecnologias: React + TypeScript, Laravel/PHP 8.2, PostgreSQL, Docker, JWT
- Arquitetura: frontend separado do backend (API REST)

Slide 5 — Principais Módulos do Sistema
- Autenticação e perfis
- Catálogo e busca de livros
- Trocas (proposta, aceite, status)
- Chat pós-aceite
- Feed social (likes, comentários, seguir)
- Doações e painel administrativo

Slide 6 — Fluxo Básico de Utilização
- Cadastro/login
- Configuração de perfil e reputação
- Cadastro/busca de livros
- Envio e gestão de proposta de troca
- Aceite + chat + conclusão
- Registro de doação/histórico

Slide 7 — Tipos de Usuários do Sistema
- Leitor comum: busca, interação, proposta de troca
- Doador: cadastro de doações e histórico
- Instituição: recebimento/acompanhamento de doações
- Admin/moderador: moderação, gestão de instituições e métricas
- Incluir nível técnico esperado de cada perfil (básico/intermediário)

Slide 8 — Requisitos Funcionais (RF)
Liste RF principais:
- RF01 Cadastro/login com JWT
- RF02 Gestão de perfil e reputação
- RF03 CRUD de livros
- RF04 Busca com filtros (título, autor, ISBN, gênero/localização)
- RF05 Propostas de troca e mudança de status
- RF06 Chat após aceite
- RF07 Feed social (post, like, comentário, seguir)
- RF08 Doações e histórico
- RF09 Administração e moderação

Slide 9 — Requisitos Não Funcionais (RNF)
Liste RNFs:
- Desempenho (baixa latência)
- Escalabilidade (mais usuários simultâneos)
- Disponibilidade (estabilidade)
- Segurança (autenticação/autorização/proteção de dados)
- Integridade e confiabilidade dos dados
- Usabilidade e responsividade
- Manutenibilidade

Slide 10 — Relação RNF x AOC (parte 1)
Conectar RNFs aos tópicos:
- Processador (CPU): concorrência e throughput
- Memória RAM: cache, múltiplos processos e impacto de swap
- Armazenamento (SSD): tempo de consulta e gravação
- Entrada/Saída (I/O): rede + disco como gargalos comuns

Slide 11 — Relação RNF x AOC (parte 2)
Conectar RNFs aos tópicos:
- Hierarquia de memória (cache L1/L2/L3, RAM, disco)
- Interrupções no SO (eventos de rede/disco)
- Métricas de desempenho (latência p95/p99, req/s, taxa de erro)
- Conclusão técnica: RNF depende de software + infraestrutura adequada

Slide 12 — Configuração Recomendada por Tipo de Usuário
Tabela comparativa com 4 perfis:
1) Usuário comum (cliente web)
2) Administrador/moderador
3) Desenvolvedor do sistema
4) Servidor de produção acadêmica/piloto

Sugestão mínima:
- Usuário comum: CPU dual-core, 4GB RAM, navegador atualizado
- Admin: quad-core, 8GB RAM, SSD
- Dev: 6+ núcleos, 16GB RAM (ideal 32GB), SSD NVMe, Docker
- Servidor: 4 vCPU, 8–16GB RAM, SSD, backup e monitoramento

Slide 13 — Conclusão e Perguntas
- Síntese: decisões de arquitetura de software afetam diretamente uso de CPU, memória, armazenamento e I/O
- Mensagem final: qualidade percebida pelo usuário depende também de fundamentos de AOC
- “Perguntas?”

Requisitos de design dos slides:
- Visual limpo e acadêmico
- Pouco texto por slide (máx. 6 bullets, frases curtas)
- Inserir 1 diagrama simples de arquitetura (frontend → API → banco)
- Inserir 1 tabela comparativa (configuração por usuário)
- Inserir 1 matriz “RNF x Recurso Computacional”
- Cores sóbrias (azul/cinza/branco), boa legibilidade, sem poluição visual

Entregáveis desejados:
1) Estrutura completa slide a slide
2) Texto final de cada bullet pronto para uso
3) Sugestão de fala do apresentador (2–3 frases por slide)
4) Sugestão de imagem/ícone por slide
```
