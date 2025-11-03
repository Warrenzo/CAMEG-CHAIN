-- Script d'initialisation de la base de données CAMEG-CHAIN
-- Ce script crée les tables principales pour le système de gestion des risques

-- Créer la base de données (si elle n'existe pas déjà)
-- CREATE DATABASE "CAMEG-CHAIN";

-- Utiliser la base de données
-- \c "CAMEG-CHAIN";

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'analyst', 'user')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des entités (entreprises, organisations)
CREATE TABLE IF NOT EXISTS entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('company', 'organization', 'individual')),
    registration_number VARCHAR(50),
    country VARCHAR(100),
    sector VARCHAR(100),
    description TEXT,
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des transactions
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XOF',
    transaction_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspicious')),
    risk_score DECIMAL(5,2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des évaluations de risque
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    risk_score DECIMAL(5,2) NOT NULL,
    risk_factors JSONB,
    ai_analysis JSONB,
    manual_review BOOLEAN DEFAULT FALSE,
    reviewer_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des alertes
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Table des modèles IA
CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255),
    accuracy DECIMAL(5,4),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tables pour les appels d'offres
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
    opening_date TIMESTAMP WITH TIME ZONE NOT NULL,
    closing_date TIMESTAMP WITH TIME ZONE NOT NULL,
    tender_type VARCHAR(20) DEFAULT 'open' CHECK (tender_type IN ('open', 'restricted', 'negotiated')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'open', 'closed', 'evaluated', 'awarded', 'cancelled')),
    eligibility_rules JSONB,
    required_documents JSONB,
    estimated_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'XOF',
    evaluation_criteria JSONB,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    rfp_document_path VARCHAR(500),
    annexes JSONB,
    views_count INTEGER DEFAULT 0,
    eoi_count INTEGER DEFAULT 0,
    bids_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des manifestations d'intérêt
CREATE TABLE IF NOT EXISTS expressions_of_interest (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
    message TEXT,
    contact_preference VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    rfp_sent BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des soumissions
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
    bid_reference VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'evaluated', 'awarded', 'rejected', 'withdrawn')),
    total_amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'XOF',
    validity_period INTEGER,
    technical_proposal TEXT,
    delivery_time INTEGER,
    documents_submitted JSONB,
    technical_score DECIMAL(5,2),
    financial_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    evaluation_notes TEXT,
    ai_compliance_score DECIMAL(5,2),
    ai_issues JSONB,
    ai_recommendations JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE,
    evaluated_at TIMESTAMP WITH TIME ZONE,
    evaluated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents d'appels d'offres
CREATE TABLE IF NOT EXISTS tender_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_public BOOLEAN DEFAULT TRUE,
    requires_authentication BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des documents de soumissions
CREATE TABLE IF NOT EXISTS bid_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID REFERENCES bids(id) ON DELETE CASCADE NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    is_validated BOOLEAN DEFAULT FALSE,
    validation_notes TEXT,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP WITH TIME ZONE,
    ai_analysis JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS tender_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
CREATE INDEX IF NOT EXISTS idx_entities_risk_level ON entities(risk_level);
CREATE INDEX IF NOT EXISTS idx_transactions_entity_id ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_entity_id ON risk_assessments(entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_status ON risk_assessments(status);
CREATE INDEX IF NOT EXISTS idx_alerts_entity_id ON alerts(entity_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Tables pour l'évaluation IA des fournisseurs
CREATE TABLE IF NOT EXISTS suppliers_ai (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE UNIQUE NOT NULL,
    relation_cameg VARCHAR(20) DEFAULT 'nouveau',
    source_identification VARCHAR(50),
    niveau_confiance FLOAT DEFAULT 0.0,
    etat_prequalification VARCHAR(20) DEFAULT 'non_evalue',
    score_certifications FLOAT DEFAULT 0.0,
    score_experience FLOAT DEFAULT 0.0,
    score_documentaire FLOAT DEFAULT 0.0,
    score_capacite FLOAT DEFAULT 0.0,
    score_prix FLOAT DEFAULT 0.0,
    score_risque FLOAT DEFAULT 0.0,
    score_predictif_total FLOAT DEFAULT 0.0,
    who_pq_status VARCHAR(50),
    fda_registration VARCHAR(50),
    ema_authorization VARCHAR(50),
    gmp_certificates JSONB,
    external_references JSONB,
    audit_history JSONB,
    product_portfolio JSONB,
    market_presence JSONB,
    ai_recommendation VARCHAR(20),
    ai_confidence_level FLOAT DEFAULT 0.0,
    ai_analysis_date TIMESTAMP WITH TIME ZONE,
    ai_analysis_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des sources de données externes
CREATE TABLE IF NOT EXISTS external_data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_ai_id UUID REFERENCES suppliers_ai(id) ON DELETE CASCADE NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_url VARCHAR(500),
    data_extracted JSONB,
    confidence_score FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des logs d'analyse IA
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_ai_id UUID REFERENCES suppliers_ai(id) ON DELETE CASCADE NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    trigger_source VARCHAR(50),
    scores_before JSONB,
    scores_after JSONB,
    recommendation_before VARCHAR(20),
    recommendation_after VARCHAR(20),
    analysis_details JSONB,
    data_sources_used JSONB,
    processing_time FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table des recommandations de fournisseurs
CREATE TABLE IF NOT EXISTS supplier_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_ai_id UUID REFERENCES suppliers_ai(id) ON DELETE CASCADE NOT NULL,
    recommended_by UUID REFERENCES users(id),
    recommendation_type VARCHAR(50) NOT NULL,
    priority_level VARCHAR(20) DEFAULT 'medium',
    justification TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    review_date TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les appels d'offres
CREATE INDEX IF NOT EXISTS idx_tenders_reference ON tenders(reference);
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_category ON tenders(category);
CREATE INDEX IF NOT EXISTS idx_tenders_tender_type ON tenders(tender_type);
CREATE INDEX IF NOT EXISTS idx_tenders_closing_date ON tenders(closing_date);
CREATE INDEX IF NOT EXISTS idx_tenders_created_by ON tenders(created_by);
CREATE INDEX IF NOT EXISTS idx_expressions_of_interest_tender_id ON expressions_of_interest(tender_id);
CREATE INDEX IF NOT EXISTS idx_expressions_of_interest_supplier_id ON expressions_of_interest(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bids_tender_id ON bids(tender_id);
CREATE INDEX IF NOT EXISTS idx_bids_supplier_id ON bids(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_bid_reference ON bids(bid_reference);
CREATE INDEX IF NOT EXISTS idx_tender_documents_tender_id ON tender_documents(tender_id);
CREATE INDEX IF NOT EXISTS idx_bid_documents_bid_id ON bid_documents(bid_id);
CREATE INDEX IF NOT EXISTS idx_tender_notifications_tender_id ON tender_notifications(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_notifications_user_id ON tender_notifications(user_id);

-- Index pour l'évaluation IA des fournisseurs
CREATE INDEX IF NOT EXISTS idx_suppliers_ai_supplier_id ON suppliers_ai(supplier_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_ai_relation_cameg ON suppliers_ai(relation_cameg);
CREATE INDEX IF NOT EXISTS idx_suppliers_ai_score_total ON suppliers_ai(score_predictif_total);
CREATE INDEX IF NOT EXISTS idx_suppliers_ai_recommendation ON suppliers_ai(ai_recommendation);
CREATE INDEX IF NOT EXISTS idx_suppliers_ai_prequalification ON suppliers_ai(etat_prequalification);
CREATE INDEX IF NOT EXISTS idx_external_data_sources_supplier_ai_id ON external_data_sources(supplier_ai_id);
CREATE INDEX IF NOT EXISTS idx_external_data_sources_source_name ON external_data_sources(source_name);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_supplier_ai_id ON ai_analysis_logs(supplier_ai_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_analysis_type ON ai_analysis_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_supplier_recommendations_supplier_ai_id ON supplier_recommendations(supplier_ai_id);
CREATE INDEX IF NOT EXISTS idx_supplier_recommendations_status ON supplier_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_supplier_recommendations_priority ON supplier_recommendations(priority_level);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_assessments_updated_at BEFORE UPDATE ON risk_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer des données de test (optionnel)
-- INSERT INTO users (username, email, hashed_password, full_name, role) VALUES 
-- ('admin', 'admin@cameg.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2', 'Administrateur', 'admin'),
-- ('analyst', 'analyst@cameg.ci', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2', 'Analyste', 'analyst');

COMMENT ON DATABASE "CAMEG-CHAIN" IS 'Base de données pour le système CAMEG-CHAIN - Gestion des risques et scoring automatique';
