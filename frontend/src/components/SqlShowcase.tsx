import React, { useState, useEffect } from 'react';
import { Play, Code, Database, Clock, CheckCircle, Table as TableIcon } from 'lucide-react';
import { api } from '../api';
import { DbQueryMeta, DbQueryResult } from '../types';

export const SqlShowcase: React.FC = () => {
  const [queries, setQueries] = useState<DbQueryMeta[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<number>(1);
  const [activeResult, setActiveResult] = useState<DbQueryResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    try {
      const res = await api.runDbQuery({ query_id: queryId });
      setActiveResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentMeta = queries.find((q) => q.id === selectedQueryId);

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-extrabold tracking-tight">Interactive DBMS SQL Showcase</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Live query execution engine demonstrating 3NF relational schema, JOINs, CTEs, Aggregates & Triggers.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold self-start sm:self-auto">
          Academic Evaluation Suite
        </div>
      </div>

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

      {/* Selected Query Details */}
      {currentMeta && (
        <div className="space-y-4">
          
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-purple-300">
                Query #{currentMeta.id}: {currentMeta.title}
              </h3>
              <button
                onClick={() => runQuery(currentMeta.id)}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {loading ? 'Executing...' : 'Re-Run SQL'}
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1">{currentMeta.description}</p>
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 relative font-mono text-xs overflow-x-auto text-emerald-400">
            <div className="absolute top-2 right-3 text-[10px] text-slate-500 flex items-center gap-1">
              <Code className="w-3 h-3" />
              SQL DML/DDL Statement
            </div>
            <pre className="pt-2">{currentMeta.sql}</pre>
          </div>

          {/* Results Table */}
          {activeResult && (
            <div className="space-y-3">
              
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <TableIcon className="w-4 h-4 text-purple-400" />
                    {activeResult.rowCount} rows returned
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {activeResult.executionTimeMs} ms
                  </span>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> SQLite Engine Execution OK
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-2xl max-h-80 scrollbar-thin">
                {activeResult.rows.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No rows returned by this query.</div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-slate-200 uppercase text-[10px] font-bold sticky top-0">
                      <tr>
                        {Object.keys(activeResult.rows[0]).map((col) => (
                          <th key={col} className="p-3 border-b border-slate-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      {activeResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          {Object.keys(row).map((col) => (
                            <td key={col} className="p-3 whitespace-nowrap">
                              {row[col] === null ? (
                                <span className="text-slate-600 italic">NULL</span>
                              ) : typeof row[col] === 'boolean' ? (
                                row[col] ? 'TRUE' : 'FALSE'
                              ) : (
                                String(row[col])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
