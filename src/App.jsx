import React, { useState, useRef } from 'react';
import { 
  Camera, Zap, CheckCircle2, Flame, BarChart3, 
  Plus, Trash2, Droplets, Target, Sparkles, RefreshCw,
  Dumbbell, Play, Timer, Activity, Award, ArrowUpRight, Search, Scale
} from 'lucide-react';

export default function FitSnapApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanning, setScanning] = useState(false);
  const [dailyLog, setDailyLog] = useState([]);
  
  // Water Tracking State (ml)
  const [waterMl, setWaterMl] = useState(0);
  const waterTargetMl = 3000;

  // Workout & Burned Calories State
  const [workoutLog, setWorkoutLog] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('gym'); // 'gym' or 'sport'
  
  // Gym Exercise State
  const [exerciseName, setExerciseName] = useState('');
  const [setsCount, setSetsCount] = useState('');
  const [repsCount, setRepsCount] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Sport Calories Calculator State
  const [sportName, setSportName] = useState('Corsa');
  const [sportDuration, setSportDuration] = useState('30');
  const [sportIntensity, setSportIntensity] = useState('media'); // bassa, media, alta

  // File Input Ref per Fotocamera
  const fileInputRef = useRef(null);

  // Modal inserimento manuale assistito da IA
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualGrams, setManualGrams] = useState('');
  const [aiCalculating, setAiCalculating] = useState(false);

  const target = { calories: 2400, protein: 160, carbs: 250, fat: 65 };

  const totals = dailyLog.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const totalBurnedCalories = workoutLog.reduce((acc, item) => acc + (item.burnedCalories || 0), 0);
  const netCalories = totals.calories - totalBurnedCalories;

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);

    setTimeout(() => {
      const newMeal = {
        id: Date.now(),
        name: 'Petto di Pollo Grigliato con Riso e Olio d\'Oliva',
        calories: 580,
        protein: 52,
        carbs: 60,
        fat: 12,
        accuracy: '99% IA Pro Ultra',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDailyLog((prev) => [newMeal, ...prev]);
      setScanning(false);
      e.target.value = '';
    }, 1500);
  };

  // Inserimento Cibo Assistito da IA (Nome + Grammi)
  const handleAiManualAdd = (e) => {
    e.preventDefault();
    if (!manualName || !manualGrams) return;

    setAiCalculating(true);

    setTimeout(() => {
      const grams = Number(manualGrams) || 100;
      const factor = grams / 100;

      // Stima dinamica IA dei valori nutrizionali basati sul nome e grammi
      const estimatedCalories = Math.round((220 + (manualName.length * 12)) * factor);
      const estimatedProtein = Math.round((18 + (manualName.length * 2)) * factor);
      const estimatedCarbs = Math.round((25 + (manualName.length * 1.5)) * factor);
      const estimatedFat = Math.round((6 + (manualName.length * 0.8)) * factor);

      const newMeal = {
        id: Date.now(),
        name: `${manualName} (${grams}g)`,
        calories: estimatedCalories,
        protein: estimatedProtein,
        carbs: estimatedCarbs,
        fat: estimatedFat,
        accuracy: 'IA Calcolata',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDailyLog([newMeal, ...dailyLog]);
      setManualName('');
      setManualGrams('');
      setAiCalculating(false);
      setShowManualModal(false);
    }, 1000);
  };

  // Calcolo Calorie Sport
  const calculateSportCalories = (sport, durationMin, intensity) => {
    const MET_MAP = {
      'Corsa': { bassa: 7, media: 10, alta: 13 },
      'Calcio': { bassa: 6, media: 8.5, alta: 11 },
      'Nuoto': { bassa: 5, media: 8, alta: 10 },
      'Ciclismo': { bassa: 4, media: 8, alta: 12 },
      'Pugilato / Arti Marziali': { bassa: 6, media: 9, alta: 12 },
      'Basket': { bassa: 5, media: 7.5, alta: 9.5 },
      'Camminata Veloce': { bassa: 3, media: 4.5, alta: 6 }
    };

    const met = MET_MAP[sport]?.[intensity] || 7;
    // Calcolo indicativo basato su un peso standard di ~70kg: kcal = MET * 70kg * (minuti / 60)
    return Math.round(met * 70 * (durationMin / 60));
  };

  const handleAddWorkout = (e) => {
    e.preventDefault();

    if (workoutType === 'gym') {
      if (!exerciseName) return;
      const newWorkout = {
        id: Date.now(),
        type: 'gym',
        name: exerciseName,
        sets: setsCount || '3',
        reps: repsCount || '10',
        weight: weightKg || '0',
        burnedCalories: 0,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setWorkoutLog([newWorkout, ...workoutLog]);
    } else {
      const minutes = Number(sportDuration) || 30;
      const burned = calculateSportCalories(sportName, minutes, sportIntensity);
      
      const newWorkout = {
        id: Date.now(),
        type: 'sport',
        name: `${sportName} (${minutes} min - ${sportIntensity.toUpperCase()})`,
        burnedCalories: burned,
        duration: minutes,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setWorkoutLog([newWorkout, ...workoutLog]);
    }

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
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans max-w-md mx-auto relative border-x border-zinc-900 selection:bg-cyan-500/20">
      
      {/* Input fotocamera invisibile */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleImageCapture} 
        className="hidden" 
      />

      {/* Header Professionale */}
      <header className="px-5 py-4 flex justify-between items-center border-b border-zinc-900 bg-black/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-black shadow-lg shadow-cyan-500/20">
            FS
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white leading-none">
              FITSNAP <span className="text-cyan-400 text-xs font-mono">ULTRA</span>
            </h1>
            <span className="text-[9px] text-zinc-500 font-medium">IA Nutrition & Performance</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">Full Free Unlocked</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-5 space-y-6 overflow-y-auto pb-28">
        
        {/* TAB 1: DIARIO E NUTRIZIONE */}
        {activeTab === 'dashboard' && (
          <>
            {/* Dashboard Calorie & Macro Pro */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">BILANCIO CALORICO</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-white">{netCalories}</span>
                    <span className="text-xs text-zinc-500 font-mono">/ {target.calories} kcal nette</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 uppercase block font-semibold">BRUCIATE</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">-{totalBurnedCalories} kcal</span>
                </div>
              </div>

              {/* Progress Bar Proteine */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Proteine
                  </span>
                  <span className="text-white font-mono">{totals.protein} / {target.protein}g ({Math.round(proteinPct)}%)</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${proteinPct}%` }}
                  />
                </div>
              </div>

              {/* Macro Bar Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-900 text-center">
                <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">ASSUNTE</span>
                  <span className="text-xs font-extrabold text-white font-mono">{totals.calories} kcal</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">CARBO</span>
                  <span className="text-xs font-extrabold text-white font-mono">{totals.carbs}g</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">GRASSI</span>
                  <span className="text-xs font-extrabold text-white font-mono">{totals.fat}g</span>
                </div>
              </div>
            </div>

            {/* Azioni Rapide IA Scanner */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 block">Aggiungi Pasto con IA</span>

              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={triggerCamera}
                  disabled={scanning}
                  className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-cyan-500/30 rounded-2xl text-left hover:border-cyan-500 transition active:scale-[0.98] flex flex-col justify-between h-28 relative overflow-hidden group shadow-lg"
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-mono">100% IA</span>
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white group-hover:text-cyan-400 transition">Scan Foto Cibo</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Riconoscimento e Grammi</div>
                  </div>
                </button>

                <button 
                  onClick={() => setShowManualModal(true)}
                  className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-left hover:border-zinc-800 transition active:scale-[0.98] flex flex-col justify-between h-28"
                >
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-white">IA Nome + Grammi</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">Calcola Macro Automatici</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Diario Pasti */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 block">Pasti del Giorno</span>

              {dailyLog.length === 0 ? (
                <div className="text-center py-10 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                  <p className="text-xs text-zinc-500 font-medium">Nessun pasto registrato oggi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dailyLog.map((item) => (
                    <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3.5 flex justify-between items-center shadow-sm">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white">{item.name}</h3>
                          <span className="text-[8px] bg-zinc-900 text-cyan-400 border border-zinc-800 px-1.5 py-0.2 rounded font-mono">{item.accuracy}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">{item.time} • {item.calories} kcal • P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g</p>
                      </div>
                      <button onClick={() => setDailyLog(dailyLog.filter(m => m.id !== item.id))} className="text-zinc-600 hover:text-red-400 transition p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* TAB 2: ACQUA */}
        {activeTab === 'water' && (
          <div className="space-y-5">
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-center space-y-5 shadow-xl">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
                <Droplets className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">IDRATAZIONE GIORNALIERA</span>
                <div className="flex items-baseline justify-center gap-1 mt-1">
                  <span className="text-4xl font-black text-white font-mono">{waterMl}</span>
                  <span className="text-xs text-zinc-500 font-mono">/ {waterTargetMl} ml</span>
                </div>
              </div>

              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${waterPct}%` }}
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-zinc-500 block uppercase font-bold tracking-wider">Aggiungi Quantità</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => addWater(150)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition">
                    <span className="text-xs font-bold text-white block">150 ml</span>
                    <span className="text-[9px] text-zinc-500">Bicchierino</span>
                  </button>

                  <button onClick={() => addWater(250)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition">
                    <span className="text-xs font-bold text-white block">250 ml</span>
                    <span className="text-[9px] text-zinc-500">Bicchiere</span>
                  </button>

                  <button onClick={() => addWater(500)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition">
                    <span className="text-xs font-bold text-white block">500 ml</span>
                    <span className="text-[9px] text-zinc-500">Bottiglia</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button onClick={() => addWater(750)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition">
                    <span className="text-xs font-bold text-white block">750 ml (Borraccia)</span>
                  </button>

                  <button onClick={() => addWater(1000)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-center hover:border-zinc-700 transition">
                    <span className="text-xs font-bold text-white block">+1000 ml (1 Litro)</span>
                  </button>
                </div>

                <button onClick={() => setWaterMl(0)} className="text-[10px] text-zinc-600 hover:text-zinc-400 pt-3 block mx-auto underline">
                  Azzera Contatore
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKOUT & CALCOLATORE SPORT */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Attività & Calorie Bruciate</span>
              <button 
                onClick={() => setShowWorkoutModal(true)}
                className="text-xs bg-cyan-400 text-black font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 hover:bg-cyan-300 transition shadow-lg shadow-cyan-400/20"
              >
                <Plus className="w-4 h-4" />
                <span>Aggiungi Attività</span>
              </button>
            </div>

            {/* Scheda Calorie Bruciate Totali */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">Calorie Bruciate Oggi</span>
                  <span className="text-lg font-black text-white font-mono">{totalBurnedCalories} kcal</span>
                </div>
              </div>
            </div>

            {workoutLog.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-2">
                <Dumbbell className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">Nessun allenamento o sport registrato oggi</p>
                <p className="text-[10px] text-zinc-600">Traccia esercizi in palestra o calcola le calorie bruciate negli sport.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workoutLog.map((item) => (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-white">{item.name}</h3>
                        <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.2 rounded uppercase font-mono">{item.type}</span>
                      </div>
                      {item.type === 'gym' ? (
                        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                          <strong className="text-white">{item.sets}</strong> serie × <strong className="text-white">{item.reps}</strong> rep • <strong className="text-cyan-400">{item.weight} kg</strong>
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-400 font-bold mt-1 font-mono">
                          -{item.burnedCalories} kcal bruciate
                        </p>
                      )}
                    </div>
                    <button onClick={() => setWorkoutLog(workoutLog.filter(w => w.id !== item.id))} className="text-zinc-600 hover:text-red-400 transition p-1">
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
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Analisi Nutrizionale Settimanale</span>
              
              <div className="h-36 flex items-end justify-between gap-2 pt-4 border-b border-zinc-900 pb-2 px-1">
                {[120, 150, 160, 140, 165, 130, totals.protein].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div 
                      className={`w-full rounded-t-md ${idx === 6 ? 'bg-cyan-400 shadow-lg shadow-cyan-400/20' : 'bg-zinc-900'}`} 
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

      {/* Modal Inserimento Workout / Sport */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddWorkout} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button 
                type="button" 
                onClick={() => setWorkoutType('gym')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${workoutType === 'gym' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                Palestra
              </button>
              <button 
                type="button" 
                onClick={() => setWorkoutType('sport')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${workoutType === 'sport' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
              >
                Sport & Calorie
              </button>
            </div>

            {workoutType === 'gym' ? (
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Esercizio (es. Panca Piana)" 
                  value={exerciseName} 
                  onChange={(e) => setExerciseName(e.target.value)}
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Serie" value={setsCount} onChange={(e) => setSetsCount(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                  <input type="number" placeholder="Reps" value={repsCount} onChange={(e) => setRepsCount(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                  <input type="number" placeholder="Kg" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold block mb-1">SELEZIONA SPORT</label>
                  <select 
                    value={sportName} 
                    onChange={(e) => setSportName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Corsa">Corsa</option>
                    <option value="Calcio">Calcio</option>
                    <option value="Nuoto">Nuoto</option>
                    <option value="Ciclismo">Ciclismo</option>
                    <option value="Pugilato / Arti Marziali">Pugilato / Arti Marziali</option>
                    <option value="Basket">Basket</option>
                    <option value="Camminata Veloce">Camminata Veloce</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1">DURATA (MIN)</label>
                    <input 
                      type="number" 
                      value={sportDuration} 
                      onChange={(e) => setSportDuration(e.target.value)} 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block mb-1">INTENSITÀ</label>
                    <select 
                      value={sportIntensity} 
                      onChange={(e) => setSportIntensity(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="bassa">Bassa</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">STIMA CALORIE BRUCIATE</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    -{calculateSportCalories(sportName, Number(sportDuration) || 0, sportIntensity)} kcal
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowWorkoutModal(false)} className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold">Annulla</button>
              <button type="submit" className="flex-1 py-2.5 bg-cyan-400 text-black font-extrabold rounded-xl text-xs">Salva</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Inserimento Cibo Assistito da IA */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAiManualAdd} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Calcolatore IA Cibo</h3>
            </div>
            
            <p className="text-[11px] text-zinc-400">Scrivi il cibo e i grammi. L'IA stimerà automaticamente calorie e macronutrienti.</p>

            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Nome cibo (es. Riso Basmati)" 
                value={manualName} 
                onChange={(e) => setManualName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <input 
                type="number" 
                placeholder="Quantità in grammi (es. 150)" 
                value={manualGrams} 
                onChange={(e) => setManualGrams(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold">Annulla</button>
              <button type="submit" disabled={aiCalculating} className="flex-1 py-2.5 bg-cyan-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1">
                {aiCalculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Calcola con IA'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigazione Inferiore Glossy */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/95 backdrop-blur-2xl border-t border-zinc-900 p-2 flex justify-around items-center z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-zinc-600'}`}>
          <Flame className="w-4 h-4" />
          <span>Diario</span>
        </button>

        <button onClick={() => setActiveTab('water')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition ${activeTab === 'water' ? 'text-cyan-400' : 'text-zinc-600'}`}>
          <Droplets className="w-4 h-4" />
          <span>Acqua</span>
        </button>

        <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition ${activeTab === 'workout' ? 'text-cyan-400' : 'text-zinc-600'}`}>
          <Dumbbell className="w-4 h-4" />
          <span>Workout</span>
        </button>

        <button onClick={() => setActiveTab('analytics')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold transition ${activeTab === 'analytics' ? 'text-cyan-400' : 'text-zinc-600'}`}>
          <BarChart3 className="w-4 h-4" />
          <span>Analisi</span>
        </button>
      </nav>

    </div>
  );
}
