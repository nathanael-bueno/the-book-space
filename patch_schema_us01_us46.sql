-- =========================================================
-- PATCH INCREMENTAL - PI Eng de Software
-- Objetivo: robustez para US01-US46
-- PostgreSQL
-- =========================================================

BEGIN;

-- 0) Extensao util para buscas por texto (US09/US13/US38)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------
-- 1) Ajustes de integridade e consistencia
-- ---------------------------------------------------------

-- ISBN nao deve ser unique global (2 usuarios podem ter mesmo livro/edicao)
DROP INDEX IF EXISTS livros_isbn_key;
CREATE INDEX IF NOT EXISTS idx_livros_isbn ON livros (isbn);
CREATE UNIQUE INDEX IF NOT EXISTS uq_livros_dono_isbn
  ON livros (id_usuario_dono, isbn)
  WHERE isbn IS NOT NULL;

-- Notas validas
ALTER TABLE usuarios
  ADD CONSTRAINT chk_usuarios_nota_range CHECK (nota >= 0 AND nota <= 5);

ALTER TABLE avaliacoes
  ADD CONSTRAINT chk_avaliacoes_nota_range CHECK (nota BETWEEN 1 AND 5);

-- Sem auto-follow
ALTER TABLE seguidores
  ADD CONSTRAINT chk_seguidores_nao_auto_follow CHECK (id_seguidor <> id_seguido);

-- Troca nao pode ser com o mesmo usuario
ALTER TABLE trocas
  ADD CONSTRAINT chk_trocas_usuarios_distintos CHECK (id_proponente <> id_dono);

-- updated_at faltante em algumas tabelas
ALTER TABLE doacoes      ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();
ALTER TABLE mensagens    ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();
ALTER TABLE notificacoes ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();
ALTER TABLE denuncias    ADD COLUMN IF NOT EXISTS updated_at timestamp NOT NULL DEFAULT now();

-- ---------------------------------------------------------
-- 2) Trocas - robustez de fluxo (US14-US20/US23)
-- ---------------------------------------------------------

-- Ponto de troca pode ser definido depois da aceitacao
ALTER TABLE trocas
  ALTER COLUMN id_ponto_troca DROP NOT NULL;

-- Confirmacao bilateral de recebimento (US18)
ALTER TABLE trocas
  ADD COLUMN IF NOT EXISTS confirmado_proponente_em timestamp,
  ADD COLUMN IF NOT EXISTS confirmado_dono_em timestamp;

-- Mensagem opcional na proposta e motivo de cancelamento
ALTER TABLE trocas
  ADD COLUMN IF NOT EXISTS mensagem_proposta text,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento text;

-- Indices uteis de consulta
CREATE INDEX IF NOT EXISTS idx_trocas_status_dono
  ON trocas (status, id_dono, data_proposta DESC);

CREATE INDEX IF NOT EXISTS idx_trocas_status_proponente
  ON trocas (status, id_proponente, data_proposta DESC);

-- ---------------------------------------------------------
-- 3) Livros - imagens normalizadas e busca
-- ---------------------------------------------------------

-- Tabela de imagens do livro (melhor que json para manutencao/ordem)
CREATE TABLE IF NOT EXISTS livro_imagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_livro uuid NOT NULL,
  url varchar(500) NOT NULL,
  ordem int NOT NULL DEFAULT 0,
  principal boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT fk_livro_imagens_livro
    FOREIGN KEY (id_livro) REFERENCES livros(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_livro_imagens_livro_ordem
  ON livro_imagens (id_livro, ordem);

-- Busca textual por titulo/autor/isbn
CREATE INDEX IF NOT EXISTS idx_livros_titulo_trgm
  ON livros USING gin (titulo gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_livros_autor_trgm
  ON livros USING gin (autor gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_livros_isbn_trgm
  ON livros USING gin (isbn gin_trgm_ops);

-- ---------------------------------------------------------
-- 4) Instituicoes e pontos de troca - geodados (US32/US33/US40)
-- ---------------------------------------------------------

ALTER TABLE instituicoes
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;

ALTER TABLE pontos_troca
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_instituicoes_ativa ON instituicoes (ativa);
CREATE INDEX IF NOT EXISTS idx_pontos_troca_ativa ON pontos_troca (ativa);

-- ---------------------------------------------------------
-- 5) Notificacoes e preferencias (US15/US23/US36/US41/US42)
-- ---------------------------------------------------------

-- Tipo estruturado de notificacao
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_notificacao') THEN
    CREATE TYPE tipo_notificacao AS ENUM (
      'troca_proposta',
      'troca_aceita',
      'troca_recusada',
      'troca_concluida',
      'nova_mensagem',
      'curtida_post',
      'comentario_post',
      'novo_seguidor',
      'doacao_confirmada',
      'sistema'
    );
  END IF;
END$$;

ALTER TABLE notificacoes
  ADD COLUMN IF NOT EXISTS tipo_v2 tipo_notificacao,
  ADD COLUMN IF NOT EXISTS payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS lida_em timestamp;

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida_created
  ON notificacoes (id_usuario, lida, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_payload_gin
  ON notificacoes USING gin (payload);

-- Preferencias por usuario
CREATE TABLE IF NOT EXISTS preferencias_notificacao (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario uuid NOT NULL UNIQUE,
  troca_proposta_inapp boolean NOT NULL DEFAULT true,
  troca_proposta_email boolean NOT NULL DEFAULT true,
  troca_status_inapp boolean NOT NULL DEFAULT true,
  troca_status_email boolean NOT NULL DEFAULT true,
  mensagem_inapp boolean NOT NULL DEFAULT true,
  mensagem_email boolean NOT NULL DEFAULT false,
  curtida_inapp boolean NOT NULL DEFAULT true,
  curtida_email boolean NOT NULL DEFAULT false,
  comentario_inapp boolean NOT NULL DEFAULT true,
  comentario_email boolean NOT NULL DEFAULT false,
  novo_seguidor_inapp boolean NOT NULL DEFAULT true,
  novo_seguidor_email boolean NOT NULL DEFAULT false,
  doacao_inapp boolean NOT NULL DEFAULT true,
  doacao_email boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT fk_pref_notif_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 6) Moderacao / administracao (US37/US44/US45)
-- ---------------------------------------------------------

-- Enriquecer denuncias
ALTER TABLE denuncias
  ADD COLUMN IF NOT EXISTS id_moderador uuid,
  ADD COLUMN IF NOT EXISTS motivo_categoria varchar(80),
  ADD COLUMN IF NOT EXISTS observacao_moderacao text,
  ADD COLUMN IF NOT EXISTS resolvido_em timestamp;

ALTER TABLE denuncias
  ADD CONSTRAINT fk_denuncias_moderador
  FOREIGN KEY (id_moderador) REFERENCES usuarios(id);

CREATE INDEX IF NOT EXISTS idx_denuncias_status_created
  ON denuncias (status, created_at DESC);

-- Auditoria de acoes admin
CREATE TABLE IF NOT EXISTS auditoria_admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_admin uuid NOT NULL,
  acao varchar(100) NOT NULL,
  entidade varchar(80) NOT NULL,
  id_entidade uuid,
  detalhe jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  CONSTRAINT fk_auditoria_admin_usuario
    FOREIGN KEY (id_admin) REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_auditoria_admin_created
  ON auditoria_admin (created_at DESC);

-- ---------------------------------------------------------
-- 7) Relacionamento de status de usuario com moderacao (US45)
-- ---------------------------------------------------------

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS suspenso_ate timestamp,
  ADD COLUMN IF NOT EXISTS motivo_bloqueio text;

-- ---------------------------------------------------------
-- 8) Feed e performance social (US26-US31)
-- ---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_postagens_created
  ON postagens (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_postagens_autor_created
  ON postagens (id_usuario_autor, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comentarios_post_created
  ON comentarios (id_post, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_seguidores_seguido
  ON seguidores (id_seguido);

-- ---------------------------------------------------------
-- 9) Doacoes e historicos (US34/US35/US39/US40)
-- ---------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_doacoes_usuario_data
  ON doacoes (id_usuario, data_doacao DESC);

CREATE INDEX IF NOT EXISTS idx_doacoes_instituicao_data
  ON doacoes (id_instituicao, data_doacao DESC);

-- ---------------------------------------------------------
-- 10) Conflitos de constraints (execucao segura)
-- ---------------------------------------------------------

-- Se alguma CHECK ja existir com outro nome, adaptar manualmente.
-- Este patch assume ambiente de desenvolvimento e pode exigir limpeza
-- em bases antigas antes de reaplicar.

COMMIT;

-- =========================================================
-- Observacoes operacionais
-- 1) A aplicacao deve passar a gravar imagens em livro_imagens.
-- 2) notificacoes.tipo_v2 pode coexistir com notificacoes.tipo durante migracao.
-- 3) Criar jobs/triggers para:
--    - recalculo de usuarios.nota (US21)
--    - auto conclusao de troca quando ambos confirmarem (US18)
-- 4) Para /books?q= com performance, usar ILIKE + trigram.
-- =========================================================
