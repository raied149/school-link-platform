import { StudentDetail } from "@/types";

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
    }
  },
  // Add more mock students as needed
];
