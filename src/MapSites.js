import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp';

import * as dataLocations from './sites.json';

class MapSites extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: '',
            filteredLocations: dataLocations,
            filteredMarkers: [],
            currentMarker: {},
            listIsOpen: true
        };
    }

    componentDidMount() {
        // Set the filteredMarkers state to the value of the props
        this.setState({
            filteredMarkers: this.props.markers
        });
    }

    updateQuery = (query) => {
		// Update visible query
		// manage  sync of different state arrays       
        this.setState({
            query,
            listIsOpen: true
        });

        // display list 
        if (query === '') {
            this.setState({
                listIsOpen: false
            });
        }
        this.handleDisplayedLocations(query);
    }

    toggleListVisibility = () => {
        this.setState((prevState) => ({
            listIsOpen: !(prevState.listIsOpen)
        }));
    }

    handleDisplayedLocations = (query) => {
        // Manage locations sync
        let controlledThis = this;
        let filtLocations;
        let filtMarkers;        
        
        if (query) {
            const match = new RegExp(escapeRegExp(query), 'i');
            
            // Add location to array if title matches query
            filtLocations = this.props.locationsList.filter(location =>
                match.test(location.title)
            );
            
            // Add marker to array if title matches query 
            filtMarkers = this.props.markers.filter(marker =>
                match.test(marker.title)
            );

            this.setState({
                filteredLocations: filtLocations,
                filteredMarkers: filtMarkers            
            });
        } else {
            this.setState({
                filteredLocations: this.props.locationsList,
                filteredMarkers: this.props.markers            
            });        
        }

        // Display the markers on the map accordingly to the state 
        this.props.markers.map(marker => marker.setVisible(false));
        setTimeout(function () {
            controlledThis.props.markers.map(marker =>
                controlledThis.handleMarkersVisibility(marker))
        }, 1)
    }

    handleMarkersVisibility = (marker) => {
        // Make matching markers visible
        this.state.filteredMarkers.map(filteredMarker =>
            filteredMarker.id === marker.id && marker.setVisible(true)
        )       
    }

    manageClickedMarker = (location) => {
		// Manage marker animation on list item click
        let controlledThis = this;

        this.removeAnimationMarker();
        this.addAnimationMarker(location);
        setTimeout(function () {
            controlledThis.removeAnimationMarker()
        }, 1250);

        // Get current marker & open info window
        this.getCurrentMarker(location);
        setTimeout(function () {
            controlledThis.props.openInfoWindow(
                controlledThis.state.currentMarker
            );
        }, 1)    
    }

    removeAnimationMarker = () => {
        // Remove all animations
        this.state.filteredMarkers.map(filteredMarker =>
            filteredMarker.setAnimation(null)
        )
    }

    addAnimationMarker = (location) => {
        // Add animation to the active marker 
        this.state.filteredMarkers.map(filteredMarker =>
            filteredMarker.id === location.key &&
            filteredMarker.setAnimation(
                window.google.maps.Animation.BOUNCE)
        );
    }

    getCurrentMarker = (location) => {
		// Get clicked marker to give info in the InfoWindow
        this.state.filteredMarkers.map(filteredMarker =>
            filteredMarker.id === location.key &&
            this.setState({
                currentMarker: filteredMarker
            })
        );
    }

    render() {
        const { query, filteredLocations, listIsOpen } = this.state;

        return (
            <section className="list-box">
                <form
                    className="list-form"
                    onSubmit={(event) => event.preventDefault()}
                >
                    <button
                        className="list-btn"
                        onClick={() => this.toggleListVisibility()}
                    >
                        List
					</button>

                    <input
                        className="list-input"
                        aria-labelledby="filter"
                        type="text"
                        role="search"
                        placeholder="Filter Sites..."
                        value={query}
                        onChange={(event) =>
                            this.updateQuery(event.target.value)}
                    />
                </form>

                {
                    listIsOpen &&
                    <ul className="locations-list">                    
                    {
                        filteredLocations.map(location => (
                              <li
                               tabIndex={0}
                                role="button"
                                className="location-item"
                                key={location.key}
                                onClick={() =>
                                this.manageClickedMarker(location)}
                                onKeyPress={() =>
                                 this.manageClickedMarker(location)}                       
                                 >
                                {location.title}
                            </li>
                        ))
                    }
                </ul>
                }
            </section>
        );
    }
}

export default MapSites;