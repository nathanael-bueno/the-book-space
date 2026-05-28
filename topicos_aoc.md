# Análise Técnica do The Book Space sob a ótica de AOC

## 1. Introdução e Contextualização do Problema
O The Book Space surge para resolver a dificuldade em trocar ou doar livros com organização e confiança. Existe uma forte necessidade de incentivar a leitura e reaproveitar livros esquecidos, o que tem impacto social direto e se alinha à ODS 4 (Educação de Qualidade). A plataforma atua como a ponte confiável que une leitores, doadores e instituições parceiras de forma rastreável.

## 2. Contexto do Sistema e Usuários
A solução é uma plataforma web que combina mecânicas de troca e doação com uma rede social de leitores.
O público-alvo é composto por:
- Leitor comum
- Doador
- Instituição parceira
- Administrador

Os benefícios centrais são o acesso facilitado a livros, a interação social engajada e a rastreabilidade total das doações.

## 3. Apresentação Geral da Solução
A plataforma é acessada via navegador e dividida tecnicamente em:
- **Frontend:** Desenvolvido em React + TypeScript para uma interface dinâmica e tipada.
- **Backend:** Desenvolvido em Laravel / PHP 8.2 provendo uma API REST robusta.
- **Banco de Dados:** PostgreSQL.
- **Infraestrutura:** Docker para conteinerização e JWT para autenticação segura.

Essa arquitetura de Cliente-Servidor com separação clara entre cliente (Frontend) e servidor (API) garante maior escalabilidade.

## 4. Principais Módulos do Sistema
O sistema é dividido em módulos bem definidos, facilitando a manutenção de software:
- **Identidade:** Autenticação e gestão de perfis de usuário.
- **Catálogo:** Cadastro e busca avançada de livros.
- **Logística de Trocas:** Proposta, aceite e acompanhamento de status.
- **Comunicação:** Chat privado após o aceite de troca.
- **Social:** Feed com curtidas, comentários e opção de seguir outros usuários.
- **Doações e Admin:** Painel administrativo para moderação e gestão de doações diretas.

## 5. Fluxo Básico de Utilização
O caminho do usuário segue as seguintes etapas:
1. **Acesso:** Cadastro e Login na plataforma.
2. **Perfil:** Configuração inicial e visualização da reputação.
3. **Acervo:** Cadastro de livros próprios ou busca no catálogo geral.
4. **Conexão:** Envio e gestão de propostas de troca.
5. **Conclusão:** Aceite da proposta e uso do chat para combinar os detalhes.
6. **Acompanhamento:** Registro de doação e histórico de ações.

## 6. Tipos de Usuários do Sistema e Nível Técnico
- **Leitor comum (Básico):** Busca livros, interage no feed e faz propostas de troca.
- **Doador (Básico):** Tem foco em cadastrar doações e acompanhar seu histórico.
- **Instituição (Intermediário):** Responsável por recebimento e gestão de volumes maiores de doações.
- **Administrador/Moderador (Avançado):** Moderação de conteúdo, gestão de instituições e análise de métricas de acesso.

## 7. Requisitos Funcionais (RF)
- **RF01:** Cadastro/login com tokens JWT.
- **RF02:** Gestão de perfil e reputação do usuário.
- **RF03:** CRUD completo para o catálogo de livros.
- **RF04:** Busca parametrizada por título, autor, ISBN e gênero.
- **RF05:** Motor de propostas de troca, com gestão e mudança de status.
- **RF06:** Chat em tempo real após a aceitação da troca.
- **RF07:** Feed social (postagens, likes, comentários).
- **RF08:** Funcionalidade de doações e histórico.
- **RF09:** Painel de administração e moderação.

## 8. Requisitos Não Funcionais (RNF)
- **Desempenho:** Baixa latência de navegação e respostas ágeis.
- **Escalabilidade:** Capacidade de absorver picos de usuários simultâneos.
- **Disponibilidade:** Manter o sistema operante e estável.
- **Segurança:** Proteção de dados e autorização robusta na API.
- **Integridade:** Confiabilidade dos dados armazenados no banco.
- **Usabilidade e Manutenibilidade:** Código legível e interface fluida.

## 9. Relação RNF x Organização e Arquitetura de Computadores (AOC)
As decisões de arquitetura de software afetam diretamente os componentes físicos da máquina e a infraestrutura subjacente:

- **Processador (CPU):** A escalabilidade e a concorrência dependem de núcleos suficientes para manter o alto processamento (throughput) da API Laravel.
- **Memória RAM:** O desempenho para lidar com requisições simultâneas é muito sensível ao cache. A falta de RAM ocasiona uso do disco rígido como memória virtual (swap), tornando a aplicação extremamente lenta.
- **Armazenamento (SSD):** O tempo de gravação e consulta pesada ao banco PostgreSQL exige velocidade do disco de armazenamento para manter a integridade sem afetar a performance.
- **Entrada/Saída (I/O) e Hierarquia:** O alto volume gerado pelo Chat ou pelo Feed de usuários estressa os eventos de rede e gera interrupções no Sistema Operacional.
- **Métricas:** Os indicadores de latência (p95/p99) só alcançam os requisitos estipulados se o código otimizado rodar em uma arquitetura de computadores adequada ao escopo.

| Recurso | RNF Relacionado | Impacto no Sistema |
| :--- | :--- | :--- |
| **CPU / Processador** | Desempenho, Escalabilidade | Concorrência de requisições HTTP, throughput da API e tempo de resposta. |
| **Memória RAM** | Desempenho, Disponibilidade | Cache de sessões JWT, workers Laravel e impacto crítico de swap. |
| **Armazenamento (SSD)** | Desempenho, Integridade | Leitura/escrita no PostgreSQL e I/O dos volumes Docker. |
| **Entrada/Saída (I/O)** | Desempenho, Escalabilidade | Rede e disco como gargalos em chat, busca e feed sob alta carga. |

## 10. Configuração Recomendada por Tipo de Usuário
Considerando a carga que a aplicação exerce na máquina local vs. no servidor:

| Perfil / Ambiente | Processador | RAM | Armazenamento / Extra |
| :--- | :--- | :--- | :--- |
| **Usuário comum** | Dual-core | 4GB | Navegador web atualizado |
| **Administrador** | Quad-core | 8GB | SSD |
| **Desenvolvedor** | 6+ núcleos | 16GB (32GB ideal)| SSD NVMe, Docker ativo |
| **Servidor (Piloto)**| 4 vCPU | 8 a 16GB | SSD, Backup, Monitoramento |

## 11. Conclusão
A arquitetura de software desenhada para o "The Book Space" define diretamente como os recursos computacionais (CPU, Memória, Disco, I/O) serão utilizados. A qualidade do sistema e a percepção do usuário final dependem ativamente de fundamentos bem consolidados de Arquitetura e Organização de Computadores (AOC).
