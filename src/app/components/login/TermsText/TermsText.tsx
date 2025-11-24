import './TermsText.scss'

export default function TermsText() {
  return (
    <p className="terms">
      By signing up, you agree to our{" "}
      <a href="/terms" target="_blank" rel="noreferrer">
        Terms of <br /> Service
      </a>{" "}
      and{" "}
      <a href="/dpa" target="_blank" rel="noreferrer">
        Data Processing Agreement
      </a>.
    </p>
  );
}