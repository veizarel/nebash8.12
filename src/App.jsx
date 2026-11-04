import React, { useState, useEffect } from 'react';

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxHiCGEWYsa2luIeOYid3ZRAU87LTDntqNhu-FTB9F3J92De0kftcB6sTPyU1p4Zu2Y/exec";

const INITIAL_STUDENTS = [
  "Велизар", "Шушана", "Селена", "Милица", "Кристина", "Роберто", "Емре", 
  "Стефан", "Дерия", "Илкан", 
  "Йоана", "Дионис", "Сияна", "Димитър", 
  "Синем", "Снежи", "Христо", "Мартина", "Теодор", "Динко"
];

const MEAT_OPTIONS = [
  "Пилешко 🍗", 
  "Свинско 🥩", 
  "Не ям месо (Веджитъриън) 🥗"
];

const DRINK_OPTIONS = [
  "Кола 🥤", 
  "Фанта 🍊", 
  "Спрайт 🍋", 
  "Минерална вода 💧", 
  "Айрян 🥛",
  "Сок / Друго 🧃"
];

export default function App() {
  const [step, setStep] = useState('welcome'); 
  const [studentsList, setStudentsList] = useState(INITIAL_STUDENTS);
  const [selectedName, setSelectedName] = useState('');
  const [customNameInput, setCustomNameInput] = useState('');
  
  const [meatChoices, setMeatChoices] = useState([]);
  const [drinkChoices, setDrinkChoices] = useState([]);
  
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [allData, setAllData] = useState([]);
  const [newQuestionName, setNewQuestionName] = useState('');
  const [extraQuestions, setExtraQuestions] = useState([]);
  const [extraAnswers, setExtraAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!WEB_APP_URL.includes("http")) return;
    try {
      const res = await fetch(WEB_APP_URL);
      const data = await res.json();
      if (data && data.length > 0) {
        setAllData(data);
        const headers = data[0];
        if (headers.length > 4) {
          setExtraQuestions(headers.slice(4));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMeatToggle = (opt) => {
    if (meatChoices.includes(opt)) {
      setMeatChoices(meatChoices.filter(item => item !== opt));
    } else {
      setMeatChoices([...meatChoices, opt]);
    }
  };

  const handleDrinkToggle = (opt) => {
    if (drinkChoices.includes(opt)) {
      setDrinkChoices(drinkChoices.filter(item => item !== opt));
    } else {
      setDrinkChoices([...drinkChoices, opt]);
    }
  };

  const handleFinishSurvey = async () => {
    setLoading(true);
    const finalNameToSave = selectedName === '__OTHER__' ? customNameInput : selectedName;
    const payload = {
      name: finalNameToSave,
      meat: meatChoices.join(', '),
      drink: drinkChoices.join(', '),
      extra: extraAnswers
    };

    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setLoading(false);
      setStep('results');
      fetchData();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setStep('results');
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestionName) return;
    setLoading(true);
    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: "add_question", questionName: newQuestionName })
      });
      setNewQuestionName('');
      alert("Въпросът е добавен успешно в Google Sheets и към анкетата!");
      fetchData();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const calculateStats = (colIndex) => {
    if (allData.length <= 1) return {};
    const counts = {};
    let totalVotes = 0;
    
    for (let i = 1; i < allData.length; i++) {
      const val = allData[i][colIndex];
      if (val) {
        const items = val.split(',').map(s => s.trim());
        items.forEach(item => {
          if (item) {
            counts[item] = (counts[item] || 0) + 1;
            totalVotes++;
          }
        });
      }
    }
    const stats = {};
    for (let key in counts) {
      stats[key] = Math.round((counts[key] / (allData.length - 1)) * 100);
    }
    return { stats, total: allData.length - 1 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white flex flex-col items-center justify-center p-4 font-sans select-none">
      
      <div className="absolute top-4 right-4 flex gap-2">
        <button 
          onClick={() => setStep('admin')} 
          className="text-xs bg-white/15 hover:bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 transition shadow-lg"
        >
          🔐 Админ
        </button>
      </div>

      {step === 'welcome' && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
          <div className="inline-block p-3 bg-gradient-to-tr from-amber-400 to-pink-500 rounded-2xl shadow-lg mb-6 text-2xl">
            🏡🍻
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-amber-200 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
            Празник на Студентите
          </h1>
          <div className="text-pink-300 font-semibold text-sm mb-4">
            <a href="https://vila.bg/house-makeli-6025.html" target="_blank" rel="noreferrer" className="underline hover:text-white transition">
              📍 Вила Макели
            </a> 
            <span className="block text-slate-300 text-xs mt-1">📅 09 - 10 декември 2026 г.</span>
          </div>
          <p className="text-slate-300 text-sm mb-8">
            Избери името си и отбележи любимите си храни и напитки (можеш да избираш по няколко!).
          </p>
          <button 
            onClick={() => setStep('selectName')}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-violet-600 font-bold rounded-2xl shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
          >
            Попълни анкетата 🚀
          </button>
        </div>
      )}

      {step === 'selectName' && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-2 text-center">Кой си ти от компанията? 😎</h2>
          <p className="text-xs text-slate-300 mb-6 text-center">Избери се от списъка с потвърдилите:</p>
          
          <select 
            className="w-full p-4 bg-slate-900/80 border border-white/20 rounded-2xl mb-4 text-white focus:outline-none focus:border-pink-500 text-sm"
            value={selectedName}
            onChange={(e) => {
              setSelectedName(e.target.value);
              if(e.target.value !== '__OTHER__') setCustomNameInput('');
            }}
          >
            <option value="">-- Избери име --</option>
            {studentsList.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
            <option value="__OTHER__">➕ Нов човек (добави име)...</option>
          </select>

          {selectedName === '__OTHER__' && (
            <div className="mb-6">
              <input 
                type="text" 
                placeholder="Въведи три имена / прякор..."
                className="w-full p-4 bg-slate-900/80 border border-pink-500/50 rounded-2xl text-white text-sm focus:outline-none"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
              />
            </div>
          )}

          <button 
            disabled={!selectedName || (selectedName === '__OTHER__' && !customNameInput.trim())}
            onClick={() => setStep('survey')}
            className={`w-full py-4 font-bold rounded-2xl transition ${
              selectedName && (selectedName !== '__OTHER__' || customNameInput.trim())
                ? 'bg-gradient-to-r from-pink-500 to-violet-600 shadow-lg shadow-pink-500/30 hover:scale-[1.02]' 
                : 'bg-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            Напред към менюто ➡️
          </button>
        </div>
      )}

      {step === 'survey' && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-center text-pink-300">
            Здравей, {selectedName === '__OTHER__' ? customNameInput : selectedName}! 👋
          </h2>
          
          <div>
            <label className="block text-sm font-semibold mb-2">1. Какво месо предпочиташ? <span className="text-xs text-pink-300 font-normal">(можеш да избереш повече от едно)</span></label>
            <div className="space-y-2">
              {MEAT_OPTIONS.map((opt, i) => {
                const isSelected = meatChoices.includes(opt);
                return (
                  <button
                    key={i}
                    onClick={() => handleMeatToggle(opt)}
                    className={`w-full p-3 rounded-xl text-left border text-sm flex items-center justify-between transition ${isSelected ? 'bg-pink-600/50 border-pink-400 shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <span>{opt}</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border ${isSelected ? 'bg-pink-500 border-white text-white' : 'border-white/30'}`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">2. Предпочитано безалкохолно / сок? <span className="text-xs text-indigo-300 font-normal">(може няколко)</span></label>
            <div className="space-y-2">
              {DRINK_OPTIONS.map((opt, i) => {
                const isSelected = drinkChoices.includes(opt);
                return (
                  <button
                    key={i}
                    onClick={() => handleDrinkToggle(opt)}
                    className={`w-full p-3 rounded-xl text-left border text-sm flex items-center justify-between transition ${isSelected ? 'bg-indigo-600/50 border-indigo-400 shadow-md' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  >
                    <span>{opt}</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border ${isSelected ? 'bg-indigo-500 border-white text-white' : 'border-white/30'}`}>
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {extraQuestions.map((eq, i) => (
            <div key={i}>
              <label className="block text-sm font-semibold mb-2">{i + 3}. {eq}</label>
              <input 
                type="text" 
                placeholder="Твоят отговор..."
                className="w-full p-3 bg-slate-900/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-pink-500"
                onChange={(e) => setExtraAnswers({...extraAnswers, [eq]: e.target.value})}
              />
            </div>
          ))}

          <button 
            disabled={meatChoices.length === 0 || drinkChoices.length === 0 || loading}
            onClick={handleFinishSurvey}
            className={`w-full py-4 font-bold rounded-2xl transition ${meatChoices.length > 0 && drinkChoices.length > 0 && !loading ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 hover:scale-[1.02]' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
          >
            {loading ? "Запазване..." : "Запази отговорите ✨"}
          </button>
        </div>
      )}

      {step === 'results' && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-2xl font-black text-center bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
            Резултати за вилата 📊
          </h2>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-pink-300 mb-2">🍗 Предпочитания за месо:</h3>
            {(() => {
              const { stats, total } = calculateStats(2);
              if (!total) return <p className="text-xs text-slate-400">Все още няма гласове.</p>;
              return Object.entries(stats).map(([k, p], i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span>{k}</span> <span>{p}% от хората</span></div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full" style={{ width: `${p}%` }}></div>
                  </div>
                </div>
              ));
            })()}
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <h3 className="text-sm font-bold text-indigo-300 mb-2">🥤 Предпочитания за безалкохолно:</h3>
            {(() => {
              const { stats, total } = calculateStats(3);
              if (!total) return <p className="text-xs text-slate-400">Все още няма гласове.</p>;
              return Object.entries(stats).map(([k, p], i) => (
                <div key={i} className="mb-2">
                  <div className="flex justify-between text-xs mb-1"><span>{k}</span> <span>{p}% от хората</span></div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-teal-500 h-full rounded-full" style={{ width: `${p}%` }}></div>
                  </div>
                </div>
              ));
            })()}
          </div>

          <button 
            onClick={() => setStep('welcome')}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 font-bold rounded-2xl transition text-sm"
          >
            Обратно към началото 🏠
          </button>
        </div>
      )}

      {step === 'admin' && (
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl space-y-6">
          <h2 className="text-xl font-bold text-center text-amber-300">🔐 Админ Панел</h2>
          
          {!isAdmin ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 text-center">Въведи паролата за админ панела:</p>
              <input 
                type="password" 
                placeholder="Парола..."
                className="w-full p-3 bg-slate-900/60 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <button 
                onClick={() => {
                  if (adminPassword === "villa2026") {
                    setIsAdmin(true);
                  } else {
                    alert("Грешна парола!");
                  }
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl transition text-sm shadow-lg"
              >
                Влез в панела 🔓
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                <h3 className="text-sm font-bold text-amber-300 mb-2">➕ Добави нов въпрос</h3>
                <p className="text-xs text-slate-300 mb-3">Това ще създаде нова колона в Google Sheets и автоматично ще я добави към анкетата за всички!</p>
                <input 
                  type="text" 
                  placeholder="Напр. Алкохолно предпочитание..."
                  className="w-full p-3 bg-slate-900/60 border border-white/20 rounded-xl text-white text-sm mb-3 focus:outline-none focus:border-amber-500"
                  value={newQuestionName}
                  onChange={(e) => setNewQuestionName(e.target.value)}
                />
                <button 
                  disabled={loading}
                  onClick={handleAddQuestion}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 font-bold rounded-xl text-sm shadow-lg hover:scale-[1.02] transition"
                >
                  {loading ? "Добавяне..." : "Създай колона в Sheets ⚡"}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-2">📂 Бързи връзки:</h3>
                <a 
                  href="https://docs.google.com/spreadsheets" 
                  target="_blank" 
                  rel="noreferrer"
                  className="block text-center w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-semibold transition"
                >
                  Отвори Google Sheets таблицата ↗
                </a>
              </div>
            </div>
          )}

          <button 
            onClick={() => { setStep('welcome'); setIsAdmin(false); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 font-bold rounded-2xl transition text-sm text-slate-400"
          >
            ← Назад към анкетата
          </button>
        </div>
      )}

    </div>
  );
}