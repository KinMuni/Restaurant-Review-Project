import React, { Component } from 'react';
import fetchJsonp from 'fetch-jsonp';
import * as dataLocations from './sites.json';
import MapSites from './MapSites';
import InfoWindow from './InfoWindow';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: dataLocations,
      map: '',
      infoWindow: '',
      markers: [],
      infoWindowIsOpen: false,
      currentMarker: {},
      infoContent: ''    
    };
  }


  componentDidMount() {
    window.initMap = this.initMap;
    window.map_load_error = this.map_load_error;
    loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyBRighaev67TiLGLlHkZ6YrEKCXwMyRDwA&callback=initMap');
  }

  map_load_error() {
    window.alert("Google Maps error!")
  }

  initMap = () => {
    let controlledThis = this;
    const { locations, markers } = this.state;

    //  Define map
    let map = new window.google.maps.Map(document.getElementById('map'), {
      zoom: 11,
      center: 
      { 
        lat:38.1543, 
        lng:-84.5355}
    });

    // Synchronization
    this.setState({
      map
    });

       // Read https://developers.google.com/maps/documentation/javascript/custom-markers

    // Create marker for each location in Locations.json file 
    for (let i = 0; i < locations.length; i++) {
      // Define the values of the properties
      let position = locations[i].position;
      let title = locations[i].title;
      let id = locations[i].key

      // Create the marker 
      let marker = new window.google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: window.google.maps.Animation.DROP,
        id: id
      });

      // push markers into the state
      markers.push(marker);

      // Open infoWindow on click
      marker.addListener('click', function () {
        controlledThis.openInfoWindow(marker);
      });
    }
    // listener to close infoWindow on click on map body
    map.addListener('click', function () {
      controlledThis.closeInfoWindow();
    });
  }

  openInfoWindow = (marker) => {
    this.setState({
      infoWindowIsOpen: true,
      currentMarker: marker    
    });

    this.getInfos(marker);
  }

  closeInfoWindow = () => {
    this.setState({
      infoWindowIsOpen: false,
      currentMarker: {}
    });
  }

  getInfos = (marker) => {
    let controlledThis = this;
    // Get URL
    let locat = marker.title;
    let srcUrl = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles='+ locat;
    srcUrl = srcUrl.replace(/ /g, '%20');

   
    fetchJsonp(srcUrl)
      .then(function (response) {
        return response.json();
      }).then(function (data) {
        // Get response content
        let pages = data.query.pages;
        let pageId = Object.keys(data.query.pages)[0];
        let pageContent = pages[pageId].extract;

        // Get content into state
        controlledThis.setState({
          infoContent: pageContent
        });
      }).catch(function (error) {
        let pageError = 'Parsing failed ' + error;
        controlledThis.setState({
          infoContent: pageError
        });      
      });
  }
  
  render() {
    return (
      <div className="App">
        <MapSites
          locationsList={this.state.locations}
          markers={this.state.markers}
          openInfoWindow={this.openInfoWindow}
        />   

        {
          this.state.infoWindowIsOpen &&
          <InfoWindow
            currentMarker={this.state.currentMarker}
            infoContent={this.state.infoContent}
          />        
          }    
         
        <div id="map" role="application"></div>
      </div>
    );
  }
}

export default App;

function loadJS(src) {
  let ref = window.document.getElementsByTagName('script')[0];
  let script = window.document.createElement('script');

  script.src = src;
  script.async = true;
  ref.parentNode.insertBefore(script, ref);

  script.onerror = function () {
    document.write('Load error: Google Maps')
  };
}