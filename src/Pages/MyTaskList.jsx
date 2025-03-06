import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from './Firebase'
import '../Styles/MyTaskList.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
	faEdit,
	faMapMarkerAlt,
	faTrash
} from '@fortawesome/free-solid-svg-icons'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const MyTaskList = () => {
	const navigate = useNavigate()
	const [cards, setCards] = useState({})
	const [loading, setLoading] = useState(true)
	const [currentUserEmail, setCurrentUserEmail] = useState(null)
	const [showModal, setShowModal] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)
	const [showMapModal, setShowMapModal] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [showEditModal, setShowEditModal] = useState(false)
	const [taskToEdit, setTaskToEdit] = useState(null)
	const [taskDetails, setTaskDetails] = useState({
		Title: '',
		Description: '',
		Location: ''
	})

	const goBack = () => navigate('/home')

	useEffect(() => {
		const fetchUser = () => {
			const user = auth.currentUser
			if (user) {
				const sanitizedEmail = user.email.replace(/\./g, '')
				setCurrentUserEmail(sanitizedEmail)
			}
		}

		const fetchData = async () => {
			try {
				const res = await fetch(
					'https://fir-auth-44228-default-rtdb.firebaseio.com/.json'
				)
				const data = await res.json()
				setCards(data || {})
				setLoading(false)
			} catch (error) {
				setLoading(false)
			}
		}

		fetchUser()
		fetchData()
	}, [])

	if (loading) return <p>Loading...</p>
	if (!currentUserEmail) return <p>Loading user information...</p>

	const filteredCards = Object.entries(cards).filter(
		([userEmail]) => userEmail === currentUserEmail
	)

	const handleTaskClick = (task) => {
		setSelectedTask(task)
		setShowModal(true)
	}

	const closeModal = () => {
		setShowModal(false)
		setSelectedTask(null)
	}

	const openMapModal = (task) => {
		if (task.lat && task.lng) {
			setSelectedTask(task)
			setShowMapModal(true)
			setErrorMessage('')
		} else {
			setErrorMessage('Location coordinates not available for this task.')
		}
	}

	const closeMapModal = () => {
		setShowMapModal(false)
		setSelectedTask(null)
	}

	const deleteTask = async (userEmail, cardId) => {
		try {
			const res = await fetch(
				`https://fir-auth-44228-default-rtdb.firebaseio.com/${userEmail}/${cardId}.json`,
				{
					method: 'DELETE'
				}
			)

			if (res.ok) {
				alert('Task deleted successfully!')
				setCards((prevCards) => {
					const updatedCards = { ...prevCards }
					delete updatedCards[userEmail][cardId]
					return updatedCards
				})
			}
		} catch (error) {
			console.error('Error deleting task:', error)
		}
	}

	const openEditModal = (task, userEmail, cardId) => {
		setTaskToEdit({ ...task, userEmail, cardId })
		setTaskDetails({
			Title: task.Title,
			Description: task.Description,
			Location: task.Location
		})
		setShowEditModal(true)
	}

	const handleEditTaskSubmit = async () => {
		if (taskToEdit && taskToEdit.userEmail && taskToEdit.cardId) {
			try {
				const res = await fetch(
					`https://fir-auth-44228-default-rtdb.firebaseio.com/${taskToEdit.userEmail}/${taskToEdit.cardId}.json`,
					{
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(taskDetails)
					}
				)

				if (res.ok) {
					alert('Task updated successfully!')
					setCards((prevCards) => {
						const updatedCards = { ...prevCards }
						updatedCards[taskToEdit.userEmail][taskToEdit.cardId] =
							{ ...taskDetails }
						return updatedCards
					})
					setShowEditModal(false)
				}
			} catch (error) {
				console.error('Error updating task:', error)
			}
		}
	}

	return (
		<div className="mainMyTaskContainer">
			<button className="backButton" onClick={goBack}>
				Back
			</button>
			<h2 className="header">My Tasks</h2>
			<div className="taskList">
				{filteredCards.length === 0 ? (
					<p>No Tasks are Available</p>
				) : (
					filteredCards.map(([userEmail, userCards]) => (
						<div key={userEmail}>
							{Object.entries(userCards).map(([cardId, card]) => (
								<div
									className="taskCard"
									key={cardId}
									onClick={() => handleTaskClick(card)}
								>
									<h4 className="taskTitle">{card.Title}</h4>
									<p className="taskDescription">
										{card.Description}
									</p>
									<p
										className="taskLocation"
										onClick={(e) => {
											e.stopPropagation()
											openMapModal(card)
										}}
										style={{
											cursor: 'pointer',
											color: '#3d5af1'
										}}
									>
										<FontAwesomeIcon
											icon={faMapMarkerAlt}
											className="locationIcon"
										/>
										&nbsp;{card.Location}
									</p>
									<button
										className="editButton"
										onClick={(e) => {
											e.stopPropagation()
											openEditModal(
												card,
												userEmail,
												cardId
											)
										}}
									>
										<FontAwesomeIcon icon={faEdit} />
										Edit
									</button>
									<button
										className="deleteButton"
										onClick={(e) => {
											e.stopPropagation()
											deleteTask(userEmail, cardId)
										}}
									>
										<FontAwesomeIcon icon={faTrash} />{' '}
										Delete
									</button>
								</div>
							))}
						</div>
					))
				)}
			</div>

			{showModal && selectedTask && (
				<div className="modalBackground" onClick={closeModal}>
					<div
						className="modalCard"
						onClick={(e) => e.stopPropagation()}
					>
						<h4 className="taskTitle">{selectedTask.Title}</h4>
						<p className="taskDescription">
							{selectedTask.Description}
						</p>
						<p
							className="taskLocation"
							onClick={(e) => {
								e.stopPropagation()
								openMapModal(selectedTask) // Pass the selected task to openMapModal
							}}
							style={{
								cursor: 'pointer',
								color: '#3d5af1'
							}}
						>
							<FontAwesomeIcon
								icon={faMapMarkerAlt}
								className="locationIcon"
							/>
							&nbsp;{selectedTask.Location}
						</p>
					</div>
				</div>
			)}

			{errorMessage && <div className="error">{errorMessage}</div>}

			{showMapModal &&
				selectedTask &&
				selectedTask.lat &&
				selectedTask.lng && (
					<div className="modalBackground" onClick={closeMapModal}>
						<div
							className="modalCard"
							onClick={(e) => e.stopPropagation()}
						>
							<MapContainer
								center={[selectedTask.lat, selectedTask.lng]}
								zoom={13}
								style={{ height: '400px', width: '100%' }}
							>
								<TileLayer
									url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
									attribution="&copy; OpenStreetMap contributors"
								/>
								<Marker
									position={[
										selectedTask.lat,
										selectedTask.lng
									]}
								>
									<Popup>{selectedTask.Location}</Popup>
								</Marker>
							</MapContainer>
						</div>
					</div>
				)}

			{showEditModal && (
				<div
					className="editModalBackground"
					onClick={() => setShowEditModal(false)}
				>
					<div
						className="editModalCard"
						onClick={(e) => e.stopPropagation()}
					>
						<h4>Edit Task</h4>
						<input
							type="text"
							value={taskDetails.Title}
							onChange={(e) =>
								setTaskDetails({
									...taskDetails,
									Title: e.target.value
								})
							}
							placeholder="Task Title"
						/>
						<textarea
							value={taskDetails.Description}
							onChange={(e) =>
								setTaskDetails({
									...taskDetails,
									Description: e.target.value
								})
							}
							placeholder="Task Description"
						/>
						<input
							type="text"
							value={taskDetails.Location}
							onChange={(e) =>
								setTaskDetails({
									...taskDetails,
									Location: e.target.value
								})
							}
							placeholder="Task Location"
						/>
						<button
							className="saveButton"
							onClick={handleEditTaskSubmit}
						>
							Save Changes
						</button>
						<button
							className="cancelButton"
							onClick={() => setShowEditModal(false)}
						>
							Cancel
						</button>
						{errorMessage && (
							<div className="error">{errorMessage}</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default MyTaskList
