import { Outlet } from 'react-router-dom'
import Header from '../components/MainBoard/Header/Header'
import './MainBoard.scss'

export default function MainBoard() {
  return (
    <div className="MainBoard">
      <Header/>
      <div className="outlet">
        <Outlet/>
      </div>
    </div>
  )
}