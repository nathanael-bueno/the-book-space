CREATE TYPE "status_usuario" AS ENUM (
  'ativo',
  'inativo',
  'bloqueado'
);

CREATE TYPE "status_livro" AS ENUM (
  'disponivel',
  'reservado',
  'trocado',
  'doado',
  'indisponivel'
);

CREATE TYPE "status_troca" AS ENUM (
  'pendente',
  'aceita',
  'recusada',
  'aguardando_entrega_proponente',
  'entregue_no_ponto',
  'aguardando_retirada_dono',
  'cancelada',
  'concluida'
);

CREATE TYPE "status_doacao" AS ENUM (
  'pendente',
  'recebida',
  'cancelada'
);

CREATE TYPE "status_denuncia" AS ENUM (
  'aberta',
  'em_analise',
  'procedente',
  'improcedente',
  'arquivada'
);

CREATE TABLE "usuarios" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome_completo" varchar(150) NOT NULL,
  "email" varchar(150) UNIQUE NOT NULL,
  "senha_hash" varchar(255) NOT NULL,
  "foto" varchar(500),
  "bio" text,
  "cidade" varchar(120),
  "nota" decimal(3,2) NOT NULL DEFAULT 0,
  "status" status_usuario NOT NULL DEFAULT 'ativo',
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "generos" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(80) UNIQUE NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "livros" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "titulo" varchar(200) NOT NULL,
  "autor" varchar(150) NOT NULL,
  "isbn" varchar(20),
  "fotos" json,
  "estado_conservacao" varchar(50) NOT NULL,
  "status" status_livro NOT NULL DEFAULT 'disponivel',
  "id_usuario_dono" uuid NOT NULL,
  "id_genero" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "pontos_troca" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(200) NOT NULL,
  "endereco" varchar(255) NOT NULL,
  "cidade" varchar(120),
  "contato" varchar(150),
  "horario_funcionamento" varchar(150),
  "status" varchar(30) NOT NULL DEFAULT 'ativo',
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "trocas" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_proponente" uuid NOT NULL,
  "id_dono" uuid NOT NULL,
  "id_livro_ofertado" uuid NOT NULL,
  "id_livro_solicitado" uuid NOT NULL,
  "id_ponto_troca" uuid NOT NULL,
  "status" status_troca NOT NULL DEFAULT 'pendente',
  "data_proposta" timestamp NOT NULL DEFAULT (now()),
  "data_entrega_proponente" timestamp,
  "data_retirada_dono" timestamp,
  "data_conclusao" timestamp,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "avaliacoes" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_usuario_avaliador" uuid NOT NULL,
  "id_usuario_avaliado" uuid NOT NULL,
  "id_troca" uuid NOT NULL,
  "nota" int NOT NULL,
  "comentario" text,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "instituicoes" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(200) NOT NULL,
  "endereco" varchar(255),
  "contato" varchar(150),
  "status" varchar(30) NOT NULL DEFAULT 'ativo',
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "doacoes" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_usuario" uuid NOT NULL,
  "id_livro" uuid NOT NULL,
  "id_instituicao" uuid NOT NULL,
  "data_doacao" timestamp NOT NULL DEFAULT (now()),
  "status" status_doacao NOT NULL DEFAULT 'pendente',
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "postagens" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_usuario_autor" uuid NOT NULL,
  "titulo" varchar(180) NOT NULL,
  "texto" text NOT NULL,
  "imagem" varchar(500),
  "id_livro_vinculado" uuid,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "mensagens" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_troca" uuid NOT NULL,
  "id_usuario_remetente" uuid NOT NULL,
  "conteudo" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "notificacoes" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_usuario" uuid NOT NULL,
  "tipo" varchar(50) NOT NULL,
  "conteudo" text NOT NULL,
  "lida" boolean NOT NULL DEFAULT false,
  "link" varchar(500),
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "curtidas" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_post" uuid NOT NULL,
  "id_usuario" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "comentarios" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_post" uuid NOT NULL,
  "id_usuario" uuid NOT NULL,
  "texto" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  "updated_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "seguidores" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_seguidor" uuid NOT NULL,
  "id_seguido" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE "denuncias" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "id_post" uuid NOT NULL,
  "id_usuario_denunciante" uuid NOT NULL,
  "motivo" text NOT NULL,
  "status" status_denuncia NOT NULL DEFAULT 'aberta',
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX ON "usuarios" ("email");

CREATE UNIQUE INDEX ON "livros" ("isbn");

CREATE INDEX ON "livros" ("id_usuario_dono");

CREATE INDEX ON "livros" ("id_genero");

CREATE INDEX ON "pontos_troca" ("cidade");

CREATE INDEX ON "pontos_troca" ("status");

CREATE INDEX ON "trocas" ("id_proponente");

CREATE INDEX ON "trocas" ("id_dono");

CREATE INDEX ON "trocas" ("id_livro_ofertado");

CREATE INDEX ON "trocas" ("id_livro_solicitado");

CREATE INDEX ON "trocas" ("id_ponto_troca");

CREATE UNIQUE INDEX ON "avaliacoes" ("id_troca", "id_usuario_avaliador");

CREATE INDEX ON "postagens" ("id_usuario_autor");

CREATE INDEX ON "postagens" ("id_livro_vinculado");

CREATE INDEX ON "mensagens" ("id_troca");

CREATE INDEX ON "mensagens" ("id_usuario_remetente");

CREATE INDEX ON "notificacoes" ("id_usuario");

CREATE INDEX ON "notificacoes" ("lida");

CREATE UNIQUE INDEX ON "curtidas" ("id_post", "id_usuario");

CREATE INDEX ON "comentarios" ("id_post");

CREATE INDEX ON "comentarios" ("id_usuario");

CREATE UNIQUE INDEX ON "seguidores" ("id_seguidor", "id_seguido");

CREATE INDEX ON "denuncias" ("id_post");

CREATE INDEX ON "denuncias" ("id_usuario_denunciante");

COMMENT ON COLUMN "usuarios"."senha_hash" IS 'Armazenar somente hash da senha';

ALTER TABLE "livros" ADD FOREIGN KEY ("id_usuario_dono") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "livros" ADD FOREIGN KEY ("id_genero") REFERENCES "generos" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "trocas" ADD FOREIGN KEY ("id_proponente") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "trocas" ADD FOREIGN KEY ("id_dono") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "trocas" ADD FOREIGN KEY ("id_livro_ofertado") REFERENCES "livros" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "trocas" ADD FOREIGN KEY ("id_livro_solicitado") REFERENCES "livros" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "trocas" ADD FOREIGN KEY ("id_ponto_troca") REFERENCES "pontos_troca" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "avaliacoes" ADD FOREIGN KEY ("id_usuario_avaliador") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "avaliacoes" ADD FOREIGN KEY ("id_usuario_avaliado") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "avaliacoes" ADD FOREIGN KEY ("id_troca") REFERENCES "trocas" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "doacoes" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "doacoes" ADD FOREIGN KEY ("id_livro") REFERENCES "livros" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "doacoes" ADD FOREIGN KEY ("id_instituicao") REFERENCES "instituicoes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "postagens" ADD FOREIGN KEY ("id_usuario_autor") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "postagens" ADD FOREIGN KEY ("id_livro_vinculado") REFERENCES "livros" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "mensagens" ADD FOREIGN KEY ("id_troca") REFERENCES "trocas" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "mensagens" ADD FOREIGN KEY ("id_usuario_remetente") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "notificacoes" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "curtidas" ADD FOREIGN KEY ("id_post") REFERENCES "postagens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "curtidas" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comentarios" ADD FOREIGN KEY ("id_post") REFERENCES "postagens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "comentarios" ADD FOREIGN KEY ("id_usuario") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "seguidores" ADD FOREIGN KEY ("id_seguidor") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "seguidores" ADD FOREIGN KEY ("id_seguido") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "denuncias" ADD FOREIGN KEY ("id_post") REFERENCES "postagens" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "denuncias" ADD FOREIGN KEY ("id_usuario_denunciante") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;
