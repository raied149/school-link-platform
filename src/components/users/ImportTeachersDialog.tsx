
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";

// Columns required for teacher import (ORDER IS IMPORTANT)
const excelColumns = [
  "First Name",
  "Last Name",
  "Email",
  "Gender (male/female/other)",
  "Date of Birth (YYYY-MM-DD)",
  "Nationality",
  "Personal Phone",
  "School Phone",
  "Personal Email",
  "School Email",
  "Current Address",
  "Permanent Address",
  // Professional Details
  "Employee ID",
  "Designation",
  "Department",
  "Joining Date (YYYY-MM-DD)",
  "Employment Type (Full-time/Part-time/Contractual)",
  "Subjects (comma separated)",
  "Classes Assigned (comma separated)",
  "Qualifications (comma separated)",
  // Emergency Contact
  "Emergency Contact Name",
  "Emergency Contact Relationship",
  "Emergency Contact Phone",
  // Medical Info
  "Medical Conditions (comma separated)",
  "Allergies (comma separated)"
];

// Utility function: check if a row is fully empty
function isRowEmpty(row: any[] = []) {
  return row.every(cell => typeof cell === "undefined" || cell === null || String(cell).trim() === "");
}

type ImportTeachersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportTeachersDialog({ open, onOpenChange }: ImportTeachersDialogProps) {
  const { toast } = useToast();
  const [showFormat, setShowFormat] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleShowFormat(e: React.MouseEvent) {
    e.preventDefault();
    setShowFormat(true);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      // Validation: first row must match columns
      const [header, ...rows] = json;
      if (!header || header.length < excelColumns.length) {
        throw new Error("Header row missing or does not match required format.");
      }
      for (let i = 0; i < excelColumns.length; i++) {
        if ((header[i]?.toString() ?? "").trim() !== excelColumns[i]) {
          throw new Error(`Column ${i + 1} should be "${excelColumns[i]}". Found "${header[i]}"`);
        }
      }

      // Only process non-empty rows and stop at first all-empty row
      const dataRows: any[][] = [];
      for (let i = 0; i < rows.length; i++) {
        if (isRowEmpty(rows[i])) break;
        dataRows.push(rows[i]);
      }

      if (dataRows.length === 0) {
        throw new Error("No data rows found in file.");
      }

      const addPromises = dataRows.map(async (row, idx) => {
        // Map fields in the correct order
        const [
          first_name, last_name, email, gender, date_of_birth, nationality,
          personalPhone, schoolPhone, personalEmail, schoolEmail, currentAddress, permanentAddress,
          employeeId, designation, department, joiningDate, employmentType, subjectsRaw, classesRaw, qualificationsRaw,
          emergencyName, emergencyRelationship, emergencyPhone, conditionsRaw, allergiesRaw
        ] = row;

        if (!first_name || !last_name || !email) {
          throw new Error(`Row ${idx + 2}: First Name, Last Name, and Email are required.`);
        }

        // 1. Insert into profiles
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            first_name,
            last_name,
            email,
            role: "teacher"
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // 2. Prepare data for the details insert
        const contact_info = {
          personalPhone: personalPhone || "",
          schoolPhone: schoolPhone || "",
          personalEmail: personalEmail || "",
          schoolEmail: schoolEmail || "",
          currentAddress: currentAddress || "",
          permanentAddress: permanentAddress || ""
        };
        const professional_info = {
          employeeId: employeeId || "",
          designation: designation || "",
          department: department || "",
          joiningDate: joiningDate || "",
          employmentType: (employmentType as any) || "",
          subjects: (subjectsRaw || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          classesAssigned: (classesRaw || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          qualifications: (qualificationsRaw || "").split(",").map((s: string) => s.trim()).filter(Boolean)
        };
        const emergency_contact = {
          name: emergencyName || "",
          relationship: emergencyRelationship || "",
          phone: emergencyPhone || ""
        };
        const medical_info = {
          conditions: (conditionsRaw || "").split(",").map((s: string) => s.trim()).filter(Boolean),
          allergies: (allergiesRaw || "").split(",").map((s: string) => s.trim()).filter(Boolean)
        };

        // 3. Insert teacher_details using the RPC
        const { error: detailsError } = await supabase.rpc('insert_teacher_details', {
          profile_id: profileData.id,
          gender_type: gender || "",
          birth_date: date_of_birth || "",
          nationality_val: nationality || "",
          contact_data: contact_info,
          professional_data: professional_info,
          emergency_data: emergency_contact,
          medical_data: medical_info
        });
        if (detailsError) throw detailsError;

        return true;
      });

      await Promise.all(addPromises);

      toast({
        title: "Success!",
        description: "Teachers imported successfully."
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error importing teachers from Excel:", err);
      toast({
        title: "Import Failed",
        description: err.message || "Check your file format and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Teachers from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel sheet with teacher details in the correct format. <br />
            <Button variant="link" className="px-0" onClick={handleShowFormat}>
              See required Excel format
            </Button>
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        {loading && <p className="text-muted-foreground py-2">Importing, please wait...</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Close</Button>
        </DialogFooter>
      </DialogContent>
      {/* Format popup dialog */}
      <Dialog open={showFormat} onOpenChange={setShowFormat}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Format</DialogTitle>
            <DialogDescription>
              Your Excel sheet must have a first row with these exact columns in order, starting at column A:
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full my-2">
              <thead>
                <tr>
                  {excelColumns.map(col => (
                    <th key={col} className="border px-2 bg-muted">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2">Jane</td>
                  <td className="border px-2">Doe</td>
                  <td className="border px-2">jane.doe@school.com</td>
                  <td className="border px-2">female</td>
                  <td className="border px-2">1988-04-14</td>
                  <td className="border px-2">Kenyan</td>
                  <td className="border px-2">+25470123456</td>
                  <td className="border px-2">+25478901234</td>
                  <td className="border px-2">jane.personal@gmail.com</td>
                  <td className="border px-2">jane.doe@school.com</td>
                  <td className="border px-2">Westlands, Nairobi</td>
                  <td className="border px-2">Nakuru, Kenya</td>
                  <td className="border px-2">EMP1001</td>
                  <td className="border px-2">Science Teacher</td>
                  <td className="border px-2">Science</td>
                  <td className="border px-2">2023-01-08</td>
                  <td className="border px-2">Full-time</td>
                  <td className="border px-2">Math, Physics</td>
                  <td className="border px-2">Class 8A, Class 8B</td>
                  <td className="border px-2">BEd, MSc</td>
                  <td className="border px-2">Mary Doe</td>
                  <td className="border px-2">Sister</td>
                  <td className="border px-2">+25470567890</td>
                  <td className="border px-2">Asthma</td>
                  <td className="border px-2">Peanuts</td>
                </tr>
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormat(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

// Temporary demo usage: Button for opening the dialog
export function ImportTeachersLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="mb-4">
        Import Teachers from Excel
      </Button>
      <ImportTeachersDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
