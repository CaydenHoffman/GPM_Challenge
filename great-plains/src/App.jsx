import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ArticleList from "./components/ArticleList";

function App() {

  return (
    <>
      <main>
        <h1 className='app-title'>Great Plains Ag Solutions</h1>
        <ArticleList/>
      </main>
    </>
  )
}

export default App
