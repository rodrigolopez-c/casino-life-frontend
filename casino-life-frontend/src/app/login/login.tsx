import { useState } from 'react'
import LoginButton from '../components/login/LoginButton'
import TermsText from '../components/login/TermsText/TermsText'
import './login.scss'
import LoginTextInput from '../components/login/LoginTextInput/LoginTextInput';

export default function Login() {
    const [emailStep, setEmailStep] = useState(false);
    return (
        <main>
            <section className='title'>
                <img src='logo.png' alt='logo'/>
                <h1>Step into the game</h1>
            </section>
            <section className='buttons'>
                <LoginButton text='Sign in with Email' widthRem={25} heightRem={4} onClick={()=>{setEmailStep(true)}} style={emailStep ? { display: "none" } : {}}/>
                <LoginButton text='Create a Player Account'style={emailStep ? { display: "none" } : {display:'block'}} widthRem={25} heightRem={4} variant='secondary'/>
                <LoginButton text='Play as Guest' style={emailStep ? { display: "none" } : {display:'block'}} widthRem={25} heightRem={4} variant='secondary'/>
                {emailStep ? (<LoginTextInput
            setEmailStep={setEmailStep} // 👈 le pasas la función
            backTo="/login"
            onSubmit={async (email) => console.log("email enviado:", email)}
          />) : ''}
            </section>
            <section className='terms'>
                <TermsText/>
            </section>
        </main>
    )
  }
