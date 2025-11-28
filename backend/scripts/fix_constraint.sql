-- Script SQL pour corriger la contrainte CHECK sur le statut des appels d'offres
-- Supprimer l'ancienne contrainte
ALTER TABLE tenders DROP CONSTRAINT IF EXISTS tenders_status_check;

-- Recréer la contrainte avec les bonnes valeurs (en minuscules)
ALTER TABLE tenders 
ADD CONSTRAINT tenders_status_check 
CHECK (status IN ('draft', 'published', 'open', 'closed', 'evaluated', 'awarded', 'cancelled'));

