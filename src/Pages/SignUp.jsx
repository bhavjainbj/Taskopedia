import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from './Firebase'
import { useNavigate } from 'react-router-dom'
import '../Styles/SignUp.css'

const SignUp = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const HandleSignUp = async (e) => {
		e.preventDefault()

		setError('')

		try {
			await createUserWithEmailAndPassword(auth, email, password)
			navigate('/login')
		} catch (err) {
			setError(err.message)
		}
	}

	const HandleLogin = () => {
		navigate('/login')
	}

	return (
		<div className="mainSignUpContainer">
			<div className="mainSignUpContainerContent">
				<h2>Sign Up</h2>
				<form onSubmit={HandleSignUp}>
					<div>
						<label>Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div>
						<label>Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
					{error && <p style={{ color: 'red' }}>{error}</p>}
					<button type="submit">Sign Up</button>
				</form>

				<p>
					Have an account?{' '}
					<span className="loginLink" onClick={HandleLogin}>
						Login
					</span>
				</p>
			</div>
		</div>
	)
}

export default SignUp
