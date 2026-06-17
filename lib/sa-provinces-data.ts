import type { ProvinceSummary, DistrictSummary, SchoolSummary, DashboardStats } from "./types"
import { getDashboardStats } from "./data-service"

// South African Education Districts by Province
export const SOUTH_AFRICAN_PROVINCES = [
  {
    id: "prov-ec",
    name: "Eastern Cape",
    districts: [
      { id: "dist-ec-1", name: "Buffalo City Metro" },
      { id: "dist-ec-2", name: "Nelson Mandela Bay Metro" },
      { id: "dist-ec-3", name: "Amathole East" },
      { id: "dist-ec-4", name: "Chris Hani West" },
      { id: "dist-ec-5", name: "Joe Gqabi" },
      { id: "dist-ec-6", name: "OR Tambo Coastal" },
    ],
  },
  {
    id: "prov-fs",
    name: "Free State",
    districts: [
      { id: "dist-fs-1", name: "Mangaung Metro" },
      { id: "dist-fs-2", name: "Fezile Dabi" },
      { id: "dist-fs-3", name: "Lejweleputswa" },
      { id: "dist-fs-4", name: "Thabo Mofutsanyana" },
      { id: "dist-fs-5", name: "Xhariep" },
    ],
  },
  {
    id: "prov-gp",
    name: "Gauteng",
    districts: [
      { id: "dist-gp-1", name: "City of Johannesburg" },
      { id: "dist-gp-2", name: "City of Tshwane" },
      { id: "dist-gp-3", name: "City of Ekurhuleni" },
      { id: "dist-gp-4", name: "Sedibeng West" },
      { id: "dist-gp-5", name: "West Rand" },
      { id: "dist-gp-6", name: "Gauteng Central" },
    ],
  },
  {
    id: "prov-kzn",
    name: "KwaZulu-Natal",
    districts: [
      { id: "dist-kzn-1", name: "eThekwini Metro" },
      { id: "dist-kzn-2", name: "Amajuba" },
      { id: "dist-kzn-3", name: "Harry Gwala" },
      { id: "dist-kzn-4", name: "iLembe" },
      { id: "dist-kzn-5", name: "King Cetshwayo" },
      { id: "dist-kzn-6", name: "uMgungundlovu" },
      { id: "dist-kzn-7", name: "uThukela" },
      { id: "dist-kzn-8", name: "uMzinyathi" },
      { id: "dist-kzn-9", name: "uThungulu" },
      { id: "dist-kzn-10", name: "Zululand" },
      { id: "dist-kzn-11", name: "Pinetown" },
      { id: "dist-kzn-12", name: "Ugu" },
    ],
  },
  {
    id: "prov-lp",
    name: "Limpopo",
    districts: [
      { id: "dist-lp-1", name: "Capricorn North" },
      { id: "dist-lp-2", name: "Mopani East" },
      { id: "dist-lp-3", name: "Sekhukhune North" },
      { id: "dist-lp-4", name: "Vhembe West" },
      { id: "dist-lp-5", name: "Waterberg" },
    ],
  },
  {
    id: "prov-mp",
    name: "Mpumalanga",
    districts: [
      { id: "dist-mp-1", name: "Gert Sibande" },
      { id: "dist-mp-2", name: "Nkangala" },
      { id: "dist-mp-3", name: "Ehlanzeni" },
    ],
  },
  {
    id: "prov-nc",
    name: "Northern Cape",
    districts: [
      { id: "dist-nc-1", name: "Frances Baard" },
      { id: "dist-nc-2", name: "John Taolo Gaetsewe" },
      { id: "dist-nc-3", name: "Namakwa" },
      { id: "dist-nc-4", name: "Pixley ka Seme" },
      { id: "dist-nc-5", name: "ZF Mgcawu" },
    ],
  },
  {
    id: "prov-nw",
    name: "North West",
    districts: [
      { id: "dist-nw-1", name: "Bojanala Platinum" },
      { id: "dist-nw-2", name: "Dr Kenneth Kaunda" },
      { id: "dist-nw-3", name: "Dr Ruth Segomotsi Mompati" },
      { id: "dist-nw-4", name: "Ngaka Modiri Molema" },
    ],
  },
  {
    id: "prov-wc",
    name: "Western Cape",
    districts: [
      { id: "dist-wc-1", name: "City of Cape Town Metro" },
      { id: "dist-wc-2", name: "Cape Winelands" },
      { id: "dist-wc-3", name: "Central Karoo" },
      { id: "dist-wc-4", name: "Eden" },
      { id: "dist-wc-5", name: "Overberg" },
      { id: "dist-wc-6", name: "West Coast" },
      { id: "dist-wc-7", name: "Metro Central" },
      { id: "dist-wc-8", name: "Metro East" },
    ],
  },
]

/**
 * Real South African school names organized by district
 * Each district has 5 schools
 */
const SCHOOL_NAMES_BY_DISTRICT: Record<string, string[]> = {
  // Eastern Cape
  "dist-ec-1": [
    "Selborne College",
    "Grey High School",
    "Pearson High School",
    "Alexander Road High School",
    "Framesby High School",
  ],
  "dist-ec-2": [
    "Port Elizabeth High School",
    "Victoria Park High School",
    "Westering High School",
    "Grey High School",
    "Pearson High School",
  ],
  "dist-ec-3": [
    "Hudson Park High School",
    "Cambridge High School",
    "Gonubie High School",
    "John Bisseker High School",
    "Selborne College",
  ],
  "dist-ec-4": [
    "Queenstown Girls' High School",
    "Queen's College",
    "Cradock High School",
    "Graaff-Reinet High School",
    "Gill College",
  ],
  "dist-ec-5": [
    "Aliwal North High School",
    "Barkly East High School",
    "Lady Grey High School",
    "Sterkspruit High School",
    "Burgersdorp High School",
  ],
  "dist-ec-6": [
    "Mthatha High School",
    "St John's College",
    "Nompumelelo High School",
    "Ngangelizwe High School",
    "Mbekweni High School",
  ],
  // Free State
  "dist-fs-1": [
    "Grey College",
    "St. Andrew's School",
    "Eunice High School",
    "Bloemfontein High School",
    "Sentraal High School",
  ],
  "dist-fs-2": [
    "Kroonstad High School",
    "Parys High School",
    "Vredefort High School",
    "Sasolburg High School",
    "Viljoenskroon High School",
  ],
  "dist-fs-3": [
    "Welkom High School",
    "Odendaalsrus High School",
    "Virginia High School",
    "Allanridge High School",
    "Hennenman High School",
  ],
  "dist-fs-4": [
    "Harrismith High School",
    "Reitz High School",
    "Vrede High School",
    "Warden High School",
    "Phuthaditjhaba High School",
  ],
  "dist-fs-5": [
    "Bethlehem High School",
    "Ficksburg High School",
    "Clarens High School",
    "Fouriesburg High School",
    "Rosendal High School",
  ],
  // Gauteng
  "dist-gp-1": [
    "Parktown Boys' High School",
    "Jeppe High School for Boys",
    "King Edward VII School",
    "St Stithians College",
    "St John's College",
  ],
  "dist-gp-2": [
    "Pretoria Boys' High School",
    "Hoërskool Waterkloof",
    "Hoërskool Menlopark",
    "Pretoria High School for Girls",
    "Hoërskool Oos-Moot",
  ],
  "dist-gp-3": [
    "Hoërskool Oosterlig",
    "Hoërskool Boksburg",
    "Hoërskool Benoni",
    "Hoërskool Springs",
    "Hoërskool Kempton Park",
  ],
  "dist-gp-4": [
    "Hoërskool Vanderbijlpark",
    "Hoërskool Vereeniging",
    "Hoërskool Sasolburg",
    "Hoërskool Vaalpark",
    "Hoërskool Sebokeng",
  ],
  "dist-gp-5": [
    "Hoërskool Krugersdorp",
    "Hoërskool Randfontein",
    "Hoërskool Carletonville",
    "Hoërskool Fochville",
    "Hoërskool Westonaria",
  ],
  "dist-gp-6": [
    "Hoërskool Centurion",
    "Hoërskool Akasia",
    "Hoërskool Die Wilgers",
    "Hoërskool Garsfontein",
    "Hoërskool Eldoraigne",
  ],
  // KwaZulu-Natal
  "dist-kzn-1": [
    "Durban High School",
    "Glenwood High School",
    "Westville Boys' High School",
    "Hilton College",
    "Michaelhouse",
  ],
  "dist-kzn-2": [
    "Newcastle High School",
    "Madadeni High School",
    "Osizweni High School",
    "Amajuba High School",
    "Newcastle Technical High School",
  ],
  "dist-kzn-3": [
    "Pietermaritzburg Girls' High School",
    "Maritzburg College",
    "Hilton College",
    "Michaelhouse",
    "St Charles College",
  ],
  "dist-kzn-4": [
    "Ballito High School",
    "Durban North College",
    "Umhlanga College",
    "KwaDukuza High School",
    "Stanger High School",
  ],
  "dist-kzn-5": [
    "Richards Bay High School",
    "Empangeni High School",
    "Eshowe High School",
    "Melmoth High School",
    "Mtunzini High School",
  ],
  "dist-kzn-6": [
    "Pietermaritzburg Girls' High School",
    "Maritzburg College",
    "Howick High School",
    "Hilton College",
    "Michaelhouse",
  ],
  "dist-kzn-7": [
    "Ladysmith High School",
    "Bergville High School",
    "Estcourt High School",
    "Colenso High School",
    "Dundee High School",
  ],
  "dist-kzn-8": [
    "Greytown High School",
    "New Hanover High School",
    "Mooi River High School",
    "Nottingham Road High School",
    "Wartburg High School",
  ],
  "dist-kzn-9": [
    "Richards Bay High School",
    "Empangeni High School",
    "Eshowe High School",
    "Melmoth High School",
    "Mtunzini High School",
  ],
  "dist-kzn-10": [
    "Vryheid High School",
    "Pongola High School",
    "Nongoma High School",
    "Ulundi High School",
    "Hluhluwe High School",
  ],
  "dist-kzn-11": [
    "Pinetown Boys' High School",
    "Pinetown Girls' High School",
    "Westville Boys' High School",
    "Kloof High School",
    "Hillcrest High School",
  ],
  "dist-kzn-12": [
    "Port Shepstone High School",
    "Scottburgh High School",
    "Amanzimtoti High School",
    "Margate High School",
    "Hibiscus Coast High School",
  ],
  // Limpopo
  "dist-lp-1": [
    "Pietersburg High School",
    "Hoërskool Pietersburg",
    "Capricorn High School",
    "Northern Academy",
    "Polokwane High School",
  ],
  "dist-lp-2": [
    "Tzaneen High School",
    "Hoërskool Tzaneen",
    "Letaba High School",
    "Magoebaskloof High School",
    "Modjadjiskloof High School",
  ],
  "dist-lp-3": [
    "Sekhukhune High School",
    "Lebowakgomo High School",
    "Jane Furse High School",
    "Burgersfort High School",
    "Steelpoort High School",
  ],
  "dist-lp-4": [
    "Louis Trichardt High School",
    "Hoërskool Louis Trichardt",
    "Makhado High School",
    "Musina High School",
    "Thohoyandou High School",
  ],
  "dist-lp-5": [
    "Modimolle High School",
    "Hoërskool Modimolle",
    "Bela-Bela High School",
    "Thabazimbi High School",
    "Lephalale High School",
  ],
  // Mpumalanga
  "dist-mp-1": [
    "Secunda High School",
    "Hoërskool Secunda",
    "Standerton High School",
    "Ermelo High School",
    "Bethal High School",
  ],
  "dist-mp-2": [
    "Nelspruit High School",
    "Hoërskool Nelspruit",
    "Witbank High School",
    "Hoërskool Witbank",
    "Middelburg High School",
  ],
  "dist-mp-3": [
    "White River High School",
    "Hazyview High School",
    "Nelspruit High School",
    "Barberton High School",
    "Malelane High School",
  ],
  // Northern Cape
  "dist-nc-1": [
    "Kimberley Boys' High School",
    "Diamantveld High School",
    "Hoërskool Kimberley",
    "Northern Cape High School",
    "St Patrick's College",
  ],
  "dist-nc-2": [
    "Kuruman High School",
    "Kathu High School",
    "Postmasburg High School",
    "Olifantshoek High School",
    "Danielskuil High School",
  ],
  "dist-nc-3": [
    "Springbok High School",
    "Hoërskool Springbok",
    "Nababeep High School",
    "Okiep High School",
    "Port Nolloth High School",
  ],
  "dist-nc-4": [
    "De Aar High School",
    "Colesberg High School",
    "Hanover High School",
    "Richmond High School",
    "Victoria West High School",
  ],
  "dist-nc-5": [
    "Upington High School",
    "Hoërskool Upington",
    "Keimoes High School",
    "Kakamas High School",
    "Pofadder High School",
  ],
  // North West
  "dist-nw-1": [
    "Rustenburg High School",
    "Hoërskool Rustenburg",
    "Hoërskool Lichtenburg",
    "Hoërskool Klerksdorp",
    "Hoërskool Potchefstroom",
  ],
  "dist-nw-2": [
    "Potchefstroom High School for Boys",
    "Potchefstroom Girls' High School",
    "Hoërskool Potchefstroom",
    "Klerksdorp High School",
    "Hoërskool Klerksdorp",
  ],
  "dist-nw-3": [
    "Vryburg High School",
    "Hoërskool Vryburg",
    "Schweizer-Reneke High School",
    "Wolmaransstad High School",
    "Coligny High School",
  ],
  "dist-nw-4": [
    "Mafikeng High School",
    "Hoërskool Mafikeng",
    "Mmabatho High School",
    "Zeerust High School",
    "Groot Marico High School",
  ],
  // Western Cape
  "dist-wc-1": [
    "Rondebosch Boys' High School",
    "Wynberg Boys' High School",
    "Bishops Diocesan College",
    "SACS High School",
    "Rondebosch Boys' Preparatory School",
  ],
  "dist-wc-2": [
    "Paarl Boys' High School",
    "Paarl Girls' High School",
    "Stellenbosch High School",
    "Hoërskool Stellenbosch",
    "Somerset West High School",
  ],
  "dist-wc-3": [
    "Beaufort West High School",
    "Hoërskool Beaufort-Wes",
    "Prince Albert High School",
    "Laingsburg High School",
    "Merweville High School",
  ],
  "dist-wc-4": [
    "George High School",
    "Hoërskool Outeniqua",
    "Knysna High School",
    "Plettenberg Bay High School",
    "Mossel Bay High School",
  ],
  "dist-wc-5": [
    "Hermanus High School",
    "Hoërskool Overberg",
    "Stellenbosch High School",
    "Swellendam High School",
    "Bredasdorp High School",
  ],
  "dist-wc-6": [
    "Vredenburg High School",
    "Hoërskool Vredenburg",
    "Saldanha High School",
    "Langebaan High School",
    "Hopefield High School",
  ],
  "dist-wc-7": [
    "Rondebosch Boys' High School",
    "Wynberg Boys' High School",
    "Bishops Diocesan College",
    "SACS High School",
    "Rustenburg Girls' High School",
  ],
  "dist-wc-8": [
    "Fish Hoek High School",
    "Muizenberg High School",
    "Simon's Town School",
    "Kirstenhoff High School",
    "Bergvliet High School",
  ],
}

/**
 * Get school names for a district, or generate default names if not found
 */
function getSchoolNamesForDistrict(districtId: string, districtName: string): string[] {
  const names = SCHOOL_NAMES_BY_DISTRICT[districtId]
  if (names && names.length >= 5) {
    return names.slice(0, 5)
  }
  // Fallback to generated names if not found
  return Array.from({ length: 5 }, (_, i) => `${districtName} High School ${i + 1}`)
}

/**
 * Generate province summaries with aggregated stats
 */
export function generateProvinceSummaries(): ProvinceSummary[] {
  return SOUTH_AFRICAN_PROVINCES.map((province) => {
    // Generate realistic stats for each province
    const baseStats = getDashboardStats()
    const multiplier = Math.random() * 0.3 + 0.85 // 0.85 to 1.15 multiplier

    return {
      id: province.id,
      name: province.name,
      districts: province.districts.length,
      stats: {
        totalStudents: Math.round(baseStats.totalStudents * multiplier * province.districts.length * 5),
        atRiskStudents: Math.round(baseStats.atRiskStudents * multiplier * province.districts.length * 5),
        activeInterventions: Math.round(
          baseStats.activeInterventions * multiplier * province.districts.length * 5,
        ),
        averageAttendance: Math.max(60, Math.min(95, baseStats.averageAttendance + (Math.random() - 0.5) * 10)),
        averageAPS: Math.max(2.0, Math.min(4.0, baseStats.averageAPS + (Math.random() - 0.5) * 0.5)),
        alertsToday: Math.round(baseStats.alertsToday * multiplier * province.districts.length * 5),
        riskDistribution: {
          low: Math.round(baseStats.riskDistribution.low * multiplier * province.districts.length * 5),
          medium: Math.round(
            baseStats.riskDistribution.medium * multiplier * province.districts.length * 5,
          ),
          high: Math.round(baseStats.riskDistribution.high * multiplier * province.districts.length * 5),
          critical: Math.round(
            baseStats.riskDistribution.critical * multiplier * province.districts.length * 5,
          ),
        },
      },
    }
  })
}

/**
 * Generate district summaries for all provinces
 */
export function generateDistrictSummaries(): DistrictSummary[] {
  const districts: DistrictSummary[] = []

  SOUTH_AFRICAN_PROVINCES.forEach((province) => {
    province.districts.forEach((district) => {
      const baseStats = getDashboardStats()
      const multiplier = Math.random() * 0.3 + 0.85 // 0.85 to 1.15 multiplier

      districts.push({
        id: district.id,
        name: district.name,
        provinceId: province.id,
        schools: 5, // 5 schools per district
        stats: {
          totalStudents: Math.round(baseStats.totalStudents * multiplier * 5),
          atRiskStudents: Math.round(baseStats.atRiskStudents * multiplier * 5),
          activeInterventions: Math.round(baseStats.activeInterventions * multiplier * 5),
          averageAttendance: Math.max(60, Math.min(95, baseStats.averageAttendance + (Math.random() - 0.5) * 10)),
          averageAPS: Math.max(2.0, Math.min(4.0, baseStats.averageAPS + (Math.random() - 0.5) * 0.5)),
          alertsToday: Math.round(baseStats.alertsToday * multiplier * 5),
          riskDistribution: {
            low: Math.round(baseStats.riskDistribution.low * multiplier * 5),
            medium: Math.round(baseStats.riskDistribution.medium * multiplier * 5),
            high: Math.round(baseStats.riskDistribution.high * multiplier * 5),
            critical: Math.round(baseStats.riskDistribution.critical * multiplier * 5),
          },
        },
      })
    })
  })

  return districts
}

/**
 * Generate school summaries (5 per district) using real South African school names
 */
export function generateSchoolSummaries(): SchoolSummary[] {
  const schools: SchoolSummary[] = []

  SOUTH_AFRICAN_PROVINCES.forEach((province) => {
    province.districts.forEach((district) => {
      // Get real school names for this district
      const schoolNames = getSchoolNamesForDistrict(district.id, district.name)
      
      // Generate 5 schools per district with real names
      schoolNames.forEach((schoolName, index) => {
        const baseStats = getDashboardStats()
        const multiplier = Math.random() * 0.3 + 0.85 // 0.85 to 1.15 multiplier

        schools.push({
          id: `school-${district.id}-${index + 1}`,
          name: schoolName,
          districtId: district.id,
          provinceId: province.id,
          stats: {
            totalStudents: Math.round(baseStats.totalStudents * multiplier),
            atRiskStudents: Math.round(baseStats.atRiskStudents * multiplier),
            activeInterventions: Math.round(baseStats.activeInterventions * multiplier),
            averageAttendance: Math.max(
              60,
              Math.min(95, baseStats.averageAttendance + (Math.random() - 0.5) * 10),
            ),
            averageAPS: Math.max(2.0, Math.min(4.0, baseStats.averageAPS + (Math.random() - 0.5) * 0.5)),
            alertsToday: Math.round(baseStats.alertsToday * multiplier),
            riskDistribution: {
              low: Math.round(baseStats.riskDistribution.low * multiplier),
              medium: Math.round(baseStats.riskDistribution.medium * multiplier),
              high: Math.round(baseStats.riskDistribution.high * multiplier),
              critical: Math.round(baseStats.riskDistribution.critical * multiplier),
            },
          },
        })
      })
    })
  })

  return schools
}

/**
 * Get total counts
 */
export function getTotalCounts() {
  const totalProvinces = SOUTH_AFRICAN_PROVINCES.length
  const totalDistricts = SOUTH_AFRICAN_PROVINCES.reduce((sum, p) => sum + p.districts.length, 0)
  const totalSchools = totalDistricts * 5

  return { totalProvinces, totalDistricts, totalSchools }
}

