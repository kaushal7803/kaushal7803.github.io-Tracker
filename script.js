let watchId;
let totalDistance = 0;
let lastPosition = null;
const distanceThreshold = 5; // Ignore movements less than 5 meters

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

    console.log('Current Position:', currentPosition);

    if (lastPosition) {
        const distance = calculateDistance(lastPosition, currentPosition);
        if (distance >= distanceThreshold) {
            totalDistance += distance;
            updateTotalDistanceDisplay();

            // Save the total distance to localStorage
            localStorage.setItem('totalDistance', totalDistance);
            lastPosition = currentPosition;
        } else {
            console.log('Ignored small movement:', distance, 'meters');
        }
    } else {
        lastPosition = currentPosition;
    }
}

function updateTotalDistanceDisplay() {
    let displayDistance;
    if (totalDistance < 1000) {
        displayDistance = totalDistance.toFixed(0) + ' meters';
    } else {
        displayDistance = (totalDistance / 1000).toFixed(2) + ' km';
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

document.getElementById('resetTracking').addEventListener('click', () => {
    totalDistance = 0;
    lastPosition = null;
    localStorage.removeItem('totalDistance');
    updateTotalDistanceDisplay();
});
