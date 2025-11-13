-- ==============================
-- RECRIAR SCHEMA COMPLETO
-- ==============================

-- 1. EMPRESAS
DROP TABLE IF EXISTS public.empresas CASCADE;
CREATE TABLE public.empresas (
  id uuid not null default gen_random_uuid (),
  nome character varying not null,
  cnpj character varying null,
  telefone character varying null,
  email character varying null,
  ativo boolean null default true,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null,
  atividade text not null default 'varejo'::text,
  constraint empresas_pkey primary key (id),
  constraint empresas_cnpj_key unique (cnpj),
  constraint empresas_atividade_check check (
    (
      atividade = any (array['varejo'::text, 'servico'::text])
    )
  )
);

-- 2. CATEGORIAS
DROP TABLE IF EXISTS public.categorias CASCADE;
CREATE TABLE public.categorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  natureza text NOT NULL DEFAULT 'despesa'::text CHECK (natureza = ANY (ARRAY['receita'::text, 'despesa'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT categorias_pkey PRIMARY KEY (id)
);

-- 3. USUÁRIOS
DROP TABLE IF EXISTS public.usuarios CASCADE;
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  auth_id uuid NOT NULL UNIQUE,
  nome character varying NOT NULL CHECK (length(nome::text) <= 150),
  whatsapp_numero character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT usuarios_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id)
);

-- 4. SUBCATEGORIAS
DROP TABLE IF EXISTS public.subcategorias CASCADE;
CREATE TABLE public.subcategorias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid,
  empresa_id uuid NOT NULL,
  nome character varying NOT NULL,
  descricao text,
  ativo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  categoria_id uuid NOT NULL,
  CONSTRAINT subcategorias_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT categorias_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT subcategorias_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id)
);

-- 5. MENSAGENS_WHATSAPP
DROP TABLE IF EXISTS public.mensagens_whatsapp CASCADE;
CREATE TABLE public.mensagens_whatsapp (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  contato character varying NOT NULL,
  mensagem text NOT NULL,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['texto'::character varying, 'audio'::character varying, 'imagem'::character varying, 'documento'::character varying]::text[])),
  direcao character varying CHECK (direcao::text = ANY (ARRAY['entrada'::character varying, 'saida'::character varying]::text[])),
  lancamento_id uuid,
  processada boolean DEFAULT false,
  data_envio timestamp without time zone DEFAULT now(),
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT mensagens_whatsapp_pkey PRIMARY KEY (id),
  CONSTRAINT mensagens_whatsapp_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);

-- 6. ALERTAS
DROP TABLE IF EXISTS public.alertas CASCADE;
CREATE TABLE public.alertas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  titulo character varying NOT NULL,
  tipo character varying,
  impacto numeric,
  descricao text,
  status character varying DEFAULT 'pendente'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT alertas_pkey PRIMARY KEY (id),
  CONSTRAINT alertas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);

-- 7. INSIGHTS
DROP TABLE IF EXISTS public.insights CASCADE;
CREATE TABLE public.insights (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  alerta_id uuid,
  hipotese text,
  acao_recomendada text,
  status character varying DEFAULT 'pendente'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT insights_pkey PRIMARY KEY (id),
  CONSTRAINT insights_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT insights_alerta_id_fkey FOREIGN KEY (alerta_id) REFERENCES public.alertas(id)
);

-- 8. LANCAMENTOS
DROP TABLE IF EXISTS public.lancamentos CASCADE;
CREATE TABLE public.lancamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  sub_categoria_id uuid,
  descricao text,
  valor numeric NOT NULL,
  data_referencia date NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT lancamentos_pkey PRIMARY KEY (id),
  CONSTRAINT lancamentos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT lancamentos_sub_categoria_id_fkey FOREIGN KEY (sub_categoria_id) REFERENCES public.subcategorias(id)
);

-- 9. ARQUIVOS
DROP TABLE IF EXISTS public.arquivos CASCADE;
CREATE TABLE public.arquivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  mensagem_id uuid,
  tipo character varying,
  url text NOT NULL,
  nome_original text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT arquivos_pkey PRIMARY KEY (id),
  CONSTRAINT arquivos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT arquivos_mensagem_id_fkey FOREIGN KEY (mensagem_id) REFERENCES public.mensagens_whatsapp(id)
);

-- 10. LOG_IA
DROP TABLE IF EXISTS public.log_ia CASCADE;
CREATE TABLE public.log_ia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  mensagem_id uuid,
  acao character varying,
  resultado text,
  sucesso boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT log_ia_pkey PRIMARY KEY (id),
  CONSTRAINT log_ia_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id),
  CONSTRAINT log_ia_mensagem_id_fkey FOREIGN KEY (mensagem_id) REFERENCES public.mensagens_whatsapp(id)
);

-- 11. METAS
DROP TABLE IF EXISTS public.metas CASCADE;
CREATE TABLE public.metas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL,
  tipo character varying CHECK (tipo::text = ANY (ARRAY['receita'::character varying, 'cmv'::character varying, 'ebitda'::character varying]::text[])),
  valor_alvo numeric,
  periodo date NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone,
  CONSTRAINT metas_pkey PRIMARY KEY (id),
  CONSTRAINT metas_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresas(id)
);
