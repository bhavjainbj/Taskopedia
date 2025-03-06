import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from './Firebase'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import opencage from 'opencage-api-client'
import L from 'leaflet'
import markerIconPng from 'leaflet/dist/images/marker-icon.png'
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png'
import '../Styles/CreateTask.css'

const CreateTask = () => {
	const navigate = useNavigate()
	const [user, setUser] = useState({
		Title: '',
		Description: '',
		Location: ''
	})

	const [coords, setCoords] = useState(null)
	const [address, setAddress] = useState('')
	const [suggestions, setSuggestions] = useState([])
	const [loading, setLoading] = useState(false)

	const handleData = async (e) => {
		const { name, value } = e.target
		setUser({ ...user, [name]: value })

		if (name === 'Location') {
			fetchSuggestions(value)

			// Check if the input matches one of the suggestions to auto-fill
			const response = await opencage.geocode({
				q: value,
				key: '858d2510c8244e8cbbde28b3b8783b58'
			})
			const results = response.results || []
			if (results.length > 0) {
				const { lat, lng } = results[0].geometry
				setCoords({ lat, lng })
				setAddress(results[0].formatted)
			}
		}
	}

	const fetchSuggestions = async (query) => {
		if (query.length < 3) {
			setSuggestions([])
			return
		}
		setLoading(true)
		try {
			const response = await opencage.geocode({
				q: query,
				key: '858d2510c8244e8cbbde28b3b8783b58'
			})
			const results = response.results || []
			setSuggestions(
				results.map((result) => ({
					label: result.formatted,
					lat: result.geometry.lat,
					lng: result.geometry.lng
				}))
			)
		} catch (error) {
			console.error('Error fetching suggestions:', error)
		}
		setLoading(false)
	}

	const handleSuggestionClick = (suggestion) => {
		setUser({ ...user, Location: suggestion.label })
		setCoords({ lat: suggestion.lat, lng: suggestion.lng })
		setAddress(suggestion.label)
		setSuggestions([])
	}

	const createData = async (e) => {
		e.preventDefault()
		const { Title, Description, Location } = user

		if (!Title || !Description || !Location || !coords) {
			if (!Title) alert("Title can't be null")
			if (!Description) alert("Description can't be null")
			if (!Location) alert("Location can't be null")
			if (!coords) alert('Coordinates are required for the location')
			return
		}

		const currentUser = auth.currentUser
		if (!currentUser) {
			alert('User not authenticated')
			navigate('/login')
			return
		}

		const email = currentUser.email
		const userName = email.replace(/[.#$[\]]/g, '')

		const options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				Title,
				Description,
				Location,
				lat: coords.lat,
				lng: coords.lng
			}) // Include lat/lng
		}

		try {
			const res = await fetch(
				`https://fir-auth-44228-default-rtdb.firebaseio.com/${userName}.json`,
				options
			)
			if (res.ok) {
				alert('Data Stored Successfully!!')
				setUser({ Title: '', Description: '', Location: '' })
				setCoords(null)
				setAddress('')
				navigate('/home')
			} else {
				alert('Error Occurred!!')
			}
		} catch (error) {
			console.error(error)
			alert('Error Occurred!!')
		}
	}

	const goBack = () => {
		navigate('/home')
	}

	const handleMapClick = async (e) => {
		const { lat, lng } = e.latlng
		setCoords(e.latlng)

		try {
			console.log(`Fetching address for coordinates: ${lat}, ${lng}`)
			const response = await opencage.geocode({
				q: `${lat},${lng}`,
				key: '858d2510c8244e8cbbde28b3b8783b58'
			})

			if (response.results && response.results.length > 0) {
				const place = response.results[0].formatted
				setAddress(place)
				setUser({ ...user, Location: place })
			} else {
				setAddress('Unknown location')
			}
		} catch (error) {
			console.error('Error fetching address:', error)
			setAddress('Error fetching location')
		}
	}

	const markerIcon = new L.Icon({
		iconUrl: markerIconPng,
		shadowUrl: markerShadowPng,
		iconSize: [25, 41], // size of the icon
		iconAnchor: [12, 41], // point of the icon which will correspond to marker's location
		popupAnchor: [1, -34], // point from which the popup should open relative to the iconAnchor
		shadowSize: [41, 41] // size of the shadow
	})

	const MapFocus = ({ coords }) => {
		const map = useMap()

		if (coords) {
			map.setView([coords.lat, coords.lng], map.getZoom())
		}

		return null
	}

	return (
		<div className="mainCreateTaskComponent">
			<div className="CreateTaskBackButton">
				<button onClick={goBack}>Back</button>
			</div>
			<div className="inputArea">
				<input
					className="titleInput"
					type="text"
					name="Title"
					value={user.Title}
					placeholder="Title"
					onChange={handleData}
					required
				/>
				<textarea
					className="descriptionInput"
					value={user.Description}
					name="Description"
					placeholder="Description"
					onChange={handleData}
					required
				/>
				<input
					className="locationInput"
					type="text"
					name="Location"
					value={user.Location}
					placeholder="Location"
					onChange={handleData}
					required
				/>
				{loading && <p>Loading...</p>}
				{suggestions.length > 0 && (
					<ul className="suggestions">
						{suggestions.map((suggestion, index) => (
							<li
								key={index}
								onClick={() =>
									handleSuggestionClick(suggestion)
								}
							>
								{suggestion.label}
							</li>
						))}
					</ul>
				)}
				<button className="createDataBtn" onClick={createData}>
					Create Card
				</button>
			</div>

			{coords && (
				<MapContainer
					className="mapContainer"
					center={[coords.lat, coords.lng]}
					zoom={13}
					onClick={handleMapClick}
				>
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
					/>
					{coords && (
						<>
							<Marker
								position={[coords.lat, coords.lng]}
								icon={markerIcon}
							>
								<Popup>{address}</Popup>
							</Marker>
							<MapFocus coords={coords} />
						</>
					)}
				</MapContainer>
			)}

			{coords && (
				<p>
					Selected Coordinates: {coords.lat}, {coords.lng}
					<br />
					Address: {address}
				</p>
			)}
		</div>
	)
}

export default CreateTask
