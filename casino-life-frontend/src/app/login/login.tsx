import { useState } from 'react'
import LoginButton from '../components/login/LoginButton'
import TermsText from '../components/login/TermsText/TermsText'
import './login.scss'
import LoginTextInput from '../components/login/LoginTextInput/LoginTextInput';

export default function Login() {
    const [emailStep, setEmailStep] = useState(false);
    return (
        <main>
            <div className="LoginBackground">
                <div className="top">
                    <img src="/GamesCards/game1.png" alt="" />
                    <img src="/GamesCards/game2.png" alt="" />
                    <img src="/GamesCards/game3.png" alt="" />
                    <img src="/GamesCards/game7.png" alt="" />
                    <img src="/GamesCards/game8.png" alt="" />
                </div>
                <div className="bottom">
                    <img src="/GamesCards/game4.png" alt="" />
                    <img src="/GamesCards/game9.png" alt="" />
                    <img src="/GamesCards/game10.png" alt="" />
                    <img src="/GamesCards/game6.png" alt="" />
                    <img src="/GamesCards/game11.png" alt="" />
                </div>
                <div className="BlackBackground"></div>
            </div>
            <div className="MainLogin">
                <section className='title'>
                <img src='logo.png' alt='logo'/>
                <h1>Step into the game</h1>
            </section>
            <section className='buttons'>
                <LoginButton text='Sign in with Email' widthRem={25} heightRem={4} onClick={()=>{setEmailStep(true)}} style={emailStep ? { display: "none" } : {}}/>
                <LoginButton text='Create a Player Account'style={emailStep ? { display: "none" } : {display:'block'}} widthRem={25} heightRem={4} variant='secondary'/>
                <LoginButton text='Play as Guest' style={emailStep ? { display: "none" } : {display:'block'}} widthRem={25} heightRem={4} variant='secondary'/>
                {emailStep ? (<LoginTextInput
            setEmailStep={setEmailStep} 
            backTo="/login"
            onSubmit={async (email) => console.log("email enviado:", email)}
          />) : ''}
            </section>
            <section className='terms'>
                <TermsText/>
            </section>
            </div>
        </main>
    )
  }
