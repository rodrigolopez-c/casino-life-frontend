import React, { useEffect } from 'react'
import { usePage } from '../../contexts/BoardNavigation';

export default function ProfileBoard() {
    const { setCurrentPage } = usePage();
    
        useEffect(()=>{
            setCurrentPage('profile')
        },[])
  return (
    <div>
      <p>Profile</p>
    </div>
  )
}
