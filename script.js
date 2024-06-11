let watchId;
let totalDistance = 0;
let lastPosition = null;

// Load total distance from localStorage
if (localStorage.getItem('totalDistance')) {
    totalDistance = parseFloat(localStorage.getItem('totalDistance'));
    updateTotalDistanceDisplay();
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function calculateDistance(pos1, pos2) {
    const R = 6371; // Radius of the Earth in km
    const lat1 = toRadians(pos1.latitude);
    const lon1 = toRadians(pos1.longitude);
    const lat2 = toRadians(pos2.latitude);
    const lon2 = toRadians(pos2.longitude);

    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlon / 2) * Math.sin(dlon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c * 1000; // Distance in meters
}

function updatePosition(position) {
    const currentPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
    };

    if (lastPosition) {
        const distance = calculateDistance(lastPosition, currentPosition);
        totalDistance += distance;
        updateTotalDistanceDisplay();

        // Save the total distance to localStorage
        localStorage.setItem('totalDistance', totalDistance);
    }

    lastPosition = currentPosition;
}

function updateTotalDistanceDisplay() {
    let displayDistance;
    if (totalDistance < 1) {
        displayDistance = (totalDistance * 1000).toFixed(0) + ' meters';
    } else {
        displayDistance = totalDistance.toFixed(2) + ' km';
    }
    document.getElementById('totalDistance').innerText = displayDistance;
}

document.getElementById('startTracking').addEventListener('click', () => {
    if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(updatePosition, (error) => {
            console.error(error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
        });
        document.getElementById('startTracking').setAttribute('disabled', 'disabled');
        document.getElementById('stopTracking').removeAttribute('disabled');
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

document.getElementById('stopTracking').addEventListener('click', () => {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        document.getElementById('startTracking').removeAttribute('disabled');
        document.getElementById('stopTracking').setAttribute('disabled', 'disabled');
    }
});
