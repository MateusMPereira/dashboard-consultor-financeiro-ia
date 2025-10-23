CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    whatsapp_numero VARCHAR(20),
    data_cadastro TIMESTAMP DEFAULT NOW()
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    senha_hash TEXT,
    papel VARCHAR(50) DEFAULT 'admin', -- admin, financeiro, colaborador
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20),
    contato VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(150),
    observacoes TEXT
);

CREATE TABLE lancamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
    descricao TEXT,
    valor NUMERIC(14,2) NOT NULL,
    data_referencia DATE NOT NULL,
    origem VARCHAR(30) DEFAULT 'whatsapp', -- whatsapp, lovable, manual
    criado_por VARCHAR(100), -- nome do usuário que enviou
    data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mensagens_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    contato VARCHAR(50) NOT NULL, -- número do cliente no WhatsApp
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('texto', 'audio', 'imagem', 'documento')),
    direcao VARCHAR(10) CHECK (direcao IN ('entrada', 'saida')),
    lancamento_id UUID REFERENCES lancamentos(id),
    processada BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT NOW()
);

CREATE TABLE arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    mensagem_id UUID REFERENCES mensagens_whatsapp(id),
    tipo VARCHAR(50), -- nota_fiscal, relatorio, outro
    url TEXT NOT NULL, -- caminho do arquivo (S3, Supabase Storage, etc)
    nome_original TEXT,
    data_upload TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kpis_financeiros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    receita_liquida NUMERIC(14,2),
    cmv NUMERIC(14,2),
    custo_pessoal NUMERIC(14,2),
    custo_fixo NUMERIC(14,2),
    margem_contribuicao NUMERIC(5,2),
    ebitda NUMERIC(14,2),
    ebitda_percent NUMERIC(5,2),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(50), -- CMV Alto, Receita Baixa, EBITDA Negativo, etc
    impacto NUMERIC(5,2),
    descricao TEXT,
    status VARCHAR(30) DEFAULT 'pendente', -- pendente, resolvido, ignorado
    data_alerta DATE DEFAULT CURRENT_DATE
);

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    alerta_id UUID REFERENCES alertas(id) ON DELETE CASCADE,
    hipotese TEXT,
    acao_recomendada TEXT,
    status VARCHAR(30) DEFAULT 'pendente', -- pendente, em_analise, resolvido
    data_criacao TIMESTAMP DEFAULT NOW()
);

CREATE TABLE metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo VARCHAR(30) CHECK (tipo IN ('receita', 'cmv', 'ebitda')),
    valor_alvo NUMERIC(14,2),
    periodo DATE NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE log_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    mensagem_id UUID REFERENCES mensagens_whatsapp(id),
    acao VARCHAR(100),
    resultado TEXT,
    sucesso BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT NOW()
);