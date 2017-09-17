import { Element as PolymerElement } from '../../@polymer/polymer/polymer-element.js';
import '../../@polymer/paper-toggle-button/paper-toggle-button.js';

import { LeafletMap } from '../../@ggcity/leaflet-map/leaflet-map.js';
import { LeafletWMSGroup } from '../../@ggcity/leaflet-wms/leaflet-wms-group.js';
import { LeafletTileLayer } from '../../@ggcity/leaflet-tile-layer/leaflet-tile-layer.js';

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
          z-index: 1005;

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
          cursor: pointer;
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
          z-index: 1001;
          background-image: url('./aerial.png');
          border: 5px solid #ffffff;
          box-shadow: 0 8px 10px 1px rgba(0,0,0,0.14),0 3px 14px 2px rgba(0,0,0,0.12),0 5px 5px -3px rgba(0,0,0,0.3);
          cursor: pointer;
        }

        section#download-disclaimer {
          max-height: 400px;
          overflow: auto;
          text-align: justify;
        }
      </style>

      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">

      <main class="card">
        <header id="page-title" class="card-img-top d-flex align-items-end">
          <h1 class="h2">City of Garden Grove Public Maps</h1>
        </header>
        
        <!-- Search section -->
        <section id="search-section" class="input-group">
          <input type="text" name="search" id="search" class="form-control rounded-0" placeholder="Search address">
          <span class="input-group-btn rounded-0">
            <button class="btn btn-secondary rounded-0">
              <i class="fa fa-fw fa-search"></i>
            </button>
          </span>
        </section>

        <!-- List of available overlays -->
        <section id="overlays">
          <ul class="list-group">

            <template is="dom-repeat" items="{{mapsList}}">
              <li class="list-group-item">

                <!-- Main overlay toggle -->
                <div title="[[item.description]]" class$="[[_overlayItemClass(selectedOverlay, item)]]" on-click="overlaySelect">
                  <span>[[item.name]]</span>
                  <paper-toggle-button checked="[[_isCurrentOverlay(selectedOverlay, item)]]"></paper-toggle-button>
                </div>

                <div class$="[[_overlayLayersShow(selectedOverlay, item)]]">
                  <ul class="overlay-layers list-group list-group-flush">

                    <!-- Exclusive layers -->
                    <template is="dom-repeat" items="{{item.layers.exclusives}}" as="layer">
                      <li class="list-group-item d-flex justify-content-between" on-click="exclusiveSelect">
                        <span>
                          <a on-click="downloadLayer"><i class="fa fa-fw fa-download"></i></a>
                          [[layer.name]]
                        </span>
                        <paper-toggle-button class="overlay-layers-toggle" checked="[[_isCurrentExclusive(layer, wmsLayers)]]"></paper-toggle-button>
                      </li>
                    </template>
                    
                    <!-- Optional layers -->
                    <template is="dom-repeat" items="{{item.layers.optionals}}" as="layer">
                      <li class="list-group-item d-flex justify-content-between" on-click="optionalSelect">
                        <span>
                          <a on-click="downloadLayer"><i class="fa fa-fw fa-download"></i></a>
                          [[layer.name]]
                        </span>
                        <paper-toggle-button class="overlay-layers-toggle" checked="[[layer.visible]]"></paper-toggle-button>
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

      <!-- Basemap toggle button -->
      <button id="basemap-switcher" on-click="switchBasemap"></button>

      <leaflet-map
        map="{{map}}"
        latitude="33.778724"
        longitude="-117.960058"
        zoom="13"
        min-zoom="11"
        max-zoom="19"
        zoom-control="false"
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
      </leaflet-map>

      <!-- Download Modal -->
      <div class="modal fade" id="download-modal" tabindex="-1" role="dialog" aria-labelledby="download-modal-label" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title" id="download-modal-label">
                <span id="layer-name"></span>
              </h3>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <section style="height: 400px; overflow: auto; padding: 10px; background-color: #eee; font-size: 0.85rem;">
                <h5>Download Disclaimer</h5>
                
                <p>The City of Garden Grove provides the data as a public resource of general information for use "as is." The City of Garden Grove provides this information with the understanding that it is not guaranteed to be accurate, correct or complete and any conclusions drawn from such information are the sole responsibility of the user. Further, the City of Garden Grove makes no warranty, representation or guaranty as to the content, sequence, accuracy, timeliness or completeness of any of the spatial or database information provided herein. While every effort has been made to ensure the content, sequence, accuracy, timeliness or completeness of materials presented within these pages, the City of Garden Grove assumes no responsibility for errors or omissions, and explicitly disclaims any representations and warranties, including, without limitation, the implied warranties of merchantability and fitness for a particular purpose. The City of Garden Grove shall assume no liability for:</p>                
                <p>1.Any errors, omissions, or inaccuracies in the information provided, regardless of how caused; or 2.Any decision made or action taken or not taken by viewer in reliance upon any information or data furnished hereunder.</p>                
                <p>Availability of the City of Garden Grove GIS is not guaranteed. Applications, servers, and network connections may be unavailable at any time for maintenance or unscheduled outages. Outages may be of long duration. Users are cautioned to create dependencies on these services for critical needs.</p>
                <p>THE FOREGOING WARRANTY IS EXCLUSIVE AND IN LIEU OF ALL OTHER WARRANTIES OF MERCHANTABILITY, FITNESS FOR PARTICULAR PURPOSE AND/OR ANY OTHER TYPE WHETHER EXPRESSED OR IMPLIED. In no event shall The City of Garden Grove become liable to users of these data, or any other party, for any loss or direct, indirect, special, incidental or consequential damages, including, but not limited to, time, money or goodwill, arising from the use or modification of the data.</p>                
                <p>To assist The City of Garden Grove in the maintenance and/or correction of the data, users should provide the City of Garden Grove with information concerning errors or discrepancies found in using the data. Please acknowledge the City of Garden Grove as the source when data is used in the preparation of reports, papers, publications, maps, or other products.</p>
              </section>
            </div>
            <div class="modal-footer">
              <!--button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button-->
              <span id="download-buttons-label">Download as:</span>
              <a id="geojson-download" href="#" target="_blank" class="btn btn-link" aria-labelledby="download-buttons-label">
                <i class="fa fa-download"></i>GeoJSON
              </a>
              <a id="csv-download" href="#" target="_blank" class="btn btn-link" aria-labelledby="download-buttons-label">
                <i class="fa fa-download"></i>CSV
              </a>
              <a id="kml-download" href="#" target="_blank" class="btn btn-link" aria-labelledby="download-buttons-label">
                <i class="fa fa-download"></i>KML
              </a>
              <a id="shapefile-download" href="#" target="_blank" class="btn btn-link" aria-labelledby="download-buttons-label">
                <i class="fa fa-download"></i>Shapefile
              </a>
            </div>
          </div>
        </div>
      </div>`;
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
  
  // FIXE: Achtung! Uber hacky!!!
  switchBasemap(event) {
    let idx = ++this._selectedBasemap % 2;
    this.baseSource = this.baseMaps[idx].source;
    this.baseFormat = this.baseMaps[idx].format;
    this.baseLayers = this.baseMaps[idx].layers;

    if (idx === 1) {
      event.target.style.backgroundImage = "url(./vector.png)";
    } else {
      event.target.style.backgroundImage = "url(./aerial.png)";
    }
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

  // FIXME: this depends on wmsLayer to trigger re-evaluation :(
  // We should be using this.set instead
  _isCurrentExclusive(layer) {
    return layer.visible;
  }
  
  optionalSelect(event) {
    event.model.set('layer.visible', !event.model.layer.visible);
    this.wmsLayers = this._computeOverlaysList(this.selectedOverlay.layers);    
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

  downloadLayer(event) {
    event.stopPropagation();
    event.preventDefault();

    // if modal is not already found in light DOM, pull from shadow DOM
    let dom = (document.querySelector('#download-modal')) ? document : this.shadowRoot;

    let layer = event.model.layer;
    // FIXME: hardcoded url
    let downloadURL = `https://www.ci.garden-grove.ca.us/geoserver/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer.machineName}`;

    jQuery('#layer-name', dom).html(layer.name);
    jQuery('#geojson-download', dom).attr('href', downloadURL + '&outputFormat=application/json');
    jQuery('#csv-download', dom).attr('href', downloadURL + '&outputFormat=csv');
    jQuery('#kml-download', dom).attr('href', downloadURL + '&outputFormat=application/vnd.google-earth.kml+xml');
    jQuery('#shapefile-download', dom).attr('href', downloadURL + '&outputFormat=SHAPE-ZIP');    
    jQuery('#download-modal', dom).modal();
  }
}

customElements.define('leaflet-map-selector', LeafletMapSelector);
