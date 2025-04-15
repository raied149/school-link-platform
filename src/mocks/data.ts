import { StudentDetail, Teacher } from "@/types";

export const mockStudents: StudentDetail[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    admissionNumber: "ST001",
    dateOfBirth: "2015-05-15",
    gender: "male",
    currentClassId: "class1",
    currentSectionId: "section1",
    academicYearId: "year2024",
    nationality: "American",
    language: "English",
    contactNumber: "123-456-7890",
    guardian: {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "987-654-3210",
      relationship: "Mother"
    },
    medical: {
      bloodGroup: "A+",
      allergies: ["Peanuts"],
      medicalHistory: "None",
      medications: [],
      emergencyContact: {
        name: "Jane Doe",
        phone: "987-654-3210",
        relationship: "Mother"
      }
    },
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    address: "123 Main St, Springfield"
  },
  {
    id: "2",
    name: "Alice Smith",
    email: "alice@example.com",
    admissionNumber: "ST002",
    dateOfBirth: "2016-08-21",
    gender: "female",
    currentClassId: "class1",
    currentSectionId: "section2",
    academicYearId: "year2024",
    nationality: "Canadian",
    language: "English",
    contactNumber: "234-567-8901",
    guardian: {
      name: "Bob Smith",
      email: "bob@example.com",
      phone: "345-678-9012",
      relationship: "Father"
    },
    medical: {
      bloodGroup: "B-",
      allergies: ["Dust"],
      medicalHistory: "Asthma",
      medications: ["Inhaler"],
      emergencyContact: {
        name: "Bob Smith",
        phone: "345-678-9012",
        relationship: "Father"
      }
    },
    createdAt: "2024-01-05",
    updatedAt: "2024-01-20",
    address: "456 Oak Ave, Springfield"
  }
];

export const mockClasses = [
  { id: "class1", name: "Grade 1", level: 1, academicYearId: "year2024", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "class2", name: "Grade 2", level: 2, academicYearId: "year2024", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
];

export const mockSections = [
  { id: "section1", name: "Section A", classId: "class1", academicYearId: "year2024", createdAt: "2024-01-01", updatedAt: "2024-01-01" },
  { id: "section2", name: "Section B", classId: "class1", academicYearId: "year2024", createdAt: "2024-01-01", updatedAt: "2024-01-01" }
];

export const mockTeachers: Teacher[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "s.johnson@school.edu",
    role: "teacher",
    firstName: "Sarah",
    middleName: "",
    lastName: "Johnson",
    gender: "female",
    dateOfBirth: "1985-06-15",
    nationality: "American",
    religion: "Christianity",
    maritalStatus: "Married",
    bloodGroup: "O+",
    profilePicture: "/placeholder.svg",
    contactInformation: {
      currentAddress: "789 Elm St, Springfield, IL, 62701, USA",
      permanentAddress: "789 Elm St, Springfield, IL, 62701, USA",
      personalPhone: "456-789-0123",
      schoolPhone: "456-789-0124",
      personalEmail: "sarah.johnson@personal.com",
      schoolEmail: "s.johnson@school.edu"
    },
    professionalDetails: {
      employeeId: "T001",
      designation: "Senior Mathematics Teacher",
      department: "Mathematics",
      subjects: ["Algebra", "Calculus", "Geometry"],
      classesAssigned: ["Grade 9", "Grade 10", "Grade 11"],
      joiningDate: "2015-08-15",
      previousExperience: [
        {
          schoolName: "Lincoln High School",
          position: "Mathematics Teacher",
          duration: "2010-2015"
        }
      ],
      qualifications: ["M.Sc. Mathematics", "B.Ed."],
      specializations: ["Advanced Calculus", "Mathematics Olympiad Training"],
      certifications: ["State Teaching License #12345"],
      employmentType: "Full-time",
      salary: 75000
    },
    attendance: {
      present: 120,
      absent: 3,
      leave: 7
    },
    leaveBalance: {
      sick: 8,
      casual: 5,
      vacation: 15
    },
    performance: {
      lastReviewDate: "2023-12-01",
      rating: 4.8,
      feedback: "Excellent teaching methodology and student engagement",
      awards: ["Teacher of the Year 2022", "Excellence in STEM Education Award 2021"]
    },
    emergency: {
      contactName: "Michael Johnson",
      relationship: "Spouse",
      phone: "567-890-1234"
    },
    medicalInformation: {
      conditions: ["None"],
      allergies: ["None"]
    },
    createdAt: "2015-08-01",
    updatedAt: "2024-01-15"
  },
  {
    id: "2",
    name: "David Miller",
    email: "d.miller@school.edu",
    role: "teacher",
    firstName: "David",
    middleName: "Robert",
    lastName: "Miller",
    gender: "male",
    dateOfBirth: "1988-09-23",
    nationality: "British",
    religion: "None",
    maritalStatus: "Single",
    bloodGroup: "A-",
    profilePicture: "/placeholder.svg",
    contactInformation: {
      currentAddress: "567 Pine St, Springfield, IL, 62702, USA",
      permanentAddress: "123 London Rd, London, UK",
      personalPhone: "678-901-2345",
      schoolPhone: "678-901-2346",
      personalEmail: "david.miller@personal.com",
      schoolEmail: "d.miller@school.edu"
    },
    professionalDetails: {
      employeeId: "T002",
      designation: "Science Teacher",
      department: "Science",
      subjects: ["Physics", "Chemistry"],
      classesAssigned: ["Grade 8", "Grade 9"],
      joiningDate: "2019-01-10",
      previousExperience: [
        {
          schoolName: "Oxford Secondary School",
          position: "Science Teacher",
          duration: "2013-2018"
        }
      ],
      qualifications: ["M.Sc. Physics", "PGCE"],
      specializations: ["Experimental Physics", "Science Fair Coordination"],
      certifications: ["State Teaching License #45678"],
      employmentType: "Full-time",
      salary: 68000
    },
    attendance: {
      present: 115,
      absent: 5,
      leave: 10
    },
    leaveBalance: {
      sick: 7,
      casual: 3,
      vacation: 10
    },
    performance: {
      lastReviewDate: "2023-11-15",
      rating: 4.5,
      feedback: "Strong subject knowledge and good lab management skills",
      awards: ["Science Department Recognition 2022"]
    },
    emergency: {
      contactName: "Emily Miller",
      relationship: "Sister",
      phone: "789-012-3456"
    },
    medicalInformation: {
      conditions: ["Asthma"],
      allergies: ["Pollen"]
    },
    createdAt: "2018-12-15",
    updatedAt: "2024-01-10"
  }
];
