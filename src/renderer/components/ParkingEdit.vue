<template>
  <div v-if="parking">
    <!--
          airlineCodes: 0
          heading: 341.34
          index: 13
          lat: "N59 52.610885"
          lon: "W1 17.855144"
          name: "Western_Apron_Hanger"
          pushBackRoute: 27
          radius: 18
          type: "gate"
    -->
    <el-row>
      <el-col :span="4">
        <span class="label">Name :</span>
      </el-col>
      <el-col :span="8">
        <el-input placeholder="Name" v-model="name" :disabled="!editing"></el-input>
      </el-col>
      <el-col :span="5">
        <span class="label">Number :</span>
      </el-col>
      <el-col :span="7">
        <el-input placeholder="Number" v-model="number" :disabled="!editing"></el-input>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Size :</span>
      </el-col>
      <el-col :span="17">
        <!--
          * Cat Models                   FG Radii N2M Radii
          * B Small Regionals ERJ CRJ ATR    14       6
          * C A319 A320 A321 B737            18      10
          * D B757, B767                     26      15
          * E B777 B787 A330 A340 A360       33      24
          * F A380                           40      24
        -->

        <el-radio-group v-model="wingspan" :disabled="!editing">
          <el-tooltip content="PIPER PA-31/CESSNA 404 Titan" placement="top" effect="light">
            <el-radio :label="15">A (7.5)</el-radio>
          </el-tooltip>
          <el-tooltip
            content="Beech 200 / Cessna 425"
            placement="top"
            effect="light"
          >
          <el-radio :label="20">- (10)</el-radio>
          </el-tooltip>
          <el-tooltip
            content="BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6"
            placement="top"
            effect="light"
          >
          <el-radio :label="28">B (14)</el-radio>
          </el-tooltip>
          <el-tooltip
            content="BOEING 737-700/AIRBUS A-320/EMBRAER ERJ 190-100"
            placement="top"
            effect="light"
          >
            <el-radio :label="36">C (18)</el-radio>
          </el-tooltip>
          <el-tooltip content="B767 Series/AIRBUS A-310" placement="top" effect="light">
            <el-radio :label="52">D (26)</el-radio>
          </el-tooltip>
          <el-tooltip content="B777 Series/B787 Series/A330 Family" placement="top" effect="light">
            <el-radio :label="66">E (33)</el-radio>
          </el-tooltip>
          <el-tooltip content="BOEING 747-8/AIRBUS A-380-800" placement="top" effect="light">
            <el-radio :label="80">F (40)</el-radio>
          </el-tooltip>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Aircraft :</span>
      </el-col>
      <el-col :span="17">{{type}}</el-col>
    </el-row>
    <el-row v-if="editing"> 
      <el-col :span="7">
        <span class="label">Calculate :</span>
      </el-col>
      <el-col :span="17">
        <el-radio-group v-model="calculate" size="small">
          <el-radio-button label="Nose Wheel"></el-radio-button>
          <el-radio-button label="Center"></el-radio-button>
        </el-radio-group>

      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Coordinates :</span>
      </el-col>
      <el-col :span="17">
        <el-popover
          placement="top-start"
          title="E-Mail"
          width="200"
          trigger="hover"
          content="D.DDD, DMS, DM supported"
          :disabled="!editing || calculate === 'Center'"
        >
          <el-input placeholder="Please input" v-model="coordinates" slot="reference" :disabled="!editing || calculate ==='Center'"></el-input>
        </el-popover>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Nosewheel Coordinates :</span>
      </el-col>
      <el-col :span="17">
        <el-popover
          placement="top-start"
          title="E-Mail"
          width="200"
          trigger="hover"
          content="D.DDD, DMS, DM supported"
          :disabled="!editing || calculate === 'Nose Wheel'"
        >
          <el-input placeholder="Please input" v-model="noseCoordinates" slot="reference" :disabled="!editing || calculate === 'Nose Wheel'"></el-input>
        </el-popover>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Heading :</span>
      </el-col>
      <el-col :span="17">
        <el-input-number
          v-model="heading"
          :min="-361"
          :max="720"
          :step="0.1"
          :precision="1"
          :disabled="!editing || calculate ==='Heading'"
        ></el-input-number>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Parking Type :</span>
      </el-col>
      <el-col :span="17">
        <el-select v-model="parking_type" placeholder="Select" :disabled="!editing">
          <el-option
            v-for="type in options"
            :key="type.value"
            :label="type.label"
            :value="type.value"
            :disabled="type.disabled"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Airline :</span>
      </el-col>
      <el-col :span="17">
        <el-select v-model="airlineCodes" multiple placeholder="Select" :disabled="!editing">
          <el-option
            v-for="item in airlines"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="7">
        <span class="label">Pushback Route End :</span>
      </el-col>
      <el-col :span="17">{{pushbackEnd}}</el-col>
    </el-row>
  </div>
</template>

<script lang="js">
/* eslint-disable */
  const convert = require('geo-coordinates-parser');
  
  const turf = require('@turf/turf');

  const turfOptions = { units: 'kilometers' };

  export default {
    methods: {
      show (idx) {
        this.$parent.$parent.$parent.$refs.editLayer.show(idx)
      },
      normalizeAngle( angle ) {
        if(angle >= 180) {
            return angle - 360;
        }
        if(angle <= -180) {
          return angle + 360;
        }
        return angle;
      },
      latToTurf (turfPoint) {
        return [turfPoint.decimalLongitude, turfPoint.decimalLatitude];
      },
      turfToLatLng: function (turfPoint) {
          return '' + turfPoint.geometry.coordinates[1].toFixed(6) + ',' + turfPoint.geometry.coordinates[0].toFixed(6);
      }
    },
    data () { return {calculate:'Nose Wheel', noseWheel: '', validRadii: [7.5, 10, 14, 18, 26, 33, 40], validN2M: [5, 5, 6, 10, 15, 24, 24] } },
    computed: {
      editing: {
        get: function () {
          return this.$parent.$parent.$parent.$refs.editLayer.editing
        }
      },
      parking: function () {
        return this.$store.state.Editable.type === 'parking'
      },
      airlines: function () {
        var airlineCodes = [];
        var storedairlineCodes = this.$store.state.Airports.currentAirport.airlines;
        // return [{value: 'bi-directional', label: 'bi-directional'},
        //   {value: 'forward', label: 'forward'},
        //   {value: 'backward', label: 'backward'}
        // ]
        if(storedairlineCodes) {
          storedairlineCodes.forEach(element => {
            airlineCodes.push({value: element, label: element});
          });
        }
        return airlineCodes
      },
      airlineCodes: {
      // getter
        get: function () {          
          var codes = this.$store.state.Editable.data.parking.airlineCodes
          if (Array.isArray(codes)) {
            return codes
          } else if (codes !== undefined && typeof codes === 'string') {
            return codes.split(',')            
          } else {
            return []
          }
          return 
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_AIRLINES', newValue)
        }
      },
      name: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.name
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_NAME', newValue)
        }
      },
      number: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.number
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_NUMBER', newValue)
        }
      },
      coordinates: {
      // getter
        get: function () {
          if(this.$store.state.Editable.index!==undefined) {
            return this.$store.state.Editable.data.parking.coords;
          }
        },
        // setter
        set: function (newValue) {
          if (newValue==='unknown') {
            
          } 
          if( newValue.match(/,/g) !== null && newValue.match(/,/g).length === 3) {
            newValue = newValue.replace(', ', ' ').replace(/,/g, '.').replace(' ', ', ');
          }                  
          this.$store.commit('SET_EDIT_PARKING_COORDS', newValue)
        }
      },
      noseCoordinates: {
      // getter
        get: function () {
          if(this.$store.state.Editable.index!==undefined) {            
            const center = convert(this.$store.state.Editable.data.parking.coords);
            const parkingSize = this.validRadii.indexOf(this.$store.state.Editable.data.parking.radius);  
            if (parkingSize>=0) {
                var newWheel = turf.destination(this.latToTurf(center), this.validN2M[parkingSize]/1000, this.normalizeAngle(this.$store.state.Editable.data.parking.heading), turfOptions);
                var newValue = this.turfToLatLng(newWheel);
                if( newValue.match(/,/g) !== null && newValue.match(/,/g).length === 1) {
                  newValue = newValue.replace(',', ' ');
                }
                this.noseWheel = newValue;
                return newValue;
            }     
          }
        },
        // setter
        set: function (newValue) {
          if (newValue==='unknown') {
            
          } 
          if( newValue.match(/,/g) !== null && newValue.match(/,/g).length === 3) {
            newValue = newValue.replace(', ', ' ').replace(/,/g, '.').replace(' ', ', ');
          }
          this.noseWheel = newValue;
          var centerCoords = convert(this.$store.state.Editable.data.parking.coords);
          if(this.calculate === 'Center') {            
          // we change center
            const noseWheelLatLng = convert(this.noseWheel);
            const parkingSize = this.validRadii.indexOf(this.$store.state.Editable.data.parking.radius);  
            if (parkingSize>=0) {
                var newCenter = turf.destination(this.latToTurf(noseWheelLatLng), this.validN2M[parkingSize]/1000, this.$store.state.Editable.data.parking.heading, turfOptions);
                this.$store.commit('SET_EDIT_PARKING_COORDS', this.turfToLatLng(newCenter));
            }     
          }
        }
      },
      heading: {
      // getter
        get: function () {
          return Number(this.$store.state.Editable.data.parking.heading)
        },
        // setter
        set: function (newValue) {
          while (newValue>=360) {
            newValue -= 360
          }
          while (newValue<0) {
            newValue += 360
          }
          if (Number(this.$store.state.Editable.data.parking.heading) !== newValue) {
            this.$store.commit('SET_EDIT_PARKING_HEADING', newValue)
          }
          if(this.calculate === 'Center') {            
          // we change center
            const noseWheelLatLng = convert(this.noseWheel);
            const parkingSize = this.validRadii.indexOf(this.$store.state.Editable.data.parking.radius);  
            if (parkingSize>=0) {
                var reverseHeading = this.normalizeAngle(this.$store.state.Editable.data.parking.heading+180);
                var newCenter = turf.destination(this.latToTurf(noseWheelLatLng), this.validN2M[parkingSize]/1000, reverseHeading, turfOptions);
                this.$store.commit('SET_EDIT_PARKING_COORDS', this.turfToLatLng(newCenter));
            }     
          }
        }
      },
      wingspan: {
      // getter
        get: function () {
          return this.$store.state.Editable.data.parking.radius * 2
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_RADIUS', newValue / 2)
        }
      },
      pushbackEnd: function () {
        return this.$parent.$parent.$parent.$refs.editLayer.findRouteToPushback(this.$store.state.Editable.index)
      },
      type: function () {
/**
 * Cat Models                   FG Radii N2M Radii
 * B Small Regionals ERJ CRJ ATR    14       6
 * C A319 A320 A321 B737            18      10
 * D B757, B767                     26      15
 * E B777 B787 A330 A340 A360       33      24
 * F A380                           40      24
 */

        switch (this.$store.state.Editable.data.parking.radius * 2) {
          case 15:
            return 'Piper J-3 Cub/Cessna 172'
          case 20:
            return 'Beech 200/Cessna 425'
          case 28:
            return 'BOMBARDIER Regional Jet CRJ-200/DE HAVILLAND CANADA DHC-6'
          case 36:
            return 'BOEING 737-700/AIRBUS A-320/EMBRAER ERJ 190-100'
          case 52:
            return 'B767 Series/AIRBUS A-310'
          case 66:
            return 'B777 Series/B787 Series/A330 Family'
          case 80:
            return 'BOEING 747-8/AIRBUS A-380-800'
          default:
            return 'Unknown radius : ' + this.$store.state.Editable.data.parking.radius
        }
      },
      // ga (general aviation), cargo (cargo), gate (commercial passenger traffic),
      // mil-fighter (military fighter), mil-cargo (military transport)
      options: function () {
        return [{value: 'none', label: 'none', disabled: true},
          {value: 'ga', label: 'general aviation'},
          {value: 'cargo', label: 'cargo'},
          {value: 'gate', label: 'commercial passenger traffic'},
          {value: 'mil-fighter', label: 'military fighter'},
          {value: 'mil-cargo', label: 'military cargo'}
        ]
      },
      parking_type: {
      // getter
        get: function () {
          if (this.$store.state.Editable.data.parking.type === undefined) {
            return 'none'
          }
          return this.$store.state.Editable.data.parking.type
        },
        // setter
        set: function (newValue) {
          this.$store.commit('SET_EDIT_PARKING_TYPE', newValue)
        }
      }
    }
  }
</script>

<style>
.el-row {
  margin: 1px;
}
.el-col {
  padding-left: 2pt;
}
.label {
  display: flex;
  justify-content: left;
  align-items: center;
  font-weight: bold;
}
.el-popover--plain {
  padding: 10px 10px;
}
.el-popover__title {
  display: none;
}
</style>
