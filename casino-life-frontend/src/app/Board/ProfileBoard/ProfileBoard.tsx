import React, { useEffect } from 'react'
import { usePage } from '../../contexts/BoardNavigation';
import DiceCanvas from '../../components/Dices/DicesCanvas';

export default function ProfileBoard() {
    const { setCurrentPage } = usePage();
    
        useEffect(()=>{
            setCurrentPage('profile')
        },[])
  return (
    <div style={{height: '42rem', width: '98%', background: '#000', marginTop:'5rem'}}>
      <DiceCanvas />
    </div>
  )
}
