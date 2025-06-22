export const formFieldConstants = {
    TEXT: "TEXT",
    RADIO_GROUP: "RADIO_GROUP",
}

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
        lubricants: {
            label: "Lubricants",
            subSections: [{
                label: "Engine Oil",
                value: "engineOil",
                fields: [
                    {
                        label: "Oil",
                        value: "oil",
                        type: formFieldConstants.TEXT,
                    }
                ]
            },
            {
                label: "Transmission Oil Auto/Man",
                value: "transmissionOilAutoMan",
                fields: [{
                        label: "Auto/Manual",
                        value: "autoMan",
                        type: formFieldConstants.RADIO_GROUP,
                        radioValues: [
                            { label: "Auto", value: "AUTO" },
                            { label: "Manual", value: "MANUAL" }
                        ]
                    },
                    {
                        label: "Make",
                        value: "make",
                        type: formFieldConstants.TEXT,
                    },
                    {
                        label: "Type",
                        value: "type",
                        type: formFieldConstants.TEXT,
                    },
                ]
            },
            {
                label: "Differential Oil Front/Rear",
                value: "differentialOilFrontRear",
                fields: [
                    {
                        label: "Make",
                        value: "make",
                        type: formFieldConstants.TEXT,
                    },
                    {
                        label: "Type",
                        value: "type",
                        type: formFieldConstants.TEXT,
                    },
                ]
            },
            {
                label: "Power Steering Oil",
                value: "powerSteeringOil",
                fields: [
                    {
                        label: "Make",
                        value: "make",
                        type: formFieldConstants.TEXT,
                    },
                    {
                        label: "Type",
                        value: "type",
                        type: formFieldConstants.TEXT,
                    },
                ]
            },
            {
                label: "Brake Fluid",
                value: "brakeFluid",
                fields: [
                    {
                        label: "Make",
                        value: "make",
                        type: formFieldConstants.TEXT,
                    },
                    {
                        label: "Type",
                        value: "type",
                        type: formFieldConstants.TEXT,
                    },
                ]
            },
            ]
        },
        fluids: {
            label: "Fluids",
            subSections: [{
                label: "Clutch Fluid",
                value: "clutchFluid"
            },
            {
                label: "Radiator Coolant",
                value: "radiatorCoolant"
            },
            {
                label: "Inverter Coolant",
                value: "inverterCoolant"
            },
            {
                label: "Battery Water",
                value: "batteryWater"
            },
            {
                label: "Windscreen Cleaner",
                value: "windscreenCleaner"
            },
            ]
        },
        filters: {
            label: "Filters",
            subSections: [
                {
                    label: "Oil Filter",
                    value: "oilFilter"
                },
                {
                    label: "Fuel Filter",
                    value: "fuelFilter"
                },
                {
                    label: "Air Filter",
                    value: "airFilter"
                },
                {
                    label: "Line Filter",
                    value: "lineFilter"
                },
                {
                    label: "Cabin Filter",
                    value: "cabinFilter"
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