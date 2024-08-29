import cog from './assets/cog.svg'
import garage from '/car-repair.png'
import './App.css'

function App() {

  return (
    <>
      <div>
        <a href="#" target="_blank">
          <img src={garage} className="logo" alt="Vite logo" />
        </a>
        <a href="" target="_blank">
          <img src={cog} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Ride Recap</h1>
      <p className="read-the-docs">
        Work in Progress
      </p>
    </>
  )
}

export default App
