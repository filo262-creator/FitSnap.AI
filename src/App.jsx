import React, { useState, useRef } from 'react';
import { 
  Camera, Zap, CheckCircle2, Lock, Flame, BarChart3, 
  Plus, Trash2, Droplets, Target, Sparkles, RefreshCw, ShieldCheck
} from 'lucide-react';

export default function FitSnapApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [dailyLog, setDailyLog] = useState([]);
  const [waterGlasses, setWaterGlasses] = useState(0);

  // File Input Ref per aprire la fotocamera
  const fileInputRef = useRef(null);
  const isProScanRef = useRef(false);

  // Modal inserimento manuale
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const target = { calories: 2200, protein: 160, carbs: 220, fat: 60, water: 10 };

  const totals = dailyLog.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const triggerCamera = (isProScan = false) => {
    if (isProScan && !isPremium) {
      setShowPaywall(true);
      return;
    }
    isProScanRef.current = isProScan;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPro = isProScanRef.current;
    setScanning(true);
    setScanType(isPro ? 'pro' : 'free');

    // Simulazione elaborazione dell'immagine scattata
    setTimeout(() => {
      const newMeal = isPro ? {
        id: Date.now(),
        name: 'Pollo alla Piastra con Riso Basmati',
        calories: 520,
        protein: 48,
        carbs: 55,
        fat: 10,
        accuracy: '98% Precisione PRO',
        isPro: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : {
        id: Date.now(),
        name: 'Pasto Generico (Riconoscimento Base)',
        calories: 460,
        protein: 32,
        carbs: 48,
        fat: 14,
        accuracy: '~70% Stima Base',
        isPro: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDailyLog((prev) => [newMeal, ...prev]);
      setScanning(false);
      setScanType(null);
      e.target.value = '';
    }, 2000);
  };

  const handleAddManual = (e) => {
    e.preventDefault();
    if (!manualName || !manualCalories) return;

    const newMeal = {
      id: Date.now(),
      name: manualName,
      calories: Number(manualCalories) || 0,
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
      accuracy: 'Inserimento Manuale',
      isPro: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDailyLog([newMeal, ...dailyLog]);
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setShowManualModal(false);
  };

  const handleDeleteMeal = (id) => {
    setDailyLog(dailyLog.filter(meal => meal.id !== id));
  };

  const proteinPercentage = Math.min((totals.protein / target.protein) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans max-w-md mx-auto relative border-x border-slate-800/80 shadow-2xl">
      
      {/* Input invisibile per triggerare la fotocamera del telefono */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleImageCapture} 
        className="hidden" 
      />

      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
              FITSNAP <span className="text-emerald-400 font-medium text-xs tracking-widest ml-1">AI</span>
            </h1>
            <p className="text-[10px] font-medium text-slate-400 tracking-wide mt-0.5">NUTRITION SUITE</p>
          </div>
        </div>

        <button 
          onClick={() => setShowPaywall(true)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
            isPremium 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500/50'
          }`}
        >
          {isPremium ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PRO ACTIVE</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPGRADE PRO</span>
            </>
          )}
        </button>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 py-5 space-y-5 overflow-y-auto pb-28">
        {activeTab === 'dashboard' && (
          <>
            {/* Target Card */}
            <div className="relative bg-gradient-to-b from-slate-900 to-[#111622] border border-slate-800/90 rounded-2xl p-5 shadow-xl overflow-hidden">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Target Proteico</span>
                </div>
                <span className="text-sm font-black text-emerald-400">{totals.protein}g <span className="text-slate-500 text-xs font-normal">/ {target.protein}g</span></span>
              </div>

              <div className="w-full bg-slate-800/80 h-3.5 rounded-full p-0.5 overflow-hidden mb-3 border border-slate-700/30">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm" 
                  style={{ width: `${proteinPercentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Completato: <strong className="text-slate-200">{Math.round(proteinPercentage)}%</strong></span>
                <span>
                  {target.protein - totals.protein > 0 
                    ? `Mancano ${target.protein - totals.protein}g` 
                    : 'Obiettivo Raggiunto 🎉'}
                </span>
              </div>
            </div>

            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Calorie</span>
                <span className="text-base font-black text-white">{totals.calories}</span>
                <span className="text-[10px] text-slate-500 block">/ {target.calories} kcal</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Carbo</span>
                <span className="text-base font-black text-cyan-400">{totals.carbs}g</span>
                <span className="text-[10px] text-slate-500 block">/ {target.carbs}g</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Grassi</span>
                <span className="text-base font-black text-amber-400">{totals.fat}g</span>
                <span className="text-[10px] text-slate-500 block">/ {target.fat}g</span>
              </div>
            </div>

            {/* Scanners */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">Modalità Scansione Foto IA</div>

              <button 
                onClick={() => triggerCamera(false)}
                disabled={scanning}
                className="w-full p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-200 flex items-center justify-between transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs text-slate-200">Scansione AI Standard</div>
                    <div className="text-[10px] text-slate-400">Precisione ~70% • Scatta foto gratis</div>
                  </div>
                </div>
                {scanning && scanType === 'free' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700/50">FREE</span>
                )}
              </button>

              <button 
                onClick={() => triggerCamera(true)}
                disabled={scanning}
                className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-emerald-500/10 transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950/20 text-slate-950">
                    <Sparkles className="w-5 h-5 fill-slate-950" />
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-xs text-slate-950">Scansione AI Pro (Alta Precisione)</div>
                    <div className="text-[10px] text-slate-900/80 font-medium">Precisione 98% • Grammature e condimenti</div>
                  </div>
                </div>
                {scanning && scanType === 'pro' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : !isPremium ? (
                  <div className="flex items-center gap-1 bg-slate-950/20 px-2.5 py-1 rounded-md text-[10px] font-extrabold text-slate-950">
                    <Lock className="w-3 h-3" />
                    <span>PRO</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-extrabold bg-slate-950 text-emerald-400 px-2.5 py-1 rounded-md">ATTIVO</span>
                )}
              </button>
            </div>

            <button 
              onClick={() => setShowManualModal(true)}
              className="w-full py-2.5 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-800/80 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Inserisci Cibo Manualmente</span>
            </button>

            {/* Meals Log */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diario Alimentare Odierno</span>
                <span className="text-xs text-slate-500 font-medium">{dailyLog.length} inserimenti</span>
              </div>

              {dailyLog.length === 0 ? (
                <div className="text-center py-10 bg-slate-900/40 border border-slate-800/60 rounded-2xl space-y-1">
                  <p className="text-xs font-semibold text-slate-400">Nessun pasto registrato oggi</p>
                  <p className="text-[10px] text-slate-600">Scatta una foto o inserisci manualmente per iniziare.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dailyLog.map((item) => (
                    <div key={item.id} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3.5 flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-slate-100">{item.name}</h3>
                          {item.isPro ? (
                            <span className="text-[8px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">98% PRO</span>
                          ) : (
                            <span className="text-[8px] font-medium bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{item.accuracy}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{item.time} • <strong className="text-slate-200">{item.calories} kcal</strong></p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-emerald-400">+{item.protein}g Pro</span>
                          <p className="text-[9px] text-slate-500 font-medium">C: {item.carbs}g | G: {item.fat}g</p>
                        </div>
                        <button onClick={() => handleDeleteMeal(item.id)} className="text-slate-600 hover:text-red-400 p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'water' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
                <Droplets className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Registro Idratazione</h2>
                <p className="text-xs text-slate-400 mt-1">Traccia la tua assunzione d'acqua quotidiana.</p>
              </div>

              <div className="py-2">
                <span className="text-4xl font-black text-cyan-400">{waterGlasses}</span>
                <span className="text-sm text-slate-400 font-medium"> / {target.water} bicchieri</span>
                <p className="text-xs text-slate-500 mt-1">({waterGlasses * 250} ml / {target.water * 250} ml)</p>
              </div>

              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                  className="px-4 py-2.5 bg-slate-800 border border-slate-700/50 rounded-xl text-slate-300 font-bold text-xs"
                >
                  -1
                </button>
                <button 
                  onClick={() => setWaterGlasses(waterGlasses + 1)}
                  className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-extrabold rounded-xl text-xs"
                >
                  +1 Bicchiero (250ml)
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Analisi Settimanale Proteine</h2>
                </div>
              </div>
              
              <div className="h-36 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-800 pb-2">
                {[120, 150, 160, 140, 165, 130, totals.protein].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className={`w-full rounded-t-md ${idx === 6 ? 'bg-gradient-to-t from-emerald-500 to-teal-400' : 'bg-slate-800'}`} 
                      style={{ height: `${Math.min((val / 180) * 100, 100)}%` }}
                    />
                    <span className="text-[9px] font-medium text-slate-500">{'LMGMVSD'[idx]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Manual Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddManual} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase">Aggiungi Pasto Manuale</h3>
            <div className="space-y-2.5">
              <input 
                type="text" 
                placeholder="Nome cibo" 
                value={manualName} 
                onChange={(e) => setManualName(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="Calorie (kcal)" 
                  value={manualCalories} 
                  onChange={(e) => setManualCalories(e.target.value)}
                  required
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
                <input 
                  type="number" 
                  placeholder="Proteine (g)" 
                  value={manualProtein} 
                  onChange={(e) => setManualProtein(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
                <input 
                  type="number" 
                  placeholder="Carbo (g)" 
                  value={manualCarbs} 
                  onChange={(e) => setManualCarbs(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
                <input 
                  type="number" 
                  placeholder="Grassi (g)" 
                  value={manualFat} 
                  onChange={(e) => setManualFat(e.target.value)}
                  className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2.5 bg-slate-800 text-slate-400 rounded-xl text-xs font-semibold"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2.5 bg-emerald-500 text-slate-950 rounded-xl text-xs font-extrabold"
              >
                Salva
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">FitSnap PRO Suite</h3>
              <p className="text-xs text-slate-400">Sblocca la massima precisione nell'analisi dei nutrienti.</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/50 rounded-xl border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Riconoscimento ad alta precisione 98%</span>
              </div>
              <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/50 rounded-xl border border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Stima automatica peso e condimenti</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button 
                onClick={() => { setIsPremium(true); setShowPaywall(false); }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs"
              >
                Attiva FitSnap PRO
              </button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-400"
              >
                Continua con la versione Base
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0B0F17]/95 backdrop-blur-md border-t border-slate-800/80 p-2 flex justify-around items-center z-40">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>Diario</span>
        </button>

        <button 
          onClick={() => setActiveTab('water')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'water' ? 'text-cyan-400' : 'text-slate-500'
          }`}
        >
          <Droplets className="w-5 h-5" />
          <span>Acqua</span>
        </button>

        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold ${
            activeTab === 'analytics' ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Analisi</span>
        </button>
      </nav>
    </div>
  );
}
          
