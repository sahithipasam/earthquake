import { useEffect, useMemo, useState } from 'react'
import './styles/App.css'

const soilProfiles = {
  rock: { label: 'Rocky ground', factor: 0.82, color: '#6dd3ce' },
  mixed: { label: 'Mixed soil', factor: 1, color: '#ffd166' },
  sand: { label: 'Loose sand', factor: 1.22, color: '#f08a5d' },
}

const quickScenarios = [
  { label: 'School drill', magnitude: 4.8, depth: 22, soil: 'rock' },
  { label: 'Town shake', magnitude: 6.1, depth: 13, soil: 'mixed' },
  { label: 'Coastal warning', magnitude: 7.3, depth: 8, soil: 'sand' },
]

const quiz = [
  {
    q: 'Which wave arrives first after an earthquake?',
    options: ['S-wave', 'P-wave', 'Surface wave'],
    answer: 1,
  },
  {
    q: 'What should you do during strong shaking?',
    options: ['Run outside immediately', 'Drop, Cover, Hold', 'Stand on a chair'],
    answer: 1,
  },
  {
    q: 'Which surface type usually increases shaking?',
    options: ['Solid rock', 'Loose soil or sand', 'Concrete'],
    answer: 1,
  },
  {
    q: 'Epicenter is...',
    options: ['The point underground where rupture starts', 'The point on the surface above the rupture', 'A location of volcano'],
    answer: 1,
  },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const describeIntensity = (value) => {
  if (value < 25) return 'Light shaking'
  if (value < 50) return 'Moderate shaking'
  if (value < 75) return 'Strong shaking'
  return 'Very strong shaking'
}

const describeDepth = (value) => {
  if (value < 12) return 'Shallow quake'
  if (value < 30) return 'Medium-depth quake'
  return 'Deep quake'
}

const buildWavePath = (phase, power, running) => {
  const offset = running ? phase : 0
  const amplitude = 10 + power * 0.22
  const points = []

  for (let x = 0; x <= 320; x += 8) {
    const p = Math.sin(x / 26 + offset) * amplitude
    const s = x > 130 ? Math.sin((x - 130) / 14 + offset * 1.8) * amplitude * 0.78 : 0
    points.push(`${x},${64 + p + s}`)
  }

  return `M ${points.join(' L ')}`
}

function App() {
  const [magnitude, setMagnitude] = useState(5.7)
  const [depth, setDepth] = useState(14)
  const [soil, setSoil] = useState('mixed')
  const [running, setRunning] = useState(true)
  const [phase, setPhase] = useState(0)

  const [quizStep, setQuizStep] = useState(0)
  const [quizChoice, setQuizChoice] = useState(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizDone, setQuizDone] = useState(false)

  useEffect(() => {
    if (!running) return undefined

    const timer = window.setInterval(() => {
      setPhase((old) => (old + 0.17) % 10)
    }, 55)

    return () => window.clearInterval(timer)
  }, [running])

  const soilData = soilProfiles[soil]
  const intensity = clamp((magnitude - 3.4) * 18 * (1 - depth / 70) * soilData.factor, 5, 100)
  const pWaveSpeed = (6 + depth * 0.02).toFixed(1)
  const sWaveSpeed = (3.4 + depth * 0.012).toFixed(1)
  const buildingShift = running ? Math.sin(phase * 2.1) * (intensity / 22) : 0
  const focusY = 205 + depth * 2.2
  const wavePath = useMemo(() => buildWavePath(phase, intensity, running), [phase, intensity, running])

  const applyScenario = (scenario) => {
    setMagnitude(scenario.magnitude)
    setDepth(scenario.depth)
    setSoil(scenario.soil)
    setRunning(true)
  }

  const safetyMeasures = [
    { id: 'under_table', label: 'Hide under a strong table or desk'},
    { id: 'stay_put', label: 'Stay where you are and protect your head' },
    { id: 'away_windows', label: 'Move away from windows and shelves' },
    { id: 'emergency_kit', label: 'Keep a small emergency kit ready' },
    { id: 'evacuate', label: 'Only evacuate after shaking stops and it is safe' },
  ]

  
  const handleQuizChoice = (index) => {
    if (quizAnswered) return
    setQuizChoice(index)
    const correct = index === quiz[quizStep].answer
    if (correct) setQuizScore((s) => s + 1)
    setQuizAnswered(true)
  }

  const submitQuiz = () => {
    if (!quizAnswered) return

    if (quizStep === quiz.length - 1) {
      setQuizDone(true)
      return
    }

    setQuizStep((old) => old + 1)
    setQuizChoice(null)
    setQuizAnswered(false)
  }

  const resetQuiz = () => {
  setQuizStep(0)
  setQuizChoice(null)
  setQuizScore(0)
  setQuizDone(false)
  setQuizAnswered(false)   // 🔥 IMPORTANT FIX
}

  return (
    <main className="app">
      <header className="hero card">
        <h1>Earthquake Explorer</h1>
        <p className="heroText">
          Learn how earthquake waves move underground and how different settings change shaking.
        </p>
        
      </header>
      <section className="card">
  <div className="sectionHead">
   
    <h2>Foundations</h2>
  </div>

  <div className="labExplain">
    <p>
      <strong>Epicenter:</strong> The point on Earth’s surface directly above where the earthquake starts underground.
    </p>

    <p>
      <strong>P-wave (Primary):</strong> A fast, first-arriving wave that moves the ground back-and-forth. It usually causes less damage.
    </p>

    <p>
      <strong>S-wave (Secondary):</strong> A slower wave that moves the ground up-and-down or side-to-side and causes stronger shaking.
    </p>
  </div>
</section>

      <section className="card labSection">
        <div className="sectionHead">
         
          <h2>Quake Lab</h2>
        </div>
        <div className="labGrid">
          <div className="sceneWrap" aria-live="polite">
            <svg viewBox="0 0 900 420" className={running ? 'scene running' : 'scene'} role="img" aria-label="Earthquake simulation scene">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d3557" />
                  <stop offset="100%" stopColor="#102239" />
                </linearGradient>
                <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7f5539" />
                  <stop offset="100%" stopColor="#3f2618" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="900" height="420" rx="22" fill="url(#sky)" />
              <path d="M0 170C120 152 210 184 320 168C420 154 510 186 612 170C710 156 812 182 900 168V420H0Z" fill="url(#land)" />
              <line x1="460" y1="66" x2="555" y2="340" stroke="#f4d35e" strokeWidth="5" strokeDasharray="10 9" />
              <circle cx="520" cy={focusY} r="12" fill="#ff6b6b" />
              <circle cx="520" cy={focusY} r={72 + phase * 5} fill="none" stroke="#6dd3ce" strokeWidth="4" opacity="0.45" />
              <circle cx="520" cy={focusY} r={48 + phase * 4} fill="none" stroke="#ffd166" strokeWidth="4" opacity="0.45" />
              <line x1="520" y1="40" x2="520" y2={focusY - 16} stroke="#f7fff7" strokeWidth="3" strokeDasharray="8 8" />
              <text x="534" y="56" fill="#f7fff7" fontSize="20" fontWeight="700">Epicenter</text>
              <text x="542" y={focusY + 8} fill="#ffe08a" fontSize="18" fontWeight="700">Focus</text>
              <g transform={`translate(${buildingShift}, 0)`}>
                <rect x="120" y="110" width="84" height="86" rx="8" fill="#f4a261" />
                <rect x="220" y="92" width="92" height="104" rx="8" fill="#e9c46a" />
                <rect x="690" y="120" width="86" height="76" rx="8" fill="#f4a261" />
              </g>
            </svg>
          </div>
          <div className="heroStats">
          <span>{describeDepth(depth)}</span>
          <strong>{describeIntensity(intensity)}</strong>
        </div>

          <div className="controlPanel">
            <label>
              Magnitude: <strong>{magnitude.toFixed(1)}</strong>
              <input type="range" min="3.0" max="8.5" step="0.1" value={magnitude} onChange={(event) => setMagnitude(Number(event.target.value))} />
            </label>

            <label>
              Depth: <strong>{Math.round(depth)} km</strong>
              <input type="range" min="4" max="45" step="1" value={depth} onChange={(event) => setDepth(Number(event.target.value))} />
            </label>

            <label>
              Ground type
              <select value={soil} onChange={(event) => setSoil(event.target.value)}>
                {Object.entries(soilProfiles).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </label>

            <div className="buttonRow">
              <button type="button" onClick={() => setRunning((old) => !old)}>
                {running ? 'Pause waves' : 'Play waves'}
              </button>
              <button type="button" className="ghost" onClick={() => applyScenario(quickScenarios[1])}>
                Reset
              </button>
            </div>

            <div className="miniGrid">
              <article>
                <span>Shaking level</span>
                <strong>{Math.round(intensity)} / 100</strong>
              </article>
              <article>
                <span>P-wave speed</span>
                <strong>{pWaveSpeed} km/s</strong>
              </article>
              <article>
                <span>S-wave speed</span>
                <strong>{sWaveSpeed} km/s</strong>
              </article>
            </div>

            <p className="hint">Tip: Shallow quakes and loose soil can increase surface shaking.</p>
          </div>
        </div>
        
      </section>

      <section className="card">
        <div className="sectionHead">
          
          <h2>Try Real-like Scenarios</h2>
        </div>
        <div className="scenarioRow">
          {quickScenarios.map((scenario) => (
            <button key={scenario.label} type="button" className="scenarioBtn" onClick={() => applyScenario(scenario)}>
              <strong>{scenario.label}</strong>
              <span>M {scenario.magnitude} | {scenario.depth} km</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card waveSection">
        <div className="sectionHead">
          
          <h2>Seismograph View</h2>
        </div>
        <svg viewBox="0 0 320 130" className="seismo" role="img" aria-label="Animated seismic waveform">
          <rect x="0" y="0" width="320" height="130" rx="14" />
          <path d={wavePath} />
        </svg>
        <p className="hint">P-waves usually arrive first. S-waves arrive later and often shake more strongly.</p>
      </section>

      <section className="card safetySection">
        <div className="sectionHead">
         
          <h2>Safety Measures</h2>
        </div>
        <p className="safetyIntro"><strong>During strong shaking: Drop, Cover, Hold.</strong> Get down, take cover under sturdy furniture, and hold on until shaking stops.</p>

        <div className="choiceList">
  {safetyMeasures.map((item) => (
    <div key={item.id} className="choice">
      {item.label}
    </div>
  ))}
</div>
      </section>

      <section className="card quizSection">
        <div className="sectionHead">
        
          <h2>Knowledge Check</h2>
        </div>
        {!quizDone ? (
          <>
            <p className="quizCount">Question {quizStep + 1} of {quiz.length}</p>
            <p className="quizQ">{quiz[quizStep].q}</p>
            <div className="choiceList" role="group" aria-label="Quiz choices">
              {quiz[quizStep].options.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={quizChoice === index ? (quizAnswered ? 'choice active' : 'choice active') : 'choice'}
                  onClick={() => handleQuizChoice(index)}
                >
                  {item}
                </button>
              ))}
            </div>
            {quizAnswered && (
              <p className={quiz[quizStep].answer === quizChoice ? 'feedback ok' : 'feedback bad'}>
                {quiz[quizStep].answer === quizChoice ? 'Correct!' : 'Not correct.'}
                {quizStep === 1 && (
                  <span> {quiz[quizStep].answer === quizChoice ? 'Drop, Cover, Hold — get down, take cover under sturdy furniture, and hold on until the shaking stops.' : 'The safest action is Drop, Cover, Hold: get down, take cover under sturdy furniture, and hold on until the shaking stops.'}</span>
                )}
                {quizStep === 0 && (
                  <span> {quiz[quizStep].answer === quizChoice ? 'P-waves arrive first and are faster.' : 'P-waves arrive first; S-waves come later and often shake more.'}</span>
                )}
              </p>
            )}
            <button type="button" className="checkBtn" onClick={submitQuiz} disabled={!quizAnswered}>Next</button>
          </>
        ) : (
          <div className="resultBox">
            <h3>Your Score: {quizScore} / {quiz.length}</h3>
            <p>{quizScore === quiz.length ? 'Awesome! You are quake-ready.' : 'Great effort. Try once more to improve your score.'}</p>
            <button type="button" className="checkBtn" onClick={resetQuiz}>Retry Quiz</button>
          </div>
        )}
      </section>
    </main>
  )
}

export default App