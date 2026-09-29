import React, { useState, useRef } from 'react';
import { 
  Camera, Zap, CheckCircle2, Lock, Flame, BarChart3, 
  Plus, Trash2, Droplets, Target, Sparkles, RefreshCw, ShieldCheck,
  Dumbbell, Play, Timer, Check, ChevronRight
} from 'lucide-react';

export default function FitSnapApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isPremium, setIsPremium] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanType, setScanType] = useState(null);
  const [dailyLog, setDailyLog] = useState([]);
  
  // Water Tracking State (ml)
  const [waterMl, setWaterMl] = useState(0);
  const waterTargetMl = 2500;

  // Workout Tracking State
  const [workoutLog, setWorkoutLog] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [setsCount, setSetsCount] = useState('');
  const [repsCount, setRepsCount] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // File Input Ref per Fotocamera
  const fileInputRef = useRef(null);
  const isProScanRef = useRef(false);

  // Modal inserimento manuale cibo
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const target = { calories: 2200, protein: 160, carbs: 220, fat: 60 };

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

    setTimeout(() => {
      const newMeal = isPro ? {
        id: Date.now(),
        name: 'Pollo alla Piastra con Riso Basmati',
        calories: 520,
        protein: 48,
        carbs: 55,
        fat: 10,
        accuracy: '98% PRO Precision',
        isPro: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } : {
        id: Date.now(),
        name: 'Pasto Generico (Stima Base)',
        calories: 460,
        protein: 32,
        carbs: 48,
        fat: 14,
        accuracy: '~70% Base',
        isPro: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDailyLog((prev) => [newMeal, ...prev]);
      setScanning(false);
      setScanType(null);
      e.target.value = '';
    }, 1800);
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
      accuracy: 'Manuale',
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

  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (!exerciseName) return;

    const newWorkout = {
      id: Date.now(),
      name: exerciseName,
      sets: setsCount || '3',
      reps: repsCount || '10',
      weight: weightKg || '0',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setWorkoutLog([newWorkout, ...workoutLog]);
    setExerciseName('');
    setSetsCount('');
    setRepsCount('');
    setWeightKg('');
    setShowWorkoutModal(false);
  };

  const addWater = (amount) => {
    setWaterMl(prev => Math.max(0, prev + amount));
  };

  const proteinPct = Math.min((totals.protein / target.protein) * 100, 100);
  const waterPct = Math.min((waterMl / waterTargetMl) * 100, 100);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans max-w-md mx-auto relative border-x border-zinc-900 selection:bg-zinc-800">
      
      {/* Input fotocamera invisibile */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleImageCapture} 
        className="hidden" 
      />

      {/* Essential Header */}
      <header className="px-5 py-4 flex justify-between items-center border-b border-zinc-900 bg-black/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs">
            FS
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-none">
              FITSNAP <span className="text-zinc-500 font-normal text-xs ml-0.5">ESSENTIAL</span>
            </h1>
          </div>
        </div>

        <button 
          onClick={() => setShowPaywall(true)}
          className={`text-[11px] font-medium px-3 py-1 rounded-full border transition-all ${
            isPremium 
              ? 'bg-zinc-900 text-emerald-400 border-zinc-800' 
              : 'bg-white text-black border-white hover:bg-zinc-200'
          }`}
        >
          {isPremium ? 'PRO UNLOCKED' : 'UPGRADE PRO'}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-5 space-y-6 overflow-y-auto pb-28">
        
        {/* TAB 1: DIARIO NUTRIZIONE */}
        {activeTab === 'dashboard' && (
          <>
            {/* Essential Target Card */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">PROTEINE ODIERNE</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-white">{totals.protein}</span>
                    <span className="text-xs text-zinc-500">/ {target.protein}g</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-zinc-400">{Math.round(proteinPct)}%</span>
              </div>

              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500" 
                  style={{ width: `${proteinPct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-900/80 text-center">
                <div>
                  <span className="text-[9px] font-medium text-zinc-500 block uppercase">CALORIE</span>
                  <span className="text-xs font-bold text-zinc-200">{totals.calories} <span className="text-[9px] font-normal text-zinc-500">kcal</span></span>
                </div>
                <div>
                  <span className="text-[9px] font-medium text-zinc-500 block uppercase">CARBO</span>
                  <span className="text-xs font-bold text-zinc-200">{totals.carbs}g</span>
                </div>
                <div>
                  <span className="text-[9px] font-medium text-zinc-500 block uppercase">GRASSI</span>
                  <span className="text-xs font-bold text-zinc-200">{totals.fat}g</span>
                </div>
              </div>
            </div>

            {/* Essential AI Camera Triggers */}
            <div className="space-y-2">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1 block">Riconoscimento IA</span>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => triggerCamera(false)}
                  disabled={scanning}
                  className="p-3.5 bg-zinc-950 border border-zinc-900 rounded-xl text-left hover:border-zinc-800 transition active:scale-[0.98] flex flex-col justify-between h-24"
                >
                  <div className="flex justify-between items-start w-full">
                    <Camera className="w-4 h-4 text-zinc-400" />
                    <span className="text-[9px] font-mono text-zinc-500">FREE</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Scan Standard</div>
                    <div className="text-[10px] text-zinc-500">Stima ~70%</div>
                  </div>
                </button>

                <button 
                  onClick={() => triggerCamera(true)}
                  disabled={scanning}
                  className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-left hover:border-zinc-700 transition active:scale-[0.98] flex flex-col justify-between h-24 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start w-full">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {!isPremium && <Lock className="w-3 h-3 text-zinc-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1">
                      Scan Pro <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded">98%</span>
                    </div>
                    <div className="text-[10px] text-zinc-400">Grammature & Condimenti</div>
                  </div>
                </button>
              </div>

              <button 
                onClick={() => setShowManualModal(true)}
                className="w-full py-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-2 hover:bg-zinc-900 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inserisci cibo manualmente</span>
              </button>
            </div>

            {/* Meals Log */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider px-1 block">Pasti Registrati</span>

              {dailyLog.length === 0 ? (
                <div className="text-center py-8 bg-zinc-950 border border-zinc-900 rounded-xl space-y-1">
                  <p className="text-xs text-zinc-500">Nessun pasto presente nel diario</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {dailyLog.map((item) => (
                    <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-medium text-zinc-200">{item.name}</h3>
                          {item.isPro && <span className="text-[8px] text-emerald-400 font-mono">PRO</span>}
                        </div>
                        <p className="text-[10px] text-zinc-500">{item.time} • {item.calories} kcal</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-white">+{item.protein}g Pro</span>
                        <button onClick={() => setDailyLog(dailyLog.filter(m => m.id !== item.id))} className="text-zinc-600 hover:text-zinc-400">
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

        {/* TAB 2: SEZIONE ACQUA AVANZATA */}
        {activeTab === 'water' && (
          <div className="space-y-5">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto text-cyan-400">
                <Droplets className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">IDRATAZIONE GIORNALIERA</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-4xl font-bold text-white">{waterMl}</span>
                  <span className="text-sm text-zinc-500">/ {waterTargetMl} ml</span>
                </div>
              </div>

              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${waterPct}%` }}
                />
              </div>

              {/* Pulsanti Quantità d'Acqua */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-zinc-500 block uppercase font-medium">Aggiungi Quantità Rapida</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => addWater(150)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:bg-zinc-800 transition"
                  >
                    <span className="text-xs font-bold text-white block">150 ml</span>
                    <span className="text-[9px] text-zinc-500">Bicchiere piccolo</span>
                  </button>

                  <button 
                    onClick={() => addWater(250)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:bg-zinc-800 transition"
                  >
                    <span className="text-xs font-bold text-white block">250 ml</span>
                    <span className="text-[9px] text-zinc-500">Bicchiere Standard</span>
                  </button>

                  <button 
                    onClick={() => addWater(500)}
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:bg-zinc-800 transition"
                  >
                    <span className="text-xs font-bold text-white block">500 ml</span>
                    <span className="text-[9px] text-zinc-500">Bottiglietta</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button 
                    onClick={() => addWater(750)}
                    className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:bg-zinc-800 transition"
                  >
                    <span className="text-xs font-bold text-white block">750 ml (Borraccia)</span>
                  </button>

                  <button 
                    onClick={() => addWater(1000)}
                    className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:bg-zinc-800 transition"
                  >
                    <span className="text-xs font-bold text-white block">+1 Litro</span>
                  </button>
                </div>

                <button 
                  onClick={() => setWaterMl(0)}
                  className="text-[10px] text-zinc-600 hover:text-zinc-400 pt-3 block mx-auto underline"
                >
                  Azzera Contatore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKOUT / PALESTRA */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Allenamento Odierno</span>
              <button 
                onClick={() => setShowWorkoutModal(true)}
                className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi Esercizio</span>
              </button>
            </div>

            {workoutLog.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-2">
                <Dumbbell className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">Nessun esercizio registrato oggi</p>
                <p className="text-[10px] text-zinc-600">Traccia le tue serie e i carichi sollevati in palestra.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workoutLog.map((item) => (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.name}</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        <strong className="text-white">{item.sets}</strong> serie × <strong className="text-white">{item.reps}</strong> rep • <strong className="text-emerald-400">{item.weight} kg</strong>
                      </p>
                    </div>
                    <button 
                      onClick={() => setWorkoutLog(workoutLog.filter(w => w.id !== item.id))}
                      className="text-zinc-600 hover:text-zinc-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ANALISI */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider block">Progresso Proteico Settimanale</span>
              
              <div className="h-36 flex items-end justify-between gap-2 pt-4 border-b border-zinc-900 pb-2 px-1">
                {[120, 150, 160, 140, 165, 130, totals.protein].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className={`w-full rounded-t-sm ${idx === 6 ? 'bg-white' : 'bg-zinc-900'}`} 
                      style={{ height: `${Math.min((val / 180) * 100, 100)}%` }}
                    />
                    <span className="text-[9px] font-mono text-zinc-600">{'LMGMVSD'[idx]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal Inserimento Workout */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddWorkout} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Nuovo Esercizio</h3>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Nome esercizio (es. Panca Piana)" 
                value={exerciseName} 
                onChange={(e) => setExerciseName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
              <div className="grid grid-cols-3 gap-2">
                <input 
                  type="number" 
                  placeholder="Serie" 
                  value={setsCount} 
                  onChange={(e) => setSetsCount(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Reps" 
                  value={repsCount} 
                  onChange={(e) => setRepsCount(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Kg" 
                  value={weightKg} 
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowWorkoutModal(false)}
                className="flex-1 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-white text-black font-semibold rounded-xl text-xs"
              >
                Salva Esercizio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Inserimento Cibo Manuale */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddManual} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Inserisci Cibo</h3>
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Nome cibo" 
                value={manualName} 
                onChange={(e) => setManualName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="Calorie (kcal)" 
                  value={manualCalories} 
                  onChange={(e) => setManualCalories(e.target.value)}
                  required
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Proteine (g)" 
                  value={manualProtein} 
                  onChange={(e) => setManualProtein(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Carbo (g)" 
                  value={manualCarbs} 
                  onChange={(e) => setManualCarbs(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
                <input 
                  type="number" 
                  placeholder="Grassi (g)" 
                  value={manualFat} 
                  onChange={(e) => setManualFat(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowManualModal(false)}
                className="flex-1 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-xs"
              >
                Annulla
              </button>
              <button 
                type="submit" 
                className="flex-1 py-2 bg-white text-black font-semibold rounded-xl text-xs"
              >
                Salva Pasto
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Paywall Essential */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 w-full max-w-sm space-y-5 text-center">
            <div className="w-10 h-10 bg-white text-black font-black rounded-xl flex items-center justify-center mx-auto text-sm">
              PRO
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">FitSnap PRO Access</h3>
              <p className="text-xs text-zinc-500 mt-1">Sblocca il tracciamento avanzato con IA e stima condimenti.</p>
            </div>

            <div className="space-y-2 pt-2">
              <button 
                onClick={() => { setIsPremium(true); setShowPaywall(false); }}
                className="w-full py-3 bg-white text-black font-bold rounded-xl text-xs"
              >
                Attiva Versione PRO
              </button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="w-full py-2 text-xs text-zinc-600 hover:text-zinc-400"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Essential Black Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/95 backdrop-blur-xl border-t border-zinc-900 p-2 flex justify-around items-center z-40">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition ${
            activeTab === 'dashboard' ? 'text-white' : 'text-zinc-600'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Diario</span>
        </button>

        <button 
          onClick={() => setActiveTab('water')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition ${
            activeTab === 'water' ? 'text-white' : 'text-zinc-600'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Acqua</span>
        </button>

        <button 
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition ${
            activeTab === 'workout' ? 'text-white' : 'text-zinc-600'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Workout</span>
        </button>

        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 p-2 text-[10px] font-medium transition ${
            activeTab === 'analytics' ? 'text-white' : 'text-zinc-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analisi</span>
        </button>
      </nav>

    </div>
  );
}
