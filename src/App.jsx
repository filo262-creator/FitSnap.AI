import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Zap, CheckCircle2, Flame, BarChart3, 
  Plus, Trash2, Droplets, Target, Sparkles, RefreshCw,
  Dumbbell, Play, Timer, Activity, Award, ArrowUpRight, Search, Scale, User
} from 'lucide-react';

export default function FitSnapApp() {
  // --- STATO DEL PROFILO PERSONALE ---
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Form Onboarding
  const [gender, setGender] = useState('M');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState('sedentary');
  const [goal, setGoal] = useState('maintain');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanning, setScanning] = useState(false);
  
  // Dati salvati in LocalStorage
  const [dailyLog, setDailyLog] = useState(() => {
    const saved = localStorage.getItem('fitSnapDailyLog');
    return saved ? JSON.parse(saved) : [];
  });
  const [workoutLog, setWorkoutLog] = useState(() => {
    const saved = localStorage.getItem('fitSnapWorkoutLog');
    return saved ? JSON.parse(saved) : [];
  });
  const [waterMl, setWaterMl] = useState(() => {
    const saved = localStorage.getItem('fitSnapWater');
    return saved ? JSON.parse(saved) : 0;
  });

  const waterTargetMl = 3000;

  // Form Workout
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('gym');
  const [exerciseName, setExerciseName] = useState('');
  const [setsCount, setSetsCount] = useState('');
  const [repsCount, setRepsCount] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [sportName, setSportName] = useState('Corsa');
  const [sportDuration, setSportDuration] = useState('30');
  const [sportIntensity, setSportIntensity] = useState('media');

  // Form Ricerca Cibo API Reale
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualGrams, setManualGrams] = useState('');
  const [aiCalculating, setAiCalculating] = useState(false);
  const [apiError, setApiError] = useState('');

  const fileInputRef = useRef(null);

  // --- CARICAMENTO INIZIALE PROFILO ---
  useEffect(() => {
    const savedProfile = localStorage.getItem('fitSnapProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      setShowOnboarding(true);
    }
  }, []);

  // Salva i log automaticamente quando cambiano
  useEffect(() => { localStorage.setItem('fitSnapDailyLog', JSON.stringify(dailyLog)); }, [dailyLog]);
  useEffect(() => { localStorage.setItem('fitSnapWorkoutLog', JSON.stringify(workoutLog)); }, [workoutLog]);
  useEffect(() => { localStorage.setItem('fitSnapWater', JSON.stringify(waterMl)); }, [waterMl]);

  // --- CALCOLO FABBISOGNO (Equazione Mifflin-St Jeor Reale) ---
  const calculateMacros = (w, h, a, g, act, gl) => {
    // BMR
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += (g === 'M') ? 5 : -161;

    // Moltiplicatori Attività
    const actMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    let tdee = bmr * actMultipliers[act];

    // Obiettivo
    if (gl === 'lose') tdee -= 500; // Deficit calorico
    if (gl === 'gain') tdee += 300; // Surplus per massa

    const calories = Math.round(tdee);
    
    // Proteine: ~2g per kg per chi fa sport/massa, 1.6g per altri
    const proteinFactor = (gl === 'gain' || act === 'active' || act === 'very_active') ? 2.0 : 1.6;
    const protein = Math.round(w * proteinFactor);
    
    // Grassi: ~25% delle calorie
    const fat = Math.round((calories * 0.25) / 9);
    
    // Carboidrati: il resto
    const carbs = Math.round((calories - (protein * 4) - (fat * 9)) / 4);

    return { calories, protein, carbs, fat };
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || !a) return;

    const targets = calculateMacros(w, h, a, gender, activity, goal);
    
    const newProfile = {
      gender, age: a, weight: w, height: h, activity, goal,
      targets
    };

    setProfile(newProfile);
    localStorage.setItem('fitSnapProfile', JSON.stringify(newProfile));
    setShowOnboarding(false);
  };

  // --- RECUPERO DATI REALI CIBO (OpenFoodFacts API) ---
  const handleRealApiSearch = async (e) => {
    e.preventDefault();
    if (!manualName || !manualGrams) return;

    setAiCalculating(true);
    setApiError('');

    try {
      // Connessione a database reale globale
      const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(manualName)}&search_simple=1&action=process&json=1&page_size=1`);
      const data = await response.json();

      if (data.products && data.products.length > 0) {
        const product = data.products[0];
        const nut = product.nutriments || {};
        
        const grams = parseFloat(manualGrams);
        const factor = grams / 100;

        const realCalories = Math.round((nut['energy-kcal_100g'] || 0) * factor);
        const realProtein = Math.round((nut['proteins_100g'] || 0) * factor);
        const realCarbs = Math.round((nut['carbohydrates_100g'] || 0) * factor);
        const realFat = Math.round((nut['fat_100g'] || 0) * factor);

        const newMeal = {
          id: Date.now(),
          name: `${product.product_name || manualName} (${grams}g)`,
          calories: realCalories,
          protein: realProtein,
          carbs: realCarbs,
          fat: realFat,
          accuracy: 'API Reale',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setDailyLog([newMeal, ...dailyLog]);
        setManualName('');
        setManualGrams('');
        setShowManualModal(false);
      } else {
        setApiError('Cibo non trovato nel database. Riprova con un nome più generico (es. "Pasta Barilla").');
      }
    } catch (err) {
      setApiError('Errore di connessione al database.');
    } finally {
      setAiCalculating(false);
    }
  };

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
    // Usa il peso reale del profilo, se non c'è usa 70kg
    const userWeight = profile ? profile.weight : 70;
    return Math.round(met * userWeight * (durationMin / 60));
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

  // SCHERMATA ONBOARDING OBBLIGATORIA
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-center items-center selection:bg-cyan-500/20 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-2xl text-black shadow-lg shadow-cyan-500/20 mb-6">FS</div>
        <h1 className="text-2xl font-black mb-1 text-center">Imposta il tuo Profilo</h1>
        <p className="text-sm text-zinc-400 mb-8 text-center">Serve per calcolare il tuo fabbisogno calorico reale.</p>
        
        <form onSubmit={saveProfile} className="w-full space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">SESSO</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:border-cyan-500 outline-none">
                <option value="M">Uomo</option>
                <option value="F">Donna</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">ETÀ</label>
              <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:border-cyan-500 outline-none placeholder-zinc-600" placeholder="Anni" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">PESO (KG)</label>
              <input type="number" step="0.1" required value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:border-cyan-500 outline-none placeholder-zinc-600" placeholder="Es. 70" />
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 font-bold block mb-1">ALTEZZA (CM)</label>
              <input type="number" required value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:border-cyan-500 outline-none placeholder-zinc-600" placeholder="Es. 175" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold block mb-1">LIVELLO ATTIVITÀ</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:border-cyan-500 outline-none">
              <option value="sedentary">Sedentario (Poco o zero sport)</option>
              <option value="light">Leggero (Sport 1-3 volte/sett)</option>
              <option value="moderate">Moderato (Sport 3-5 volte/sett)</option>
              <option value="active">Attivo (Sport 6-7 volte/sett)</option>
              <option value="very_active">Molto Attivo (Lavoro fisico + Sport)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-bold block mb-1">OBIETTIVO</label>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-3 text-sm focus:border-cyan-500 outline-none">
              <option value="maintain">Mantenimento Peso</option>
              <option value="lose">Perdita Grasso (Definizione)</option>
              <option value="gain">Aumento Massa Muscolare</option>
            </select>
          </div>

          <button type="submit" className="w-full mt-6 py-3.5 bg-cyan-400 text-black font-extrabold rounded-xl text-sm hover:bg-cyan-300 transition">
            Genera Piano Personale
          </button>
        </form>
      </div>
    );
  }

  // Se il profilo non è ancora caricato (safeguard)
  if (!profile) return null;

  const target = profile.targets;

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

  const proteinPct = Math.min((totals.protein / target.protein) * 100, 100);
  const waterPct = Math.min((waterMl / waterTargetMl) * 100, 100);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans max-w-md mx-auto relative border-x border-zinc-900 selection:bg-cyan-500/20">
      
      <input 
        type="file" accept="image/*" capture="environment" 
        ref={fileInputRef} onChange={(e) => e.target.value = ''} className="hidden" 
      />

      {/* Header */}
      <header className="px-5 py-4 flex justify-between items-center border-b border-zinc-900 bg-black/90 backdrop-blur-2xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-xs text-black shadow-lg shadow-cyan-500/20">
            FS
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white leading-none">
              FITSNAP <span className="text-cyan-400 text-xs font-mono">PRO</span>
            </h1>
            <span className="text-[9px] text-zinc-500 font-medium">{profile.weight}kg | {profile.goal.toUpperCase()}</span>
          </div>
        </div>
        <button onClick={() => setShowOnboarding(true)} className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 border border-zinc-800">
          <User className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-5 space-y-6 overflow-y-auto pb-28">
        
        {/* TAB 1: DIARIO */}
        {activeTab === 'dashboard' && (
          <>
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden">
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
                  <span className="text-sm font-bold text-amber-400 font-mono">-{totalBurnedCalories}</span>
                </div>
              </div>

              {/* Progress Bar Proteine */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Proteine (Target Pers.)
                  </span>
                  <span className="text-white font-mono">{totals.protein} / {target.protein}g ({Math.round(proteinPct)}%)</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }} />
                </div>
              </div>

              {/* Macro Grid */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-900 text-center">
                <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">ASSUNTE</span>
                  <span className="text-xs font-extrabold text-white font-mono">{totals.calories}</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">CARBO</span>
                  <span className="text-xs font-extrabold text-white font-mono">{totals.carbs} / {target.carbs}g</span>
                </div>
                <div className="bg-zinc-900/50 p-2 rounded-xl border border-zinc-900">
                  <span className="text-[9px] font-bold text-zinc-500 block uppercase">GRASSI</span>
                  <span className="text-xs font-extrabold text-white font-mono">{totals.fat} / {target.fat}g</span>
                </div>
              </div>
            </div>

            {/* Azione Aggiunta Cibo Reale */}
            <div className="space-y-2">
              <button 
                onClick={() => setShowManualModal(true)}
                className="w-full p-4 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-cyan-500/30 rounded-2xl text-left hover:border-cyan-500 transition active:scale-[0.98] flex items-center gap-4 shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white flex items-center gap-2">
                    Cerca Cibo (Database Reale) <span className="bg-cyan-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black uppercase">LIVE API</span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">Calcolo esatto da database mondiale open source.</div>
                </div>
              </button>
            </div>

            {/* Diario */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 block">Pasti del Giorno</span>
              {dailyLog.length === 0 ? (
                <div className="text-center py-10 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-1">
                  <p className="text-xs text-zinc-500 font-medium">Nessun pasto registrato oggi</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dailyLog.map((item) => (
                    <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-3.5 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-white line-clamp-1 break-all w-48">{item.name}</h3>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">{item.calories} kcal • P: {item.protein}g | C: {item.carbs}g | G: {item.fat}g</p>
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
              <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${waterPct}%` }} />
            </div>
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setWaterMl(w => w + 150)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                  <span className="text-xs font-bold text-white block">150 ml</span>
                </button>
                <button onClick={() => setWaterMl(w => w + 250)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                  <span className="text-xs font-bold text-white block">250 ml</span>
                </button>
                <button onClick={() => setWaterMl(w => w + 500)} className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                  <span className="text-xs font-bold text-white block">500 ml</span>
                </button>
              </div>
              <button onClick={() => setWaterMl(0)} className="text-[10px] text-zinc-600 underline pt-3 block mx-auto">Azzera</button>
            </div>
          </div>
        )}

        {/* TAB 3: WORKOUT */}
        {activeTab === 'workout' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Attività & Calorie</span>
              <button onClick={() => setShowWorkoutModal(true)} className="text-xs bg-cyan-400 text-black font-extrabold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-400/20">
                <Plus className="w-4 h-4" /> Aggiungi
              </button>
            </div>
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Bruciate Oggi</span>
                <span className="text-lg font-black text-white font-mono">{totalBurnedCalories} kcal</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {workoutLog.map((item) => (
                <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.name}</h3>
                    {item.type === 'gym' ? (
                      <p className="text-[11px] text-zinc-400 mt-1 font-mono">{item.sets}x{item.reps} • {item.weight} kg</p>
                    ) : (
                      <p className="text-[11px] text-amber-400 font-bold mt-1 font-mono">-{item.burnedCalories} kcal</p>
                    )}
                  </div>
                  <button onClick={() => setWorkoutLog(workoutLog.filter(w => w.id !== item.id))} className="text-zinc-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal Inserimento Workout */}
      {showWorkoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddWorkout} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm space-y-4">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button type="button" onClick={() => setWorkoutType('gym')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${workoutType === 'gym' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Palestra</button>
              <button type="button" onClick={() => setWorkoutType('sport')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${workoutType === 'sport' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}>Sport</button>
            </div>
            {workoutType === 'gym' ? (
              <div className="space-y-3">
                <input type="text" placeholder="Es. Panca Piana" value={exerciseName} onChange={(e) => setExerciseName(e.target.value)} required className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" placeholder="Serie" value={setsCount} onChange={(e) => setSetsCount(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <input type="number" placeholder="Reps" value={repsCount} onChange={(e) => setRepsCount(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <input type="number" placeholder="Kg" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <select value={sportName} onChange={(e) => setSportName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white">
                  <option value="Corsa">Corsa</option>
                  <option value="Calcio">Calcio</option>
                  <option value="Nuoto">Nuoto</option>
                  <option value="Ciclismo">Ciclismo</option>
                  <option value="Pugilato / Arti Marziali">Pugilato / Arti Marziali</option>
                  <option value="Basket">Basket</option>
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Minuti" value={sportDuration} onChange={(e) => setSportDuration(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white" />
                  <select value={sportIntensity} onChange={(e) => setSportIntensity(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white">
                    <option value="bassa">Bassa Intensità</option>
                    <option value="media">Media Intensità</option>
                    <option value="alta">Alta Intensità</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowWorkoutModal(false)} className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold">Annulla</button>
              <button type="submit" className="flex-1 py-2.5 bg-cyan-400 text-black font-extrabold rounded-xl text-xs">Salva</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Ricerca Reale Cibo (Database) */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRealApiSearch} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Ricerca Database Globale</h3>
            </div>
            
            <p className="text-[11px] text-zinc-400">Si connette in diretta a OpenFoodFacts per scaricare i veri valori nutrizionali.</p>

            <div className="space-y-2">
              <input 
                type="text" placeholder="Nome cibo (es. Barilla Pasta / Petto di Pollo)" 
                value={manualName} onChange={(e) => setManualName(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500"
              />
              <input 
                type="number" placeholder="Quantità in grammi (es. 150)" 
                value={manualGrams} onChange={(e) => setManualGrams(e.target.value)} required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-500"
              />
            </div>
            
            {apiError && <div className="text-[10px] text-red-400 bg-red-900/20 p-2 rounded-lg border border-red-900/30">{apiError}</div>}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowManualModal(false)} className="flex-1 py-2.5 bg-zinc-900 text-zinc-400 rounded-xl text-xs font-bold">Annulla</button>
              <button type="submit" disabled={aiCalculating} className="flex-1 py-2.5 bg-cyan-400 text-black font-extrabold rounded-xl text-xs flex justify-center items-center gap-1">
                {aiCalculating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Cerca Dati Reali'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigazione */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/95 backdrop-blur-2xl border-t border-zinc-900 p-2 flex justify-around items-center z-40">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-zinc-600'}`}><Flame className="w-4 h-4" />Diario</button>
        <button onClick={() => setActiveTab('water')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${activeTab === 'water' ? 'text-cyan-400' : 'text-zinc-600'}`}><Droplets className="w-4 h-4" />Acqua</button>
        <button onClick={() => setActiveTab('workout')} className={`flex flex-col items-center gap-1 p-2 text-[10px] font-bold ${activeTab === 'workout' ? 'text-cyan-400' : 'text-zinc-600'}`}><Dumbbell className="w-4 h-4" />Workout</button>
      </nav>
    </div>
  );
}
