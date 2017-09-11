import { Element as PolymerElement } from '../../@polymer/polymer/polymer-element.js';

import { LeafletMap } from '../../@ggcity/leaflet-map/leaflet-map.js';
import { LeafletWMSGroup } from '../../@ggcity/leaflet-wms/leaflet-wms-group.js';
import { LeafletTileLayer } from '../../@ggcity/leaflet-tile-layer/leaflet-tile-layer.js';

import { disableClickPropagation } from '../../leaflet/src/dom/DomEvent.js';

import { MDCPersistentDrawer, MDCPersistentDrawerFoundation, util } from '../../@material/drawer';
import {MDCRipple, MDCRippleFoundation} from '../../@material/ripple';
import '../../material-components-web/dist/material-components-web.min.css';

export class LeafletMapSelector extends PolymerElement {
  static get template() {
    return `
      <style>
        :host {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 900;
        }

        aside.mdc-persistent-drawer {
          height: 100%;
          z-index: 999;
          cursor: default;
        }

        aside, aside .mdc-persistent-drawer__drawer, aside .mdc-persistent-drawer--open {
          width: 300px;
        }

        .mdc-persistent-drawer__content {
          padding: 10px;
        }

        .mdc-card:not(:last-child) {
          margin-bottom: 15px;
        }

        .mdc-card__title {
          cursor: pointer;
        }

      </style>

      <aside id="leaflet-map-selector-drawer" class="mdc-persistent-drawer mdc-typography">
        <nav class="mdc-persistent-drawer__drawer">
          <header class="mdc-persistent-drawer__header">
            <div class="mdc-persistent-drawer__header-content">
              City of Garden Grove
            </div>
          </header>
          
          <div class="mdc-persistent-drawer__content">
            <template is="dom-repeat" items="{{mapsList}}">
              <div class="mdc-card">
                <section class="mdc-card__primary">
                  <h1 class="mdc-card__title mdc-card__title--large" on-click="handleMapSelect">[[item.name]]</h1>
                </section>
                <section class="mdc-card__supporting-text">[[item.description]]</section>
                <section class="mdc-card__actions">
                  <button class="mdc-button mdc-button--compact mdc-button__action">Download</button>
                  <div class="mdc-switch" style="display: inline">
                    <input type="checkbox" id="[[item.machineName]]" class="mdc-switch__native-control" />
                    <div class="mdc-switch__background">
                      <div class="mdc-switch__knob"></div>
                    </div>
                  </div>
                </section>
              </div>
            </template>
          </div>
          
        </nav>
      </aside>

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

    disableClickPropagation(this.$['leaflet-map-selector-drawer']);

    this.drawer = new MDCPersistentDrawer(this.shadowRoot.querySelector('.mdc-persistent-drawer'));
    this.drawer.open = true;

    // FIXME: hacky way to get ripple attached
    this.shadowRoot.addEventListener("dom-change", function(event){
      if (this._rippleInitialized) return;

      let rippleNodes = this.shadowRoot.querySelectorAll('.ripple');
      for (let i = 0; i < rippleNodes.length; i++) {
        new MDCRipple(rippleNodes[i]);
        this._rippleInitialized = true;
      }
    }.bind(this));

    // FIXME: hacky hardcoded initial view
    this.baseSource = this.baseMaps[0].source;
    this.baseFormat = this.baseMaps[0].format;
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
}

customElements.define('leaflet-map-selector', LeafletMapSelector);
