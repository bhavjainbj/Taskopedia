import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from './Firebase'
import '../Styles/OthersTaskList.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const OthersTaskList = () => {
	const navigate = useNavigate()
	const [cards, setCards] = useState({})
	const [loading, setLoading] = useState(true)
	const [currentUserEmail, setCurrentUserEmail] = useState(null)
	const [showModal, setShowModal] = useState(false)
	const [selectedTask, setSelectedTask] = useState(null)
	const [showMapModal, setShowMapModal] = useState(false) // Map modal state
	const [errorMessage, setErrorMessage] = useState('') // Error message state

	const goBack = () => {
		navigate('/home')
	}

	useEffect(() => {
		const fetchUser = () => {
			const user = auth.currentUser
			if (user) {
				const sanitizedEmail = user.email.replace(/\./g, '')
				setCurrentUserEmail(sanitizedEmail)
			} else {
				console.log('No user is logged in')
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
				console.error('Error fetching data:', error)
				setLoading(false)
			}
		}

		fetchUser()
		fetchData()
	}, [])

	if (loading) {
		return <p>Loading...</p>
	}

	if (!currentUserEmail) {
		return <p>Loading user information...</p>
	}

	const filteredCards = Object.entries(cards).filter(
		([userEmail]) => userEmail !== currentUserEmail
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
			console.log('Opening map modal for:', task.Location)
			setSelectedTask(task)
			setShowMapModal(true)
			setErrorMessage('')
		} else {
			setErrorMessage('Location coordinates not available for this task.')
		}
	}

	const deleteTask = async (userEmail, cardId) => {
		try {
			const res = await fetch(
				`https://fir-auth-44228-default-rtdb.firebaseio.com/${userEmail}/${cardId}.json`,
				{ method: 'DELETE' }
			)

			if (res.ok) {
				alert('Task deleted successfully!')

				setCards((prevCards) => {
					const updatedCards = { ...prevCards }
					delete updatedCards[userEmail][cardId]
					return updatedCards
				})
			} else {
				alert('Error deleting the task!')
			}
		} catch (error) {
			console.error('Error deleting task:', error)
		}
	}

	const closeMapModal = () => {
		setShowMapModal(false)
		setSelectedTask(null)
	}

	return (
		<div className="mainOthersTaskContainer">
			<button className="backButton" onClick={goBack}>
				Back
			</button>
			<h2 className="header">Other Users' Tasks</h2>
			<div className="taskList">
				{filteredCards.length === 0 ? (
					<p>No Tasks are Available</p>
				) : (
					filteredCards.map(([userEmail, userCards]) => (
						<div key={userEmail}>
							<h3 className="userEmail">
								{userEmail.replace(/@.*$/, '')}
							</h3>

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
										style={{
											cursor: 'pointer',
											color: '#3d5af1'
										}}
									>
										<FontAwesomeIcon
											icon={faMapMarkerAlt}
											className="locationIcon"
										/>
										&nbsp;
										<span
											onClick={(e) => {
												e.stopPropagation() // Prevent task card click
												openMapModal(card) // Open map modal
											}}
										>
											{card.Location}
										</span>
									</p>

									{/* <button
										className="deleteButton"
										onClick={(e) => {
											e.stopPropagation() // Prevent opening task modal when clicking delete
											deleteTask(userEmail, cardId)
										}}
									>
										<FontAwesomeIcon icon={faTrash} />
										Delete
									</button> */}
								</div>
							))}
						</div>
					))
				)}
			</div>

			{/* Modal for Task Details */}
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
		</div>
	)
}

export default OthersTaskList
