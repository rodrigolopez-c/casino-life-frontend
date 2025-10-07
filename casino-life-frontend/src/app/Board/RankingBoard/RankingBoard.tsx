import React, { useEffect } from 'react'
import { usePage } from '../../contexts/BoardNavigation';

export default function RankingBoard() {
    const { setCurrentPage } = usePage();
        
            useEffect(()=>{
                setCurrentPage('ranking')
            },[])
  return (
    <div>
      <p>Ranking</p>
    </div>
  )
}
