import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Player, Quest } from './types'

const API_URL = 'http://localhost:4000/api'

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'habit',
  xp: 10,
  color: 'green',
}

function App() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [player, setPlayer] = useState<Player>({
    name: 'Mati',
    level: 1,
    xp: 0,
    gems: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)

  const totalXp = useMemo(
    () => quests.reduce((sum, quest) => sum + (quest.completed ? quest.xp : 0), 0),
    [quests],
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [questsResponse, playerResponse] = await Promise.all([
          fetch(`${API_URL}/quests`),
          fetch(`${API_URL}/player`),
        ])

        if (!questsResponse.ok || !playerResponse.ok) {
          throw new Error('No se pudieron cargar los datos del juego')
        }

        const questData = (await questsResponse.json()) as Quest[]
        const playerData = (await playerResponse.json()) as Player

        setQuests(questData)
        setPlayer(playerData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Escribe un nombre para la misión')
      return
    }

    try {
      const response = await fetch(`${API_URL}/quests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('No se pudo crear la misión')
      }

      const newQuest = (await response.json()) as Quest
      setQuests((current) => [newQuest, ...current])
      setForm(EMPTY_FORM)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const toggleQuest = async (questId: string) => {
    const quest = quests.find((item) => item.id === questId)
    if (!quest) return

    try {
      const response = await fetch(`${API_URL}/quests/${questId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quest,
          completed: !quest.completed,
          streak: !quest.completed ? quest.streak + 1 : Math.max(0, quest.streak - 1),
        }),
      })

      if (!response.ok) {
        throw new Error('No se pudo actualizar la misión')
      }

      const updatedQuest = (await response.json()) as Quest
      setQuests((current) =>
        current.map((item) => (item.id === questId ? updatedQuest : item)),
      )

      setPlayer((current) => ({
        ...current,
        xp: current.xp + (updatedQuest.completed ? updatedQuest.xp : -updatedQuest.xp),
        gems: current.gems + (updatedQuest.completed ? 3 : -3),
        streak: updatedQuest.completed ? current.streak + 1 : Math.max(0, current.streak - 1),
        level: Math.max(1, 1 + Math.floor((current.xp + (updatedQuest.completed ? updatedQuest.xp : -updatedQuest.xp)) / 120)),
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    }
  }

  const removeQuest = async (questId: string) => {
    try {
      const response = await fetch(`${API_URL}/quests/${questId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('No se pudo borrar la misión')
      }

      setQuests((current) => current.filter((quest) => quest.id !== questId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al borrar')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-group">
          <div className="brand-mark">Q</div>
          <div>
            <p className="eyebrow">QuestBoard</p>
            <h1>Tu misión diaria</h1>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-pill">
            <span>⚡</span>
            <b>{player.xp} XP</b>
          </div>
          <div className="stat-pill accent">
            <span>💎</span>
            <b>{player.gems}</b>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <aside className="profile-panel">
          <div className="avatar">{player.name.slice(0, 1)}</div>
          <h2>{player.name}</h2>
          <p className="level-badge">Nivel {player.level}</p>

          <div className="progress-block">
            <div className="progress-labels">
              <span>Progreso</span>
              <span>{player.xp % 120}/120</span>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${(player.xp % 120) / 120 * 100}%` }} />
            </div>
          </div>

          <div className="mini-stats">
            <div>
              <strong>{player.streak}</strong>
              <span>racha</span>
            </div>
            <div>
              <strong>{quests.filter((q) => q.completed).length}</strong>
              <span>hechas</span>
            </div>
            <div>
              <strong>{totalXp}</strong>
              <span>XP hoy</span>
            </div>
          </div>
        </aside>

        <section className="quest-panel">
          <form className="quest-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>Nueva misión</h3>
              <span>+10 XP</span>
            </div>

            <input
              type="text"
              placeholder="Ej: Leer 15 min"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />

            <textarea
              placeholder="Descripción"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />

            <div className="field-row">
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as Quest['type'] }))}
              >
                <option value="habit">Hábito</option>
                <option value="task">Tarea</option>
                <option value="challenge">Desafío</option>
              </select>

              <select
                value={form.color}
                onChange={(event) => setForm((current) => ({ ...current, color: event.target.value as Quest['color'] }))}
              >
                <option value="green">Verde</option>
                <option value="orange">Naranja</option>
                <option value="purple">Morado</option>
                <option value="blue">Azul</option>
              </select>
            </div>

            <button type="submit">Crear misión</button>
            {error && <p className="error-message">{error}</p>}
          </form>

          <div className="quest-list">
            {loading ? (
              <p className="status">Cargando misiones...</p>
            ) : quests.length === 0 ? (
              <p className="status">Todavía no tienes misiones. ¡Crea una!</p>
            ) : (
              quests.map((quest) => (
                <article key={quest.id} className={`quest-card ${quest.completed ? 'done' : ''}`}>
                  <div className={`quest-icon ${quest.color}`}>{quest.title.slice(0, 1).toUpperCase()}</div>

                  <div className="quest-content">
                    <div className="quest-topline">
                      <span className="tag">{quest.type}</span>
                      <span className="xp">+{quest.xp} XP</span>
                    </div>

                    <h4>{quest.title}</h4>
                    {quest.description && <p>{quest.description}</p>}

                    <div className="quest-actions">
                      <button type="button" className="primary" onClick={() => toggleQuest(quest.id)}>
                        {quest.completed ? 'Reabrir' : 'Completar'}
                      </button>
                      <button type="button" className="ghost" onClick={() => removeQuest(quest.id)}>
                        Borrar
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
