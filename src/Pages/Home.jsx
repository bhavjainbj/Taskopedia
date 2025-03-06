import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from './Firebase'
import '../Styles/Home.css'
import Card from './CreateTask'

const Home = () => {
	const navigate = useNavigate()
	const HandleLogout = async () => {
		await auth.signOut()
		navigate('/login')
	}

	const createTask = () => {
		navigate('/create-task')
	}

	const viewMyTask = () => {
		navigate('/view-my-task')
	}

	const viewOtherTasks = () => {
		navigate('/view-other-tasks')
	}

	return (
		<div className="homeContainer">
			<div className="HomeHeader">
				<h2>Home Page</h2>
				<button onClick={HandleLogout} className="logoutButton">
					Logout
				</button>
			</div>

			<div className="taskContainer">
				<button onClick={createTask} className="taskButton">
					Create Task
				</button>
			</div>
			<div className="taskContainer">
				<button onClick={viewMyTask} className="taskButton">
					View My Task
				</button>
			</div>
			<div className="taskContainer">
				<button onClick={viewOtherTasks} className="taskButton">
					View Other Tasks
				</button>
			</div>
		</div>
	)
}

export default Home
