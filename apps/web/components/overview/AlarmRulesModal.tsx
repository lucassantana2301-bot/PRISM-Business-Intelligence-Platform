'use client';

import React, { useState } from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Radio,
  SlidersHorizontal,
  Mail,
  MessageSquare,
  Zap,
  Trash2,
} from 'lucide-react';

export interface AlarmRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  period: string;
  state: 'ALARM' | 'OK' | 'INSUFFICIENT_DATA';
  channel: string;
}

interface AlarmRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialAlarms: AlarmRule[] = [
  {
    id: 'ALM-101',
    name: 'Queda Crítica na Conversão Mobile iOS',
    metric: 'Taxa de Conversão (Mobile iOS)',
    condition: '<',
    threshold: 3.0,
    period: '2 horas',
    state: 'ALARM',
    channel: 'Slack #growth-alerts + Email C-Level',
  },
  {
    id: 'ALM-102',
    name: 'Piso de Faturamento Diário',
    metric: 'Receita Bruta Diária',
    condition: '<',
    threshold: 20000,
    period: '24 horas',
    state: 'OK',
    channel: 'Email Executivo',
  },
  {
    id: 'ALM-103',
    name: 'Degradação de ROAS em Campanhas de Ads',
    metric: 'ROAS Médio de Campanhas',
    condition: '<',
    threshold: 2.5,
    period: '6 horas',
    state: 'OK',
    channel: 'Slack #marketing-war-room',
  },
];

export const AlarmRulesModal: React.FC<AlarmRulesModalProps> = ({ isOpen, onClose }) => {
  const [alarms, setAlarms] = useState<AlarmRule[]>(initialAlarms);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('conversion_rate');
  const [condition, setCondition] = useState('<');
  const [threshold, setThreshold] = useState('3.5');
  const [period, setPeriod] = useState('1 hora');
  const [channel, setChannel] = useState('Slack #alerts');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAlarm: AlarmRule = {
      id: `ALM-${Date.now().toString().slice(-4)}`,
      name,
      metric,
      condition,
      threshold: parseFloat(threshold) || 0,
      period,
      state: 'OK',
      channel,
    };

    setAlarms((prev) => [newAlarm, ...prev]);
    setName('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-2xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  CloudWatch Alarms & Salvaguardas Analíticas
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 text-rose-700 font-bold border border-rose-200">
                  1 Alarme Ativo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Regras automatizadas de monitoramento e disparo de alertas em tempo real.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-600 font-bold">
              Regras Configuradas ({alarms.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Alarme</span>
            </button>
          </div>

          {/* Create Alarm Form Drawer */}
          {showAddForm && (
            <form
              onSubmit={handleCreate}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fade-in"
            >
              <h5 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                Configurar Nova Regra de Alarme
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-mono text-[11px] mb-1">Nome do Alarme</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Queda no Ticket Médio..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-mono text-[11px] mb-1">Métrica Monitorada</label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="conversion_rate">Taxa de Conversão (%)</option>
                    <option value="gross_revenue">Receita Bruta (R$)</option>
                    <option value="aov">Ticket Médio (R$)</option>
                    <option value="roas">ROAS Médio (x)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-mono text-[11px] mb-1">Condição & Limite</label>
                  <div className="flex gap-2">
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                    >
                      <option value="<">menor que (&lt;)</option>
                      <option value="<=">menor ou igual (&lt;=)</option>
                      <option value=">">maior que (&gt;)</option>
                      <option value=">=">maior ou igual (&gt;=)</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      required
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-mono text-[11px] mb-1">Canal de Notificação</label>
                  <input
                    type="text"
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  Salvar Alarme
                </button>
              </div>
            </form>
          )}

          {/* Alarm Cards Stream */}
          <div className="space-y-3">
            {alarms.map((alarm) => {
              const isAlarm = alarm.state === 'ALARM';
              return (
                <div
                  key={alarm.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isAlarm
                      ? 'bg-rose-50/70 border-rose-200 ring-1 ring-rose-300'
                      : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl mt-0.5 ${
                        isAlarm ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isAlarm ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{alarm.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${
                            isAlarm
                              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {alarm.state}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Regra: <strong className="text-slate-700">{alarm.metric}</strong> {alarm.condition} {alarm.threshold} por {alarm.period}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Canal: {alarm.channel}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="font-mono text-[10px] text-slate-400">{alarm.id}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(alarm.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label="Deletar alarme"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>AWS EventBridge / Webhook Engine: Ativo</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
