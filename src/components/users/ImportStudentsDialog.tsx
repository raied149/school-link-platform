
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

type ImportStudentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Columns must be in this order for the Excel file:
const excelColumns = [
  "First Name",
  "Last Name",
  "Email",
  "Nationality",
  "Primary Language",
  "Date of Birth (YYYY-MM-DD)",
  "Gender (male/female/other)",
  "Guardian Name",
  "Guardian Email",
  "Guardian Phone",
  "Guardian Relationship",
  "Blood Group",
  "Allergies (comma separated)",
  "Medical History",
  "Medications (comma separated)",
  "Emergency Contact Name",
  "Emergency Contact Phone",
  "Emergency Contact Relationship"
];

// Utility: check if a row (array of values) is fully empty
function isRowEmpty(row: any[] = []) {
  return row.every(cell => typeof cell === "undefined" || cell === null || String(cell).trim() === "");
}

export function ImportStudentsDialog({ open, onOpenChange }: ImportStudentsDialogProps) {
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

      // Validation: first row should match columns
      const [header, ...rows] = json;
      if (!header || header.length < excelColumns.length) {
        throw new Error("Header row missing or does not match required format.");
      }
      for (let i = 0; i < excelColumns.length; i++) {
        if ((header[i]?.toString() ?? "").trim() !== excelColumns[i]) {
          throw new Error(`Column ${i + 1} should be "${excelColumns[i]}". Found "${header[i]}"`);
        }
      }

      // Only process non-empty rows and stop once first all-empty row is found
      const dataRows: any[][] = [];
      for (let i = 0; i < rows.length; i++) {
        if (isRowEmpty(rows[i])) break;
        dataRows.push(rows[i]);
      }

      if (dataRows.length === 0) {
        throw new Error("No data rows found in file.");
      }

      const addPromises = dataRows.map(async (row, idx) => {
        // Map and sanitize fields
        const [
          first_name, last_name, email, nationality, language, dateOfBirth, gender,
          guardianName, guardianEmail, guardianPhone, guardianRelationship,
          bloodGroup, allergiesRaw, medicalHistory, medicationsRaw,
          emergencyContactName, emergencyContactPhone, emergencyContactRelationship
        ] = row;

        // Simple field check
        if (!first_name || !last_name || !email) {
          throw new Error(
            `Row ${idx + 2}: First Name, Last Name, and Email are required.` // +2 since idx=0 is first data row (after header)
          );
        }

        // Insert into Supabase: first, the profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            first_name,
            last_name,
            email,
            role: "student"
          })
          .select()
          .single();

        if (profileError) throw profileError;

        // Insert details via RPC (as in AddStudentDialog)
        const allergies = (allergiesRaw || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        const medications = (medicationsRaw || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        const guardian = {
          name: guardianName || "",
          email: guardianEmail || "",
          phone: guardianPhone || "",
          relationship: guardianRelationship || ""
        };
        const medical = {
          bloodGroup: bloodGroup || "",
          allergies,
          medicalHistory: medicalHistory || "",
          medications,
          emergencyContact: {
            name: emergencyContactName || "",
            phone: emergencyContactPhone || "",
            relationship: emergencyContactRelationship || ""
          }
        };

        const { error: detailsError } = await supabase.rpc('insert_student_details', {
          profile_id: profileData.id,
          nationality: nationality || "",
          language_pref: language || "",
          date_of_birth: dateOfBirth || "",
          gender_type: gender || "",
          guardian_info: guardian,
          medical_info: medical
        });
        if (detailsError) throw detailsError;

        return true;
      });

      await Promise.all(addPromises);

      toast({
        title: "Success!",
        description: "Students imported successfully."
      });
      onOpenChange(false);
    } catch (err: any) {
      console.error("Error importing students from Excel:", err);
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
          <DialogTitle>Import Students from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel sheet with the student details in the correct format.
            <br />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Close
          </Button>
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
                  <td className="border px-2">John</td>
                  <td className="border px-2">Doe</td>
                  <td className="border px-2">john.doe@example.com</td>
                  <td className="border px-2">Kenyan</td>
                  <td className="border px-2">English</td>
                  <td className="border px-2">2005-03-01</td>
                  <td className="border px-2">male</td>
                  <td className="border px-2">Jane Doe</td>
                  <td className="border px-2">jane.doe@example.com</td>
                  <td className="border px-2">+12345678</td>
                  <td className="border px-2">Mother</td>
                  <td className="border px-2">O+</td>
                  <td className="border px-2">Peanuts</td>
                  <td className="border px-2">No major issues</td>
                  <td className="border px-2">Ibuprofen</td>
                  <td className="border px-2">Alan Doe</td>
                  <td className="border px-2">+98765432</td>
                  <td className="border px-2">Uncle</td>
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

