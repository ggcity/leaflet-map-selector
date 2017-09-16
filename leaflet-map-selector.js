import { Element as PolymerElement } from '../../@polymer/polymer/polymer-element.js';
import '../../@polymer/paper-toggle-button/paper-toggle-button.js';

import { LeafletMap } from '../../@ggcity/leaflet-map/leaflet-map.js';
import { LeafletWMSGroup } from '../../@ggcity/leaflet-wms/leaflet-wms-group.js';
import { LeafletTileLayer } from '../../@ggcity/leaflet-tile-layer/leaflet-tile-layer.js';

import { disableClickPropagation } from '../../leaflet/src/dom/DomEvent.js';

export class LeafletMapSelector extends PolymerElement {
  static get template() {
    return `
      <style>
        :host {
          font-family: 'Lato', sans-serif;
          --primary-color: #003d7d;
          --secondary-color: #ff4b5f;
        }

        main {
          position: absolute;
          left: 15px;
          top: 15px;
          bottom: 15px;
          width: 300px;
          z-index: 9999;

          background-color: #fff;
          box-shadow: 0 8px 10px 1px rgba(0,0,0,0.14),0 3px 14px 2px rgba(0,0,0,0.12),0 5px 5px -3px rgba(0,0,0,0.3);
        }

        header#page-title {
          padding: 10px;
          background-color: var(--primary-color);
          height: 150px;
        }

        header#page-title h1 {
          color: #fff;
          font-weight: 900;
        }

        section#overlays {
          overflow: auto;
          padding-bottom: 5px;
        }

        section#overlays > ul > li.list-group-item {
          padding: 0;
        }

        section#overlays .overlay-item {
          font-size: 1.1rem;
          padding: 0.75rem 1.25rem;
          color: #444;
        }

        section#overlays .overlay-item:hover {
          cursor: pointer;
          background-color: #eee;
        }

        section#overlays .overlay-item.selected {
          background-color: #eee;
          color: var(--primary-color);
          
          /* left border and offset text back */
          border-left: 0.25rem solid var(--primary-color);
          padding-left: 1rem;
        }

        ul.overlay-layers > li.list-group-item {
          border: 0;
          border-left: 0.25rem solid var(--primary-color);
          padding-left: 1rem;
          background-color: #fafafa;
        }

        ul.overlay-layers .overlay-layers-toggle {
          --primary-color: var(--secondary-color);
        }

        button#basemap-switcher {
          position: absolute;
          bottom: 30px;
          right: 30px;
          width: 160px;
          height: 90px;
          background-color: pink;
          z-index: 9000;
        }
      </style>

      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">

      <main class="card">
        <header id="page-title" class="card-img-top d-flex align-items-end">
          <h1 class="h2">City of Garden Grove Public Maps</h1>
        </header>
          
        <section id="search-section" class="input-group">
          <input type="text" name="search" id="search" class="form-control rounded-0" placeholder="Search address">
          <span class="input-group-btn rounded-0">
            <button class="btn btn-secondary rounded-0">
              <i class="fa fa-fw fa-search"></i>
            </button>
          </span>
        </section>

        <section id="overlays">
          <ul class="list-group">
            <template is="dom-repeat" items="{{mapsList}}">
              <li class="list-group-item">
                <div title="[[item.description]]" class$="[[_overlayItemClass(selectedOverlay, item)]]" on-click="overlaySelect">
                  <span>[[item.name]]</span>
                  <paper-toggle-button checked="[[_isCurrentOverlay(selectedOverlay, item)]]"></paper-toggle-button>
                </div>
                <div class$="[[_overlayLayersShow(selectedOverlay, item)]]">
                  <ul class="overlay-layers list-group list-group-flush">
                    <template is="dom-repeat" items="{{item.layers.exclusives}}" as="layer">
                      <li class="list-group-item d-flex justify-content-between" on-click="exclusiveSelect">
                        <span>
                          <i class="fa fa-fw fa-download"></i>
                          [[layer.name]]
                        </span>
                        <paper-toggle-button class="overlay-layers-toggle" checked="[[_isCurrentExclusive(layer, wmsLayers)]]"></paper-toggle-button>
                      </li>
                    </template>
                    <template is="dom-repeat" items="{{item.layers.optionals}}" as="layer">
                      <li class="list-group-item d-flex justify-content-between" on-click="optionalSelect">
                          <span>
                            <i class="fa fa-fw fa-download"></i>
                            [[layer.name]]
                          </span>
                          <paper-toggle-button class="overlay-layers-toggle" checked="[[_isCurrentOptional(layer, wmsLayer)]]"></paper-toggle-button>
                        </li>
                    </template>
                  </ul>
                </div>
              </li>
            </template>
          </ul>
        </section>
        
        <footer class="card-body">
          <a href="#" class="card-link">Help</a>
          <a href="#" class="card-link">Tour</a>
        </footer>
      </main>

      <button id="basemap-switcher" on-click="switchBasemap">
        Aerial Toggle
      </button>

      <leaflet-map
        map="{{map}}"
        latitude="33.778724"
        longitude="-117.960058"
        zoom="13"
        min-zoom="11"
        max-zoom="19"
        attribution-prefix="City of Garden Grove">

        <leaflet-tile-layer
          map="{{map}}"
          url="[[baseSource]]"
          format="[[baseFormat]]"
          layers="[[baseLayers]]"
          attribution="&copy; OpenStreetMap">
        </leaflet-tile-layer>

        <leaflet-wms-group
          map="{{map}}"
          source="[[wmsSource]]"
          layers="[[wmsLayers]]"
          transparent
          format="image/png">
        </leaflet-wms-group>      
      </leaflet-map>`;
  }

  static get properties() {
    return {
      map: {
        type: Object
      },
      baseSource: {
        type: String
      },
      baseFormat: {
        type: String
      },
      selectedOverlay: {
        type: Object,
        observer: '_overlayChanged'
      },
      wmsSource: {
        type: String,
        value: ''
      },
      wmsLayers: {
        type: Array,
        value: []
      },
      baseMaps: {
        type: Array,
        value: function () {
          return [
            {
              source: '//www.ci.garden-grove.ca.us/tileserver/styles/gg-basic/{z}/{x}/{y}.png',
              format: 'XYZ',
              attribution: '&copy; OpenStreetMap'
            },
            {
              source: '//www.ci.garden-grove.ca.us/geoserver/gwc/service/wms',
              format: 'WMS',
              layers: 'gis:2017_aerials'
            }
          ]
        }
      },
      mapsList: {
        type: Array,
        value: function () {
          return [
            {
              machineName: 'general',
              name: 'General Layers',
              description: 'Parcels, Fire Stations, Boundaries, etc',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: {
                optionals: [
                  {
                    machineName: 'gis:fd_stations',
                    name: 'Fire Stations',
                    visible: true
                  },
                  {
                    machineName: 'gis:city_parcels',
                    name: 'Parcels',
                    visible: true
                  },
                  {
                    machineName: 'gis:city_boundary',
                    name: 'OC City Boundaries',
                    visible: true
                  }
                ]
              },
              initialCenter: [33.778724, -117.960058]
            },
            { 
              machineName: 'political-districts',
              name: 'Political Districts',
              description: 'Council districts and State Senate / Congressional / Assembly districts',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: {
                alwaysOn: ['gis:city_boundary'],
                exclusives: [
                  {
                    machineName: 'gis:city_council_districts',
                    name: 'City Council Districts',
                    visible: true
                  },
                  {
                    machineName: 'gis:ca_senate_districts',
                    name: 'State Senate Districts'
                  },
                  {
                    machineName: 'gis:ca_assembly_districts',
                    name: 'State Assembly Districts'
                  },
                  {
                    machineName: 'gis:ca_congress_districts',
                    name: 'State Congressional Districts'
                  }
                ]
              },
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            },
            {
              machineName: 'trash-pickup',
              name: 'Trash Pickup',
              description: 'Find your trash pickup day',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: {
                alwaysOn: ['gis:city_boundary'],
                exclusives: [
                  {
                    machineName: 'gis:pw_trash_pickup',
                    name: 'Trash Pickup Schedule',
                    visible: true
                  }
                ]
              },
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            },
            {
              machineName: 'street-sweeping',
              name: 'Street Sweeping',
              description: 'Avoid tickets and park with confidence',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: {
                alwaysOn: ['gis:city_boundary'],
                exclusives: [
                  {
                    machineName: 'gis:pw_street_sweeping',
                    name: 'Street Sweeping Schedule',
                    visible: true
                  }
                ]
              },
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            },
            {
              machineName: 'flood-layers',
              name: 'Flood Layers',
              description: 'FEMA Flood Hazard Areas',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: {
                alwaysOn: ['gis:city_boundary'],
                optionals: [
                  {
                    machineName: 'gis:flood_loma',
                    name: 'FEMA Excluded Properties',
                    visible: true
                  },
                  {
                    machineName: 'gis:flood_hazard_area',
                    name: 'FEMA Flood Hazard Areas',
                    visible: true
                  }
                ]
              }
            },
            {
              machineName: 'community-development',
              name: 'Community Development',
              description: 'Code Enforcement, CDBG, Redevelopment, etc',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: {
                alwaysOn: ['gis:city_boundary'],
                exclusives: [
                  {
                    machineName: 'gis:code_enf_officer_coverage',
                    name: 'Code Enforcement Coverage',
                    visible: true
                  },
                  {
                    machineName: 'gis:city_owned_parcels',
                    name: 'City Owned Parcels'
                  },
                  {
                    machineName: 'gis:redev',
                    name: 'Redevelopment Zones'
                  },
                  {
                    machineName: 'gis:cdbg',
                    name: 'CDBG'
                  }
                ]
              },
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            }
          ]
        }
      }
    }
  }

  constructor() {
    super();

    this._alwaysOnOverlays = [];
    this._exclusiveOverlay = null;
    this._optionalOverlays = [];
  }

  connectedCallback() {
    super.connectedCallback();

    // FIXME: hacky hardcoded initial view
    this._selectedBasemap = 0;
    this.baseSource = this.baseMaps[0].source;
    this.baseFormat = this.baseMaps[0].format;
    this.baseLayers = this.baseMaps[0].layers;

    this.overlaySelect();
  }
  
  switchBasemap() {
    let idx = ++this._selectedBasemap % 2;
    this.baseSource = this.baseMaps[idx].source;
    this.baseFormat = this.baseMaps[idx].format;
    this.baseLayers = this.baseMaps[idx].layers;
  }

  overlaySelect(event) {
    this.selectedOverlay = (event) ? event.model.item : this.mapsList[0];

    if (this.selectedOverlay.resetViewOnSelect) {
      this.map.flyTo(this.selectedOverlay.initialCenter, this.selectedOverlay.initialZoom);
    }
  }
  // FIXME: what if you were in other overlay and select another overlay's layer?
  exclusiveSelect(event) {
    // First save the current state
    let currVisible = event.model.layer.visible;
    // Then turn all layers off
    this.selectedOverlay.layers.exclusives.forEach(e => e.visible = false);
    // Compute toggle on original state
    event.model.layer.visible = !currVisible;

    // Refresh layers list
    this.wmsLayers = this._computeOverlaysList(this.selectedOverlay.layers);
  }

  _isCurrentExclusive(layer) {
    return layer.visible;
  }
  
  optionalSelect(event) {
    event.model.layer.visible = !event.model.layer.visible;
    this.wmsLayers = this._computeOverlaysList(this.selectedOverlay.layers);    
  }

  _isCurrentOptional(layer) {
    return layer.visible;
  }

  _overlayChanged(newOverlay) {
    let layers = newOverlay.layers;

    // Update wms-group
    this.wmsSource = newOverlay.source;
    this.wmsLayers = this._computeOverlaysList(layers);
  }

  _computeOverlaysList(layers) {
    let result = [];

    // first tack on alwaysOn layers by default
    if (layers.alwaysOn) {
      result.push(...layers.alwaysOn.reverse());
    }

    // now tack on the ONE exclusive
    if (layers.exclusives) {
      let e = layers.exclusives.find(l => l.visible);
      // select the first exclusive layer, if can't find above
      if (e) result.push(e.machineName);
    }

    // then the rest of the optionals
    // machineName of all visible optional layers
    if (layers.optionals) {
      result.push(
        ...layers.optionals
        .filter(l => l.visible)
        .map(l => l.machineName)
        .reverse()
      );
    }

    return result;
  }

  _isCurrentOverlay(selected, item) {
    return selected === item;
  }

  _overlayLayersShow(selected, item) {
    if (selected === item) return "collapse show";
    return "collapse";
  }

  _overlayItemClass(selected, item) {
    let defaultClass = "overlay-item d-flex justify-content-between";
    if (selected === item) return defaultClass + ' selected';
    return defaultClass;
  }
}

customElements.define('leaflet-map-selector', LeafletMapSelector);
