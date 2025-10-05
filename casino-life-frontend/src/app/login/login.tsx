import LoginButton from '../components/login/LoginButton'
import TermsText from '../components/login/TermsText/TermsText'
import './login.scss'

export default function Login() {
    return (
        <main>
            <section className='title'>
                <img src='logo.png' alt='logo'/>
                <h1>Step into the game</h1>
            </section>
            <section className='buttons'>
                <LoginButton text='Sign in with Email' widthRem={25} heightRem={3.9}/>
                <LoginButton text='Create a Player Account' widthRem={25} heightRem={3.9} variant='secondary'/>
                <LoginButton text='Play as Guest' widthRem={25} heightRem={3.9} variant='secondary'/>
            </section>
            <section className='terms'>
                <TermsText/>
            </section>
        </main>
    )
  }
