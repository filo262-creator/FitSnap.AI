import React, { useState } from 'react';
import { Camera, Zap, CheckCircle2, Lock, Flame, Shield, TrendingUp, BarChart2, User, Plus, Award } from 'lucide-react';

export default function FitSnapApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [dailyLog, setDailyLog] = useState([
    { id: 1, name: 'Bresaola (100g)', calories: 151, protein: 32, carbs: 0, fat: 2, time: '08:30' },
    { id: 2, name: 'Petto di Pollo (200g)', calories: 220, protein: 46, carbs: 0, fat: 3, time: '13:15' }
  ]);

  // Target giornalieri
  const target = { calories: 2200, protein: 160, carbs: 220, fat: 60 };

  // Calcolo totali attuali
  const totals = dailyLog.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Simulazione Scansione IA
  const handleAIScan = () => {
    if (!isPremium) {
      setShowPaywall(true);
      return;
    }
    setScanning(true);
    setTimeout(() => {
      const mockFoods = [
        { name: 'Trancio di Salmone Grigliato (180g)', calories: 370, protein: 36, carbs: 0, fat: 22 },
        { name: 'Omelette 3 Uova + Albume', calories: 280, protein: 28, carbs: 2, fat: 18 },
        { name: 'Scatoletta Tonno al Naturale (160g)', calories: 160, protein: 35, carbs: 0, fat: 1 }
      ];
      const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
      setDailyLog([...dailyLog, { ...randomFood, id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="flex justify-center bg-slate-950 min-h-screen text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-900 min-h-screen flex flex-col relative pb-20 shadow-2xl border-x border-slate-800">
        
        {/* HEADER */}
        <header className="p-4 flex justify-between items-center border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-emerald-500 to-cyan-500 p-2 rounded-xl text-slate-950 font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              FitSnap AI
            </span>
          </div>
          <button 
            onClick={() => setShowPaywall(true)}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
              isPremium ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isPremium ? <Award className="w-3.5 h-3.5" /> : null}
            {isPremium ? 'PRO ATTIVO' : 'UPGRADE PRO'}
          </button>
        </header>

        {/* CONTENUTO PRINCIPALE */}
        <main className="flex-1 p-4 overflow-y-auto space-y-6">
          
          {/* TAB HOME */}
          {activeTab === 'home' && (
            <>
              {/* WIDGET TARGET PROTEICO */}
              <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-400">Target Proteine Giornaliero</span>
                  <span className="text-xs font-bold text-emerald-400">{totals.protein}g / {target.protein}g</span>
                </div>
                <div className="w-full bg-slate-700 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((totals.protein / target.protein) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Mancano <strong className="text-slate-200">{Math.max(target.protein - totals.protein, 0)}g</strong> di proteine per completare il tuo obiettivo!
                </p>
              </section>

              {/* GRIGLIA MACRO */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 text-center">
                  <span className="text-xs text-slate-400 block">Calorie</span>
                  <span className="text-lg font-bold text-white">{totals.calories}</span>
                  <span className="text-[10px] text-slate-500 block">/ {target.calories} kcal</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 text-center">
                  <span className="text-xs text-slate-400 block">Carbo</span>
                  <span className="text-lg font-bold text-cyan-400">{totals.carbs}g</span>
                  <span className="text-[10px] text-slate-500 block">/ {target.carbs}g</span>
                </div>
                <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 text-center">
                  <span className="text-xs text-slate-400 block">Grassi</span>
                  <span className="text-lg font-bold text-amber-400">{totals.fat}g</span>
                  <span className="text-[10px] text-slate-500 block">/ {target.fat}g</span>
                </div>
              </div>

              {/* TASTO SCANSIONE FOTO AI */}
              <button 
                onClick={handleAIScan}
                disabled={scanning}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/10 transition active:scale-95"
              >
                <Camera className="w-6 h-6" />
                <span>{scanning ? 'Analisi Piatto IA in corso...' : 'Scansiona Pasto con IA'}</span>
                {!isPremium && <Lock className="w-4 h-4 ml-auto text-slate-900/60" />}
              </button>

              {/* LOG ALIMENTARE GIORNALIERO */}
              <section className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-200">Pasti Registrati</h3>
                  <span className="text-xs text-slate-400">{dailyLog.length} inserimenti</span>
                </div>

                <div className="space-y-2">
                  {dailyLog.map((item) => (
                    <div key={item.id} className="bg-slate-800/30 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-sm text-slate-100">{item.name}</h4>
                        <span className="text-xs text-slate-400">{item.time} • {item.calories} kcal</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400 block">+{item.protein}g Pro</span>
                        <span className="text-[10px] text-slate-500">C: {item.carbs}g | G: {item.fat}g</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* TAB PIANO FREE VS PREMIUM */}
          {activeTab === 'plans' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-center">Matrice Funzionalità</h2>
              <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-200 border-b border-slate-700">
                    <tr>
                      <th className="p-3">Funzione</th>
                      <th className="p-3 text-center">Free</th>
                      <th className="p-3 text-center text-emerald-400">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-3 font-medium">Log Alimentare</td>
                      <td className="p-3 text-center">Ricerca / Codici</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Scan Visivo AI</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Macronutrienti</td>
                      <td className="p-3 text-center">Base</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Ciclo Carbo & Timing</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Report & Export</td>
                      <td className="p-3 text-center">7 Giorni</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">PDF / CSV Nutrizionista</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Integrazioni</td>
                      <td className="p-3 text-center">Google Fit</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Garmin / WHOOP / Oura</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button 
                onClick={() => setShowPaywall(true)}
                className="w-full bg-emerald-500 text-slate-950 font-bold py-3 rounded-xl"
              >
                Passa a Premium Ora
              </button>
            </div>
          )}

        </main>

        {/* BOTTOM NAVIGATION */}
        <nav className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/90 backdrop-blur grid grid-cols-3 p-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium ${activeTab === 'home' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <Flame className="w-5 h-5" />
            <span>Tracker</span>
          </button>
          <button 
            onClick={() => setActiveTab('plans')}
            className={`flex flex-col items-center gap-1 p-2 text-xs font-medium ${activeTab === 'plans' ? 'text-emerald-400' : 'text-slate-400'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span>Piani</span>
          </button>
          <button 
            onClick={() => setShowPaywall(true)}
            className="flex flex-col items-center gap-1 p-2 text-xs font-medium text-amber-400"
          >
            <Zap className="w-5 h-5" />
            <span>FitSnap PRO</span>
          </button>
        </nav>

        {/* PAYWALL MODAL */}
        {showPaywall && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Sblocca Tutto</span>
                <button onClick={() => setShowPaywall(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  FitSnap AI Premium
                </h2>
                <p className="text-xs text-slate-400">Riconoscimento cibo visivo e tracciamento automatico dei macro in 2 secondi.</p>
              </div>

              <div className="space-y-3 border-y border-slate-800 py-4">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Fotocamera AI & Scan Visivo piatti</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Modalità "Pasto Casalingo" (Crudo vs Cotto)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Esportazione PDF/CSV per il Nutrizionista</span>
                </div>
              </div>

              {/* STRUTTURA PREZZI */}
              <div className="space-y-3">
                <div className="border-2 border-emerald-500 bg-emerald-500/10 p-4 rounded-2xl flex justify-between items-center relative">
                  <span className="absolute -top-3 right-4 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    SCONTO 58%
                  </span>
                  <div>
                    <h4 className="font-bold text-sm">Piano Annuale</h4>
                    <span className="text-xs text-slate-400">7 Giorni gratis poi 49,99 €/anno</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">4,16 €<span className="text-xs text-slate-400">/mo</span></span>
                </div>

                <div className="border border-slate-800 bg-slate-800/40 p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm">Piano Mensile</h4>
                    <span className="text-xs text-slate-400">Nessun vincolo, disdici quando vuoi</span>
                  </div>
                  <span className="text-lg font-bold text-slate-200">9,99 €<span className="text-xs text-slate-400">/mo</span></span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsPremium(true);
                setShowPaywall(false);
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              Inizia la Prova Gratuita di 7 Giorni
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
