// ============================================================
// MOCK DATA — CLEARLY SIMULATED, NOT REAL
// National Network (India) — Prototype PHC Network
// ============================================================

export const REGION = {
  name: 'India',
  center: [20.5937, 78.9629], // Center of India
  zoom: 4, // Zoomed out to see the whole country
};

export const DISRUPTION_TYPES = [
  {
    "id": "medicine_shortage",
    "label": "Medicine Shortage"
  },
  {
    "id": "phc_closure",
    "label": "PHC Closure"
  },
  {
    "id": "patient_surge",
    "label": "Patient Demand Surge"
  },
  {
    "id": "staff_shortage",
    "label": "Staff Shortage"
  }
];
export const DURATION_OPTIONS = [
  {
    "value": 1,
    "label": "1 day"
  },
  {
    "value": 3,
    "label": "3 days"
  },
  {
    "value": 7,
    "label": "7 days"
  },
  {
    "value": 14,
    "label": "14 days"
  },
  {
    "value": 30,
    "label": "30 days"
  }
];
export const MEDICINE_LIST = [
  "Paracetamol",
  "Amoxicillin",
  "Antibiotics",
  "ORS Packets",
  "Metformin",
  "Amlodipine",
  "Iron + Folic Acid",
  "Vitamin D3",
  "Salbutamol Inhaler",
  "Chloroquine",
  "Azithromycin"
];

export const phcs = [
  {
    "id": "phc-001",
    "name": "Haveli PHC",
    "district": "Pune",
    "state": "Maharashtra",
    "lat": 18.4518,
    "lng": 73.658,
    "patientsPerDay": 147,
    "bedCapacity": 36,
    "bedsOccupied": 10,
    "doctors": 1,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2053,
        "avgDemandPerDay": 106,
        "unit": "tablets"
      },
      "Antibiotics": {
        "stock": 477,
        "avgDemandPerDay": 55,
        "unit": "courses"
      },
      "ORS Packets": {
        "stock": 275,
        "avgDemandPerDay": 28,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1035,
        "avgDemandPerDay": 59,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-002",
      "phc-003"
    ]
  },
  {
    "id": "phc-002",
    "name": "Khed PHC",
    "district": "Pune",
    "state": "Maharashtra",
    "lat": 18.6942,
    "lng": 73.9255,
    "patientsPerDay": 138,
    "bedCapacity": 23,
    "bedsOccupied": 18,
    "doctors": 2,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1296,
        "avgDemandPerDay": 100,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 562,
        "avgDemandPerDay": 38,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 187,
        "avgDemandPerDay": 27,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1106,
        "avgDemandPerDay": 44,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-003",
      "phc-004"
    ]
  },
  {
    "id": "phc-003",
    "name": "Mulshi PHC",
    "district": "Pune",
    "state": "Maharashtra",
    "lat": 18.6964,
    "lng": 73.6795,
    "patientsPerDay": 120,
    "bedCapacity": 36,
    "bedsOccupied": 2,
    "doctors": 2,
    "nurses": 6,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2015,
        "avgDemandPerDay": 105,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 202,
        "avgDemandPerDay": 56,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 216,
        "avgDemandPerDay": 24,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1130,
        "avgDemandPerDay": 74,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-004",
      "phc-005"
    ]
  },
  {
    "id": "phc-004",
    "name": "Velhe PHC",
    "district": "Pune",
    "state": "Maharashtra",
    "lat": 18.4102,
    "lng": 73.6865,
    "patientsPerDay": 73,
    "bedCapacity": 31,
    "bedsOccupied": 27,
    "doctors": 2,
    "nurses": 4,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1606,
        "avgDemandPerDay": 147,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 333,
        "avgDemandPerDay": 43,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 268,
        "avgDemandPerDay": 30,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 865,
        "avgDemandPerDay": 32,
        "unit": "tablets"
      }
    },
    "status": "stable",
    "nearbyPHCIds": [
      "phc-005",
      "phc-001"
    ]
  },
  {
    "id": "phc-005",
    "name": "Maval PHC",
    "district": "Pune",
    "state": "Maharashtra",
    "lat": 18.4642,
    "lng": 73.7457,
    "patientsPerDay": 147,
    "bedCapacity": 22,
    "bedsOccupied": 14,
    "doctors": 2,
    "nurses": 5,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1606,
        "avgDemandPerDay": 104,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 500,
        "avgDemandPerDay": 59,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 115,
        "avgDemandPerDay": 26,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1030,
        "avgDemandPerDay": 56,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-001",
      "phc-002"
    ]
  },
  {
    "id": "phc-006",
    "name": "Bakshi Ka Talab PHC",
    "district": "Lucknow",
    "state": "Uttar Pradesh",
    "lat": 26.6665,
    "lng": 81.1453,
    "patientsPerDay": 106,
    "bedCapacity": 30,
    "bedsOccupied": 20,
    "doctors": 2,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1985,
        "avgDemandPerDay": 143,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 602,
        "avgDemandPerDay": 22,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 209,
        "avgDemandPerDay": 25,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1114,
        "avgDemandPerDay": 71,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-007",
      "phc-008"
    ]
  },
  {
    "id": "phc-007",
    "name": "Malihabad PHC",
    "district": "Lucknow",
    "state": "Uttar Pradesh",
    "lat": 26.8169,
    "lng": 80.9318,
    "patientsPerDay": 146,
    "bedCapacity": 21,
    "bedsOccupied": 4,
    "doctors": 1,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2617,
        "avgDemandPerDay": 55,
        "unit": "tablets"
      },
      "Antibiotics": {
        "stock": 547,
        "avgDemandPerDay": 49,
        "unit": "courses"
      },
      "ORS Packets": {
        "stock": 278,
        "avgDemandPerDay": 27,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1113,
        "avgDemandPerDay": 30,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-008",
      "phc-009"
    ]
  },
  {
    "id": "phc-008",
    "name": "Mohanlalganj PHC",
    "district": "Lucknow",
    "state": "Uttar Pradesh",
    "lat": 26.9258,
    "lng": 80.8983,
    "patientsPerDay": 61,
    "bedCapacity": 38,
    "bedsOccupied": 9,
    "doctors": 1,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1793,
        "avgDemandPerDay": 72,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 427,
        "avgDemandPerDay": 55,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 260,
        "avgDemandPerDay": 24,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 506,
        "avgDemandPerDay": 61,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-009",
      "phc-010"
    ]
  },
  {
    "id": "phc-009",
    "name": "Sarojini Nagar PHC",
    "district": "Lucknow",
    "state": "Uttar Pradesh",
    "lat": 26.9314,
    "lng": 80.984,
    "patientsPerDay": 142,
    "bedCapacity": 27,
    "bedsOccupied": 13,
    "doctors": 1,
    "nurses": 6,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1444,
        "avgDemandPerDay": 98,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 346,
        "avgDemandPerDay": 39,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 176,
        "avgDemandPerDay": 28,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 979,
        "avgDemandPerDay": 73,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-010",
      "phc-006"
    ]
  },
  {
    "id": "phc-010",
    "name": "Kakori PHC",
    "district": "Lucknow",
    "state": "Uttar Pradesh",
    "lat": 26.8293,
    "lng": 81.1267,
    "patientsPerDay": 93,
    "bedCapacity": 36,
    "bedsOccupied": 24,
    "doctors": 2,
    "nurses": 8,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2054,
        "avgDemandPerDay": 78,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 617,
        "avgDemandPerDay": 40,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 100,
        "avgDemandPerDay": 17,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 700,
        "avgDemandPerDay": 63,
        "unit": "tablets"
      }
    },
    "status": "stable",
    "nearbyPHCIds": [
      "phc-006",
      "phc-007"
    ]
  },
  {
    "id": "phc-011",
    "name": "Aluva PHC",
    "district": "Ernakulam",
    "state": "Kerala",
    "lat": 10.1172,
    "lng": 76.4246,
    "patientsPerDay": 131,
    "bedCapacity": 39,
    "bedsOccupied": 33,
    "doctors": 1,
    "nurses": 7,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2642,
        "avgDemandPerDay": 123,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 592,
        "avgDemandPerDay": 38,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 127,
        "avgDemandPerDay": 30,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1024,
        "avgDemandPerDay": 67,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-012",
      "phc-013"
    ]
  },
  {
    "id": "phc-012",
    "name": "Paravur PHC",
    "district": "Ernakulam",
    "state": "Kerala",
    "lat": 10.0881,
    "lng": 76.4782,
    "patientsPerDay": 119,
    "bedCapacity": 36,
    "bedsOccupied": 27,
    "doctors": 2,
    "nurses": 8,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2372,
        "avgDemandPerDay": 101,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 614,
        "avgDemandPerDay": 46,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 129,
        "avgDemandPerDay": 26,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 694,
        "avgDemandPerDay": 36,
        "unit": "tablets"
      }
    },
    "status": "at-risk",
    "nearbyPHCIds": [
      "phc-013",
      "phc-014"
    ]
  },
  {
    "id": "phc-013",
    "name": "Kochi PHC",
    "district": "Ernakulam",
    "state": "Kerala",
    "lat": 10.1458,
    "lng": 76.4975,
    "patientsPerDay": 100,
    "bedCapacity": 23,
    "bedsOccupied": 16,
    "doctors": 2,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2569,
        "avgDemandPerDay": 73,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 213,
        "avgDemandPerDay": 26,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 280,
        "avgDemandPerDay": 28,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 972,
        "avgDemandPerDay": 35,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-014",
      "phc-015"
    ]
  },
  {
    "id": "phc-014",
    "name": "Kanayannur PHC",
    "district": "Ernakulam",
    "state": "Kerala",
    "lat": 9.8679,
    "lng": 76.4346,
    "patientsPerDay": 96,
    "bedCapacity": 29,
    "bedsOccupied": 15,
    "doctors": 2,
    "nurses": 5,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2806,
        "avgDemandPerDay": 58,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 593,
        "avgDemandPerDay": 48,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 275,
        "avgDemandPerDay": 17,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 570,
        "avgDemandPerDay": 51,
        "unit": "tablets"
      }
    },
    "status": "at-risk",
    "nearbyPHCIds": [
      "phc-015",
      "phc-011"
    ]
  },
  {
    "id": "phc-015",
    "name": "Kothamangalam PHC",
    "district": "Ernakulam",
    "state": "Kerala",
    "lat": 10.1632,
    "lng": 76.1006,
    "patientsPerDay": 93,
    "bedCapacity": 32,
    "bedsOccupied": 20,
    "doctors": 2,
    "nurses": 7,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1676,
        "avgDemandPerDay": 128,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 203,
        "avgDemandPerDay": 58,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 251,
        "avgDemandPerDay": 16,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 409,
        "avgDemandPerDay": 32,
        "unit": "tablets"
      }
    },
    "status": "stable",
    "nearbyPHCIds": [
      "phc-011",
      "phc-012"
    ]
  },
  {
    "id": "phc-016",
    "name": "Palasbari PHC",
    "district": "Kamrup",
    "state": "Assam",
    "lat": 26.3403,
    "lng": 91.6011,
    "patientsPerDay": 139,
    "bedCapacity": 34,
    "bedsOccupied": 33,
    "doctors": 2,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1913,
        "avgDemandPerDay": 135,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 285,
        "avgDemandPerDay": 43,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 195,
        "avgDemandPerDay": 29,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 594,
        "avgDemandPerDay": 76,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-017",
      "phc-018"
    ]
  },
  {
    "id": "phc-017",
    "name": "Hajo PHC",
    "district": "Kamrup",
    "state": "Assam",
    "lat": 26.0364,
    "lng": 91.8614,
    "patientsPerDay": 72,
    "bedCapacity": 23,
    "bedsOccupied": 14,
    "doctors": 1,
    "nurses": 4,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2550,
        "avgDemandPerDay": 148,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 650,
        "avgDemandPerDay": 43,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 164,
        "avgDemandPerDay": 26,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 927,
        "avgDemandPerDay": 53,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-018",
      "phc-019"
    ]
  },
  {
    "id": "phc-018",
    "name": "Rangia PHC",
    "district": "Kamrup",
    "state": "Assam",
    "lat": 26.0648,
    "lng": 91.5832,
    "patientsPerDay": 105,
    "bedCapacity": 37,
    "bedsOccupied": 25,
    "doctors": 2,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1239,
        "avgDemandPerDay": 105,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 318,
        "avgDemandPerDay": 40,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 188,
        "avgDemandPerDay": 24,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 403,
        "avgDemandPerDay": 68,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-019",
      "phc-020"
    ]
  },
  {
    "id": "phc-019",
    "name": "Boko PHC",
    "district": "Kamrup",
    "state": "Assam",
    "lat": 26.288,
    "lng": 91.8087,
    "patientsPerDay": 130,
    "bedCapacity": 31,
    "bedsOccupied": 22,
    "doctors": 1,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1010,
        "avgDemandPerDay": 78,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 470,
        "avgDemandPerDay": 27,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 208,
        "avgDemandPerDay": 26,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 425,
        "avgDemandPerDay": 71,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-020",
      "phc-016"
    ]
  },
  {
    "id": "phc-020",
    "name": "Chhaygaon PHC",
    "district": "Kamrup",
    "state": "Assam",
    "lat": 26.2605,
    "lng": 91.9207,
    "patientsPerDay": 125,
    "bedCapacity": 23,
    "bedsOccupied": 1,
    "doctors": 1,
    "nurses": 6,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2811,
        "avgDemandPerDay": 92,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 604,
        "avgDemandPerDay": 22,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 101,
        "avgDemandPerDay": 32,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1147,
        "avgDemandPerDay": 50,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-016",
      "phc-017"
    ]
  },
  {
    "id": "phc-021",
    "name": "Sanand PHC",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "lat": 22.8427,
    "lng": 72.6898,
    "patientsPerDay": 69,
    "bedCapacity": 29,
    "bedsOccupied": 22,
    "doctors": 1,
    "nurses": 8,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1217,
        "avgDemandPerDay": 95,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 686,
        "avgDemandPerDay": 41,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 297,
        "avgDemandPerDay": 19,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 863,
        "avgDemandPerDay": 73,
        "unit": "tablets"
      }
    },
    "status": "stable",
    "nearbyPHCIds": [
      "phc-022",
      "phc-023"
    ]
  },
  {
    "id": "phc-022",
    "name": "Daskroi PHC",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "lat": 22.9908,
    "lng": 72.5122,
    "patientsPerDay": 119,
    "bedCapacity": 38,
    "bedsOccupied": 3,
    "doctors": 1,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2825,
        "avgDemandPerDay": 62,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 557,
        "avgDemandPerDay": 21,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 248,
        "avgDemandPerDay": 15,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 421,
        "avgDemandPerDay": 48,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-023",
      "phc-024"
    ]
  },
  {
    "id": "phc-023",
    "name": "Dholka PHC",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "lat": 22.9662,
    "lng": 72.622,
    "patientsPerDay": 113,
    "bedCapacity": 21,
    "bedsOccupied": 18,
    "doctors": 2,
    "nurses": 7,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 1670,
        "avgDemandPerDay": 115,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 306,
        "avgDemandPerDay": 30,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 223,
        "avgDemandPerDay": 34,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1176,
        "avgDemandPerDay": 32,
        "unit": "tablets"
      }
    },
    "status": "at-risk",
    "nearbyPHCIds": [
      "phc-024",
      "phc-025"
    ]
  },
  {
    "id": "phc-024",
    "name": "Bavla PHC",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "lat": 23.1928,
    "lng": 72.6103,
    "patientsPerDay": 123,
    "bedCapacity": 38,
    "bedsOccupied": 22,
    "doctors": 1,
    "nurses": 3,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2170,
        "avgDemandPerDay": 93,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 369,
        "avgDemandPerDay": 41,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 225,
        "avgDemandPerDay": 32,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 1128,
        "avgDemandPerDay": 59,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-025",
      "phc-021"
    ]
  },
  {
    "id": "phc-025",
    "name": "Viramgam PHC",
    "district": "Ahmedabad",
    "state": "Gujarat",
    "lat": 23.2195,
    "lng": 72.746,
    "patientsPerDay": 127,
    "bedCapacity": 33,
    "bedsOccupied": 26,
    "doctors": 2,
    "nurses": 5,
    "pharmacists": 1,
    "medicines": {
      "Paracetamol": {
        "stock": 2502,
        "avgDemandPerDay": 57,
        "unit": "tablets"
      },
      "Amoxicillin": {
        "stock": 472,
        "avgDemandPerDay": 48,
        "unit": "capsules"
      },
      "ORS Packets": {
        "stock": 207,
        "avgDemandPerDay": 28,
        "unit": "packets"
      },
      "Metformin": {
        "stock": 922,
        "avgDemandPerDay": 75,
        "unit": "tablets"
      }
    },
    "status": "critical",
    "nearbyPHCIds": [
      "phc-021",
      "phc-022"
    ]
  }
];

// Derived summary stats
export function getNetworkSummary(phcList = phcs) {
  const total = phcList.length;
  const critical = phcList.filter(p => p.status === 'critical').length;
  const atRisk = phcList.filter(p => p.status === 'at-risk').length;
  const stable = phcList.filter(p => p.status === 'stable').length;
  return { total, critical, atRisk, stable };
}

export function getPHCById(id) {
  return phcs.find(p => p.id === id) || null;
}

export function getMedicineStockDays(phc) {
  const result = {};
  for (const [name, data] of Object.entries(phc.medicines)) {
    result[name] = data.avgDemandPerDay > 0
      ? Math.floor(data.stock / data.avgDemandPerDay)
      : 999;
  }
  return result;
}

export function getCapacityPercent(phc) {
  return Math.round((phc.bedsOccupied / phc.bedCapacity) * 100);
}
