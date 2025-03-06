// Login.js
import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from './Firebase'
import { useNavigate } from 'react-router-dom'
import '../Styles/Login.css'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	const handleLogin = async (e) => {
		e.preventDefault()
		setError('')
		try {
			await signInWithEmailAndPassword(auth, email, password)
			navigate('/home') // Redirect to home page after successful login
		} catch (err) {
			setError(err.message)
		}
	}

	const HandleSignup = () => {
		navigate('/signup')
	}

	return (
		<div className="mainLoginContainer">
			<div className="mainLoginContainerContent">
				<h2>Login</h2>
				<form onSubmit={handleLogin}>
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
					<button type="submit">Login</button>
				</form>

				<p>
					Don't have an account?{' '}
					<span className="signupLink" onClick={HandleSignup}>
						Create one
					</span>
				</p>
			</div>
		</div>
	)
}

export default Login
