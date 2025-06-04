export const constants = {
    AUTOCARE_METRICS: {
        TIME_PERIOD: "TIME_PERIOD",
        DISTANCE_TRAVELLED: "DISTANCE_TRAVELLED",
    },
    AUTOCARE_METRICS_DISPLAY: {
        TIME_PERIOD: "Time Period",
        DISTANCE_TRAVELLED: "Distance Travelled",
    },
    AUTOCARE_METRICS_UNITS: {
        TIME_PERIOD: "months",
        DISTANCE_TRAVELLED: "km",
    },
    SERVICE_MAINTENANCE_TYPES: {
        LUBRICANTS: {
            label: "Lubricants",
            subSections: [{
                label: "Engine Oil",
                value: "ENGINE_OIL"
            },
            {
                label: "Transmission Oil Auto/Man",
                value: "TRANSMISSION_OIL_AUTO_MA"
            },
            {
                label: "Differential Oil Front/Rear",
                value: "DIFFERENTIAL_OIL_FRONT_REAR"
            },
            {
                label: "Power Steering Oil",
                value: "POWER_STEERING_OIL"
            },
            {
                label: "Brake Fluid",
                value: "brake_fluid"
            },
            ]
        },
        FLUIDS: {
            label: "Fluids",
            subSections: [{
                label: "Clutch Fluid",
                value: "CLUTCH_FLUID"
            },
            {
                label: "Radiator Coolant",
                value: "RADIATOR_COOLANT"
            },
            {
                label: "Inverter Coolant",
                value: "INVERTER_COOLANT"
            },
            {
                label: "Battery Water",
                value: "BATTERY_WATER"
            },
            {
                label: "Windscreen Cleaner",
                value: "WINDSCREEN_CLEANER"
            },
            ]
        },
        FILTERS: {
            label: "Filters",
            subSections: [
                {
                    label: "Oil Filter",
                    value: "OIL_FILTER"
                },
                {
                    label: "Fuel Filter",
                    value: "FUEL_FILTER"
                },
                {
                    label: "Air Filter",
                    value: "AIR_FILTER"
                },
                {
                    label: "Line Filter",
                    value: "LINE_FILTER"
                },
                {
                    label: "Cabin Filter",
                    value: "CABIN_FILTER"
                },
            ]
        },
    },
    SERVICE_MAINTENANCE_VALUES: {
        R: "R",  // replace
        T: "T",  // top up
        C: "C",  // clean
        N: "-",  // not applicable
        Y: "✔", // done
    },
}