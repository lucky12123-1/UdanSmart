import { useMemo, useState } from 'react';

export const INDIA_AIRPORTS = [
  {
    "code": "DEL",
    "city": "Delhi",
    "name": "Indira Gandhi International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 28.5562,
    "lon": 77.1,
    "state": "Delhi"
  },
  {
    "code": "BOM",
    "city": "Mumbai",
    "name": "Chhatrapati Shivaji Maharaj International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 19.0896,
    "lon": 72.8656,
    "state": "Maharashtra"
  },
  {
    "code": "BLR",
    "city": "Bengaluru",
    "name": "Kempegowda International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 13.1986,
    "lon": 77.7066,
    "state": "Karnataka"
  },
  {
    "code": "HYD",
    "city": "Hyderabad",
    "name": "Rajiv Gandhi International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 17.2403,
    "lon": 78.4294,
    "state": "Telangana"
  },
  {
    "code": "MAA",
    "city": "Chennai",
    "name": "Chennai International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 12.9941,
    "lon": 80.1709,
    "state": "Tamil Nadu"
  },
  {
    "code": "CCU",
    "city": "Kolkata",
    "name": "Netaji Subhas Chandra Bose International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 22.6547,
    "lon": 88.4467,
    "state": "West Bengal"
  },
  {
    "code": "AMD",
    "city": "Ahmedabad",
    "name": "Sardar Vallabhbhai Patel International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 23.0772,
    "lon": 72.6347,
    "state": "Gujarat"
  },
  {
    "code": "JAI",
    "city": "Jaipur",
    "name": "Jaipur International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 26.8242,
    "lon": 75.8122,
    "state": "Rajasthan"
  },
  {
    "code": "LKO",
    "city": "Lucknow",
    "name": "Chaudhary Charan Singh International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 26.7606,
    "lon": 80.8893,
    "state": "Uttar Pradesh"
  },
  {
    "code": "ATQ",
    "city": "Amritsar",
    "name": "Sri Guru Ram Dass Jee International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 31.7096,
    "lon": 74.7973,
    "state": "Punjab"
  },
  {
    "code": "VNS",
    "city": "Varanasi",
    "name": "Lal Bahadur Shastri International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 25.4524,
    "lon": 82.8593,
    "state": "Uttar Pradesh"
  },
  {
    "code": "COK",
    "city": "Kochi",
    "name": "Cochin International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 10.152,
    "lon": 76.4019,
    "state": "Kerala"
  },
  {
    "code": "TRV",
    "city": "Thiruvananthapuram",
    "name": "Trivandrum International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 8.4821,
    "lon": 76.9201,
    "state": "Kerala"
  },
  {
    "code": "CCJ",
    "city": "Calicut",
    "name": "Calicut International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 11.1368,
    "lon": 75.9553,
    "state": "Kerala"
  },
  {
    "code": "IXE",
    "city": "Mangaluru",
    "name": "Mangalore International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 12.9613,
    "lon": 74.8901,
    "state": "Karnataka"
  },
  {
    "code": "CJB",
    "city": "Coimbatore",
    "name": "Coimbatore International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 11.03,
    "lon": 77.0434,
    "state": "Tamil Nadu"
  },
  {
    "code": "IXM",
    "city": "Madurai",
    "name": "Madurai Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 9.8345,
    "lon": 78.0934,
    "state": "Tamil Nadu"
  },
  {
    "code": "GOI",
    "city": "Goa",
    "name": "Goa International Airport (Dabolim)",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 15.3808,
    "lon": 73.8314,
    "state": "Goa"
  },
  {
    "code": "GOX",
    "city": "Goa",
    "name": "Manohar International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 15.7443,
    "lon": 73.8606,
    "state": "Goa"
  },
  {
    "code": "GAU",
    "city": "Guwahati",
    "name": "Lokpriya Gopinath Bordoloi International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 26.1061,
    "lon": 91.5859,
    "state": "Assam"
  },
  {
    "code": "IMF",
    "city": "Imphal",
    "name": "Imphal International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 24.76,
    "lon": 93.8967,
    "state": "Manipur"
  },
  {
    "code": "IXA",
    "city": "Agartala",
    "name": "Maharaja Bir Bikram Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 23.886,
    "lon": 91.2404,
    "state": "Tripura"
  },
  {
    "code": "BBI",
    "city": "Bhubaneswar",
    "name": "Biju Patnaik International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 20.2444,
    "lon": 85.8178,
    "state": "Odisha"
  },
  {
    "code": "NAG",
    "city": "Nagpur",
    "name": "Dr. Babasaheb Ambedkar International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 21.0922,
    "lon": 79.0472,
    "state": "Maharashtra"
  },
  {
    "code": "VGA",
    "city": "Vijayawada",
    "name": "Vijayawada International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 16.5304,
    "lon": 80.7968,
    "state": "Andhra Pradesh"
  },
  {
    "code": "VTZ",
    "city": "Visakhapatnam",
    "name": "Visakhapatnam International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 17.7212,
    "lon": 83.2245,
    "state": "Andhra Pradesh"
  },
  {
    "code": "IXZ",
    "city": "Port Blair",
    "name": "Veer Savarkar International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 11.6412,
    "lon": 92.7297,
    "state": "Andaman and Nicobar Islands"
  },
  {
    "code": "IXC",
    "city": "Chandigarh",
    "name": "Shaheed Bhagat Singh International Airport",
    "type": "International",
    "flag": "🇮🇳",
    "lat": 30.6735,
    "lon": 76.7885,
    "state": "Chandigarh"
  },
  {
    "code": "PNQ",
    "city": "Pune",
    "name": "Pune Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 18.5821,
    "lon": 73.9197,
    "state": "Maharashtra"
  },
  {
    "code": "PAT",
    "city": "Patna",
    "name": "Jay Prakash Narayan Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 25.5913,
    "lon": 85.088,
    "state": "Bihar"
  },
  {
    "code": "SXR",
    "city": "Srinagar",
    "name": "Srinagar Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 33.9871,
    "lon": 74.7742,
    "state": "Jammu and Kashmir"
  },
  {
    "code": "IXJ",
    "city": "Jammu",
    "name": "Jammu Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 32.6891,
    "lon": 74.8374,
    "state": "Jammu and Kashmir"
  },
  {
    "code": "IXL",
    "city": "Leh",
    "name": "Kushok Bakula Rimpochee Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 34.1359,
    "lon": 77.5465,
    "state": "Ladakh"
  },
  {
    "code": "RPR",
    "city": "Raipur",
    "name": "Swami Vivekananda Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.1804,
    "lon": 81.7388,
    "state": "Chhattisgarh"
  },
  {
    "code": "IXR",
    "city": "Ranchi",
    "name": "Birsa Munda Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 23.3143,
    "lon": 85.3217,
    "state": "Jharkhand"
  },
  {
    "code": "DIB",
    "city": "Dibrugarh",
    "name": "Dibrugarh Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 27.4839,
    "lon": 95.0169,
    "state": "Assam"
  },
  {
    "code": "IXS",
    "city": "Silchar",
    "name": "Silchar Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 24.9129,
    "lon": 92.9787,
    "state": "Assam"
  },
  {
    "code": "TIR",
    "city": "Tirupati",
    "name": "Tirupati Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 13.6325,
    "lon": 79.5433,
    "state": "Andhra Pradesh"
  },
  {
    "code": "STV",
    "city": "Surat",
    "name": "Surat Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.1141,
    "lon": 72.7418,
    "state": "Gujarat"
  },
  {
    "code": "UDR",
    "city": "Udaipur",
    "name": "Maharana Pratap Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 24.6177,
    "lon": 73.8961,
    "state": "Rajasthan"
  },
  {
    "code": "JDH",
    "city": "Jodhpur",
    "name": "Jodhpur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.2511,
    "lon": 73.0489,
    "state": "Rajasthan"
  },
  {
    "code": "JSA",
    "city": "Jaisalmer",
    "name": "Jaisalmer Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.8887,
    "lon": 70.8647,
    "state": "Rajasthan"
  },
  {
    "code": "BKB",
    "city": "Bikaner",
    "name": "Nal Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 28.0706,
    "lon": 73.2072,
    "state": "Rajasthan"
  },
  {
    "code": "DED",
    "city": "Dehradun",
    "name": "Jolly Grant Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 30.1897,
    "lon": 78.1803,
    "state": "Uttarakhand"
  },
  {
    "code": "PGH",
    "city": "Pantnagar",
    "name": "Pantnagar Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 29.0334,
    "lon": 79.4737,
    "state": "Uttarakhand"
  },
  {
    "code": "KNU",
    "city": "Kanpur",
    "name": "Kanpur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.4414,
    "lon": 80.3649,
    "state": "Uttar Pradesh"
  },
  {
    "code": "IXD",
    "city": "Prayagraj",
    "name": "Prayagraj Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 25.4401,
    "lon": 81.7339,
    "state": "Uttar Pradesh"
  },
  {
    "code": "GOP",
    "city": "Gorakhpur",
    "name": "Gorakhpur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.7397,
    "lon": 83.4497,
    "state": "Uttar Pradesh"
  },
  {
    "code": "BEK",
    "city": "Bareilly",
    "name": "Bareilly Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 28.4221,
    "lon": 79.4508,
    "state": "Uttar Pradesh"
  },
  {
    "code": "JRG",
    "city": "Jharsuguda",
    "name": "Veer Surendra Sai Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.9135,
    "lon": 84.0504,
    "state": "Odisha"
  },
  {
    "code": "IXG",
    "city": "Belagavi",
    "name": "Belagavi Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 15.8593,
    "lon": 74.6183,
    "state": "Karnataka"
  },
  {
    "code": "HBX",
    "city": "Hubli",
    "name": "Hubli Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 15.3617,
    "lon": 75.0849,
    "state": "Karnataka"
  },
  {
    "code": "MYQ",
    "city": "Mysuru",
    "name": "Mysore Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 12.2304,
    "lon": 76.6558,
    "state": "Karnataka"
  },
  {
    "code": "IXU",
    "city": "Aurangabad",
    "name": "Aurangabad Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 19.8627,
    "lon": 75.3981,
    "state": "Maharashtra"
  },
  {
    "code": "ISK",
    "city": "Nashik",
    "name": "Nashik Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 20.1191,
    "lon": 73.9129,
    "state": "Maharashtra"
  },
  {
    "code": "KLH",
    "city": "Kolhapur",
    "name": "Kolhapur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 16.6647,
    "lon": 74.2894,
    "state": "Maharashtra"
  },
  {
    "code": "SAG",
    "city": "Shirdi",
    "name": "Shirdi Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 19.6886,
    "lon": 74.3789,
    "state": "Maharashtra"
  },
  {
    "code": "AKD",
    "city": "Akola",
    "name": "Akola Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 20.699,
    "lon": 77.0586,
    "state": "Maharashtra"
  },
  {
    "code": "BHU",
    "city": "Bhavnagar",
    "name": "Bhavnagar Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.7522,
    "lon": 72.1852,
    "state": "Gujarat"
  },
  {
    "code": "BHJ",
    "city": "Bhuj",
    "name": "Bhuj Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 23.2878,
    "lon": 69.6702,
    "state": "Gujarat"
  },
  {
    "code": "JGA",
    "city": "Jamnagar",
    "name": "Jamnagar Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 22.4655,
    "lon": 70.0126,
    "state": "Gujarat"
  },
  {
    "code": "IXY",
    "city": "Kandla",
    "name": "Kandla Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 23.1127,
    "lon": 70.1003,
    "state": "Gujarat"
  },
  {
    "code": "PBD",
    "city": "Porbandar",
    "name": "Porbandar Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.6487,
    "lon": 69.6572,
    "state": "Gujarat"
  },
  {
    "code": "RAJ",
    "city": "Rajkot",
    "name": "Rajkot Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 22.3092,
    "lon": 70.7795,
    "state": "Gujarat"
  },
  {
    "code": "IXK",
    "city": "Keshod",
    "name": "Keshod Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.3171,
    "lon": 70.2704,
    "state": "Gujarat"
  },
  {
    "code": "BDQ",
    "city": "Vadodara",
    "name": "Vadodara Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 22.3362,
    "lon": 73.2263,
    "state": "Gujarat"
  },
  {
    "code": "DHM",
    "city": "Dharamshala",
    "name": "Kangra Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 32.1651,
    "lon": 76.2634,
    "state": "Himachal Pradesh"
  },
  {
    "code": "SLV",
    "city": "Shimla",
    "name": "Shimla Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 31.0818,
    "lon": 77.068,
    "state": "Himachal Pradesh"
  },
  {
    "code": "KUU",
    "city": "Kullu",
    "name": "Kullu-Manali Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 31.8767,
    "lon": 77.1544,
    "state": "Himachal Pradesh"
  },
  {
    "code": "GAY",
    "city": "Gaya",
    "name": "Gaya Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 24.7443,
    "lon": 84.9512,
    "state": "Bihar"
  },
  {
    "code": "MZU",
    "city": "Muzaffarpur",
    "name": "Muzaffarpur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.1191,
    "lon": 85.3137,
    "state": "Bihar"
  },
  {
    "code": "DBR",
    "city": "Darbhanga",
    "name": "Darbhanga Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.1949,
    "lon": 85.9167,
    "state": "Bihar"
  },
  {
    "code": "PAB",
    "city": "Bilaspur",
    "name": "Bilaspur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 21.9884,
    "lon": 82.111,
    "state": "Chhattisgarh"
  },
  {
    "code": "JGB",
    "city": "Jagdalpur",
    "name": "Jagdalpur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 19.0743,
    "lon": 82.0368,
    "state": "Chhattisgarh"
  },
  {
    "code": "JLR",
    "city": "Jabalpur",
    "name": "Jabalpur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 23.1778,
    "lon": 80.052,
    "state": "Madhya Pradesh"
  },
  {
    "code": "BHO",
    "city": "Bhopal",
    "name": "Raja Bhoj Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 23.2875,
    "lon": 77.3374,
    "state": "Madhya Pradesh"
  },
  {
    "code": "GWL",
    "city": "Gwalior",
    "name": "Rajmata Vijaya Raje Scindia Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.2933,
    "lon": 78.2278,
    "state": "Madhya Pradesh"
  },
  {
    "code": "HJR",
    "city": "Khajuraho",
    "name": "Khajuraho Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 24.8172,
    "lon": 79.9186,
    "state": "Madhya Pradesh"
  },
  {
    "code": "REW",
    "city": "Rewa",
    "name": "Rewa Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 24.5034,
    "lon": 81.2203,
    "state": "Madhya Pradesh"
  },
  {
    "code": "KQH",
    "city": "Kishangarh",
    "name": "Kishangarh Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 26.6015,
    "lon": 74.8141,
    "state": "Rajasthan"
  },
  {
    "code": "AJL",
    "city": "Aizawl",
    "name": "Lengpui Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 23.8406,
    "lon": 92.6197,
    "state": "Mizoram"
  },
  {
    "code": "DMU",
    "city": "Dimapur",
    "name": "Dimapur Airport",
    "type": "Domestic",
    "flag": "🇮🇳",
    "lat": 25.8839,
    "lon": 93.7711,
    "state": "Nagaland"
  }
];

export function filterAirports(query) {
  const term = query.trim().toLowerCase();
  if (term.length < 1) return [];
  return INDIA_AIRPORTS.map((airport) => {
    const code = airport.code.toLowerCase();
    const city = airport.city.toLowerCase();
    const name = airport.name.toLowerCase();
    let score = 0;
    if (code === term) score = 100;
    else if (city.startsWith(term)) score = 80;
    else if (city.includes(term)) score = 60;
    else if (name.includes(term) || code.includes(term)) score = 40;
    return { airport, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, 8)
    .map((item) => item.airport);
}

export function useAirportSearch(query) {
  const [isLoading] = useState(false);
  const results = useMemo(() => filterAirports(query), [query]);
  const clearResults = () => undefined;
  return { results, isLoading, clearResults };
}
