import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Award,
  Globe,
  ArrowRight,
  Loader2,
  RefreshCw,
  Star,
  DownloadCloud,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

type SupplierSearchResult = {
  id: string;
  company_name: string;
  country: string;
  score: number;
  recommendation?: string | null;
  relation_type?: string | null;
  who_pq_status?: string | null;
  last_analysis?: string | null;
};

type SupplierSearchResults = {
  partenaires_actuels: SupplierSearchResult[];
  nouveaux_prequalifies: SupplierSearchResult[];
  a_auditer: SupplierSearchResult[];
  total: number;
};

type SupplierSearchResponse = {
  query?: string | null;
  filters: Record<string, unknown>;
  results: SupplierSearchResults;
  total_found: number;
};

type FilterOption = {
  value: string;
  label: string;
};

type FilterOptionsResponse = {
  relation_types: FilterOption[];
  recommendations: FilterOption[];
  countries: FilterOption[];
};

type AiStats = {
  total_suppliers_analyzed: number;
  prequalified: number;
  to_audit: number;
  high_risk: number;
  relation_breakdown: Record<string, number>;
  pending_recommendations: number;
  analysis_coverage: string;
};

type FiltersState = {
  relation_type?: string;
  recommendation?: string;
  country?: string;
  min_score?: number;
};

type QuickFilter = {
  id: string;
  label: string;
  type: keyof FiltersState;
  value: string | number;
};

type TransformedSupplier = SupplierSearchResult & {
  statusLabel: string;
};

type RecentAnalysis = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_country?: string;
  score_after?: number;
  recommendation_after?: string;
  analysis_type: string;
  trigger_source?: string;
  created_at: string;
  processing_time?: number;
};

type AiMonitoringLive = {
  recent_analyses: RecentAnalysis[];
  pending_recommendations: number;
  high_risk_suppliers: number;
  total_logs: number;
  last_refresh: string;
};

const QUICK_FILTERS: QuickFilter[] = [
  { id: 'relation-ancien', label: 'Partenaires actuels', type: 'relation_type', value: 'ancien' },
  { id: 'recommendation-prequalifie', label: 'Nouveaux préqualifiés', type: 'recommendation', value: 'prequalifie' },
  { id: 'recommendation-auditer', label: 'À auditer', type: 'recommendation', value: 'a_auditer' },
  { id: 'minscore-80', label: 'Score ≥ 80', type: 'min_score', value: 80 },
  { id: 'country-india', label: 'Inde', type: 'country', value: 'India' }
];

const PRESETS = [
  'Fournisseurs Mégamylase Europe + Afrique',
  'Laboratoires ORL certifiés GMP',
  'Distributeurs de kits PCR en Afrique de l’Est'
];

const PAGE_SIZE = 10;

const buildApiBaseUrl = () => {
  const apiUrl = process.env['REACT_APP_API_URL'] || 'http://localhost:8000';
  return apiUrl.replace(/\/api\/v1\/?$/, '');
};

const recommendationLabel = (value?: string | null) => {
  switch (value) {
    case 'prequalifie':
      return 'Préqualifié';
    case 'a_auditer':
      return 'À auditer';
    case 'risque_eleve':
      return 'Risque élevé';
    default:
      return 'Non évalué';
  }
};

const AISupplierSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [highlightedPreset, setHighlightedPreset] = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>({});
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);

  const [filtersOptions, setFiltersOptions] = useState<FilterOptionsResponse>({
    relation_types: [],
    recommendations: [],
    countries: []
  });
  const [filtersError, setFiltersError] = useState<string | null>(null);

  const [stats, setStats] = useState<AiStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [results, setResults] = useState<TransformedSupplier[]>([]);
  const [resultsMeta, setResultsMeta] = useState({ total: 0, totalFound: 0 });
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportLoading, setExportLoading] = useState(false);

  const [monitoring, setMonitoring] = useState<AiMonitoringLive | null>(null);
  const [monitoringLoading, setMonitoringLoading] = useState(true);
  const [monitoringError, setMonitoringError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);
  const skipPageEffectRef = useRef(false);
  const apiBaseUrl = useMemo(() => buildApiBaseUrl(), []);
  const buildApiUrl = useCallback((path: string) => `${apiBaseUrl}${path}`, [apiBaseUrl]);

  const quickFilterMap = useMemo(
    () =>
      QUICK_FILTERS.reduce<Record<string, QuickFilter>>((acc, filter) => {
        acc[filter.id] = filter;
        return acc;
      }, {}),
    []
  );

  const flattenResults = (data?: SupplierSearchResults | null): TransformedSupplier[] => {
    if (!data) return [];
    const enrich = (items: SupplierSearchResult[], label: string): TransformedSupplier[] =>
      items.map((item) => ({
        ...item,
        statusLabel: label
      }));

    return [
      ...enrich(data.partenaires_actuels, 'Partenaire CAMEG'),
      ...enrich(data.nouveaux_prequalifies, 'Préqualifié IA'),
      ...enrich(data.a_auditer, 'À auditer')
    ].sort((a, b) => b.score - a.score);
  };

  const fetchFilters = async () => {
    setFiltersError(null);
    try {
      const { data } = await api.get<FilterOptionsResponse>(buildApiUrl('/api/v1/ai/suppliers/search/filters'));
      setFiltersOptions(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setFiltersError(message);
      toast.error("Impossible de charger les filtres IA");
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const { data } = await api.get<AiStats>(buildApiUrl('/api/v1/ai/suppliers/dashboard/stats'));
      setStats(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      setStatsError(message);
      toast.error("Impossible de charger les statistiques IA");
    } finally {
      setStatsLoading(false);
    }
  };

  const buildSearchPayload = (page = currentPage) => ({
    query: query.trim() || undefined,
    relation_type: appliedFilters.relation_type || undefined,
    recommendation: appliedFilters.recommendation || undefined,
    country: appliedFilters.country || undefined,
    min_score: appliedFilters.min_score ?? undefined,
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE
  });

  const fetchSuppliers = async (silent = false, targetPage?: number) => {
    const pageToLoad = targetPage ?? currentPage;
    setResultsLoading(!silent);
    setResultsError(null);
    try {
      const payload = buildSearchPayload(pageToLoad);
      const { data } = await api.post<SupplierSearchResponse>(buildApiUrl('/api/v1/ai/suppliers/search'), payload);
      setResults(flattenResults(data.results));
      setResultsMeta({
        total: data.results.total,
        totalFound: data.total_found
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inattendue';
      setResultsError(message);
      toast.error("Impossible d’exécuter la recherche IA");
    } finally {
      setResultsLoading(false);
    }
  };

  const handleSearch = () => {
    skipPageEffectRef.current = true;
    setCurrentPage(1);
    fetchSuppliers(false, 1);
  };

  const handlePreset = (preset: string) => {
    setQuery(preset);
    setHighlightedPreset(preset);
    skipPageEffectRef.current = true;
    setCurrentPage(1);
    fetchSuppliers(false, 1);
  };

  const handleQuickFilterToggle = (filter: QuickFilter) => {
    const isActive = activeQuickFilters.includes(filter.id);
    setActiveQuickFilters((prev) => {
      if (isActive) {
        return prev.filter((id) => id !== filter.id);
      }
      const cleaned = prev.filter((id) => quickFilterMap[id]?.type !== filter.type);
      return [...cleaned, filter.id];
    });
    setAppliedFilters((prev) => ({
      ...prev,
      [filter.type]: isActive ? undefined : filter.value
    }));
  };

  const handleSelectChange = (type: keyof FiltersState, value: string) => {
    setAppliedFilters((prev) => ({
      ...prev,
      [type]: value || undefined
    }));
    setActiveQuickFilters((prev) => prev.filter((id) => quickFilterMap[id]?.type !== type));
  };

  const handleMinScoreChange = (value: string) => {
    const parsed = value ? Number(value) : undefined;
    const validScore = parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined;
    setAppliedFilters((prev) => {
      const next = { ...prev };
      if (validScore === undefined) {
        delete next.min_score;
      } else {
        next.min_score = validScore;
      }
      return next;
    });
    setActiveQuickFilters((prev) => prev.filter((id) => quickFilterMap[id]?.type !== 'min_score'));
  };

  const resetFilters = () => {
    setAppliedFilters({});
    setActiveQuickFilters([]);
    setHighlightedPreset(null);
  };

useEffect(() => {
  const bootstrap = async () => {
    await Promise.all([fetchFilters(), fetchStats()]);
    await fetchSuppliers();
    hasFetchedRef.current = true;
  };
  skipPageEffectRef.current = true;
  bootstrap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  if (hasFetchedRef.current) {
    skipPageEffectRef.current = true;
    setCurrentPage(1);
    fetchSuppliers(true, 1);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [appliedFilters]);

useEffect(() => {
  if (!hasFetchedRef.current) {
    return;
  }
  if (skipPageEffectRef.current) {
    skipPageEffectRef.current = false;
    return;
  }
  fetchSuppliers(true, currentPage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentPage]);

  const kpiCards = useMemo(() => {
    if (!stats) {
      return [
        { label: 'Fournisseurs analysés', value: statsLoading ? 'Chargement...' : '—', detail: '' },
        { label: 'Préqualifiés', value: '—', detail: '' },
        { label: 'À auditer', value: '—', detail: '' },
        { label: 'Recommandations en attente', value: '—', detail: '' }
      ];
    }
    return [
      { label: 'Fournisseurs analysés', value: stats.total_suppliers_analyzed.toString(), detail: `Couverture ${stats.analysis_coverage}` },
      { label: 'Préqualifiés', value: stats.prequalified.toString(), detail: 'Score ≥ 80' },
      { label: 'À auditer', value: stats.to_audit.toString(), detail: 'Suivi prioritaire' },
      { label: 'Recommandations en attente', value: stats.pending_recommendations.toString(), detail: 'DAQA' }
    ];
  }, [stats, statsLoading]);

  const connectorsSnapshot = useMemo(() => {
    if (!stats) {
      return [
        { label: 'Partenaires CAMEG', value: '—' },
        { label: 'Nouveaux identifiés', value: '—' },
        { label: 'Surveillance active', value: '—' }
      ];
    }
    return [
      { label: 'Partenaires CAMEG', value: stats.relation_breakdown?.['ancien'] ?? 0 },
      { label: 'Nouveaux identifiés', value: stats.relation_breakdown?.['nouveau'] ?? 0 },
      { label: 'Surveillance active', value: stats.high_risk }
    ];
  }, [stats]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const params = {
        query: query.trim() || undefined,
        relation_type: appliedFilters.relation_type || undefined,
        recommendation: appliedFilters.recommendation || undefined,
        country: appliedFilters.country || undefined,
        min_score: appliedFilters.min_score ?? undefined
      };
      const response = await api.get(buildApiUrl('/api/v1/ai/suppliers/export'), {
        params,
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `export_ia_fournisseurs_${new Date().toISOString().slice(0, 19)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export CSV téléchargé');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Export impossible : ${message}`);
    } finally {
      setExportLoading(false);
    }
  };

  const loadMonitoring = async () => {
    setMonitoringLoading(true);
    setMonitoringError(null);
    try {
      const { data } = await api.get<AiMonitoringLive>(buildApiUrl('/api/v1/ai/suppliers/monitoring/live'));
      setMonitoring(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inattendue';
      setMonitoringError(message);
    } finally {
      setMonitoringLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoring();
    const interval = setInterval(loadMonitoring, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = Math.max(1, Math.ceil(resultsMeta.totalFound / PAGE_SIZE));
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="space-y-10 pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050A1E] via-[#151A3C] to-[#0A3E5D] text-white p-8 shadow-[0_25px_80px_rgba(5,10,40,0.4)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-10 w-72 h-72 bg-cyan-400/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-12 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent)]" />
        </div>
        <div className="relative grid gap-8 lg:grid-cols-[3fr,1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/15 text-xs uppercase tracking-wide font-semibold">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              IA Supplier Intelligence
            </div>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              L’IA scanne en temps réel les écosystèmes pharma pour vous suggérer{' '}
              <span className="text-cyan-300">les fournisseurs les plus fiables.</span>
            </h2>
            <p className="mt-3 text-sm text-white/80 max-w-3xl">
              Combinez marketplaces, registres officiels, presse spécialisée et réseaux professionnels dans une seule expérience de recherche.
              Les résultats sont scorés, contextualisés et prêts à être intégrés dans CAMEG‑CHAIN.
            </p>

            <div className="mt-6 space-y-4">
              <div className="bg-white/10 rounded-3xl p-4 border border-white/10 backdrop-blur-2xl">
                <label className="text-xs uppercase tracking-wide text-white/60">Votre requête</label>
                <div className="mt-3 relative">
                  <div className="absolute left-4 top-4 text-white/60">
                    <Search className="h-5 w-5" />
                  </div>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={3}
                    placeholder="Ex. Trouver des fournisseurs de Mégamylase en Afrique de l’Ouest disposant d’une certification GMP."
                    className="w-full bg-white/5 border border-white/15 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <select
                    value={appliedFilters.relation_type || ''}
                    onChange={(e) => handleSelectChange('relation_type', e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                  >
                    <option value="">Relation CAMEG</option>
                    {filtersOptions.relation_types.map((option) => (
                      <option key={option.value} value={option.value} className="text-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={appliedFilters.recommendation || ''}
                    onChange={(e) => handleSelectChange('recommendation', e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                  >
                    <option value="">Recommandation IA</option>
                    {filtersOptions.recommendations.map((option) => (
                      <option key={option.value} value={option.value} className="text-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={appliedFilters.country || ''}
                    onChange={(e) => handleSelectChange('country', e.target.value)}
                    className="w-full rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                  >
                    <option value="">Pays</option>
                    {filtersOptions.countries.map((option) => (
                      <option key={option.value} value={option.value} className="text-slate-900">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {filtersError && (
                  <p className="mt-2 text-xs text-rose-200">{filtersError}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="text-xs uppercase tracking-wide text-white/60">Score minimum</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={appliedFilters.min_score ?? ''}
                    onChange={(e) => handleMinScoreChange(e.target.value)}
                    className="w-32 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                    placeholder="50"
                  />
                  <button
                    onClick={resetFilters}
                    className="text-xs text-white/70 underline-offset-4 hover:text-white hover:underline"
                  >
                    Réinitialiser
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {QUICK_FILTERS.map((filter) => {
                    const isActive = activeQuickFilters.includes(filter.id);
                    return (
                      <button
                        key={filter.id}
                        onClick={() => handleQuickFilterToggle(filter)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          isActive ? 'bg-white text-slate-900 border-transparent shadow-lg' : 'border-white/30 text-white/70 hover:border-white/60'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePreset(preset)}
                      className={`flex items-center text-xs px-3 py-1.5 rounded-full border border-white/20 transition-all ${
                        highlightedPreset === preset ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Sparkles className="h-3 w-3 mr-2" />
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleSearch}
                    disabled={resultsLoading}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-5 py-2.5 font-semibold shadow-xl hover:shadow-2xl transition-all disabled:opacity-60"
                  >
                    {resultsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-slate-900" />}
                    {resultsLoading ? 'Analyse en cours...' : 'Lancer l’analyse'}
                  </button>
                  <div className="flex items-center text-xs text-white/70">
                    <ShieldCheck className="h-4 w-4 mr-2 text-emerald-300" />
                    Données consolidées depuis 42 sources
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-xl p-4 border border-white/10">
              <p className="text-xs uppercase text-white/60">Sourcing IA — 24h</p>
              <p className="text-4xl font-semibold mt-3">{statsLoading ? '…' : stats?.total_suppliers_analyzed ?? '—'}</p>
              <p className="text-sm text-white/70">fournisseurs détectés</p>
              <div className="mt-4 flex items-center text-xs text-white/70">
                <TrendingUp className="h-4 w-4 text-emerald-300 mr-2" />
                Couverture {stats?.analysis_coverage || 'en cours'}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl p-4 border border-white/5 space-y-3">
              <p className="text-xs uppercase text-white/60">Instantané IA</p>
              <div className="space-y-2 text-sm">
                {connectorsSnapshot.map((item) => (
                  <div key={item.label} className="flex justify-between text-white/80">
                    <span>{item.label}</span>
                    <span className="text-cyan-200 font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  fetchStats();
                  fetchSuppliers(true);
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm text-white hover:text-cyan-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser les données
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg p-5"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-sm mt-1 text-slate-500">{kpi.detail}</p>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-200/40 to-transparent dark:from-white/5" />
          </div>
        ))}
      </section>

      {statsError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {statsError}
        </div>
      )}

      {/* Résultats */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Résultats IA</h3>
            <p className="text-sm text-slate-500">
              {resultsLoading
                ? 'Analyse des résultats IA en cours...'
                : `${resultsMeta.totalFound} fournisseurs correspondent à votre requête (limités à ${PAGE_SIZE} affichés).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:border-slate-400 transition">
              <Filter className="h-4 w-4" />
              Filtres avancés
            </button>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm shadow-lg hover:bg-slate-800 transition disabled:opacity-60"
            >
              {exportLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}
              {exportLoading ? 'Export en cours...' : 'Exporter CSV'}
            </button>
          </div>
        </div>

        {resultsError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {resultsError}
          </div>
        )}

        {resultsLoading ? (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement des recommandations IA...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-slate-500">
            Aucun fournisseur ne correspond à ces critères. Ajustez la requête ou les filtres pour élargir la recherche.
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((supplier) => (
              <div
                key={supplier.id}
                className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white/80 dark:bg-slate-900/70 shadow-[0_30px_60px_rgba(15,23,42,0.12)] hover:shadow-[0_35px_80px_rgba(15,23,42,0.18)] transition-transform hover:-translate-y-1"
              >
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-200/40 dark:bg-slate-700/30 rounded-full blur-3xl" />
                </div>
                <div className="relative p-6 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="text-xl font-semibold text-slate-900 dark:text-white">{supplier.company_name}</h4>
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900 text-white">
                          Score {Math.round(supplier.score)}%
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full bg-slate-100 text-slate-600">
                          {supplier.statusLabel}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-2">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {supplier.country || '—'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {recommendationLabel(supplier.recommendation)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          Relation : {supplier.relation_type || 'non renseignée'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => toast('La fiche détaillée sera disponible prochainement.')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow hover:shadow-lg"
                      >
                        Voir fiche IA
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Création de recommandation IA bientôt disponible.')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-full shadow-lg hover:bg-slate-800"
                      >
                        Créer recommandation
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Détails IA</p>
                      <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex justify-between">
                          <span>Recommandation</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {recommendationLabel(supplier.recommendation)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Relation CAMEG</span>
                          <span>{supplier.relation_type || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Statut WHO PQ</span>
                          <span>{supplier.who_pq_status || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dernière analyse</span>
                          <span>{supplier.last_analysis ? new Date(supplier.last_analysis).toLocaleString('fr-FR') : '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-900 text-white rounded-2xl p-4 relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
                      <p className="text-xs uppercase tracking-wide text-white/60">Statut IA</p>
                      <p className="mt-2 text-lg font-semibold">{supplier.statusLabel}</p>
                      <p className="text-sm text-white/70 mt-2">
                        Score global {Math.round(supplier.score)}% — recommandation {recommendationLabel(supplier.recommendation).toLowerCase()}.
                      </p>
                      <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/15">
                          Relation {supplier.relation_type || 'N/A'}
                        </span>
                        <span className="px-3 py-1 text-xs rounded-full bg-white/10 border border-white/15 flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-300" /> IA
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {resultsMeta.totalFound > PAGE_SIZE && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-slate-600">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canGoPrev && setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!canGoPrev}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1.5 text-sm text-slate-700 disabled:opacity-50"
              >
                ← Précédent
              </button>
              <button
                type="button"
                onClick={() => canGoNext && setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={!canGoNext}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm text-white disabled:bg-slate-400"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Insights & Monitoring */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl p-6 border border-slate-100 bg-white/90 dark:bg-slate-900/70 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">Synthèse IA</p>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunités identifiées</h4>
            </div>
            <button className="text-sm text-cyan-600 hover:text-cyan-800 inline-flex items-center gap-2">
              Voir tout <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-semibold">1</span>
              {stats ? `${stats.prequalified} fournisseurs préqualifiés surpassent le seuil de 80 points.` : 'Préqualifications en cours d’analyse.'}
            </li>
            <li className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold">2</span>
              {stats ? `${stats.to_audit} dossiers nécessitent un audit renforcé.` : 'Analyses prioritaires en file d’attente.'}
            </li>
            <li className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold">3</span>
              {monitoring
                ? `${monitoring.pending_recommendations} recommandations en attente côté DAQA.`
                : stats
                ? `${stats.pending_recommendations} recommandations attendent une validation DAQA.`
                : 'Recommandations en préparation.'}
            </li>
          </ul>
        </div>

        <div className="rounded-3xl p-6 border border-slate-100 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase text-slate-500 font-semibold">Monitoring IA</p>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-white">Analyses récentes</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {monitoring && (
                <span>MAJ {new Date(monitoring.last_refresh).toLocaleTimeString('fr-FR')}</span>
              )}
              <button
                type="button"
                onClick={loadMonitoring}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
              >
                <RefreshCw className="h-3 w-3" />
                Rafraîchir
              </button>
            </div>
          </div>
          {monitoringError && (
            <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">
              {monitoringError}
            </div>
          )}
          {monitoringLoading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Surveillance IA en cours...
            </div>
          ) : monitoring && monitoring.recent_analyses.length > 0 ? (
            <div className="space-y-4">
              {monitoring.recent_analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between bg-white/60 dark:bg-slate-900/60 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{analysis.supplier_name}</p>
                    <p className="text-xs text-slate-500">
                      {analysis.analysis_type} • {analysis.supplier_country || 'pays N/A'} • Score {analysis.score_after?.toFixed(1) ?? '—'}%
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{analysis.recommendation_after ? recommendationLabel(analysis.recommendation_after) : '—'}</p>
                    <p>{new Date(analysis.created_at).toLocaleTimeString('fr-FR')}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
                {monitoring.high_risk_suppliers} fournisseurs à risque élevé • {monitoring.pending_recommendations} recommandations en file • {monitoring.total_logs} analyses archivées
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
              Aucune analyse récente à afficher.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AISupplierSearch;

