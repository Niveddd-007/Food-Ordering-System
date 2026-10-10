import React, { useState, useEffect } from 'react';
import { Play, Code, Database, Clock, CheckCircle, Table as TableIcon, ShieldAlert, ShieldCheck, RefreshCw, Layers, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../api';
import { DbQueryMeta, DbQueryResult, AcidSimulateResult } from '../types';

export const SqlShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queries' | 'acid'>('queries');
  const [queries, setQueries] = useState<DbQueryMeta[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<number>(1);
  const [activeResult, setActiveResult] = useState<DbQueryResult | null>(null);
  const [queryPlan, setQueryPlan] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [planLoading, setPlanLoading] = useState<boolean>(false);

  // ACID Simulation State
  const [acidSimulateFailure, setAcidSimulateFailure] = useState<boolean>(true);
  const [acidFailureStep, setAcidFailureStep] = useState<string>('payment');
  const [acidResult, setAcidResult] = useState<AcidSimulateResult | null>(null);
  const [acidLoading, setAcidLoading] = useState<boolean>(false);

  // DB Reset state
  const [resetting, setResetting] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    api.getDbQueries().then((data) => {
      setQueries(data);
      if (data.length > 0) {
        runQuery(data[0].id);
      }
    });
  }, []);

  const runQuery = async (queryId: number) => {
    setSelectedQueryId(queryId);
    setLoading(true);
    setQueryPlan(null);
    try {
      const res = await api.runDbQuery({ query_id: queryId });
      setActiveResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const explainPlan = async (sql: string) => {
    setPlanLoading(true);
    try {
      const res = await api.explainQuery(sql);
      setQueryPlan(res.plan);
    } catch (err) {
      console.error(err);
    } finally {
      setPlanLoading(false);
    }
  };

  const runAcidSimulation = async () => {
    setAcidLoading(true);
    try {
      const res = await api.simulateAcid({
        simulate_failure: acidSimulateFailure,
        failure_step: acidFailureStep,
      });
      setAcidResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAcidLoading(false);
    }
  };

  const handleResetDb = async () => {
    if (!window.confirm('Are you sure you want to reset the database to clean factory seed data? This will restore initial restaurants and users.')) {
      return;
    }
    setResetting(true);
    setResetMessage(null);
    try {
      const res = await api.resetDatabase();
      setResetMessage(res.message);
      if (selectedQueryId) runQuery(selectedQueryId);
    } catch (err: any) {
      setResetMessage('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const currentMeta = queries.find((q) => q.id === selectedQueryId);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Interactive DBMS Lab & SQL Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Academic showcase demonstrating 3NF relational schema, JOINs, ACID Transactions, and Query Execution Plans.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetDb}
            disabled={resetting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all disabled:opacity-50"
            title="Reset database to fresh seed data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset to Seed Data'}</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 w-fit">
        <button
          onClick={() => setActiveTab('queries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'queries'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Analytical Queries (1–10)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('acid');
            if (!acidResult) runAcidSimulation();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'acid'
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ACID Transaction Lab</span>
        </button>
      </div>

      {/* ───────────────── TAB 1: ANALYTICAL SQL QUERIES ───────────────── */}
      {activeTab === 'queries' && (
        <div className="space-y-6 animate-fade-in">
          {/* Query Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {queries.map((q) => (
              <button
                key={q.id}
                onClick={() => runQuery(q.id)}
                className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                  selectedQueryId === q.id
                    ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="text-[10px] text-purple-200 uppercase font-semibold">Query #{q.id}</div>
                <div className="truncate text-xs font-medium">{q.title}</div>
              </button>
            ))}
          </div>

          {/* Query Explanation Banner */}
          {currentMeta && (
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-purple-300">
                  #{currentMeta.id}. {currentMeta.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentMeta.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => explainPlan(currentMeta.sql)}
                  disabled={planLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{planLoading ? 'Analyzing...' : 'Explain Query Plan'}</span>
                </button>
                <button
                  onClick={() => runQuery(currentMeta.id)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
                >
                  <Play className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Execute SQL</span>
                </button>
              </div>
            </div>
          )}

          {/* EXPLAIN QUERY PLAN Display (If toggled) */}
          {queryPlan && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> SQLite Execution Plan (`EXPLAIN QUERY PLAN`)
                </span>
                <span className="text-[10px] text-slate-400">DBMS Performance Proof</span>
              </div>
              <div className="space-y-1">
                {queryPlan.map((step, idx) => (
                  <div key={idx} className="font-mono text-xs p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 flex items-center justify-between">
                    <span>{step.detail}</span>
                    <span className="text-[10px] text-slate-500">Node ID: {step.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw SQL Code Box */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-x-auto">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
              <span className="flex items-center gap-1 font-bold">
                <Code className="w-3.5 h-3.5 text-purple-400" /> SQL Query Syntax
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">SQLite 3NF Engine</span>
            </div>
            <pre className="font-mono text-xs text-purple-200 leading-relaxed whitespace-pre-wrap">
              {activeResult ? activeResult.sql : currentMeta?.sql}
            </pre>
          </div>

          {/* Query Results Table */}
          {activeResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <TableIcon className="w-4 h-4 text-emerald-400" />
                  Execution Results ({activeResult.rowCount} rows returned)
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                  <Clock className="w-3 h-3 text-emerald-400" /> {activeResult.executionTimeMs} ms
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 sticky top-0 border-b border-slate-800 text-purple-300 uppercase tracking-wider text-[10px]">
                    <tr>
                      {activeResult.rows.length > 0 &&
                        Object.keys(activeResult.rows[0]).map((col) => (
                          <th key={col} className="p-3 font-bold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono text-[11px]">
                    {activeResult.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        {Object.values(row).map((val: any, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-200 whitespace-nowrap">
                            {val === null ? <span className="text-slate-600 italic">NULL</span> : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────── TAB 2: ACID TRANSACTION LAB ───────────────── */}
      {activeTab === 'acid' && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls & Mode Selection */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-brand-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> ACID Order Checkout Visualizer
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate a multi-table transaction with atomicity guarantees. If a payment or inventory failure occurs mid-flight, SQLite triggers <span className="text-rose-400 font-mono">ROLLBACK</span>, preventing orphan records.
                </p>
              </div>

              <button
                onClick={runAcidSimulation}
                disabled={acidLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 transition-all shrink-0 self-start sm:self-auto"
              >
                <Play className={`w-3.5 h-3.5 ${acidLoading ? 'animate-spin' : ''}`} />
                <span>{acidLoading ? 'Simulating...' : 'Run Simulation'}</span>
              </button>
            </div>

            {/* Simulation Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all bg-slate-900 border-slate-800 hover:border-slate-700">
                <input
                  type="radio"
                  name="acid_mode"
                  checked={!acidSimulateFailure}
                  onChange={() => setAcidSimulateFailure(false)}
                  className="text-brand-500"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Success Mode (Full COMMIT)
                  </div>
                  <div className="text-[11px] text-slate-400">All checks pass, orders and payments persist permanently.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all bg-slate-900 border-slate-800 hover:border-slate-700">
                <input
                  type="radio"
                  name="acid_mode"
                  checked={acidSimulateFailure}
                  onChange={() => setAcidSimulateFailure(true)}
                  className="text-brand-500"
                />
                <div>
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Failure Mode (Automatic ROLLBACK)
                  </div>
                  <div className="text-[11px] text-slate-400">Simulate payment gateway crash or stock depletion to trigger rollback.</div>
                </div>
              </label>
            </div>

            {acidSimulateFailure && (
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Simulated Failure Point:</span>
                <select
                  value={acidFailureStep}
                  onChange={(e) => setAcidFailureStep(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="payment">Payment Gateway Timeout (HTTP 504)</option>
                  <option value="inventory">Item Out of Stock / Concurrency Lock</option>
                </select>
              </div>
            )}
          </div>

          {/* Results Audit Banner */}
          {acidResult && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  acidResult.outcome === 'COMMITTED'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {acidResult.outcome === 'COMMITTED' ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm">
                      Transaction Result: {acidResult.outcome}
                    </h4>
                    <p className="text-xs opacity-80">{acidResult.message}</p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700">
                  {acidResult.outcome}
                </span>
              </div>

              {/* Database Audit Table (Before vs After) */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>Database State Verification (Zero Orphan Rows Proof)</span>
                  {acidResult.audit.orphan_records_prevented && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      ✓ Zero Orphan Rows Left
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Orders Table</p>
                    <p className="text-base font-black text-white mt-1">
                      {acidResult.audit.before.orders} → {acidResult.audit.after.orders}
                    </p>
                    <p className={`text-[11px] font-bold mt-0.5 ${acidResult.audit.net_change.orders > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      Net Change: {acidResult.audit.net_change.orders > 0 ? `+${acidResult.audit.net_change.orders}` : '0 (Rolled Back)'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Order Items Table</p>
                    <p className="text-base font-black text-white mt-1">
                      {acidResult.audit.before.order_items} → {acidResult.audit.after.order_items}
                    </p>
                    <p className={`text-[11px] font-bold mt-0.5 ${acidResult.audit.net_change.order_items > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      Net Change: {acidResult.audit.net_change.order_items > 0 ? `+${acidResult.audit.net_change.order_items}` : '0 (Rolled Back)'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Payments Table</p>
                    <p className="text-base font-black text-white mt-1">
                      {acidResult.audit.before.payments} → {acidResult.audit.after.payments}
                    </p>
                    <p className={`text-[11px] font-bold mt-0.5 ${acidResult.audit.net_change.payments > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      Net Change: {acidResult.audit.net_change.payments > 0 ? `+${acidResult.audit.net_change.payments}` : '0 (Rolled Back)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step-by-Step Transaction Execution Trace */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Execution Trace & Transaction Journal:
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  {acidResult.logs.map((log) => (
                    <div
                      key={log.step}
                      className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                        log.status === 'ROLLED_BACK'
                          ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                          : log.status === 'COMMITTED'
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-bold text-purple-300">
                            STEP {log.step}
                          </span>
                          <span className="font-bold text-white">{log.name}</span>
                          <span className="text-[11px] text-purple-400">{log.sql}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 font-sans">{log.details}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          log.status === 'ROLLED_BACK'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : log.status === 'COMMITTED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
