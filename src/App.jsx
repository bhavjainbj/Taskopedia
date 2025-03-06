import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login'
import SignUp from './Pages/SignUp'
import Home from './Pages/Home'
import Card from './Pages/CreateTask'
import CardList from './Pages/OthersTaskList'
import MyTaskList from './Pages/MyTaskList'
import Footer from './Pages/Footer'

function App() {
	return (
		<Router>
			<div>
				<Routes>
					<Route path="/" element={<Login />}></Route>
					<Route path="/signup" element={<SignUp />}></Route>
					<Route path="/home" element={<Home />}></Route>
					<Route path="/login" element={<Login />}></Route>
					<Route path="/create-task" element={<Card />}></Route>
					<Route
						path="/view-other-tasks"
						element={<CardList />}
					></Route>
					<Route
						path="/view-my-task"
						element={<MyTaskList />}
					></Route>
				</Routes>
				<Footer />
			</div>
		</Router>
	)
}

export default App
