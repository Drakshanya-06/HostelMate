export const HOSTELS_COUNT = 10;
export const FLOORS_PER_HOSTEL = 10;
export const ROOMS_PER_FLOOR = 8;

export const GUEST_PRICING = {
    basePerDay: 800,
    foodPerDay: 300,
    laundryPerWash: 150
};

// Generate Mock Students
const generateMockStudents = () => {
    const firstNames = ["Aarav", "Vihaan", "Ishani", "Reyansh", "Zoya", "Ananya", "Kabir", "Diya"];
    const lastNames = ["Sharma", "Gupta", "Verma", "Singh", "Khan", "Reddy", "Malhotra", "Iyer"];

    return firstNames.map((firstName, i) => {
        const lastName = lastNames[i];
        return {
            id: `STU${1000 + i}`,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
            parentsName: `Mr. & Mrs. ${lastName}`,
            phone: `+91 98765 ${Math.floor(Math.random() * 90000) + 10000}`,
            hostelId: Math.floor(Math.random() * 10) + 1,
            floor: Math.floor(Math.random() * 10) + 1,
            roomNumber: 100 + Math.floor(Math.random() * 50),
            pendingFee: Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0,
            profilePhoto: `https://i.pravatar.cc/300?u=STU${1000 + i}`,
            status: 'active'
        };
    });
};

// Generate Mock Rooms
const generateMockRooms = () => {
    const rooms = [];
    for (let h = 1; h <= 2; h++) {
        for (let f = 1; f <= 5; f++) {
            for (let r = 1; r <= 5; r++) {
                const capacity = Math.random() > 0.5 ? 2 : 3;
                rooms.push({
                    id: `H${h}-F${f}-R${r}`,
                    hostelId: h,
                    floor: f,
                    number: f * 100 + r,
                    capacity: capacity,
                    occupants: [],
                    type: Math.random() > 0.5 ? 'AC' : 'Non-AC',
                    isVacant: Math.random() > 0.3
                });
            }
        }
    }
    return rooms;
};

export const MOCK_STUDENTS = generateMockStudents();
export const MOCK_ROOMS = generateMockRooms();

export const MOCK_COMPLAINTS = [
    {
        id: 'C001',
        studentId: 'STU1000',
        studentName: 'Aarav Sharma',
        category: 'Maintenance',
        title: 'Tap leaking in bathroom',
        description: 'The tap in room 104 is leaking continuously since last night.',
        date: '2024-11-15 09:30',
        status: 'pending'
    }
];

export const MOCK_LEAVES = [
    {
        id: 'L001',
        studentId: 'STU1001',
        studentName: 'Vihaan Gupta',
        fromDate: '2024-11-20',
        toDate: '2024-11-25',
        reason: 'Sister\'s Wedding',
        status: 'pending',
        appliedDate: '2024-11-14'
    }
];

export const MOCK_ATTENDANCE = [
    {
        id: 'A001',
        studentId: 'STU1000',
        studentName: 'Aarav Sharma',
        type: 'OUT',
        timestamp: '2024-11-15 17:45'
    },
    {
        id: 'A002',
        studentId: 'STU1000',
        studentName: 'Aarav Sharma',
        type: 'IN',
        timestamp: '2024-11-15 20:15'
    }
];

export const translations = {
    'en-US': {
        dashboard: 'Dashboard',
        hostel: 'Hostel Block',
        room: 'Room Number',
        currency: '₹',
        attendance: 'Attendance',
        welcome: 'Welcome',
        downloadReceipt: 'Download Fee Receipt'
    },
    'en-IN': {
        dashboard: 'डैशबोर्ड',
        hostel: 'हॉस्टल ब्लॉक',
        room: 'कक्ष संख्या',
        currency: '₹',
        attendance: 'उपस्थिति',
        welcome: 'स्वागत हे',
        downloadReceipt: 'शुल्क रसीद डाउनलोड करें'
    }
};
