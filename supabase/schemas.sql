CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    telefone VARCHAR(20),
    email VARCHAR(150),
    whatsapp_numero VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')),
    cor VARCHAR(7),
    icone VARCHAR(50),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    natureza VARCHAR(25) CHECK (natureza IN ('cmv', 'custo_operacional', 'impostos')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE fornecedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20),
    contato VARCHAR(100),
    email VARCHAR(150),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    uf VARCHAR(2),
    categoria VARCHAR(100),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE lancamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES categorias(id),
    fornecedor_id UUID REFERENCES fornecedores(id),
    tipo VARCHAR(20) CHECK (tipo IN ('receita', 'despesa')) NOT NULL,
    descricao TEXT,
    valor NUMERIC(14,2) NOT NULL,
    data_referencia DATE NOT NULL,
    criado_por VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE mensagens_whatsapp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    contato VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('texto', 'audio', 'imagem', 'documento')),
    direcao VARCHAR(10) CHECK (direcao IN ('entrada', 'saida')),
    lancamento_id UUID REFERENCES lancamentos(id),
    processada BOOLEAN DEFAULT FALSE,
    data_envio TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    mensagem_id UUID REFERENCES mensagens_whatsapp(id),
    tipo VARCHAR(50),
    url TEXT NOT NULL,
    nome_original TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
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
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    tipo VARCHAR(50),
    impacto NUMERIC(5,2),
    descricao TEXT,
    status VARCHAR(30) DEFAULT 'pendente', -- pendente, resolvido, ignorado
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    alerta_id UUID REFERENCES alertas(id) ON DELETE CASCADE,
    hipotese TEXT,
    acao_recomendada TEXT,
    status VARCHAR(30) DEFAULT 'pendente', -- pendente, em_analise, resolvido
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE metas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    tipo VARCHAR(30) CHECK (tipo IN ('receita', 'cmv', 'ebitda')),
    valor_alvo NUMERIC(14,2),
    periodo DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE log_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    mensagem_id UUID REFERENCES mensagens_whatsapp(id),
    acao VARCHAR(100),
    resultado TEXT,
    sucesso BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);