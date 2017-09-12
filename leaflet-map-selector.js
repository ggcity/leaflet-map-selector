import { Element as PolymerElement } from '../../@polymer/polymer/polymer-element.js';

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
        }

        main {
          position: absolute;
          left: 15px;
          top: 15px;
          bottom: 15px;
          width: 300px;
          z-index: 9999;

          background-color: #fff;
        }

        header#page-title {
          padding: 10px;
          background-color: #007bff;
          height: 150px;
        }

        header#page-title h1 {
          color: #fff;
          font-weight: 900;
        }

        section#maps {
          overflow: auto;
          padding-bottom: 5px;
        }

        button#basemap-switcher {
          position: absolute;
          bottom: 15px;
          right: 15px;
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
            <button class="btn btn-secondary rounded-0">Go!</button>
          </span>
        </section>

        <section id="maps">
          <ul class="list-group list-group-flush">
            <template is="dom-repeat" items="{{mapsList}}">
              <li class="list-group-item">
                <a href="#[[item.machineName]]" data-toggle="collapse" on-click="handleMapSelect">
                  [[item.name]]
                </a>
                <div id="[[item.machineName]]" class="collapse">
                  <ul>
                    <template is="dom-repeat" items="{{item.layers}}" as="layer">
                      <li>[[layer]]</li>
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

      <!--ul id="slide-out" class="side-nav fixed side-bar">
        <li>
          <h1 class="title">City of Garden Grove Public Maps</h1>
        </li>
        <li>
          <div class="card">
            <input type="text">
          </div>
        </li>
        <li>
          <ul class="collapsible" data-collapsible="accordion">
            <template is="dom-repeat" items="{{mapsList}}">
              <li>
                <div class="collapsible-header" on-click="handleMapSelect">
                  [[item.name]]
                  <input type="radio" name="foo" id="[[item.machineName]]">
                  <label for="[[item.machineName]]"></label>
                </div>
                <div class="collapsible-body">
                  <ul>
                    <template is="dom-repeat" items="{{item.layers}}" as="layer">
                      <li><a href="#">[[layer]]</a></li>
                    </template>
                  </ul>
                </div>
              </li>
            </template>
          </ul>
        </li>
      </ul-->

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
          source="[[overlaySource]]"
          layers="[[overlayLayers]]"
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
      overlaySource: {
        type: String,
        value: ''
      },
      overlayLayers: {
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
              machineName: 'political-districts',
              name: 'Political Districts',
              description: 'Council districts and State Senate / Congressional / Assembly districts',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: ['gis:city_council_districts', 'gis:city_boundary'],
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            },
            {
              machineName: 'trash-pickup',
              name: 'Trash Pickup',
              description: 'Find your trash pickup day',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: ['gis:pw_trash_pickup', 'gis:city_boundary'],
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            },
            {
              machineName: 'street-sweeping',
              name: 'Street Sweeping',
              description: 'Avoid tickets and park with confidence',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: ['gis:pw_street_sweeping', 'gis:city_boundary'],
              initialCenter: [33.778724, -117.960058],
              initialZoom: 13,
              resetViewOnSelect: true
            },
            {
              machineName: 'flood-layers',
              name: 'Flood Layers',
              description: 'FEMA Flood Hazard Areas',
              source: '//www.ci.garden-grove.ca.us/geoserver/gis/wms',
              layers: ['gis:flood_hazard_area','gis:flood_loma', 'gis:city_boundary']
            }
          ]
        }
      }
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    // this.drawer = new MDCPersistentDrawer(this.shadowRoot.querySelector('.mdc-persistent-drawer'));
    // this.drawer.open = true;

    // // FIXME: hacky way to get ripple attached
    // this.shadowRoot.addEventListener("dom-change", function(event){
    //   if (this._rippleInitialized) return;

    //   let rippleNodes = this.shadowRoot.querySelectorAll('.ripple');
    //   for (let i = 0; i < rippleNodes.length; i++) {
    //     new MDCRipple(rippleNodes[i]);
    //     this._rippleInitialized = true;
    //   }
    // }.bind(this));

    // FIXME: hacky hardcoded initial view
    this._selectedBasemap = 0;
    this.baseSource = this.baseMaps[0].source;
    this.baseFormat = this.baseMaps[0].format;
    this.baseLayers = this.baseMaps[0].layers;
    this.overlaySource = this.mapsList[0].source;
    this.overlayLayers = this.mapsList[0].layers;
  }

  handleMapSelect(event) {
    let selectedMap = event.model.item;
    this.overlaySource = selectedMap.source;
    this.overlayLayers = selectedMap.layers;

    if (selectedMap.resetViewOnSelect) {
      this.map.flyTo(selectedMap.initialCenter, selectedMap.initialZoom);
    }
  }

  switchBasemap() {
    let idx = ++this._selectedBasemap % 2;
    this.baseSource = this.baseMaps[idx].source;
    this.baseFormat = this.baseMaps[idx].format;
    this.baseLayers = this.baseMaps[idx].layers;
  }
}

customElements.define('leaflet-map-selector', LeafletMapSelector);
