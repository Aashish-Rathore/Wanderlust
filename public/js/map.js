
  
	mapboxgl.accessToken = Token;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style:'mapbox://styles/mapbox/streets-v12', // stylesheet URL
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 ,// starting zoom
    });
    const marker = new mapboxgl.Marker({ color:"Red"})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset:25}).setHTML(
        `<h4>${listing.location}<p>Exact location will be provided after booking!</p></h4>`
    )
  )
    .addTo(map);

