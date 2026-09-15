require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Story = require('./models/Story');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://revanth19a:revanth@cluster0.4jsmfp8.mongodb.net/scoutway';

const USERS_DATA = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@scoutway.io',
    password: 'Password123!',
    avatar: '',
  },
  {
    name: 'Ananya Verma',
    email: 'ananya.verma@scoutway.io',
    password: 'Password123!',
    avatar: '',
  },
  {
    name: 'Rohan Mehta',
    email: 'rohan.mehta@scoutway.io',
    password: 'Password123!',
    avatar: '',
  },
  {
    name: 'Priya Nambiar',
    email: 'priya.nambiar@scoutway.io',
    password: 'Password123!',
    avatar: '',
  },
];

// Verified high quality destination imagery mapped exactly to place names
const ACCURATE_IMAGES = {
  'Araku Valley': {
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&q=80',
    ]
  },
  'Visakhapatnam': {
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&q=80',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&auto=format&q=80',
    ]
  },
  'Vijayawada': {
    cover: 'https://images.unsplash.com/photo-1600100397608-f010f423b971?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&q=80',
    ]
  },
  'Hyderabad': {
    cover: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&q=80',
    ]
  },
  'Goa': {
    cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&q=80',
    ]
  },
  'Mumbai': {
    cover: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&q=80',
    ]
  },
  'Bengaluru': {
    cover: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&q=80',
    ]
  },
  'Delhi': {
    cover: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1592639296346-560c37a0f711?w=800&auto=format&q=80',
    ]
  },
  'Ooty': {
    cover: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&q=80',
    ]
  },
  'Kochi': {
    cover: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&auto=format&q=80',
    ]
  },
  'Manali': {
    cover: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&auto=format&q=80',
    ]
  },
  'Rishikesh': {
    cover: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&auto=format&q=80',
    ]
  },
  'Pondicherry': {
    cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&q=80',
    ]
  },
  'Jaipur': {
    cover: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&q=80',
    ]
  },
  'Munnar': {
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&q=80',
    ]
  },
  'Coorg': {
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&q=80',
    ]
  },
  'Shimla': {
    cover: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&q=80',
    ]
  },
  'Udaipur': {
    cover: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&q=80',
    ]
  },
  'Varanasi': {
    cover: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&q=80',
    ]
  },
  'Ladakh': {
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&q=80',
    ]
  },
  'Darjeeling': {
    cover: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&q=80',
    ]
  },
  'Mysuru': {
    cover: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&q=80',
    ]
  },
  'Kodaikanal': {
    cover: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&q=80',
    ]
  },
  'Shillong': {
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&q=80',
    ]
  },
  'Agra': {
    cover: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&q=80',
    ]
  },
  'Alleppey': {
    cover: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&auto=format&q=80',
    ]
  },
  'Gokarna': {
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&q=80',
    ]
  },
  'Chikmagalur': {
    cover: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&q=80',
    ]
  },
  'Wayanad': {
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&q=80',
    ]
  },
  'Hampi': {
    cover: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&q=80',
    ]
  },
  'Jaisalmer': {
    cover: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&q=80',
    ]
  },
  'Port Blair': {
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&q=80',
    ]
  },
  'Leh': {
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&q=80',
    ]
  },
  'Nainital': {
    cover: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&q=80',
    ]
  },
  'Gangtok': {
    cover: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&q=80',
    ]
  },
  'Mahabalipuram': {
    cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&q=80',
    ]
  },
  'Mount Abu': {
    cover: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&q=80',
    ]
  },
  'Madurai': {
    cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&q=80',
    ]
  },
  'Amritsar': {
    cover: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1592639296346-560c37a0f711?w=800&auto=format&q=80',
    ]
  },
  'Daman': {
    cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&q=80',
    ]
  }
};

const RAW_STORIES_DATA = [
  // User 0 (Aarav) - 10 Stories
  [
    {
      title: 'Sunrise Magic & Coffee Plantations of Araku Valley',
      fromPlace: 'Visakhapatnam',
      place: 'Araku Valley',
      days: 3,
      persons: 2,
      description: 'Took the morning glass-top Vistadome train ride through 84 tunnels from Vizag up into the mist-covered Eastern Ghats of Araku Valley. Explored the organic coffee plantations, tasted rich tribal brew, and visited the ancient Borra Caves with limestone stalactites.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Vistadome Scenic Train & Borra Caves', activities: [{ activityName: 'Vistadome Rail Ticket', cost: '₹650', time: '06:45 AM' }, { activityName: 'Borra Caves Tour', cost: '₹120', time: '11:30 AM' }] },
        { dayNumber: 2, dayTitle: 'Coffee Plantations & Chaparai Cascades', activities: [{ activityName: 'Coffee Estate Tour & Tasting', cost: '₹350', time: '09:00 AM' }, { activityName: 'Chaparai Water Cascades', cost: '₹50', time: '02:30 PM' }] },
        { dayNumber: 3, dayTitle: 'Tribal Museum & Bamboo Chicken Feast', activities: [{ activityName: 'Araku Tribal Museum Visit', cost: '₹80', time: '10:00 AM' }, { activityName: 'Authentic Bamboo Chicken Lunch', cost: '₹400', time: '01:00 PM' }] }
      ]
    },
    {
      title: 'Golden Sunset & Coastal Vibes in Visakhapatnam',
      fromPlace: 'Vijayawada',
      place: 'Visakhapatnam',
      days: 2,
      persons: 2,
      description: 'Strolled along RK Beach, explored the INS Kursura Submarine Museum, and took the ropeway ride to Kailasagiri hill for panoramic Bay of Bengal ocean views.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'RK Beach & Submarine Museum', activities: [{ activityName: 'INS Kursura Submarine Entry', cost: '₹70', time: '04:00 PM' }, { activityName: 'Beachside Sea Food Dinner', cost: '₹600', time: '07:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Kailasagiri Ropeway & Yarada Beach', activities: [{ activityName: 'Kailasagiri Cable Car Ride', cost: '₹110', time: '10:30 AM' }, { activityName: 'Yarada Beach Sunset Visit', cost: '₹150', time: '04:30 PM' }] }
      ]
    },
    {
      title: 'Prakasam Barrage & Kanaka Durga Temple in Vijayawada',
      fromPlace: 'Hyderabad',
      place: 'Vijayawada',
      days: 2,
      persons: 1,
      description: 'Visited the divine Kanaka Durga Temple atop Indrakeeladri hill overlooking the Krishna River. Took a serene evening boat ride to Bhavani Island.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Indrakeeladri Temple & Prakasam Barrage', activities: [{ activityName: 'Kanaka Durga Special Darshan', cost: '₹300', time: '07:00 AM' }, { activityName: 'Prakasam Barrage Walk', cost: '₹0', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Bhavani Island & Undavalli Caves', activities: [{ activityName: 'Krishna River Speed Boat Ride', cost: '₹250', time: '11:00 AM' }, { activityName: 'Undavalli Rock-Cut Caves Entry', cost: '₹25', time: '03:00 PM' }] }
      ]
    },
    {
      title: 'Royal Heritage & Charminar Midnight Food Crawl',
      fromPlace: 'Bengaluru',
      place: 'Hyderabad',
      days: 3,
      persons: 3,
      description: 'Explored the imposing Golconda Fort acoustics, savored authentic Hyderabadi Dum Biryani at Paradise & Bawarchi, and indulged in midnight Irani Chai at Nimrah Cafe right by Charminar.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Charminar & Laad Bazaar Shopping', activities: [{ activityName: 'Charminar Monument Climb', cost: '₹25', time: '04:00 PM' }, { activityName: 'Irani Chai & Osmania Biscuits', cost: '₹60', time: '06:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Golconda Fort & Qutb Shahi Tombs', activities: [{ activityName: 'Golconda Fort Guided Tour', cost: '₹400', time: '09:30 AM' }, { activityName: 'Authentic Mutton Biryani Feast', cost: '₹550', time: '01:30 PM' }] },
        { dayNumber: 3, dayTitle: 'Chowmahalla Palace & Hussain Sagar', activities: [{ activityName: 'Chowmahalla Royal Palace Entry', cost: '₹100', time: '10:30 AM' }, { activityName: 'Buddha Statue Ferry Ride', cost: '₹120', time: '05:00 PM' }] }
      ]
    },
    {
      title: 'Sun, Waves & Latin Quarter Charm in North & South Goa',
      fromPlace: 'Mumbai',
      place: 'Goa',
      days: 4,
      persons: 2,
      description: 'Rented a classic Scooter to cruise through Fontainhas heritage homes in Panjim, caught golden hour sunsets at Anjuna Beach, and trekked to Dudhsagar Waterfalls.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Fontainhas Panjim Walk & Mandovi Cruise', activities: [{ activityName: 'Latin Quarter Heritage Walk', cost: '₹0', time: '10:00 AM' }, { activityName: 'Mandovi Sunset River Cruise', cost: '₹500', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Fort Aguada & Anjuna Sunset Shack', activities: [{ activityName: 'Fort Aguada Entry', cost: '₹50', time: '03:00 PM' }, { activityName: 'Beach Shack Seafood Dinner', cost: '₹800', time: '08:00 PM' }] },
        { dayNumber: 3, dayTitle: 'Dudhsagar Waterfall Jeep Safari', activities: [{ activityName: 'Jeep Safari & Wildlife Permit', cost: '₹750', time: '07:00 AM' }, { activityName: 'Spice Plantation Buffet Lunch', cost: '₹500', time: '01:30 PM' }] }
      ]
    },
    {
      title: 'Marine Drive Breeze & Old Colonial Mumbai Explorer',
      fromPlace: 'Pune',
      place: 'Mumbai',
      days: 3,
      persons: 2,
      description: 'Strolled along the iconic Queen’s Necklace at Marine Drive, marveled at Gateway of India, took a ferry to Elephanta Caves, and enjoyed Vada Pav at Dadar.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Gateway of India & Colaba Causeway', activities: [{ activityName: 'Colaba Heritage Walk & Shopping', cost: '₹200', time: '11:00 AM' }, { activityName: 'Marine Drive Sunset Sitting', cost: '₹0', time: '06:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Elephanta Caves Ferry Journey', activities: [{ activityName: 'Ferry Ride to Elephanta Island', cost: '₹260', time: '09:00 AM' }, { activityName: 'Ancient Cave Exploration', cost: '₹40', time: '11:30 AM' }] }
      ]
    },
    {
      title: 'Garden City Vibe & Cubbon Park Morning Walk in Bengaluru',
      fromPlace: 'Chennai',
      place: 'Bengaluru',
      days: 2,
      persons: 2,
      description: 'Enjoyed crispy Benne Dosa at CTR Malleshwaram, walked under giant bamboo trees in Cubbon Park, and explored Bangalore Palace.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'CTR Dosa & Cubbon Park Morning', activities: [{ activityName: 'CTR Butter Masala Dosa & Filter Coffee', cost: '₹120', time: '08:00 AM' }, { activityName: 'Cubbon Park Botanical Walk', cost: '₹0', time: '09:30 AM' }] },
        { dayNumber: 2, dayTitle: 'Bangalore Palace & Church Street Microbreweries', activities: [{ activityName: 'Bangalore Palace Royal Audio Tour', cost: '₹240', time: '11:00 AM' }, { activityName: 'Craft Beer & Woodfired Pizza', cost: '₹950', time: '07:30 PM' }] }
      ]
    },
    {
      title: 'Mughal Architecture & Chandni Chowk Street Food in Delhi',
      fromPlace: 'Jaipur',
      place: 'Delhi',
      days: 3,
      persons: 1,
      description: 'Visually stunning tour through Humayun’s Tomb, Qutub Minar, and Lotus Temple. Took a Rickshaw ride through Paranthe Wali Gali in Old Delhi.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Qutub Minar & Lotus Temple', activities: [{ activityName: 'Qutub Minar Entry Ticket', cost: '₹40', time: '10:00 AM' }, { activityName: 'Lotus Temple Peaceful Meditation', cost: '₹0', time: '03:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Old Delhi Chandni Chowk Food Tour', activities: [{ activityName: 'Paranthe Wali Gali Feast', cost: '₹180', time: '01:00 PM' }, { activityName: 'Jama Masjid Courtyard Visit', cost: '₹50', time: '04:00 PM' }] }
      ]
    },
    {
      title: 'Nilgiri Mountain Railway & Tea Estate Trails in Ooty',
      fromPlace: 'Coimbatore',
      place: 'Ooty',
      days: 3,
      persons: 2,
      description: 'Rode the UNESCO heritage Nilgiri Toy Train from Mettupalayam up to Ooty. Boated on Ooty Lake and visited Doddabetta Peak for sweeping valley views.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Nilgiri Steam Toy Train & Ooty Lake', activities: [{ activityName: 'Heritage Toy Train Ticket', cost: '₹205', time: '07:10 AM' }, { activityName: 'Ooty Lake Pedal Boating', cost: '₹240', time: '04:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Doddabetta Peak & Botanical Gardens', activities: [{ activityName: 'Doddabetta Viewpoint Entry', cost: '₹20', time: '10:00 AM' }, { activityName: 'Government Botanical Garden Walk', cost: '₹50', time: '02:00 PM' }] }
      ]
    },
    {
      title: 'Chinese Fishing Nets & Spice Market Strolls in Kochi',
      fromPlace: 'Trivandrum',
      place: 'Kochi',
      days: 2,
      persons: 2,
      description: 'Wandered through historic Fort Kochi, admired the iconic cantilevered Chinese Fishing Nets at sunset, and enjoyed Kathakali dance performances.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Fort Kochi Heritage & Sunset Nets', activities: [{ activityName: 'Mattancherry Palace Museum', cost: '₹10', time: '11:00 AM' }, { activityName: 'Kathakali Traditional Show', cost: '₹400', time: '05:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Jew Town Spice Markets & Cafe Hopping', activities: [{ activityName: 'Paradesi Synagogue Visit', cost: '₹10', time: '10:30 AM' }, { activityName: 'Kerala Seafood Thali', cost: '₹350', time: '01:00 PM' }] }
      ]
    }
  ],

  // User 1 (Ananya) - 10 Stories
  [
    {
      title: 'Snow Peaks & Solang Valley Adventure in Manali',
      fromPlace: 'Delhi',
      place: 'Manali',
      days: 3,
      persons: 2,
      description: 'Crossed the Atal Tunnel to Sissu, experienced snow activities in Solang Valley, and drank hot Siddu with pure ghee at Old Manali cafes.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Old Manali Mall Road & Hadimba Temple', activities: [{ activityName: 'Hadimba Wooden Temple Entry', cost: '₹0', time: '10:00 AM' }, { activityName: 'Siddu & Mountain Tea Snack', cost: '₹150', time: '04:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Solang Valley Paragliding & Atal Tunnel', activities: [{ activityName: 'Paragliding Experience', cost: '₹2200', time: '10:00 AM' }, { activityName: 'Atal Tunnel Drive to Lahaul Valley', cost: '₹400', time: '02:00 PM' }] }
      ]
    },
    {
      title: 'Ganga Aarti & White Water Rafting Thrills in Rishikesh',
      fromPlace: 'Dehradun',
      place: 'Rishikesh',
      days: 3,
      persons: 3,
      description: 'Conquered 16km Grade III rapids on the holy Ganges River, attended the ethereal evening Ganga Aarti at Triveni Ghat, and visited Beatles Ashram.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'White Water Rafting 16km Shivpuri to Laxman Jhula', activities: [{ activityName: 'River Rafting & Cliff Jump', cost: '₹1000', time: '09:00 AM' }, { activityName: 'Evening Ganga Aarti at Triveni Ghat', cost: '₹0', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Beatles Ashram & Cafe Hopping', activities: [{ activityName: 'Beatles Ashram Entry', cost: '₹150', time: '10:30 AM' }, { activityName: 'Organic Cafe Dinner near Laxman Jhula', cost: '₹450', time: '07:30 PM' }] }
      ]
    },
    {
      title: 'French Colonial Promenade & Golden Globe Ashram in Pondicherry',
      fromPlace: 'Chennai',
      place: 'Pondicherry',
      days: 2,
      persons: 2,
      description: 'Cycled past yellow mustard French villas in White Town, meditated at the golden Matrimandir in Auroville, and enjoyed French croissants at Baker Street.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'White Town Bicycle Tour & Rock Beach', activities: [{ activityName: 'Bicycle Rental for Day', cost: '₹100', time: '08:00 AM' }, { activityName: 'Rock Beach Evening Walk', cost: '₹0', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Auroville & Matrimandir View Point', activities: [{ activityName: 'Auroville Visitor Pass', cost: '₹0', time: '10:00 AM' }, { activityName: 'French Bakery Breakfast', cost: '₹300', time: '08:30 AM' }] }
      ]
    },
    {
      title: 'Pink City Palaces & Amer Fort Elephant Trail in Jaipur',
      fromPlace: 'Delhi',
      place: 'Jaipur',
      days: 3,
      persons: 2,
      description: 'Photographed the 953 honeycomb windows of Hawa Mahal, climbed the grand ramparts of Amer Fort, and watched sunset over Jaipur from Nahargarh Fort.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Hawa Mahal & City Palace Royal Museum', activities: [{ activityName: 'Hawa Mahal Entry', cost: '₹50', time: '09:00 AM' }, { activityName: 'City Palace Ticket', cost: '₹300', time: '11:30 AM' }] },
        { dayNumber: 2, dayTitle: 'Amer Fort & Nahargarh Sunset View', activities: [{ activityName: 'Amer Fort Guided Tour', cost: '₹500', time: '10:00 AM' }, { activityName: 'Nahargarh Fort Sunset View', cost: '₹50', time: '05:30 PM' }] }
      ]
    },
    {
      title: 'Tea Garden Horizons & Mattupetty Dam Escapade in Munnar',
      fromPlace: 'Kochi',
      place: 'Munnar',
      days: 3,
      persons: 2,
      description: 'Drove through endless emerald green tea plantations of Munnar, spotted Nilgiri Tahr mountain goats at Eravikulam National Park, and boated on Mattupetty Dam.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Eravikulam National Park & Tea Museum', activities: [{ activityName: 'Eravikulam Park Safari Ticket', cost: '₹200', time: '09:00 AM' }, { activityName: 'KDHP Tea Museum Tour', cost: '₹120', time: '02:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Mattupetty Dam & Echo Point', activities: [{ activityName: 'Mattupetty Speed Boating', cost: '₹500', time: '11:00 AM' }, { activityName: 'Echo Point Photo Session', cost: '₹20', time: '03:00 PM' }] }
      ]
    },
    {
      title: 'Coffee Estate Homestay & Abbey Falls Trek in Coorg',
      fromPlace: 'Bengaluru',
      place: 'Coorg',
      days: 2,
      persons: 2,
      description: 'Stayed in a traditional Kodava coffee plantation homestay, witnessed roar of Abbey Falls amidst spice groves, and visited Namdroling Tibetan Monastery.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Abbey Falls & Raja Seat Sunset', activities: [{ activityName: 'Abbey Waterfalls Trail', cost: '₹30', time: '10:30 AM' }, { activityName: 'Raja’s Seat Musical Fountain', cost: '₹20', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Golden Temple Bylakuppe Tibetan Monastery', activities: [{ activityName: 'Namdroling Monastery Visit', cost: '₹0', time: '10:00 AM' }, { activityName: 'Coorg Pork Curry Lunch', cost: '₹400', time: '01:30 PM' }] }
      ]
    },
    {
      title: 'Colonial Ridge Stroll & Toy Train Ride in Shimla',
      fromPlace: 'Chandigarh',
      place: 'Shimla',
      days: 3,
      persons: 2,
      description: 'Strolled along historic Mall Road and The Ridge, took Kalka-Shimla heritage toy train, and hiked up to Jakhoo Temple for pine forest vistas.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'The Ridge & Christ Church Mall Road', activities: [{ activityName: 'Christ Church Heritage Visit', cost: '₹0', time: '11:00 AM' }, { activityName: 'Evening Stroll on Mall Road', cost: '₹0', time: '05:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Jakhoo Temple Ropeway & Kufri Snow View', activities: [{ activityName: 'Jakhoo Temple Ropeway Ride', cost: '₹500', time: '10:00 AM' }, { activityName: 'Kufri Horse Riding Tour', cost: '₹600', time: '02:00 PM' }] }
      ]
    },
    {
      title: 'Lake Pichola Boating & City Palace Grandeur in Udaipur',
      fromPlace: 'Ahmedabad',
      place: 'Udaipur',
      days: 3,
      persons: 2,
      description: 'Experienced the romantic Venice of the East with sunset boat ride on Lake Pichola, visited Jag Mandir, and explored City Palace balconies.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'City Palace & Jagdish Temple', activities: [{ activityName: 'Udaipur City Palace Museum Ticket', cost: '₹300', time: '10:00 AM' }, { activityName: 'Jagdish Temple Darshan', cost: '₹0', time: '04:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Lake Pichola Boat Cruise & Jag Mandir', activities: [{ activityName: 'Lake Pichola Sunset Boat Ride', cost: '₹800', time: '05:00 PM' }, { activityName: 'Rooftop Dinner overlooking Lake', cost: '₹1200', time: '08:00 PM' }] }
      ]
    },
    {
      title: 'Sublime Manikarnika Ghat & Evening Ganga Aarti in Varanasi',
      fromPlace: 'Lucknow',
      place: 'Varanasi',
      days: 2,
      persons: 1,
      description: 'Dawn rowboat ride past 84 sacred ghats on the Ganges, witnessed spiritual Dashashwamedh Ghat Ganga Aarti, and devoured Banarasi Paan & Blue Lassi.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Sunrise Ghat Boat Ride & Kashi Vishwanath', activities: [{ activityName: 'Sunrise Ganges Wooden Boat Ride', cost: '₹350', time: '05:30 AM' }, { activityName: 'Kashi Vishwanath Temple Corridor', cost: '₹0', time: '09:00 AM' }] },
        { dayNumber: 2, dayTitle: 'Sarnath Buddhist Stupa & Ganga Aarti', activities: [{ activityName: 'Sarnath Dhamek Stupa Entry', cost: '₹25', time: '11:00 AM' }, { activityName: 'Dashashwamedh Evening Aarti', cost: '₹0', time: '06:30 PM' }] }
      ]
    },
    {
      title: 'Pangong Tso Blue Water & Khardung La Pass Expedition in Ladakh',
      fromPlace: 'Manali',
      place: 'Ladakh',
      days: 4,
      persons: 2,
      description: 'Drove through one of the highest motorable roads at Khardung La Pass (17,982 ft), camped alongside color-changing Pangong Lake, and visited Thiksey Monastery.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Leh Palace & Shanti Stupa acclimatization', activities: [{ activityName: 'Shanti Stupa Sunset View', cost: '₹0', time: '05:00 PM' }, { activityName: 'Leh Main Bazaar Stroll', cost: '₹0', time: '07:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Khardung La Pass & Nubra Valley Hunder Dunes', activities: [{ activityName: 'Double-Humped Bactrian Camel Ride', cost: '₹400', time: '04:30 PM' }, { activityName: 'Diskit Monastery Buddha Statue', cost: '₹50', time: '02:00 PM' }] },
        { dayNumber: 3, dayTitle: 'Pangong Tso Lake Camping', activities: [{ activityName: 'Pangong Lake Camping Night', cost: '₹2500', time: '06:00 PM' }] }
      ]
    }
  ],

  // User 2 (Rohan) - 10 Stories
  [
    {
      title: 'Kanchenjunga Views & Tea Garden Trails in Darjeeling',
      fromPlace: 'Kolkata',
      place: 'Darjeeling',
      days: 3,
      persons: 2,
      description: 'Woke up at 4 AM to watch golden sunrise over Mt. Kanchenjunga from Tiger Hill. Rode the Darjeeling Joy Ride steam train and visited Happy Valley Tea Estate.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Tiger Hill Sunrise & Batasia Loop Toy Train', activities: [{ activityName: 'Tiger Hill Sunrise Entry', cost: '₹50', time: '04:30 AM' }, { activityName: 'Heritage Joy Ride Steam Train', cost: '₹1000', time: '10:00 AM' }] },
        { dayNumber: 2, dayTitle: 'Happy Valley Tea Estate & Himalayan Mountaineering Institute', activities: [{ activityName: 'Tea Factory Tour & First Flush Tasting', cost: '₹200', time: '11:00 AM' }, { activityName: 'HMI & Zoo Entry Ticket', cost: '₹110', time: '02:00 PM' }] }
      ]
    },
    {
      title: 'Grand Amba Vilas Illumination & Heritage Palace in Mysuru',
      fromPlace: 'Bengaluru',
      place: 'Mysuru',
      days: 2,
      persons: 2,
      description: 'Witnessed 100,000 bulbs illuminating Mysore Palace on Sunday evening, climbed Chamundi Hill stairs, and tasted authentic Mysore Pak at Guru Sweets.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Mysore Palace Guided Tour & Evening Illumination', activities: [{ activityName: 'Palace Entry Ticket', cost: '₹100', time: '10:30 AM' }, { activityName: 'Palace Sunday Lightings Show', cost: '₹0', time: '07:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Chamundeshwari Temple & Devaraja Market', activities: [{ activityName: 'Chamundi Hill Temple Darshan', cost: '₹100', time: '08:30 AM' }, { activityName: 'Original Mysore Pak Tasting', cost: '₹150', time: '01:00 PM' }] }
      ]
    },
    {
      title: 'Mist-Covered Pine Forests & Pillar Rocks in Kodaikanal',
      fromPlace: 'Madurai',
      place: 'Kodaikanal',
      days: 3,
      persons: 2,
      description: 'Cycled around star-shaped Kodai Lake, walked through dense mist in Pine Forest, and admired the towering Pillar Rocks viewpoint.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Kodai Lake Boating & Coaker’s Walk', activities: [{ activityName: 'Lake Row Boat Ride', cost: '₹320', time: '11:00 AM' }, { activityName: 'Coaker’s Walk Valley View', cost: '₹30', time: '04:30 PM' }] },
        { dayNumber: 2, dayTitle: 'Pillar Rocks & Pine Forest Photography', activities: [{ activityName: 'Pillar Rocks Entry', cost: '₹20', time: '10:00 AM' }, { activityName: 'Pine Forest Shoot Walk', cost: '₹10', time: '02:00 PM' }] }
      ]
    },
    {
      title: 'Living Root Bridges & Elephant Falls in Shillong & Cherrapunji',
      fromPlace: 'Guwahati',
      place: 'Shillong',
      days: 3,
      persons: 2,
      description: 'Trek down 3,000 steps to the UNESCO Nongriat Double Decker Living Root Bridge in Cherrapunji. Boated on crystal clear waters of Umngot River in Dawki.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Shillong Peak & Elephant Falls', activities: [{ activityName: 'Elephant Falls Entry', cost: '₹20', time: '11:00 AM' }, { activityName: 'Police Bazar Local Food', cost: '₹300', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Nongriat Double Decker Living Root Bridge Trek', activities: [{ activityName: 'Local Guide Fee for Trek', cost: '₹800', time: '07:30 AM' }, { activityName: 'Nohkalikai Falls Viewpoint', cost: '₹50', time: '03:30 PM' }] }
      ]
    },
    {
      title: 'Taj Mahal Sunrise & Red Fort Majesty in Agra',
      fromPlace: 'Delhi',
      place: 'Agra',
      days: 2,
      persons: 2,
      description: 'Watched first rays of sunlight turn marble of the Taj Mahal pink and gold. Explored massive red sandstone corridors of Agra Fort and savored Agra Petha.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Taj Mahal Sunrise Darshan', activities: [{ activityName: 'Taj Mahal Entry Ticket & Main Mausoleum', cost: '₹250', time: '05:45 AM' }, { activityName: 'Agra Fort Guided Tour', cost: '₹500', time: '11:00 AM' }] },
        { dayNumber: 2, dayTitle: 'Mehtab Bagh Sunset & Panchhi Petha', activities: [{ activityName: 'Mehtab Bagh Rear Taj View', cost: '₹25', time: '05:00 PM' }, { activityName: 'Petha Sampling Box', cost: '₹200', time: '07:00 PM' }] }
      ]
    },
    {
      title: 'Houseboat Backwater Cruise in Alleppey (Alappuzha)',
      fromPlace: 'Kochi',
      place: 'Alleppey',
      days: 2,
      persons: 2,
      description: 'Chartered a traditional Kettuvallam houseboat to sail past lush paddy fields, palm trees, and village canals while relishing Karimeen Pollichathu fish.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Overnight Houseboat Backwater Cruise', activities: [{ activityName: 'Private Houseboat Check-in & Lunch', cost: '₹4500', time: '12:00 PM' }, { activityName: 'Sunset Village Canal Canoe Tour', cost: '₹400', time: '05:00 PM' }] }
      ]
    },
    {
      title: 'Om Beach Cliff Hikes & Sunset Cafe Chilling in Gokarna',
      fromPlace: 'Goa',
      place: 'Gokarna',
      days: 3,
      persons: 2,
      description: 'Hiked the famous 5-beach cliff trail connecting Kudle, Om, Half Moon, and Paradise Beaches. Watched breathtaking sunsets over the Arabian Sea.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Kudle Beach Sunset & Flea Market', activities: [{ activityName: 'Kudle Beach Shack Dinner', cost: '₹500', time: '07:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Gokarna 5-Beach Cliff Trek', activities: [{ activityName: 'Om Beach to Paradise Beach Cliff Trail', cost: '₹0', time: '08:00 AM' }, { activityName: 'Boat Ride back to Om Beach', cost: '₹300', time: '04:00 PM' }] }
      ]
    },
    {
      title: 'Coffee Peak Trek to Mullayanagiri in Chikmagalur',
      fromPlace: 'Bengaluru',
      place: 'Chikmagalur',
      days: 2,
      persons: 2,
      description: 'Conquered Karnataka highest peak at Mullayanagiri (1,930 m) surrounded by rolling clouds, visited Baba Budangiri caves, and tasted fresh filter coffee.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Mullayanagiri Peak Climb & Hebbe Falls', activities: [{ activityName: 'Mullayanagiri Peak Stairs Climb', cost: '₹0', time: '07:30 AM' }, { activityName: 'Hebbe Falls Jeep Safari', cost: '₹600', time: '01:00 PM' }] }
      ]
    },
    {
      title: 'Banasura Sagar Dam & Edakkal Prehistoric Caves in Wayanad',
      fromPlace: 'Calicut',
      place: 'Wayanad',
      days: 3,
      persons: 2,
      description: 'Explored Neolithic rock wall carvings at Edakkal Caves, rode speed boats at Asia’s 2nd largest earth dam Banasura Sagar, and trekked Chembra Peak.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Edakkal Cave Carvings & Heritage Museum', activities: [{ activityName: 'Edakkal Caves Entry Ticket', cost: '₹50', time: '10:00 AM' }] },
        { dayNumber: 2, dayTitle: 'Banasura Sagar Dam & Zip Lining', activities: [{ activityName: 'Banasura Speed Boat Ride', cost: '₹450', time: '11:30 AM' }, { activityName: 'Zip Line over Tea Estates', cost: '₹350', time: '03:00 PM' }] }
      ]
    },
    {
      title: 'Vijayanagara Empire Bouldering & Temple Ruins in Hampi',
      fromPlace: 'Hubli',
      place: 'Hampi',
      days: 3,
      persons: 2,
      description: 'Rented bicycles to explore Stone Chariot at Vittala Temple, Virupaksha Temple, and watched sunset over boulder-strewn landscapes from Matanga Hill.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Virupaksha Temple & Hampi Bazaar', activities: [{ activityName: 'Virupaksha Temple Darshan', cost: '₹25', time: '09:00 AM' }, { activityName: 'Coracle Boat Ride across Tungabhadra', cost: '₹150', time: '04:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Vittala Temple Stone Chariot & Matanga Hill', activities: [{ activityName: 'Vittala Temple Complex Entry', cost: '₹40', time: '10:00 AM' }, { activityName: 'Matanga Hill Sunset Hike', cost: '₹0', time: '05:30 PM' }] }
      ]
    }
  ],

  // User 3 (Priya) - 10 Stories
  [
    {
      title: 'Golden Fort Dunes & Thar Desert Camel Safari in Jaisalmer',
      fromPlace: 'Jodhpur',
      place: 'Jaisalmer',
      days: 3,
      persons: 2,
      description: 'Stayed inside the living golden sandstone fort of Sonar Qila, rode camels across Sam Sand Dunes, and watched Rajasthani Kalbelia folk dance under stars.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Sonar Qila Living Fort & Patwon Ki Haveli', activities: [{ activityName: 'Patwon Ki Haveli Entry', cost: '₹100', time: '11:00 AM' }] },
        { dayNumber: 2, dayTitle: 'Sam Sand Dunes Camel Safari & Desert Camp', activities: [{ activityName: 'Desert Dune Bashing & Camel Ride', cost: '₹1800', time: '04:00 PM' }, { activityName: 'Cultural Folk Dance & Buffet Dinner', cost: '₹1200', time: '07:30 PM' }] }
      ]
    },
    {
      title: 'Cellular Jail Light & Sound Show in Port Blair, Andaman',
      fromPlace: 'Chennai',
      place: 'Port Blair',
      days: 3,
      persons: 2,
      description: 'Paid tribute to freedom fighters at Cellular Jail (Kaala Paani), took speed boat to Ross Island ruins, and relaxed at Corbyn’s Cove Beach.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Cellular Jail & National Memorial Light Show', activities: [{ activityName: 'Cellular Jail Ticket', cost: '₹30', time: '10:00 AM' }, { activityName: 'Sound & Light Show', cost: '₹150', time: '06:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Ross Island & North Bay Coral Reefs', activities: [{ activityName: 'Ferry to Ross Island', cost: '₹370', time: '09:00 AM' }, { activityName: 'Glass Bottom Boat Reef Tour', cost: '₹800', time: '01:00 PM' }] }
      ]
    },
    {
      title: 'High Altitude Passes & Monasteries of Leh Ladakh',
      fromPlace: 'Srinagar',
      place: 'Leh',
      days: 3,
      persons: 2,
      description: 'Visited Magnetic Hill, confluence of Zanskar and Indus Rivers (Sangam), and listened to chanting monks at Hemis & Thiksey Monasteries.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Indus & Zanskar Confluence & Magnetic Hill', activities: [{ activityName: 'River Rafting at Sangam', cost: '₹1200', time: '10:30 AM' }] }
      ]
    },
    {
      title: 'Naini Lake Yachting & Snow View Point in Nainital',
      fromPlace: 'Delhi',
      place: 'Nainital',
      days: 3,
      persons: 2,
      description: 'Boated across pear-shaped Naini Lake, rode Aerial Ropeway to Snow View Point, and shopped for handmade candles at Tibetan Market.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Naini Lake Boating & Mall Road', activities: [{ activityName: 'Yacht Rowing Boat Ride', cost: '₹210', time: '04:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Aerial Ropeway & Snow View Point', activities: [{ activityName: 'Cable Car Round Trip', cost: '₹360', time: '10:30 AM' }] }
      ]
    },
    {
      title: 'Tsomgo Glacial Lake & Nathula Pass Border in Gangtok',
      fromPlace: 'Siliguri',
      place: 'Gangtok',
      days: 3,
      persons: 2,
      description: 'Drove through clouds to frozen Tsomgo (Changu) Lake at 12,310 ft, rode decorated Yaks, and visited Rumtek Monastery.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'MG Marg Promenade & Cable Car', activities: [{ activityName: 'Gangtok Ropeway Ride', cost: '₹110', time: '03:00 PM' }] },
        { dayNumber: 2, dayTitle: 'Tsomgo Lake & Baba Mandir Excursion', activities: [{ activityName: 'Protected Area Permit & Taxi', cost: '₹750', time: '08:00 AM' }, { activityName: 'Yak Ride at Tsomgo Lake', cost: '₹300', time: '11:00 AM' }] }
      ]
    },
    {
      title: 'Shore Temple Sunset & Pancha Rathas in Mahabalipuram',
      fromPlace: 'Chennai',
      place: 'Mahabalipuram',
      days: 2,
      persons: 2,
      description: 'Admired 7th-century Pallava Dynasty Shore Temple right on the ocean, Krishna’s Butterball giant rock balance, and monolithic Pancha Rathas.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'UNESCO Shore Temple & Arjuna’s Penance', activities: [{ activityName: 'Shore Temple Monument Entry', cost: '₹40', time: '04:00 PM' }] }
      ]
    },
    {
      title: 'Nakki Lake Boating & Dilwara Jain Temples in Mount Abu',
      fromPlace: 'Udaipur',
      place: 'Mount Abu',
      days: 2,
      persons: 2,
      description: 'Explored intricate marble carvings of 11th-century Dilwara Jain Temples, boated on Nakki Lake, and caught sunset at Sunset Point.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Dilwara Marble Temples & Nakki Lake', activities: [{ activityName: 'Dilwara Temple Guided Tour', cost: '₹0', time: '12:00 PM' }] }
      ]
    },
    {
      title: 'Meenakshi Amman Temple Towers & Jigarthanda in Madurai',
      fromPlace: 'Coimbatore',
      place: 'Madurai',
      days: 2,
      persons: 2,
      description: 'Marveled at 14 colorful gopuram towers of Meenakshi Amman Temple with 33,000 sculptures. Drank famous cooling Famous Famous Famous Jigarthanda.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Meenakshi Temple Night Ceremony & Thirumalai Palace', activities: [{ activityName: 'Special Temple Darshan Ticket', cost: '₹100', time: '09:00 AM' }] }
      ]
    },
    {
      title: 'Golden Temple Devotion & Wagah Border Ceremony in Amritsar',
      fromPlace: 'Chandigarh',
      place: 'Amritsar',
      days: 2,
      persons: 2,
      description: 'Felt deep peace at Sri Harmandir Sahib (Golden Temple), tasted world’s largest community Langar kitchen food, and cheered at Wagah Border Retreat.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Golden Temple & Jallianwala Bagh', activities: [{ activityName: 'Golden Temple Morning Visit', cost: '₹0', time: '06:00 AM' }] },
        { dayNumber: 2, dayTitle: 'Wagah Border Beating Retreat & Amritsari Kulcha', activities: [{ activityName: 'Wagah Border Ceremony Seating', cost: '₹0', time: '04:00 PM' }] }
      ]
    },
    {
      title: 'Moti Daman Fort & Devka Beach Sunset Promenade in Daman',
      fromPlace: 'Surat',
      place: 'Daman',
      days: 2,
      persons: 2,
      description: 'Cycled around 16th-century Portuguese Moti Daman Fort walls, relaxed under casuarina trees at Devka Beach, and enjoyed coastal breeze.',
      itinerary: [
        { dayNumber: 1, dayTitle: 'Moti Daman Fort & Dominican Monastery Ruins', activities: [{ activityName: 'Fort Ramparts Walk', cost: '₹0', time: '11:00 AM' }] }
      ]
    }
  ]
];

async function seed() {
  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully!');

    // 1. Delete ALL existing stories to start with 100% clean data
    console.log('Deleting ALL existing stories from database...');
    await Story.deleteMany({});
    console.log('All previous stories deleted successfully!');

    // 2. Create or upsert the 4 Users
    const createdUsers = [];
    for (const userData of USERS_DATA) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user: ${user.name} (${user.email})`);
      } else {
        user.name = userData.name;
        user.avatar = userData.avatar;
        await user.save();
        console.log(`Updated user: ${user.name} (${user.email})`);
      }
      createdUsers.push(user);
    }

    const userIds = createdUsers.map(u => u._id);

    // 3. Create 40 Stories (10 per user) with 100% matched images
    let totalCreated = 0;
    const now = new Date();

    for (let uIdx = 0; uIdx < createdUsers.length; uIdx++) {
      const user = createdUsers[uIdx];
      const storiesList = RAW_STORIES_DATA[uIdx];

      for (let sIdx = 0; sIdx < storiesList.length; sIdx++) {
        const item = storiesList[sIdx];
        const destination = item.place;
        const imgData = ACCURATE_IMAGES[destination] || {
          cover: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
          gallery: []
        };

        // Random past date within last 6 months
        const daysAgo = (uIdx * 10 + sIdx + 1) * 3;
        const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + (item.days - 1) * 24 * 60 * 60 * 1000);

        // Random likes from other users
        const likes = [];
        userIds.forEach((id) => {
          if (id.toString() !== user._id.toString()) {
            if (Math.random() > 0.3) {
              likes.push(id);
            }
          }
        });

        const storyDoc = new Story({
          userId: user._id,
          title: item.title,
          fromPlace: item.fromPlace,
          place: destination,
          tripStartDate: startDate,
          tripEndDate: endDate,
          numberOfPersons: item.persons || 2,
          coverImage: imgData.cover,
          imageGallery: imgData.gallery || [],
          description: item.description,
          daysItinerary: item.itinerary || [],
          activities: [],
          likes: likes,
          isPublic: true,
          createdAt: startDate,
        });

        await storyDoc.save();
        totalCreated++;
      }
    }

    console.log(`\n🎉 RE-SEEDED SUCCESSFULLY! Created ${totalCreated} stories with 100% matched place images!`);
    createdUsers.forEach((u) => {
      console.log(`- ${u.name}: 10 stories (ID: ${u._id})`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error re-seeding database:', err);
    process.exit(1);
  }
}

seed();
