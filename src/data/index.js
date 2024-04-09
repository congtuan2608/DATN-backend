export const pollutionData = [
  {
    id: 1,
    location: {
      latitude: 10.762622,
      longitude: 106.660172,
    },
    address: "Bến Thành, Quận 1, Thành phố Hồ Chí Minh, Vietnam",
    type: "air-pollution",
    description:
      "High levels of PM2.5 detected due to traffic and industrial activities.",
    contaminationSource: "Vehicle emissions and industrial factories",
    severity: "severe",
    status: "processing",
    populationDensity: "High",
    isAnonymous: false,
    images: [
      {
        id: "img1",
        type: "image/jpeg",
        url: "blob:https://chat.zalo.me/754b44bd-1868-4f2c-963e-05123d24b71a",
        timestamp: "2024-03-30T09:00:00Z",
      },
    ],
  },
  {
    id: 2,
    location: {
      latitude: 21.028511,
      longitude: 105.804817,
    },
    address: "Hoàn Kiếm, Hà Nội, Vietnam",
    type: "water-pollution",
    description: "Wastewater discharge from residential areas into the lake.",
    contaminationSource: "Domestic wastewater",
    severity: "moderate",
    status: "card needed",
    populationDensity: 8000, // per square kilometer
    isAnonymous: true,
    images: [
      {
        id: "img2",
        type: "image/jpeg",
        url: "https://example.com/images/waterpollution-hanoi.jpg",
        timestamp: "2024-03-30T10:30:00Z",
      },
    ],
  },
  {
    id: 3,
    location: {
      latitude: 16.054407,
      longitude: 108.202164,
    },
    address: "Ngũ Hành Sơn, Đà Nẵng, Vietnam",
    type: "soil-contamination",
    description: "Heavy metals and pesticides found in agricultural land.",
    contaminationSource:
      "Agricultural runoff and improper disposal of industrial waste",
    severity: "mild",
    status: "processed",
    populationDensity: "Medium",
    isAnonymous: false,
    images: [
      {
        id: "img3",
        type: "image/jpeg",
        url: "https://example.com/images/soilcontamination-danang.jpg",
        timestamp: "2024-03-30T11:15:00Z",
      },
    ],
  },
  {
    id: 4,
    location: {
      latitude: 20.844912,
      longitude: 106.688084,
    },
    address: "Lê Chân, Hải Phòng, Vietnam",
    type: "industrial-waste",
    description:
      "Illegal dumping of industrial waste in local landfill causing soil and water contamination.",
    contaminationSource: "Local factories and industrial zones",
    severity: "severe",
    status: "card needed",
    populationDensity: "Dense",
    isAnonymous: true,
    images: [
      {
        id: "img4",
        type: "image/jpeg",
        url: "https://example.com/images/industrialwaste-haiphong.jpg",
        timestamp: "2024-03-30T12:00:00Z",
      },
    ],
  },
  {
    id: 5,
    location: {
      latitude: 10.045162,
      longitude: 105.746857,
    },
    address: "Ninh Kiều, Cần Thơ, Vietnam",
    type: "plastic-pollution",
    description: "Extensive plastic debris found along the Hậu River banks.",
    contaminationSource: "Urban littering and lack of waste management",
    severity: "moderate",
    status: "processing",
    populationDensity: 1290, // per square kilometer
    isAnonymous: false,
    images: [
      {
        id: "img5",
        type: "image/jpeg",
        url: "https://example.com/images/plasticpollution-can-tho.jpg",
        timestamp: "2024-03-30T13:45:00Z",
      },
    ],
  },
  {
    id: 6,
    location: {
      latitude: 21.94685,
      longitude: 106.20424,
    },
    address: "Tp. Lạng Sơn, Lạng Sơn, Vietnam",
    type: "air-pollution",
    description:
      "Increased sulfur dioxide and nitrogen dioxide levels from traffic congestion and cross-border trade activities.",
    contaminationSource: "Vehicle emissions and transboundary pollution",
    severity: "mild",
    status: "processed",
    populationDensity: "Low",
    isAnonymous: true,
    images: [
      {
        id: "img6",
        type: "image/jpeg",
        url: "https://example.com/images/airpollution-langson.jpg",
        timestamp: "2024-03-30T14:30:00Z",
      },
    ],
  },
  {
    id: 7,
    location: {
      latitude: 11.940419,
      longitude: 108.458313,
    },
    address: "Đà Lạt, Lâm Đồng, Vietnam",
    type: "noise-pollution",
    description:
      "Excessive noise from tourist activities and local markets affecting residential areas.",
    contaminationSource: "Tourism and commercial activities",
    severity: "moderate",
    status: "card not needed",
    populationDensity: "Moderate",
    isAnonymous: false,
    images: [
      {
        id: "img7",
        type: "image/jpeg",
        url: "https://example.com/images/noisepollution-dalat.jpg",
        timestamp: "2024-03-30T15:20:00Z",
      },
    ],
  },
  {
    id: 8,
    location: {
      latitude: 21.59422,
      longitude: 105.848167,
    },
    address: "Thái Nguyên, Vietnam",
    type: "chemical-spill",
    description: "Chemical spill from a local factory affecting the Cầu River.",
    contaminationSource: "Chemical plant accident",
    severity: "severe",
    status: "processing",
    populationDensity: 670, // per square kilometer
    isAnonymous: true,
    images: [
      {
        id: "img8",
        type: "image/jpeg",
        url: "https://example.com/images/chemicalspill-thainguyen.jpg",
        timestamp: "2024-03-30T16:10:00Z",
      },
    ],
  },
  {
    id: 9,
    location: {
      latitude: 12.238791,
      longitude: 109.196749,
    },
    address: "Nha Trang, Khánh Hòa, Vietnam",
    type: "marine-pollution",
    description:
      "Significant amount of plastic waste and debris found on the beaches.",
    contaminationSource: "Tourist activities and ocean currents",
    severity: "moderate",
    status: "card needed",
    populationDensity: "High",
    isAnonymous: false,
    images: [
      {
        id: "img9",
        type: "image/jpeg",
        url: "https://example.com/images/marinepollution-nhatrang.jpg",
        timestamp: "2024-03-30T17:00:00Z",
      },
    ],
  },
  {
    id: 10,
    location: {
      latitude: 10.228027,
      longitude: 103.963709,
    },
    address: "Phú Quốc, Kiên Giang, Vietnam",
    type: "marine-pollution",
    description:
      "Coral reef damage due to sunscreen lotions and untreated sewage.",
    contaminationSource: "Tourism and inadequate waste treatment facilities",
    severity: "severe",
    status: "processing",
    populationDensity: "Varies with seasonal tourism",
    isAnonymous: true,
    images: [
      {
        id: "img10",
        type: "image/jpeg",
        url: "https://example.com/images/coralreef-phuquoc.jpg",
        timestamp: "2024-03-30T18:30:00Z",
      },
    ],
  },
  {
    id: 11,
    location: {
      latitude: 21.028774,
      longitude: 105.852148,
    },
    address: "Tràng Tiền, Hoàn Kiếm, Hà Nội, Vietnam",
    type: "air-pollution",
    description:
      "Increased levels of air pollutants during peak traffic hours.",
    contaminationSource: "Motor vehicles and industrial emissions",
    severity: "moderate",
    status: "card not needed",
    populationDensity: 6800, // per square kilometer
    isAnonymous: false,
    images: [
      {
        id: "img11",
        type: "image/jpeg",
        url: "https://example.com/images/traffic-hanoi.jpg",
        timestamp: "2024-03-30T19:00:00Z",
      },
    ],
  },
  {
    id: 12,
    location: {
      latitude: 10.775659,
      longitude: 106.700424,
    },
    address: "Nguyễn Huệ, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Vietnam",
    type: "noise-pollution",
    description:
      "Persistent noise from construction sites and heavy urban traffic.",
    contaminationSource: "Construction activities and traffic congestion",
    severity: "mild",
    status: "processed",
    populationDensity: "High",
    isAnonymous: true,
    images: [
      {
        id: "img12",
        type: "image/jpeg",
        url: "https://example.com/images/noise-hochiminhcity.jpg",
        timestamp: "2024-03-30T20:15:00Z",
      },
    ],
  },
  {
    id: 13,
    location: {
      latitude: 16.463461,
      longitude: 107.584702,
    },
    address: "Thành phố Huế, Thừa Thiên Huế, Vietnam",
    type: "water-pollution",
    description: "Local river polluted with industrial chemicals and dyes.",
    contaminationSource: "Textile factories and tanneries",
    severity: "severe",
    status: "processing",
    populationDensity: 2200, // per square kilometer
    isAnonymous: false,
    images: [
      {
        id: "img13",
        type: "image/jpeg",
        url: "https://example.com/images/riverpollution-hue.jpg",
        timestamp: "2024-03-30T21:30:00Z",
      },
    ],
  },
  {
    id: 14,
    location: {
      latitude: 10.289949,
      longitude: 103.984019,
    },
    address: "An Thới, Phú Quốc, Kiên Giang, Vietnam",
    type: "marine-pollution",
    description:
      "Oil spills from fishing vessels affecting marine life and local fisheries.",
    contaminationSource: "Local fishing fleet and shipping lanes",
    severity: "moderate",
    status: "card needed",
    populationDensity: "Low",
    isAnonymous: true,
    images: [
      {
        id: "img14",
        type: "image/jpeg",
        url: "https://example.com/images/oilspill-phuquoc.jpg",
        timestamp: "2024-03-30T22:45:00Z",
      },
    ],
  },
];
