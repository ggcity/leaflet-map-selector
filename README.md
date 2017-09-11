# \<leaflet-map-selector\>

UI for selecting groups of map overlays. Requires Polymer 3.x.

Installation
------------

This currently comes in as pure ES6 only.

    $ yarn add @ggcity/leaflet-map-selector

Usage
-----

```html
<script type="module" src="./node_modules/@ggcity/leaflet-map/leaflet-map.js"></script>
<script type="module" src="./node_modules/@ggcity/leaflet-tile-layer/leaflet-tile-layer.js"></script>
<script type="module" src="./node_modules/@ggcity/leaflet-wms/leaflet-wms-group.js"></script>

<leaflet-map
  latitude="33.778724"
  longitude="-117.960058"
  zoom="13"
  min-zoom="11"
  max-zoom="19"
  attribution-prefix="City of Garden Grove">

  <leaflet-tile-layer
    base
    url="//www.ci.garden-grove.ca.us/tileserver/styles/gg-basic/{z}/{x}/{y}.png"
    attribution="&copy; OpenStreetMap">
  </leaflet-tile-layer>

  <leaflet-wms-group
    source="//www.ci.garden-grove.ca.us/geoserver/gis/wms"
    layers='["gis:city_council_districts", "gis:flood_hazard_area"]'
    transparent
    format="image/png">
  </leaflet-wms-group>

</leaflet-map>
```

Maintainers
-----------

* Rachot Moragraan ([mooman](https://github.com/mooman)) - moo@ci.garden-grove.ca.us

License
-------

    Copyright (C) 2017 City of Garden Grove

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.