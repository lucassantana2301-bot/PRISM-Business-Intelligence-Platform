'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Radio, ArrowUpRight, Zap, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface LiveTransaction {
  id: string;
  orderId: string;
  customer: string;
  region: string;
  amount: number;
  payment: string;
  category: string;
  timeAgo: string;
}

const initialTransactions: LiveTransaction[] = [
  { id: '1', orderId: 'ORD-9842', customer: 'Lucas M.', region: 'SP', amount: 349.0, payment: 'PIX', category: 'Electronics', timeAgo: 'agora' },
  { id: '2', orderId: 'ORD-9841', customer: 'Fernanda R.', region: 'RJ', amount: 129.5, payment: 'Cartão', category: 'Apparel', timeAgo: 'há 2s' },
  { id: '3', orderId: 'ORD-9840', customer: 'Rodrigo S.', region: 'PR', amount: 899.0, payment: 'PIX', category: 'Electronics', timeAgo: 'há 4s' },
  { id: '4', orderId: 'ORD-9839', customer: 'Beatriz A.', region: 'MG', amount: 210.0, payment: 'Cartão', category: 'Home & Living', timeAgo: 'há 6s' },
];

const mockNames = ['Mariana S.', 'Carlos E.', 'Gabriel P.', 'Camila T.', 'Rafael B.', 'Larissa F.', 'Juliana M.'];
const mockRegions = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA'];
const mockCategories = ['Electronics', 'Apparel', 'Home & Living', 'Beauty & Health', 'Accessories'];
const mockPayments = ['PIX', 'Credit Card', 'Boleto'];

export const LiveStreamTicker: React.FC = () => {
  const [isLive, setIsLive] = useState(true);
  const [transactions, setTransactions] = useState<LiveTransaction[]>(initialTransactions);
  const [liveGmv, setLiveGmv] = useState(865262.5);

  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const randomAmount = Math.floor(Math.random() * 850) + 45;
      const newTx: LiveTransaction = {
        id: `tx-${Date.now()}`,
        orderId: `ORD-${Math.floor(Math.random() * 8999) + 1000}`,
        customer: mockNames[Math.floor(Math.random() * mockNames.length)],
        region: mockRegions[Math.floor(Math.random() * mockRegions.length)],
        amount: randomAmount,
        payment: mockPayments[Math.floor(Math.random() * mockPayments.length)],
        category: mockCategories[Math.floor(Math.random() * mockCategories.length)],
        timeAgo: 'agora',
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 5)]);
      setLiveGmv((prev) => prev + randomAmount);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden font-sans text-xs">
      {/* Live Status Pill & GMV counter */}
      <div className="flex items-center gap-3 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-2 md:pb-0 md:pr-4">
        <button
          type="button"
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all ${
            isLive
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
          title="Alternar streaming de transações ao vivo"
        >
          <span className={`h-2 w-2 rounded-full ${isLive ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
          <span>{isLive ? 'LIVE STREAM' : 'STREAM PAUSADO'}</span>
        </button>

        <div className="font-mono text-xs">
          <span className="text-slate-400 text-[10px] block">GMV em Tempo Real:</span>
          <strong className="text-slate-900 font-bold tabular-nums">
            {formatCurrency(liveGmv)}
          </strong>
        </div>
      </div>

      {/* Real-time Order Ticker Tape */}
      <div className="flex-1 overflow-x-auto flex items-center gap-3 py-1 no-scrollbar">
        {transactions.map((tx, idx) => (
          <div
            key={tx.id}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-[11px] font-mono shrink-0 transition-all ${
              idx === 0
                ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-bold shadow-2xs animate-in zoom-in-95 duration-200'
                : 'bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            <ShoppingCart className={`w-3 h-3 ${idx === 0 ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span className="text-slate-900">{tx.orderId}</span>
            <span className="text-slate-400 font-sans">{tx.customer} ({tx.region})</span>
            <span className={idx === 0 ? 'text-indigo-700' : 'text-emerald-700'}>
              {formatCurrency(tx.amount)}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white text-[9px] text-slate-500 border border-slate-200">
              {tx.payment}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
